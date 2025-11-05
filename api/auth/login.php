<?php
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'POST') json_error(405, 'Method Not Allowed');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$identifier = trim($data['identifier'] ?? ($data['email'] ?? ''));
$password = $data['password'] ?? '';

if ($identifier === '' || $password === '') json_error(422, 'Identifier and password are required');

try {
    $pdo = db_get_pdo();

    $user = null;
    if (strpos($identifier, '@') !== false) {
        // Email
        $stmt = $pdo->prepare('SELECT id, name, username, email, role, password_hash FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$identifier]);
        $user = $stmt->fetch();
    } else {
        // Username
        $stmt = $pdo->prepare('SELECT id, name, username, email, role, password_hash FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$identifier]);
        $user = $stmt->fetch();
    }

    if (!$user) json_error(401, 'Invalid credentials');
    if (!password_verify($password, $user['password_hash'])) json_error(401, 'Invalid credentials');

    auth_login_user((int)$user['id']);
    $out = ['id' => (int)$user['id'], 'name' => $user['name'], 'username' => $user['username'], 'email' => $user['email'], 'role' => $user['role']];
    json_ok(['user' => $out, 'authenticated' => true]);
} catch (Throwable $e) {
    json_error(500, 'Server error');
}
