<?php
// backend/public/update_db_schema.php

require_once __DIR__ . '/../vendor/autoload.php';

// Load Env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

$config = [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'database' => $_ENV['DB_DATABASE'] ?? 'bacaloria_db',
    'username' => $_ENV['DB_USERNAME'] ?? 'root',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
];

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4";
    $pdo = new PDO($dsn, $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>Updating Database Schema</h1>";
    
    // Check if column exists
    $stmt = $pdo->prepare("SHOW COLUMNS FROM users LIKE 'education_stage'");
    $stmt->execute();
    
    if ($stmt->fetch()) {
        echo "<span style='color: orange'>⚠️ Column 'education_stage' already exists.</span><br>";
    } else {
        echo "Adding 'education_stage' column...<br>";
        $sql = "ALTER TABLE users ADD COLUMN education_stage ENUM('primary', 'prep', 'secondary') NULL AFTER grade_level";
        $pdo->exec($sql);
        echo "<span style='color: green'>✅ Column 'education_stage' added successfully.</span><br>";
    }

    // Add 'objectives' column to courses if not exists
    $stmt = $pdo->prepare("SHOW COLUMNS FROM courses LIKE 'objectives'");
    $stmt->execute();

    if ($stmt->fetch()) {
        echo "<span style='color: orange'>⚠️ Column 'objectives' already exists in 'courses'.</span><br>";
    } else {
        echo "Adding 'objectives' column to courses...<br>";
        $sql = "ALTER TABLE courses ADD COLUMN objectives TEXT NULL AFTER description";
        $pdo->exec($sql);
        echo "<span style='color: green'>✅ Column 'objectives' added to 'courses' successfully.</span><br>";
    }

    // Add 'description' column to lessons if not exists
    $stmt = $pdo->prepare("SHOW COLUMNS FROM lessons LIKE 'description'");
    $stmt->execute();

    if ($stmt->fetch()) {
        echo "<span style='color: orange'>⚠️ Column 'description' already exists in 'lessons'.</span><br>";
    } else {
        echo "Adding 'description' column to lessons...<br>";
        $sql = "ALTER TABLE lessons ADD COLUMN description TEXT NULL AFTER title";
        $pdo->exec($sql);
        echo "<span style='color: green'>✅ Column 'description' added to 'lessons' successfully.</span><br>";
    }

    // Create teacher_files table if not exists
    echo "Checking/Creating 'teacher_files' table...<br>";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS teacher_files (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(100) NOT NULL,
            url TEXT NOT NULL,
            provider ENUM('local', 'cloudinary', 'external') DEFAULT 'local',
            size BIGINT DEFAULT 0,
            downloads INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user (user_id),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    echo "<span style='color: green'>✅ Table 'teacher_files' is ready.</span><br>";

    // Ensure original_name column exists
    $stmt = $pdo->prepare("SHOW COLUMNS FROM teacher_files LIKE 'original_name'");
    $stmt->execute();
    if ($stmt->fetch()) {
        echo "<span style='color: orange'>⚠️ Column 'original_name' already exists in 'teacher_files'.</span><br>";
    } else {
        echo "Adding 'original_name' column to 'teacher_files'...<br>";
        $pdo->exec("ALTER TABLE teacher_files ADD COLUMN original_name VARCHAR(255) NULL AFTER name");
        echo "<span style='color: green'>✅ Column 'original_name' added successfully.</span><br>";
    }

    // Ensure display_name column exists (library title)
    $stmt = $pdo->prepare("SHOW COLUMNS FROM teacher_files LIKE 'display_name'");
    $stmt->execute();
    if ($stmt->fetch()) {
        echo "<span style='color: orange'>⚠️ Column 'display_name' already exists in 'teacher_files'.</span><br>";
    } else {
        echo "Adding 'display_name' column to 'teacher_files'...<br>";
        $pdo->exec("ALTER TABLE teacher_files ADD COLUMN display_name VARCHAR(255) NULL AFTER original_name");
        echo "<span style='color: green'>✅ Column 'display_name' added successfully.</span><br>";
    }
    
    // Verification
    $stmt = $pdo->query("DESCRIBE teacher_files");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('display_name', $columns)) {
        echo "<h2>🎉 Teacher Files columns are up-to-date.</h2>";
    }

} catch (PDOException $e) {
    echo "<h2 style='color: red'>❌ Error:</h2>";
    echo $e->getMessage();
}

// While we are here, let's allow larger packets if needed (though this is session based)
// Actually, let's just confirm it worked.
$stmt = $pdo->query("DESCRIBE users");
$columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
if (in_array('education_stage', $columns)) {
    echo "<h2>🎉 Schema Verification Passed!</h2>";
}
