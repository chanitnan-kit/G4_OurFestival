<?php
function json_response(int $status, $payload): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function json_ok($data = []): void {
    json_response(200, $data);
}

function json_error(int $status, string $message, array $errors = []): void {
    json_response($status, [
        'error' => [
            'message' => $message,
            'details' => $errors,
        ],
    ]);
}