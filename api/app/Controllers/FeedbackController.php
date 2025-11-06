<?php
namespace App\Controllers;

use PDO;

class FeedbackController
{
    public static function create(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if ($method !== 'POST') \json_error(405, 'Method Not Allowed');

        $data = \request_json();
        if (!is_array($data)) $data = $_POST;

        $rating = isset($data['rating']) ? (int)$data['rating'] : 0;
        $comment = trim((string)($data['comment'] ?? $data['feedback'] ?? ''));

        $errors = [];
        if ($rating < 1 || $rating > 5) $errors['rating'] = 'Rating must be 1-5';
        if ($comment === '') $errors['comment'] = 'Comment is required';
        if (mb_strlen($comment) > 2000) $errors['comment'] = 'Comment too long (max 2000 characters)';
        if ($errors) \json_error(422, 'Validation failed', $errors);

        try {
            $pdo = \db_get_pdo();
            $user = \auth_current_user();
            $user_id = $user ? (int)$user['id'] : null;

            $stmt = $pdo->prepare('INSERT INTO feedback (user_id, rating, comment, created_at) VALUES (?, ?, ?, NOW())');
            $stmt->execute([$user_id, $rating, $comment]);
            $id = (int)$pdo->lastInsertId();

            \json_ok([
                'id' => $id,
                'rating' => $rating,
                'comment' => $comment,
                'user_id' => $user_id,
                'created_at' => date('c'),
            ]);
        } catch (\Throwable $e) {
            \json_error(500, 'Server error');
        }
    }

    public static function list(): void
    {
        \auth_require_role('admin');
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        if ($limit < 1) $limit = 1;
        if ($limit > 500) $limit = 500;
        if ($offset < 0) $offset = 0;

        try {
            $pdo = \db_get_pdo();
            $stmt = $pdo->prepare(
                'SELECT f.id, f.user_id, u.username, u.name, f.rating, f.comment, f.created_at
                 FROM feedback f
                 LEFT JOIN users u ON u.id = f.user_id
                 ORDER BY f.created_at DESC
                 LIMIT :limit OFFSET :offset'
            );
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $items = $stmt->fetchAll();
            $total = (int)$pdo->query('SELECT COUNT(*) FROM feedback')->fetchColumn();

            \json_ok([
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset,
                'items' => $items,
            ]);
        } catch (\Throwable $e) {
            \json_error(500, 'Server error');
        }
    }
}

