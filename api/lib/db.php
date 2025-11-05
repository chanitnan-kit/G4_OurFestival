<?php
function db_get_pdo(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $config = require __DIR__ . '/../config/database.php';
    $host = $config['host'];
    $port = $config['port'];
    $db   = $config['database'];
    $charset = $config['charset'];
    $user = $config['username'];
    $pass = $config['password'];

    $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, $user, $pass, $options);
    return $pdo;
}