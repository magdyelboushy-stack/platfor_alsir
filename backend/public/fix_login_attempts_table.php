<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Removing UNIQUE constraint from login_attempts...\n";
    
    // Drop the unique index on ip_address if exists
    try {
        $db->exec("ALTER TABLE login_attempts DROP INDEX ip_unique");
        echo "Dropped 'ip_unique' index.\n";
    } catch (Exception $e) {
        echo "Note: " . $e->getMessage() . "\n";
    }

    // Also check for unique on identifier
    try {
        $db->exec("ALTER TABLE login_attempts DROP INDEX identifier_unique");
        echo "Dropped 'identifier_unique' index.\n";
    } catch (Exception $e) {
        // Likely doesn't exist
    }
    
    echo "Done! Now each failed login attempt will create a NEW record.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
