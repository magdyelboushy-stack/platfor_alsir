<?php

namespace App\Middleware;

/**
 * Input Validation Middleware
 * Validates inputs before processing
 */
class InputValidation {
    
    public static function validate() {
        // Check payload size
        $maxPostSize = self::parseSize(ini_get('post_max_size'));
        $contentLength = $_SERVER['CONTENT_LENGTH'] ?? 0;
        
        if ($contentLength > $maxPostSize) {
            http_response_code(413);
            echo json_encode(['error' => 'Payload too large']);
            exit();
        }
        
        // Check Request Method
        $allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
        if (!in_array($_SERVER['REQUEST_METHOD'], $allowedMethods)) {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            exit();
        }
        
        // Check Content-Type for POST/PUT
        if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            $allowedTypes = [
                'application/json',
                'multipart/form-data',
                'application/x-www-form-urlencoded'
            ];
            
            $isAllowed = false;
            foreach ($allowedTypes as $type) {
                if (strpos($contentType, $type) !== false) {
                    $isAllowed = true;
                    break;
                }
            }
            
            if (!$isAllowed && !empty($contentType)) {
                http_response_code(415);
                echo json_encode(['error' => 'Unsupported Media Type']);
                exit();
            }
        }
    }
    
    private static function parseSize($size) {
        $unit = strtoupper(substr($size, -1));
        $value = (int) $size;
        
        switch ($unit) {
            case 'G':
                $value *= 1024;
            case 'M':
                $value *= 1024;
            case 'K':
                $value *= 1024;
        }
        
        return $value;
    }
}
