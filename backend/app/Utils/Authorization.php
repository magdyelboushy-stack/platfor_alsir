<?php

namespace App\Utils;

/**
 * Authorization Manager
 * Solves IDOR vulnerabilities
 * Single-teacher mode: Admin owns everything
 */
class Authorization {
    
    /**
     * Check access permission
     */
    public static function canAccess($currentUserId, $resourceUserId, $resourceType = 'user') {
        if (!$currentUserId) {
            throw new \Exception("Unauthorized: Please login");
        }
        
        // User can access their own data
        if ($currentUserId === $resourceUserId) {
            return true;
        }
        
        // Check Admin permissions
        if (self::isAdmin($currentUserId)) {
            return true;
        }
        
        // Check Assistant permissions (can see all students in single-teacher mode)
        if ($resourceType === 'student' && self::isAssistant($currentUserId)) {
            return true;
        }
        
        throw new \Exception("Unauthorized access denied");
    }
    
    /**
     * Check if user is admin
     */
    public static function isAdmin($userId) {
        $db = \App\Config\Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT role FROM users WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();
        
        return $user && $user['role'] === 'admin';
    }
    
    /**
     * Check if user is assistant
     */
    public static function isAssistant($userId) {
        $db = \App\Config\Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT role FROM users WHERE id = :id");
        $stmt->execute(['id' => $userId]);
        $user = $stmt->fetch();
        
        return $user && $user['role'] === 'assistant';
    }
    
    /**
     * Check if current user has any of the specified roles
     */
    public static function hasRole($roles) {
        \App\Utils\SecureSession::start();
        $userRole = \App\Utils\SecureSession::get('role');
        
        if (!$userRole) {
            return false;
        }

        if (is_array($roles)) {
            return in_array($userRole, $roles);
        }

        return $userRole === $roles;
    }

    /**
     * Check if student is enrolled in any course
     * Single-teacher mode: Just check active enrollment exists
     */
    private static function isStudentEnrolled($checkerId, $studentId) {
        $db = \App\Config\Database::getInstance()->getConnection();
        
        // Check if student has any active enrollment
        $stmt = $db->prepare("
            SELECT 1 FROM enrollments e
            WHERE e.user_id = :studentId 
            AND e.status = 'active'
            LIMIT 1
        ");
        $stmt->execute(['studentId' => $studentId]);
        
        return (bool) $stmt->fetch();
    }
}

