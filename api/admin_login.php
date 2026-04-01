<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

require_method('POST');
$data = json_input();

$email = trim(strtolower((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');

$adminEmail = trim(strtolower(config_env('ADMIN_PANEL_EMAIL', ADMIN_PANEL_EMAIL)));
$adminPassword = config_env('ADMIN_PANEL_PASSWORD', ADMIN_PANEL_PASSWORD);

if ($adminEmail === '' || $adminPassword === '') {
    respond(['ok' => false, 'message' => 'Admin login is not configured'], 500);
}

if ($email !== $adminEmail || !hash_equals($adminPassword, $password)) {
    respond(['ok' => false, 'message' => 'Invalid admin credentials'], 401);
}

$_SESSION['user'] = [
    'id' => 0,
    'name' => 'NeoCart Admin',
    'email' => $adminEmail,
    'role' => 'admin',
    'phone' => '',
    'address' => 'Head Office',
];

respond([
    'ok' => true,
    'message' => 'Admin login successful',
    'user' => sanitize_user($_SESSION['user']),
]);
