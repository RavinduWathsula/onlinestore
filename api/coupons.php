<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

db()->query("CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(255) DEFAULT '',
    discount_type ENUM('percent','fixed','free_delivery') NOT NULL DEFAULT 'percent',
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    starts_at DATETIME NULL,
    expires_at DATETIME NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_coupons_created_by
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL,
    KEY idx_coupons_active_time (is_active, starts_at, expires_at)
) ENGINE=InnoDB");

$couponCountRow = db()->query('SELECT COUNT(*) AS total FROM coupons')->fetch_assoc();
$couponCount = (int) ($couponCountRow['total'] ?? 0);
if ($couponCount === 0) {
    db()->query("INSERT INTO coupons (code, title, description, discount_type, discount_value, is_active)
                 VALUES
                 ('FREESHIP01', 'Free Delivery Coupon #1', 'Removes LKR 450 delivery fee at checkout for all products.', 'free_delivery', 450.00, 1),
                 ('FREESHIP02', 'Free Delivery Coupon #2', 'Second free-delivery coupon valid for any checkout.', 'free_delivery', 450.00, 1),
                 ('SAVE5ALL', '5% Off Coupon', 'Get 5% discount on product subtotal for all products.', 'percent', 5.00, 1)");
}

$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method === 'GET') {
    $viewer = current_user();
    $isAdmin = is_array($viewer) && (($viewer['role'] ?? 'customer') === 'admin');
    $includeAll = $isAdmin && ((int) ($_GET['all'] ?? 0) === 1);

    if ($includeAll) {
        $rows = db()->query("SELECT id, code, title, description, discount_type, discount_value, is_active, starts_at, expires_at, created_at
                             FROM coupons
                             ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);
    } else {
        $rows = db()->query("SELECT id, code, title, description, discount_type, discount_value, starts_at, expires_at
                             FROM coupons
                             WHERE is_active = 1
                               AND (starts_at IS NULL OR starts_at <= NOW())
                               AND (expires_at IS NULL OR expires_at >= NOW())
                             ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);
    }

    $data = array_map(static function (array $row): array {
        return [
            'id' => (int) ($row['id'] ?? 0),
            'code' => strtoupper((string) ($row['code'] ?? '')),
            'title' => (string) ($row['title'] ?? ''),
            'description' => (string) ($row['description'] ?? ''),
            'type' => (string) ($row['discount_type'] ?? 'percent'),
            'value' => (float) ($row['discount_value'] ?? 0),
            'is_active' => isset($row['is_active']) ? ((int) $row['is_active'] === 1) : true,
            'starts_at' => $row['starts_at'] ?? null,
            'expires_at' => $row['expires_at'] ?? null,
            'created_at' => $row['created_at'] ?? null,
        ];
    }, $rows);

    respond(['ok' => true, 'data' => $data]);
}

if ($method === 'POST') {
    $admin = require_admin_user();
    $data = json_input();

    $code = strtoupper(trim((string) ($data['code'] ?? '')));
    $title = trim((string) ($data['title'] ?? ''));
    $description = trim((string) ($data['description'] ?? ''));
    $type = strtolower(trim((string) ($data['type'] ?? 'percent')));
    $value = (float) ($data['value'] ?? 0);
    $isActive = (int) (!isset($data['is_active']) || (bool) $data['is_active']);

    $startsAtRaw = trim((string) ($data['starts_at'] ?? ''));
    $expiresAtRaw = trim((string) ($data['expires_at'] ?? ''));

    if (!preg_match('/^[A-Z0-9_-]{3,40}$/', $code)) {
        respond(['ok' => false, 'message' => 'Coupon code must be 3-40 characters using A-Z, 0-9, _ or -'], 422);
    }

    if ($title === '') {
        respond(['ok' => false, 'message' => 'Coupon title is required'], 422);
    }

    if (!in_array($type, ['percent', 'fixed', 'free_delivery'], true)) {
        respond(['ok' => false, 'message' => 'Invalid coupon type'], 422);
    }

    if ($type === 'percent' && ($value <= 0 || $value > 100)) {
        respond(['ok' => false, 'message' => 'Percent coupons must be between 0 and 100'], 422);
    }

    if ($type !== 'percent' && $value <= 0) {
        respond(['ok' => false, 'message' => 'Coupon value must be greater than 0'], 422);
    }

    $startsAt = $startsAtRaw === '' ? null : str_replace('T', ' ', $startsAtRaw);
    $expiresAt = $expiresAtRaw === '' ? null : str_replace('T', ' ', $expiresAtRaw);

    if ($startsAt !== null && strtotime($startsAt) === false) {
        respond(['ok' => false, 'message' => 'Invalid starts_at datetime'], 422);
    }

    if ($expiresAt !== null && strtotime($expiresAt) === false) {
        respond(['ok' => false, 'message' => 'Invalid expires_at datetime'], 422);
    }

    if ($startsAt !== null && $expiresAt !== null && strtotime($startsAt) > strtotime($expiresAt)) {
        respond(['ok' => false, 'message' => 'Expiry must be after start time'], 422);
    }

    $adminId = (int) ($admin['id'] ?? 0);

    $stmt = db()->prepare(
        'INSERT INTO coupons (code, title, description, discount_type, discount_value, is_active, starts_at, expires_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            description = VALUES(description),
            discount_type = VALUES(discount_type),
            discount_value = VALUES(discount_value),
            is_active = VALUES(is_active),
            starts_at = VALUES(starts_at),
            expires_at = VALUES(expires_at)'
    );
    $stmt->bind_param('ssssdissi', $code, $title, $description, $type, $value, $isActive, $startsAt, $expiresAt, $adminId);
    $stmt->execute();
    $stmt->close();

    respond(['ok' => true, 'message' => 'Coupon saved', 'code' => $code], 201);
}

respond(['ok' => false, 'message' => 'Method not allowed'], 405);
