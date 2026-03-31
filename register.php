<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';

redirect_if_logged_in();

$errors = [];
$name = '';
$email = '';
$phone = '';
$address = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');

    if ($name === '') {
        $errors[] = 'Name is required.';
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Valid email is required.';
    }

    if (strlen($password) < 6) {
        $errors[] = 'Password must be at least 6 characters.';
    }

    if ($password !== $confirmPassword) {
        $errors[] = 'Password confirmation does not match.';
    }

    if (!$errors) {
        $checkStmt = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $checkStmt->bind_param('s', $email);
        $checkStmt->execute();
        $exists = $checkStmt->get_result()->fetch_assoc();
        $checkStmt->close();

        if ($exists) {
            $errors[] = 'This email is already registered.';
        }
    }

    if (!$errors) {
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $role = 'customer';

        $insertStmt = db()->prepare(
            'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $insertStmt->bind_param('ssssss', $name, $email, $hashed, $role, $phone, $address);
        $insertStmt->execute();
        $userId = (int) db()->insert_id;
        $insertStmt->close();

        $_SESSION['user'] = [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'role' => $role,
        ];

        set_flash('success', 'Account created successfully.');
        header('Location: dashboard.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - NovaStore</title>
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
            <a class="btn" href="login.php">Login</a>
        </div>
    </div>

    <div class="panel glow-ring form-panel fade-up delay-1" data-tilt>
        <h2 class="form-title">Create Your Account</h2>
        <p class="form-sub">Join the creative commerce space with an elegant dark interface.</p>
        <div class="mb-4" data-react-badge="React Registration UI"></div>

        <?php if ($errors): ?>
            <div class="message error">
                <?php foreach ($errors as $error): ?>
                    <div><?php echo htmlspecialchars($error); ?></div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <form method="post" action="register.php" novalidate>
            <div class="form-grid">
                <div>
                    <label for="name">Name</label>
                    <input id="name" name="name" value="<?php echo htmlspecialchars($name); ?>" required>
                </div>

                <div>
                    <label for="email">Email</label>
                    <input id="email" type="email" name="email" value="<?php echo htmlspecialchars($email); ?>" required>
                </div>

                <div>
                    <label for="password">Password</label>
                    <input id="password" type="password" name="password" required>
                </div>

                <div>
                    <label for="confirm_password">Confirm Password</label>
                    <input id="confirm_password" type="password" name="confirm_password" required>
                </div>

                <div class="full">
                    <label for="phone">Phone</label>
                    <input id="phone" name="phone" value="<?php echo htmlspecialchars($phone); ?>">
                </div>

                <div class="full">
                    <label for="address">Address</label>
                    <textarea id="address" name="address" rows="3"><?php echo htmlspecialchars($address); ?></textarea>
                </div>
            </div>

            <button class="btn btn-primary mt-5" type="submit">Register</button>
        </form>

        <p class="text-sm text-sky-100/80 mt-4 mb-0">Already have an account? <a class="text-sky-300" href="login.php">Login here</a></p>
    </div>
</div>

<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/three@0.161.0/build/three.min.js"></script>
<script src="assets/js/theme.js?v=20260331"></script>
<script src="assets/js/react-widgets.js?v=20260331"></script>
</body>
</html>
