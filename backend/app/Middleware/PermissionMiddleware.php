<?php
/**
 * Permission Middleware
 * Enforces granular RBAC for assistant access control
 */

namespace App\Middleware;

use App\Utils\SecureSession;
use App\Config\Database;

class PermissionMiddleware {
    
    // Whitelist of allowed table names to prevent SQL injection
    private static $allowedTables = [
        'courses', 'lessons', 'exams', 'teacher_files', 'sections',
        'users', 'teachers', 'assistants', 'admins'
    ];
    
    // Whitelist of allowed column names to prevent SQL injection
    private static $allowedColumns = [
        'teacher_id', 'user_id', 'created_by', 'owner_id'
    ];
    
    /**
     * Check if current user has required permission
     * @param string $requiredPermission e.g., 'students:view'
     */
    public static function require(string $requiredPermission): void {
        SecureSession::start();
        
        $userId = SecureSession::get('user_id');
        $userRole = SecureSession::get('role');
        
        if (!$userId) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'يجب تسجيل الدخول']);
            exit();
        }
        
        // Admin has all permissions
        if ($userRole === 'admin') {
            return;
        }
        
        // Teacher has all permissions for their own data
        if ($userRole === 'teacher') {
            return;
        }
        
        // Assistant: Check explicit permission
        if ($userRole === 'assistant') {
            $permissions = SecureSession::get('permissions') ?? [];
            
            if (self::hasPermission($permissions, $requiredPermission)) {
                return;
            }
        }
        
        // Log unauthorized access attempt
        error_log("PERMISSION_DENIED: User $userId (role: $userRole) tried to access $requiredPermission");
        
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'ACCESS_DENIED',
            'message' => 'ليس لديك الصلاحية للقيام بهذا الإجراء',
            'required_permission' => $requiredPermission
        ]);
        exit();
    }
    
    /**
     * Check multiple permissions (OR logic - needs at least one)
     */
    public static function requireAny(array $permissions): void {
        SecureSession::start();
        $userRole = SecureSession::get('role');
        
        if (in_array($userRole, ['admin', 'teacher'])) {
            return;
        }
        
        $userPermissions = SecureSession::get('permissions') ?? [];
        
        foreach ($permissions as $perm) {
            if (self::hasPermission($userPermissions, $perm)) {
                return;
            }
        }
        
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'ACCESS_DENIED',
            'message' => 'ليس لديك الصلاحية للقيام بهذا الإجراء'
        ]);
        exit();
    }
    
    /**
     * Check if permission array contains required permission
     */
    public static function hasPermission(array $permissions, string $required): bool {
        // Direct match
        if (in_array($required, $permissions)) {
            return true;
        }
        
        // Check for module-level wildcard (e.g., 'students' grants 'students:view')
        $parts = explode(':', $required);
        if (count($parts) === 2) {
            $module = $parts[0];
            if (in_array($module, $permissions)) {
                return true;
            }
        }
        
        // Check for full wildcard
        if (in_array('*', $permissions)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get current user's permissions (for API response)
     */
    public static function getCurrentPermissions(): array {
        SecureSession::start();
        $role = SecureSession::get('role');
        
        if (in_array($role, ['admin', 'teacher'])) {
            return ['*']; // Full access marker
        }
        
        return SecureSession::get('permissions') ?? [];
    }
    
    /**
     * Get the teacher_id that this assistant belongs to
     * Returns the user's own ID if they are a teacher
     */
    public static function getTeacherId(): ?string {
        SecureSession::start();
        $role = SecureSession::get('role');
        $userId = SecureSession::get('user_id');
        
        if ($role === 'teacher') {
            return $userId;
        }
        
        if ($role === 'assistant') {
            return SecureSession::get('teacher_id');
        }
        
        if ($role === 'admin') {
            return null; // Admin can see all
        }
        
        return null;
    }
    
    /**
     * Verify that an assistant can only access data belonging to their teacher
     * Call this after require() to add IDOR protection
     */
    public static function requireOwnership(string $table, string $id, string $ownerColumn = 'teacher_id'): void {
        // Security: Validate table and column names against whitelist
        if (!in_array($table, self::$allowedTables, true)) {
            error_log("SECURITY: Invalid table name in requireOwnership: " . $table);
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'INVALID_REQUEST',
                'message' => 'Invalid resource type'
            ]);
            exit();
        }
        
        if (!in_array($ownerColumn, self::$allowedColumns, true)) {
            error_log("SECURITY: Invalid column name in requireOwnership: " . $ownerColumn);
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'INVALID_REQUEST',
                'message' => 'Invalid column name'
            ]);
            exit();
        }
        
        $teacherId = self::getTeacherId();
        
        // Admin can access all, or teacher accessing own data
        if ($teacherId === null || SecureSession::get('role') === 'teacher') {
            // For teachers, still verify they own this resource
            if (SecureSession::get('role') === 'teacher') {
                $teacherId = SecureSession::get('user_id');
            } else {
                return; // Admin
            }
        }
        
        $db = Database::getInstance()->getConnection();
        // Security: Use backticks for table/column names and validate them first
        $stmt = $db->prepare("SELECT `{$ownerColumn}` FROM `{$table}` WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$row || $row[$ownerColumn] !== $teacherId) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'OWNERSHIP_DENIED',
                'message' => 'لا يمكنك الوصول لهذا المورد'
            ]);
            exit();
        }
    }
    
    /**
     * Get SQL condition to filter data by teacher ownership
     * Use this in queries to automatically scope data
     * 
     * @return array ['condition' => string, 'params' => array] for use with prepared statements
     */
    public static function getOwnershipCondition(string $alias = ''): array {
        $teacherId = self::getTeacherId();
        
        // Security: Validate alias to prevent SQL injection
        if ($alias && !preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $alias)) {
            error_log("SECURITY: Invalid alias in getOwnershipCondition: " . $alias);
            throw new \InvalidArgumentException("Invalid alias format");
        }
        
        $column = $alias ? "`{$alias}`.`teacher_id`" : '`teacher_id`';
        
        // Admin sees all
        if ($teacherId === null) {
            return ['condition' => '1=1', 'params' => []];
        }
        
        // Security: Use prepared statement parameter instead of string interpolation
        return [
            'condition' => "{$column} = :teacher_id",
            'params' => ['teacher_id' => $teacherId]
        ];
    }
    
    /**
     * Legacy method for backward compatibility
     * @deprecated Use getOwnershipCondition() which returns array with params
     */
    public static function getOwnershipConditionString(string $alias = ''): string {
        $result = self::getOwnershipCondition($alias);
        if ($result['condition'] === '1=1') {
            return '1=1';
        }
        
        // For backward compatibility, quote the value
        $db = Database::getInstance()->getConnection();
        $teacherId = $result['params']['teacher_id'];
        $column = $alias ? "`{$alias}`.`teacher_id`" : '`teacher_id`';
        return "{$column} = " . $db->quote($teacherId);
    }
}
