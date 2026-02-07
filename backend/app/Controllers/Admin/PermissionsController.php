<?php
/**
 * Permissions Controller
 * API endpoints for permission management
 */

namespace App\Controllers\Admin;

use App\Core\BaseController;
use App\Utils\SecureSession;

class PermissionsController extends BaseController {
    
    /**
     * GET /api/admin/permissions/registry
     * Returns all available permissions for the Add Assistant form
     */
    public function registry() {
        SecureSession::start();
        $role = SecureSession::get('role');
        
        if (!in_array($role, ['admin', 'teacher'])) {
            $this->json(['error' => 'Unauthorized'], 403);
        }
        
        $config = require __DIR__ . '/../../config/permissions.php';
        
        // Format for frontend consumption
        $modules = [];
        foreach ($config['modules'] as $key => $module) {
            $actions = [];
            foreach ($module['actions'] as $actionKey => $actionLabel) {
                $actions[] = [
                    'key' => "$key:$actionKey",
                    'label' => $actionLabel
                ];
            }
            
            $modules[] = [
                'key' => $key,
                'label' => $module['label'],
                'icon' => $module['icon'] ?? null,
                'actions' => $actions,
                'isDefault' => $module['default'] ?? false,
                'isSensitive' => $module['sensitive'] ?? false
            ];
        }
        
        $this->json([
            'modules' => $modules,
            'teacherOnly' => $config['teacher_only']
        ]);
    }
    
    /**
     * GET /api/admin/permissions/current
     * Returns current user's permissions (for frontend guards)
     */
    public function current() {
        SecureSession::start();
        $role = SecureSession::get('role');
        $permissions = SecureSession::get('permissions') ?? [];
        $teacherId = SecureSession::get('teacher_id');
        
        $this->json([
            'role' => $role,
            'permissions' => in_array($role, ['admin', 'teacher']) ? ['*'] : $permissions,
            'teacherId' => $teacherId
        ]);
    }
}
