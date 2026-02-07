<?php

namespace App\Utils;

/**
 * CSRF Protection
 * Prevents Cross-Site Request Forgery
 */
class CSRF {
    private const TOKEN_LENGTH = 32;
    private const SESSION_KEY = 'csrf_token';
    
    /**
     * Generate new CSRF Token
     */
    public static function generate() {
        \App\Utils\SecureSession::start();
        
        $token = bin2hex(random_bytes(self::TOKEN_LENGTH));
        $_SESSION[self::SESSION_KEY] = $token;
        
        return $token;
    }
    
    /**
     * Get current Token
     */
    public static function get() {
        \App\Utils\SecureSession::start();
        
        if (!isset($_SESSION[self::SESSION_KEY])) {
            return self::generate();
        }
        
        return $_SESSION[self::SESSION_KEY];
    }
    
    /**
     * Validate Token
     */
    public static function validate($token) {
        \App\Utils\SecureSession::start();
        
        $storedToken = $_SESSION[self::SESSION_KEY] ?? null;
        
        if (!$storedToken) {
            self::logFailure('MISSING_SESSION_TOKEN', $token, null);
            return false;
        }

        if (!$token) {
            self::logFailure('MISSING_INPUT_TOKEN', null, $storedToken);
            return false;
        }
        
        $isValid = hash_equals($storedToken, $token);
        
        if (!$isValid) {
            self::logFailure('TOKEN_MISMATCH', $token, $storedToken);
        }
        
        return $isValid;
    }

    /**
     * Log CSRF failure for debugging
     */
    private static function logFailure($reason, $received, $stored) {
        $logFile = __DIR__ . '/../../../logs/csrf_debug.log';
        $logDir = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $data = [
            'timestamp' => date('Y-m-d H:i:s'),
            'reason' => $reason,
            'session_id' => session_id(),
            'received_token' => $received,
            'stored_token' => $stored,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
        ];

        file_put_contents($logFile, json_encode($data) . PHP_EOL, FILE_APPEND);
    }
    
    /**
     * Generate HTML input field
     */
    public static function field() {
        $token = self::get();
        return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($token) . '">';
    }
    
    /**
     * Generate meta tag
     */
    public static function metaTag() {
        $token = self::get();
        return '<meta name="csrf-token" content="' . htmlspecialchars($token) . '">';
    }
}
