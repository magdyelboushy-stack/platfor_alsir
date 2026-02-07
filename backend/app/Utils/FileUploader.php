<?php

namespace App\Utils;

use Cloudinary\Configuration\Configuration;
use Cloudinary\Api\Upload\UploadApi;

class FileUploader {
    private $targetDir;
    private $allowedTypes;
    private $allowedMimeTypes;
    private $maxSize;
    private $storageDriver;
    private $subDir;

    // Allowed MIME types per extension
    private const MIME_TYPES = [
        'jpg' => ['image/jpeg', 'image/pjpeg'],
        'jpeg' => ['image/jpeg', 'image/pjpeg'],
        'png' => ['image/png'],
        'pdf' => ['application/pdf'],
        'gif' => ['image/gif'],
        // Added WebP support to match controllers usage
        'webp' => ['image/webp'],
        // Added MP4 video support to match teacher upload UI
        'mp4' => ['video/mp4'],
        // Added Banner support (standard images)
        'banner' => ['image/jpeg', 'image/png', 'image/webp'],
    ];

    public function __construct($subDir = 'uploads', $allowedTypes = ['jpg', 'jpeg', 'png', 'pdf'], $maxSize = 5242880) {
        // Sanitize directory name to prevent Path Traversal
        $subDir = $this->sanitizeDirectoryName($subDir);
        $this->subDir = $subDir;
        // Prefer getenv with fallback to $_ENV
        $driverEnv = getenv('FILESYSTEM_DRIVER') ?: ($_ENV['FILESYSTEM_DRIVER'] ?? null);
        $this->storageDriver = strtolower($driverEnv ?: 'local');
        
        // Resolve max size from env if available
        $envMaxSize = isset($_ENV['MAX_UPLOAD_SIZE']) ? (int) $_ENV['MAX_UPLOAD_SIZE'] : null;
        if ($envMaxSize && $envMaxSize > 0) {
            $this->maxSize = $envMaxSize;
        } else {
            $this->maxSize = $maxSize;
        }

        $this->allowedTypes = array_map('strtolower', $allowedTypes);

        // Build base storage path using .env UPLOAD_PATH if set; fallback to backend/storage
        $projectRoot = realpath(__DIR__ . '/../../');
        $uploadPathEnv = isset($_ENV['UPLOAD_PATH']) ? trim((string) $_ENV['UPLOAD_PATH']) : '';
        if ($uploadPathEnv !== '') {
            // Clean input
            $clean = str_replace(["..", "\0"], '', $uploadPathEnv);
            $clean = str_replace(['\\'], '/', $clean);
            // If path is absolute (Windows drive or Unix root), use as is relative to project root
            if (preg_match('/^[A-Za-z]:\\\\|^\//', $uploadPathEnv)) {
                $basePath = $uploadPathEnv;
                // Normalize separators for Windows/Unix
                $basePath = rtrim(str_replace(['\\'], DIRECTORY_SEPARATOR, $basePath), DIRECTORY_SEPARATOR);
                if (!preg_match('/^[A-Za-z]:\\\\|^\//', $basePath)) {
                    // If still not absolute, join with project root
                    $basePath = $projectRoot . DIRECTORY_SEPARATOR . ltrim($clean, '/');
                }
            } else {
                // Relative path inside backend project
                $basePath = $projectRoot . DIRECTORY_SEPARATOR . ltrim($clean, '/');
            }
            $this->targetDir = $basePath . DIRECTORY_SEPARATOR . $subDir;
        } else {
            // Secure Storage Path (Outside Public Root)
            $this->targetDir = $projectRoot . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . $subDir;
        }

        // Build allowed MIME types list
        $this->allowedMimeTypes = [];
        foreach ($this->allowedTypes as $type) {
            if (isset(self::MIME_TYPES[$type])) {
                $this->allowedMimeTypes = array_merge(
                    $this->allowedMimeTypes, 
                    self::MIME_TYPES[$type]
                );
            }
        }

        if ($this->storageDriver !== 'cloudinary' && !is_dir($this->targetDir)) {
            mkdir($this->targetDir, 0755, true); // 0755 instead of 0777 for security
        }
    }

    public function upload($file, $filenamePrefix = '') {
        // 1. Check if file exists and no upload error
        if (!isset($file['name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'File upload error'];
        }

        // 2. Check file size
        if ($file['size'] > $this->maxSize) {
            return [
                'success' => false, 
                'error' => "File size too large. Max: " . ($this->maxSize / 1024 / 1024) . "MB"
            ];
        }

        // 3. Check actual file size
        if (filesize($file['tmp_name']) > $this->maxSize) {
            return ['success' => false, 'error' => 'Actual file size exceeds limit'];
        }

        // 4. Check extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedTypes)) {
            return [
                'success' => false, 
                'error' => "File type not allowed. Allowed: " . implode(', ', $this->allowedTypes)
            ];
        }

        // 5. Check true MIME Type (from file content)
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $this->allowedMimeTypes)) {
            return [
                'success' => false, 
                'error' => 'Invalid file content (MIME type mismatch)'
            ];
        }

        // 6. Additional check for images
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            $imageInfo = @getimagesize($file['tmp_name']);
            if ($imageInfo === false) {
                return ['success' => false, 'error' => 'File is not a valid image'];
            }

