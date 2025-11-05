<?php
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'POST') json_error(405, 'Method Not Allowed');

auth_logout();
json_ok(['authenticated' => false]);