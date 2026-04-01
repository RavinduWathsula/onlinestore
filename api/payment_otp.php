<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = require_api_login();
require_method('POST');

$data = json_input();
$action = strtolower(trim((string) ($data['action'] ?? '')));

if (!in_array($action, ['send', 'verify'], true)) {
    respond(['ok' => false, 'message' => 'Invalid OTP action'], 422);
}

if ($action === 'send') {
    $phone = (string) ($data['phone'] ?? '');
    $result = create_payment_otp((int) $user['id'], $phone);

    if (!($result['ok'] ?? false)) {
        respond(['ok' => false, 'message' => (string) ($result['message'] ?? 'Failed to send OTP')], 422);
    }

    respond([
        'ok' => true,
        'message' => 'OTP sent to your phone number',
        'data' => [
            'otp_id' => (int) $result['otp_id'],
            'phone' => (string) $result['phone'],
            'expires_at' => (string) $result['expires_at'],
        ],
    ]);
}

$phone = (string) ($data['phone'] ?? '');
$otpId = (int) ($data['otp_id'] ?? 0);
$otpCode = preg_replace('/\D+/', '', (string) ($data['otp_code'] ?? ''));

if ($otpId <= 0) {
    respond(['ok' => false, 'message' => 'OTP request id is required'], 422);
}

$result = verify_payment_otp((int) $user['id'], $otpId, $phone, $otpCode);
if (!($result['ok'] ?? false)) {
    respond(['ok' => false, 'message' => (string) ($result['message'] ?? 'OTP verification failed')], 422);
}

respond(['ok' => true, 'message' => 'OTP verified successfully']);
