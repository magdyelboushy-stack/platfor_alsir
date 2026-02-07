<?php

namespace App\Utils;

/**
 * File Scanner
 * Scans files for malware and cleans EXIF data
 */
class FileScanner {
    
    /**
     * Scan file for malware
     */
    public static function scanForMalware($filePath) {
        // Method 1: Use ClamAV (requires installation)
        if (self::isClamAvailable()) {
            return self::scanWithClamAV($filePath);
        }
        
        // Method 2: Manual scan for malicious codes
        return self::manualScan($filePath);
    }
    
    /**
     * Scan using ClamAV
     */
    private static function scanWithClamAV($filePath) {
        $output = [];
        $returnVar = 0;
        
        // Ensure strictly safe path escaping
        exec("clamscan --no-summary " . escapeshellarg($filePath), $output, $returnVar);
        
        // returnVar = 0 means clean
        // returnVar = 1 means virus detected
        if ($returnVar === 1) {
            error_log("Malware detected in file: " . $filePath);
            return false;
        }
        
        return true;
    }
    
    /**
     * Manual scan for malicious patterns
     */
    private static function manualScan($filePath) {
        // Limit file size read to avoid memory issues on huge files
        $content = file_get_contents($filePath, false, null, 0, 1048576); // First 1MB
        
        // Common malicious patterns
        $maliciousPatterns = [
            '/<\?php.*eval\s*\(/is',
            '/base64_decode\s*\(/i',
            '/exec\s*\(/i',
            '/shell_exec\s*\(/i',
            '/system\s*\(/i',
            '/passthru\s*\(/i',
            '/proc_open\s*\(/i',
            '/popen\s*\(/i',
            '/curl_exec\s*\(/i',
            '/curl_multi_exec\s*\(/i',
            '/parse_ini_file\s*\(/i',
            '/show_source\s*\(/i',
            '/\$_FILES.*move_uploaded_file/i',
            '/assert\s*\(/i',
            '/create_function\s*\(/i',
            '/pcntl_exec\s*\(/i',
        ];
        
        foreach ($maliciousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                error_log("Suspicious pattern detected in file: " . $filePath);
                return false;
            }
        }
        
        // Additional check for PHP tags in images
        if (preg_match('/\.(jpg|jpeg|png|gif)$/i', $filePath)) {
            if (preg_match('/<\?php/i', $content)) {
                error_log("PHP code detected in image file: " . $filePath);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check ClamAV availability
     */
    private static function isClamAvailable() {
        $output = [];
        $returnVar = 0;
        
        // Windows/Linux compatibility check
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Check if clamscan is in path
            exec("where clamscan", $output, $returnVar);
        } else {
            exec("which clamscan", $output, $returnVar);
        }
        
        return $returnVar === 0;
    }
    
    /**
     * Sanitize Image EXIF data
     */
    public static function sanitizeImageExif($imagePath) {
        if (!function_exists('exif_read_data')) {
            return true;
        }
        
        $imageInfo = @getimagesize($imagePath);
        if (!$imageInfo) {
            return false;
        }
        
        // Re-create image to strip EXIF
        list($width, $height, $type) = $imageInfo;
        
        $source = null;
        switch ($type) {
            case IMAGETYPE_JPEG:
                $source = imagecreatefromjpeg($imagePath);
                if ($source) imagejpeg($source, $imagePath, 90);
                break;
            case IMAGETYPE_PNG:
                $source = imagecreatefrompng($imagePath);
                if ($source) imagepng($source, $imagePath, 9);
                break;
            case IMAGETYPE_GIF:
                $source = imagecreatefromgif($imagePath);
                if ($source) imagegif($source, $imagePath);
                break;
        }
        
        if (isset($source) && $source) {
            imagedestroy($source);
        }
        
        return true;
    }
}
