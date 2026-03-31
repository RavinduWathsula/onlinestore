<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';

require_login();

$user = current_user();
$success = get_flash('success');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - NovaStore</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/theme.css">
</head>
<body>
<canvas id="bg-canvas" class="bg-canvas" aria-hidden="true"></canvas>

<div class="page-wrap">
    <div class="panel nav fade-up">
        <div class="logo-mark">NovaStore Dashboard</div>
        <div class="nav-links">
            <a class="btn" href="index.php">Home</a>
            <a class="btn" href="logout.php">Logout</a>
        </div>
    </div>

    <section class="panel glow-ring hero fade-up delay-1" data-tilt>
        <div>
            <p class="text-sky-300 uppercase tracking-[0.2em] text-xs m-0">Control Center</p>
            <h2 class="text-4xl m-0 mt-1">Welcome, <?php echo htmlspecialchars($user['name']); ?></h2>
            <p class="mt-4">Manage your account inside a premium darkblue workspace built for modern e-commerce.</p>
            <div class="mb-4" data-react-badge="React Dashboard Widgets"></div>

            <?php if ($success): ?>
                <div class="message success"><?php echo htmlspecialchars($success); ?></div>
            <?php endif; ?>
        </div>

        <div class="grid-3">
            <article class="stat-card" data-tilt>
                <div class="stat-title">Profile</div>
                <div class="stat-value"><?php echo htmlspecialchars($user['name']); ?></div>
            </article>
            <article class="stat-card" data-tilt>
                <div class="stat-title">Email</div>
                <div class="text-base break-all"><?php echo htmlspecialchars($user['email']); ?></div>
            </article>
            <article class="stat-card" data-tilt>
                <div class="stat-title">Role</div>
                <div class="stat-value"><?php echo htmlspecialchars($user['role']); ?></div>
            </article>
        </div>
    </section>
</div>

<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/three@0.161.0/build/three.min.js"></script>
<script src="assets/js/theme.js?v=20260331"></script>
<script src="assets/js/react-widgets.js?v=20260331"></script>
</body>
</html>
