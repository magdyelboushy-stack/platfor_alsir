<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Config\Database;
use App\Utils\SecureSession;
use App\Services\EnrollmentSecurityService;
use PDO;

/**
 * Admin Codes Controller
 * 
 * Manages activation codes for admin
 */
class CodesController extends BaseController
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
     * GET /api/admin/codes
     * List all activation codes
     */
    public function index(): void
    {
        $this->authorize('codes:view');
        $showUsed = $_GET['show_used'] ?? false;

        try {
            $sql = "SELECT ac.*, c.title as course_name, u.name as used_by_name
                    FROM activation_codes ac
                    LEFT JOIN courses c ON ac.course_id = c.id
                    LEFT JOIN users u ON ac.redeemed_by = u.id";
            
            if (!$showUsed) {
                $sql .= " WHERE ac.status != 'used'";
            }
            
            $sql .= " ORDER BY ac.created_at DESC";

            $stmt = $this->db->query($sql);
            $codes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->json($codes);

        } catch (\Exception $e) {
            error_log("Admin codes list error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب الأكواد'], 500);
        }
    }

    /**
     * GET /api/admin/codes/stats
     * Get codes statistics
     */
    public function stats(): void
    {
        $this->authorize('codes:view');

        try {
            $stmt = $this->db->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
                    SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
                    SUM(price) as revenue
                FROM activation_codes
            ");
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->json([
                'total' => (int)$stats['total'],
                'active' => (int)$stats['active'],
                'used' => (int)$stats['used'],
                'expired' => (int)$stats['expired'],
                'revenue' => (float)($stats['revenue'] ?? 0)
            ]);

        } catch (\Exception $e) {
            error_log("Admin codes stats error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب الإحصائيات'], 500);
        }
    }

    /**
     * POST /api/admin/codes
     * Generate new activation codes
     */
    public function store(): void
    {
        $this->authorize('codes:create');
        $data = json_decode(file_get_contents('php://input'), true);

        $courseId = $data['course_id'] ?? null;
        $price = $data['price'] ?? 0;
        $expiresAt = $data['expires_at'] ?? null;
        $batchName = $data['batch_name'] ?? null;
        
        // Handle students array (Targeted Mode)
        $students = $data['students'] ?? [];
        $quantity = (int)($data['count'] ?? $data['quantity'] ?? 1);

        if (!empty($students) && is_array($students)) {
            $quantity = count($students);
        }

        if ($quantity < 1 || $quantity > 100) {
            $this->json(['error' => 'الكمية يجب أن تكون بين 1 و 100'], 400);
            return;
        }

        try {
            $codes = [];
            
            // If students are provided, loop through them. Otherwise loop quantity times.
            for ($i = 0; $i < $quantity; $i++) {
                $code = $this->generateCode();
                $codeId = $this->generateUuid();
                
                // Get student ID if available for this iteration
                $assignedTo = !empty($students[$i]) ? $students[$i] : null;

                $stmt = $this->db->prepare("
                    INSERT INTO activation_codes (id, code, course_id, assigned_to, price, batch_name, status, expires_at, created_at)
                    VALUES (:id, :code, :course_id, :assigned_to, :price, :batch_name, 'active', :expires_at, NOW())
                ");
                
                $stmt->execute([
                    'id' => $codeId,
                    'code' => $code,
                    'course_id' => $courseId,
                    'assigned_to' => $assignedTo,
                    'price' => $price,
                    'batch_name' => $batchName,
                    'expires_at' => $expiresAt
                ]);
                
                $codes[] = $code;
            }

            $this->json(['success' => true, 'codes' => $codes, 'count' => count($codes)]);

        } catch (\Exception $e) {
            error_log("Admin codes create error: " . $e->getMessage());
            $this->json(['error' => 'فشل إنشاء الأكواد'], 500);
        }
    }

    /**
     * POST /api/codes/redeem
     * Redeem an activation code (student facing)
     */
    public function redeem(): void
    {
        $userId = SecureSession::get('user_id');
        if (!$userId) {
            $this->json(['error' => 'يجب تسجيل الدخول'], 401);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $code = trim($data['code'] ?? '');

        if (empty($code)) {
            $this->json(['error' => 'يرجى إدخال الكود'], 400);
            return;
        }

        try {
            // Find the code
            $stmt = $this->db->prepare("
                SELECT ac.*, c.title as course_title 
                FROM activation_codes ac
                LEFT JOIN courses c ON ac.course_id = c.id
                WHERE ac.code = :code AND ac.status = 'active'
            ");
            $stmt->execute(['code' => $code]);
            $codeData = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$codeData) {
                $this->json(['error' => 'الكود غير صالح أو مستخدم'], 400);
                return;
            }

            // Check if expired
            if ($codeData['expires_at'] && strtotime($codeData['expires_at']) < time()) {
                $this->json(['error' => 'الكود منتهي الصلاحية'], 400);
                return;
            }

            // Check if student-specific code
            if ($codeData['assigned_to'] && $codeData['assigned_to'] !== $userId) {
                $this->json(['error' => 'هذا الكود مخصص لطالب آخر'], 400);
                return;
            }

            // Check if course-specific and already enrolled
            if ($codeData['course_id']) {
                $checkStmt = $this->db->prepare("
                    SELECT id FROM enrollments 
                    WHERE user_id = :user_id AND course_id = :course_id AND status = 'active'
                ");
                $checkStmt->execute(['user_id' => $userId, 'course_id' => $codeData['course_id']]);
                if ($checkStmt->fetch()) {
                    $this->json([
                        'error' => 'أنت مشترك بالفعل في هذا الكورس',
                        'already_enrolled' => true,
                        'course' => [
                            'id' => $codeData['course_id'],
                            'title' => $codeData['course_title'] ?? 'الكورس'
                        ]
                    ], 400);
                    return;
                }

                // Create enrollment
                $enrollId = $this->generateUuid();
                $enrollStmt = $this->db->prepare("
                    INSERT INTO enrollments (id, user_id, course_id, status, enrolled_at)
                    VALUES (:id, :user_id, :course_id, 'active', NOW())
                ");
                $enrollStmt->execute([
                    'id' => $enrollId,
                    'user_id' => $userId,
                    'course_id' => $codeData['course_id']
                ]);

                // Log Activation Transaction
                $transId = $this->generateUuid();
                $transStmt = $this->db->prepare("
                    INSERT INTO transactions (id, user_id, type, amount, description, status, created_at)
                    VALUES (:id, :user_id, 'activation', :amount, :desc, 'completed', NOW())
                ");
                $transStmt->execute([
                    'id' => $transId,
                    'user_id' => $userId,
                    'amount' => $codeData['price'],
                    'desc' => 'تفعيل كورس: ' . ($codeData['course_title'] ?? 'غير معروف')
                ]);
            } else {
                // Add to wallet
                $this->db->prepare("
                    UPDATE users SET wallet_balance = wallet_balance + :amount WHERE id = :id
                ")->execute(['amount' => $codeData['price'], 'id' => $userId]);

                // Log Deposit Transaction
                $transId = $this->generateUuid();
                $transStmt = $this->db->prepare("
                    INSERT INTO transactions (id, user_id, type, amount, description, status, created_at)
                    VALUES (:id, :user_id, 'deposit', :amount, :desc, 'completed', NOW())
                ");
                $transStmt->execute([
                    'id' => $transId,
                    'user_id' => $userId,
                    'amount' => $codeData['price'],
                    'desc' => 'شحن المحفظة عبر كود'
                ]);
            }

            // Mark code as used
            $this->db->prepare("
                UPDATE activation_codes 
                SET status = 'used', redeemed_by = :user_id, redeemed_at = NOW()
                WHERE id = :id
            ")->execute(['user_id' => $userId, 'id' => $codeData['id']]);

            $this->json([
                'success' => true, 
                'message' => 'تم تفعيل الكود بنجاح',
                'course' => $codeData['course_id'] ? [
                    'id' => $codeData['course_id'],
                    'title' => $codeData['course_title'] ?? 'الكورس'
                ] : null
            ]);

        } catch (\Exception $e) {
            error_log("Code redeem error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ أثناء تفعيل الكود'], 500);
        }
    }

    /**
     * GET /api/admin/my-courses
     * Get courses for code generation form
     */
    public function myCourses(): void
    {
        $this->authorize('codes:view');

        try {
            $stmt = $this->db->query("SELECT id, title FROM courses ORDER BY title");
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->json(['data' => $courses]);

        } catch (\Exception $e) {
            error_log("My courses error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ'], 500);
        }
    }

    /**
     * GET /api/admin/my-students
     * Get students for code generation form
     */
    public function myStudents(): void
    {
        $this->authorize('codes:view');

        try {
            $stmt = $this->db->query("
                SELECT id, name, email, phone 
                FROM users 
                WHERE role = 'student' AND status = 'active'
                ORDER BY name
                LIMIT 500
            ");
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->json(['data' => $students]);

        } catch (\Exception $e) {
            error_log("My students error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ'], 500);
        }
    }

    /**
     * Generate activation code
     */
    private function generateCode(): string
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $code = '';
        for ($i = 0; $i < 12; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $code;
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
