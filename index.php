<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';

$user = current_user();
$success = get_flash('success');
$error = get_flash('error');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NovaStore</title>
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
            <div class="logo-mark">NovaStore</div>
            <div class="nav-links">
                <a class="btn" href="index.php">Home</a>
                <?php if ($user): ?>
                    <a class="btn" href="dashboard.php">Dashboard</a>
                    <a class="btn" href="logout.php">Logout</a>
                <?php else: ?>
                    <a class="btn" href="login.php">Login</a>
                    <a class="btn btn-primary" href="register.php">Create Account</a>
                <?php endif; ?>
            </div>
        </header>

        <section class="panel glow-ring hero hero-pro fade-up delay-1" id="home" data-tilt>
            <div>
                <p class="hero-kicker">Creative Commerce Platform</p>
                <h1>Professional storefronts with <span data-type-cycle class="text-sky-300 transition-opacity duration-300">cinematic depth</span></h1>
                <p>
                    NovaStore blends premium visual direction with production-ready account flows.
                    Run a secure ecommerce foundation while presenting a memorable front page that feels modern and intentional.
                </p>
                <div class="mb-4" data-react-badge="React + Tailwind + Motion Ready"></div>

                <?php if ($success): ?>
                    <div class="message success"><?php echo htmlspecialchars($success); ?></div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="message error"><?php echo htmlspecialchars($error); ?></div>
                <?php endif; ?>

                <?php if ($user): ?>
                    <div class="mt-5 flex flex-wrap gap-2">
                        <a class="btn btn-primary" href="dashboard.php">Go To Dashboard</a>
                        <a class="btn" href="logout.php">Sign Out</a>
                    </div>
                    <p class="text-sm text-sky-100/80 mt-4">Signed in as <?php echo htmlspecialchars($user['name']); ?>.</p>
                <?php else: ?>
                    <div class="mt-5 flex flex-wrap gap-2">
                        <a class="btn btn-primary" href="register.php">Create Free Account</a>
                        <a class="btn" href="login.php">Login</a>
                    </div>
                <?php endif; ?>
            </div>

            <div class="hero-side">
                <article class="floating-card" data-tilt>
                    <p class="floating-eyebrow">Live Experience</p>
                    <h3>Midnight Product Stage</h3>
                    <p>Layered surfaces, blue light accents, and responsive interactions that feel premium on desktop and mobile.</p>
                </article>
                <div class="metric-board" data-react-stats></div>
            </div>
        </section>

        <section class="panel section-block fade-up delay-2" id="about">
            <div class="section-head">
                <p class="section-tag">About This Website</p>
                <h2>A professional homepage designed to feel like a branded product launch</h2>
                <p>
                    Instead of a basic template, this page combines layered storytelling, deep contrast, and dynamic components.
                    The result is a homepage that introduces your brand clearly while still feeling high-end and creative.
                </p>
            </div>

            <div class="showcase-grid">
                <article class="feature-tile" data-tilt>
                    <h3>Brand Presence</h3>
                    <p>Strong typography, darkblue atmospherics, and contrast-driven composition improve first impressions.</p>
                </article>
                <article class="feature-tile" data-tilt>
                    <h3>Modern Stack</h3>
                    <p>HTML, CSS, JS, React widgets, and Tailwind utility classes integrated into one coherent frontend system.</p>
                </article>
                <article class="feature-tile" data-tilt>
                    <h3>Scalable Base</h3>
                    <p>Built to connect with your PHP/MySQL backend so design quality and business functionality grow together.</p>
                </article>
            </div>
        </section>

        <section class="panel process-row fade-up delay-2" data-tilt>
            <div class="process-intro">
                <p class="section-tag">How It Works</p>
                <h2>From first visit to checkout-ready foundation</h2>
            </div>
            <div class="process-steps">
                <article class="process-step">
                    <span>01</span>
                    <h4>Attract</h4>
                    <p>Creative hero, animated depth, and clear positioning hold user attention immediately.</p>
                </article>
                <article class="process-step">
                    <span>02</span>
                    <h4>Convert</h4>
                    <p>Focused calls-to-action direct visitors into register and login with reduced friction.</p>
                </article>
                <article class="process-step">
                    <span>03</span>
                    <h4>Scale</h4>
                    <p>Reusable components and structured backend make it easy to add catalog, cart, and checkout next.</p>
                </article>
            </div>
        </section>

        <section class="panel cta-band fade-up delay-2" data-tilt>
            <div>
                <p class="section-tag">Start Building</p>
                <h2>Launch with a homepage that already looks production-ready</h2>
                <p>Use this as your creative base, then expand into products, cart, orders, and payments.</p>
            </div>
            <div class="cta-actions">
                <?php if ($user): ?>
                    <a class="btn btn-primary" href="dashboard.php">Open Dashboard</a>
                <?php else: ?>
                    <a class="btn btn-primary" href="register.php">Create Account</a>
                    <a class="btn" href="login.php">Login</a>
                <?php endif; ?>
            </div>
        </section>

        <footer class="panel site-footer site-footer-pro fade-up delay-2">
            <div>
                <div class="logo-mark">NovaStore</div>
                <p class="footer-copy">A darkblue-black ecommerce experience built with HTML, CSS, JS, React, Tailwind, PHP, and MySQL.</p>
            </div>
            <div class="footer-links">
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="register.php">Register</a>
                <a href="login.php">Login</a>
            </div>
            <div class="footer-mini" data-react-quotes></div>
            <p class="footer-note">&copy; <?php echo date('Y'); ?> NovaStore. Built for a premium first impression.</p>
        </footer>
    </div>

    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/three@0.161.0/build/three.min.js"></script>
    <script src="assets/js/theme.js?v=20260331"></script>
    <script src="assets/js/react-widgets.js?v=20260331"></script>
</body>
</html>
