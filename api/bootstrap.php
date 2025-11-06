<?php
// Global bootstrap for API: error handling, autoloading, and helpers.

// Set default timezone and sane error reporting for development.
date_default_timezone_set(getenv('APP_TZ') ?: 'Asia/Bangkok');
ini_set('display_errors', getenv('APP_DEBUG') ? '1' : '0');
error_reporting(E_ALL);

// JSON error handler so uncaught exceptions become JSON responses.
set_exception_handler(function (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => [
            'message' => 'Server error',
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
});

// Lightweight autoloader for classes under api/app
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/app/';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) return;
    $relative = substr($class, strlen($prefix));
    $file = $baseDir . str_replace('\\', '/', $relative) . '.php';
    if (is_file($file)) require $file;
});

// Common helpers
require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/lib/session.php';

// Request helper functions
if (!function_exists('request_method')) {
    function request_method(): string { return $_SERVER['REQUEST_METHOD'] ?? 'GET'; }
}

if (!function_exists('request_json')) {
    function request_json(): ?array {
        $raw = file_get_contents('php://input');
        if (!is_string($raw) || $raw === '') return null;
        $data = json_decode($raw, true);
        return is_array($data) ? $data : null;
    }
}

