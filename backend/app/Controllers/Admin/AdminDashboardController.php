<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Config\Database;
use App\Utils\SecureSession;
use PDO;

/**
 * AdminDashboardController
 * 
 * Platform-wide dashboard for Super Admin.
 * Provides global statistics and analytics.
 */
class AdminDashboardController extends BaseController
{
    protected ?PDO $db = null;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Require admin role for all methods
     */
    protected function requireAdmin(): void
    {
        $role = SecureSession::get('role');
        if ($role !== 'admin') {
            http_response_code(403);
            $this->json(['error' => 'هذه الصفحة للمسؤولين فقط', 'code' => 'ADMIN_ONLY']);
            exit();
        }
    }

    /**
     * Get platform-wide statistics
     * GET /api/admin/dashboard/stats
     */
    public function stats(): void
    {
        $this->requireAdmin();

        try {
            // 1. Student Stats (from users table)
            $studentStats = $this->db->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
                FROM users 
            ")->fetch(PDO::FETCH_ASSOC);

            // 2. Single-Teacher Mode: No separate teachers table
            // Admin acts as the teacher
            $teacherStats = [
                'total' => 1,
                'active' => 1,
                'pending' => 0,
                'blocked' => 0
            ];

            // 3. Assistant Stats (from assistants table)
            $assistantStats = $this->db->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
                FROM assistants
            ")->fetch(PDO::FETCH_ASSOC);

            $stats = [
                'students' => [
                    'total' => (int)$studentStats['total'],
                    'active' => (int)$studentStats['active'],
                    'pending' => (int)$studentStats['pending'],
                    'blocked' => (int)$studentStats['blocked']
                ],
                'teachers' => [
                    'total' => (int)$teacherStats['total'],
                    'active' => (int)$teacherStats['active'],
                    'pending' => (int)$teacherStats['pending'],
                    'blocked' => (int)$teacherStats['blocked']
                ],
                'assistants' => [
                    'total' => (int)($assistantStats['total'] ?? 0),
                    'active' => (int)($assistantStats['active'] ?? 0),
                    'pending' => (int)($assistantStats['pending'] ?? 0),
                    'blocked' => (int)($assistantStats['blocked'] ?? 0)
                ],
            ];

            // Course and enrollment stats
            $courseStats = $this->db->query("
                SELECT 
                    COUNT(DISTINCT c.id) as total_courses,
                    SUM(CASE WHEN c.status = 'published' THEN 1 ELSE 0 END) as published_courses,
                    COUNT(DISTINCT e.id) as total_enrollments,
                    COUNT(DISTINCT e.user_id) as enrolled_students
                FROM courses c
                LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
            ")->fetch(PDO::FETCH_ASSOC);

            // Revenue estimation (from activation codes)
            $revenueStats = $this->db->query("
                SELECT 
                    COUNT(*) as total_codes,
                    SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used_codes
                FROM activation_codes
            ")->fetch(PDO::FETCH_ASSOC);

            // Recent activity (last 7 days)
            $recentActivity = $this->db->query("
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as new_students
                FROM users 
                WHERE role = 'student' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            ")->fetchAll(PDO::FETCH_ASSOC);

            $this->json([
                'users' => $stats,
                'courses' => [
                    'total' => (int)($courseStats['total_courses'] ?? 0),
                    'published' => (int)($courseStats['published_courses'] ?? 0)
                ],
                'enrollments' => [
                    'total' => (int)($courseStats['total_enrollments'] ?? 0),
                    'uniqueStudents' => (int)($courseStats['enrolled_students'] ?? 0)
                ],
                'codes' => [
                    'total' => (int)($revenueStats['total_codes'] ?? 0),
                    'used' => (int)($revenueStats['used_codes'] ?? 0)
                ],
                'recentActivity' => $recentActivity,
                'generatedAt' => date('Y-m-d H:i:s')
            ]);

        } catch (\PDOException $e) {
            error_log("Admin dashboard stats error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب الإحصائيات'], 500);
        }
    }

    /**
     * Get recent activity logs
     * GET /api/admin/dashboard/activity
     */
    public function activity(): void
    {
        $this->requireAdmin();

        try {
            $limit = min((int)($_GET['limit'] ?? 50), 100);

            $stmt = $this->db->prepare("
                SELECT 
                    al.id,
                    al.user_id,
                    u.name as user_name,
                    u.role as user_role,
                    al.action,
                    al.details,
                    al.ip_address,
                    al.created_at
                FROM activity_logs al
                LEFT JOIN users u ON al.user_id = u.id
                ORDER BY al.created_at DESC
                LIMIT :limit
            ");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->json([
                'logs' => $logs,
                'total' => count($logs)
            ]);

        } catch (\PDOException $e) {
            error_log("Admin activity error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب السجلات'], 500);
        }
    }
}
