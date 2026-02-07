<?php
// public/api/csrf-token.php

require_once __DIR__ . '/../../vendor/autoload.php';

// Load Env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->safeLoad();

// Allow CORS Dynamically
$allowedOrigins = explode(',', $_ENV['ALLOWED_ORIGINS'] ?? 'http://localhost:3000');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");

// Start Secure Session
\App\Utils\SecureSession::start();

// Generate Token
$token = \App\Utils\CSRF::generate();

echo json_encode([
    'csrf_token' => $token,
    'message' => 'Include this token in your POST request body as csrf_token',
    'session_id' => session_id()
]);
