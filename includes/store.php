<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

function get_categories(): array
{
    $result = db()->query('SELECT id, name FROM categories ORDER BY name ASC');
    return $result->fetch_all(MYSQLI_ASSOC);
}

function get_featured_products(int $limit = 8): array
{
    $limit = max(1, $limit);
    $sql = "SELECT p.id, p.name, p.price, p.stock, p.image, p.description, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            ORDER BY p.created_at DESC
            LIMIT {$limit}";

    $result = db()->query($sql);
    return $result->fetch_all(MYSQLI_ASSOC);
}

function get_products(string $search = '', int $categoryId = 0, string $sort = 'latest'): array
{
    $conditions = [];
    $types = '';
    $params = [];

    if ($search !== '') {
        $conditions[] = '(p.name LIKE ? OR p.description LIKE ?)';
        $like = '%' . $search . '%';
        $types .= 'ss';
        $params[] = $like;
        $params[] = $like;
    }

    if ($categoryId > 0) {
        $conditions[] = 'p.category_id = ?';
        $types .= 'i';
        $params[] = $categoryId;
    }

    $orderBy = match ($sort) {
        'price_low' => 'p.price ASC',
        'price_high' => 'p.price DESC',
        'name' => 'p.name ASC',
        default => 'p.created_at DESC',
    };

    $where = $conditions ? ('WHERE ' . implode(' AND ', $conditions)) : '';

    $sql = "SELECT p.id, p.name, p.price, p.stock, p.image, p.description, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            {$where}
            ORDER BY {$orderBy}";

    $stmt = db()->prepare($sql);

    if ($types !== '') {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $products = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    return $products;
}

function get_product_by_id(int $id): ?array
{
    $stmt = db()->prepare("SELECT p.id, p.name, p.price, p.stock, p.image, p.description, c.name AS category_name, c.id AS category_id
                           FROM products p
                           LEFT JOIN categories c ON c.id = p.category_id
                           WHERE p.id = ?
                           LIMIT 1");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $product = $stmt->get_result()->fetch_assoc() ?: null;
    $stmt->close();

    return $product;
}

function get_related_products(int $categoryId, int $excludeId, int $limit = 4): array
{
    $limit = max(1, $limit);

    if ($categoryId > 0) {
        $stmt = db()->prepare("SELECT id, name, price, image, stock
                               FROM products
                               WHERE category_id = ? AND id <> ?
                               ORDER BY created_at DESC
                               LIMIT {$limit}");
        $stmt->bind_param('ii', $categoryId, $excludeId);
        $stmt->execute();
        $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        if ($items) {
            return $items;
        }
    }

    $stmt = db()->prepare("SELECT id, name, price, image, stock
                           FROM products
                           WHERE id <> ?
                           ORDER BY created_at DESC
                           LIMIT {$limit}");
    $stmt->bind_param('i', $excludeId);
    $stmt->execute();
    $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    return $items;
}

function get_cart_count(int $userId): int
{
    $stmt = db()->prepare('SELECT COALESCE(SUM(quantity), 0) AS item_count FROM cart WHERE user_id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $count = (int) ($stmt->get_result()->fetch_assoc()['item_count'] ?? 0);
    $stmt->close();

    return $count;
}

function add_to_cart(int $userId, int $productId, int $quantity = 1): bool
{
    $quantity = max(1, $quantity);

    $stockStmt = db()->prepare('SELECT stock FROM products WHERE id = ? LIMIT 1');
    $stockStmt->bind_param('i', $productId);
    $stockStmt->execute();
    $product = $stockStmt->get_result()->fetch_assoc();
    $stockStmt->close();

    if (!$product) {
        return false;
    }

    $currentStock = (int) $product['stock'];
    if ($currentStock < $quantity) {
        return false;
    }

    $checkStmt = db()->prepare('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ? LIMIT 1');
    $checkStmt->bind_param('ii', $userId, $productId);
    $checkStmt->execute();
    $existing = $checkStmt->get_result()->fetch_assoc();
    $checkStmt->close();

    if ($existing) {
        $newQty = (int) $existing['quantity'] + $quantity;
        if ($newQty > $currentStock) {
            return false;
        }

        $updateStmt = db()->prepare('UPDATE cart SET quantity = ? WHERE id = ?');
        $cartId = (int) $existing['id'];
        $updateStmt->bind_param('ii', $newQty, $cartId);
        $ok = $updateStmt->execute();
        $updateStmt->close();

        return $ok;
    }

    $insertStmt = db()->prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)');
    $insertStmt->bind_param('iii', $userId, $productId, $quantity);
    $ok = $insertStmt->execute();
    $insertStmt->close();

    return $ok;
}

function get_cart_items(int $userId): array
{
    $stmt = db()->prepare("SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.stock, p.image
                           FROM cart c
                           INNER JOIN products p ON p.id = c.product_id
                           WHERE c.user_id = ?
                           ORDER BY c.added_at DESC");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    return $items;
}

function update_cart_quantity(int $userId, int $cartId, int $quantity): bool
{
    $quantity = max(1, $quantity);

    $stmt = db()->prepare("SELECT c.id, p.stock
                           FROM cart c
                           INNER JOIN products p ON p.id = c.product_id
                           WHERE c.id = ? AND c.user_id = ?
                           LIMIT 1");
    $stmt->bind_param('ii', $cartId, $userId);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row || $quantity > (int) $row['stock']) {
        return false;
    }

    $update = db()->prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?');
    $update->bind_param('iii', $quantity, $cartId, $userId);
    $ok = $update->execute();
    $update->close();

    return $ok;
}

function remove_cart_item(int $userId, int $cartId): bool
{
    $stmt = db()->prepare('DELETE FROM cart WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ii', $cartId, $userId);
    $ok = $stmt->execute();
    $stmt->close();

    return $ok;
}

function create_order_from_cart(int $userId, array $payment = []): ?int
{
    $items = get_cart_items($userId);
    if (!$items) {
        return null;
    }

    $total = 0.0;
    foreach ($items as $item) {
        if ((int) $item['quantity'] > (int) $item['stock']) {
            return null;
        }

        $total += (float) $item['price'] * (int) $item['quantity'];
    }

    $conn = db();
    $conn->begin_transaction();

    try {
        $paymentMethod = strtolower(trim((string) ($payment['payment_method'] ?? 'cash_on_delivery')));
        if (!in_array($paymentMethod, ['cash_on_delivery', 'card'], true)) {
            $paymentMethod = 'cash_on_delivery';
        }

        $orderStatus = $paymentMethod === 'card' ? 'paid' : 'pending';

        $orderStmt = $conn->prepare('INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)');
        $orderStmt->bind_param('ids', $userId, $total, $orderStatus);
        $orderStmt->execute();
        $orderId = (int) $conn->insert_id;
        $orderStmt->close();

        $itemStmt = $conn->prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        $stockStmt = $conn->prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');

        foreach ($items as $item) {
            $productId = (int) $item['product_id'];
            $quantity = (int) $item['quantity'];
            $price = (float) $item['price'];

            $itemStmt->bind_param('iiid', $orderId, $productId, $quantity, $price);
            $itemStmt->execute();

            $stockStmt->bind_param('iii', $quantity, $productId, $quantity);
            $stockStmt->execute();

            if ($stockStmt->affected_rows < 1) {
                throw new RuntimeException('Stock update failed.');
            }
        }

        $itemStmt->close();
        $stockStmt->close();

        $clearStmt = $conn->prepare('DELETE FROM cart WHERE user_id = ?');
        $clearStmt->bind_param('i', $userId);
        $clearStmt->execute();
        $clearStmt->close();

        $paymentStatus = $paymentMethod === 'card' ? 'completed' : 'pending';
        $payStmt = $conn->prepare('INSERT INTO payments (order_id, payment_method, payment_status, paid_at) VALUES (?, ?, ?, ?)');
        $paidAt = $paymentStatus === 'completed' ? date('Y-m-d H:i:s') : null;
        $payStmt->bind_param('isss', $orderId, $paymentMethod, $paymentStatus, $paidAt);
        $payStmt->execute();
        $payStmt->close();

        $conn->commit();
        return $orderId;
    } catch (Throwable $e) {
        $conn->rollback();
        return null;
    }
}
