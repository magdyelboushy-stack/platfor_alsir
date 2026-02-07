<?php
require_once __DIR__ . '/app/Config/Database.php';

try {
    $db = \App\Config\Database::getInstance()->getConnection();
    $sql = "SELECT 
                TABLE_NAME, 
                COLUMN_NAME, 
                REFERENCED_TABLE_NAME 
            FROM 
                information_schema.KEY_COLUMN_USAGE 
            WHERE 
                TABLE_SCHEMA = DATABASE() 
                AND REFERENCED_TABLE_NAME IN ('teachers', 'courses', 'exams', 'exam_attempts', 'exam_questions', 'assistants', 'users')";
                
    $stmt = $db->query($sql);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "--- Foreign Key Constraints Found ---\n";
    foreach ($results as $r) {
        echo "{$r['TABLE_NAME']}.{$r['COLUMN_NAME']} -> {$r['REFERENCED_TABLE_NAME']}\n";
    }
    echo "--- End ---\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
