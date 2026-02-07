<?php

namespace App\Controllers\Auth;

use App\Core\BaseController;
use App\Models\User;
use App\Utils\AuditLogger;

// Load Debug Logger
require_once __DIR__ . '/../../../DebugLogger.php';

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
            
            \DebugLogger::log("SMS_VERIFY: Lookup", [
                'input' => $inputIdentifier,
                'detected_type' => $isEmail ? 'email' : 'phone',
                'user_found' => $user ? 'YES' : 'NO',
                'role' => $user['role'] ?? 'N/A'
            ]);

            if (!$user || $user['role'] !== 'student') {
                $this->json(['error' => 'هذا الرقم غير  صحيح'], 404);
            }

            // Check if already verified
            if ($user['is_sms_verified']) {
                $this->json(['message' => 'هذا الحساب مفعل بالفعل'], 200);
            }

            // Verify Code
            // DEBUG: Log both codes for comparison
            \DebugLogger::log("SMS Verify", [
                'db_code' => $user['sms_code'] ?? 'NULL',
                'input_code' => $code,
                'db_type' => gettype($user['sms_code']),
                'input_type' => gettype($code)
            ]);
            
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
                \DebugLogger::log("SMS Verify FAILED", ['db' => $dbCode, 'input' => $inputCode]);
                $this->json(['error' => 'كود التحقق غير صحيح'], 401);
            }

        } catch (\Exception $e) {
            \DebugLogger::log("SMS Verification Error", ['error' => $e->getMessage()]);
            $this->json(['error' => 'حدث خطأ غير متوقع أثناء عملية التحقق'], 500);
        }
    }
}
