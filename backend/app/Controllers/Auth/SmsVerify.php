<?php

namespace App\Controllers\Auth;

use App\Core\BaseController;
use App\Models\User;
use App\Utils\AuditLogger;

class SmsVerify extends BaseController {
    
    public function handle() {
        try {
            $data = $this->getInput();
            $inputIdentifier = $data['phone'] ?? $data['email'] ?? '';
            $code = $data['code'] ?? '';

            if (!$inputIdentifier || !$code) {
                $this->json(['error' => 'بيانات غير مكتملة'], 400);
            }

            $userModel = new User();
            $user = null;
            $isEmail = strpos($inputIdentifier, '@') !== false;

            if ($isEmail) {
                // It's an email
                $user = $userModel->findByEmail($inputIdentifier);
            } else {
                // It's a phone number
                $phone = (string)$inputIdentifier;
                // Normalize Phone Number
                if (strlen($phone) === 10 && strpos($phone, '1') === 0) {
                    $phone = '0' . $phone;
                }
                $user = $userModel->findByPhone($phone);
            }
            
            

            if (!$user || $user['role'] !== 'student') {
                $this->json(['error' => 'هذا الرقم غير  صحيح'], 404);
            }

            // Check if already verified
            if ($user['is_sms_verified']) {
                $this->json(['message' => 'هذا الحساب مفعل بالفعل'], 200);
            }

            // Verify Code
            
            
            // Trim whitespace and do case-insensitive comparison
            $dbCode = trim((string)($user['sms_code'] ?? ''));
            $inputCode = trim((string)$code);
            
            if ($dbCode === $inputCode && !empty($dbCode)) {
                $userModel->update($user['id'], [
                    'is_sms_verified' => 1,
                    'sms_code' => null // Clear code after use
                ]);

                AuditLogger::log($user['id'], 'sms_verification_success', 'users', $user['id']);

                $this->json(['message' => 'تم التحقق من الحساب بنجاح. يمكنك الآن تسجيل الدخول.']);
            } else {
                $this->json(['error' => 'كود التحقق غير صحيح'], 401);
            }

        } catch (\Exception $e) {
            $this->json(['error' => 'حدث خطأ غير متوقع أثناء عملية التحقق'], 500);
        }
    }
}
