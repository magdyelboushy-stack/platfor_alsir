<?php
/**
 * Debug Logger Utility
 * Writes logs to a local debug.log file for easy tracking
 */
class DebugLogger {
    private static $logFile = __DIR__ . '/debug.log';
    
    public static function log($message, $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? ' | ' . json_encode($context, JSON_UNESCAPED_UNICODE) : '';
        $logLine = "[$timestamp] $message$contextStr\n";
        
        file_put_contents(self::$logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
    
    public static function clear() {
        file_put_contents(self::$logFile, "=== Log Cleared at " . date('Y-m-d H:i:s') . " ===\n");
    }
}
