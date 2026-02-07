<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Utils\SecureSession;
use PDO;

class SettingsController extends BaseController {

    protected $db;

    public function __construct() {
        $this->db = \App\Config\Database::getInstance()->getConnection();
        $this->ensureTableExists();
    }

    private function ensureTableExists() {
        // Simple key-value store for system settings
        $sql = "CREATE TABLE IF NOT EXISTS system_settings (
            `key` VARCHAR(50) PRIMARY KEY,
            `value` TEXT,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $this->db->exec($sql);
    }

    /**
     * Get all settings
     * GET /api/admin/settings
     */
    public function index() {
        // 1. Dynamic Settings (Contact & Groups) - Fetched from DB
        $stmt = $this->db->query("SELECT `key`, `value` FROM system_settings");
        $dbSettings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // 2. Static Branding (Hardcoded by Developer)
        // هذه الإعدادات ثابتة بالكود ولا تأتي من قاعدة البيانات
       

        // 3. Default Values for Dynamic Settings (if not in DB)
        $dynamicDefaults = [
            'contact_email' => 'contact@bacaloria.com',
            'contact_phone' => '',
            'whatsapp_number' => '',
            'facebook_url' => '',
            'instagram_url' => '',
            'youtube_url' => '',
            'tiktok_url' => '',
            'telegram_url' => '',
            'telegram_group' => '',
            'whatsapp_group' => '',
            'facebook_group' => '',
            'address' => ''
        ];

        // Merge: Static takes precedence for branding, DB takes precedence for dynamic
        $settings = array_merge($dynamicDefaults, $dbSettings);

        $this->json($settings);
    }

    /**
     * Update settings
     * POST /api/admin/settings
     */
    public function update() {
        if (SecureSession::get('role') !== 'admin') {
            $this->json(['error' => 'Unauthorized'], 403);
        }

        // Security: Sanitize input instead of using $_POST directly
        $input = $this->getInput(); // Use BaseController method
        if (empty($input) && !empty($_POST)) {
            // Fallback for form-data requests
            $input = $_POST;
        }
        
        // Security: Sanitize all input values
        $input = array_map('trim', $input);
        $input = array_map(function($value) {
            return is_string($value) ? strip_tags($value) : $value;
        }, $input);
        
        // Handle Text Fields
        $fields = [
            'contact_email', 'contact_phone', 'whatsapp_number', 
            'facebook_url', 'instagram_url', 'youtube_url', 
            'tiktok_url', 'telegram_url',
            'telegram_group', 'whatsapp_group', 'facebook_group',
            'address'
        ];
        
        try {
            $this->db->beginTransaction();

            foreach ($fields as $field) {
                if (isset($input[$field])) {
                    $this->saveSetting($field, $input[$field]);
                }
            }

            $this->db->commit();
            
            // Return updated settings
            $this->index();

        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Settings Update Error: " . $e->getMessage());
            $this->json(['error' => 'Failed to update settings'], 500);
        }
    }

    private function handleFileUpload($fileKey, $settingKey) {
        if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES[$fileKey];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'svg', 'webp'];
            
            if (in_array($ext, $allowed)) {
                // Save to public/uploads/settings
                $uploadDir = __DIR__ . '/../../../public/uploads/settings';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true); // Security: Use 0755 instead of 0777
                    chmod($uploadDir, 0755);
                }
                
                $filename = $fileKey . '_' . time() . '.' . $ext;
                $dest = $uploadDir . '/' . $filename;
                
                if (move_uploaded_file($file['tmp_name'], $dest)) {
                    // Security: Set proper file permissions
                    chmod($dest, 0644);
                    
                    // Return the URL instead of modifying global $_POST
                    return '/uploads/settings/' . $filename;
                } else {
                    error_log("Failed to move uploaded file to: $dest");
                }
            } else {
                error_log("Invalid file extension: $ext");
            }
        } else {
            if (isset($_FILES[$fileKey])) {
                error_log("Upload error for $fileKey: " . $_FILES[$fileKey]['error']);
            }
        }
        return null;
    }

    private function saveSetting($key, $value) {
        $stmt = $this->db->prepare("
            INSERT INTO system_settings (`key`, `value`) 
            VALUES (:key, :value) 
            ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)
        ");
        $stmt->execute(['key' => $key, 'value' => $value]);
    }
}
