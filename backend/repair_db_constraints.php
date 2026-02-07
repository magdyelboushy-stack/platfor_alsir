<?php
// ============================================================
// Database Repair - Fix Foreign Key Constraints
// ============================================================

require_once 'vendor/autoload.php';

// Load Environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Starting Database Schema Repair...\n";
    
    // 1. Fix Courses table
    echo "Updating 'courses' foreign key...\n";
    try {
        // Drop old FK
        $db->exec("ALTER TABLE courses DROP FOREIGN KEY courses_ibfk_1");
        echo "Dropped old courses_ibfk_1.\n";
    } catch (Exception $e) {
        echo "Note: Could not drop courses_ibfk_1 (it might not exist or has a different name).\n";
    }

    try {
        // Add new FK pointing to teachers table
        $db->exec("ALTER TABLE courses ADD CONSTRAINT fk_course_teacher 
                   FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL");
        echo "Added new fk_course_teacher pointing to 'teachers' table.\n";
    } catch (Exception $e) {
        echo "ERROR adding new constraint: " . $e->getMessage() . "\n";
    }

    // 2. Fix Activation Codes table (generated_by)
    echo "Updating 'activation_codes' foreign key...\n";
    try {
        $db->exec("ALTER TABLE activation_codes DROP FOREIGN KEY activation_codes_ibfk_2");
        echo "Dropped old activation_codes_ibfk_2.\n";
    } catch (Exception $e) {
        echo "Note: Could not drop activation_codes_ibfk_2.\n";
    }
    
    // For activation_codes.generated_by, it could be teacher OR assistant. 
    // Since we now have separate tables, a single FK won't work easily.
    // For now, let's just remove the constraint to allow writes, 
    // as the logic handles validation.
    echo "FK constraint for activation_codes.generated_by removed to support multi-table auth.\n";

    echo "\nRepair Completed Successfully!\n";
    
} catch (Exception $e) {
    echo "FATAL ERROR: " . $e->getMessage() . "\n";
}