            // Check dimensions (DoS protection)
            list($width, $height) = $imageInfo;
            if ($width > 4096 || $height > 4096) {
                return ['success' => false, 'error' => 'Image dimensions too large (Max 4096x4096)'];
            }
            if ($width < 50 || $height < 50) {
                return ['success' => false, 'error' => 'Image dimensions too small'];
            }
        }

        // 7. Generate safe unique filename/public id
        $filenamePrefix = $this->sanitizeFilename($filenamePrefix);
        $randomString = bin2hex(random_bytes(16)); // Better than uniqid
        $filename = $filenamePrefix . '_' . $randomString . '.' . $extension;

        // If Cloudinary driver is enabled, upload to Cloudinary
        if ($this->storageDriver === 'cloudinary') {
            try {
                $cloudName = getenv('CLOUDINARY_CLOUD_NAME') ?: ($_ENV['CLOUDINARY_CLOUD_NAME'] ?? '');
                $apiKey = getenv('CLOUDINARY_API_KEY') ?: ($_ENV['CLOUDINARY_API_KEY'] ?? '');
                $apiSecret = getenv('CLOUDINARY_API_SECRET') ?: ($_ENV['CLOUDINARY_API_SECRET'] ?? '');

                if (!$cloudName || !$apiKey || !$apiSecret) {
                    return ['success' => false, 'error' => 'Cloudinary credentials are not configured'];
                }

                $config = Configuration::instance([
                    'cloud' => [
                        'cloud_name' => $cloudName,
                        'api_key' => $apiKey,
                        'api_secret' => $apiSecret,
                    ],
                    'url' => ['secure' => true],
                ]);

                $uploadApi = new UploadApi($config);
                $folder = getenv('CLOUDINARY_UPLOAD_FOLDER') ?: ($_ENV['CLOUDINARY_UPLOAD_FOLDER'] ?? $this->subDir);
                $options = [
                    'folder' => $folder,
                    'resource_type' => 'auto',
                    'public_id' => $filenamePrefix . '_' . substr($randomString, 0, 12),
                    'use_filename' => false,
                    'unique_filename' => true,
                ];

                $result = $uploadApi->upload($file['tmp_name'], $options);
                $url = $result['secure_url'] ?? ($result['url'] ?? null);
                if (!$url) {
                    return ['success' => false, 'error' => 'Cloudinary upload did not return a URL'];
                }

                return [
                    'success' => true,
                    'path' => $url,
                    'filename' => ($result['public_id'] ?? $filenamePrefix) . (isset($result['format']) ? ('.' . $result['format']) : ''),
                    'size' => $result['bytes'] ?? $file['size'],
                    'mime_type' => $mimeType,
                    'provider' => 'cloudinary',
                    'public_id' => $result['public_id'] ?? null,
                    'resource_type' => $result['resource_type'] ?? null,
                ];
            } catch (\Exception $e) {
                return ['success' => false, 'error' => 'Cloud upload failed: ' . $e->getMessage()];
            }
        }

        // 8. Local storage path (Path Traversal Protection)
        $targetPath = $this->targetDir . DIRECTORY_SEPARATOR . $filename;
        $realTargetPath = realpath(dirname($targetPath));
        $realTargetDir = realpath($this->targetDir);

        if ($realTargetPath !== $realTargetDir) {
            return ['success' => false, 'error' => 'Invalid upload path'];
        }

        // Symlink Protection
        if (is_link($targetPath)) {
            return ['success' => false, 'error' => 'Symlinks not allowed'];
        }

        // 9. Move file (Local)
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            // 10. Set secure permissions
            chmod($targetPath, 0644); // Read-only for others

            // 11. Return relative path
            $relativePath = basename($this->targetDir) . '/' . $filename;
            
            return [
                'success' => true, 
                'path' => $relativePath,
                'filename' => $filename,
                'size' => $file['size'],
                'mime_type' => $mimeType,
                'provider' => 'local',
            ];
        }

        return ['success' => false, 'error' => 'Failed to move uploaded file'];
    }

    /**
     * Sanitize directory name to prevent Path Traversal
     */
    private function sanitizeDirectoryName($dir) {
        $dir = str_replace(['..', '/', '\\', "\0"], '', $dir);
        $dir = preg_replace('/[^a-zA-Z0-9_-]/', '', $dir);
        return $dir ?: 'uploads';
    }

    /**
     * Sanitize filename prefix
     */
    private function sanitizeFilename($filename) {
        $filename = preg_replace('/[^a-zA-Z0-9_-]/', '', $filename);
        return substr($filename, 0, 50); // Limit length
    }

    /**
     * Delete file securely
     */
    public function delete($relativePath) {
        // If cloudinary, attempt to delete by public_id when available
        if ($this->storageDriver === 'cloudinary') {
            try {
                $publicId = pathinfo($relativePath, PATHINFO_FILENAME);
                if ($publicId) {
                    $config = Configuration::instance([
                        'cloud' => [
                            'cloud_name' => $_ENV['CLOUDINARY_CLOUD_NAME'] ?? '',
                            'api_key' => $_ENV['CLOUDINARY_API_KEY'] ?? '',
                            'api_secret' => $_ENV['CLOUDINARY_API_SECRET'] ?? '',
                        ],
                        'url' => ['secure' => true],
                    ]);
                    $uploadApi = new UploadApi($config);
                    $uploadApi->destroy($publicId, ['resource_type' => 'auto']);
                    return true;
                }
            } catch (\Exception $e) {
                // fall through to false
            }
            return false;
        }

        $fullPath = $this->targetDir . DIRECTORY_SEPARATOR . basename($relativePath);
        
        // Verify file is within allowed directory
        $realPath = realpath($fullPath);
        $realDir = realpath($this->targetDir);
        
        if ($realPath && strpos($realPath, $realDir) === 0 && is_file($realPath)) {
            return unlink($realPath);
        }
        
        return false;
    }
}