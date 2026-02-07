<?php

namespace App\Utils;

/**
 * Password Hasher
 * Secure password hashing
 */
class PasswordHasher {
    
    /**
     * Hash password
     */
    public static function hash($password) {
        // Use Argon2id if available (Current best practice)
        if (defined('PASSWORD_ARGON2ID')) {
            return password_hash($password, PASSWORD_ARGON2ID, [
                'memory_cost' => 65536,  // 64 MB
                'time_cost' => 4,
                'threads' => 3
            ]);
        }
        
        // Fallback: bcrypt
        return password_hash($password, PASSWORD_BCRYPT, [
            'cost' => 12
        ]);
    }
    
    /**
     * Verify password
     */
    public static function verify($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Check if password needs rehash
     */
    public static function needsRehash($hash) {
        if (defined('PASSWORD_ARGON2ID')) {
            return password_needs_rehash($hash, PASSWORD_ARGON2ID, [
                'memory_cost' => 65536,
                'time_cost' => 4,
                'threads' => 3
            ]);
        }
        
        return password_needs_rehash($hash, PASSWORD_BCRYPT, [
            'cost' => 12
        ]);
    }
}
