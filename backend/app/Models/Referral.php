<?php

namespace App\Models;

use App\Core\Model;

class Referral extends Model {
    protected $table = 'evaluation_referrals';

    /**
     * Create or get existing referral token for a sharer
     */
    public function getOrCreate($evaluationId, $sharerUuid) {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE evaluation_id = :ev_id AND sharer_uuid = :uuid");
        $stmt->execute(['ev_id' => $evaluationId, 'uuid' => $sharerUuid]);
        $existing = $stmt->fetch();

        if ($existing) {
            return $existing;
        }

        $token = bin2hex(random_bytes(8)); // 16 character token
        $this->create([
            'evaluation_id' => $evaluationId,
            'sharer_uuid' => $sharerUuid,
            'token' => $token,
            'target_count' => 5
        ]);

        return $this->find($this->db->lastInsertId());
    }

    /**
     * Record a visit from a unique IP
     */
    public function recordVisit($token, $ip) {
        $stmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE token = :token");
        $stmt->execute(['token' => $token]);
        $referral = $stmt->fetch();

        if (!$referral) return false;

        try {
            $stmt = $this->db->prepare("INSERT IGNORE INTO referral_visits (referral_id, visitor_ip) VALUES (:id, :ip)");
            return $stmt->execute(['id' => $referral['id'], 'ip' => $ip]);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get unique visit count for a token
     */
    public function getStatus($token) {
        $stmt = $this->db->prepare("
            SELECT r.*, COUNT(v.id) as current_count 
            FROM {$this->table} r
            LEFT JOIN referral_visits v ON r.id = v.referral_id
            WHERE r.token = :token
            GROUP BY r.id
        ");
        $stmt->execute(['token' => $token]);
        return $stmt->fetch();
    }
    
    /**
     * Check if a specific sharer has reached their target
     */
    public function checkProgress($evaluationId, $sharerUuid) {
        $stmt = $this->db->prepare("
            SELECT r.id, r.token, r.target_count, COUNT(v.id) as current_count 
            FROM {$this->table} r
            LEFT JOIN referral_visits v ON r.id = v.referral_id
            WHERE r.evaluation_id = :ev_id AND r.sharer_uuid = :uuid
            GROUP BY r.id
        ");
        $stmt->execute(['ev_id' => $evaluationId, 'uuid' => $sharerUuid]);
        return $stmt->fetch();
    }
}
