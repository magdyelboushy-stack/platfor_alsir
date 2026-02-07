<?php

namespace App\Utils;

/**
 * Honeypot Protection
 * Anti-Bot Protection
 */
class HoneypotProtection {
    
    /**
     * Check Honeypot field
     */
    public static function check($fieldName = 'website') {
        $value = $_POST[$fieldName] ?? $_GET[$fieldName] ?? null;
        
        if (!empty($value)) {
            // It's a bot!
            if (class_exists('\App\Middleware\RequestLogger')) {
                \App\Middleware\RequestLogger::logSuspicious(
                    "Bot detected via honeypot",
                    ['field' => $fieldName, 'value' => $value]
                );
            }
            
            // Block IP
            if (class_exists('\App\Middleware\IPBlocker')) {
                \App\Middleware\IPBlocker::block(
                    $_SERVER['REMOTE_ADDR'], 
                    "Bot activity detected",
                    86400 // 24 hours
                );
            }
            
            http_response_code(403);
            echo json_encode(['error' => 'Invalid request']);
            exit();
        }
        
        return true;
    }
    
    /**
     * Generate HTML for honeypot field
     */
    public static function field($fieldName = 'website') {
        return '<input type="text" 
                       name="' . htmlspecialchars($fieldName) . '" 
                       value="" 
                       style="display:none !important; position: absolute; left: -9999px;" 
                       tabindex="-1" 
                       autocomplete="off"
                       aria-hidden="true">';
    }
}
