<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = require_api_login();
require_method('GET');

$orderId = (int) ($_GET['order_id'] ?? 0);
if ($orderId <= 0) {
    respond(['ok' => false, 'message' => 'order_id is required'], 422);
}

$isAdmin = (($user['role'] ?? 'customer') === 'admin');

if ($isAdmin) {
    $orderStmt = db()->prepare('SELECT o.id, o.user_id, o.total_amount, o.subtotal_amount, o.discount_amount, o.discount_percent, o.coupon_code, o.status, o.created_at, p.payment_method, p.payment_status, p.paid_at, u.name AS customer_name, u.email AS customer_email
                                FROM orders o
                                LEFT JOIN payments p ON p.order_id = o.id
                                INNER JOIN users u ON u.id = o.user_id
                                WHERE o.id = ?
                                LIMIT 1');
    $orderStmt->bind_param('i', $orderId);
} else {
    $orderStmt = db()->prepare('SELECT o.id, o.user_id, o.total_amount, o.subtotal_amount, o.discount_amount, o.discount_percent, o.coupon_code, o.status, o.created_at, p.payment_method, p.payment_status, p.paid_at, u.name AS customer_name, u.email AS customer_email
                                FROM orders o
                                LEFT JOIN payments p ON p.order_id = o.id
                                INNER JOIN users u ON u.id = o.user_id
                                WHERE o.id = ? AND o.user_id = ?
                                LIMIT 1');
    $uid = (int) $user['id'];
    $orderStmt->bind_param('ii', $orderId, $uid);
}

$orderStmt->execute();
$order = $orderStmt->get_result()->fetch_assoc() ?: null;
$orderStmt->close();

if (!$order) {
    respond(['ok' => false, 'message' => 'Receipt not found'], 404);
}

$itemStmt = db()->prepare('SELECT oi.product_id, oi.quantity, oi.price, p.name
                           FROM order_items oi
                           INNER JOIN products p ON p.id = oi.product_id
                           WHERE oi.order_id = ?
                           ORDER BY oi.id ASC');
$itemStmt->bind_param('i', $orderId);
$itemStmt->execute();
$items = $itemStmt->get_result()->fetch_all(MYSQLI_ASSOC);
$itemStmt->close();

respond([
    'ok' => true,
    'data' => [
        'order' => $order,
        'items' => $items,
    ],
]);
