<?php
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/response.php';

function auth_current_user(): ?array {
    session_boot();
    if (empty($_SESSION['user_id'])) return null;
    $pdo = db_get_pdo();
    $stmt = $pdo->prepare('SELECT id, name, username, email, gender, birth_day, birth_month, birth_year, phone_number, address, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    return $user ?: null;
}

function auth_login_user(int $user_id): void {
    session_boot();
    $_SESSION['user_id'] = $user_id;
}

function auth_logout(): void {
    session_boot();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}

function auth_require_login(): array {
    $user = auth_current_user();
    if (!$user) json_error(401, 'Unauthorized');
    return $user;
}

function auth_require_role(string $role): array {
    $user = auth_require_login();
    if ($role === 'admin' && $user['role'] !== 'admin') json_error(403, 'Forbidden');
    return $user;
}
