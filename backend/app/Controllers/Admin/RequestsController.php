<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Models\User;
use App\Utils\SecureSession;
use App\Utils\AuditLogger;
use App\Services\EmailService;

class RequestsController extends BaseController {
    protected $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    /**
     * Helper to verify if user has management permissions
     * Only Admin, Teacher, and Assistant roles allowed
     */
    protected function authorize() {
        if (!SecureSession::get('user_id')) {
            $this->json(['error' => 'يجب تسجيل الدخول'], 401);
        }

        $role = SecureSession::get('role');
        $allowedRoles = ['admin', 'teacher', 'assistant'];

        if (!in_array($role, $allowedRoles)) {
            error_log("Security violation: Role '$role' tried to access admin requests.");
            $this->json(['error' => 'ليس لديك صلاحية للقيام بهذا الإجراء'], 403);
        }
    }

    /**
     * List all pending registration requests
     */
    public function listPending() {
        $this->authorize();

        try {
            $stmt = $this->userModel->getDb()->prepare(
                "SELECT id, name, email, phone, grade_level, education_stage, 
                        governorate, city, guardian_name, parent_phone, gender, 
                        birth_date, avatar, created_at, status 
                 FROM users 
                 WHERE status = 'pending' AND role = 'student'
                 ORDER BY created_at DESC"
            );
            $stmt->execute();
            $requests = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Format for frontend
            $formattedRequests = array_map(function($req) {
                return [
                    'id' => $req['id'],
                    'student' => $req['name'],
                    'type' => 'new_registration',
                    'time' => $this->formatTime($req['created_at']),
                    'details' => [
                        'fullName' => $req['name'],
                        'email' => $req['email'],
                        'phone' => $req['phone'],
                        'gradeLevel' => $req['grade_level'],
                        'educationStage' => $req['education_stage'],
                        'governorate' => $req['governorate'],
                        'city' => $req['city'],
                        'guardianName' => $req['guardian_name'],
                        'guardianPhone' => $req['parent_phone'],
                        'gender' => $req['gender'],
                        'birthDate' => $req['birth_date'],
                        'avatar' => $req['avatar']
                    ]
                ];
            }, $requests);

            $this->json($formattedRequests);
        } catch (\PDOException $e) {
            error_log("Requests listing error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب البيانات'], 500);
        }
    }

    /**
     * Approve a registration request
     */
    public function approve($params) {
        $this->authorize();
        $id = $params['id'] ?? null;

        if (!$id) {
            $this->json(['error' => 'رقم المعرف مفقود'], 400);
        }

        try {
            // Get user info to send Email
            $target = $this->userModel->find($id);
            if (!$target) {
                $this->json(['error' => 'الطالب غير موجود'], 404);
            }

            error_log("Approving student ID: $id by " . SecureSession::get('role'));
            
            $verificationCode = EmailService::generateCode();
            $updateData = [
                'status' => 'active',
                'sms_code' => $verificationCode,
                'is_sms_verified' => 0
            ];

            $result = $this->userModel->update($id, $updateData);
            
            if ($result) {
                // Send Email
                EmailService::sendVerificationCode($target['email'], $target['name'], $verificationCode);

                AuditLogger::log(SecureSession::get('user_id'), 'approve_user', 'users', $id);
                $this->json(['message' => 'تم قبول طلب الطالب بنجاح']);
            }
            
            error_log("Failed to update user ID: $id");
            $this->json(['error' => 'فشل تحديث حالة الطالب'], 500);
        } catch (\Exception $e) {
            error_log("Approve error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ غير متوقع: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reject a registration request (Hard Delete)
     */
    public function reject($params) {
        $this->authorize();
        $id = $params['id'] ?? null;

        if (!$id) {
            $this->json(['error' => 'رقم المعرف مفقود'], 400);
        }

        try {
            error_log("Rejecting/Deleting student ID: $id by " . SecureSession::get('role'));

            $result = $this->userModel->delete($id);
            
            if ($result) {
                AuditLogger::log(SecureSession::get('user_id'), 'reject_user_delete', 'users', $id);
                $this->json(['message' => 'تم رفض الطلب وحذف بيانات الطالب نهائياً']);
            }
            
            error_log("Failed to delete user ID: $id");
            $this->json(['error' => 'فشل العثور على الطالب أو حذف بياناته'], 404);
        } catch (\Exception $e) {
             error_log("Reject/Delete error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ غير متوقع: ' . $e->getMessage()], 500);
        }
    }

    private function formatTime($datetime) {
        $time = strtotime($datetime);
        $diff = time() - $time;
        
        if ($diff < 60) return 'الآن';
        if ($diff < 3600) return 'منذ ' . floor($diff / 60) . ' دقيقة';
        if ($diff < 86400) return 'منذ ' . floor($diff / 3600) . ' ساعة';
        return 'منذ ' . floor($diff / 86400) . ' يوم';
    }
}
