<?php
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'POST') json_error(405, 'Method Not Allowed');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    // Fallback for form-encoded
    $data = $_POST;
}

$name = trim($data['name'] ?? '');
$username = trim($data['username'] ?? '');
$gender = trim($data['gender'] ?? '');
$birth_day = isset($data['birth_day']) ? (int)$data['birth_day'] : 0;
$birth_month = isset($data['birth_month']) ? (int)$data['birth_month'] : 0;
$birth_year = isset($data['birth_year']) ? (int)$data['birth_year'] : 0;
$phone_number = trim($data['phone_number'] ?? '');
$address = trim($data['address'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

$errors = [];
if ($name === '') $errors['name'] = 'Name is required';
if ($username === '' || !preg_match('/^[A-Za-z0-9_.-]{3,30}$/', $username)) $errors['username'] = 'Username must be 3-30 chars (letters, numbers, _.-)';
if (!in_array($gender, ['Male','Female','Other','Prefer not to say'], true)) $errors['gender'] = 'Invalid gender';
if ($birth_day < 1 || $birth_day > 31) $errors['birth_day'] = 'Day must be 1-31';
if ($birth_month < 1 || $birth_month > 12) $errors['birth_month'] = 'Month must be 1-12';
$currentYear = (int)date('Y');
if ($birth_year < 1900 || $birth_year > $currentYear) $errors['birth_year'] = 'Year out of range';
if ($phone_number === '') $errors['phone_number'] = 'Phone number is required';
if ($address === '') $errors['address'] = 'Address is required';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Valid email is required';
if ($password === '' || strlen($password) < 6) $errors['password'] = 'Password must be at least 6 characters';
if ($errors) json_error(422, 'Validation failed', $errors);

try {
    $pdo = db_get_pdo();
    // Check duplicate email
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) json_error(409, 'Email already registered');

    // Check duplicate username
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    if ($stmt->fetch()) json_error(409, 'Username already taken');

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $role = 'user';
    $stmt = $pdo->prepare('INSERT INTO users (name, username, email, password_hash, gender, birth_day, birth_month, birth_year, phone_number, address, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$name, $username, $email, $hash, $gender, $birth_day, $birth_month, $birth_year, $phone_number, $address, $role]);
    $user_id = (int)$pdo->lastInsertId();

    // Auto-login after register
    auth_login_user($user_id);

    $user = [
        'id' => $user_id,
        'name' => $name,
        'username' => $username,
        'email' => $email,
        'gender' => $gender,
        'birth_day' => $birth_day,
        'birth_month' => $birth_month,
        'birth_year' => $birth_year,
        'phone_number' => $phone_number,
        'address' => $address,
        'role' => $role,
    ];
    json_ok(['user' => $user, 'authenticated' => true]);
} catch (Throwable $e) {
    json_error(500, 'Server error');
}
