<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$items = get_categories();
respond(['ok' => true, 'data' => $items]);
