<?php
require_once 'backend/app/Config/Database.php';
use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();
    $users = $db->query('SELECT id, name, email, phone, role FROM users')->fetchAll(PDO::FETCH_ASSOC);
    echo "--- All Users ---\n";
    print_r($users);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
