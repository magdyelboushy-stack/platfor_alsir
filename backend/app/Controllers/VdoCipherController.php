<?php

namespace App\Controllers;

use App\Core\BaseController;
use App\Utils\SecureSession;
use App\Config\Database;

class VdoCipherController extends BaseController {
    
    /**
     * Generate OTP and PlaybackInfo for VdoCipher
     * POST /api/videos/{id}/otp
     * SECURITY FIX: Added rate limiting to prevent OTP abuse
     */
    public function getOTP($params) {
        SecureSession::start();
        $userId = SecureSession::get('user_id');
        $videoId = $params['id'] ?? null;

        if (!$userId) {
            $this->json(['error' => 'يجب تسجيل الدخول'], 401);
        }

        // SECURITY FIX: Rate limit video OTP requests (30 per minute per user)
        $rateLimiter = new \App\Utils\AdvancedRateLimiter();
        if (!$rateLimiter->checkAdvanced('video_otp', $userId, null, 30, 60)) {
            $this->json(['error' => 'طلبات كثيرة جداً، يرجى الانتظار لحظة'], 429);
        }

        if (!$videoId) {
            $this->json(['error' => 'معرف الفيديو مطلوب'], 400);
        }

        // --- ACCESS CHECK ---
        try {
            $db = Database::getInstance()->getConnection();
            
            // Find the course associated with this video
            $sql = "SELECT c.id, c.price, c.education_stage, c.grade_level 
                    FROM courses c 
                    JOIN course_sections s ON c.id = s.course_id 
                    JOIN lessons l ON s.id = l.section_id 
                    WHERE l.content_url = :vid";
            $stmt = $db->prepare($sql);
            $stmt->execute(['vid' => $videoId]);
            $course = $stmt->fetch(\PDO::FETCH_ASSOC);

            $userRole = SecureSession::get('role');

            if (!$course) {
                // If video isn't in a course yet, only allow staff
                if (!in_array($userRole, ['admin', 'teacher', 'assistant'])) {
                    $this->json(['error' => 'الفيديو غير متاح حالياً'], 404);
                }
            } else {
                $userStage = strtolower(SecureSession::get('education_stage') ?? '');
                $userGrade = \App\Utils\GradeNormalizer::normalize(SecureSession::get('grade_level'));
                $courseStage = strtolower($course['education_stage'] ?? '');
                $courseGrade = \App\Utils\GradeNormalizer::normalize($course['grade_level']);

                $isAllowed = false;
                if (in_array($userRole, ['admin', 'teacher', 'assistant'])) {
                    $isAllowed = true;
                } else {
                    // Check if it's a free matching course
                    if ((float)$course['price'] <= 0 && $userStage === $courseStage && $userGrade === $courseGrade) {
                        $isAllowed = true;
                    } else {
                        // Check active enrollment
                        $stmt = $db->prepare("SELECT id FROM enrollments WHERE user_id = :u AND course_id = :c AND status = 'active'");
                        $stmt->execute(['u' => $userId, 'c' => $course['id']]);
                        if ($stmt->fetch()) {
                            $isAllowed = true;
                        }
                    }
                }

                if (!$isAllowed) {
                    $this->json(['error' => 'غير مصرح لك بتشغيل هذا الفيديو. يرجى الاشتراك أولاً.'], 403);
                }
            }
        } catch (\Exception $e) {
            error_log("VdoCipher Access Check Error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في التحقق من الصلاحية'], 500);
        }

        // --- VDOCIPHER API CALL ---
        $secret = $_ENV['VDOCIPHER_API_SECRET'] ?? '';
        
        if (empty($secret) || $secret === 'REPLACE_WITH_YOUR_ACTUAL_SECRET') {
            $this->json(['error' => 'VdoCipher API Key not configured'], 500);
        }

        $url = "https://dev.vdocipher.com/api/videos/{$videoId}/otp";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Apisecret {$secret}",
            "Content-Type: application/json"
        ]);

        // --- DYNAMIC WATERMARK (Annotate) ---
        // Fetch current user details for watermark based on role
        $role = SecureSession::get('role');
        $tableName = 'users';
        if ($role === 'admin') $tableName = 'admins';
        if ($role === 'teacher') $tableName = 'teachers';
        if ($role === 'assistant') $tableName = 'assistants';

        $stmt = $db->prepare("SELECT name, phone FROM $tableName WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $userData = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        $userName = $userData['name'] ?? 'User';
        $userPhone = $userData['phone'] ?? '';
        
        $annotation = json_encode([
            [
                'type' => 'text',
                'text' => $userName . " (" . $userPhone . ")",
                'alpha' => '0.8', // Good visibility but not blocking
                'color' => '0xFF0000',
                'size' => '14', // Small size as requested
                'x' => '50', // Mandatory base coord
                'y' => '50', // Mandatory base coord
                'moving' => true, // Verified movement parameter
                'interval' => '3000',
                'bcolor' => '0x000000',
                'bopacity' => '0.5'
            ]
        ]);

        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'ttl' => 300,
            'annotate' => $annotation
        ]));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            error_log("VdoCipher API Error ($httpCode): " . $response);
            $this->json(['error' => 'فشل الحصول على تصريح تشغيل الفيديو من المزود', 'debug' => $response, 'code' => $httpCode], 500);
        }

        $this->json(json_decode($response, true));
    }
}
