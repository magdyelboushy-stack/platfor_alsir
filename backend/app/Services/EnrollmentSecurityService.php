<?php

namespace App\Services;

use App\Config\Database;
use App\Utils\SecureSession;
use PDO;

/**
 * EnrollmentSecurityService
 * 
 * Centralized service for enrollment-based access control.
 * Single-teacher mode: Admin has full access, Assistants have delegated access.
 */
class EnrollmentSecurityService
{
    private static ?PDO $db = null;

    private static function getDb(): PDO
    {
        if (self::$db === null) {
            self::$db = Database::getInstance()->getConnection();
        }
        return self::$db;
    }

    /**
     * Get the effective teacher ID for the current user.
     * Single-teacher mode: Always returns null (Admin owns everything)
     */
    public static function getEffectiveTeacherId(): ?string
    {
        // Single-teacher mode: Admin is the only teacher
        // Return null so all filters are bypassed
        return null;
    }

    /**
     * Check if the current user can access a specific student's data.
     * 
     * @param string $studentId The student's user ID
     * @return bool True if access is granted
     */
    public static function canAccessStudent(string $actualUserId, string $studentId): bool
    {
        $role = SecureSession::get('role');
        
        // Admin and Assistant have access to all students
        if (in_array($role, ['admin', 'assistant'])) {
            return true;
        }

        // For other roles, check if the user is the student themselves
        return $actualUserId === $studentId;
    }

    /**
     * Check if a specific user can access a student.
     * Single-teacher mode: All staff can access all students.
     */
    public static function teacherCanAccessStudent(string $userId, string $studentId): bool
    {
        // In single-teacher mode, all staff have access
        return true;
    }

    /**
     * Get all student IDs accessible by the current user.
     * Single-teacher mode: Returns all students for staff roles.
     * 
     * @return array Array of student user IDs
     */
    public static function getAccessibleStudentIds(): array
    {
        $role = SecureSession::get('role');

        // Staff sees all students
        if (in_array($role, ['admin', 'assistant'])) {
            $stmt = self::getDb()->query("SELECT id FROM users WHERE role = 'student'");
            return $stmt->fetchAll(PDO::FETCH_COLUMN);
        }

        // Non-staff (shouldn't typically call this)
        return [];
    }

    /**
     * Get SQL WHERE condition for filtering students.
     * Single-teacher mode: No filtering for staff roles.
     * 
     * @param string $studentIdColumn The column name for student ID in the query
     * @return array ['condition' => string, 'params' => array]
     */
    public static function getStudentAccessCondition(string $studentIdColumn = 'u.id'): array
    {
        $role = SecureSession::get('role');

        // Staff has access to all students
        if (in_array($role, ['admin', 'assistant'])) {
            return [
                'condition' => '1=1',
                'params' => []
            ];
        }

        // For students: only see themselves
        $userId = SecureSession::get('user_id');
        return [
            'condition' => "{$studentIdColumn} = :current_user_id",
            'params' => [':current_user_id' => $userId]
        ];
    }

    /**
     * Require access to a student or throw 403.
     * Use in controller methods that access a specific student.
     * 
     * @param string $studentId The student's user ID
     * @throws \Exception When access is denied
     */
    public static function requireStudentAccess(string $studentId): void
    {
        $userId = SecureSession::get('user_id');
        if (!self::canAccessStudent($userId, $studentId)) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'غير مصرح بالوصول إلى بيانات هذا الطالب',
                'code' => 'ENROLLMENT_ACCESS_DENIED'
            ]);
            exit();
        }
    }

    /**
     * Check if current user has permission to perform an action.
     * Combines role check with permission check.
     * 
     * @param string $permission The permission string (e.g., 'students:view')
     * @return bool
     */
    public static function hasPermission(string $permission): bool
    {
        $role = SecureSession::get('role');

        // Admin has all permissions
        if ($role === 'admin') {
            return true;
        }

        // Assistant: Check specific permissions
        if ($role === 'assistant') {
            $permissions = SecureSession::get('permissions') ?? [];
            $module = explode(':', $permission)[0];
            
            // Check exact permission or module-level access
            return in_array($permission, $permissions) ||
                   in_array($module, $permissions) ||
                   !empty(array_filter($permissions, fn($p) => str_starts_with($p, $module . ':')));
        }

        return false;
    }

    /**
     * Get enrollment statistics.
     * Single-teacher mode: Returns global stats.
     * 
     * @param string|null $teacherId Ignored in single-teacher mode
     * @return array Statistics array
     */
    public static function getEnrollmentStats(?string $teacherId = null): array
    {
        // Single-teacher mode: Always return global stats
        $stmt = self::getDb()->query("
            SELECT 
                COUNT(DISTINCT e.user_id) as total_students,
                COUNT(DISTINCT c.id) as total_courses,
                COUNT(*) as total_enrollments
            FROM enrollments e
            INNER JOIN courses c ON e.course_id = c.id
            WHERE e.status = 'active'
        ");
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

