<?php
// Load Composer autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Load Environment Variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

$token = $_ENV['TELEGRAM_BOT_TOKEN'] ?? '';
$domain = 'https://bistunhalk.alwaysdata.net'; // Hardcoded based on user's screenshot
$webhookUrl = $domain . '/api/webhooks/telegram';

if (!$token) {
    die("❌ Error: TELEGRAM_BOT_TOKEN is missing in .env file.");
}

echo "<h1>Telegram Webhook Setup</h1>";
echo "<p>Bot Token: " . substr($token, 0, 10) . "...</p>";
echo "<p>Setting Webhook to: <strong>$webhookUrl</strong></p>";

// 1. Get current info
$info = file_get_contents("https://api.telegram.org/bot$token/getWebhookInfo");
echo "<h3>Current Status:</h3>";
echo "<pre>" . json_encode(json_decode($info), JSON_PRETTY_PRINT) . "</pre>";

// 2. Set new webhook
$url = "https://api.telegram.org/bot$token/setWebhook?url=" . urlencode($webhookUrl);
$result = file_get_contents($url);

echo "<h3>Update Result:</h3>";
$response = json_decode($result, true);

if ($response['ok']) {
    echo "<h2 style='color:green'>✅ Webhook Updated Successfully!</h2>";
    echo "<p>Old incorrect URL has been replaced.</p>";
} else {
    echo "<h2 style='color:red'>❌ Failed to update Webhook</h2>";
    echo "<pre>" . json_encode($response, JSON_PRETTY_PRINT) . "</pre>";
}
