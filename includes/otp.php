<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/sms.php';

function otp_ttl_minutes(): int
{
    $fromEnv = (int) config_env('OTP_TTL_MINUTES', (string) OTP_TTL_MINUTES);
    return max(1, $fromEnv);
}

function otp_hash_code(string $code): string
{
    return hash('sha256', $code);
}

function create_payment_otp(int $userId, string $phone): array
{
    $normalizedPhone = normalize_sri_lanka_phone($phone);
    if ($normalizedPhone === null) {
        return ['ok' => false, 'message' => 'Invalid Sri Lanka phone number.'];
    }

    $otp = (string) random_int(100000, 999999);
    $hash = otp_hash_code($otp);
    $expiresAt = (new DateTimeImmutable('now'))->modify('+' . otp_ttl_minutes() . ' minutes')->format('Y-m-d H:i:s');

    $stmt = db()->prepare('INSERT INTO payment_otps (user_id, phone, otp_hash, expires_at, status) VALUES (?, ?, ?, ?, ?)');
    $status = 'pending';
    $stmt->bind_param('issss', $userId, $normalizedPhone, $hash, $expiresAt, $status);
    $stmt->execute();
    $otpId = (int) db()->insert_id;
    $stmt->close();

    $sms = send_sms_message($normalizedPhone, 'NeoCart OTP: ' . $otp . '. It expires in ' . otp_ttl_minutes() . ' minutes.');
    if (!($sms['ok'] ?? false)) {
        $failStmt = db()->prepare('UPDATE payment_otps SET status = ? WHERE id = ? AND user_id = ?');
        $failedStatus = 'failed';
        $failStmt->bind_param('sii', $failedStatus, $otpId, $userId);
        $failStmt->execute();
        $failStmt->close();

        return ['ok' => false, 'message' => (string) ($sms['message'] ?? 'SMS delivery failed.')];
    }

    return [
        'ok' => true,
        'otp_id' => $otpId,
        'phone' => $normalizedPhone,
        'expires_at' => $expiresAt,
    ];
}

function verify_payment_otp(int $userId, int $otpId, string $phone, string $otpCode): array
{
    $normalizedPhone = normalize_sri_lanka_phone($phone);
    if ($normalizedPhone === null) {
        return ['ok' => false, 'message' => 'Invalid Sri Lanka phone number.'];
    }

    if (preg_match('/^\d{6}$/', $otpCode) !== 1) {
        return ['ok' => false, 'message' => 'Invalid OTP code.'];
    }

    $stmt = db()->prepare('SELECT id, otp_hash, expires_at, status, attempts FROM payment_otps WHERE id = ? AND user_id = ? AND phone = ? LIMIT 1');
    $stmt->bind_param('iis', $otpId, $userId, $normalizedPhone);
    $stmt->execute();
    $otpRow = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$otpRow) {
        return ['ok' => false, 'message' => 'OTP request not found.'];
    }

    if (in_array((string) $otpRow['status'], ['used', 'expired', 'failed'], true)) {
        return ['ok' => false, 'message' => 'OTP is no longer valid.'];
    }

    $expiresAt = new DateTimeImmutable((string) $otpRow['expires_at']);
    if ($expiresAt < new DateTimeImmutable('now')) {
        $expireStmt = db()->prepare('UPDATE payment_otps SET status = ? WHERE id = ? AND user_id = ?');
        $expiredStatus = 'expired';
        $expireStmt->bind_param('sii', $expiredStatus, $otpId, $userId);
        $expireStmt->execute();
        $expireStmt->close();

        return ['ok' => false, 'message' => 'OTP has expired.'];
    }

    $attempts = ((int) $otpRow['attempts']) + 1;
    if (otp_hash_code($otpCode) !== (string) $otpRow['otp_hash']) {
        $failStatus = $attempts >= 5 ? 'failed' : 'pending';
        $attemptStmt = db()->prepare('UPDATE payment_otps SET attempts = ?, status = ? WHERE id = ? AND user_id = ?');
        $attemptStmt->bind_param('isii', $attempts, $failStatus, $otpId, $userId);
        $attemptStmt->execute();
        $attemptStmt->close();

        return ['ok' => false, 'message' => 'Incorrect OTP code.'];
    }

    $verifiedAt = (new DateTimeImmutable('now'))->format('Y-m-d H:i:s');
    $verifiedStatus = 'verified';
    $verifyStmt = db()->prepare('UPDATE payment_otps SET attempts = ?, status = ?, verified_at = ? WHERE id = ? AND user_id = ?');
    $verifyStmt->bind_param('issii', $attempts, $verifiedStatus, $verifiedAt, $otpId, $userId);
    $verifyStmt->execute();
    $verifyStmt->close();

    return ['ok' => true, 'message' => 'OTP verified successfully.'];
}

function consume_verified_otp(int $userId, int $otpId, string $phone): bool
{
    $normalizedPhone = normalize_sri_lanka_phone($phone);
    if ($normalizedPhone === null) {
        return false;
    }

    $stmt = db()->prepare('SELECT id, expires_at, status FROM payment_otps WHERE id = ? AND user_id = ? AND phone = ? LIMIT 1');
    $stmt->bind_param('iis', $otpId, $userId, $normalizedPhone);
    $stmt->execute();
    $otpRow = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$otpRow || (string) $otpRow['status'] !== 'verified') {
        return false;
    }

    $expiresAt = new DateTimeImmutable((string) $otpRow['expires_at']);
    if ($expiresAt < new DateTimeImmutable('now')) {
        return false;
    }

    $usedStatus = 'used';
    $usedAt = (new DateTimeImmutable('now'))->format('Y-m-d H:i:s');
    $useStmt = db()->prepare('UPDATE payment_otps SET status = ?, used_at = ? WHERE id = ? AND user_id = ? AND phone = ?');
    $useStmt->bind_param('ssiis', $usedStatus, $usedAt, $otpId, $userId, $normalizedPhone);
    $useStmt->execute();
    $affected = $useStmt->affected_rows;
    $useStmt->close();

    return $affected > 0;
}
