<?php

namespace App\Models;

use App\Core\Model;
use App\Utils\PasswordHasher;

class User extends Model {
    protected $table = 'users';
    
    // Fillable fields (Whitelist)
    // SECURITY FIX: 'role' removed to prevent mass assignment privilege escalation
    protected $fillable = [
        'name', 'email', 'password', 'phone',
        'parent_phone', 'school_name', 'grade_level',
        'education_stage', 'governorate', 'city', 'bio',
        'birth_date', 'gender', 'guardian_name',
        'avatar', 'permissions', 'teacher_id',
        'status', 'ip_address', 'user_agent',
        'sms_code', 'is_sms_verified'
    ];
    
    // Protected fields that can never be mass-assigned
    protected $protected = ['role', 'email_verified', 'verification_token'];
    
    // Hidden fields in API responses
    protected $hidden = [
        'password', 'remember_token', 'verification_token'
    ];

    /**
     * Create new user securely
     */
    public function create($data) {
        // Filter data (Whitelisting check)
        $filteredData = $this->filterData($data);
        
        // Hash password
        if (isset($filteredData['password'])) {
            $filteredData['password'] = PasswordHasher::hash($filteredData['password']);
        }
        
        // Add default values
        $filteredData['id'] = $this->generateSecureUuid();
        $filteredData['status'] = $filteredData['status'] ?? 'pending';
        $filteredData['email_verified'] = 0;
        $filteredData['verification_token'] = $this->generateVerificationToken();
        $filteredData['created_at'] = date('Y-m-d H:i:s');
        
        // Build SQL securely
        $fields = array_keys($filteredData);
        $placeholders = array_map(function($field) {
            return ':' . $field;
        }, $fields);
        
        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $this->table,
            implode(', ', $fields),
            implode(', ', $placeholders)
        );
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($filteredData);
            
