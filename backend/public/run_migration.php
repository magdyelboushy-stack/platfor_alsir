<?php
// backend/public/run_migration.php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// Load Env
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

$config = [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'database' => $_ENV['DB_DATABASE'] ?? 'bacaloria_db',
    'username' => $_ENV['DB_USERNAME'] ?? 'root',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
];

try {
    echo "<h1>Database Migration Tool</h1>";
    echo "Connecting to database...<br>";
    
    $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        // Enable multi-statements if needed, but splitting is safer usually
    ];
    $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
    
    $migrationFile = __DIR__ . '/../database/migrations/remove_teacher_role.sql';
    
    if (!file_exists($migrationFile)) {
        die("<span style='color: red'>Error: Migration file not found at $migrationFile</span>");
    }
    
    echo "Reading migration file: " . basename($migrationFile) . "...<br>";
    $sql = file_get_contents($migrationFile);
    
    // Disable FK checks globally for the session
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Split by semicolon, but be careful about generated semicolons (?)
    // Simple split usually works for simple SQL dumps
    $statements = explode(';', $sql);
    
    $count = 0;
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement)) continue;
        
        try {
            $pdo->exec($statement);
            $count++;
        } catch (PDOException $e) {
            // Ignore "DROP table if exists" errors if they technically fail? No, they shouldn't.
            // But log error
            echo "<span style='color: orange'>Warning on statement: " . htmlspecialchars(substr($statement, 0, 50)) . "...</span><br>";
            echo "Error: " . $e->getMessage() . "<br>";
        }
    }
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    echo "<h2 style='color: green'>✅ Migration Completed! Executed $count statements.</h2>";
    echo "<p>You can now delete this file or rename it.</p>";

} catch (PDOException $e) {
    echo "<h2 style='color: red'>❌ Database Connection Error:</h2>";
    echo $e->getMessage();
}
