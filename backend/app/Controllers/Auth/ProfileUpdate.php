<?php

namespace App\Controllers\Auth;

use App\Core\BaseController;
use App\Models\User;
use App\Models\ActivityLog;
use App\Utils\SecureSession;

class ProfileUpdate extends BaseController {
    
    public function handle() {
        try {
            SecureSession::start();
            $userId = SecureSession::get('user_id');
            
            if (!$userId) {
                $this->json(['error' => 'Unauthenticated', 'message' => 'يرجى تسجيل الدخول أولاً.'], 401);
            }

            // Get POST data (JSON)
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $this->json(['error' => 'Invalid Input', 'message' => 'البيانات المرسلة غير صالحة.'], 400);
            }

            $userModel = new User();
            $user = $userModel->find($userId);

            if (!$user) {
                $this->json(['error' => 'User not found', 'message' => 'لم يتم العثور على المستخدم.'], 404);
            }

            // Data to update
            $updateData = [];
            
            // 1. Validate Phone Number if provided
            if (isset($input['phone'])) {
                $newPhone = trim($input['phone']);
                
                if (empty($newPhone)) {
                    $this->json(['error' => 'Validation Error', 'message' => 'رقم الهاتف مطلوب.'], 400);
                }

                // Rule A: Student phone != Parent phone (if current user is a student)
                if ($user['parent_phone'] === $newPhone) {
                    $this->json(['error' => 'Validation Error', 'message' => 'عذراً، لا يمكن استخدام نفس رقم هاتف ولي الأمر كرقـم شخصي للطالب.'], 400);
                }

                // Rule B: Unique across database (excluding current user)
                $existingUser = $userModel->findByPhone($newPhone);
                if ($existingUser && $existingUser['id'] !== $userId) {
                    $this->json(['error' => 'Validation Error', 'message' => 'عذراً، هذا الرقم مستخدم بالفعل من قبل طالب آخر.'], 400);
                }

                $updateData['phone'] = $newPhone;
            }

            // 2. Update Bio if provided
            if (isset($input['bio'])) {
                $updateData['bio'] = trim($input['bio']);
            }

            if (empty($updateData)) {
                $this->json(['error' => 'No changes', 'message' => 'لم يتم إجراء أي تغييرات.'], 400);
            }

            // Perform Update
            if (!$userModel->update($userId, $updateData)) {
                throw new \Exception("فشل في تحديث بيانات المستخدم في قاعدة البيانات.");
            }

            // 3. Record Activity Log
            $logModel = new ActivityLog();
            $changedFields = implode(', ', array_keys($updateData));
            if (!$logModel->record($userId, $user['name'], 'profile_update', "Updated fields: $changedFields")) {
                $isDebug = isset($_ENV['DEBUG']) && filter_var($_ENV['DEBUG'], FILTER_VALIDATE_BOOLEAN);
                if ($isDebug) {
                    throw new \Exception("Security Log Persistence Failed. Database probably rejected the record row.");
                }
                error_log("Security Log Failure for user $userId");
            }

            // Fetch fresh user data
            $updatedUser = $userModel->find($userId);

            $isDebug = isset($_ENV['DEBUG']) && filter_var($_ENV['DEBUG'], FILTER_VALIDATE_BOOLEAN);

            $this->json([
                'success' => true,
                'message' => 'تم تحديث البيانات بنجاح!',
                'user' => [
                    'id' => $updatedUser['id'],
                    'name' => $updatedUser['name'],
                    'email' => $updatedUser['email'],
                    'role' => $updatedUser['role'],
                    'avatar' => $updatedUser['avatar'] ?? null,
                    'grade_level' => $updatedUser['grade_level'] ?? null,
                    'education_stage' => $updatedUser['education_stage'] ?? null,
                    'phone' => $updatedUser['phone'] ?? null,
                    'parent_phone' => $updatedUser['parent_phone'] ?? null,
                    'bio' => $updatedUser['bio'] ?? null,
                    'status' => $updatedUser['status'],
                ]
            ]);
            
        } catch (\Exception $e) {
            error_log("Profile Update Backend Error: " . $e->getMessage());
            $this->json(['error' => 'Server Error', 'message' => 'حدث خطأ غير متوقع في الخادم.'], 500);
        }
    }
}
