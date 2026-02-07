<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Config\Database;

// Basic setup
$_ENV['APP_ENV'] = 'development';
$_ENV['DB_HOST'] = 'localhost';
$_ENV['DB_DATABASE'] = 'bacaloria_db';
$_ENV['DB_USERNAME'] = 'root';
$_ENV['DB_PASSWORD'] = '';

try {
    $db = Database::getInstance()->getConnection();

    echo "--- Students Data ---\n";
    $stmt = $db->query("SELECT id, name, education_stage, grade_level FROM users WHERE role = 'student'");
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($students as $s) {
        printf("ID: %s | Name: %s | Stage: [%s] | Grade: [%s]\n", 
            $s['id'], $s['name'], $s['education_stage'], $s['grade_level']);
    }

    echo "\n--- Courses Data ---\n";
    $stmt = $db->query("SELECT id, title, education_stage, grade_level, status, thumbnail FROM courses");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($courses as $c) {
        printf("ID: %s | Title: %s | Stage: [%s] | Grade: [%s] | Status: %s | Thumbnail: [%s]\n", 
            $c['id'], $c['title'], $c['education_stage'], $c['grade_level'], $c['status'], $c['thumbnail'] ?? 'NULL');
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