            return $filteredData['id'];
        } catch (\PDOException $e) {
            error_log("User creation error: " . $e->getMessage());
            throw new \Exception("Failed to create user");
        }
    }

    /**
     * Create staff user (teacher/assistant) with explicit role setting
     * Bypasses the $protected filter for role assignment
     * @param array $data User data including 'role'
     * @param string $role The role to assign ('assistant' or 'teacher')
     * @return string|false The new user ID or false on failure
     */
    public function createStaff($data, string $role) {
        // Validate role
        $allowedRoles = ['assistant', 'teacher'];
        if (!in_array($role, $allowedRoles)) {
            throw new \InvalidArgumentException("Invalid role: $role");
        }
        
        // Filter data (Whitelisting check)
        $filteredData = $this->filterData($data);
        
        // Hash password
        if (isset($filteredData['password'])) {
            $filteredData['password'] = PasswordHasher::hash($filteredData['password']);
        }
        
        // Add default values
        $filteredData['id'] = $this->generateSecureUuid();
        $filteredData['role'] = $role; // Explicitly set role (bypasses $protected)
        $filteredData['status'] = $filteredData['status'] ?? 'active';
        $filteredData['email_verified'] = 0;
        $filteredData['verification_token'] = $this->generateVerificationToken();
        $filteredData['created_at'] = date('Y-m-d H:i:s');
        
        // Build SQL securely
        $fields = array_keys($filteredData);
        $placeholders = array_map(function($field) {
            return ':' . $field;
        }, $fields);
        
        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s)",
            $this->table,
            implode(', ', $fields),
            implode(', ', $placeholders)
        );
        
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($filteredData);
            
            return $filteredData['id'];
        } catch (\PDOException $e) {
            error_log("Staff creation error: " . $e->getMessage());
            throw new \Exception("Failed to create staff user");
        }
    }

    /**
     * Update user data securely
     */
    public function update($id, $data) {
        // Filter data
        $filteredData = $this->filterData($data);
        
        // Hash password if updated
        if (isset($filteredData['password'])) {
            $filteredData['password'] = PasswordHasher::hash($filteredData['password']);
        }
        
        // Add update timestamp
        $filteredData['updated_at'] = date('Y-m-d H:i:s');
        
        // Build SQL
        $setParts = [];
        foreach (array_keys($filteredData) as $field) {
            $setParts[] = "$field = :$field";
        }
        
        $sql = sprintf(
            "UPDATE %s SET %s WHERE id = :id",
            $this->table,
            implode(', ', $setParts)
        );
        
        $filteredData['id'] = $id;
        
        try {
            $stmt = $this->db->prepare($sql);
            
            // ✅ SECURITY FIX: Only log to server logs, never expose to client
            $result = $stmt->execute($filteredData);
            
            // Internal logging only (not exposed to client)
            error_log("User update: User ID " . $id . " updated successfully");

            return $result;
        } catch (\PDOException $e) {
            // ✅ Log detailed error to server logs only
            error_log("User update failed for ID " . $id . ": " . $e->getMessage());
            // ✅ Return generic error message to client
            throw new \Exception("Failed to update user profile");
        }
    }

    /**
     * Find user with Authorization check (IDOR protection)
     */
    public function find($id, $currentUserId = null) {
        // IDOR Check: Ensure user is authorized to view this record
        if ($currentUserId) {
            try {
                \App\Utils\Authorization::canAccess($currentUserId, $id);
            } catch (\Exception $e) {
                return null; // or throw exception depending on API design
            }
        }
        
        $user = parent::find($id);
        
        if ($user) {
            return $this->hideFields($user);
        }
        
        return null;
    }

    /**
     * Find user by Email
     */
    public function findByEmail($email) {
        return $this->findBy('email', $email);
    }

    /**
     * Verify Password securely
     */
    public function verifyPassword($userId, $password) {
        $user = parent::find($userId);
        if (!$user) return false;
        
        return \App\Utils\PasswordHasher::verify($password, $user['password']);
    }



    public function findByPhone($phone) {
        return $this->findBy('phone', $phone);
    }



    /**
     * Verify Email
     */
    public function verifyEmail($token) {
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} 
             SET email_verified = 1, 
                 verification_token = NULL,
                 status = 'active'
             WHERE verification_token = :token"
        );
        
        return $stmt->execute(['token' => $token]);
    }

    /**
     * Create Password Reset Token
     */
    public function createPasswordResetToken($email) {
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} 
             SET password_reset_token = :token,
                 password_reset_expires = :expires
             WHERE email = :email"
        );
        
        $stmt->execute([
            'token' => hash('sha256', $token),
            'expires' => $expiresAt,
            'email' => $email
        ]);
        
        return $token; // Send original token to user
    }

    /**
     * Reset Password
     */
    public function resetPassword($token, $newPassword) {
        $hashedToken = hash('sha256', $token);
        
        $stmt = $this->db->prepare(
            "SELECT id FROM {$this->table} 
             WHERE password_reset_token = :token 
             AND password_reset_expires > NOW()"
        );
        
        $stmt->execute(['token' => $hashedToken]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return false;
        }
        
        // Update password
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} 
             SET password = :password,
                 password_reset_token = NULL,
                 password_reset_expires = NULL
             WHERE id = :id"
        );
        
        return $stmt->execute([
            'password' => PasswordHasher::hash($newPassword),
            'id' => $user['id']
        ]);
    }

    /**
     * Record usage failed login
     */
    public function recordFailedLogin($identifier) {
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} 
             SET failed_login_attempts = failed_login_attempts + 1,
                 last_failed_login = NOW()
             WHERE email = :identifier OR phone = :identifier"
        );
        
        $stmt->execute(['identifier' => $identifier]);
    }

    /**
     * Reset failed logins
     */
    public function resetFailedLogins($userId) {
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} 
             SET failed_login_attempts = 0
             WHERE id = :id"
        );
        
        return $stmt->execute(['id' => $userId]);
    }

    /**
     * Check if account is locked
     */
    public function isLocked($identifier) {
        $stmt = $this->db->prepare(
            "SELECT failed_login_attempts, last_failed_login 
             FROM {$this->table} 
             WHERE email = :identifier OR phone = :identifier"
        );
        
        $stmt->execute(['identifier' => $identifier]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return false;
        }
        
        // Lock after 5 failed attempts for 30 minutes
        if ($user['failed_login_attempts'] >= 5) {
            $lastFailed = strtotime($user['last_failed_login']);
            $lockDuration = 30 * 60; // 30 minutes
            
            if (time() - $lastFailed < $lockDuration) {
                return true;
            } else {
                // Reset after lock expires
                $this->resetFailedLogins($user['id']);
            }
        }
        
        return false;
    }

    /**
     * Filter Data (Allow only fillable)
     */
    private function filterData($data) {
        return array_intersect_key($data, array_flip($this->fillable));
    }

    /**
     * Hide sensitive fields
     */
    private function hideFields($user) {
        foreach ($this->hidden as $field) {
            unset($user[$field]);
        }
        return $user;
    }

    /**
     * Generate Secure UUID
     */
    private function generateSecureUuid() {
        // Use random_bytes instead of mt_rand
        $data = random_bytes(16);
        
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // version 4
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // variant
        
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Generate Verification Token
     */
    private function generateVerificationToken() {
        return bin2hex(random_bytes(32));
    }
}