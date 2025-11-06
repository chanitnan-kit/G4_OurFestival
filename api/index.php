<?php
// Front controller for /api/*
// Rewrites (via .htaccess) send paths to this file as index.php?r=...

require_once __DIR__ . '/bootstrap.php';

use App\Controllers\AuthController;
use App\Controllers\FeedbackController;
use App\Controllers\SummaryController;

// Determine requested route path, e.g. 'auth/me.php' or 'summary/registrations.php'
$route = isset($_GET['r']) ? (string)$_GET['r'] : '';
$route = trim($route, "/\t\r\n\0\x0B");

// Basic safety: block traversal
if ($route === '' || strpos($route, '..') !== false) {
    json_error(404, 'Not found');
}

// Normalize: also support keys without .php
$key = rtrim($route, '/');
if (substr($key, -4) === '.php') {
    $keyNoExt = substr($key, 0, -4);
} else {
    $keyNoExt = $key;
}

// Route map -> [class, method]
$map = [
    // Auth
    'auth/login' => [AuthController::class, 'login'],
    'auth/register' => [AuthController::class, 'register'],
    'auth/me' => [AuthController::class, 'me'],
    'auth/logout' => [AuthController::class, 'logout'],
    // Feedback
    'feedback/create' => [FeedbackController::class, 'create'],
    'feedback/list' => [FeedbackController::class, 'list'],
    // Summary
    'summary/registrations' => [SummaryController::class, 'registrations'],
    'summary/feedback' => [SummaryController::class, 'feedback'],
];

if (isset($map[$keyNoExt])) {
    [$class, $method] = $map[$keyNoExt];
    $class::$method();
    exit; // controller should have exited via json_* helpers
}
json_error(404, 'Route not found');
