<?php

namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Admin Model
 * 
 * Handles CRUD operations for the admins table.
 */
class Admin
{
    protected PDO $db;
    protected string $table = 'admins';

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getDb(): PDO
    {
        return $this->db;
    }

    /**
     * Find admin by ID
     */
    public function find(string $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    /**
     * Find admin by email
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    /**
     * Create a new admin
     */
    public function create(array $data): string
    {
        $id = $data['id'] ?? bin2hex(random_bytes(18));
        
        $sql = "INSERT INTO {$this->table} (id, name, email, phone, password, avatar, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $id,
            $data['name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['password'],
            $data['avatar'] ?? null,
            $data['status'] ?? 'active'
        ]);

        return $id;
    }

    /**
     * Update admin
     */
    public function update(string $id, array $data): bool
    {
        $fields = [];
        $values = [];

        $allowedFields = ['name', 'email', 'phone', 'password', 'avatar', 'status'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "{$field} = ?";
                $values[] = $data[$field];
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
     * Check if email exists
     */
    public function emailExists(string $email): bool
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetchColumn() > 0;
    }
}
