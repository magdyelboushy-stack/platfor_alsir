<?php
require_once __DIR__ . '/vendor/autoload.php';

// Load Env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Services\TelegramService;

// Turn on error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Testing Telegram Notification...\n";

// 1. Check Credentials
$token = $_ENV['TELEGRAM_BOT_TOKEN'] ?? null;
$chatId = $_ENV['TELEGRAM_ADMIN_CHAT_ID'] ?? null;

echo "Token: " . ($token ? "Set (" . substr($token, 0, 5) . "...)" : "MISSING") . "\n";
echo "ChatID: " . ($chatId ? "Set ($chatId)" : "MISSING") . "\n";

if (!$token || !$chatId) {
    die("❌ Error: Missing credentials in .env\n");
}

// 2. Test Simple Message
echo "Sending simple message test...\n";
$result = TelegramService::sendMessage("🔔 Test Message from Debugger \nTime: " . date('H:i:s'));
print_r($result);

if (isset($result['ok']) && $result['ok']) {
    echo "✅ Simple Message Sent!\n";
} else {
    echo "❌ Simple Message Failed!\n";
}

// 3. Test Student Notification (Mock Data)
echo "\nSending Student Notification Mock...\n";
$mockStudent = [
    'id' => 999,
    'name' => 'Test Student (Debug)',
    'email' => 'test@debug.com',
    'phone' => '01000000000',
    'pass_password' => 'secret',
    'gender' => 'male',
    'birth_date' => '2000-01-01',
    'education_stage' => 'secondary',
    'grade_level' => '12',
    'governorate' => 'Cairo',
    'city' => 'Nasr City',
    'school_name' => 'Debug School',
    'guardian_name' => 'Father Debug',
    'parent_phone' => '01100000000'
];

$resNotify = TelegramService::notifyNewStudent($mockStudent);
print_r($resNotify);

if (isset($resNotify['ok']) && $resNotify['ok']) {
    echo "✅ Notification Sent!\n";
} else {
    echo "❌ Notification Failed!\n";
}
