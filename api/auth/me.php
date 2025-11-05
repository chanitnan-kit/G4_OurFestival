<?php
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';

$user = auth_current_user();
if (!$user) {
    json_ok(['authenticated' => false]);
}

json_ok(['authenticated' => true, 'user' => $user]);