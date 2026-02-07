<?php

namespace App\Controllers;

use App\Core\BaseController;
use App\Utils\SecureSession;
use App\Config\Database;
use PDO;

/**
 * Dashboard API: stats, courses (alias), exams, activity for student dashboard.
 */
class DashboardController extends BaseController {

    /**
     * GET /api/dashboard/stats - Student dashboard stats (enrolled courses, completed lessons, etc.)
     */
    public function stats() {
        SecureSession::start();
        $userId = SecureSession::get('user_id');
        if (!$userId) {
            $this->json(['error' => 'يجب تسجيل الدخول'], 401);
        }

        try {
            $db = Database::getInstance()->getConnection();

            $stmt = $db->prepare("SELECT COUNT(*) FROM enrollments WHERE user_id = :uid AND status = 'active'");
            $stmt->execute(['uid' => $userId]);
            $enrolledCoursesCount = (int) $stmt->fetchColumn();

            $stmt = $db->prepare("SELECT COUNT(DISTINCT lp.lesson_id) FROM lesson_progress lp
                                 JOIN enrollments e ON e.user_id = lp.user_id
                                 JOIN lessons l ON l.id = lp.lesson_id
                                 JOIN course_sections s ON s.id = l.section_id AND s.course_id = e.course_id
                                 WHERE lp.user_id = :uid AND lp.completed = 1 AND e.status = 'active'");
            $stmt->execute(['uid' => $userId]);
            $completedLessons = (int) $stmt->fetchColumn();

            $stmt = $db->prepare("SELECT COALESCE(SUM(lp.watched_seconds), 0) FROM lesson_progress lp WHERE lp.user_id = :uid");
            $stmt->execute(['uid' => $userId]);
            $totalSeconds = (int) $stmt->fetchColumn();
            $learningHours = round($totalSeconds / 3600, 1);

            // Calculate Wallet Balance from transactions (Only cash-related types)
            $stmt = $db->prepare("
                SELECT 
                    COALESCE(SUM(CASE 
                        WHEN type = 'deposit' THEN amount 
                        WHEN type IN ('withdrawal', 'purchase') THEN -amount 
                        ELSE 0 
                    END), 0) as balance
                FROM transactions 
                WHERE user_id = :uid AND status = 'completed'
            ");
            $stmt->execute(['uid' => $userId]);
            $walletBalance = (float) $stmt->fetchColumn();

            // Calculate total paid across all enrollment-related sources
            // 1. Total from redeemed course codes
            $stmt = $db->prepare("SELECT COALESCE(SUM(price), 0) FROM activation_codes WHERE redeemed_by = :uid AND course_id IS NOT NULL");
            $stmt->execute(['uid' => $userId]);
            $totalFromCodes = (float) $stmt->fetchColumn();

            // 2. Total from direct purchases (if any wallet purchases exist)
            $stmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = :uid AND status = 'completed' AND type = 'purchase'");
            $stmt->execute(['uid' => $userId]);
            $totalFromPurchases = (float) $stmt->fetchColumn();

            $totalPaid = $totalFromCodes + $totalFromPurchases;

            $this->json([
                'enrolledCoursesCount' => $enrolledCoursesCount,
                'completedLessons' => $completedLessons,
                'totalWatchTime' => (int) round($totalSeconds / 60),
                'learningHours' => $learningHours,
                'totalExamsScore' => 0,
                'streak' => 'جديد',
                'understandingRate' => $enrolledCoursesCount > 0 ? min(100, round(($completedLessons / max(1, $enrolledCoursesCount * 10)) * 100)) : 0,
                'performanceLevel' => 0,
                'accuracy' => 0,
                'xp' => $completedLessons * 10,
                'rank' => 'مبتدئ',
                'upcomingExams' => 0,
                'walletBalance' => $walletBalance,
                'totalPaid' => $totalPaid,
                'totalSubscriptions' => $enrolledCoursesCount,
                'activeSubCount' => $enrolledCoursesCount,
                'expiredSubCount' => 0,
                'averageScore' => 0,
                'certificatesEarned' => 0,
                'streakDays' => 0,
            ]);
        } catch (\Exception $e) {
            error_log("Dashboard stats error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب إحصائيات لوحة التحكم'], 500);
        }
    }

    /**
     * GET /api/dashboard/exams - Upcoming exams (placeholder)
     */
    public function exams() {
        SecureSession::start();
        if (!SecureSession::get('user_id')) {
            $this->json(['error' => 'يجب تسجيل الدخول'], 401);
        }
        $this->json([]);
    }

    /**
     * GET /api/dashboard/activity - Recent activity (placeholder)
     */
    public function activity() {
        SecureSession::start();
        if (!SecureSession::get('user_id')) {
            $this->json(['error' => 'يجب تسجيل الدخول'], 401);
        }
        $this->json([]);
    }

    /**
     * GET /api/dashboard/wallet/history - Get financial transaction history
     */
    public function walletHistory() {
        SecureSession::start();
        $userId = SecureSession::get('user_id');
        if (!$userId) {
            $this->json(['error' => 'يجب تسجيل الدخول'], 401);
        }

        try {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("
                SELECT id, type, amount, description, status, created_at as date
                FROM transactions 
                WHERE user_id = :uid 
                ORDER BY created_at DESC
            ");
            $stmt->execute(['uid' => $userId]);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->json($transactions);
        } catch (\Exception $e) {
            error_log("Wallet history error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب سجل المعاملات'], 500);
        }
    }
}
