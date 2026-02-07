<?php

namespace App\Middleware;

use App\Utils\SecureSession;
use App\Models\User;
use App\Utils\AuditLogger;

/**
 * Session Security Middleware
 * Enforces single-device login
 */
class SessionMiddleware {
    
    public static function check() {
        SecureSession::start();
        
        $userId = SecureSession::get('user_id');
        
        // DEBUG MIDDLEWARE
        // DEBUG MIDDLEWARE REMOVED FOR PRODUCTION
        
        if ($userId) {
            $userModel = new User();
            $user = $userModel->find($userId);
            
            if ($user) {
                $currentSessionId = session_id();
                $lastSessionId = $user['last_session_id'] ?? null;
                
                // If DB has a session ID and it doesn't match current one
                if ($lastSessionId && $lastSessionId !== $currentSessionId) {
                    // Log the security event
                    AuditLogger::log(
                        $userId, 
                        'session_invalidated', 
                        'users', 
                        $userId, 
                        null, 
                        ['reason' => 'Logged in from another device', 'old_session' => $currentSessionId, 'new_session' => $lastSessionId]
                    );
                    
                    // Destroy current session (Logout the old device)
                    SecureSession::destroy();
                    
                    // Return 401 with specific message
                    http_response_code(401);
                    header('Content-Type: application/json');
                    echo json_encode([
                        'error' => 'SESSION_EXPIRED',
                        'message' => 'تم تسجيل الدخول من جهاز آخر. يرجى تسجيل الدخول مرة أخرى لحماية حسابك.'
                    ]);
                    exit();
                }
            }
        }
    }
}
