<?php

require_once __DIR__ . '/../vendor/autoload.php';

// Load Environment Variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

// DEBUG SNIFFER
file_put_contents(__DIR__ . '/../request_log.txt', $_SERVER['REQUEST_URI'] . "\n", FILE_APPEND);

// Middleware Initialization
// Note: We use leading backslash \App to avoid conflict if we use App\Core\App later

// 1. Security Headers
\App\Middleware\SecurityHeaders::apply();

// 2. CORS
\App\Middleware\CORS::apply();

// 3. Secure Session
\App\Utils\SecureSession::start();

// 4. IP Blocker
\App\Middleware\IPBlocker::check();

// 5. Input Validation
\App\Middleware\InputValidation::validate();

// Start the Application
use App\Core\App;
$app = new App();
$app->run();
