<?php
require_once 'backend/app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    // Create transactions table
    $sql = "CREATE TABLE IF NOT EXISTS transactions (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        type ENUM('deposit', 'withdrawal', 'purchase', 'activation') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        description VARCHAR(255) NOT NULL,
        status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $db->exec($sql);
    echo "Successfully created 'transactions' table.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
