<?php
/**
 * Test script to simulate a Telegram Webhook call (Button Click)
 */

$studentId = $argv[1] ?? null;
$action = $argv[2] ?? 'approve'; // 'approve' or 'reject'

if (!$studentId) {
    echo "Usage: php test_webhook.php [STUDENT_ID] [action]\n";
    echo "Example: php test_webhook.php some-uuid-123 approve\n";
    exit(1);
}

$url = "http://localhost:8001/api/webhooks/telegram";

$callbackData = ($action === 'approve' ? 'approve_' : 'reject_') . $studentId;

$payload = [
    'callback_query' => [
        'id' => '123456789',
        'from' => [
            'id' => '8265886951' // Your Chat ID
        ],
        'message' => [
            'message_id' => '999',
            'chat' => ['id' => '8265886951'],
            'text' => 'Test Message'
        ],
        'data' => $callbackData
    ]
];

echo "Simulating Telegram $action for student: $studentId...\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

echo "Response from Webhook:\n";
echo $result . "\n";
echo "\nDONE! Now check your DB or Telegram bot for the update message.\n";
