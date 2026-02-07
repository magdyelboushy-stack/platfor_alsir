<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Models\User;
use App\Utils\SecureSession;
use App\Utils\AuditLogger;
use App\Services\EnrollmentSecurityService;
use App\Utils\StudentDataTransformer;
use App\Services\SmsService;

class StudentsController extends BaseController {
    protected $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    /**
     * Helper to verify if user has management permissions
     */
    protected function authorize($requiredPermission = null) {
        $userId = SecureSession::get('user_id');
        if (!$userId) {
            $this->json(['error' => 'يجب تسجيل الدخول'], 401);
        }

        $role = SecureSession::get('role');
        $allowedRoles = ['admin', 'teacher', 'assistant'];

        if (!in_array($role, $allowedRoles)) {
            $this->json(['error' => 'ليس لديك صلاحية للقيام بهذا الإجراء'], 403);
        }

        // Use standard service for permission checks
        if ($requiredPermission && !EnrollmentSecurityService::hasPermission($requiredPermission)) {
             $this->json(['error' => 'ليس لديك صلاحية ' . $requiredPermission], 403);
        }
    }

    /**
     * List students with enrollment-based filtering.
     * Teachers/Assistants only see students enrolled in their courses.
     * Admin sees all students.
     */
    public function listActive() {
        $this->authorize('students:view');

        try {
            // Get enrollment-based access condition
            $accessCondition = EnrollmentSecurityService::getStudentAccessCondition('u.id');
            
            $sql = "SELECT u.id, u.name, u.email, u.phone, u.grade_level, u.education_stage, 
                           u.governorate, u.city, u.gender, u.birth_date, u.avatar, u.created_at,
                           u.guardian_name, u.parent_phone, u.status
                    FROM users u
                    WHERE u.role = 'student'
                    AND {$accessCondition['condition']}
                    ORDER BY u.name ASC";

            $stmt = $this->userModel->getDb()->prepare($sql);
            $stmt->execute($accessCondition['params']);
            $students = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Transform students with privacy filtering
            $transformed = StudentDataTransformer::transformMany($students);

            // Format for frontend consistency
            $formatted = array_map(function($s) {
                return [
                    'id' => $s['id'],
                    'name' => $s['name'],
                    'email' => $s['email'],
                    'phone' => $s['phone'],
                    'gradeLevel' => $s['grade_level'],
                    'educationStage' => $s['education_stage'],
                    'governorate' => $s['governorate'],
                    'city' => $s['city'],
                    'gender' => $s['gender'],
                    'birthDate' => $s['birth_date'],
                    'avatar' => $s['avatar'],
                    'guardianName' => $s['guardian_name'] ?? null,
                    'parentPhone' => $s['parent_phone'] ?? null,
                    'status' => $s['status'],
                    'joinedAt' => date('Y-m-d', strtotime($s['created_at'])),
                    '_accessLevel' => $s['_access_level'] ?? 'enrolled',
                    '_hasFullAccess' => $s['_has_full_access'] ?? true
                ];
            }, $transformed);

            $this->json($formatted);
        } catch (\PDOException $e) {
            error_log("Students listing error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب بيانات الطلاب'], 500);
        }
    }

    /**
     * Get single student details
     */
    public function show($params) {
        $this->authorize('students');
        
        $id = $params['id'] ?? null;
        if (!$id) {
            $this->json(['error' => 'رقم الطالب مفقود'], 400);
        }

        try {
            $student = $this->userModel->find($id);
            
            if (!$student || $student['role'] !== 'student') {
                $this->json(['error' => 'الطالب غير موجود'], 404);
            }

            // Check enrollment access
            if (!EnrollmentSecurityService::canAccessStudent(SecureSession::get('user_id'), $id) && SecureSession::get('role') !== 'admin') {
                $this->json(['error' => 'ليس لديك صلاحية الوصول لبيانات هذا الطالب'], 403);
            }

            // Format data
            $formatted = [
                'id' => $student['id'],
                'name' => $student['name'],
                'email' => $student['email'],
                'phone' => $student['phone'],
                'gradeLevel' => $student['grade_level'],
                'educationStage' => $student['education_stage'],
                'governorate' => $student['governorate'],
                'city' => $student['city'],
                'gender' => $student['gender'],
                'birthDate' => $student['birth_date'],
                'avatar' => $student['avatar'],
                'guardianName' => $student['guardian_name'],
                'parentPhone' => $student['parent_phone'],
                'status' => $student['status'],
                'joinedAt' => date('Y-m-d', strtotime($student['created_at'])),
            ];

            $this->json($formatted);
        } catch (\Exception $e) {
            error_log("Student details error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب بيانات الطالب'], 500);
        }
    }

    /**
     * Update student status
     */
    public function updateStatus($params) {
        $this->authorize('students');
        
        $id = $params['id'] ?? null;
        $data = $this->getInput();
        $status = $data['status'] ?? null;

        if (!$id || !$status) {
            $this->json(['error' => 'بيانات غير مكتملة'], 400);
        }

        if (!in_array($status, ['active', 'blocked', 'pending'])) {
            $this->json(['error' => 'حالة غير صالحة'], 400);
        }

        try {
            // Verify target is a student
            $target = $this->userModel->find($id);
            if (!$target || $target['role'] !== 'student') {
                $this->json(['error' => 'الطالب غير موجود'], 404);
            }

            $updateData = ['status' => $status];
            
            // If activating a student who wasn't active
            if ($status === 'active' && $target['status'] !== 'active') {
                $smsCode = SmsService::generateCode();
                $updateData['sms_code'] = $smsCode;
                $updateData['is_sms_verified'] = 0; // Require verification for the first time
                
                // Send SMS (Mock)
                $message = "تم تفعيل حسابك بنجاح. كود التحقق الخاص بك هو: $smsCode";
                SmsService::send($target['phone'], $message);
            }

            $this->userModel->update($id, $updateData);
            
            AuditLogger::log(SecureSession::get('user_id'), 'update_student_status', 'users', $id, null, ['new_status' => $status]);
            
            $this->json(['message' => 'تم تحديث حالة الطالب بنجاح']);
        } catch (\Exception $e) {
            error_log("Update student status error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ أثناء تحديث الحالة'], 500);
        }
    }

    /**
     * Delete student
     */
    public function delete($params) {
        $this->authorize('students');
        
        $id = $params['id'] ?? null;

        if (!$id) {
            $this->json(['error' => 'رقم المعرف مفقود'], 400);
        }

        try {
            // Verify target is a student
            $target = $this->userModel->find($id);
            if (!$target || $target['role'] !== 'student') {
                $this->json(['error' => 'الطالب غير موجود'], 404);
            }

            $this->userModel->delete($id);
            
            AuditLogger::log(SecureSession::get('user_id'), 'delete_student', 'users', $id);
            
            $this->json(['message' => 'تم حذف حساب الطالب بنجاح']);
        } catch (\Exception $e) {
            error_log("Delete student error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ أثناء الحذف'], 500);
        }
    }

    /**
     * Update student profile data
     */
    public function update($params) {
        $this->authorize('students');
        
        $id = $params['id'] ?? null;
        $data = $this->getInput();

        if (!$id) {
            $this->json(['error' => 'رقم المعرف مفقود'], 400);
        }

        try {
            // Verify target is a student
            $target = $this->userModel->find($id);
            if (!$target || $target['role'] !== 'student') {
                $this->json(['error' => 'الطالب غير موجود'], 404);
            }

            // Security: Prevent updating role/status via this endpoint
            unset($data['role']);
            unset($data['status']);
            unset($data['password']);

            $this->userModel->update($id, $data);
            
            AuditLogger::log(SecureSession::get('user_id'), 'update_student_profile', 'users', $id, null, $data);
            
            $this->json(['message' => 'تم تحديث بيانات الطالب بنجاح']);
        } catch (\Exception $e) {
            error_log("Update student profile error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ أثناء تحديث البيانات'], 500);
        }
    }

    /**
     * Get statistics for gender distribution and stages
     */
    /**
     * Get statistics for gender distribution and stages
     * SCOPED to students accessible by the current user
     */
    public function getStats() {
        $this->authorize();

        try {
            $db = $this->userModel->getDb();
            
            // Get Scoping Condition
            // This returns WHERE EXISTS (...) for teachers/assistants, or 1=1 for admin
            $access = EnrollmentSecurityService::getStudentAccessCondition('u.id');
            $condition = $access['condition'];
            $params = $access['params'];

            // Helper to build scoped query
            $buildQuery = function($groupBy) use ($condition) {
                return "SELECT u.$groupBy, COUNT(*) as count 
                        FROM users u
                        WHERE u.role = 'student' 
                        AND u.status = 'active'
                        AND $condition
                        GROUP BY u.$groupBy
                        ORDER BY count DESC"; // Ordering usually helps
            };

            // Gender Distribution
            $genderStmt = $db->prepare($buildQuery('gender'));
            $genderStmt->execute($params);
            $genderData = $genderStmt->fetchAll(\PDO::FETCH_ASSOC);

            // Stage Distribution
            $stageStmt = $db->prepare($buildQuery('education_stage'));
            $stageStmt->execute($params);
            $stageData = $stageStmt->fetchAll(\PDO::FETCH_ASSOC);

            // Governorate Distribution (Top 5)
            $govSql = $buildQuery('governorate') . " LIMIT 5";
            $govStmt = $db->prepare($govSql);
            $govStmt->execute($params);
            $govData = $govStmt->fetchAll(\PDO::FETCH_ASSOC);

            // City Distribution (Top 5)
            $citySql = $buildQuery('city') . " LIMIT 5";
            $cityStmt = $db->prepare($citySql);
            $cityStmt->execute($params);
            $cityData = $cityStmt->fetchAll(\PDO::FETCH_ASSOC);

            $this->json([
                'gender' => $genderData,
                'stages' => $stageData,
                'governorates' => $govData,
                'cities' => $cityData,
                'total' => array_sum(array_column($genderData, 'count'))
            ]);
        } catch (\PDOException $e) {
            error_log("Students stats error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب الإحصائيات'], 500);
        }
    }

    /**
     * Get a student's enrolled courses with progress and watched lessons details
     */
    public function courseDetails($params) {
        $this->authorize('students');

        $studentId = $params['id'] ?? null;
        if (!$studentId) {
            $this->json(['error' => 'رقم الطالب مفقود'], 400);
        }

        try {
            // Verify target is a student
            $target = $this->userModel->find($studentId);
            if (!$target || $target['role'] !== 'student') {
                $this->json(['error' => 'الطالب غير موجود'], 404);
            }

            $db = $this->userModel->getDb();

            // Enrolled courses for this student
            $sql = "SELECT c.*, e.progress_percent, e.enrolled_at, e.status as enrollment_status,
                    (SELECT COUNT(*) FROM lessons l JOIN course_sections s ON l.section_id = s.id WHERE s.course_id = c.id) as lesson_count,
                    (SELECT COUNT(DISTINCT lp.lesson_id)
                     FROM lesson_progress lp 
                     JOIN lessons l ON lp.lesson_id = l.id 
                     JOIN course_sections s ON l.section_id = s.id 
                     WHERE lp.user_id = :uid AND s.course_id = c.id AND lp.completed = 1) as completed_lesson_count
                    FROM courses c
                    JOIN enrollments e ON c.id = e.course_id
                    WHERE e.user_id = :uid2
                    ORDER BY e.enrolled_at DESC";
            $stmt = $db->prepare($sql);
            $stmt->execute(['uid' => $studentId, 'uid2' => $studentId]);
            $courses = $stmt->fetchAll(\PDO::FETCH_ASSOC);

                // For each course, fetch lessons with progress for this student
                $result = [];
                foreach ($courses as $c) {
                    // ... (lessons query unchanged) ...
                    
                    // ... (exam attempts query unchanged) ...

                    $lessonStmt = $db->prepare(
                        "SELECT l.id, l.title, l.content_type, l.duration_minutes, l.is_preview,
                                COALESCE(lp.watched_seconds, 0) AS watched_seconds,
                                COALESCE(lp.completed, 0) AS completed,
                                lp.completed_at
                         FROM lessons l
                         JOIN course_sections s ON l.section_id = s.id
                         LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = :uid
                         WHERE s.course_id = :cid
                         ORDER BY l.sort_order ASC, l.created_at ASC"
                    );
                    $lessonStmt->execute(['uid' => $studentId, 'cid' => $c['id']]);
                    $lessons = $lessonStmt->fetchAll(\PDO::FETCH_ASSOC);

                    $formattedLessons = array_map(function($l) {
                        return [
                            'id' => $l['id'],
                            'title' => $l['title'],
                            'type' => $l['content_type'],
                            'duration' => $l['duration_minutes'] . " دقيقة",
                            'isCompleted' => (bool)$l['completed'],
                            'watched_seconds' => (int)$l['watched_seconds'],
                            'completed_at' => $l['completed_at']
                        ];
                    }, $lessons);

                    // --- NEW: Fetch Exam Attempts for this student in this course ---
                    $examStmt = $db->prepare("
                        SELECT ea.id as attempt_id, ea.score, ea.total_points, ea.percentage, 
                               ea.passed, ea.submitted_at, e.title as exam_title
                        FROM exam_attempts ea
                        JOIN exams e ON ea.exam_id = e.id
                        WHERE ea.user_id = :uid AND e.course_id = :cid AND ea.status = 'submitted'
                        ORDER BY ea.submitted_at DESC
                    ");
                    $examStmt->execute(['uid' => $studentId, 'cid' => $c['id']]);
                    $examAttempts = $examStmt->fetchAll(\PDO::FETCH_ASSOC);

                    $result[] = [
                        'id' => $c['id'],
                        'title' => $c['title'],
                        'thumbnail' => $c['thumbnail'],
                        'progress' => (int)($c['progress_percent'] ?? 0),
                        'lessons' => (int)($c['lesson_count'] ?? 0),
                        'completedLessons' => (int)($c['completed_lesson_count'] ?? 0),
                        'teacher' => 'السير الشامي',
                        'enrolledAt' => $c['enrolled_at'],
                        'status' => $c['enrollment_status'],
                        'lessonDetails' => $formattedLessons,
                        'examAttempts' => $examAttempts
                    ];
                }

            // Standalone Exams
            $courseIds = array_column($courses, 'id');
            $courseIds = array_filter($courseIds);
            $placeholders = count($courseIds) > 0 ? implode(',', array_fill(0, count($courseIds), '?')) : "''";
            
            $standaloneSql = "
                SELECT ea.id as attempt_id, ea.score, ea.total_points, ea.percentage, 
                       ea.passed, ea.submitted_at, e.title as exam_title
                FROM exam_attempts ea
                JOIN exams e ON ea.exam_id = e.id
                WHERE ea.user_id = ? AND ea.status = 'submitted'
                AND (e.course_id IS NULL OR e.course_id = '' OR e.course_id NOT IN ($placeholders))
                ORDER BY ea.submitted_at DESC
            ";
            
            $standaloneStmt = $db->prepare($standaloneSql);
            $standaloneParams = array_merge([$studentId], $courseIds);
            $standaloneStmt->execute($standaloneParams);
            $standaloneExams = $standaloneStmt->fetchAll(\PDO::FETCH_ASSOC);

            $this->json([
                'courses' => $result,
                'standaloneExams' => $standaloneExams
            ]);
        } catch (\Exception $e) {
            error_log("Student course details error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب تفاصيل الكورسات للطالب'], 500);
        }
    }
}
