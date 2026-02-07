<?php

namespace App\Controllers\Auth;

use App\Core\BaseController;
use App\Models\User;
use App\Utils\Validator;
use App\Utils\FileUploader;
use App\Utils\AdvancedRateLimiter;
use App\Utils\CSRF;
use App\Utils\InputSanitizer;
use App\Utils\HoneypotProtection;
use App\Utils\UploadSizeValidator;

class RegisterStaff extends BaseController {
    
    public function handle() {
        try {
            // 0. Honeypot Check
            HoneypotProtection::check();

            // 0.1 Total File Size Check
            UploadSizeValidator::validate();

            // 1. Rate Limiting (Increased for development - 100 per hour)
            $rateLimiter = new AdvancedRateLimiter();
            if (!$rateLimiter->checkAdvanced('register-staff', $_SERVER['REMOTE_ADDR'], null, 100, 3600)) {
                $this->json([
                    'error' => 'عدد محاولات التسجيل كثير جداً',
                    'message' => 'يرجى محاولة مرة أخرى بعد ساعة'
                ], 429);
            }

            // 2. Get Data FIRST
            $data = !empty($_POST) ? $_POST : $this->getInput();
            
            // 3. CSRF Token Check
            $csrfToken = $data['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
            if (!CSRF::validate($csrfToken)) {
                $this->json(['error' => 'فشل التحقق الأمني'], 403);
            }

            // 4. Sanitize Input
            $data = $this->sanitizeInputData($data);

            // 5. Map Data (Staff-specific fields)
            $mappedData = [
                'name' => $data['name'] ?? null,
                'email' => $data['email'] ?? null,
                'password' => $data['password'] ?? null,
                'phone' => $data['phone'] ?? null,
                'role' => $data['role'] ?? 'teacher', // Default to teacher
                'bio' => $data['bio'] ?? null,
            ];

            // 6. Validation Rules (Staff-specific)
            $rules = [
                'name' => 'required|min:3|max:100|unique:users,name',
                'email' => 'required|email|max:255|unique:users,email',
                'password' => 'required|min:8|max:128|password_strength',
                'phone' => 'required|numeric|size:11|egyptian_phone|unique:users,phone',
                'role' => 'required|in:teacher,admin,assistant,support',
                'bio' => 'max:500'
            ];

            // 7. Validate Data
            $validator = new Validator();
            if (!$validator->validate($mappedData, $rules)) {
                $this->json(['errors' => $validator->getErrors()], 422);
            }

            // 8. Handle File Uploads (Profile Photo - Required)
            $uploadedFiles = $this->handleFileUploads();
            
            if (isset($uploadedFiles['error'])) {
                $this->json(['errors' => $uploadedFiles['error']], 422);
            }

            // 9. Add specialization if provided and role is teacher
            if ($data['role'] === 'teacher' && !empty($data['specialization'])) {
                // Store specialization in bio or create separate field
                $mappedData['bio'] = "التخصص: " . $data['specialization'] . "\n" . ($mappedData['bio'] ?? '');
            }

            // 10. Persist to DB
            $userModel = new User();
            $userData = array_merge($mappedData, [
                'avatar' => $uploadedFiles['avatar'] ?? null,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
                'status' => 'pending' // Staff accounts require approval
            ]);

            $userId = $userModel->create($userData);

            // 11. Audit log
            \App\Utils\AuditLogger::log(
                $userId,
                'staff_registration',
                "New {$mappedData['role']} registration from IP: {$_SERVER['REMOTE_ADDR']}"
            );

            $this->json([
                'message' => 'تم التسجيل بنجاح. حسابك قيد المراجعة.',
                'user_id' => $userId,
                'status' => 'pending_verification',
                'role' => $mappedData['role']
            ], 201);

        } catch (\Exception $e) {
            error_log("Staff Registration Error: " . $e->getMessage());
            $this->json([
                'error' => 'فشل التسجيل',
                'message' => 'حدث خطأ غير متوقع'
            ], 500);
        }
    }

    private function handleFileUploads() {
        $uploadedFiles = [];
        $errors = [];

        // Check Profile Photo (Required)
        $photoField = isset($_FILES['profile_photo']) ? 'profile_photo' : (isset($_FILES['avatar']) ? 'avatar' : null);
        
        if (!$photoField) {
            $errors['profile_photo'] = ['الصورة الشخصية مطلوبة'];
        } else {
            $uploader = new FileUploader('avatars', ['jpg', 'jpeg', 'png'], 2097152);
            $result = $uploader->upload($_FILES[$photoField], 'avatar');
            if ($result['success']) {
                $uploadedFiles['avatar'] = $result['path'];
            } else {
                $errors['profile_photo'] = [$result['error']];
            }
        }

        if (!empty($errors)) {
            return ['error' => $errors];
        }

        return $uploadedFiles;
    }

    private function sanitizeInputData($data) {
        $sanitized = [];
        foreach ($data as $key => $value) {
            if ($key === 'password') {
                $sanitized[$key] = $value;
            } else if (is_array($value)) {
                $sanitized[$key] = $this->sanitizeInputData($value);
            } else {
                $sanitized[$key] = InputSanitizer::cleanXSS($value);
            }
        }
        return $sanitized;
    }
}
