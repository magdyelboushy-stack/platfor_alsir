<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Adding 'success' column to login_attempts...\n";
    
    // Check if column exists
    $result = $db->query("SHOW COLUMNS FROM login_attempts LIKE 'success'");
    
    if ($result->rowCount() == 0) {
        // Add column
        $db->exec("ALTER TABLE login_attempts ADD COLUMN success TINYINT(1) DEFAULT 0 AFTER user_agent");
        echo "Column 'success' added successfully!\n";
    } else {
        echo "Column 'success' already exists.\n";
    }
    
    echo "\nDone!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
