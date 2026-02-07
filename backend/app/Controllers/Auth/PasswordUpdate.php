<?php

namespace App\Controllers\Auth;

use App\Core\BaseController;
use App\Models\User;
use App\Models\ActivityLog;
use App\Utils\SecureSession;
use App\Utils\PasswordHasher;

class PasswordUpdate extends BaseController {
    
    public function handle() {
        try {
            SecureSession::start();
            $userId = SecureSession::get('user_id');
            
            if (!$userId) {
                $this->json(['error' => 'Unauthenticated', 'message' => 'يرجى تسجيل الدخول أولاً.'], 401);
            }

            // Get POST data (JSON)
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $this->json(['error' => 'Invalid Input', 'message' => 'البيانات المرسلة غير صالحة.'], 400);
            }

            $userModel = new User();
            
            // 1. Validation: All fields required
            $currentPassword = $input['currentPassword'] ?? '';
            $newPassword = $input['newPassword'] ?? '';
            $confirmPassword = $input['confirmPassword'] ?? '';

            if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
                $this->json(['error' => 'Validation Error', 'message' => 'جميع الحقول مطلوبة.'], 400);
            }

            // 2. Validation: New passwords match
            if ($newPassword !== $confirmPassword) {
                $this->json(['error' => 'Validation Error', 'message' => 'كلمة المرور الجديدة غير متطابقة.'], 400);
            }

            // 3. Validation: Complexity (Min 8 chars, Upper, Number, Symbol)
            if (strlen($newPassword) < 8) {
                $this->json(['error' => 'Validation Error', 'message' => 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.'], 400);
            }
            if (!preg_match('/[A-Z]/', $newPassword)) {
                $this->json(['error' => 'Validation Error', 'message' => 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل (Capital Letter).'], 400);
            }
            if (!preg_match('/[0-9]/', $newPassword)) {
                $this->json(['error' => 'Validation Error', 'message' => 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.'], 400);
            }
            if (!preg_match('/[^a-zA-Z0-9]/', $newPassword)) {
                $this->json(['error' => 'Validation Error', 'message' => 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (Symbol).'], 400);
            }

            // 4. Verify Current Password
            if (!$userModel->verifyPassword($userId, $currentPassword)) {
                $this->json(['error' => 'Invalid Credentials', 'message' => 'كلمة المرور الحالية غير صحيحة.'], 400);
            }

            // 5. Update Password
            if (!$userModel->update($userId, [
                'password' => $newPassword // The User model hashes it in the update method
            ])) {
                throw new \Exception("فشل في تحديث كلمة المرور في قاعدة البيانات.");
            }

            // 6. Record Activity Log
            $user = $userModel->find($userId);
            $logModel = new ActivityLog();
            if (!$logModel->record($userId, $user['name'], 'password_change', "Student updated their account password")) {
                $isDebug = isset($_ENV['DEBUG']) && filter_var($_ENV['DEBUG'], FILTER_VALIDATE_BOOLEAN);
                if ($isDebug) {
                    throw new \Exception("Security Log (Password) Persistence Failed. Check Table Existence.");
                }
                error_log("Security Log Failure (Password) for user $userId");
            }

            $this->json([
                'success' => true,
                'message' => 'تم تحديث كلمة المرور بنجاح!'
            ]);
            
        } catch (\Exception $e) {
            error_log("Password Update Backend Error: " . $e->getMessage());
            $this->json(['error' => 'Server Error', 'message' => 'حدث خطأ غير متوقع في الخادم.'], 500);
        }
    }
}
