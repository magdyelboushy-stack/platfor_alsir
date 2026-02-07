<?php

namespace App\Core;

use App\Config\Database;
use PDO;

class Model {
    protected $table;
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function find($id) {
        if (is_array($id)) {
            $id = $id['id'] ?? reset($id);
        }
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }
    
    public function findBy($column, $value) {
        // Security: Validate column name to prevent SQL injection
        // Only allow alphanumeric characters and underscores, must start with letter or underscore
        if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $column)) {
            error_log("SECURITY: Invalid column name in findBy: " . $column);
            throw new \InvalidArgumentException("Invalid column name format");
        }
        
        $stmt = $this->db->prepare("SELECT * FROM `{$this->table}` WHERE `{$column}` = :value LIMIT 1");
        $stmt->bindParam(':value', $value);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function exists($column, $value) {
        return (bool) $this->findBy($column, $value);
    }

    public function getDb() {
        return $this->db;
    }

    public function delete($id) {
        if (is_array($id)) {
            $id = $id['id'] ?? reset($id);
        }
        $stmt = $this->db->prepare("DELETE FROM `{$this->table}` WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function update($id, $data) {
        if (is_array($id)) {
            $id = $id['id'] ?? reset($id); // Fallback to extraction if array passed
        }

        $fields = [];
        $params = [];
        foreach ($data as $key => $value) {
            // Prevent setting ID in the SET clause
            if ($key === 'id') continue;
            
            // Security: Validate column name to prevent SQL injection
            if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $key)) {
                error_log("SECURITY: Invalid column name in update: " . $key);
                continue; // Skip invalid column names
            }
            
            $fields[] = "`{$key}` = :{$key}";
            $params[$key] = $value;
        }
        
        if (empty($fields)) {
            throw new \InvalidArgumentException("No valid fields to update");
        }
        
        $fieldsStr = implode(', ', $fields);
        $stmt = $this->db->prepare("UPDATE `{$this->table}` SET {$fieldsStr} WHERE id = :id");
        $params['id'] = $id;
        
        try {
            return $stmt->execute($params);
        } catch (\PDOException $e) {
            error_log("Model update error in [{$this->table}]: " . $e->getMessage());
            throw $e;
        }
    }

    public function create($data) {
        // Security: Validate column names to prevent SQL injection
        $validKeys = [];
        $placeholders = [];
        $validData = [];
        
        foreach ($data as $key => $value) {
            if (preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $key)) {
                $validKeys[] = "`{$key}`";
                $placeholders[] = ":{$key}";
                $validData[$key] = $value;
            } else {
                error_log("SECURITY: Invalid column name in create: " . $key);
                // Skip invalid keys
            }
        }
        
        if (empty($validKeys)) {
            throw new \InvalidArgumentException("No valid fields to insert");
        }
        
        $keysStr = implode(", ", $validKeys);
        $placeholdersStr = implode(", ", $placeholders);

        $stmt = $this->db->prepare("INSERT INTO `{$this->table}` ({$keysStr}) VALUES ({$placeholdersStr})");
        if ($stmt->execute($validData)) {
            return $this->db->lastInsertId();
        }
        return false;
    }
}
