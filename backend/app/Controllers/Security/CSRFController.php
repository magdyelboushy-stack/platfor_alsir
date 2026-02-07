<?php

namespace App\Controllers\Security;

use App\Core\BaseController;
use App\Utils\CSRF;
use App\Utils\SecureSession;

class CSRFController extends BaseController {
    
    /**
     * Get a fresh CSRF token
     * GET /api/csrf-token
     */
    public function getToken() {
        // Ensure session is started
        SecureSession::start();
        
        // Generate or get existing token
        $token = CSRF::get();
        
        $this->json([
            'csrf_token' => $token,
            'message' => 'Include this token in your POST request body as csrf_token or in X-CSRF-Token header',
            'session_id' => session_id()
        ]);
    }
}
