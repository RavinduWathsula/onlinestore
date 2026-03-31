<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/store.php';

$user = current_user();
$search = trim($_GET['q'] ?? '');
$categoryId = (int) ($_GET['category'] ?? 0);
$sort = $_GET['sort'] ?? 'latest';

$categories = get_categories();
$products = get_products($search, $categoryId, $sort);
$cartCount = $user ? get_cart_count((int) $user['id']) : 0;
$success = get_flash('success');
$error = get_flash('error');

function product_image_url(?string $image): string
{
    $value = trim((string) $image);
    if ($value === '') {
        return 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=900&q=80';
    }

    return $value;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop - NovaStore</title>
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
        <div class="logo-mark">NovaStore Marketplace</div>
        <div class="nav-links">
            <a class="btn" href="index.php">Home</a>
            <a class="btn btn-primary" href="products.php">Shop</a>
            <a class="btn" href="cart.php">Cart (<?php echo $cartCount; ?>)</a>
            <?php if ($user): ?>
                <a class="btn" href="dashboard.php">Dashboard</a>
                <a class="btn" href="logout.php">Logout</a>
            <?php else: ?>
                <a class="btn" href="login.php">Login</a>
                <a class="btn" href="register.php">Register</a>
            <?php endif; ?>
        </div>
    </header>

    <section class="panel market-hero fade-up delay-1">
        <p class="section-tag">All Items</p>
        <h1>Shop everything in one place</h1>
        <p>Explore electronics, fashion, home products, and more in a fast, conversion-focused storefront.</p>

        <?php if ($success): ?>
            <div class="message success"><?php echo htmlspecialchars($success); ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="message error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form class="market-filters" method="get" action="products.php">
            <input type="text" name="q" value="<?php echo htmlspecialchars($search); ?>" placeholder="Search products...">
            <select name="category">
                <option value="0">All Categories</option>
                <?php foreach ($categories as $category): ?>
                    <option value="<?php echo (int) $category['id']; ?>" <?php echo $categoryId === (int) $category['id'] ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($category['name']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <select name="sort">
                <option value="latest" <?php echo $sort === 'latest' ? 'selected' : ''; ?>>Latest</option>
                <option value="price_low" <?php echo $sort === 'price_low' ? 'selected' : ''; ?>>Price: Low to High</option>
                <option value="price_high" <?php echo $sort === 'price_high' ? 'selected' : ''; ?>>Price: High to Low</option>
                <option value="name" <?php echo $sort === 'name' ? 'selected' : ''; ?>>Name</option>
            </select>
            <button class="btn btn-primary" type="submit">Apply</button>
        </form>
    </section>

    <section class="market-grid-wrap fade-up delay-2">
        <?php if (!$products): ?>
            <div class="panel empty-state">
                <h3>No products found</h3>
                <p>Try another search keyword or category filter.</p>
            </div>
        <?php endif; ?>

        <div class="market-grid">
            <?php foreach ($products as $product): ?>
                <article class="panel product-card" data-tilt>
                    <a class="product-thumb" href="product.php?id=<?php echo (int) $product['id']; ?>">
                        <img src="<?php echo htmlspecialchars(product_image_url($product['image'])); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>">
                    </a>
                    <div class="product-body">
                        <p class="product-cat"><?php echo htmlspecialchars((string) ($product['category_name'] ?? 'Uncategorized')); ?></p>
                        <h3><a href="product.php?id=<?php echo (int) $product['id']; ?>"><?php echo htmlspecialchars($product['name']); ?></a></h3>
                        <p class="product-price">LKR <?php echo number_format((float) $product['price'], 2); ?></p>
                        <p class="product-stock"><?php echo (int) $product['stock'] > 0 ? 'In stock' : 'Out of stock'; ?></p>
                        <a class="btn btn-primary" href="product.php?id=<?php echo (int) $product['id']; ?>">View Product</a>
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
