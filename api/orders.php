<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = require_api_login();
$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method === 'POST') {
    $orderId = create_order_from_cart((int) $user['id']);
    if ($orderId === null) {
        respond(['ok' => false, 'message' => 'Checkout failed'], 409);
    }

    respond(['ok' => true, 'message' => 'Order created', 'order_id' => $orderId], 201);
}

if ($method === 'GET') {
    if (($user['role'] ?? 'customer') === 'admin') {
        $sql = 'SELECT o.id, o.total_amount, o.status, o.created_at, u.name AS customer_name, u.email
                FROM orders o
                INNER JOIN users u ON u.id = o.user_id
                ORDER BY o.created_at DESC';
        $rows = db()->query($sql)->fetch_all(MYSQLI_ASSOC);
        respond(['ok' => true, 'data' => $rows]);
    }

    $stmt = db()->prepare('SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC');
    $uid = (int) $user['id'];
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    respond(['ok' => true, 'data' => $rows]);
}

respond(['ok' => false, 'message' => 'Method not allowed'], 405);
