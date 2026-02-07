<?php
/**
 * Migration: Add price and batch_name columns to activation_codes table
 * Run once to update the database schema
 */

require_once __DIR__ . '/app/Config/Database.php';

try {
    $db = \App\Config\Database::getInstance()->getConnection();
    
    echo "Starting migration...\n";
    
    // Check if price column exists
    $stmt = $db->query("SHOW COLUMNS FROM activation_codes LIKE 'price'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE activation_codes ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00 AFTER course_id");
        echo "✓ Added 'price' column\n";
    } else {
        echo "- 'price' column already exists\n";
    }
    
    // Check if batch_name column exists
    $stmt = $db->query("SHOW COLUMNS FROM activation_codes LIKE 'batch_name'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE activation_codes ADD COLUMN batch_name VARCHAR(100) NULL AFTER price");
        echo "✓ Added 'batch_name' column\n";
    } else {
        echo "- 'batch_name' column already exists\n";
    }
    
    echo "\nMigration completed successfully!\n";
    
} catch (\Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
