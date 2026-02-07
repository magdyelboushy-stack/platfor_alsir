<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Models\Course;
use App\Utils\SecureSession;
use App\Utils\AuditLogger;
use App\Services\EnrollmentSecurityService;
use App\Utils\GradeNormalizer;

class CoursesController extends BaseController {
    private $courseModel;

    public function __construct() {
        $this->courseModel = new Course();
    }

    /**
     * Check authorization
     */
    private function authorize($permission = null) {
        // 1. Basic Role Check
        $role = SecureSession::get('role');
        if (!in_array($role, ['admin', 'teacher', 'assistant'])) {
            error_log("AUTH_403: Access denied for role: " . ($role ?: 'NULL'));
            $this->json(['error' => 'غير مصرح'], 403);
            exit;
        }

        // 2. Permission Check (if provided)
        if ($permission && !EnrollmentSecurityService::hasPermission($permission)) {
            error_log("PERM_403: User lacks permission: $permission");
            $this->json(['error' => 'ليس لديك صلاحية للقيام بهذا الإجراء'], 403);
            exit;
        }
    }

    /**
     * List all courses
     */
    public function index() {
        $this->authorize('courses:view');

        try {
            $filters = [];
            
            // Scope: Global for Admin
            // $effectiveTeacherId = EnrollmentSecurityService::getEffectiveTeacherId();
            // if ($effectiveTeacherId) {
            //     $filters['teacher_id'] = $effectiveTeacherId;
            // }

            $courses = $this->courseModel->getAll($filters);

            // Format for frontend
            $formatted = array_map(function($c) {
                return [
                    'id' => $c['id'],
                    'title' => $c['title'],
                    'description' => $c['description'],
                    'thumbnail' => $c['thumbnail'],
                    'price' => (float) $c['price'],
                    'educationStage' => $c['education_stage'],
                    'gradeLevel' => $c['grade_level'],
                    'status' => $c['status'],
                    'teacherName' => $c['teacher_name'],
                    'enrollmentCount' => (int) $c['enrollment_count'],
                    'createdAt' => $c['created_at']
                ];
            }, $courses);

            $this->json($formatted);
        } catch (\Exception $e) {
            error_log("Courses list error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب الكورسات'], 500);
        }
    }

    /**
     * Create a new course
     */
    public function store() {
        $this->authorize('courses:create');

        $input = $this->getInput();

        // Validate required fields
        $required = ['title', 'education_stage', 'grade_level'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                $this->json(['error' => "الحقل $field مطلوب"], 400);
            }
        }

        try {
            // OWNERSHIP RULE: Everything belongs to the "Effective Teacher"
            $ownerId = EnrollmentSecurityService::getEffectiveTeacherId();
            
            if (!$ownerId) {
                 if (SecureSession::get('role') === 'admin') {
                     // Single-teacher mode: Admin is the owner
                     $ownerId = SecureSession::get('user_id');
                 } else {
                     // Fallback for other roles (shouldn't happen if authorized correctly)
                     $ownerId = SecureSession::get('user_id');
                 }
            }

            // FETCH ADMIN SUBJECT (Single-teacher mode: Admin = Teacher)
            $adminModel = new \App\Models\Admin();
            $admin = $adminModel->find($ownerId);
            $subject = $admin ? ($admin['subject'] ?? 'عام') : 'عام';

            $data = [
                'title' => trim($input['title']),
                'description' => $input['description'] ?? '',
                'objectives' => isset($input['objectives']) ? (is_array($input['objectives']) ? json_encode($input['objectives']) : (string)$input['objectives']) : null,
                'price' => $input['price'] ?? 0,
                'education_stage' => $input['education_stage'],
                'grade_level' => GradeNormalizer::normalize($input['grade_level']),
                'subject' => $subject, // <--- AUTOMATED SUBJECT
                'status' => $input['status'] ?? 'published'
            ];

            $courseId = $this->courseModel->create($data);

            AuditLogger::log(
                SecureSession::get('user_id'),
                'create_course',
                'courses',
                $courseId,
                $ownerId // Log owner too just in case
            );

            $this->json([
                'message' => 'تم إنشاء الكورس بنجاح',
                'id' => $courseId
            ], 201);
        } catch (\Exception $e) {
            error_log("Course creation error: " . $e->getMessage());
            $this->json(['error' => 'فشل إنشاء الكورس'], 500);
        }
    }

