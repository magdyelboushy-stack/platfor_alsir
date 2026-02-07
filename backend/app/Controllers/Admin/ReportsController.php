<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Models\User;
use App\Utils\SecureSession;
use PDO;

class ReportsController extends BaseController {

    protected $db;

    public function __construct() {
        $this->db = \App\Config\Database::getInstance()->getConnection();
    }

    protected function authorize() {
        if (SecureSession::get('role') !== 'admin') {
            $this->json(['error' => 'غير مصرح'], 403);
        }
    }

    /**
     * Get comprehensive financial report
     * Single-teacher mode: All stats are for the platform (Admin = Teacher)
     */
    public function index() {
        $this->authorize();

        try {
            // Code Stats & Revenue
            $revenueQuery = "
                SELECT 
                    COUNT(ac.id) as total_codes,
                    SUM(CASE WHEN ac.status = 'used' THEN 1 ELSE 0 END) as used_codes,
                    SUM(CASE WHEN ac.status = 'used' THEN COALESCE(ac.price, c.price, 0) ELSE 0 END) as total_revenue
                FROM activation_codes ac
                LEFT JOIN courses c ON ac.course_id = c.id
            ";
            $revStmt = $this->db->query($revenueQuery);
            $revData = $revStmt->fetch(PDO::FETCH_ASSOC);

            // Course Stats
            $courseStmt = $this->db->query("SELECT COUNT(*) FROM courses WHERE status = 'published'");
            $activeCourses = $courseStmt->fetchColumn();

            // Student Stats
            $studentStmt = $this->db->query("SELECT COUNT(*) FROM users WHERE role = 'student' AND status = 'active'");
            $activeStudents = $studentStmt->fetchColumn();

            // Enrollment Stats
            $enrollmentStmt = $this->db->query("SELECT COUNT(*) FROM enrollments WHERE status = 'active'");
            $activeEnrollments = $enrollmentStmt->fetchColumn();

            $stats = [
                'total_revenue' => (double)($revData['total_revenue'] ?? 0),
                'total_codes' => (int)($revData['total_codes'] ?? 0),
                'used_codes' => (int)($revData['used_codes'] ?? 0),
                'active_courses' => (int)$activeCourses,
                'active_students' => (int)$activeStudents,
                'active_enrollments' => (int)$activeEnrollments
            ];

            // Per Course Breakdown
            $courseQuery = "
                SELECT 
                    c.id, 
                    c.title, 
                    c.thumbnail,
                    c.price,
                    (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as enrollments_count,
                    (SELECT COUNT(*) FROM activation_codes WHERE course_id = c.id) as total_codes,
                    (SELECT COUNT(*) FROM activation_codes WHERE course_id = c.id AND status = 'used') as used_codes,
                    (SELECT SUM(COALESCE(price, 0)) FROM activation_codes WHERE course_id = c.id AND status = 'used') as revenue
                FROM courses c
                WHERE c.status = 'published'
                ORDER BY revenue DESC
            ";
            
            $coursesStmt = $this->db->query($courseQuery);
            $coursesData = $coursesStmt->fetchAll(PDO::FETCH_ASSOC);

            // Format courses data
            $formattedCourses = array_map(function($c) {
                return [
                    'id' => $c['id'],
                    'title' => $c['title'],
                    'thumbnail' => $c['thumbnail'],
                    'price' => (double)$c['price'],
                    'enrollmentsCount' => (int)$c['enrollments_count'],
                    'codes' => [
                        'generated' => (int)$c['total_codes'],
                        'used' => (int)$c['used_codes'],
                        'usageRate' => ((int)$c['total_codes'] > 0) 
                            ? round(((int)$c['used_codes'] / (int)$c['total_codes']) * 100, 1) 
                            : 0
                    ],
                    'revenue' => (double)($c['revenue'] ?? 0)
                ];
            }, $coursesData);

            $this->json([
                'summary' => $stats,
                'courses' => $formattedCourses
            ]);

        } catch (\PDOException $e) {
            error_log("Financial Report Error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في استخراج التقارير المالية'], 500);
        }
    }
}

