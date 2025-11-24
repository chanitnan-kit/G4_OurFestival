<?php
namespace App\Controllers;

use PDO;

class AuthController
{
    /*
    login (POST)
    identifier = username หรือ email
    password_verify
    ถ้า ok → login session → ส่ง user
    */

    public static function login(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if ($method !== 'POST') \json_error(405, 'Method Not Allowed');

        $data = \request_json();
        if (!is_array($data)) $data = $_POST;

        $identifier = trim($data['identifier'] ?? ($data['email'] ?? ''));
        $password = $data['password'] ?? '';
        if ($identifier === '' || $password === '') \json_error(422, 'Identifier and password are required');

        try {
            $pdo = \db_get_pdo();
            if (strpos($identifier, '@') !== false) {
                $stmt = $pdo->prepare('SELECT id, name, username, email, gender, birth_day, birth_month, birth_year, phone_number, address, role, created_at, password_hash FROM users WHERE email = ? LIMIT 1');
                $stmt->execute([$identifier]);
            } else {
                $stmt = $pdo->prepare('SELECT id, name, username, email, gender, birth_day, birth_month, birth_year, phone_number, address, role, created_at, password_hash FROM users WHERE username = ? LIMIT 1');
                $stmt->execute([$identifier]);
            }
            $user = $stmt->fetch();
            if (!$user) \json_error(401, 'Invalid credentials');
            if (!password_verify($password, $user['password_hash'])) \json_error(401, 'Invalid credentials');

            \auth_login_user((int)$user['id']);
            $out = [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'username' => $user['username'],
                'email' => $user['email'],
                'gender' => $user['gender'],
                'birth_day' => isset($user['birth_day']) ? (int)$user['birth_day'] : null,
                'birth_month' => isset($user['birth_month']) ? (int)$user['birth_month'] : null,
                'birth_year' => isset($user['birth_year']) ? (int)$user['birth_year'] : null,
                'phone_number' => $user['phone_number'],
                'address' => $user['address'],
                'role' => $user['role'],
                'created_at' => $user['created_at'],
            ];
            \json_ok(['user' => $out, 'authenticated' => true]);
        } catch (\Throwable $e) {
            \json_error(500, 'Server error');
        }
    }

    /*
    Register
    validate ทุกฟิลด์ (ชื่อ username regex เพศ DOB เบอร์ ที่อยู่ อีเมล password ≥ 6)
    กัน username/email ซ้ำ (ส่ง 409)
    hash password
    insert user → role=user
    login อัตโนมัติ → ส่ง user + authenticated=true
    */

    public static function register(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if ($method !== 'POST') \json_error(405, 'Method Not Allowed');

        $data = \request_json();
        if (!is_array($data)) $data = $_POST;

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
        if ($errors) \json_error(422, 'Validation failed', $errors);

        try {
            $pdo = \db_get_pdo();
            $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            if ($stmt->fetch()) \json_error(409, 'Email already registered');

            $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
            $stmt->execute([$username]);
            if ($stmt->fetch()) \json_error(409, 'Username already taken');

            $hash = password_hash($password, PASSWORD_DEFAULT);
            $role = 'user';
            $stmt = $pdo->prepare('INSERT INTO users (name, username, email, password_hash, gender, birth_day, birth_month, birth_year, phone_number, address, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())');
            $stmt->execute([$name, $username, $email, $hash, $gender, $birth_day, $birth_month, $birth_year, $phone_number, $address, $role]);
            $user_id = (int)$pdo->lastInsertId();

            \auth_login_user($user_id);
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
            \json_ok(['user' => $user, 'authenticated' => true]);
        } catch (\Throwable $e) {
            \json_error(500, 'Server error');
        }
    }

    /*
    me (GET)
    ส่ง user หรือ authenticated=false
    */

    public static function me(): void
    {
        $user = \auth_current_user();
        if (!$user) { \json_ok(['authenticated' => false]); }
        \json_ok(['authenticated' => true, 'user' => $user]);
    }

    /*
    logout (POST)
    ลบ session
    ส่ง authenticated=false
    */

    public static function logout(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if ($method !== 'POST') \json_error(405, 'Method Not Allowed');
        \auth_logout();
        \json_ok(['authenticated' => false]);
    }
}

