<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

require_method('POST');
$data = json_input();

$email = trim((string) ($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    respond(['ok' => false, 'message' => 'Invalid credentials'], 422);
}

$stmt = db()->prepare('SELECT id, name, email, password, role, phone, address FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, (string) $user['password'])) {
    respond(['ok' => false, 'message' => 'Email or password is incorrect'], 401);
}

$_SESSION['user'] = [
    'id' => (int) $user['id'],
    'name' => (string) $user['name'],
    'email' => (string) $user['email'],
    'role' => (string) $user['role'],
    'phone' => (string) ($user['phone'] ?? ''),
    'address' => (string) ($user['address'] ?? ''),
];

respond([
    'ok' => true,
    'message' => 'Login successful',
    'user' => sanitize_user($_SESSION['user']),
]);
