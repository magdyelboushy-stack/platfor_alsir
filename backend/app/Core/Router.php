<?php

namespace App\Core;

class Router {
    private $routes = [];

    public function __construct() {
        $this->loadRoutes();
    }

    private function loadRoutes() {
        // Load routes from a routes file or define them here
        // For now, we will define them manually in a routes file ideally, 
        // but for this implementation we can map them here or load from app/Config/routes.php
        $this->routes = require __DIR__ . '/../Config/routes.php';
    }

    public function dispatch() {
        // Global OPTIONS Handling for CORS Preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $requestUri = str_replace('\\', '/', $requestUri);
        $method = $_SERVER['REQUEST_METHOD'];

        // Determine effective URI (Strip base path if necessary)
        $uri = $requestUri;
        $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME']);
        $scriptDir = str_replace('\\', '/', dirname($scriptName));
        
        // Only strip base path if the script is index.php or router.php
        $isEntryPoint = (strpos($scriptName, 'index.php') !== false || strpos($scriptName, 'router.php') !== false);
        $basePath = $isEntryPoint ? $scriptDir : '';

        if ($basePath !== '/' && $basePath !== '.' && !empty($basePath)) {
            if (strpos($requestUri, $basePath) === 0) {
                $uri = substr($requestUri, strlen($basePath));
            }
        }
        if (empty($uri)) $uri = '/';
        if ($uri[0] !== '/') $uri = '/' . $uri;

        // Logging
        $logFile = __DIR__ . '/../../routing.log';
        $logMsg = date('[Y-m-d H:i:s] ') . "$method $uri (Raw: $requestUri, Script: $scriptName, Base: $basePath)\n";
        @file_put_contents($logFile, $logMsg, FILE_APPEND);

        if (isset($_ENV['DEBUG']) && $_ENV['DEBUG'] === 'true') {
            error_log("Router Dispatch: $method $uri (Raw: $requestUri)");
        }

        // Global Security
        \App\Middleware\SessionMiddleware::check();

        // --- HARD-CODED FILE FALLBACKS (Priority) ---
        if ($method === 'GET') {
             $filename = basename($uri);
             
             // Avatar Fallback
             if (strpos($filename, 'avatar_') !== false && preg_match('/\.(jpg|jpeg|png|webp)$/i', $filename)) {
                  $controller = new \App\Controllers\FileController();
                  $controller->serve(['type' => 'avatars', 'filename' => $filename]);
                  return;
             }
             
             // Thumbnail Fallback
             if (strpos($filename, 'thumbnail_') !== false && preg_match('/\.(jpg|jpeg|png|webp)$/i', $filename)) {
                  $controller = new \App\Controllers\FileController();
                  $controller->serve(['type' => 'thumbnails', 'filename' => $filename]);
                  return;
             }

             // Evaluation Fallback
             if (strpos($uri, '/evaluations/') === 0 && preg_match('/\.(jpg|jpeg|png|pdf)$/i', $filename)) {
                  $controller = new \App\Controllers\FileController();
                  $controller->serve(['type' => 'evaluations', 'filename' => $filename]);
                  return;
             }
        }

        // 1. Try Exact Match
        if (isset($this->routes[$method][$uri])) {
            $handler = $this->routes[$method][$uri];
            $controllerClass = $handler[0];
            $action = $handler[1];
            $controller = new $controllerClass();
            $controller->$action([]);
            return;
        }

        // 2. Try Dynamic Regex Match
        if (isset($this->routes[$method])) {
            foreach ($this->routes[$method] as $route => $handler) {
                if (strpos($route, '{') === false) continue;

                $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $route);
                $pattern = '#^' . $pattern . '$#';

                if (preg_match($pattern, $uri, $matches)) {
                    // ROUTER DEBUG
                    // file_put_contents(__DIR__ . '/../../debug_router_match.txt', "MATCHED: $pattern for URI $uri\n", FILE_APPEND);

                    $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                    $controllerClass = $handler[0];
                    $action = $handler[1];
                    try {
                        $controller = new $controllerClass();
                        // file_put_contents(__DIR__ . '/../../debug_router_match.txt', "Controller Instantiated: $controllerClass\n", FILE_APPEND);
                        $controller->$action($params);
                        // file_put_contents(__DIR__ . '/../../debug_router_match.txt', "Action Executed: $action\n", FILE_APPEND);
                    } catch (\Throwable $e) {
                         // file_put_contents(__DIR__ . '/../../debug_router_error.txt', "Controller Error: " . $e->getMessage() . "\n", FILE_APPEND);
                         throw $e;
                    }
                    return;
                }
            }
        }

        // 3. Final 404
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'Not Found',
            'message' => "The resource '$uri' could not be resolved.",
            'debug' => [
                'uri' => $uri,
                'raw' => $requestUri,
                'method' => $method,
                'script' => $scriptName
            ]
        ]);
    }
}
