<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

require_method('POST');
$data = json_input();

$name = trim((string) ($data['name'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');

$errors = [];
if ($name === '') {
    $errors['name'] = 'Name is required';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Valid email is required';
}
if (strlen($password) < 6) {
    $errors['password'] = 'Password must be at least 6 characters';
}

if ($errors) {
    respond(['ok' => false, 'errors' => $errors], 422);
}

$check = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$check->bind_param('s', $email);
$check->execute();
$exists = $check->get_result()->fetch_assoc();
$check->close();

if ($exists) {
    respond(['ok' => false, 'errors' => ['email' => 'Email already registered']], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$role = 'customer';
$stmt = db()->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $name, $email, $hash, $role);
$stmt->execute();
$userId = (int) db()->insert_id;
$stmt->close();

respond([
    'ok' => true,
    'message' => 'Registration successful. Please login to continue.',
    'user' => [
        'id' => $userId,
        'name' => $name,
        'email' => $email,
        'role' => $role,
        'phone' => '',
        'address' => '',
    ],
], 201);
