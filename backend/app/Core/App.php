<?php

namespace App\Core;

class App {
    public function run() {
        try {
            $router = new Router();
            $router->dispatch();
        } catch (\Exception $e) {
            http_response_code(500);
            
            $isDebug = isset($_ENV['APP_DEBUG']) && 
                       filter_var($_ENV['APP_DEBUG'], FILTER_VALIDATE_BOOLEAN);
            
            echo json_encode([
                'error' => 'Internal Server Error',
                'message' => $isDebug ? $e->getMessage() : 'An unexpected error occurred.'
            ]);
        }
    }
}
