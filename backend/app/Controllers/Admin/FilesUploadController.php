<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Config\Database;
use App\Utils\SecureSession;
use App\Services\EnrollmentSecurityService;
use PDO;

/**
 * Admin Files Upload Controller
 * 
 * Manages file uploads for admin (PDFs, images, etc.)
 */
class FilesUploadController extends BaseController
{
    private ?PDO $db = null;
    private string $uploadDir;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->uploadDir = dirname(__DIR__, 3) . '/public/uploads/files/';
        
        // Create directory if not exists
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Authorization check
     */
    private function authorize($permission = null): void
    {
        $role = SecureSession::get('role');
        if (!in_array($role, ['admin', 'assistant'])) {
            $this->json(['error' => 'غير مصرح'], 403);
            exit;
        }

        if ($permission && !EnrollmentSecurityService::hasPermission($permission)) {
            $this->json(['error' => 'ليس لديك صلاحية لهذا الإجراء'], 403);
            exit;
        }
    }

    /**
     * GET /api/admin/files
     * List all uploaded files
     */
    public function index(): void
    {
        $this->authorize('files:view');

        try {
            $stmt = $this->db->query("
                SELECT * FROM uploaded_files 
                ORDER BY created_at DESC
            ");
            $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $items = array_map(function($f) {
                return [
                    'id' => $f['id'],
                    'name' => $f['original_name'],
                    'url' => $f['file_url'],
                    'type' => $f['file_type'],
                    'size' => $f['file_size'],
                    'createdAt' => $f['created_at']
                ];
            }, $files);

            $this->json(['items' => $items]);

        } catch (\Exception $e) {
            error_log("Admin files list error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب الملفات'], 500);
        }
    }

    /**
     * POST /api/admin/files/upload
     * Upload a new file
     */
    public function upload(): void
    {
        $this->authorize('files:upload');

        if (empty($_FILES['file'])) {
            $this->json(['error' => 'لم يتم رفع أي ملف'], 400);
            return;
        }

        $file = $_FILES['file'];
        
        // Validate file
        $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            $this->json(['error' => 'نوع الملف غير مسموح. يُسمح بـ PDF والصور فقط'], 400);
            return;
        }

        $maxSize = 50 * 1024 * 1024; // 50MB
        if ($file['size'] > $maxSize) {
            $this->json(['error' => 'حجم الملف كبير جداً. الحد الأقصى 50 ميجا'], 400);
            return;
        }

        try {
            $fileId = $this->generateUuid();
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $newFileName = $fileId . '.' . $extension;
            $filePath = $this->uploadDir . $newFileName;
            
            if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                throw new \Exception('فشل نقل الملف');
            }

            $fileUrl = '/uploads/files/' . $newFileName;

            // Save to database
            $stmt = $this->db->prepare("
                INSERT INTO uploaded_files (id, original_name, file_url, file_type, file_size, created_at)
                VALUES (:id, :name, :url, :type, :size, NOW())
            ");
            
            $stmt->execute([
                'id' => $fileId,
                'name' => $file['name'],
                'url' => $fileUrl,
                'type' => $file['type'],
                'size' => $file['size']
            ]);

            $this->json([
                'success' => true,
                'file' => [
                    'id' => $fileId,
                    'name' => $file['name'],
                    'url' => $fileUrl,
                    'type' => $file['type'],
                    'size' => $file['size']
                ]
            ]);

        } catch (\Exception $e) {
            error_log("File upload error: " . $e->getMessage());
            $this->json(['error' => 'فشل رفع الملف: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/files/{id}/delete
     * Delete a file
     */
    public function delete($params): void
    {
        $this->authorize('files:delete');
        $id = $params['id'] ?? null;

        if (!$id) {
            $this->json(['error' => 'معرف الملف مطلوب'], 400);
            return;
        }

        try {
            // Get file info
            $stmt = $this->db->prepare("SELECT * FROM uploaded_files WHERE id = :id");
            $stmt->execute(['id' => $id]);
            $file = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$file) {
                $this->json(['error' => 'الملف غير موجود'], 404);
                return;
            }

            // Delete physical file
            $filePath = dirname(__DIR__, 3) . '/public' . $file['file_url'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Delete from database
            $this->db->prepare("DELETE FROM uploaded_files WHERE id = :id")->execute(['id' => $id]);

            $this->json(['success' => true]);

        } catch (\Exception $e) {
            error_log("File delete error: " . $e->getMessage());
            $this->json(['error' => 'فشل حذف الملف'], 500);
        }
    }

    /**
     * Generate UUID (override not needed, use parent)
     */
    protected function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
