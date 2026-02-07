<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Checking sessions table...\n";
    
    $sql = "CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(128) NOT NULL PRIMARY KEY,
        user_id INT UNSIGNED NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        payload TEXT NOT NULL,
        last_activity INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        INDEX (last_activity)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    
    $db->exec($sql);
    echo "Sessions table created/verified.\n";
    
    // Check columns explicitly to ensure they exist (e.g. if table existed but was different)
    // We will just try to add columns if missing (Simple migration logic)
    $columns = [
        'user_id' => 'INT UNSIGNED NULL',
        'ip_address' => 'VARCHAR(45) NULL',
        'user_agent' => 'TEXT NULL',
        'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ];

    foreach ($columns as $col => $def) {
        try {
            $db->exec("SELECT $col FROM sessions LIMIT 1");
        } catch (PDOException $e) {
            echo "Adding missing column: $col\n";
            $db->exec("ALTER TABLE sessions ADD COLUMN $col $def");
        }
    }

    echo "Schema check complete. \n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
