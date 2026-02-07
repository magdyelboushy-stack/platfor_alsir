<?php

namespace App\Utils;

use App\Config\Database;
use SessionHandlerInterface;

class DatabaseSessionHandler implements SessionHandlerInterface {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function open($savePath, $sessionName): bool {
        return true;
    }

    public function close(): bool {
        return true;
    }

    public function read($id): string|false {
        $stmt = $this->db->prepare("SELECT payload FROM sessions WHERE id = :id AND last_activity > :time");
        $stmt->execute([
            'id' => $id,
            'time' => time() - ini_get('session.gc_maxlifetime')
        ]);
        
        $result = $stmt->fetchColumn();
        
        if ($result) {
            // Restore Base64 decoded payload
            return base64_decode($result);
        }
        
        return '';
    }

    public function write($id, $data): bool {
        // Enforce user_id extraction if available in the session data
        // Note: $data is serialized by PHP. We handle current user via SecureSession helper if needed, 
        // but typically the handler just stores the blob. 
        // To populate user_id, ip, etc., we can extract them or update them separately.
        // For standard handler, we just store the payload.
        // However, we want to populate the extra columns (user_id, ip, etc.)
        
        // We defer specific column updates to the App logic or try to sniff:
        $userId = !empty($_SESSION['user_id']) ? $_SESSION['user_id'] : null; 
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

        $payload = base64_encode($data);
        $time = time();

        $sql = "INSERT INTO sessions (id, user_id, ip_address, user_agent, payload, last_activity, created_at) 
                VALUES (:id, :user_id, :ip, :agent, :payload, :last_activity, NOW())
                ON DUPLICATE KEY UPDATE 
                payload = VALUES(payload), 
                last_activity = VALUES(last_activity),
                user_id = VALUES(user_id),
                ip_address = VALUES(ip_address),
                user_agent = VALUES(user_agent)";
        
        try {
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                'id' => $id,
                'user_id' => $userId,
                'ip' => $ip,
                'agent' => $agent,
                'payload' => $payload,
                'last_activity' => $time
            ]);
        } catch (\Exception $e) {
            file_put_contents(__DIR__ . '/../../logs/session_errors.log', $e->getMessage() . "\n", FILE_APPEND);
            return false;
        }
    }

    public function destroy($id): bool {
        $stmt = $this->db->prepare("DELETE FROM sessions WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function gc($maxlifetime): int|false {
        $stmt = $this->db->prepare("DELETE FROM sessions WHERE last_activity < :time");
        $stmt->execute(['time' => time() - $maxlifetime]);
        return $stmt->rowCount();
    }
}
