<?php

namespace App\Utils;

use App\Config\Database;

class SqlRateLimiter {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Check if request is allowed. If not, return seconds until retry.
     */
    public function check($identifier, $maxAttempts = 5, $decaySeconds = 900) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '127.0.0.1';
        
        // 1. Cleanup old attempts
        $this->cleanup($decaySeconds);

        // 2. Count active attempts
        $sql = "SELECT COUNT(*) as attempts, MAX(last_attempt_at) as last_attempt 
                FROM login_attempts 
                WHERE (ip_address = :ip OR identifier = :identifier) 
                AND last_attempt_at > DATE_SUB(NOW(), INTERVAL :decay SECOND)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'ip' => $ip,
            'identifier' => $identifier,
            'decay' => $decaySeconds
        ]);
        
        $result = $stmt->fetch();
        $attempts = $result['attempts'] ?? 0;

        if ($attempts >= $maxAttempts) {
            return false; // Blocked
        }

        return true; // Allowed
    }

    /**
     * Record a failed attempt
     */
    public function hit($identifier, $user_agent = '') {
        $ip = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '127.0.0.1';
        $sql = "INSERT INTO login_attempts (ip_address, identifier, user_agent, last_attempt_at) 
                VALUES (:ip, :identifier, :ua, NOW())";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'ip' => $ip,
            'identifier' => $identifier,
            'ua' => $user_agent
        ]);
    }

    /**
     * Mark attempts as successful (don't delete - keep for audit)
     */
    public function clear($identifier) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '127.0.0.1';
        
        // Mark as successful instead of deleting (for audit trail)
        $sql = "UPDATE login_attempts 
                SET success = 1 
                WHERE (ip_address = :ip OR identifier = :identifier) 
                AND success = 0";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['ip' => $ip, 'identifier' => $identifier]);
    }

    private function cleanup($decaySeconds) {
        // Optional: Garbage collection (could be a cron job)
        // $sql = "DELETE FROM login_attempts WHERE last_attempt_at < DATE_SUB(NOW(), INTERVAL :decay SECOND)";
        // $this->db->prepare($sql)->execute(['decay' => $decaySeconds]);
    }
}
