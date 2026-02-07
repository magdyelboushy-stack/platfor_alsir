<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

$config = [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'database' => $_ENV['DB_DATABASE'] ?? 'bacaloria_db',
    'username' => $_ENV['DB_USERNAME'] ?? 'root',
    'password' => $_ENV['DB_PASSWORD'] ?? '',
];

echo "<pre>";
try {
    $pdo = new PDO("mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4", $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to DB\n";
    
    echo "Describing activation_codes:\n";
    $stmt = $pdo->query("DESCRIBE activation_codes");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    
    echo "\nTesting Query:\n";
    $sql = "SELECT ac.*, c.title as course_name, u.name as used_by_name
            FROM activation_codes ac
            LEFT JOIN courses c ON ac.course_id = c.id
            LEFT JOIN users u ON ac.used_by = u.id";
    $stmt = $pdo->query($sql);
    echo "Query successful. Rows: " . $stmt->rowCount() . "\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
echo "</pre>";
