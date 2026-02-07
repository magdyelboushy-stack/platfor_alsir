<?php
// backend/public/fix_audit_logs.php

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
    
    echo "<h1>Fixing Audit Logs Table</h1>";
    
    // 1. Alter ip_address to be NULLABLE
    echo "Attempting to modify 'ip_address' column...<br>";
    $pdo->exec("ALTER TABLE audit_logs MODIFY ip_address VARCHAR(45) NULL");
    echo "<span style='color: green'>✅ 'ip_address' is now NULLABLE.</span><br>";

    // 2. Alter user_agent to be NULLABLE
    echo "Attempting to modify 'user_agent' column...<br>";
    $pdo->exec("ALTER TABLE audit_logs MODIFY user_agent TEXT NULL");
    echo "<span style='color: green'>✅ 'user_agent' is now NULLABLE.</span><br>";
    
    echo "<h2>🎉 Fixed! You can now delete users freely.</h2>";

} catch (PDOException $e) {
    echo "<h2 style='color: red'>❌ Error:</h2>";
    echo $e->getMessage();
}
