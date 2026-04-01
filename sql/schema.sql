CREATE DATABASE IF NOT EXISTS novastore;
USE novastore;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','customer') DEFAULT 'customer',
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    description TEXT,
    image VARCHAR(255),
    brand VARCHAR(100),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cart_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_cart_user_product (user_id, product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    subtotal_amount DECIMAL(10,2) NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    coupon_code VARCHAR(40) NULL,
    status ENUM('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2) NULL,
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(40) NULL;

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method VARCHAR(50),
    payment_status ENUM('pending','completed','failed') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    option_type VARCHAR(50) NOT NULL,
    option_value VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_options_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_product_option (product_id, option_type, option_value)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    otp_hash CHAR(64) NOT NULL,
    status ENUM('pending','verified','used','expired','failed') DEFAULT 'pending',
    attempts INT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_otps_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    KEY idx_payment_otp_user_phone (user_id, phone),
    KEY idx_payment_otp_status_expiry (status, expires_at)
) ENGINE=InnoDB;

INSERT INTO categories (name)
SELECT * FROM (
    SELECT 'Electronics' AS name UNION ALL
    SELECT 'Fashion' UNION ALL
    SELECT 'Home & Kitchen'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM categories LIMIT 1);

INSERT INTO products (category_id, name, price, stock, description, image, brand, color)
SELECT * FROM (
    SELECT 1, 'NeoPods Pro Earbuds', 19990.00, 45, 'Wireless noise-canceling earbuds with premium sound.', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80', 'NeoBrand', 'Black' UNION ALL
    SELECT 1, 'Pulse X Smartwatch', 28990.00, 32, 'Advanced fitness tracking smartwatch with AMOLED display.', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80', 'Pulse Tech', 'Silver' UNION ALL
    SELECT 2, 'UrbanFlex Sneakers', 14990.00, 60, 'Comfort-focused sneakers designed for all-day wear.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 'UrbanFit', 'Gray' UNION ALL
    SELECT 2, 'Classic Denim Jacket', 10990.00, 24, 'Minimal design denim jacket for modern casual outfits.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', 'ClassicWear', 'Blue' UNION ALL
    SELECT 3, 'AeroBlend Blender', 22990.00, 18, 'High-speed blender ideal for smoothies and meal prep.', 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80', 'AeroKitchen', 'Black' UNION ALL
    SELECT 3, 'Luma Desk Lamp', 7990.00, 40, 'Soft warm LED desk lamp with adjustable brightness.' , 'https://images.unsplash.com/photo-1517994112540-009c47ea476b?auto=format&fit=crop&w=900&q=80', 'LumaLights', 'White'
) AS seed_products
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (category_id, name, price, stock, description, image)
SELECT seed_products.category_id, seed_products.name, seed_products.price, seed_products.stock, seed_products.description, seed_products.image
FROM (
    SELECT 1 AS category_id, 'OrbitView 4K Action Camera' AS name, 32990.00 AS price, 20 AS stock, 'Compact waterproof action camera with stabilization and 4K capture.' AS description, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80' AS image UNION ALL
    SELECT 1, 'SonicBar Mini Speaker', 13990.00, 36, 'Portable Bluetooth speaker with deep bass and 12-hour battery.', 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 1, 'AirSync Wireless Charger', 6990.00, 58, 'Fast wireless charging pad with thermal control and USB-C input.', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 2, 'Nova Street Hoodie', 8990.00, 48, 'Soft premium hoodie designed for daily comfort and layering.', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 2, 'Stride Flex Running Tee', 4990.00, 74, 'Lightweight breathable running t-shirt for active sessions.', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 2, 'Summit Trail Backpack', 11990.00, 29, 'Durable multi-pocket backpack with water-resistant shell.', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'BrewMate Coffee Maker', 18990.00, 16, 'Programmable coffee maker with aroma control and timer.', 'https://images.unsplash.com/photo-1517914309068-f32e5b39b0f8?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'CloudRest Memory Pillow', 5490.00, 67, 'Orthopedic memory foam pillow for better neck support.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'PureAir HEPA Purifier', 26990.00, 14, 'Silent room air purifier with multi-stage HEPA filtration.', 'https://images.unsplash.com/photo-1626431739675-0dd68b3f5cbf?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 1, 'Vertex Mechanical Keyboard', 15990.00, 27, 'Hot-swappable mechanical keyboard with RGB backlight.', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 1, 'NovaBeam Monitor Light', 8990.00, 34, 'Screen-mounted monitor light bar with adjustable temperature.', 'https://images.unsplash.com/photo-1527443224154-c4e38eab6d20?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'ZenGlow Bedside Lamp', 6490.00, 41, 'Minimal bedside lamp with touch controls and warm LED glow.', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
) AS seed_products
WHERE NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.name = seed_products.name
);

