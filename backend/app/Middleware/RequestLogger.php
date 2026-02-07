<?php

namespace App\Middleware;

/**
 * Request Logger
 * Logs suspicious requests
 */
class RequestLogger {
    
    private static $logFile;
    
    public static function init() {
        $logDir = __DIR__ . '/../../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        self::$logFile = $logDir . '/security_' . date('Y-m-d') . '.log';
    }
    
    public static function logSuspicious($reason, $data = []) {
        self::init();
        
        $entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
            'reason' => $reason,
            'data' => $data
        ];
        
        file_put_contents(
            self::$logFile,
            json_encode($entry, JSON_UNESCAPED_UNICODE) . PHP_EOL,
            FILE_APPEND
        );
    }
    
    public static function logFailed($action, $identifier = null) {
        self::logSuspicious("Failed $action attempt", [
            'action' => $action,
            'identifier' => $identifier
        ]);
    }
}
