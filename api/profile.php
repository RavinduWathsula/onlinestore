<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = require_api_login();
$method = strtoupper($_SERVER['REQUEST_METHOD']);

if ($method === 'GET') {
    respond([
        'ok' => true,
        'data' => sanitize_user((array) current_user()),
    ]);
}

if ($method !== 'PATCH') {
    respond(['ok' => false, 'message' => 'Method not allowed'], 405);
}

$data = json_input();
$name = trim((string) ($data['name'] ?? ''));
$phone = trim((string) ($data['phone'] ?? ''));
$address = trim((string) ($data['address'] ?? ''));

$errors = [];
if ($name === '') {
    $errors['name'] = 'Name is required';
}
if ($phone !== '' && !preg_match('/^(07\d{8}|94\d{9}|\+94\d{9})$/', $phone)) {
    $errors['phone'] = 'Enter a valid Sri Lankan phone number';
}
if (strlen($address) > 1000) {
    $errors['address'] = 'Address is too long';
}

if ($errors) {
    respond(['ok' => false, 'errors' => $errors], 422);
}

$uid = (int) $user['id'];
$stmt = db()->prepare('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ? LIMIT 1');
$stmt->bind_param('sssi', $name, $phone, $address, $uid);
$stmt->execute();
$stmt->close();

$_SESSION['user'] = [
    'id' => $uid,
    'name' => $name,
    'email' => (string) ($user['email'] ?? ''),
    'role' => (string) ($user['role'] ?? 'customer'),
    'phone' => $phone,
    'address' => $address,
];

respond([
    'ok' => true,
    'message' => 'Profile updated successfully',
    'data' => sanitize_user($_SESSION['user']),
]);
