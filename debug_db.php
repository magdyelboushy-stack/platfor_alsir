<?php
require_once __DIR__ . '/backend/vendor/autoload.php';
use App\Config\Database;
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/backend/');
$dotenv->safeLoad();

try {
    $db = Database::getInstance()->getConnection();
    echo "--- TRANSACTIONS TABLE SCHEMA (MySQL) ---\n";
    $fields = $db->query("DESCRIBE transactions")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($fields as $f) {
        echo "{$f['Field']} ({$f['Type']})\n";
    }
    
    echo "\n--- ACTIVATION CODES TABLE SCHEMA ---\n";
    $fields = $db->query("DESCRIBE activation_codes")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($fields as $f) {
        echo "{$f['Field']} ({$f['Type']})\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
