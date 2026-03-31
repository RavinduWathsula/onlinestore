<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = require_api_login();
$userId = (int) $user['id'];
$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method === 'GET') {
    $items = get_cart_items($userId);
    $total = 0.0;
    foreach ($items as $item) {
        $total += ((float) $item['price']) * ((int) $item['quantity']);
    }

    respond([
        'ok' => true,
        'data' => $items,
        'summary' => [
            'count' => get_cart_count($userId),
            'total' => round($total, 2),
        ],
    ]);
}

if ($method === 'POST') {
    $data = json_input();
    $productId = (int) ($data['product_id'] ?? 0);
    $quantity = max(1, (int) ($data['quantity'] ?? 1));

    if ($productId < 1) {
        respond(['ok' => false, 'message' => 'Invalid product'], 422);
    }

    $ok = add_to_cart($userId, $productId, $quantity);
    if (!$ok) {
        respond(['ok' => false, 'message' => 'Could not add to cart'], 409);
    }

    respond(['ok' => true, 'message' => 'Added to cart']);
}

if ($method === 'PATCH') {
    $data = json_input();
    $cartId = (int) ($data['cart_id'] ?? 0);
    $quantity = max(1, (int) ($data['quantity'] ?? 1));

    if ($cartId < 1) {
        respond(['ok' => false, 'message' => 'Invalid cart item'], 422);
    }

    $ok = update_cart_quantity($userId, $cartId, $quantity);
    if (!$ok) {
        respond(['ok' => false, 'message' => 'Could not update cart'], 409);
    }

    respond(['ok' => true, 'message' => 'Cart updated']);
}

if ($method === 'DELETE') {
    $cartId = (int) ($_GET['cart_id'] ?? 0);
    if ($cartId < 1) {
        respond(['ok' => false, 'message' => 'Invalid cart item'], 422);
    }

    remove_cart_item($userId, $cartId);
    respond(['ok' => true, 'message' => 'Removed from cart']);
}

respond(['ok' => false, 'message' => 'Method not allowed'], 405);
