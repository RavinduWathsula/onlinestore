<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

require_method('POST');
require_admin_user();

$data = json_input();

$name = trim((string) ($data['name'] ?? ''));
$description = trim((string) ($data['description'] ?? ''));
$price = (float) ($data['price'] ?? 0);
$stock = max(0, (int) ($data['stock'] ?? 0));
$image = trim((string) ($data['image'] ?? ''));
$categoryId = (int) ($data['category_id'] ?? 0);

if ($name === '' || $price <= 0) {
    respond(['ok' => false, 'message' => 'Name and valid price are required'], 422);
}

$stmt = db()->prepare('INSERT INTO products (category_id, name, price, stock, description, image) VALUES (NULLIF(?, 0), ?, ?, ?, ?, ?)');
$stmt->bind_param('isdiss', $categoryId, $name, $price, $stock, $description, $image);
$stmt->execute();
$productId = (int) db()->insert_id;
$stmt->close();

respond([
    'ok' => true,
    'message' => 'Product added',
    'id' => $productId,
], 201);
