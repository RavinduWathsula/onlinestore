<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

if (!is_logged_in()) {
    respond(['ok' => true, 'authenticated' => false, 'user' => null]);
}

respond([
    'ok' => true,
    'authenticated' => true,
    'user' => sanitize_user((array) current_user()),
]);
