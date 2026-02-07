<?php
// backend/public/clear_cache.php

require_once __DIR__ . '/../vendor/autoload.php';

// Load Env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

$storage = sys_get_temp_dir() . '/rate_limiter/';

echo "<h1>Clearing Rate Limiter Cache</h1>";
echo "Path: " . htmlspecialchars($storage) . "<br>";

if (!is_dir($storage)) {
    echo "Cache directory not found. Nothing to clear.";
} else {
    $files = glob($storage . '*');
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
            echo "Deleted: " . htmlspecialchars(basename($file)) . "<br>";
        }
    }
    echo "<h2 style='color: green'>✅ Cache Cleared! You are unblocked.</h2>";
}
