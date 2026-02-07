<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Config\Database;
use App\Utils\SecureSession;
use App\Services\EnrollmentSecurityService;
use PDO;

/**
 * Admin Exams Controller
 * 
 * Manages exams for admin/teacher (CRUD operations)
 */
class ExamsController extends BaseController
{
    private ?PDO $db = null;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Authorization check
     */
    private function authorize($permission = null): void
    {
        $role = SecureSession::get('role');
        if (!in_array($role, ['admin', 'assistant'])) {
            $this->json(['error' => 'غير مصرح'], 403);
            exit;
        }

        if ($permission && !EnrollmentSecurityService::hasPermission($permission)) {
            $this->json(['error' => 'ليس لديك صلاحية لهذا الإجراء'], 403);
            exit;
        }
    }

    /**
     * GET /api/admin/exams
     * List all exams
     */
    public function index($params = []): void
    {
        $this->authorize('exams:view');

        try {
            $sql = "SELECT e.*, c.title as course_name,
                    (SELECT COUNT(*) FROM exam_questions WHERE exam_id = e.id) as questions_count,
                    (SELECT COUNT(*) FROM exam_attempts WHERE exam_id = e.id) as attempts_count
                    FROM exams e
                    LEFT JOIN courses c ON e.course_id = c.id";
            
            $whereConditions = [];
            $bindParams = [];

            // Filter by course if provided
            if (!empty($params['courseId'])) {
                $whereConditions[] = "e.course_id = :course_id";
                $bindParams['course_id'] = $params['courseId'];
            }

            if (!empty($whereConditions)) {
                $sql .= " WHERE " . implode(' AND ', $whereConditions);
            }

            $sql .= " ORDER BY e.created_at DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($bindParams);
            $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $items = array_map(function($e) {
                return [
                    'id' => $e['id'],
                    'title' => $e['title'],
                    'courseName' => $e['course_name'],
                    'status' => $e['status'],
                    'durationMinutes' => $e['duration_minutes'],
                    'passScore' => $e['pass_score'],
                    'questionsCount' => (int)$e['questions_count'],
                    'attemptsCount' => (int)$e['attempts_count'],
                    'createdAt' => $e['created_at']
                ];
            }, $exams);

            $this->json(['success' => true, 'items' => $items]);

        } catch (\Exception $e) {
            error_log("Admin exams list error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب الامتحانات'], 500);
        }
    }

    /**
     * GET /api/admin/exams/{id}
     * Get single exam with questions
     */
    public function show($params): void
    {
        $this->authorize('exams:view');
        $id = $params['id'] ?? null;

        if (!$id || $id === 'undefined' || $id === 'new') {
            $this->json(['exam' => null, 'message' => 'New exam mode']);
            return;
        }

        try {
            $stmt = $this->db->prepare("SELECT * FROM exams WHERE id = :id");
            $stmt->execute(['id' => $id]);
            $exam = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$exam) {
                $this->json(['error' => 'الامتحان غير موجود'], 404);
                return;
            }

            // Get questions
            $qStmt = $this->db->prepare("
                SELECT * FROM exam_questions 
                WHERE exam_id = :exam_id 
                ORDER BY sort_order
            ");
            $qStmt->execute(['exam_id' => $id]);
            $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC);

            // Get options for each question
            foreach ($questions as &$q) {
                $optStmt = $this->db->prepare("
                    SELECT * FROM question_options 
                    WHERE question_id = :question_id 
                    ORDER BY sort_order
                ");
                $optStmt->execute(['question_id' => $q['id']]);
                $q['options'] = $optStmt->fetchAll(PDO::FETCH_ASSOC);
            }
            unset($q);

            $this->json([
                'exam' => [
                    'id' => $exam['id'],
                    'title' => $exam['title'],
                    'duration' => $exam['duration_minutes'],
                    'passScore' => $exam['pass_score'],
                    'antiCheatEnabled' => (bool)$exam['anti_cheat_enabled'],
                    'status' => $exam['status'],
                    'questions' => array_map(function($q) {
                        return [
                            'id' => $q['id'],
                            'text' => $q['text'],
                            'imageUrl' => $q['image_url'],
                            'points' => $q['points'],
                            'explanation' => $q['explanation'],
                            'options' => array_map(function($o) {
                                return [
                                    'id' => $o['id'],
                                    'text' => $o['text'],
                                    'isCorrect' => (bool)$o['is_correct'],
                                    'wrongExplanation' => $o['wrong_explanation']
                                ];
                            }, $q['options'])
                        ];
                    }, $questions)
                ]
            ]);

        } catch (\Exception $e) {
            error_log("Admin exam show error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب الامتحان'], 500);
        }
    }

    /**
     * POST /api/admin/exams
     * Create new exam
     */
    public function store(): void
    {
        $this->authorize('exams:create');
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            $examId = $this->generateUuid();
            
            $stmt = $this->db->prepare("
                INSERT INTO exams (id, title, duration_minutes, pass_score, anti_cheat_enabled, status, created_at)
                VALUES (:id, :title, :duration, :pass_score, :anti_cheat, :status, NOW())
            ");
            
            $stmt->execute([
                'id' => $examId,
                'title' => $data['title'] ?? 'امتحان جديد',
                'duration' => $data['duration'] ?? 45,
                'pass_score' => $data['passScore'] ?? 50,
                'anti_cheat' => ($data['antiCheatEnabled'] ?? true) ? 1 : 0,
                'status' => $data['status'] ?? 'draft'
            ]);

            // Add questions if provided
            if (!empty($data['questions'])) {
                $this->saveQuestions($examId, $data['questions']);
            }

            $this->json(['success' => true, 'examId' => $examId]);

        } catch (\Exception $e) {
            error_log("Admin exam create error: " . $e->getMessage());
            $this->json(['error' => 'فشل إنشاء الامتحان: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/exams/{id}/update
     * Update existing exam
     */
    public function update($params): void
    {
        $this->authorize('exams:edit');
        $id = $params['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$id) {
            $this->json(['error' => 'معرف الامتحان مطلوب'], 400);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                UPDATE exams SET 
                    title = :title,
                    duration_minutes = :duration,
                    pass_score = :pass_score,
                    anti_cheat_enabled = :anti_cheat,
                    status = :status,
                    updated_at = NOW()
                WHERE id = :id
            ");
            
            $stmt->execute([
                'id' => $id,
                'title' => $data['title'] ?? 'امتحان',
                'duration' => $data['duration'] ?? 45,
                'pass_score' => $data['passScore'] ?? 50,
                'anti_cheat' => ($data['antiCheatEnabled'] ?? true) ? 1 : 0,
                'status' => $data['status'] ?? 'draft'
            ]);

            // Delete old questions & options, then add new ones
            if (isset($data['questions'])) {
                // Delete old options
                $this->db->prepare("
                    DELETE FROM question_options WHERE question_id IN (
                        SELECT id FROM exam_questions WHERE exam_id = :exam_id
                    )
                ")->execute(['exam_id' => $id]);
                
                // Delete old questions
                $this->db->prepare("DELETE FROM exam_questions WHERE exam_id = :exam_id")
                    ->execute(['exam_id' => $id]);
                
                // Save new questions
                $this->saveQuestions($id, $data['questions']);
            }

            $this->json(['success' => true]);

        } catch (\Exception $e) {
            error_log("Admin exam update error: " . $e->getMessage());
            $this->json(['error' => 'فشل تحديث الامتحان'], 500);
        }
    }

    /**
     * POST /api/admin/exams/{id}/delete
     * Delete exam
     */
    public function delete($params): void
    {
        $this->authorize('exams:delete');
        $id = $params['id'] ?? null;

        if (!$id) {
            $this->json(['error' => 'معرف الامتحان مطلوب'], 400);
            return;
        }

        try {
            // Delete related data first
            $this->db->prepare("DELETE FROM exam_answers WHERE attempt_id IN (SELECT id FROM exam_attempts WHERE exam_id = :id)")->execute(['id' => $id]);
            $this->db->prepare("DELETE FROM exam_attempts WHERE exam_id = :id")->execute(['id' => $id]);
            $this->db->prepare("DELETE FROM question_options WHERE question_id IN (SELECT id FROM exam_questions WHERE exam_id = :id)")->execute(['id' => $id]);
            $this->db->prepare("DELETE FROM exam_questions WHERE exam_id = :id")->execute(['id' => $id]);
            $this->db->prepare("DELETE FROM exams WHERE id = :id")->execute(['id' => $id]);

            $this->json(['success' => true]);

        } catch (\Exception $e) {
            error_log("Admin exam delete error: " . $e->getMessage());
            $this->json(['error' => 'فشل حذف الامتحان'], 500);
        }
    }

    /**
     * Save questions and options
     */
    private function saveQuestions(string $examId, array $questions): void
    {
        $sortOrder = 0;
        foreach ($questions as $q) {
            $questionId = $this->generateUuid();
            
            $stmt = $this->db->prepare("
                INSERT INTO exam_questions (id, exam_id, type, text, image_url, points, explanation, sort_order)
                VALUES (:id, :exam_id, :type, :text, :image_url, :points, :explanation, :sort_order)
            ");
            
            $stmt->execute([
                'id' => $questionId,
                'exam_id' => $examId,
                'type' => $q['type'] ?? 'single',
                'text' => $q['text'] ?? '',
                'image_url' => $q['image_url'] ?? null,
                'points' => $q['points'] ?? 1,
                'explanation' => $q['explanation'] ?? null,
                'sort_order' => $sortOrder++
            ]);

            // Save options
            if (!empty($q['options'])) {
                $optOrder = 0;
                foreach ($q['options'] as $opt) {
                    $optId = $this->generateUuid();
                    
                    $optStmt = $this->db->prepare("
                        INSERT INTO question_options (id, question_id, text, is_correct, wrong_explanation, sort_order)
                        VALUES (:id, :question_id, :text, :is_correct, :wrong_explanation, :sort_order)
                    ");
                    
                    $optStmt->execute([
                        'id' => $optId,
                        'question_id' => $questionId,
                        'text' => $opt['text'] ?? '',
                        'is_correct' => ($opt['is_correct'] ?? false) ? 1 : 0,
                        'wrong_explanation' => $opt['wrong_explanation'] ?? null,
                        'sort_order' => $optOrder++
                    ]);
                }
            }
        }
    }

    /**
     * Generate UUID (override not needed, use parent)
     */
    protected function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
