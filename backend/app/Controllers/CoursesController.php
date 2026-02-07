<?php

namespace App\Controllers;

use App\Core\BaseController;
use App\Models\Course;
use App\Utils\SecureSession;

class CoursesController extends BaseController {
    private $courseModel;

    public function __construct() {
        $this->courseModel = new Course();
    }

    /**
     * List all published courses with filters
     */
    public function index() {
        try {
            SecureSession::start();
            $filters = ['status' => 'published'];
            
            // If user is a student, we can automatically filter by their stage/grade if they don't specify
            $userRole = SecureSession::get('role');
            if ($userRole === 'student') {
                // You can add logic here to force filter by student stage
                // but usually we let the frontend send the params or we can auto-fill
            }

            // Get query params
            $stage = $_GET['education_stage'] ?? null;
            $grade = $_GET['grade_level'] ?? null;
            $teacherId = $_GET['teacher_id'] ?? null;

            if ($stage) $filters['education_stage'] = $stage;
            if ($teacherId) $filters['teacher_id'] = $teacherId;

            // Normalize and get variations for grade level
            if ($grade) {
                $filters['grade_level'] = \App\Utils\GradeNormalizer::getVariations($grade);
            }

            $courses = $this->courseModel->getAll($filters);

            $userId = SecureSession::get('user_id');

            // Format for public view (Grid and List)
            $formatted = array_map(function($c) use ($userId) {
                // Get lesson count for this course
                $db = \App\Config\Database::getInstance()->getConnection();
                
                $stmt = $db->prepare("SELECT COUNT(*) FROM lessons l JOIN course_sections s ON l.section_id = s.id WHERE s.course_id = :cid");
                $stmt->execute(['cid' => $c['id']]);
                $lessonCount = (int) $stmt->fetchColumn();

                $isSubscribed = false;
                if ($userId) {
                    $stmt = $db->prepare("SELECT id FROM enrollments WHERE user_id = :u AND course_id = :c");
                    $stmt->execute(['u' => $userId, 'c' => $c['id']]);
                    $isSubscribed = (bool) $stmt->fetch();
                }

                // Get teacher details for the course (already joined in $courseModel->getAll)
                // c.* and t.name as teacher_name are already in $c from $courseModel->getAll()
                // But we need to make sure getAll() select teacher avatar as well.
                // Checking Course.php getAll()... it only selects name. Let's fix that too.

                return [
                    'id' => $c['id'],
                    'title' => $c['title'],
                    'description' => $c['description'],
                    'thumbnail' => $c['thumbnail'],
                    'price' => (float) $c['price'],
                    'subject' => $c['subject'] ?? 'عام', 
                    'educationStage' => $c['education_stage'],
                    'gradeLevel' => $c['grade_level'],
                    'teacherName' => $c['teacher_name'] ?? 'مدرس غير معروف',
                    'teacherAvatar' => $c['teacher_avatar'] ?? null,
                    'enrollmentCount' => (int) ($c['enrollment_count'] ?? 0),
                    'lessonCount' => $lessonCount,
                    'rating' => 5.0,
                    'isSubscribed' => $isSubscribed,
                    'createdAt' => $c['created_at']
                ];
            }, $courses);
 
            $this->json($formatted);
        } catch (\Exception $e) {
            error_log("Public courses list error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب الكورسات'], 500);
        }
    }

    /**
     * Get course details with content
     */
    public function show($params) {
        $id = $params['id'] ?? null;
        if (!$id) {
            $this->json(['error' => 'معرف الكورس مطلوب'], 400);
        }

        try {
            SecureSession::start();
            $course = $this->courseModel->getWithContent($id);

            if (!$course || $course['status'] !== 'published') {
                $this->json(['error' => 'الكورس غير موجود أو غير متاح حالياً'], 404);
            }

            // Check if user is enrolled
            $userId = SecureSession::get('user_id');
            $userRole = SecureSession::get('role');
            $userStage = SecureSession::get('education_stage');
            $userGrade = SecureSession::get('grade_level');
            $isEnrolled = false;

            // 1. PRIMARY ACCESS CHECK: Check if user has an active enrollment
            if ($userId) {
                if ($userRole === 'admin' || $userRole === 'teacher' || $userRole === 'assistant') {
                    $isEnrolled = true;
                } else {
                    $db = \App\Config\Database::getInstance()->getConnection();
                    $stmt = $db->prepare("SELECT id FROM enrollments WHERE user_id = :u AND course_id = :c AND status = 'active'");
                    $stmt->execute(['u' => $userId, 'c' => $id]);
                    $isEnrolled = (bool) $stmt->fetch();
                }
            }

            // 2. SECONDARY ACCESS CHECK: If not enrolled, is it free AND matches grade?
            // This is for instant preview/access without clicking "Enroll"
            if (!$isEnrolled && $userId && (float)$course['price'] <= 0) {
                if ($userRole === 'student') {
                    $sStage = strtolower($userStage);
                    $cStage = strtolower($course['education_stage']);
                    $sGrade = \App\Utils\GradeNormalizer::normalize($userGrade);
                    $cGrade = \App\Utils\GradeNormalizer::normalize($course['grade_level']);

                    if ($sStage === $cStage && $sGrade === $cGrade) {
                        $isEnrolled = true;
                    }
                }
            }

            // Check if explicitly subscribed (for dashboard persistence)
            $isSubscribed = false;
            if ($userId) {
                $db = \App\Config\Database::getInstance()->getConnection();
                $stmt = $db->prepare("SELECT id FROM enrollments WHERE user_id = :u AND course_id = :c");
                $stmt->execute(['u' => $userId, 'c' => $id]);
                $isSubscribed = (bool) $stmt->fetch();
            }

            // Single-teacher mode: Use default teacher info
            $teacherData = [
                'name' => 'السير الشامي',
                'avatar' => null,
                'subject' => 'اللغة العربية'
            ];

            // Format data for frontend
            // Map the syllabus to something the frontend understands
            $formatted = [
                'id' => $course['id'],
                'title' => $course['title'],
                'description' => $course['description'],
                'thumbnail' => $course['thumbnail'],
                'intro_video_url' => $course['intro_video_url'] ?? null,
                'price' => (float) $course['price'],
                'subject' => $course['subject'] ?? ($teacherData['subject'] ?? 'عام'),
                'educationStage' => $course['education_stage'],
                'gradeLevel' => $course['grade_level'],
                'term' => $course['term'] ?? 'ترم أول',
                'teacherName' => $teacherData['name'] ?? 'مدرس غير معروف',
                'teacherAvatar' => $teacherData['avatar'] ?? null,
                'isEnrolled' => $isEnrolled,
                'isSubscribed' => $isSubscribed,
                'objectives' => $course['objectives'],
                'curriculum' => []
            ];

            $lastVideoCompleted = true; // Tracks completion of PREVIOUS video in the whole course
            
            foreach ($course['sections'] as $s) {
                $lessons = [];
                foreach ($s['lessons'] as $l) {
                    $isCompleted = (bool)($l['is_completed'] ?? false);
                    
                    // Progression logic for exams
                    $isLockedByProgression = false;
                    if ($l['content_type'] === 'exam') {
                        // Lock exam if the preceding video wasn't completed
                        if (!$lastVideoCompleted) {
                            $isLockedByProgression = true;
                        }
                    }

                    // For the next lesson, check if THIS video is completed
                    if ($l['content_type'] === 'video') {
                        // Store the state for the NEXT lesson
                        // But wait, what if there are multiple videos? 
                        // The user wants to ensure the video BEFORE the exam is watched.
                        $lastVideoCompleted = $isCompleted;
                    }

                    // Final lock state
                    $finalLocked = (!$isEnrolled || $isLockedByProgression) && !$l['is_preview'];

                    $lessons[] = [
                        'id' => $l['id'],
                        'title' => $l['title'],
                        'type' => $l['content_type'],
                        'duration' => $l['duration_minutes'] . " دقيقة",
                        'isCompleted' => $isCompleted,
                        'watched_seconds' => (int)($l['watched_seconds'] ?? 0),
                        'isLocked' => $finalLocked,
                        'contentUrl' => (!$finalLocked || $l['is_preview']) ? $l['content_url'] : null,
                        // Provide lesson description to frontend (optional)
                        'description' => $l['description'] ?? null,
                    ];
                }

                $formatted['curriculum'][] = [
                    'id' => $s['id'],
                    'title' => $s['title'],
                    'lessons' => $lessons
                ];
            }

            $this->json($formatted);
        } catch (\Exception $e) {
            error_log("Public course show error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب بيانات الكورس'], 500);
        }
    }

    /**
     * Enroll in a course (especially for free courses)
     */
    public function enroll($params) {
        $courseId = $params['id'] ?? null;
        if (!$courseId) {
            $this->json(['error' => 'معرف الكورس مطلوب'], 400);
        }

        try {
            SecureSession::start();
            $userId = SecureSession::get('user_id');
            if (!$userId) {
                $this->json(['error' => 'يجب تسجيل الدخول للاشتراك'], 401);
            }

            // Get course info
            $course = $this->courseModel->find($courseId);
            if (!$course) {
                $this->json(['error' => 'الكورس غير موجود'], 404);
            }

            // GRADE VALIDATION: Only allow students to enroll in their own grade/stage
            $userRole = SecureSession::get('role');
            if ($userRole === 'student') {
                $userStage = SecureSession::get('education_stage');
                $userGrade = SecureSession::get('grade_level');

                $sStage = strtolower($userStage);
                $cStage = strtolower($course['education_stage']);
                $sGrade = \App\Utils\GradeNormalizer::normalize($userGrade);
                $cGrade = \App\Utils\GradeNormalizer::normalize($course['grade_level']);

                if ($sStage !== $cStage || $sGrade !== $cGrade) {
                    $this->json(['error' => 'عذراً، هذا الكورس غير مخصص لسنك الدراسي'], 403);
                    return;
                }
            }

            // For now, we only allow direct enrollment via this API for FREE courses
            if ((float)$course['price'] > 0) {
                $this->json(['error' => 'هذا الكورس مدفوع، يتطلب تفعيل الكود للاشتراك'], 403);
            }

            $db = \App\Config\Database::getInstance()->getConnection();
            
            // Check if already enrolled
            $stmt = $db->prepare("SELECT id FROM enrollments WHERE user_id = :u AND course_id = :c");
            $stmt->execute(['u' => $userId, 'c' => $courseId]);
            if ($stmt->fetch()) {
                $this->json(['message' => 'أنت مشترك بالفعل في هذا الكورس'], 200);
            }

            // Create enrollment
            $stmt = $db->prepare("INSERT INTO enrollments (id, user_id, course_id, status) VALUES (UUID(), :u, :c, 'active')");
            $stmt->execute(['u' => $userId, 'c' => $courseId]);

            $this->json(['message' => 'تم الاشتراك في الكورس بنجاح، سيظهر الآن في لوحة التحكم الخاصة بك']);
        } catch (\Exception $e) {
            error_log("Enrollment error: " . $e->getMessage());
            $this->json(['error' => 'فشل عملية الاشتراك'], 500);
        }
    }

    /**
     * Get enrolled courses for student dashboard
     */
    public function studentCourses() {
        try {
            \App\Utils\SecureSession::start();
            $userId = \App\Utils\SecureSession::get('user_id');
            if (!$userId) {
                $this->json(['error' => 'Unauthorized'], 401);
            }

            $db = \App\Config\Database::getInstance()->getConnection();
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
            $stmt->execute(['uid' => $userId, 'uid2' => $userId]);
            $courses = $stmt->fetchALL(\PDO::FETCH_ASSOC);

            $formatted = array_map(function($c) {
                return [
                    'id' => $c['id'],
                    'title' => $c['title'],
                    'thumbnail' => $c['thumbnail'],
                    'progress' => (int) $c['progress_percent'],
                    'lessons' => (int) $c['lesson_count'],
                    'completedLessons' => (int) $c['completed_lesson_count'],
                    'teacher' => 'السير الشامي',
                    'enrolledAt' => $c['enrolled_at'],
                    'status' => $c['enrollment_status']
                ];
            }, $courses);
 
            $this->json($formatted);
        } catch (\Exception $e) {
            error_log("Student courses list error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب كورساتك'], 500);
        }
    }
}
