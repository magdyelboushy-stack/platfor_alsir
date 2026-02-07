<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Models\Lesson;
use App\Utils\SecureSession;
use App\Utils\AuditLogger;

class LessonsController extends BaseController {
    private $lessonModel;

    public function __construct() {
        $this->lessonModel = new Lesson();
    }

    /**
     * Check authorization
     */
    private function authorize() {
        SecureSession::start();
        $role = SecureSession::get('role');
        if (!in_array($role, ['admin', 'teacher', 'assistant'])) {
            $this->json(['error' => 'غير مصرح'], 403);
            exit;
        }
    }

    /**
     * List lessons for a section
     */
    public function index($params) {
        $this->authorize();

        $sectionId = $params['sectionId'] ?? null;
        if (!$sectionId) {
            return $this->json(['error' => 'معرف القسم مطلوب'], 400);
        }

        try {
            $lessons = $this->lessonModel->getBySection($sectionId);
            $this->json($lessons);
        } catch (\Exception $e) {
            error_log("Lessons list error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ'], 500);
        }
    }

    /**
     * Create a new lesson
     */
    public function store($params) {
        $this->authorize();

        $sectionId = $params['sectionId'] ?? null;
        if (!$sectionId) {
            return $this->json(['error' => 'معرف القسم مطلوب'], 400);
        }

        $input = $this->getInput();

        if (empty($input['title'])) {
            return $this->json(['error' => 'عنوان الدرس مطلوب'], 400);
        }

        try {
            $data = [
                'section_id' => $sectionId,
                'title' => trim($input['title']),
                'description' => $input['description'] ?? null,
                'content_type' => $input['content_type'] ?? 'video',
                'content_url' => $input['content_url'] ?? null,
                'duration_minutes' => $input['duration_minutes'] ?? 0,
                'is_preview' => $input['is_preview'] ?? 0,
                'sort_order' => $input['sort_order'] ?? 0,
            ];

            $lessonId = $this->lessonModel->create($data);

            AuditLogger::log(
                SecureSession::get('user_id'),
                'create_lesson',
                'lessons',
                $lessonId
            );

            $this->json([
                'message' => 'تم إنشاء الدرس بنجاح',
                'id' => $lessonId
            ], 201);
        } catch (\Exception $e) {
            error_log("Lesson creation error: " . $e->getMessage());
            $this->json(['error' => 'فشل إنشاء الدرس'], 500);
        }
    }

    /**
     * Update lesson
     */
    public function update($params) {
        $this->authorize();

        $id = $params['id'] ?? null;
        if (!$id) {
            return $this->json(['error' => 'معرف الدرس مطلوب'], 400);
        }

        $input = $this->getInput();
        
        // Log incoming data for debugging
        error_log("Lesson update - ID: $id, Input: " . json_encode($input));

        try {
            $data = [];
            $allowed = ['title', 'description', 'content_type', 'content_url', 'duration_minutes', 'is_preview', 'sort_order'];

            foreach ($allowed as $field) {
                // Use array_key_exists to allow null values
                if (array_key_exists($field, $input)) {
                    $data[$field] = $input[$field];
                }
            }

            error_log("Lesson update - Filtered data: " . json_encode($data));

            if (empty($data)) {
                return $this->json(['error' => 'لا توجد بيانات للتحديث'], 400);
            }

            // Check if lesson exists first
            $lesson = $this->lessonModel->find($id);
            if (!$lesson) {
                error_log("Lesson update - Lesson not found: $id");
                return $this->json(['error' => 'الدرس غير موجود'], 404);
            }

            $result = $this->lessonModel->update($id, $data);
            error_log("Lesson update - Result: " . ($result ? 'success' : 'failed'));

            $this->json(['message' => 'تم تحديث الدرس بنجاح']);
        } catch (\Exception $e) {
            error_log("Lesson update error: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
            $this->json(['error' => 'فشل تحديث الدرس: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete lesson
     */
    public function delete($params) {
        $this->authorize();

        $id = $params['id'] ?? null;
        if (!$id) {
            return $this->json(['error' => 'معرف الدرس مطلوب'], 400);
        }

        try {
            $this->lessonModel->delete($id);

            AuditLogger::log(
                SecureSession::get('user_id'),
                'delete_lesson',
                'lessons',
                $id
            );

            $this->json(['message' => 'تم حذف الدرس بنجاح']);
        } catch (\Exception $e) {
            error_log("Lesson delete error: " . $e->getMessage());
            $this->json(['error' => 'فشل حذف الدرس'], 500);
        }
    }
}
