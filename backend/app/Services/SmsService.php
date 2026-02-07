<?php

namespace App\Services;

class SmsService {
    /**
     * Mock function to send SMS.
     * Logs the message to a file instead of sending a real SMS.
     * 
     * @param string $phone
     * @param string $message
     * @return bool
     */
    public static function send($phone, $message) {
        $logDir = __DIR__ . '/../../storage/logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
        
        $logFile = $logDir . '/sms.log';
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] TO: $phone | MESSAGE: $message" . PHP_EOL;
        
        return file_put_contents($logFile, $logEntry, FILE_APPEND) !== false;
    }

    /**
     * Generate a numeric verification code
     * 
     * @param int $length
     * @return string
     */
    public static function generateCode($length = 6) {
        $characters = '0123456789';
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $code;
    }
}
