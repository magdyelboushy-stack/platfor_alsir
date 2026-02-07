<?php
/**
 * Migration: Add SMS verification columns to users table
 */

require_once __DIR__ . '/vendor/autoload.php';

// Load Environment Variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

require_once __DIR__ . '/app/Config/Database.php';

try {
    $db = \App\Config\Database::getInstance()->getConnection();
    
    echo "Starting migration...\n";
    
    // Check if sms_code column exists (MySQL syntax)
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'sms_code'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE users ADD COLUMN sms_code VARCHAR(10) NULL");
        echo "✓ Added 'sms_code' column\n";
    } else {
        echo "- 'sms_code' column already exists\n";
    }
    
    // Check if is_sms_verified column exists (MySQL syntax)
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'is_sms_verified'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE users ADD COLUMN is_sms_verified TINYINT(1) DEFAULT 0");
        echo "✓ Added 'is_sms_verified' column\n";
    } else {
        echo "- 'is_sms_verified' column already exists\n";
    }
    
    echo "\nMigration completed successfully!\n";
    
} catch (\Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