INSERT INTO products (category_id, name, price, stock, description, image)
SELECT seed_products.category_id, seed_products.name, seed_products.price, seed_products.stock, seed_products.description, seed_products.image
FROM (
    SELECT 1 AS category_id, 'SkyTune ANC Headphones' AS name, 24990.00 AS price, 26 AS stock, 'Over-ear ANC headphones with immersive sound and 30-hour battery.' AS description, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80' AS image UNION ALL
    SELECT 1, 'EchoCast Smart Projector', 58990.00, 9, 'Compact smart projector with auto-focus and built-in streaming apps.', 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 1, 'WaveLink USB-C Hub', 7990.00, 55, '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card support.', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 1, 'PixelPro Webcam 2K', 16990.00, 22, '2K webcam with dual microphones and low-light enhancement.', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 1, 'VoltEdge Power Bank 20000', 9990.00, 44, 'High-capacity 20,000mAh power bank with PD fast charging.', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 1, 'FocusLite Ring Light', 6990.00, 39, 'Dimmable ring light with tripod stand for streaming and calls.', 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 2, 'Nova Linen Shirt', 7490.00, 52, 'Breathable linen shirt with a tailored modern fit.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 2, 'Urban Cargo Joggers', 8990.00, 37, 'Stretch cargo joggers with utility pockets and tapered cut.', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 2, 'AeroFit Training Shorts', 4590.00, 68, 'Quick-dry training shorts for gym and outdoor workouts.', 'https://images.unsplash.com/photo-1506629905607-d9e7d2e4d3f4?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 2, 'Contour Leather Belt', 3990.00, 80, 'Premium leather belt with brushed metal buckle.', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 2, 'MetroFit Casual Blazer', 13490.00, 19, 'Lightweight casual blazer for smart everyday styling.', 'https://images.unsplash.com/photo-1592878904946-b3cd8935f2a3?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 2, 'TrailGuard Windbreaker', 9990.00, 33, 'Water-repellent windbreaker with breathable mesh lining.', 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 2, 'Nova Classic Cap', 2990.00, 91, 'Adjustable cotton cap with minimalist embroidered logo.', 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'ChefMate Air Fryer XL', 31990.00, 13, 'Large-capacity air fryer with digital presets and rapid heating.', 'https://images.unsplash.com/photo-1585515656181-6d6f8e4f7b37?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'EcoSteam Garment Steamer', 11990.00, 24, 'Portable garment steamer with anti-drip and fast warm-up.', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'FreshKeep Vacuum Sealer', 10490.00, 31, 'Food vacuum sealer with moisture and dry mode settings.', 'https://images.unsplash.com/photo-1610718221575-2694f2f67138?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'AquaPure Water Filter Jug', 5490.00, 57, 'Multi-stage filtration jug for cleaner and better tasting water.', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'ComfortNest Throw Blanket', 6290.00, 46, 'Ultra-soft knitted throw blanket for cozy living spaces.', 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'GlowMist Aroma Diffuser', 4890.00, 62, 'Ultrasonic aroma diffuser with ambient light and auto shutoff.', 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=900&q=80' UNION ALL
    SELECT 3, 'FlexiRack Shoe Organizer', 6990.00, 35, 'Expandable multi-tier shoe organizer for compact storage.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
) AS seed_products
WHERE NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.name = seed_products.name
);

