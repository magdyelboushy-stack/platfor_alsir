<?php
require_once __DIR__ . '/vendor/autoload.php';

// Load Env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\Services\EmailService;

echo "Sending test email...\n";

$email = "mohamedtamer012866@gmail.com"; // Change to your email
$name = "مجدي البوشي";
$code = EmailService::generateCode();

$result = EmailService::sendVerifiسcationCode($email, $name, $code);

if ($result) {
    echo "SUCCESS! Email sent to: $email\n";
    echo "Verification Code: $code\n";
} else {
    echo "FAILED! Check your SMTP credentials in .env\n";
}
