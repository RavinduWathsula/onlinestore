<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method === 'GET') {
    $productId = (int) ($_GET['id'] ?? 0);

    if ($productId > 0) {
        $stmt = db()->prepare(
            'SELECT p.id, p.name, p.price, p.stock, p.description, p.image, p.category_id, c.name AS category_name,
                    p.brand, p.color
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.id = ?
             LIMIT 1'
        );
        $stmt->bind_param('i', $productId);
        $stmt->execute();
        $product = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$product) {
            respond(['ok' => false, 'message' => 'Product not found'], 404);
        }

        // Fetch product options
        $optionsStmt = db()->prepare(
            'SELECT option_type, option_value FROM product_options WHERE product_id = ? ORDER BY option_type, option_value'
        );
        $optionsStmt->bind_param('i', $productId);
        $optionsStmt->execute();
        $optionsResult = $optionsStmt->get_result();
        $options = [];
        while ($row = $optionsResult->fetch_assoc()) {
            $type = $row['option_type'];
            if (!isset($options[$type])) {
                $options[$type] = [];
            }
            $options[$type][] = $row['option_value'];
        }
        $optionsStmt->close();

        $product['options'] = $options;
        respond(['ok' => true, 'data' => $product]);
    }

    $search = trim((string) ($_GET['search'] ?? ''));
    $categoryId = (int) ($_GET['category'] ?? 0);
    $sort = (string) ($_GET['sort'] ?? 'latest');
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $limit = min(24, max(1, (int) ($_GET['limit'] ?? 12)));
    $offset = ($page - 1) * $limit;

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

    $where = $conditions ? ('WHERE ' . implode(' AND ', $conditions)) : '';
    $orderBy = match ($sort) {
        'price_low' => 'p.price ASC',
        'price_high' => 'p.price DESC',
        'name' => 'p.name ASC',
        default => 'p.created_at DESC',
    };

    $countSql = "SELECT COUNT(*) AS total FROM products p {$where}";
    $countStmt = db()->prepare($countSql);
    if ($types !== '') {
        $countStmt->bind_param($types, ...$params);
    }
    $countStmt->execute();
    $total = (int) ($countStmt->get_result()->fetch_assoc()['total'] ?? 0);
    $countStmt->close();

    $sql = "SELECT p.id, p.name, p.price, p.stock, p.description, p.image, p.category_id, c.name AS category_name,
                        p.brand, p.color
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            {$where}
            ORDER BY {$orderBy}
            LIMIT ? OFFSET ?";

    $stmt = db()->prepare($sql);
    $bindTypes = $types . 'ii';
    $bindParams = $params;
    $bindParams[] = $limit;
    $bindParams[] = $offset;
    $stmt->bind_param($bindTypes, ...$bindParams);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    respond([
        'ok' => true,
        'data' => $rows,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => (int) ceil($total / $limit),
        ],
    ]);
}

if ($method === 'PUT') {
    require_admin_user();
    $data = json_input();

    $id = (int) ($data['id'] ?? 0);
    $name = trim((string) ($data['name'] ?? ''));
    $description = trim((string) ($data['description'] ?? ''));
    $price = (float) ($data['price'] ?? 0);
    $stock = max(0, (int) ($data['stock'] ?? 0));
    $image = trim((string) ($data['image'] ?? ''));
    $categoryId = (int) ($data['category_id'] ?? 0);

    if ($id < 1 || $name === '' || $price <= 0) {
        respond(['ok' => false, 'message' => 'Invalid product payload'], 422);
    }

    $stmt = db()->prepare('UPDATE products SET category_id = NULLIF(?, 0), name = ?, price = ?, stock = ?, description = ?, image = ? WHERE id = ?');
    $stmt->bind_param('isdissi', $categoryId, $name, $price, $stock, $description, $image, $id);
    $stmt->execute();
    $stmt->close();

    respond(['ok' => true, 'message' => 'Product updated']);
}

if ($method === 'DELETE') {
    require_admin_user();
    $id = (int) ($_GET['id'] ?? 0);
    if ($id < 1) {
        respond(['ok' => false, 'message' => 'Product id is required'], 422);
    }

    $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();

    respond(['ok' => true, 'message' => 'Product deleted']);
}

respond(['ok' => false, 'message' => 'Method not allowed'], 405);
