<?php

namespace App\Middleware;

/**
 * XSS Protection Middleware
 * Protection against Cross-Site Scripting
 */
class XSSProtection {
    
    public static function clean($data) {
        if (is_array($data)) {
            return array_map([self::class, 'clean'], $data);
        }
        
        if (!is_string($data)) {
            return $data;
        }
        
        // strip tags
        $data = strip_tags($data);
        
        // Convert HTML entities
        $data = htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Remove null bytes
        $data = str_replace(chr(0), '', $data);
        
        // Remove hidden JS codes
        $data = preg_replace('/javascript:/i', '', $data);
        $data = preg_replace('/on\w+\s*=/i', '', $data);
        
        return $data;
    }
    
    public static function validate($data) {
        $dangerous = [
            '<script',
            'javascript:',
            'onerror=',
            'onload=',
            '<iframe',
            '<object',
            '<embed',
            'eval(',
            'expression(',
        ];
        
        $dataStr = is_array($data) ? json_encode($data) : (string)$data;
        
        foreach ($dangerous as $pattern) {
            if (stripos($dataStr, $pattern) !== false) {
                error_log("Potential XSS detected: " . $dataStr);
                return false;
            }
        }
        
        return true;
    }
}
