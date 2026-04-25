<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

require_admin_user();

$tablesResult = db()->query('SHOW TABLE STATUS');
$tables = [];

while ($table = $tablesResult->fetch_assoc()) {
    $tableName = (string) ($table['Name'] ?? '');
    if ($tableName === '') {
        continue;
    }

    $safeTableName = '`' . str_replace('`', '``', $tableName) . '`';
    $columnRows = db()->query('SHOW COLUMNS FROM ' . $safeTableName)->fetch_all(MYSQLI_ASSOC);
    $sampleRows = db()->query('SELECT * FROM ' . $safeTableName . ' ORDER BY 1 DESC LIMIT 5')->fetch_all(MYSQLI_ASSOC);

    $tables[] = [
        'name' => $tableName,
        'engine' => (string) ($table['Engine'] ?? ''),
        'rows' => (int) ($table['Rows'] ?? 0),
        'size_mb' => round(((float) ($table['Data_length'] ?? 0) + (float) ($table['Index_length'] ?? 0)) / 1024 / 1024, 2),
        'created_at' => $table['Create_time'] ?? null,
        'updated_at' => $table['Update_time'] ?? null,
        'columns' => array_map(static fn (array $column): array => [
            'field' => (string) ($column['Field'] ?? ''),
            'type' => (string) ($column['Type'] ?? ''),
            'null' => (string) ($column['Null'] ?? ''),
            'key' => (string) ($column['Key'] ?? ''),
            'default' => $column['Default'],
            'extra' => (string) ($column['Extra'] ?? ''),
        ], $columnRows),
        'sample_rows' => $sampleRows,
    ];
}

respond([
    'ok' => true,
    'data' => [
        'database' => defined('DB_NAME') ? DB_NAME : 'novastore',
        'table_count' => count($tables),
        'tables' => $tables,
    ],
]);