<?php

namespace App\Utils;

/**
 * Upload Size Validator
 * Validates total upload size for all files
 */
class UploadSizeValidator {
    
    private const MAX_TOTAL_SIZE = 10485760; // 10MB
    
    /**
     * Validate Total File Size
     */
    public static function validate() {
        $totalSize = 0;
        
        foreach ($_FILES as $file) {
            if (is_array($file['size'])) {
                // Multiple files
                foreach ($file['size'] as $size) {
                    $totalSize += $size;
                }
            } else {
                $totalSize += $file['size'];
            }
        }
        
        if ($totalSize > self::MAX_TOTAL_SIZE) {
            http_response_code(413);
            echo json_encode([
                'error' => 'Total file size too large',
                'max_size' => self::MAX_TOTAL_SIZE / 1024 / 1024 . ' MB'
            ]);
            exit();
        }
        
        return true;
    }
}
