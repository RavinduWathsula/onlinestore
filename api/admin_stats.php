<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

require_admin_user();

$users = (int) (db()->query('SELECT COUNT(*) AS c FROM users')->fetch_assoc()['c'] ?? 0);
$products = (int) (db()->query('SELECT COUNT(*) AS c FROM products')->fetch_assoc()['c'] ?? 0);
$orders = (int) (db()->query('SELECT COUNT(*) AS c FROM orders')->fetch_assoc()['c'] ?? 0);
$revenue = (float) (db()->query("SELECT COALESCE(SUM(total_amount),0) AS r FROM orders WHERE status IN ('paid','shipped','delivered')")->fetch_assoc()['r'] ?? 0);

respond([
    'ok' => true,
    'data' => [
        'total_users' => $users,
        'total_products' => $products,
        'total_orders' => $orders,
        'total_revenue' => round($revenue, 2),
    ],
]);
