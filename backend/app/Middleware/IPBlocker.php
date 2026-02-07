<?php

namespace App\Middleware;

use App\Middleware\RequestLogger;

/**
 * IP Blocker
 * Blocks suspicious IPs
 */
class IPBlocker {
    
    private static $blockedIPs = [];
    private static $blockFile;
    
    public static function init() {
        $blockDir = __DIR__ . '/../../storage/security';
        if (!is_dir($blockDir)) {
            mkdir($blockDir, 0755, true);
        }
        self::$blockFile = $blockDir . '/blocked_ips.json';
        
        if (file_exists(self::$blockFile)) {
            self::$blockedIPs = json_decode(file_get_contents(self::$blockFile), true) ?? [];
        }
    }
    
    public static function check() {
        self::init();
        
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        
        if (isset(self::$blockedIPs[$ip])) {
            $blockInfo = self::$blockedIPs[$ip];
            
            // If block is temporary and expired
            if (isset($blockInfo['expires']) && time() > $blockInfo['expires']) {
                self::unblock($ip);
                return true;
            }
            
            http_response_code(403);
            echo json_encode([
                'error' => 'Your IP address has been blocked',
                'reason' => $blockInfo['reason'] ?? 'Suspicious activity'
            ]);
            exit();
        }
        
        return true;
    }
    
    public static function block($ip, $reason = 'Suspicious activity', $duration = 3600) {
        self::init();
        
        self::$blockedIPs[$ip] = [
            'reason' => $reason,
            'blocked_at' => time(),
            'expires' => $duration ? time() + $duration : null
        ];
        
        file_put_contents(self::$blockFile, json_encode(self::$blockedIPs, JSON_PRETTY_PRINT));
        
        RequestLogger::logSuspicious("IP blocked: $ip", ['reason' => $reason]);
    }
    
    public static function unblock($ip) {
        self::init();
        
        unset(self::$blockedIPs[$ip]);
        file_put_contents(self::$blockFile, json_encode(self::$blockedIPs, JSON_PRETTY_PRINT));
    }
}
