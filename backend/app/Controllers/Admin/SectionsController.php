<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Models\Section;
use App\Utils\SecureSession;
use App\Utils\AuditLogger;

class SectionsController extends BaseController {
    private $sectionModel;

    public function __construct() {
        $this->sectionModel = new Section();
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
     * List sections for a course
     */
    public function index($params) {
        $this->authorize();

        $courseId = $params['id'] ?? null;
        if (!$courseId) {
            return $this->json(['error' => 'معرف الكورس مطلوب'], 400);
        }

        try {
            $sections = $this->sectionModel->getByCourse($courseId);

            // Get lessons for each section
            foreach ($sections as &$section) {
                $section['lessons'] = $this->sectionModel->getWithLessons($section['id'])['lessons'] ?? [];
            }

            $this->json($sections);
        } catch (\Exception $e) {
            error_log("Sections list error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ'], 500);
        }
    }

    /**
     * Create a new section
     */
    public function store($params) {
        $this->authorize();

        $courseId = $params['courseId'] ?? null;
        if (!$courseId) {
            return $this->json(['error' => 'معرف الكورس مطلوب'], 400);
        }

        $input = $this->getInput();

        if (empty($input['title'])) {
            return $this->json(['error' => 'عنوان القسم مطلوب'], 400);
        }

        try {
            $data = [
                'course_id' => $courseId,
                'title' => trim($input['title']),
                'sort_order' => $input['sort_order'] ?? 0,
            ];

            $sectionId = $this->sectionModel->create($data);

            AuditLogger::log(
                SecureSession::get('user_id'),
                'create_section',
                'course_sections',
                $sectionId
            );

            $this->json([
                'message' => 'تم إنشاء القسم بنجاح',
                'id' => $sectionId
            ], 201);
        } catch (\Exception $e) {
            error_log("Section creation error: " . $e->getMessage());
            $this->json(['error' => 'فشل إنشاء القسم'], 500);
        }
    }

    /**
     * Update section
     */
    public function update($params) {
        $this->authorize();

        $id = $params['id'] ?? null;
        if (!$id) {
            return $this->json(['error' => 'معرف القسم مطلوب'], 400);
        }

        $input = $this->getInput();

        try {
            $data = [];
            $allowed = ['title', 'sort_order'];

            foreach ($allowed as $field) {
                if (isset($input[$field])) {
                    $data[$field] = $input[$field];
                }
            }

            if (empty($data)) {
                return $this->json(['error' => 'لا توجد بيانات للتحديث'], 400);
            }

            $this->sectionModel->update($id, $data);

            $this->json(['message' => 'تم تحديث القسم بنجاح']);
        } catch (\Exception $e) {
            error_log("Section update error: " . $e->getMessage());
            $this->json(['error' => 'فشل تحديث القسم'], 500);
        }
    }

    /**
     * Delete section
     */
    public function delete($params) {
        $this->authorize();

        $id = $params['id'] ?? null;
        if (!$id) {
            return $this->json(['error' => 'معرف القسم مطلوب'], 400);
        }

        try {
            $this->sectionModel->delete($id);

            AuditLogger::log(
                SecureSession::get('user_id'),
                'delete_section',
                'course_sections',
                $id
            );

            $this->json(['message' => 'تم حذف القسم بنجاح']);
        } catch (\Exception $e) {
            error_log("Section delete error: " . $e->getMessage());
            $this->json(['error' => 'فشل حذف القسم'], 500);
        }
    }
}
