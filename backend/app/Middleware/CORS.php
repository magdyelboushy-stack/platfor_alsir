<?php

namespace App\Middleware;

/**
 * CORS Middleware
 * Manages Cross-Origin Resource Sharing
 */
class CORS {
    
    public static function apply() {
        $allowedOriginsStr = $_ENV['ALLOWED_ORIGINS'] ?? '';
        $allowedOrigins = !empty($allowedOriginsStr) ? explode(',', $allowedOriginsStr) : [];
        $allowedOrigins = array_map('trim', $allowedOrigins);
        $allowedOrigins = array_filter($allowedOrigins); // Remove empty values
        
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $isProduction = ($_ENV['APP_ENV'] ?? 'production') === 'production';
        $isDevelopment = !$isProduction;
        
        // Security: Block wildcard in production
        if ($isProduction && in_array('*', $allowedOrigins)) {
            error_log("SECURITY WARNING: CORS wildcard detected in production! Blocking all origins.");
            $allowedOrigins = array_filter($allowedOrigins, function($origin) {
                return $origin !== '*';
            });
        }
        
        $allowOrigin = null;
        
        // Determine which origin to allow
        if (!empty($allowedOrigins) && in_array($origin, $allowedOrigins)) {
            // Origin is in whitelist
            $allowOrigin = $origin;
        } else if ($isDevelopment) {
            // Development mode: more permissive
            if (in_array('*', $allowedOrigins)) {
                $allowOrigin = $origin ?: '*';
            } else if (empty($allowedOrigins)) {
                // No config: allow same-origin or any origin in dev
                $allowOrigin = $origin ?: '*';
            } else if (!empty($origin)) {
                // Origin provided but not in whitelist - log but allow in dev
                error_log("CORS: Origin not in whitelist (dev mode, allowing): " . $origin);
                $allowOrigin = $origin;
            }
        } else {
            // Production: strict - only allow if in whitelist
            if (!empty($origin) && !in_array($origin, $allowedOrigins)) {
                error_log("SECURITY: CORS request from unauthorized origin: " . $origin);
            }
            // Don't set header if origin not allowed in production
        }
        
        // Set CORS headers
        if ($allowOrigin !== null) {
            header("Access-Control-Allow-Origin: " . $allowOrigin);
        }
        
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, X-CSRF-TOKEN");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 86400");
        
        // Handle OPTIONS requests (Preflight)
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
