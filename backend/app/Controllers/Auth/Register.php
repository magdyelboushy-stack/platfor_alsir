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
use App\Services\TelegramService;

class Register extends BaseController {
    
    public function handle() {
        try {
            // 0. Honeypot Check
            HoneypotProtection::check();

            // 0.1 Total File Size Check
            UploadSizeValidator::validate();

            // 1. Rate Limiting (Increased for development - 100 per hour)
            $rateLimiter = new AdvancedRateLimiter();
            if (!$rateLimiter->checkAdvanced('register', $_SERVER['REMOTE_ADDR'], null, 100, 3600)) {
                $this->json([
                    'error' => 'Too many registry attempts',
                    'message' => 'Please try again in an hour'
                ], 429);
            }

            // 2. Get Data FIRST
            $data = !empty($_POST) ? $_POST : $this->getInput();
            
            // 3. CSRF Token Check (from data or header)
            $csrfToken = $data['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
            if (!CSRF::validate($csrfToken)) {
                $this->json(['error' => 'Invalid CSRF token'], 403);
            }

            // 4. Sanitize Input
            $data = $this->sanitizeInputData($data);

            // 5. Map Data
            $mappedData = [
                'name' => $data['name'] ?? $data['fullName'] ?? null,
                'email' => $data['email'] ?? null,
                'password' => $data['password'] ?? null,
                'phone' => $data['phone'] ?? null,
                'role' => 'student', // SECURITY FIX: Hardcoded - Only students can self-register
                'parent_phone' => $data['parent_phone'] ?? $data['guardianPhone'] ?? null,
                'guardian_name' => $data['guardian_name'] ?? $data['guardianName'] ?? null,
                'school_name' => $data['school_name'] ?? $data['schoolName'] ?? null,
                'grade_level' => $data['grade_level'] ?? $data['gradeLevel'] ?? null,
                'education_stage' => $data['education_stage'] ?? null,
                'governorate' => $data['governorate'] ?? null,
                'city' => $data['city'] ?? null,
                'birth_date' => $data['birth_date'] ?? $data['birthDate'] ?? null,
                'gender' => $data['gender'] ?? null,
            ];

            // 6. Validation Rules
            $rules = [
                'name' => 'required|min:3|max:100|unique:users,name',
                'email' => 'required|email|max:255|unique:users,email',
                'password' => 'required|min:8|max:128|password_strength',
                'phone' => 'required|numeric|size:11|egyptian_phone|unique:users,phone',
                'role' => 'required|in:student,teacher,parent',
                'parent_phone' => 'numeric|size:11|egyptian_phone|different:phone',
                'birth_date' => 'date',
                'gender' => 'in:male,female',
                'grade_level' => 'in:1,2,3,4,5,6,7,8,9,10,11,12',
                'education_stage' => 'required|in:primary,prep,secondary',
                'governorate' => 'required|min:2',
                'city' => 'required|min:2',
                'guardian_name' => 'max:100',
                'school_name' => 'max:200'
            ];

            // 7. Validate Data
            $validator = new Validator();
            if (!$validator->validate($mappedData, $rules)) {
                $this->json(['errors' => $validator->getErrors()], 422);
            }

            // 8. Handle File Uploads
            $uploadedFiles = $this->handleFileUploads();
            
            if (isset($uploadedFiles['error'])) {
                $this->json(['errors' => $uploadedFiles['error']], 422);
            }
            
            // 9. Persist to DB
            $userModel = new User();
            $userData = array_merge($mappedData, [
                'avatar' => $uploadedFiles['avatar'] ?? null,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);

            $userId = $userModel->create($userData);

            // 10. Notify Admin via Telegram
            $userData['id'] = $userId;
            TelegramService::notifyNewStudent($userData);

            $this->json([
                'message' => 'Registration successful',
                'user_id' => $userId,
                'status' => 'pending_verification'
            ], 201);

        } catch (\Exception $e) {
            error_log("Registration Error: " . $e->getMessage());
            $this->json([
                'error' => 'Registration failed',
                'message' => 'An unexpected error occurred'
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