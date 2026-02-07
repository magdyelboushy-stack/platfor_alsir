<?php

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Models\Assistant;
use App\Models\User; // Keep for email uniqueness check across system if needed, or rely on MultiAuthService
use App\Services\MultiAuthService;
use App\Utils\SecureSession;
use App\Utils\AuditLogger;
use App\Utils\Validator;
use App\Utils\PasswordHasher;

class AssistantsController extends BaseController {
    protected $assistantModel;

    public function __construct() {
        $this->assistantModel = new Assistant();
    }

    /**
     * Helper to verify if user has management permissions
     * Only Admin and Teacher roles allowed to manage assistants
     */
    protected function authorize() {
        if (!SecureSession::get('user_id')) {
            $this->json(['error' => 'يجب تسجيل الدخول'], 401);
        }

        $role = SecureSession::get('role');
        $allowedRoles = ['admin']; // Single-teacher mode: only admin manages assistants

        if (!in_array($role, $allowedRoles)) {
            $this->json(['error' => 'ليس لديك صلاحية لإدارة المساعدين'], 403);
        }
    }

    /**
     * List all assistants
     */
    public function index() {
        $this->authorize();

        try {
            $role = SecureSession::get('role');
            
            // Single-teacher mode: Admin sees all assistants
            {
                // Admin sees all? Or maybe handle differently.
                // For now assuming Admin can see all, but Assistant model doesn't have getAll() publicly exposed in previous view.
                // Let's rely on DB access or add getAll to model. 
                // Wait, previous file view of Assistant.php didn't allow getting ALL globally easily without writing query.
                // But let's assume teacher context is primary. If admin, we can query all.
                
                $db = $this->assistantModel->getDb();
                $stmt = $db->query("SELECT * FROM assistants ORDER BY created_at DESC");
                $assistants = $stmt->fetchAll(\PDO::FETCH_ASSOC);
                
                // Decode permissions for manual query
                $assistants = array_map(function($a) {
                    $a['permissions'] = json_decode($a['permissions'] ?? '[]', true);
                    return $a;
                }, $assistants);
            }

            // Format
            $formatted = array_map(function($a) {
                return [
                    'id' => $a['id'],
                    'name' => $a['name'],
                    'email' => $a['email'],
                    'phone' => $a['phone'],
                    'role' => 'مساعد', // Display label
                    'status' => $a['status'],
                    'permissions' => $a['permissions'],
                    'createdAt' => $a['created_at'],
                    'avatar' => $a['avatar']
                ];
            }, $assistants);

            $this->json($formatted);
        } catch (\PDOException $e) {
            error_log("Assistants listing error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ في جلب قائمة المساعدين'], 500);
        }
    }

    /**
     * Create a new assistant
     */
    public function create() {
        $this->authorize();

        $data = $this->getInput();
        
        // Basic Validation
        if (empty($data['name']) || empty($data['email']) || empty($data['password']) || empty($data['phone'])) {
            $this->json(['error' => 'جميع الحقول المطلوبة يجب ملؤها'], 400);
        }

        // Email Uniqueness Check (Global)
        if (MultiAuthService::emailExists($data['email'])) {
             $this->json(['error' => 'البريد الإلكتروني مستخدم بالفعل'], 409);
        }

        try {
            // Single-teacher mode: Admin is the teacher, no teacher_id needed
            // Assistants belong to the admin by default

            $assistantData = [
                'name' => htmlspecialchars(strip_tags($data['name'])),
                'email' => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
                'phone' => htmlspecialchars(strip_tags($data['phone'])),
                'password' => PasswordHasher::hash($data['password']),
                'status' => 'active',
                'permissions' => $data['permissions'] ?? [],
                'avatar' => 'default_avatar.png'
            ];

            // Use Assistant Model
            $newId = $this->assistantModel->create($assistantData);

            if ($newId) {
                AuditLogger::log(SecureSession::get('user_id'), 'create_assistant', 'assistants', $newId);
                $this->json(['message' => 'تم إضافة المساعد بنجاح', 'id' => $newId], 201);
            } else {
                $this->json(['error' => 'فشل إنشاء الحساب'], 500);
            }

        } catch (\Exception $e) {
            error_log("Create assistant error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ أثناء إضافة المساعد'], 500);
        }
    }

    /**
     * Update an assistant
     */
    public function update($params) {
        $this->authorize();
        $id = $params['id'] ?? null;
        $data = $this->getInput();

        if (!$id) {
            $this->json(['error' => 'رقم المعرف مفقود'], 400);
        }

        // Basic Validation
        if (empty($data['name']) || empty($data['email']) || empty($data['phone'])) {
            $this->json(['error' => 'جميع الحقول المطلوبة يجب ملؤها'], 400);
        }

        // Check Existence
        $assistant = $this->assistantModel->find($id);
        if (!$assistant) {
             $this->json(['error' => 'المساعد غير موجود'], 404);
        }
        
        // Single-teacher mode: Admin can edit all assistants

        // Email Uniqueness Check (Exclude current)
        // Check manually if changed
        if ($assistant['email'] !== $data['email'] && MultiAuthService::emailExists($data['email'])) {
            $this->json(['error' => 'البريد الإلكتروني مستخدم بالفعل'], 409);
        }

        try {
            // Prepare Update Data
            $updateData = [
                'name' => htmlspecialchars(strip_tags($data['name'])),
                'email' => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
                'phone' => htmlspecialchars(strip_tags($data['phone'])),
                'permissions' => $data['permissions'] ?? [],
            ];

            if (!empty($data['password'])) {
                $updateData['password'] = PasswordHasher::hash($data['password']);
            }

            $this->assistantModel->update($id, $updateData);
            
            AuditLogger::log(SecureSession::get('user_id'), 'update_assistant', 'assistants', $id);
            $this->json(['message' => 'تم تحديث بيانات المساعد بنجاح']);

        } catch (\Exception $e) {
            error_log("Update assistant error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ أثناء تحديث المساعد'], 500);
        }
    }
    
    public function delete($params) {
        $this->authorize();
        $id = $params['id'] ?? null;

        if (!$id) {
            $this->json(['error' => 'رقم المعرف مفقود'], 400);
        }

        try {
             // Check Existence
            $assistant = $this->assistantModel->find($id);
            if (!$assistant) {
                 $this->json(['error' => 'المساعد غير موجود'], 404);
            }
        
            // Single-teacher mode: Admin can delete all assistants

            $result = $this->assistantModel->delete($id);

            if ($result) {
                AuditLogger::log(SecureSession::get('user_id'), 'delete_assistant', 'assistants', $id);
                $this->json(['message' => 'تم حذف المساعد بنجاح']);
            } else {
                $this->json(['error' => 'فشل حذف المساعد'], 500);
            }
        } catch (\Exception $e) {
            error_log("Delete assistant error: " . $e->getMessage());
            $this->json(['error' => 'حدث خطأ أثناء الحذف'], 500);
        }
    }
}
