<?php

namespace App\Controllers;

use App\Core\BaseController;
use App\Models\Exam;
use App\Utils\SecureSession;
use App\Config\Database;

/**
 * Student-facing Exam Controller
 */
class ExamController extends BaseController {
    private $examModel;
    private $db;

    public function __construct() {
        $this->examModel = new Exam();
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * GET /api/exams/{id}
     * Get exam details for student (including questions)
     */
    public function show($params) {
        $id = $params['id'] ?? null;
        if (!$id) {
            return $this->json(['error' => 'معرف الاختبار مطلوب'], 400);
        }

        try {
            SecureSession::start();
            $userId = SecureSession::get('user_id');
            $userRole = SecureSession::get('role');
            if (!$userId) {
                return $this->json(['error' => 'يجب تسجيل الدخول'], 401);
            }

            // Verify if student can attempt (includes enrollment check)
            $canAttempt = $this->examModel->canStudentAttempt($id, $userId, $userRole);
            if (!$canAttempt['can_attempt']) {
                $reasonMap = [
                    'already_attempted' => 'لقد قمت بتأدية هذا الاختبار بالفعل.',
                    'exam_not_available' => 'هذا الاختبار غير متاح حالياً.',
                    'not_enrolled' => 'يجب الاشتراك في الكورس للوصول للاختبار.'
                ];
                return $this->json(['error' => $reasonMap[$canAttempt['reason']] ?? 'غير مسموح لك بدخول الاختبار'], 403);
            }

            // Fetch exam details
            // Staff can see any status, students only published
            $statusClause = in_array($userRole, ['admin', 'teacher', 'assistant']) 
                ? "1=1" 
                : "e.status = 'published'";

            $stmt = $this->db->prepare("
                SELECT e.*, c.title as course_name 
                FROM exams e 
                LEFT JOIN courses c ON e.course_id = c.id 
                WHERE e.id = :id AND $statusClause
            ");
            $stmt->execute(['id' => $id]);
            $exam = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$exam) {
                return $this->json(['error' => 'الاختبار غير موجود'], 404);
            }

            // Fetch questions
            $qStmt = $this->db->prepare("
                SELECT id, type, text, image_url, points, sort_order 
                FROM exam_questions 
                WHERE exam_id = :exam_id 
                ORDER BY " . ($exam['is_randomized'] ? "RAND()" : "sort_order")
            );
            $qStmt->execute(['exam_id' => $id]);
            $questions = $qStmt->fetchAll(\PDO::FETCH_ASSOC);

            foreach ($questions as &$q) {
                // Map backend types to frontend types
                $typeMap = [
                    'single' => 'mcq',
                    'true_false' => 'true-false',
                    'essay' => 'short-answer'
                ];
                $q['type'] = $typeMap[$q['type']] ?? $q['type'];

                $optStmt = $this->db->prepare("
                    SELECT id, text, image_url, sort_order 
                    FROM question_options 
                    WHERE question_id = :question_id 
                    ORDER BY " . ($exam['is_randomized'] ? "RAND()" : "sort_order")
                );
                $optStmt->execute(['question_id' => $q['id']]);
                $q['options'] = $optStmt->fetchAll(\PDO::FETCH_ASSOC);
            }
            unset($q);

            $exam['questions'] = $questions;
            
            error_log("Student Exam Fetch: Exam $id, Questions: " . count($questions));
            foreach ($questions as $idx => $questionItem) {
                error_log("  Q$idx [{$questionItem['id']}]: " . count($questionItem['options'] ?? []) . " options");
            }

            $this->json($exam);
        } catch (\Exception $e) {
            error_log("Student exam fetch error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب بيانات الاختبار'], 500);
        }
    }

    /**
     * POST /api/exams/{id}/start
     * Start an exam attempt
     */
    public function start($params) {
        $id = $params['id'] ?? null;
        try {
            SecureSession::start();
            $userId = SecureSession::get('user_id');
            $userRole = SecureSession::get('role');
            if (!$userId) return $this->json(['error' => 'Unauthorized'], 401);

            $result = $this->examModel->startAttempt($id, $userId, $userRole);
            if (!$result['success']) {
                $reasonMap = [
                    'already_attempted' => 'لقد قمت بتأدية هذا الاختبار بالفعل.',
                    'exam_not_available' => 'هذا الاختبار غير متاح حالياً.',
                    'not_enrolled' => 'يجب الاشتراك في الكورس للوصول للاختبار.'
                ];
                return $this->json(['error' => $reasonMap[$result['reason']] ?? 'غير مسموح لك بدخول الاختبار'], 403);
            }

            $this->json($result);
        } catch (\Exception $e) {
            $this->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/exams/{id}/submit
     * Submit exam attempt
     */
    public function submit($params) {
        $examId = $params['id'] ?? null;
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);
        
        $answers = $data['answers'] ?? []; 
        $attemptId = $data['attempt_id'] ?? null;

        try {
            SecureSession::start();
            $userId = SecureSession::get('user_id');
            if (!$userId) return $this->json(['error' => 'Unauthorized'], 401);

            // Fetch attempt if exists
            if (!$attemptId) {
                $stmt = $this->db->prepare("SELECT id FROM exam_attempts WHERE exam_id = :eid AND user_id = :uid AND status = 'in_progress' ORDER BY started_at DESC LIMIT 1");
                $stmt->execute(['eid' => $examId, 'uid' => $userId]);
                $attemptId = $stmt->fetchColumn();
            }

            if (!$attemptId) {
                return $this->json(['error' => 'لا توجد محاولة قائمة لهذا الاختبار'], 400);
            }

            $score = 0;
            $totalPoints = 0;
            
            // 1. Get all questions for this exam to handle both MCQs (with options) and potentially Essays
            // We join with options to get correct answers for auto-grading
            $stmt = $this->db->prepare("
                SELECT q.id as qid, q.type, q.points, o.id as oid, o.is_correct
                FROM exam_questions q 
                LEFT JOIN question_options o ON q.id = o.question_id
                WHERE q.exam_id = :eid
            ");
            $stmt->execute(['eid' => $examId]);
            $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Group by Question ID
            $questionsMap = [];
            foreach ($rows as $row) {
                $qid = $row['qid'];
                if (!isset($questionsMap[$qid])) {
                    $questionsMap[$qid] = [
                        'type' => $row['type'],
                        'points' => $row['points'],
                        'correct_option_id' => null
                    ];
                    $totalPoints += $row['points']; // Add points once per question
                }
                if ($row['is_correct']) {
                    $questionsMap[$qid]['correct_option_id'] = $row['oid'];
                }
            }

            // 2. Process Answers
            $correctCount = 0;
            foreach ($questionsMap as $qid => $qData) {
                $userAnswer = $answers[$qid] ?? null;
                $isCorrect = false;
                $pointsEarned = 0;

                // Auto-grade logic
                if ($qData['type'] === 'short-answer' || $qData['type'] === 'essay') {
                    // Manual grading needed
                    $isCorrect = null; 
                } else {
                    // MCQ / True-False
                    if ($userAnswer && $userAnswer === $qData['correct_option_id']) {
                        $isCorrect = true;
                        $pointsEarned = $qData['points'];
                        $score += $pointsEarned;
                        $correctCount++;
                    }
                }

                // Prepare Data for DB
                $selectedOptionIds = null;
                $essayAnswer = null;

                if ($qData['type'] === 'short-answer' || $qData['type'] === 'essay') {
                    $essayAnswer = $userAnswer;
                } else {
                    if ($userAnswer) {
                        $selectedOptionIds = json_encode([$userAnswer]);
                    }
                }

                // Insert into exam_answers
                $answerId = $this->generateUuid();

                $ansStmt = $this->db->prepare("
                    INSERT INTO exam_answers 
                    (id, attempt_id, question_id, selected_option_ids, essay_answer, is_correct, points_earned, answered_at)
                    VALUES 
                    (:id, :attempt_id, :question_id, :selected_ids, :essay, :is_correct, :points, NOW())
                ");
                
                $ansStmt->execute([
                    'id' => $answerId,
                    'attempt_id' => $attemptId,
                    'question_id' => $qid,
                    'selected_ids' => $selectedOptionIds,
                    'essay' => $essayAnswer,
                    'is_correct' => $isCorrect === null ? null : ($isCorrect ? 1 : 0),
                    'points' => $pointsEarned
                ]);
            }

            // Update Attempt Status
            $percentage = $totalPoints > 0 ? round(($score / $totalPoints) * 100, 2) : 0;
            
            // Get pass_score
            $passScore = 50;
            try {
                 $passRes = $this->db->query("SELECT pass_score FROM exams WHERE id = '$examId'")->fetch(\PDO::FETCH_ASSOC);
                 if ($passRes) $passScore = $passRes['pass_score'];
            } catch (\Exception $ex) {}
            
            $passed = $percentage >= $passScore ? 1 : 0;

            $antiCheatViolations = $data['anti_cheat_violations'] ?? 0;

            $upd = $this->db->prepare("
                UPDATE exam_attempts 
                SET status = 'submitted', 
                    score = :score, 
                    total_points = :total, 
                    percentage = :percent, 
                    passed = :passed, 
                    anti_cheat_violations = :violations,
                    submitted_at = NOW() 
                WHERE id = :id
            ");
            $upd->execute([
                'id' => $attemptId,
                'score' => $score,
                'total' => $totalPoints,
                'percent' => $percentage,
                'passed' => $passed,
                'violations' => $antiCheatViolations
            ]);

            $this->json([
                'success' => true,
                'score' => $score,
                'correct_count' => $correctCount, // Added explicit count
                'totalPoints' => $totalPoints,
                'percentage' => $percentage,
                'passed' => (bool)$passed
            ]);

        } catch (\Exception $e) {
            error_log("Result Submit Error: " . $e->getMessage());
            $this->json(['error' => 'Failed to calculate results: ' . $e->getMessage()], 500);
        }
    }
    /**
     * GET /api/student/exam-results
     * Get list of exam attempts and results for the logged-in student
     */
    public function myResults() {
        SecureSession::start();
        $userId = SecureSession::get('user_id');
        if (!$userId) return $this->json(['error' => 'Unauthorized'], 401);

        try {
            $stmt = $this->db->prepare("
                SELECT 
                    ea.id as attempt_id,
                    ea.score, 
                    ea.total_points, 
                    ea.percentage, 
                    ea.passed, 
                    ea.submitted_at,
                    e.title as exam_title,
                    e.duration_minutes,
                    c.title as course_name
                FROM exam_attempts ea
                JOIN exams e ON ea.exam_id = e.id
                LEFT JOIN courses c ON e.course_id = c.id
                WHERE ea.user_id = :uid AND ea.status = 'submitted'
                ORDER BY ea.submitted_at DESC
            ");
            $stmt->execute(['uid' => $userId]);
            $results = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Calculate stats
            $total = count($results);
            $passed = 0;
            $sumPercentage = 0;
            
            foreach ($results as &$r) {
                if ($r['passed']) $passed++;
                $sumPercentage += $r['percentage'];
            }
            unset($r);

            $avgScore = $total > 0 ? round($sumPercentage / $total, 1) : 0;
            $passRate = $total > 0 ? round(($passed / $total) * 100, 1) : 0;

            $this->json([
                'attempts' => $results,
                'stats' => [
                    'total_exams' => $total,
                    'passed_exams' => $passed,
                    'avg_score' => $avgScore,
                    'pass_rate' => $passRate
                ]
            ]);

        } catch (\Exception $e) {
            error_log("My Results Error: " . $e->getMessage());
            $this->json(['error' => 'Failed to fetch results'], 500);
        }
    }

    /**
     * GET /api/exams/review/{attempt_id}
     * Get detailed review for a completed attempt
     */
    public function review($params) {
        $attemptId = $params['id'] ?? null;
        if (!$attemptId) return $this->json(['error' => 'Attempt ID required'], 400);

        try {
            // 1. Fetch Attempt Info and Verify Owner
            $userId = SecureSession::get('user_id');
            $userRole = SecureSession::get('role');
            
            if (!$userId) return $this->json(['error' => 'يجب تسجيل الدخول'], 401);
            
            $sql = "SELECT ea.*, e.title as exam_title, e.show_results, e.duration_minutes
                    FROM exam_attempts ea
                    JOIN exams e ON ea.exam_id = e.id
                    WHERE ea.id = :attempt_id";
            
            $params = ['attempt_id' => $attemptId];
            
            // If student, must be their own attempt
            if ($userRole === 'student') {
                $sql .= " AND ea.user_id = :user_id";
                $params['user_id'] = $userId;
            }

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $attempt = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$attempt) return $this->json(['error' => 'محاولة غير موجودة أو غير مصرح لك بمشاهدتها'], 404);
            if ($attempt['status'] !== 'submitted') return $this->json(['error' => 'Attempt not submitted yet'], 400);

            // Note: If teacher disables show_results, we might limit what we return.
            // But for now, user asked specifically for reviews, so we proceed.

            // 2. Fetch Questions and their Options
            $qStmt = $this->db->prepare("
                SELECT id, type, text, image_url, points, sort_order, explanation
                FROM exam_questions 
                WHERE exam_id = :exam_id 
                ORDER BY sort_order ASC
            ");
            $qStmt->execute(['exam_id' => $attempt['exam_id']]);
            $questions = $qStmt->fetchAll(\PDO::FETCH_ASSOC);

            // 3. Fetch Student Answers for this attempt
            $ansStmt = $this->db->prepare("
                SELECT question_id, selected_option_ids, essay_answer, is_correct, points_earned
                FROM exam_answers
                WHERE attempt_id = :attempt_id
            ");
            $ansStmt->execute(['attempt_id' => $attemptId]);
            $studentAnswers = $ansStmt->fetchAll(\PDO::FETCH_ASSOC);
            
            // Re-index student answers by question_id
            $answersMap = [];
            foreach ($studentAnswers as $ans) {
                $answersMap[$ans['question_id']] = $ans;
            }

            // 4. Combine and Map Types
            foreach ($questions as &$q) {
                // Fetch Options
                $optStmt = $this->db->prepare("
                    SELECT id, text, is_correct, wrong_explanation, image_url 
                    FROM question_options 
                    WHERE question_id = :qid 
                    ORDER BY sort_order ASC
                ");
                $optStmt->execute(['qid' => $q['id']]);
                $q['options'] = $optStmt->fetchAll(\PDO::FETCH_ASSOC);

                // Map backend types to frontend types
                $typeMap = [
                    'single' => 'mcq',
                    'true_false' => 'true-false',
                    'essay' => 'short-answer'
                ];
                $q['type'] = $typeMap[$q['type']] ?? $q['type'];

                // Attach User Answer
                $q['user_answer'] = $answersMap[$q['id']] ?? null;
                if ($q['user_answer']) {
                    $q['user_answer']['selected_option_ids'] = json_decode($q['user_answer']['selected_option_ids'] ?? '[]', true);
                }
            }
            unset($q);

            $this->json([
                'exam_title' => $attempt['exam_title'],
                'score' => $attempt['score'],
                'total_points' => $attempt['total_points'],
                'percentage' => $attempt['percentage'],
                'passed' => (bool)$attempt['passed'],
                'submitted_at' => $attempt['submitted_at'],
                'anti_cheat_violations' => $attempt['anti_cheat_violations'],
                'questions' => $questions
            ]);

        } catch (\Exception $e) {
            error_log("Exam Review Error: " . $e->getMessage());
            $this->json(['error' => 'Failed to load review data'], 500);
        }
    }
}
