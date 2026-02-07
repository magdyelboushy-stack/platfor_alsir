<?php

namespace App\Utils;

/**
 * Audit Logger
 * Logs critical operations
 */
class AuditLogger {
    
    /**
     * Log operation to database
     */
    public static function log($userId, $action, $tableName, $recordId, $oldData = null, $newData = null) {
        $db = \App\Config\Database::getInstance()->getConnection();
        
        // Auto-capture role/metadata
        $role = SecureSession::get('role') ?? 'guest';
        
        // Ensure newData is an array to append metadata
        if (!is_array($newData)) {
            $newData = $newData ? ['value' => $newData] : [];
        }
        
        $newData['_meta'] = [
            'role' => $role,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ];

        $stmt = $db->prepare("
            INSERT INTO audit_logs 
            (user_id, action, table_name, record_id, old_data, new_data, ip_address, user_agent, created_at)
            VALUES 
            (:user_id, :action, :table_name, :record_id, :old_data, :new_data, :ip_address, :user_agent, NOW())
        ");
        
        $stmt->execute([
            'user_id' => $userId,
            'action' => $action,
            'table_name' => $tableName,
            'record_id' => $recordId,
            'old_data' => $oldData ? json_encode($oldData) : null,
            'new_data' => json_encode($newData),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    }
}
