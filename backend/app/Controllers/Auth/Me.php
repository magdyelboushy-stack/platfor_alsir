<?php

namespace App\Controllers\Auth;

use App\Core\BaseController;
use App\Models\User;
use App\Services\MultiAuthService;
use App\Utils\SecureSession;

class Me extends BaseController {
    
    public function handle() {
        try {
            SecureSession::start();
            $userId = SecureSession::get('user_id');
            $role = SecureSession::get('role') ?? 'student';
            
            if (!$userId) {
                $this->json(['error' => 'Unauthenticated'], 401);
            }

            $user = MultiAuthService::getUserByIdAndRole($userId, $role);

            if (!$user) {
                // If user not found in the expected table, try to find in users table as fallback
                // This handles cases where session might have stale role data
                if ($role !== 'student') {
                    $user = MultiAuthService::getUserByIdAndRole($userId, 'student');
                }
                
                if (!$user) {
                    $this->json(['error' => 'User not found'], 404);
                }
            }

            $this->json(['user' => $user]);
            
        } catch (\Exception $e) {
            error_log("Me Error: " . $e->getMessage());
            $this->json(['error' => 'Server Error'], 500);
        }
    }
}
