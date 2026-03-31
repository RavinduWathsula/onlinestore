<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';

redirect_if_logged_in();

$error = null;
$success = get_flash('success');
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        $error = 'Please enter a valid email and password.';
    } else {
        $stmt = db()->prepare('SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$user || !password_verify($password, $user['password'])) {
            $error = 'Incorrect email or password.';
        } else {
            $_SESSION['user'] = [
                'id' => (int) $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
            ];

            set_flash('success', 'Logged in successfully.');
            header('Location: dashboard.php');
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - NovaStore</title>
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
        <div class="logo-mark">NovaStore</div>
        <div class="nav-links">
            <a class="btn" href="index.php">Home</a>
            <a class="btn" href="register.php">Register</a>
        </div>
    </div>

    <div class="panel glow-ring form-panel fade-up delay-1" data-tilt>
        <h2 class="form-title">Welcome Back</h2>
        <p class="form-sub">Sign in to continue your darkblue storefront experience.</p>
        <div class="mb-4" data-react-badge="React Authentication UI"></div>

        <?php if ($success): ?>
            <div class="message success"><?php echo htmlspecialchars($success); ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="message error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="post" action="login.php" novalidate>
            <div class="full">
                <label for="email">Email</label>
                <input id="email" type="email" name="email" value="<?php echo htmlspecialchars($email); ?>" required>
            </div>

            <div class="full mt-3">
                <label for="password">Password</label>
                <input id="password" type="password" name="password" required>
            </div>

            <button class="btn btn-primary mt-5" type="submit">Login</button>
        </form>

        <p class="text-sm text-sky-100/80 mt-4 mb-0">Do not have an account? <a class="text-sky-300" href="register.php">Register here</a></p>
    </div>
</div>

<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/three@0.161.0/build/three.min.js"></script>
<script src="assets/js/theme.js?v=20260331"></script>
<script src="assets/js/react-widgets.js?v=20260331"></script>
</body>
</html>
