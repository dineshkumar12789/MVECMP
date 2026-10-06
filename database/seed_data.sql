-- ========================================================
-- SEED DATA FOR MULTI-VENDOR E-COMMERCE MARKETPLACE
-- Passwords:
-- Admin: admin@mvecm.com / Admin@123 ($2a$10$7Z2vXk916Z7v3aRovDkZ2.r7mH8FjO3m9rXgXJ1rQ4Yh7oZ3w7t3S -> standard bcrypt)
-- Customer: customer@example.com / Customer@123
-- Note: The backend also has automatic password encoder & bootstrap check.
-- ========================================================

-- 1. USERS
-- Admin password hash for 'Admin@123'
-- User password hash for 'Customer@123'
INSERT INTO users (id, name, email, password, phone, role, is_blocked, is_verified, created_at, updated_at)
VALUES
(1, 'Admin Manager', 'admin@mvecm.com', '$2a$10$0p7zJc7dYJvOa9t7N.dM7uP0FzO1E9z0J9x2Q4W5E6R7T8Y9U0I1O', '+1-800-555-0199', 'ADMIN', false, true, NOW(), NOW()),
(2, 'John Doe', 'customer@example.com', '$2a$10$0p7zJc7dYJvOa9t7N.dM7uP0FzO1E9z0J9x2Q4W5E6R7T8Y9U0I1O', '+1-800-555-0100', 'USER', false, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (id, name, description, icon_url, created_at, updated_at)
VALUES
(1, 'Electronics', 'Smartphones, laptops, headphones, smart devices & accessories', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', NOW(), NOW()),
(2, 'Fashion & Apparel', 'Trendy men and women clothing, footwear, and accessories', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', NOW(), NOW()),
(3, 'Home & Kitchen', 'Furniture, cookware, modern home decor and appliances', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400', NOW(), NOW()),
(4, 'Books & Media', 'Bestsellers, educational guides, fiction and tech reads', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', NOW(), NOW()),
(5, 'Beauty & Personal Care', 'Skincare, perfumes, wellness products and grooming', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. VENDORS
INSERT INTO vendors (id, name, contact_email, contact_phone, description, logo_url, rating, is_active, created_at, updated_at)
VALUES
(1, 'Apex Electronics Ltd', 'apex@techpartner.com', '+1-415-555-2671', 'Authorized retailer of high-performance audio, computing, and smart accessories.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200', 4.85, true, NOW(), NOW()),
(2, 'Nordic Styles Co', 'support@nordicstyles.com', '+1-212-555-8932', 'Contemporary minimalist apparel designed with premium sustainable fabrics.', 'https://images.unsplash.com/photo-1529720317453-c8da503f2051?w=200', 4.70, true, NOW(), NOW()),
(3, 'Artisan Living Goods', 'hello@artisanliving.com', '+1-312-555-4421', 'Handcrafted ceramic, kitchenware and contemporary home comfort utilities.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200', 4.60, true, NOW(), NOW()),
(4, 'Summit Bookseller Guild', 'orders@summitbooks.org', '+1-617-555-9011', 'Curated independent bookstore offering top-rated fiction, non-fiction, and tech classics.', 'https://images.unsplash.com/photo-1507842229451-7f01be7fe7ab?w=200', 4.90, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 4. PRODUCTS (10+ realistic marketplace items)
INSERT INTO products (id, name, description, price, discount_price, stock_quantity, image_url, category_id, vendor_id, is_active, rating, review_count, created_at, updated_at)
VALUES
(1, 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', 'Industry-leading noise canceling with two processors and 8 microphones. Up to 30 hours battery life with quick charge.', 348.00, 298.00, 45, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 1, 1, true, 4.80, 240, NOW(), NOW()),
(2, 'Apple MacBook Air 15-inch M3 Chip', 'Supercharged by M3, strikingly thin and fast. 18 hours of battery life, Liquid Retina display, 500 nits brightness.', 1299.00, 1199.00, 20, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 1, 1, true, 4.90, 520, NOW(), NOW()),
(3, 'Mechanical RGB Gaming Keyboard - Cherry MX Blue', 'Aircraft-grade aluminum frame, tactile mechanical switches, per-key dynamic RGB backlighting, and magnetic wrist rest.', 119.99, 99.99, 65, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', 1, 1, true, 4.60, 180, NOW(), NOW()),
(4, 'Men''s Classic Heavyweight Wool Overcoat', 'Tailored fit winter jacket crafted with 80% natural virgin wool. Double-breasted silhouette with silk-lined interior.', 189.50, 149.00, 30, 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800', 2, 2, true, 4.70, 95, NOW(), NOW()),
(5, 'Minimalist Leather Chronograph Watch', 'Sapphire crystal face, genuine Italian leather strap, 50M water resistance, Japanese quartz movement.', 165.00, 135.00, 40, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800', 2, 2, true, 4.85, 310, NOW(), NOW()),
(6, 'De''Longhi Barista Espresso & Cappuccino Machine', '15-bar professional pressure pump, manual steam wand for rich creamy froth, dual-wall filter baskets.', 249.95, 199.95, 18, 'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=800', 3, 3, true, 4.50, 84, NOW(), NOW()),
(7, 'Cast Iron Dutch Oven 6-Quart Enamel Finish', 'Superior heat retention and even heat distribution. Porcelain enamel interior requires no seasoning, oven safe to 500°F.', 89.99, 69.99, 50, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800', 3, 3, true, 4.90, 412, NOW(), NOW()),
(8, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'By Robert C. Martin. Learn how to write agile, testable, and robust clean code that stands the test of time.', 44.99, 36.50, 85, 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=800', 4, 4, true, 4.95, 1250, NOW(), NOW()),
(9, 'Designing Data-Intensive Applications', 'By Martin Kleppmann. The definitive guide to the storage, processing, and scalability principles behind modern systems.', 52.00, 42.00, 60, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', 4, 4, true, 4.90, 890, NOW(), NOW()),
(10, 'Organic Vitamin C & Hyaluronic Acid Facial Serum', 'Antioxidant glow formula designed to brighten complexion, reduce dark spots, and deeply hydrate sensitive skin.', 32.00, 24.50, 110, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800', 5, 1, true, 4.65, 340, NOW(), NOW()),
(11, 'Ergonomic Mesh Office Executive Chair', 'Breathable elastomeric mesh, 3D adjustable armrests, dynamic lumbar support, tilt-lock mechanism for all-day comfort.', 279.00, 229.00, 25, 'https://images.unsplash.com/photo-1580481077191-4b711d960762?w=800', 3, 3, true, 4.75, 160, NOW(), NOW()),
(12, 'Wireless ANC Earbuds with Spatial Audio', 'Compact charging case with 36 hours total battery, touch controls, IPX5 water resistance, immersive soundstage.', 79.99, 59.99, 75, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 1, 1, true, 4.55, 215, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Synchronize sequences so new inserts don't collide
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
SELECT setval('vendors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM vendors));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));