INSERT INTO users (name, email, password, role)
SELECT seed_users.name, seed_users.email, seed_users.password, 'customer'
FROM (
    SELECT 'Nimal Perera' AS name, 'nimal.demo@novastore.local' AS email, '$2y$10$OahvD2D9NkcJf4b3mP5Yfuf8SWvNvKcJsteVEh9UpAJZxkd06Pq4u' AS password UNION ALL
    SELECT 'Kasuni Silva', 'kasuni.demo@novastore.local', '$2y$10$OahvD2D9NkcJf4b3mP5Yfuf8SWvNvKcJsteVEh9UpAJZxkd06Pq4u' UNION ALL
    SELECT 'Ruwan Fernando', 'ruwan.demo@novastore.local', '$2y$10$OahvD2D9NkcJf4b3mP5Yfuf8SWvNvKcJsteVEh9UpAJZxkd06Pq4u'
) AS seed_users
WHERE NOT EXISTS (
    SELECT 1
    FROM users u
    WHERE u.email = seed_users.email
);

INSERT INTO reviews (user_id, product_id, rating, comment)
SELECT u.id, p.id, seeded.rating, seeded.comment
FROM (
    SELECT 'nimal.demo@novastore.local' AS reviewer_email, 'SkyTune ANC Headphones' AS product_name, 5 AS rating, 'Excellent clarity and bass. Battery lasted me the full work week.' AS comment UNION ALL
    SELECT 'kasuni.demo@novastore.local', 'SkyTune ANC Headphones', 4, 'Very comfortable ear cushions and ANC works well in buses.' UNION ALL
    SELECT 'ruwan.demo@novastore.local', 'SkyTune ANC Headphones', 5, 'Fast delivery and premium sound quality. Worth the price.'
) AS seeded
INNER JOIN users u ON u.email = seeded.reviewer_email
INNER JOIN products p ON p.name = seeded.product_name
WHERE NOT EXISTS (
    SELECT 1
    FROM reviews r
    WHERE r.user_id = u.id
      AND r.product_id = p.id
      AND r.comment = seeded.comment
);

INSERT INTO product_options (product_id, option_type, option_value)
SELECT p.id, seeded.option_type, seeded.option_value
FROM (
    SELECT 'NeoPods Pro Earbuds' AS product_name, 'Color' AS option_type, 'Black' AS option_value UNION ALL
    SELECT 'NeoPods Pro Earbuds', 'Color', 'Silver' UNION ALL
    SELECT 'NeoPods Pro Earbuds', 'Color', 'White' UNION ALL
    SELECT 'Pulse X Smartwatch', 'Size', '40mm' UNION ALL
    SELECT 'Pulse X Smartwatch', 'Size', '44mm' UNION ALL
    SELECT 'Pulse X Smartwatch', 'Color', 'Silver' UNION ALL
    SELECT 'Pulse X Smartwatch', 'Color', 'Midnight' UNION ALL
    SELECT 'UrbanFlex Sneakers', 'Size', '7' UNION ALL
    SELECT 'UrbanFlex Sneakers', 'Size', '8' UNION ALL
    SELECT 'UrbanFlex Sneakers', 'Size', '9' UNION ALL
    SELECT 'UrbanFlex Sneakers', 'Size', '10' UNION ALL
    SELECT 'UrbanFlex Sneakers', 'Color', 'Gray' UNION ALL
    SELECT 'UrbanFlex Sneakers', 'Color', 'Black' UNION ALL
    SELECT 'Classic Denim Jacket', 'Size', 'S' UNION ALL
    SELECT 'Classic Denim Jacket', 'Size', 'M' UNION ALL
    SELECT 'Classic Denim Jacket', 'Size', 'L' UNION ALL
    SELECT 'Classic Denim Jacket', 'Size', 'XL' UNION ALL
    SELECT 'Classic Denim Jacket', 'Color', 'Blue' UNION ALL
    SELECT 'Classic Denim Jacket', 'Color', 'Black' UNION ALL
    SELECT 'SkyTune ANC Headphones', 'Color', 'Black' UNION ALL
    SELECT 'SkyTune ANC Headphones', 'Color', 'Silver' UNION ALL
    SELECT 'SkyTune ANC Headphones', 'Color', 'Gold'
) AS seeded
INNER JOIN products p ON p.name = seeded.product_name
WHERE NOT EXISTS (
    SELECT 1
    FROM product_options po
    WHERE po.product_id = p.id
      AND po.option_type = seeded.option_type
      AND po.option_value = seeded.option_value
);
