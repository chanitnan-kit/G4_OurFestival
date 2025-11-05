<?php
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/db.php';

// Admin only
auth_require_role('admin');

try {
    $pdo = db_get_pdo();
    $stmt = $pdo->query("SELECT id, name, username, email, gender, birth_day, birth_month, birth_year, phone_number, address, role, created_at FROM users WHERE role <> 'admin' ORDER BY created_at DESC");
    $users = $stmt->fetchAll();

    json_ok([
        'total' => count($users),
        'users' => $users,
    ]);
} catch (Throwable $e) {
    json_error(500, 'Server error');
}

