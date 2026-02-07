<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Utils\SecureSession;
use App\Utils\FileUploader;

class CourseUploadController extends BaseController {
    
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    private $maxSize = 5 * 1024 * 1024; // 5MB
    private $uploadDir;

    public function __construct() {
        // Correct path to backend/storage
    }

    /**
     * Check authorization
     */
    private function authorize() {
        SecureSession::start();
        $role = SecureSession::get('role');
        if (!in_array($role, ['admin', 'teacher', 'assistant'])) {
            $this->json(['error' => 'غير مصرح'], 403);
            exit;
        }

        // PERMISSION CHECK
        if (!\App\Services\EnrollmentSecurityService::hasPermission('files:upload')) {
             $this->json(['error' => 'ليس لديك صلاحية رفع الملفات'], 403);
             exit;
        }
    }

    /**
     * Upload course thumbnail
     */
    public function uploadThumbnail() {
        $this->authorize();

        if (!isset($_FILES['thumbnail'])) {
            return $this->json(['error' => 'لم يتم رفع ملف'], 400);
        }

        $uploader = new FileUploader('thumbnails', ['jpg', 'jpeg', 'png', 'webp'], 5242880);
        $result = $uploader->upload($_FILES['thumbnail'], 'course_thumb');

        if (!$result['success']) {
            return $this->json(['error' => $result['error']], 400);
        }

        // Return the path as registered in the DB
        return $this->json([
            'message' => 'تم رفع الصورة بنجاح',
            'url' => '/api/files/thumbnails/' . $result['filename']
        ]);
    }
}
