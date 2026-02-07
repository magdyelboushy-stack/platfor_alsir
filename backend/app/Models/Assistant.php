<?php

namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Assistant Model
 * 
 * Handles CRUD operations for the assistants table.
 * Assistants work directly under Admin (single-teacher platform).
 */
class Assistant
{
    protected PDO $db;
    protected string $table = 'assistants';

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getDb(): PDO
    {
        return $this->db;
    }

    /**
     * Find assistant by ID
     */
    public function find(string $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $result['permissions'] = json_decode($result['permissions'] ?? '[]', true);
        }
        
        return $result ?: null;
    }

    /**
     * Find assistant by email
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $result['permissions'] = json_decode($result['permissions'] ?? '[]', true);
        }
        
        return $result ?: null;
    }

    /**
     * Find assistant by field
     */
    public function findBy(string $field, string $value): ?array
    {
        $allowedFields = ['email', 'phone', 'id'];
        if (!in_array($field, $allowedFields)) {
            return null;
        }
        
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE {$field} = ?");
        $stmt->execute([$value]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $result['permissions'] = json_decode($result['permissions'] ?? '[]', true);
        }
        
        return $result ?: null;
    }

    /**
     * Get all assistants
     */
    public function all(): array
    {
        $stmt = $this->db->query("SELECT * FROM {$this->table} ORDER BY created_at DESC");
        $assistants = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_map(function($a) {
            $a['permissions'] = json_decode($a['permissions'] ?? '[]', true);
            return $a;
        }, $assistants);
    }

    /**
     * Create a new assistant
     */
    public function create(array $data): string
    {
        $id = $data['id'] ?? bin2hex(random_bytes(18));
        
        $sql = "INSERT INTO {$this->table} 
                (id, name, email, phone, password, avatar, permissions, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $id,
            $data['name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['password'],
            $data['avatar'] ?? null,
            json_encode($data['permissions'] ?? []),
            $data['status'] ?? 'active'
        ]);

        return $id;
    }

    /**
     * Update assistant
     */
    public function update(string $id, array $data): bool
    {
        $fields = [];
        $values = [];

        $allowedFields = ['name', 'email', 'phone', 'password', 'avatar', 'permissions', 'status'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "{$field} = ?";
                
                if ($field === 'permissions' && is_array($data[$field])) {
                    $values[] = json_encode($data[$field]);
                } else {
                    $values[] = $data[$field];
                }
            }
        }

        if (empty($fields)) {
            return false;
        }

        $values[] = $id;
        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    /**
     * Delete assistant
     */
    public function delete(string $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Check if email exists
     */
    public function emailExists(string $email, ?string $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) FROM {$this->table} WHERE email = ?";
        $params = [$email];
        
        if ($excludeId) {
            $sql .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchColumn() > 0;
    }
}
