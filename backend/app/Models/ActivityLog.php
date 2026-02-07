<?php

namespace App\Models;

use App\Core\Model;

class ActivityLog extends Model {
    protected $table = 'activity_logs';
    
    protected $fillable = [
        'user_id', 'user_name', 'action_type', 'description', 'ip_address', 'user_agent'
    ];

    /**
     * Record a new activity log entry
     */
    public function record($userId, $userName, $action, $description = null) {
        $data = [
            'user_id' => $userId,
            'user_name' => $userName,
            'action_type' => $action,
            'description' => $description,
            'ip_address' => $this->getIpAddress(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
            'created_at' => date('Y-m-d H:i:s')
        ];

        $isDebug = isset($_ENV['DEBUG']) && filter_var($_ENV['DEBUG'], FILTER_VALIDATE_BOOLEAN);

        try {
            if ($isDebug) {
                error_log("Logging Activity: " . json_encode($data));
            }

            $stmt = $this->db->prepare(
                "INSERT INTO {$this->table} (user_id, user_name, action_type, description, ip_address, user_agent, created_at) 
                 VALUES (:user_id, :user_name, :action_type, :description, :ip_address, :user_agent, :created_at)"
            );
            $result = $stmt->execute($data);

            if ($isDebug) {
                error_log("Activity Log Result: " . ($result ? 'TRUE' : 'FALSE'));
            }

            return $result;
        } catch (\PDOException $e) {
            error_log("CRITICAL: Failed to record activity log: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Helper to get real IP Address
     */
    private function getIpAddress() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        }
    }
}
