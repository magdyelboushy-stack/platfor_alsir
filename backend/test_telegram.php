<?php
require_once __DIR__ . '/vendor/autoload.php';

// Load Env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Services\TelegramService;

echo "Sending test notification to Telegram Admin...\n";

$testStudent = [
    'id' => 'test-uuid-1234',
    'name' => 'مجدي البوشي (اختبار كامل)',
    'phone' => '01234567890',
    'email' => 'test@example.com',
    'gender' => 'male',
    'birth_date' => '2005-01-01',
    'education_stage' => 'secondary',
    'grade_level' => '3',
    'governorate' => 'القاهرة',
    'city' => 'مدينة نصر',
    'school_name' => 'مدرسة المتفوقين',
    'guardian_name' => 'البوشي الكبير',
    'parent_phone' => '01122334455',
    'avatar' => '../storage/avatars/avatar_bdd6c4f200765c165cc46c64ac39c19e.jpg' // Using a small existing photo
];

$response = TelegramService::notifyNewStudent($testStudent);

if (isset($response['ok']) && $response['ok']) {
    echo "SUCCESS! Check your Telegram bot @basstnhalk_bot\n";
} else {
    echo "FAILED! Error: " . ($response['description'] ?? 'Unknown error') . "\n";
    print_r($response);
}
