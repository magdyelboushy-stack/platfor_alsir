<?php

namespace App\Middleware;

/**
 * Security Headers Middleware
 * Adds security headers
 */
class SecurityHeaders {
    
    public static function apply() {
        // Prevent XSS
        header("X-XSS-Protection: 1; mode=block");
        
        // Prevent Clickjacking
        header("X-Frame-Options: SAMEORIGIN");
        
        // Prevent MIME Type Sniffing
        header("X-Content-Type-Options: nosniff");
        
        // Content Security Policy (CSP)
        $isLocal = !isset($_ENV['APP_ENV']) || $_ENV['APP_ENV'] === 'local';
        $allowedOrigins = $_ENV['ALLOWED_ORIGINS'] ?? '';
        $extraOrigins = str_replace(',', ' ', $allowedOrigins);

        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: " . $extraOrigins,
            "connect-src 'self' " . $extraOrigins,
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'"
        ]);
        header("Content-Security-Policy: " . $csp);
        
        // Referrer Policy
        header("Referrer-Policy: strict-origin-when-cross-origin");
        
        // Permissions Policy
        header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
        
        // HTTPS Enforcement (in Production)
        if (isset($_ENV['APP_ENV']) && $_ENV['APP_ENV'] === 'production') {
            header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
        }
    }
}
