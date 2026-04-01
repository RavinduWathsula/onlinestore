<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function twilio_account_sid(): string
{
    $env = config_env('TWILIO_ACCOUNT_SID');
    return $env !== '' ? $env : SMS_TWILIO_ACCOUNT_SID;
}

function twilio_auth_token(): string
{
    $env = config_env('TWILIO_AUTH_TOKEN');
    return $env !== '' ? $env : SMS_TWILIO_AUTH_TOKEN;
}

function twilio_from_number(): string
{
    $env = config_env('TWILIO_FROM_NUMBER');
    return $env !== '' ? $env : SMS_TWILIO_FROM;
}

function normalize_sri_lanka_phone(string $raw): ?string
{
    $digits = preg_replace('/\D+/', '', $raw);
    if (!is_string($digits) || $digits === '') {
        return null;
    }

    if (preg_match('/^07\d{8}$/', $digits) === 1) {
        return '+94' . substr($digits, 1);
    }

    if (preg_match('/^947\d{8}$/', $digits) === 1) {
        return '+' . $digits;
    }

    if (preg_match('/^94\d{9}$/', $digits) === 1) {
        return '+' . $digits;
    }

    if (preg_match('/^\+94\d{9}$/', $raw) === 1) {
        return $raw;
    }

    return null;
}

function send_sms_message(string $toPhone, string $message): array
{
    $sid = twilio_account_sid();
    $token = twilio_auth_token();
    $from = twilio_from_number();

    if ($sid === '' || $token === '' || $from === '') {
        return [
            'ok' => false,
            'message' => 'SMS gateway is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.',
        ];
    }

    $url = 'https://api.twilio.com/2010-04-01/Accounts/' . rawurlencode($sid) . '/Messages.json';

    $postFields = http_build_query([
        'To' => $toPhone,
        'From' => $from,
        'Body' => $message,
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_USERPWD => $sid . ':' . $token,
    ]);

    $response = curl_exec($ch);
    $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        return [
            'ok' => false,
            'message' => 'SMS send failed: ' . ($curlError !== '' ? $curlError : 'Unknown cURL error'),
        ];
    }

    $decoded = json_decode($response, true);
    if ($statusCode >= 200 && $statusCode < 300 && is_array($decoded) && isset($decoded['sid'])) {
        return [
            'ok' => true,
            'message' => 'SMS sent',
            'provider_id' => (string) $decoded['sid'],
        ];
    }

    $errorMessage = 'SMS provider rejected the message.';
    if (is_array($decoded) && isset($decoded['message']) && is_string($decoded['message'])) {
        $errorMessage = $decoded['message'];
    }

    return [
        'ok' => false,
        'message' => $errorMessage,
    ];
}
