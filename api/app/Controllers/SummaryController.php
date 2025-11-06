<?php
namespace App\Controllers;

class SummaryController
{
    public static function registrations(): void
    {
        \auth_require_role('admin');
        try {
            $pdo = \db_get_pdo();
            $stmt = $pdo->query("SELECT id, name, username, email, gender, birth_day, birth_month, birth_year, phone_number, address, role, created_at FROM users WHERE role <> 'admin' ORDER BY created_at DESC");
            $users = $stmt->fetchAll();
            \json_ok(['total' => count($users), 'users' => $users]);
        } catch (\Throwable $e) {
            \json_error(500, 'Server error');
        }
    }

    public static function feedback(): void
    {
        \auth_require_role('admin');
        try {
            $pdo = \db_get_pdo();
            $stmt = $pdo->query('SELECT rating, COUNT(*) AS cnt FROM feedback GROUP BY rating');
            $rows = $stmt->fetchAll();
            $counts = [1=>0,2=>0,3=>0,4=>0,5=>0];
            $total = 0; $sum = 0;
            foreach ($rows as $r) {
                $rt = (int)$r['rating']; $c = (int)$r['cnt'];
                if (isset($counts[$rt])) $counts[$rt] = $c;
                $total += $c; $sum += $rt * $c;
            }
            $average = $total > 0 ? round($sum / $total, 2) : 0.0;

            $stmt = $pdo->query(
                'SELECT f.id, f.rating, f.comment, f.created_at, f.user_id, u.username, u.name
                 FROM feedback f LEFT JOIN users u ON u.id = f.user_id
                 ORDER BY f.created_at DESC LIMIT 20'
            );
            $recent = $stmt->fetchAll();

            \json_ok([
                'total' => $total,
                'average_rating' => $average,
                'counts' => $counts,
                'recent' => $recent,
            ]);
        } catch (\Throwable $e) {
            \json_error(500, 'Server error');
        }
    }
}

