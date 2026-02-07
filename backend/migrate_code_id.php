<?php
require_once 'backend/app/Config/Database.php';

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Adding code_id column to enrollments table...\n";
    
    // Check if column exists first
    $check = $db->query("SHOW COLUMNS FROM enrollments LIKE 'code_id'");
    if (!$check->fetch()) {
        $db->exec("ALTER TABLE enrollments ADD COLUMN code_id varchar(36) NULL AFTER course_id");
        echo "Column code_id added successfully.\n";
    } else {
        echo "Column code_id already exists.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
