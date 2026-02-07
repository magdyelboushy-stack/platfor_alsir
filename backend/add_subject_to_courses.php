<?php
// ============================================================
// Database Migration Script - Add Subject to Courses
// ============================================================

require_once 'vendor/autoload.php';

// Load Environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Checking schema for 'courses' table...\n";
    
    // Check if column exists
    $check = $db->query("SHOW COLUMNS FROM courses LIKE 'subject'");
    if ($check->rowCount() === 0) {
        echo "Adding 'subject' column to 'courses' table...\n";
        $db->exec("ALTER TABLE courses ADD COLUMN subject VARCHAR(100) AFTER grade_level");
        echo "Successfully added 'subject' column.\n";
    } else {
        echo "Column 'subject' already exists.\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
