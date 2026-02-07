<?php

namespace App\Services;

use App\Models\Admin;
use App\Models\Assistant;
use App\Models\User;
use App\Utils\PasswordHasher;

/**
 * MultiAuthService
 * 
 * Handles authentication across multiple user tables.
 * Checks admins, assistants, and students (users) tables.
 * 
 * Note: Teacher table removed - single-teacher platform where Admin = Teacher
 */
class MultiAuthService
{
    /**
     * Attempt to authenticate a specific role
     */
    public static function attemptSpecific(string $identifier, string $password, string $role): ?array
    {
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $field = $isEmail ? 'email' : 'phone';

        switch ($role) {
            case 'admin':
                $model = new Admin();
                $user = $isEmail ? $model->findByEmail($identifier) : null;
                if ($user && PasswordHasher::verify($password, $user['password'])) {
                    return self::formatUser($user, 'admin');
                }
                break;

            case 'assistant':
                $model = new Assistant();
                $user = $isEmail ? $model->findByEmail($identifier) : $model->findBy('phone', $identifier);
                if ($user && PasswordHasher::verify($password, $user['password'])) {
                    return self::formatUser($user, 'assistant');
                }
                break;

            case 'student':
            case 'parent':
                $model = new User();
                $user = $model->findBy($field, $identifier);
                if ($user && PasswordHasher::verify($password, $user['password'])) {
                    if (in_array($user['role'], ['student', 'parent'])) {
                        return self::formatUser($user, $user['role']);
                    }
                }
                break;
        }
        return null;
    }

    /**
     * Attempt to authenticate a user across all tables
     * 
     * @param string $identifier Email or phone
     * @param string $password
     * @return array|null User data with 'role' or null if not found
     */
    public static function attempt(string $identifier, string $password): ?array
    {
        // Priority order: Admin > Assistant > Student
        $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
        $field = $isEmail ? 'email' : 'phone';

        // 1. Check admins table (Email only usually)
        if ($isEmail) {
            $adminModel = new Admin();
            $admin = $adminModel->findByEmail($identifier);
            if ($admin && PasswordHasher::verify($password, $admin['password'])) {
                return self::formatUser($admin, 'admin');
            }
        }

        // 2. Check assistants table
        $assistantModel = new Assistant();
        $assistant = $isEmail ? $assistantModel->findByEmail($identifier) : $assistantModel->findBy('phone', $identifier);
        if ($assistant && PasswordHasher::verify($password, $assistant['password'])) {
            return self::formatUser($assistant, 'assistant');
        }

        // 3. Check users table (students)
        $userModel = new User();
        $user = $userModel->findBy($field, $identifier);
        if ($user && PasswordHasher::verify($password, $user['password'])) {
            return self::formatUser($user, $user['role']);
        }

        return null;
    }


    /**
     * Format user data for session/JWT
     */
    private static function formatUser(array $data, string $role): array
    {
        $formatted = [
            'id' => $data['id'],
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'avatar' => $data['avatar'] ?? null,
            'role' => $role,
            'status' => $data['status'] ?? 'active',
        ];

        // Add role-specific data
        switch ($role) {
            case 'admin':
                // Admin is also the teacher in single-teacher mode
                $formatted['is_teacher'] = true;
                break;

            case 'assistant':
                $formatted['permissions'] = is_string($data['permissions'] ?? null)
                    ? json_decode($data['permissions'], true)
                    : ($data['permissions'] ?? []);
                break;

            case 'student':
                $formatted['education_stage'] = $data['education_stage'] ?? null;
                $formatted['grade_level'] = $data['grade_level'] ?? null;
                $formatted['parent_phone'] = $data['parent_phone'] ?? null;
                $formatted['is_sms_verified'] = (int)($data['is_sms_verified'] ?? 0);
                break;
        }

        return $formatted;
    }

    /**
     * Get user by ID and role
     */
    public static function getUserByIdAndRole(string $id, string $role): ?array
    {
        switch ($role) {
            case 'admin':
                $model = new Admin();
                $user = $model->find($id);
                if (!$user) {
                    $user = (new User())->find($id);
                    if ($user && $user['role'] === 'admin') return self::formatUser($user, 'admin');
                }
                return $user ? self::formatUser($user, 'admin') : null;

            case 'assistant':
                $model = new Assistant();
                $user = $model->find($id);
                if (!$user) {
                    $user = (new User())->find($id);
                    if ($user && $user['role'] === 'assistant') return self::formatUser($user, 'assistant');
                }
                return $user ? self::formatUser($user, 'assistant') : null;

            case 'student':
            case 'parent':
                $model = new User();
                $user = $model->find($id);
                return $user ? self::formatUser($user, $user['role']) : null;

            default:
                return null;
        }
    }

    /**
     * Check if email exists in any table
     */
    public static function emailExists(string $email): bool
    {
        if ((new Admin())->emailExists($email)) return true;
        if ((new Assistant())->emailExists($email)) return true;
        
        $userModel = new User();
        $user = $userModel->findBy('email', $email);
        if ($user) return true;

        return false;
    }
}
