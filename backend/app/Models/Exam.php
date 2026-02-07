<?php

namespace App\Models;

use App\Core\Model;

class Exam extends Model {
    protected $table = 'exams';

    protected $fillable = [
        'id', 'course_id', 'section_id', 'title', 'description',
        'duration_minutes', 'pass_score', 'max_attempts', 'is_randomized',
        'status', 'show_results', 'anti_cheat_enabled', 'scheduled_at', 'ends_at'
    ];

    /**
     * Generate UUID v4
     */
    private function generateUuid() {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Create exam with questions
     * Single-teacher mode: No teacher_id needed
     */
    public function createWithQuestions($data, $questions) {
        $this->db->beginTransaction();
        try {
            $examId = $this->generateUuid();
            
            // Insert exam (teacher_id removed - single-teacher mode)
            $stmt = $this->db->prepare("
                INSERT INTO exams (id, course_id, section_id, title, description, 
                    duration_minutes, pass_score, max_attempts, is_randomized, status, 
                    show_results, anti_cheat_enabled, scheduled_at, ends_at)
                VALUES (:id, :course_id, :section_id, :title, :description,
                    :duration_minutes, :pass_score, :max_attempts, :is_randomized, :status,
                    :show_results, :anti_cheat_enabled, :scheduled_at, :ends_at)
            ");
            $stmt->execute([
                'id' => $examId,
                'course_id' => $data['course_id'],
                'section_id' => $data['section_id'] ?? null,
                'title' => $data['title'],
                'description' => $data['description'] ?? '',
                'duration_minutes' => $data['duration_minutes'] ?? 30,
                'pass_score' => $data['pass_score'] ?? 50,
                'max_attempts' => $data['max_attempts'] ?? 1,
                'is_randomized' => $data['is_randomized'] ?? 0,
                'status' => $data['status'] ?? 'draft',
                'show_results' => $data['show_results'] ?? 1,
                'anti_cheat_enabled' => $data['anti_cheat_enabled'] ?? 1,
                'scheduled_at' => $data['scheduled_at'] ?? null,
                'ends_at' => $data['ends_at'] ?? null,
            ]);

            // Insert questions and options
            foreach ($questions as $order => $q) {
                $questionId = $this->generateUuid();
                $qStmt = $this->db->prepare("
                    INSERT INTO exam_questions (id, exam_id, type, text, image_url, points, sort_order, explanation)
                    VALUES (:id, :exam_id, :type, :text, :image_url, :points, :sort_order, :explanation)
                ");
                $qStmt->execute([
                    'id' => $questionId,
                    'exam_id' => $examId,
                    'type' => $q['type'] ?? 'single',
                    'text' => $q['text'],
                    'image_url' => $q['image_url'] ?? null,
                    'points' => $q['points'] ?? 1,
                    'sort_order' => $order,
                    'explanation' => $q['explanation'] ?? null,
                ]);

                // Insert options
                if (isset($q['options']) && is_array($q['options'])) {
                    foreach ($q['options'] as $optOrder => $opt) {
                        $optId = $this->generateUuid();
                        $optStmt = $this->db->prepare("
                            INSERT INTO question_options (id, question_id, text, image_url, is_correct, wrong_explanation, sort_order)
                            VALUES (:id, :question_id, :text, :image_url, :is_correct, :wrong_explanation, :sort_order)
                        ");
                        $optStmt->execute([
                            'id' => $optId,
                            'question_id' => $questionId,
                            'text' => $opt['text'],
                            'image_url' => $opt['image_url'] ?? null,
                            'is_correct' => $opt['is_correct'] ? 1 : 0,
                            'wrong_explanation' => $opt['wrong_explanation'] ?? null,
                            'sort_order' => $optOrder,
                        ]);
                    }
                }
            }

            $this->db->commit();
            return ['id' => $examId, 'success' => true];
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Exam creation error: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all exams (single-teacher mode: no ownership filter)
     */
    public function getAll($courseId = null) {
        $sql = "SELECT e.*, c.title as course_title,
                (SELECT COUNT(*) FROM exam_questions WHERE exam_id = e.id) as questions_count,
                (SELECT COUNT(*) FROM exam_attempts WHERE exam_id = e.id) as attempts_count
                FROM exams e
                LEFT JOIN courses c ON e.course_id = c.id
                WHERE 1=1";
        
        $params = [];
        
        if ($courseId) {
            $sql .= " AND e.course_id = :course_id";
            $params['course_id'] = $courseId;
        }
        
        $sql .= " ORDER BY e.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get exam by ID (single-teacher mode: no ownership check)
     */
    public function getById($examId) {
        $stmt = $this->db->prepare("
            SELECT e.*, c.title as course_title
            FROM exams e
            LEFT JOIN courses c ON e.course_id = c.id
            WHERE e.id = :id
        ");
        $stmt->execute(['id' => $examId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * Get exam with all questions and options
     */
    public function getWithQuestionsById($examId) {
        $exam = $this->getById($examId);
        if (!$exam) return null;

        $qStmt = $this->db->prepare("
            SELECT * FROM exam_questions WHERE exam_id = :exam_id ORDER BY sort_order
        ");
        $qStmt->execute(['exam_id' => $examId]);
        $questions = $qStmt->fetchAll(\PDO::FETCH_ASSOC);

        foreach ($questions as &$q) {
            $optStmt = $this->db->prepare("
                SELECT * FROM question_options WHERE question_id = :question_id ORDER BY sort_order
            ");
            $optStmt->execute(['question_id' => $q['id']]);
            $q['options'] = $optStmt->fetchAll(\PDO::FETCH_ASSOC);
        }

        $exam['questions'] = $questions;
        return $exam;
    }

    /**
     * Update exam (single-teacher mode: no ownership check)
     */
    public function updateExam($examId, $data, $questions = null) {
        // Verify existence
        $exam = $this->getById($examId);
        if (!$exam) return false;

        $this->db->beginTransaction();
        try {
            // Update exam
            $updates = [];
            $params = ['id' => $examId];
            foreach (['title', 'description', 'duration_minutes', 'pass_score', 'max_attempts', 
                      'is_randomized', 'status', 'show_results', 'anti_cheat_enabled', 
                      'scheduled_at', 'ends_at', 'section_id'] as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = :$field";
                    $params[$field] = $data[$field];
                }
            }
            
            if (!empty($updates)) {
                $sql = "UPDATE exams SET " . implode(', ', $updates) . " WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute($params);
            }

            // If questions provided, replace all
            if ($questions !== null) {
                // Delete old questions (cascades to options)
                $this->db->prepare("DELETE FROM exam_questions WHERE exam_id = :exam_id")
                    ->execute(['exam_id' => $examId]);

                // Insert new questions
                foreach ($questions as $order => $q) {
                    $questionId = $this->generateUuid();
                    $qStmt = $this->db->prepare("
                        INSERT INTO exam_questions (id, exam_id, type, text, image_url, points, sort_order, explanation)
                        VALUES (:id, :exam_id, :type, :text, :image_url, :points, :sort_order, :explanation)
                    ");
                    $qStmt->execute([
                        'id' => $questionId,
                        'exam_id' => $examId,
                        'type' => $q['type'] ?? 'single',
                        'text' => $q['text'],
                        'image_url' => $q['image_url'] ?? null,
                        'points' => $q['points'] ?? 1,
                        'sort_order' => $order,
                        'explanation' => $q['explanation'] ?? null,
                    ]);

                    if (isset($q['options']) && is_array($q['options'])) {
                        foreach ($q['options'] as $optOrder => $opt) {
                            $optId = $this->generateUuid();
                            $optStmt = $this->db->prepare("
                                INSERT INTO question_options (id, question_id, text, image_url, is_correct, wrong_explanation, sort_order)
                                VALUES (:id, :question_id, :text, :image_url, :is_correct, :wrong_explanation, :sort_order)
                            ");
                            $optStmt->execute([
                                'id' => $optId,
                                'question_id' => $questionId,
                                'text' => $opt['text'],
                                'image_url' => $opt['image_url'] ?? null,
                                'is_correct' => $opt['is_correct'] ? 1 : 0,
                                'wrong_explanation' => $opt['wrong_explanation'] ?? null,
                                'sort_order' => $optOrder,
                            ]);
                        }
                    }
                }
            }

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Exam update error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete exam with ownership check
     */
    public function deleteForTeacher($examId, $teacherId) {
        $exam = $this->getByIdForTeacher($examId, $teacherId);
        if (!$exam) return false;

        $stmt = $this->db->prepare("DELETE FROM exams WHERE id = :id");
        return $stmt->execute(['id' => $examId]);
    }

    /**
     * Check if student can attempt exam
     */
    public function canStudentAttempt($examId, $userId, $role = 'student') {
        // Staff check (Admins, Teachers, Assistants bypass enrollment)
        if (in_array($role, ['admin', 'teacher', 'assistant'])) {
            return ['can_attempt' => true];
        }

        // Check if already attempted (only students are limited by attempts)
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM exam_attempts WHERE exam_id = :exam_id AND user_id = :user_id
        ");
        $stmt->execute(['exam_id' => $examId, 'user_id' => $userId]);
        $attempted = (int)$stmt->fetchColumn() > 0;

        if ($attempted) {
             // For now, allow staff to see even if they attempted, but students are blocked
             if ($role === 'student') {
                 return ['can_attempt' => false, 'reason' => 'already_attempted'];
             }
        }

        // Check if exam is published
        $stmt = $this->db->prepare("SELECT status, course_id FROM exams WHERE id = :id");
        $stmt->execute(['id' => $examId]);
        $examData = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$examData || $examData['status'] !== 'published') {
            return ['can_attempt' => false, 'reason' => 'exam_not_available'];
        }

        // Enrollment Check
        if ($examData['course_id']) {
            // 1. Direct active enrollment
            $stmt = $this->db->prepare("
                SELECT status FROM enrollments 
                WHERE course_id = :course_id AND user_id = :user_id AND status = 'active'
            ");
            $stmt->execute(['course_id' => $examData['course_id'], 'user_id' => $userId]);
            $isEnrolled = (bool)$stmt->fetch();

            if (!$isEnrolled) {
                // 2. Fallback: Check if course is free (auto-access)
                $stmt = $this->db->prepare("SELECT price FROM courses WHERE id = :id");
                $stmt->execute(['id' => $examData['course_id']]);
                $course = $stmt->fetch(\PDO::FETCH_ASSOC);
                
                if ($course && (float)$course['price'] <= 0) {
                    $isEnrolled = true;
                }
            }

            if (!$isEnrolled) {
                error_log("Access denied to exam {$examId} for user {$userId} (Role: {$role}). Reason: Not enrolled in course {$examData['course_id']}");
                return ['can_attempt' => false, 'reason' => 'not_enrolled'];
            }
        }

        return ['can_attempt' => true];
    }

    /**
     * Start exam attempt
     */
    public function startAttempt($examId, $userId, $role = 'student') {
        $canAttempt = $this->canStudentAttempt($examId, $userId, $role);
        if (!$canAttempt['can_attempt']) {
            return $canAttempt;
        }

        $attemptId = $this->generateUuid();
        $stmt = $this->db->prepare("
            INSERT INTO exam_attempts (id, exam_id, user_id, status)
            VALUES (:id, :exam_id, :user_id, 'in_progress')
        ");
        $stmt->execute([
            'id' => $attemptId,
            'exam_id' => $examId,
            'user_id' => $userId,
        ]);

        return ['success' => true, 'attempt_id' => $attemptId];
    }
}
