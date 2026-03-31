<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/store.php';

$user = current_user();
$productId = (int) ($_GET['id'] ?? 0);
$product = $productId > 0 ? get_product_by_id($productId) : null;
$cartCount = $user ? get_cart_count((int) $user['id']) : 0;
$error = null;

if (!$product) {
    set_flash('error', 'Product not found.');
    header('Location: products.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$user) {
        set_flash('error', 'Please login to add items to cart.');
        header('Location: login.php');
        exit;
    }

    $qty = max(1, (int) ($_POST['quantity'] ?? 1));
    $ok = add_to_cart((int) $user['id'], (int) $product['id'], $qty);

    if ($ok) {
        set_flash('success', 'Item added to cart.');
        header('Location: cart.php');
        exit;
    }

    $error = 'Unable to add to cart. Check stock and try again.';
}

$related = get_related_products((int) ($product['category_id'] ?? 0), (int) $product['id']);

function product_image_url(?string $image): string
{
    $value = trim((string) $image);
    if ($value === '') {
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80';
    }

    return $value;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($product['name']); ?> - NovaStore</title>
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
        <div class="logo-mark">NovaStore Product</div>
        <div class="nav-links">
            <a class="btn" href="index.php">Home</a>
            <a class="btn" href="products.php">Shop</a>
            <a class="btn" href="cart.php">Cart (<?php echo $cartCount; ?>)</a>
            <?php if ($user): ?>
                <a class="btn" href="dashboard.php">Dashboard</a>
                <a class="btn" href="logout.php">Logout</a>
            <?php else: ?>
                <a class="btn" href="login.php">Login</a>
            <?php endif; ?>
        </div>
    </header>

    <section class="panel product-detail fade-up delay-1">
        <div class="product-detail-image" data-tilt>
            <img src="<?php echo htmlspecialchars(product_image_url($product['image'])); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>">
        </div>
        <div class="product-detail-body">
            <p class="section-tag"><?php echo htmlspecialchars((string) ($product['category_name'] ?? 'Uncategorized')); ?></p>
            <h1><?php echo htmlspecialchars($product['name']); ?></h1>
            <p class="product-detail-price">LKR <?php echo number_format((float) $product['price'], 2); ?></p>
            <p class="product-detail-stock"><?php echo (int) $product['stock'] > 0 ? 'In stock: ' . (int) $product['stock'] : 'Currently out of stock'; ?></p>
            <p class="product-detail-desc"><?php echo nl2br(htmlspecialchars((string) $product['description'])); ?></p>

            <?php if ($error): ?>
                <div class="message error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <form class="add-cart-form" method="post" action="product.php?id=<?php echo (int) $product['id']; ?>">
                <input type="number" name="quantity" min="1" max="<?php echo max(1, (int) $product['stock']); ?>" value="1" <?php echo (int) $product['stock'] < 1 ? 'disabled' : ''; ?>>
                <button class="btn btn-primary" type="submit" <?php echo (int) $product['stock'] < 1 ? 'disabled' : ''; ?>>Add to Cart</button>
            </form>
        </div>
    </section>

    <section class="panel related-panel fade-up delay-2">
        <div class="section-head compact">
            <p class="section-tag">You May Also Like</p>
            <h2>Related products</h2>
        </div>
        <div class="market-grid">
            <?php foreach ($related as $item): ?>
                <article class="panel product-card" data-tilt>
                    <a class="product-thumb" href="product.php?id=<?php echo (int) $item['id']; ?>">
                        <img src="<?php echo htmlspecialchars(product_image_url($item['image'])); ?>" alt="<?php echo htmlspecialchars($item['name']); ?>">
                    </a>
                    <div class="product-body">
                        <h3><a href="product.php?id=<?php echo (int) $item['id']; ?>"><?php echo htmlspecialchars($item['name']); ?></a></h3>
                        <p class="product-price">LKR <?php echo number_format((float) $item['price'], 2); ?></p>
                        <a class="btn" href="product.php?id=<?php echo (int) $item['id']; ?>">View</a>
                    </div>
                </article>
            <?php endforeach; ?>
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
