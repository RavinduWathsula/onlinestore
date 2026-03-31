# NeoCart (React + Tailwind + PHP API + MySQL)

NeoCart includes a modern React frontend with Tailwind styling and a PHP API backend connected to MySQL.

## Stack

- Frontend: React + Vite + Axios
- Styling: Tailwind CSS (glassmorphism, gradients, rounded 2xl cards)
- Backend: PHP REST-style endpoints
- Database: MySQL
- Auth: PHP sessions

## 1) Database Setup

Option A (phpMyAdmin):
1. Open http://localhost/phpmyadmin
2. Import sql/schema.sql

Option B (MySQL CLI):

```sql
SOURCE C:/xampp/htdocs/NovaStore/sql/schema.sql;
```

## 2) Backend Configuration

Edit config.php if needed:
- DB_HOST
- DB_USER
- DB_PASS
- DB_NAME
- DB_PORT

Default values match standard XAMPP:
- host: 127.0.0.1
- user: root
- pass: empty
- database: novastore

## 3) Run Backend (PHP)

1. Start Apache and MySQL in XAMPP
2. API will be available under http://localhost/NovaStore/api

## 4) Run Frontend (React)

Open terminal in frontend and run:

```bash
npm install
npm run dev
```

Then open:
- http://localhost:5173

Vite dev server proxies /api calls to http://localhost/NovaStore.

If you open frontend/index.html directly in Apache, the React app will not start as expected.
Use the Vite URL above for the React frontend.

## Quick Troubleshooting

- PHP homepage works: http://localhost/NovaStore/index.php
- API health check: http://localhost/NovaStore/api/session.php
- If API returns database errors, import sql/schema.sql and verify config.php credentials
- If React page is blank, run frontend with npm run dev and open http://localhost:5173

## 5) API Endpoints

- POST /api/login.php
- POST /api/register.php
- POST /api/logout.php
- GET /api/session.php
- GET|PUT|DELETE /api/products.php
- POST /api/add_product.php
- GET /api/categories.php
- GET|POST|PATCH|DELETE /api/cart.php
- GET|POST /api/orders.php
- GET /api/admin_stats.php
- GET /api/users.php

## 6) Frontend Structure

- frontend/src/components
- frontend/src/pages
- frontend/src/services
- frontend/src/admin
- frontend/src/context

## Admin Access

Register a normal user, then promote it to admin in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Feature Coverage

- Home: hero, featured products, categories, testimonials, footer
- Authentication: login/register with validation and session state
- Customer: dashboard, products list, add to cart, cart updates, checkout
- Admin: overview stats, add/edit/delete products, users table, orders table
- UX: loading spinners, toasts, responsive design, search/filter/pagination
