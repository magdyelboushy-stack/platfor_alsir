<?php

namespace App\Controllers\Auth;

use App\Core\BaseController;
use App\Models\User;
use App\Services\MultiAuthService;
use App\Utils\AdvancedRateLimiter;
use App\Utils\CSRF;
use App\Utils\HoneypotProtection;
use App\Utils\SecureSession;
use App\Utils\AuditLogger;
use App\Utils\SqlRateLimiter;

class Login extends BaseController {
    
    public function handle() {
        try {
            // 0. Honeypot Check (Bot Protection)
            HoneypotProtection::check();

            // 1. Secure Session Start (Database backed)
            SecureSession::start();

            // 2. Get Data FIRST to handle JSON
            $data = !empty($_POST) ? $_POST : $this->getInput();
            
            // 3. CSRF Token Check (from Post, JSON data, or Header)
            $csrfToken = $data['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
            if (!CSRF::validate($csrfToken)) {
                $this->json(['error' => 'فشل التحقق الأمني. يرجى تحديث الصفحة والمحاولة مرة أخرى.'], 403);
            }

            $identifier = $data['email'] ?? $data['phone'] ?? $data['identifier'] ?? '';
            $password = $data['password'] ?? '';
            
            if (!$identifier || !$password) {
                $this->json(['error' => 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور'], 400);
            }
            
            // 3. SQL Rate Limiting
            $limiter = new SqlRateLimiter();
            if (!$limiter->check($identifier)) {
                $this->json([
                    'error' => 'تم حظر الحساب مؤقتاً بسبب تكرار المحاولات الخاطئة. حاول بعد 15 دقيقة.'
                ], 429);
            }

            // 4. Multi-table Authentication
            $role = $data['role'] ?? null;
            
            if ($role && in_array($role, ['admin', 'teacher', 'assistant', 'student'])) {
                // Specific login page
                $user = MultiAuthService::attemptSpecific($identifier, $password, $role);
            } else {
                // Generic login (fallback)
                $user = MultiAuthService::attempt($identifier, $password);
            }

            // 5. Verify authentication
            if ($user) {
                // Check Account Status
                if ($user['status'] !== 'active') {
                    $message = $user['status'] === 'pending' 
                        ? 'حسابك تحت المراجعة. سيتم إشعارك فور الموافقة عليه.' 
                        : 'حسابك غير مفعّل. يرجى التواصل مع الإدارة.';
                    $this->json(['error' => $message, 'code' => 'ACCOUNT_INACTIVE'], 403);
                }

                // Check Email Verification for students
                if ($user['role'] === 'student' && empty($user['is_sms_verified'])) {
                    $this->json([
                        'error' => 'يرجى إتمام عملية التحقق عبر البريد الإلكتروني لتفعيل الحساب.',
                        'code' => 'EMAIL_VERIFICATION_REQUIRED',
                        'email' => $user['email']
                    ], 403);
                }
                
                // Clear Rate Limit
                $limiter->clear($identifier);

                // ✅ SECURITY FIX: Session Fixation Prevention
                SecureSession::start(0);
                SecureSession::regenerate();
                
                $remember = !empty($data['remember_me']);
                $lifetime = $remember ? 2592000 : 0; // 30 days or session
                
                SecureSession::start($lifetime);
                SecureSession::regenerate();
                $newSessionId = session_id();
                
                // Store session data
                SecureSession::set('user_id', $user['id']);
                SecureSession::set('role', $user['role']);
                SecureSession::set('login_time', time());
                
                // Role-specific session data
                if ($user['role'] === 'assistant') {
                    SecureSession::set('permissions', $user['permissions'] ?? []);
                    SecureSession::set('teacher_id', $user['teacher_id'] ?? null);
                }
                
                if ($user['role'] === 'student') {
                    SecureSession::set('grade_level', $user['grade_level'] ?? null);
                    SecureSession::set('education_stage', $user['education_stage'] ?? null);
                }
                
                if ($user['role'] === 'teacher') {
                    SecureSession::set('subject', $user['subject'] ?? null);
                    SecureSession::set('grade_levels', $user['grade_levels'] ?? []);
                }

                // Audit Logging
                AuditLogger::log(
                    $user['id'], 
                    'login', 
                    $user['role'] . 's', 
                    $user['id'], 
                    null, 
                    ['ip' => $_SERVER['REMOTE_ADDR'], 'device' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown']
                );
                
                // Determine redirect based on role
                $redirect = match($user['role']) {
                    'admin' => '/admin/dashboard',
                    'teacher' => '/teacher/dashboard',
                    'assistant' => '/assistant/dashboard',
                    default => '/dashboard'
                };
                
                $this->json([
                    'message' => 'Login successful',
                    'user' => $user,
                    'redirect' => $redirect
                ]);
                
            } else {
                // Failed -> Record Attempt
                $limiter->hit($identifier, $_SERVER['HTTP_USER_AGENT'] ?? '');
                $this->json(['error' => 'البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة'], 401);
            }
        } catch (\Exception $e) {
             error_log("Login Error: " . $e->getMessage());
             $this->json(['error' => 'Server Error', 'message' => 'An unexpected error occurred'], 500);
        }
    }
}

