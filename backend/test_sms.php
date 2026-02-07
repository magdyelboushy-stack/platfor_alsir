<?php
require_once __DIR__ . '/vendor/autoload.php';

// Load Env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Services\SmsService;

echo "Testing SMS logging...\n";
$success = SmsService::send('0123456789', 'This is a test message to verify log file creation.');

if ($success) {
    echo "SUCCESS! Please check backend/storage/logs/sms.log\n";
} else {
    echo "FAILED! Check permissions for backend/storage/\n";
}
