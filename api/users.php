<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

require_admin_user();

$rows = db()->query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')->fetch_all(MYSQLI_ASSOC);
respond(['ok' => true, 'data' => $rows]);
