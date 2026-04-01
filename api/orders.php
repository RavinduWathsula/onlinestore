<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = require_api_login();
$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method === 'POST') {
    $data = json_input();
    $paymentMethod = strtolower(trim((string) ($data['payment_method'] ?? 'cash_on_delivery')));

    if (!in_array($paymentMethod, ['cash_on_delivery', 'card'], true)) {
        respond(['ok' => false, 'message' => 'Invalid payment method'], 422);
    }

    if ($paymentMethod === 'card') {
        $cardType = strtolower(trim((string) ($data['card_type'] ?? '')));
        $cardNumber = preg_replace('/\D+/', '', (string) ($data['card_number'] ?? ''));
        $expiryDate = trim((string) ($data['expiry_date'] ?? ''));
        $pin = preg_replace('/\D+/', '', (string) ($data['pin'] ?? ''));
        $phone = (string) ($data['phone'] ?? '');

        if (!in_array($cardType, ['visa', 'mastercard', 'lankaqr'], true)) {
            respond(['ok' => false, 'message' => 'Unsupported Sri Lankan card type'], 422);
        }

        if (strlen($cardNumber) !== 16) {
            respond(['ok' => false, 'message' => 'Card number must contain exactly 16 digits'], 422);
        }

        if (!preg_match('/^(0[1-9]|1[0-2])\/[0-9]{2}$/', $expiryDate)) {
            respond(['ok' => false, 'message' => 'Invalid expiry date'], 422);
        }

        if (strlen($pin) < 3 || strlen($pin) > 4) {
            respond(['ok' => false, 'message' => 'Invalid PIN'], 422);
        }

        $normalizedPhone = normalize_sri_lanka_phone($phone);
        if ($normalizedPhone === null) {
            respond(['ok' => false, 'message' => 'Invalid phone number'], 422);
        }
    }

    $orderId = create_order_from_cart((int) $user['id'], ['payment_method' => $paymentMethod]);
    if ($orderId === null) {
        respond(['ok' => false, 'message' => 'Checkout failed'], 409);
    }

    $summaryStmt = db()->prepare('SELECT total_amount, created_at FROM orders WHERE id = ? AND user_id = ? LIMIT 1');
    $uid = (int) $user['id'];
    $summaryStmt->bind_param('ii', $orderId, $uid);
    $summaryStmt->execute();
    $orderSummary = $summaryStmt->get_result()->fetch_assoc() ?: null;
    $summaryStmt->close();

    if ($paymentMethod === 'card' && isset($normalizedPhone)) {
        $amount = number_format((float) ($orderSummary['total_amount'] ?? 0), 2, '.', ',');
        $message = 'NeoCart payment successful. Amount: LKR ' . $amount . '. Order #' . $orderId . '.';
        send_sms_message($normalizedPhone, $message);
    }

    respond([
        'ok' => true,
        'message' => 'Order created',
        'order_id' => $orderId,
        'payment_method' => $paymentMethod,
        'order' => $orderSummary,
    ], 201);
}

if ($method === 'GET') {
    if (($user['role'] ?? 'customer') === 'admin') {
        $sql = 'SELECT o.id, o.total_amount, o.status, o.created_at, u.name AS customer_name, u.email,
                       p.payment_method, p.payment_status, p.paid_at
                FROM orders o
                INNER JOIN users u ON u.id = o.user_id
                LEFT JOIN payments p ON p.order_id = o.id
                ORDER BY o.created_at DESC';
        $rows = db()->query($sql)->fetch_all(MYSQLI_ASSOC);
        respond(['ok' => true, 'data' => $rows]);
    }

    $stmt = db()->prepare('SELECT o.id, o.total_amount, o.status, o.created_at, p.payment_method, p.payment_status, p.paid_at
                          FROM orders o
                          LEFT JOIN payments p ON p.order_id = o.id
                          WHERE o.user_id = ?
                          ORDER BY o.created_at DESC');
    $uid = (int) $user['id'];
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    respond(['ok' => true, 'data' => $rows]);
}

respond(['ok' => false, 'message' => 'Method not allowed'], 405);
