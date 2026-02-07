<?php

namespace App\Utils;

/**
 * Secure Session Manager
 * Manages sessions securely
 */
class SecureSession {
    
    /**
     * Start a secure session
     * @param int $lifetime Cookie lifetime in seconds (Default: 7 days)
     */
    public static function start($lifetime = 604800) {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        
        // Session security settings
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_secure', 1); // Required for SameSite=None
        ini_set('session.cookie_samesite', 'None'); // Required for Cross-Site (Vercel -> AlwaysData)
        ini_set('session.use_strict_mode', 1);
        
        // Match GC lifetime with cookie lifetime to prevent server-side cleanup
        ini_set('session.gc_maxlifetime', $lifetime);
        ini_set('session.cookie_lifetime', $lifetime);
        
        // Change default session name
        session_name('APP_SESSION');
        
        // Use Database Session Handler
        $handler = new DatabaseSessionHandler();
        session_set_save_handler($handler, true);
        
        session_start();
        
        // Validate session
        self::validateSession();
    }
    
    /**
     * Validate session integrity
     */
    private static function validateSession() {
// ✅ SECURITY FIX: Smart IP validation - detects changes but allows mobile users
        // (mobile data has dynamic IPs but we track and alert on suspicious patterns)
        if (!isset($_SESSION['ip_address'])) {
            $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
            $_SESSION['ip_change_count'] = 0;
        } else if ($_SESSION['ip_address'] !== $_SERVER['REMOTE_ADDR']) {
            // IP changed - increment counter
            $_SESSION['ip_change_count'] = ($_SESSION['ip_change_count'] ?? 0) + 1;
            
            // Alert if many IP changes (sign of account compromise)
            if ($_SESSION['ip_change_count'] > 3) {
                $userId = $_SESSION['user_id'] ?? null;
                if ($userId) {
                    @\App\Utils\AuditLogger::log(
                        $userId,
                        'multiple_ip_changes',
                        'sessions',
                        null,
                        null,
                        ['ips_count' => $_SESSION['ip_change_count']]
                    );
                }
            }
            
            // Update to current IP
            $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
        }
        
        // Check User Agent
        if (!isset($_SESSION['user_agent'])) {
            $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
        } else if ($_SESSION['user_agent'] !== ($_SERVER['HTTP_USER_AGENT'] ?? '')) {
            self::destroy();
            return;
        }
        
        // Regenerate session ID every 30 minutes
        if (!isset($_SESSION['last_regeneration'])) {
            $_SESSION['last_regeneration'] = time();
        } else if (time() - $_SESSION['last_regeneration'] > 1800) {
            self::regenerate();
        }
    }
    
    /**
     * Regenerate session ID
     */
    public static function regenerate() {
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    }
    
    /**
     * Destroy session
     */
    public static function destroy() {
        $_SESSION = [];
        
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        session_destroy();
    }
    
    /**
     * Set session value
     */
    public static function set($key, $value) {
        self::start();
        $_SESSION[$key] = $value;
    }
    
    /**
     * Get session value
     */
    public static function get($key, $default = null) {
        self::start();
        return $_SESSION[$key] ?? $default;
    }
    
    /**
     * Remove session value
     */
    public static function remove($key) {
        self::start();
        unset($_SESSION[$key]);
    }
}
