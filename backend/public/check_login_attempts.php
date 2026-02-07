<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    $result = $db->query("SHOW CREATE TABLE login_attempts");
    $row = $result->fetch();
    
    echo "Table Structure:\n";
    print_r($row);
    
    echo "\n\nCurrent Records:\n";
    $records = $db->query("SELECT * FROM login_attempts ORDER BY last_attempt_at DESC LIMIT 10");
    while ($r = $records->fetch()) {
        print_r($r);
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
