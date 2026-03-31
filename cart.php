<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/store.php';

require_login();

$user = current_user();
$userId = (int) $user['id'];
$error = null;
$success = get_flash('success');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'update') {
        $cartId = (int) ($_POST['cart_id'] ?? 0);
        $quantity = (int) ($_POST['quantity'] ?? 1);
        if (!update_cart_quantity($userId, $cartId, $quantity)) {
            $error = 'Unable to update quantity. Please try again.';
        } else {
            set_flash('success', 'Cart updated successfully.');
            header('Location: cart.php');
            exit;
        }
    }

    if ($action === 'remove') {
        $cartId = (int) ($_POST['cart_id'] ?? 0);
        remove_cart_item($userId, $cartId);
        set_flash('success', 'Item removed from cart.');
        header('Location: cart.php');
        exit;
    }

    if ($action === 'checkout') {
        $orderId = create_order_from_cart($userId);
        if ($orderId === null) {
            $error = 'Checkout failed. Please verify stock and try again.';
        } else {
            set_flash('success', 'Order #' . $orderId . ' placed successfully.');
            header('Location: dashboard.php');
            exit;
        }
    }
}

$items = get_cart_items($userId);
$cartCount = get_cart_count($userId);
$total = 0.0;
foreach ($items as $item) {
    $total += (float) $item['price'] * (int) $item['quantity'];
}

function product_image_url(?string $image): string
{
    $value = trim((string) $image);
    if ($value === '') {
        return 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=700&q=80';
    }

    return $value;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cart - NovaStore</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/theme.css">
</head>
<body>
<canvas id="bg-canvas" class="bg-canvas" aria-hidden="true"></canvas>

<div class="page-wrap">
    <header class="panel nav fade-up">
        <div class="logo-mark">NovaStore Cart</div>
        <div class="nav-links">
            <a class="btn" href="index.php">Home</a>
            <a class="btn" href="products.php">Shop</a>
            <a class="btn btn-primary" href="cart.php">Cart (<?php echo $cartCount; ?>)</a>
            <a class="btn" href="dashboard.php">Dashboard</a>
            <a class="btn" href="logout.php">Logout</a>
        </div>
    </header>

    <section class="panel cart-wrap fade-up delay-1">
        <div class="section-head compact">
            <p class="section-tag">Your Basket</p>
            <h1>Cart summary</h1>
            <p>Review quantities and place your order when ready.</p>
        </div>

        <?php if ($success): ?>
            <div class="message success"><?php echo htmlspecialchars($success); ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="message error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <?php if (!$items): ?>
            <div class="empty-state">
                <h3>Your cart is empty</h3>
                <p>Browse products and add items to start checkout.</p>
                <a class="btn btn-primary" href="products.php">Go to Shop</a>
            </div>
        <?php else: ?>
            <div class="cart-list">
                <?php foreach ($items as $item): ?>
                    <article class="cart-item" data-tilt>
                        <div class="cart-thumb">
                            <img src="<?php echo htmlspecialchars(product_image_url($item['image'])); ?>" alt="<?php echo htmlspecialchars($item['name']); ?>">
                        </div>
                        <div class="cart-main">
                            <h3><?php echo htmlspecialchars($item['name']); ?></h3>
                            <p>LKR <?php echo number_format((float) $item['price'], 2); ?></p>
                            <p class="text-sm text-sky-200/75">Stock: <?php echo (int) $item['stock']; ?></p>
                        </div>
                        <form class="cart-update" method="post" action="cart.php">
                            <input type="hidden" name="action" value="update">
                            <input type="hidden" name="cart_id" value="<?php echo (int) $item['id']; ?>">
                            <input type="number" name="quantity" min="1" max="<?php echo (int) $item['stock']; ?>" value="<?php echo (int) $item['quantity']; ?>">
                            <button class="btn" type="submit">Update</button>
                        </form>
                        <form method="post" action="cart.php">
                            <input type="hidden" name="action" value="remove">
                            <input type="hidden" name="cart_id" value="<?php echo (int) $item['id']; ?>">
                            <button class="btn danger" type="submit">Remove</button>
                        </form>
                    </article>
                <?php endforeach; ?>
            </div>

            <div class="cart-total">
                <div>
                    <p>Total</p>
                    <h2>LKR <?php echo number_format($total, 2); ?></h2>
                </div>
                <form method="post" action="cart.php">
                    <input type="hidden" name="action" value="checkout">
                    <button class="btn btn-primary" type="submit">Checkout</button>
                </form>
            </div>
        <?php endif; ?>
    </section>
</div>

<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/three@0.161.0/build/three.min.js"></script>
<script src="assets/js/theme.js?v=20260331"></script>
<script src="assets/js/react-widgets.js?v=20260331"></script>
</body>
</html>
