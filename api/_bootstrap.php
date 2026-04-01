<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/store.php';
require_once __DIR__ . '/../includes/otp.php';
require_once __DIR__ . '/../includes/sms.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function require_method(string $method): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD']) !== strtoupper($method)) {
        respond(['ok' => false, 'message' => 'Method not allowed'], 405);
    }
}

function require_api_login(): array
{
    if (!is_logged_in()) {
        respond(['ok' => false, 'message' => 'Unauthorized'], 401);
    }

    $user = current_user();
    if (!is_array($user)) {
        respond(['ok' => false, 'message' => 'Unauthorized'], 401);
    }

    return $user;
}

function require_admin_user(): array
{
    $user = require_api_login();
    if (($user['role'] ?? 'customer') !== 'admin') {
        respond(['ok' => false, 'message' => 'Forbidden'], 403);
    }

    return $user;
}

function sanitize_user(array $user): array
{
    return [
        'id' => (int) ($user['id'] ?? 0),
        'name' => (string) ($user['name'] ?? ''),
        'email' => (string) ($user['email'] ?? ''),
        'role' => (string) ($user['role'] ?? 'customer'),
        'phone' => (string) ($user['phone'] ?? ''),
        'address' => (string) ($user['address'] ?? ''),
    ];
}
