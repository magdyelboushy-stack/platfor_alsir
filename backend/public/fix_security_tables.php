<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Checking security tables...\n";
    
    // Trusted Devices
    $sqlDevices = "CREATE TABLE IF NOT EXISTS trusted_devices (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        device_name VARCHAR(255) NULL,
        device_id VARCHAR(64) NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT NULL,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        INDEX (device_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    $db->exec($sqlDevices);
    echo "Trusted Devices table verified. \n";

    // Login Attempts
    $sqlAttempts = "CREATE TABLE IF NOT EXISTS login_attempts (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        identifier VARCHAR(191) NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT NULL,
        last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (ip_address),
        INDEX (identifier)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    $db->exec($sqlAttempts);
    echo "Login Attempts table verified. \n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
