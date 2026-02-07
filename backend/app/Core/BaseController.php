<?php

namespace App\Core;

class BaseController {
    protected function json($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit();
    }

    protected function getInput() {
        $rawInput = file_get_contents('php://input');
        $decoded = json_decode($rawInput, true);
        
        if (is_array($decoded)) {
            return array_merge($_POST, $decoded);
        }
        
        return $_POST;
    }

    protected function generateUuid() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
