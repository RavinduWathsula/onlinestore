<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method !== 'GET') {
    respond(['ok' => false, 'message' => 'Method not allowed'], 405);
}

$productId = (int) ($_GET['product_id'] ?? 0);
if ($productId < 1) {
    respond(['ok' => false, 'message' => 'product_id is required'], 422);
}

$stmt = db()->prepare(
    'SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
     FROM reviews r
     INNER JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC
     LIMIT 20'
);
$stmt->bind_param('i', $productId);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

respond(['ok' => true, 'data' => $rows]);
