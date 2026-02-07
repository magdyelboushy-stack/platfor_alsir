<?php

namespace App\Utils;

/**
 * Input Sanitizer
 * Cleans inputs from malicious code
 */
class InputSanitizer {
    
    /**
     * Clean XSS
     */
    public static function cleanXSS($data) {
        if (is_array($data)) {
            return array_map([self::class, 'cleanXSS'], $data);
        }
        
        if (is_null($data)) {
            return null;
        }

        // Remove null bytes
        $data = str_replace(chr(0), '', $data);
        
        // Convert HTML entities
        $data = htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        return $data;
    }
    
    /**
     * Clean SQL Injection
     */
    public static function cleanSQL($data, $pdo) {
        if (is_array($data)) {
            return array_map(function($item) use ($pdo) {
                return self::cleanSQL($item, $pdo);
            }, $data);
        }
        
        return $pdo->quote($data);
    }
    
    /**
     * Clean Filenames
     */
    public static function cleanFilename($filename) {
        // Remove paths
        $filename = basename($filename);
        
        // Remove special characters
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
        
        // Prevent hidden files
        $filename = ltrim($filename, '.');
        
        return $filename ?: 'file';
    }
    
    /**
     * Clean URLs
     */
    public static function cleanURL($url) {
        $url = filter_var($url, FILTER_SANITIZE_URL);
        
        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            return null;
        }
        
        return $url;
    }
}