    /**
     * Get single course with content
     */
    public function show($params) {
        $this->authorize('courses:view');

        $id = $params['id'] ?? null;
        if (!$id) {
            $this->json(['error' => 'معرف الكورس مطلوب'], 400);
        }

        try {
            $course = $this->courseModel->getWithContent($id);

            if (!$course) {
                $this->json(['error' => 'الكورس غير موجود'], 404);
            }

            // Single-teacher mode: Admin owns all courses, no ownership check needed

            $this->json($course);
        } catch (\Exception $e) {
            error_log("Course show error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ'], 500);
        }
    }

    /**
     * Update course
     */
    public function update($params) {
        $this->authorize('courses:edit');

        $id = $params['id'] ?? null;
        if (!$id) {
            $this->json(['error' => 'معرف الكورس مطلوب'], 400);
        }

        $input = $this->getInput();

        try {
            // Verify Existence & Ownership
            $course = $this->courseModel->find($id);
            if (!$course) {
                $this->json(['error' => 'الكورس غير موجود'], 404);
                return;
            }

            // Single-teacher mode: Admin owns all courses, no ownership check needed

            $data = [];
            $allowed = ['title', 'description', 'thumbnail', 'intro_video_url', 'price', 'education_stage', 'grade_level', 'status', 'objectives'];

            foreach ($allowed as $field) {
                if (isset($input[$field])) {
                    $data[$field] = $field === 'objectives'
                        ? (is_array($input[$field]) ? json_encode($input[$field]) : (string)$input[$field])
                        : ($field === 'grade_level' ? GradeNormalizer::normalize($input[$field]) : $input[$field]);
                }
            }

            if (empty($data)) {
                $this->json(['error' => 'لا توجد بيانات للتحديث'], 400);
            }

            $this->courseModel->update($id, $data);

            AuditLogger::log(
                SecureSession::get('user_id'),
                'update_course',
                'courses',
                $id
            );

            $this->json(['message' => 'تم تحديث الكورس بنجاح']);
        } catch (\Exception $e) {
            error_log("Course update error: " . $e->getMessage());
            $this->json(['error' => 'فشل تحديث الكورس'], 500);
        }
    }

    /**
     * Delete course
     */
    public function delete($params) {
        $this->authorize('courses:delete');

        $id = $params['id'] ?? null;
        if (!$id) {
            $this->json(['error' => 'معرف الكورس مطلوب'], 400);
        }

        try {
            // Verify Existence & Ownership
            $course = $this->courseModel->find($id);
            if (!$course) {
                $this->json(['error' => 'الكورس غير موجود'], 404);
                return;
            }

            // Single-teacher mode: Admin owns all courses, no ownership check needed

            $this->courseModel->delete($id);

            AuditLogger::log(
                SecureSession::get('user_id'),
                'delete_course',
                'courses',
                $id
            );

            $this->json(['message' => 'تم حذف الكورس بنجاح']);
        } catch (\Exception $e) {
            error_log("Course delete error: " . $e->getMessage());
            $this->json(['error' => 'فشل حذف الكورس'], 500);
        }
    }
    /**
     * Upload course thumbnail
     */
    public function uploadThumbnail() {
        $this->authorize('courses:edit');

        if (empty($_FILES['thumbnail'])) {
            $this->json(['error' => 'لم يتم رفع أي صورة'], 400);
            return;
        }

        $file = $_FILES['thumbnail'];
        $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (!in_array($file['type'], $allowed)) {
            $this->json(['error' => 'نوع الملف غير مدعوم'], 400);
            return;
        }

        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($file['size'] > $maxSize) {
            $this->json(['error' => 'حجم الصورة كبير جداً (أقصى حد 5MB)'], 400);
            return;
        }

        try {
            // Ensure unique name
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid('thumb_') . '.' . $ext;
            
            // Upload directory
            $uploadDir = dirname(__DIR__, 3) . '/public/uploads/courses/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $targetPath = $uploadDir . $filename;
            
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $url = '/uploads/courses/' . $filename;
                $this->json(['success' => true, 'url' => $url]);
            } else {
                throw new \Exception('Failed to move uploaded file');
            }

        } catch (\Exception $e) {
            error_log("Thumbnail upload error: " . $e->getMessage());
            $this->json(['error' => 'فشل رفع الصورة'], 500);
        }
    }
}
