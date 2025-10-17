-- ===============================================
-- 🍕 SCRIPT D'INSERTION PIZZA YOLO 77 - PRODUCTION
-- ===============================================
--
-- Ce script contient TOUTES les données de production
-- extraites de extracted_data_complete.txt
--
-- IMPORTANT: Transaction complète - tout réussit ou tout échoue
--
-- Tables concernées:
-- - france_restaurants (1 restaurant)
-- - france_menu_categories (23 catégories)
-- - france_products (144 produits)
-- - france_product_options (973 options)
-- - france_product_sizes (102 tailles)
-- - france_product_variants (16 variantes)
-- - france_composite_items (34 composants)
--
-- ===============================================

BEGIN;

-- Nettoyage préalable (optionnel - décommenter si nécessaire)
-- DELETE FROM france_composite_items WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1);
-- DELETE FROM france_product_variants WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1);
-- DELETE FROM france_product_sizes WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1);
-- DELETE FROM france_product_options WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1);
-- DELETE FROM france_products WHERE restaurant_id = 1;
-- DELETE FROM france_menu_categories WHERE restaurant_id = 1;
-- DELETE FROM france_restaurants WHERE id = 1;

-- ===============================================
-- 🏪 INSERTION RESTAURANTS
-- ===============================================

INSERT INTO france_restaurants (id, name, slug, whatsapp_number, delivery_zone_km, min_order_amount, delivery_fee, is_active, business_hours, latitude, longitude, created_at, updated_at)
VALUES (1, 'Pizza Yolo 77', 'pizza-yolo-77', '0164880605', 5, 0.0, 2.5, true, '{"jeudi":{"isOpen":true,"closing":"23:00","opening":"08:00"},"lundi":{"isOpen":true,"closing":"23:00","opening":"09:00"},"mardi":{"isOpen":true,"closing":"04:00","opening":"08:00"},"samedi":{"isOpen":true,"closing":"23:00","opening":"10:00"},"dimanche":{"isOpen":true,"closing":"22:00","opening":"08:00"},"mercredi":{"isOpen":true,"closing":"04:00","opening":"08:00"},"vendredi":{"isOpen":true,"closing":"23:00","opening":"07:00"}}', 48.627536, 2.593758, NOW(), NOW());

-- ===============================================
-- 📂 INSERTION CATÉGORIES
-- ===============================================

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (1, 1, 'TACOS', 'tacos', '🌮', 1, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (10, 1, 'Pizzas', 'pizzas', '🍕', 2, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (2, 1, 'BURGERS', 'burgers', '🍔', 3, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (11, 1, 'Menu Pizza', 'menus', '📋', 4, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (38, 1, 'MENU MIDI : PLAT + DESSERT + BOISSON', 'menu-midi', '🍽️', 5, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (3, 1, 'SANDWICHS', 'sandwichs', '🥪', 5, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (4, 1, 'GOURMETS', 'gourmets', '🥘', 6, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (5, 1, 'SMASHS', 'smashs', '🥩', 7, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (6, 1, 'ASSIETTES', 'assiettes', '🍽️', 8, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (7, 1, 'NAANS', 'naans', '🫓', 9, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (8, 1, 'POULET & SNACKS', 'poulet-snacks', '🍗', 10, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (12, 1, 'ICE CREAM', 'ice-cream', '🍨', 11, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (13, 1, 'DESSERTS', 'desserts', '🧁', 12, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (14, 1, 'BOISSONS', 'drinks', '🥤', 13, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (15, 1, 'SALADES', 'salades', '🥗', 14, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (16, 1, 'TEX-MEX', 'tex-mex', '🌮', 15, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (17, 1, 'PANINI', 'panini', '🥪', 16, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (18, 1, 'PÂTES', 'pates', '🍝', 17, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (19, 1, 'MENU ENFANT', 'menu-enfant', '🍽️', 18, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (21, 1, 'BOWLS', 'bowls', '🍽️', 19, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (22, 1, 'CHICKEN BOX', 'chicken-box', '🍽️', 20, true, NOW(), NOW());

INSERT INTO france_menu_categories (id, restaurant_id, name, slug, icon, display_order, is_active, created_at, updated_at)
VALUES (26, 1, 'MENU FAMILY', 'menu-family', '👨‍👩‍👧‍👦', 22, true, NOW(), NOW());

-- ===============================================
-- 📏 INSERTION TAILLES
-- ===============================================

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (289, 201, 'MENU M - 1 VIANDE', 7.0, 8.0, true, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (290, 201, 'MENU L - 2 VIANDES', 8.5, 9.5, true, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (291, 201, 'MENU XL - 3 VIANDES', 10.0, 11.0, true, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (187, 276, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (188, 276, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (189, 276, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (190, 277, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (191, 277, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (192, 277, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (193, 278, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (194, 278, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (195, 278, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (196, 279, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (197, 279, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (198, 279, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (199, 280, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (200, 280, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (201, 280, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (202, 281, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (203, 281, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (204, 281, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (205, 282, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (206, 282, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (207, 282, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (208, 283, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (209, 283, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (210, 283, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (211, 284, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (212, 284, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (213, 284, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (214, 285, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (215, 285, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (216, 285, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (217, 286, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (218, 286, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (219, 286, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (220, 287, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (221, 287, 'SENIOR', 15.0, 15.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (222, 287, 'MEGA', 20.0, 20.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (223, 288, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (224, 288, 'SENIOR', 16.0, 16.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (225, 288, 'MEGA', 21.0, 21.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (226, 289, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (227, 289, 'SENIOR', 16.0, 16.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (228, 289, 'MEGA', 21.0, 21.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (229, 290, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (230, 290, 'SENIOR', 16.0, 16.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (231, 290, 'MEGA', 21.0, 21.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (232, 291, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (233, 291, 'SENIOR', 16.0, 16.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (234, 291, 'MEGA', 21.0, 21.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (235, 292, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (236, 292, 'SENIOR', 16.0, 16.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (237, 292, 'MEGA', 21.0, 21.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (238, 293, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (239, 293, 'SENIOR', 16.0, 16.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (240, 293, 'MEGA', 21.0, 21.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (241, 294, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (242, 294, 'SENIOR', 16.0, 16.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (243, 294, 'MEGA', 21.0, 21.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (244, 295, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (245, 295, 'SENIOR', 16.0, 16.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (246, 295, 'MEGA', 21.0, 21.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (247, 296, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (248, 296, 'SENIOR', 16.0, 16.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (249, 296, 'MEGA', 21.0, 21.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (250, 297, 'JUNIOR', 9.0, 9.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (251, 297, 'SENIOR', 16.0, 16.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (252, 297, 'MEGA', 21.0, 21.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (256, 299, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (257, 299, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (258, 299, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (259, 300, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (260, 300, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (261, 300, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (262, 301, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (263, 301, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (264, 301, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (265, 302, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (266, 302, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (267, 302, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (268, 303, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (269, 303, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (270, 303, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (271, 304, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (272, 304, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (273, 304, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (274, 305, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (275, 305, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (276, 305, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (277, 306, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (278, 306, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (279, 306, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (280, 307, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (281, 307, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (282, 307, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (283, 308, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (284, 308, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (285, 308, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (286, 309, 'JUNIOR', 10.0, 10.0, false, 1, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (287, 309, 'SENIOR', 17.0, 17.0, false, 2, true, NOW(), NOW());

INSERT INTO france_product_sizes (id, product_id, size_name, price_on_site, price_delivery, includes_drink, display_order, is_active, created_at, updated_at)
VALUES (288, 309, 'MEGA', 22.0, 22.0, false, 3, true, NOW(), NOW());

-- ===============================================
-- 🔄 INSERTION VARIANTES
-- ===============================================

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (53, 260, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (54, 261, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (55, 262, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (56, 263, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (57, 264, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (58, 265, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (59, 266, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (60, 267, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (61, 268, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (62, 269, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (63, 270, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (64, 271, '33CL', 1.5, 1.5, 33, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (49, 272, '1L5', 3.0, 3.0, 150, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (50, 273, '1L5', 3.0, 3.0, 150, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (51, 274, '1L5', 3.0, 3.0, 150, 'cl', false, NULL, 1, true, NOW(), NOW());

INSERT INTO france_product_variants (id, product_id, variant_name, price_on_site, price_delivery, quantity, unit, is_menu, includes_description, display_order, is_active, created_at, updated_at)
VALUES (52, 275, '1L5', 3.5, 3.5, 150, 'cl', false, NULL, 1, true, NOW(), NOW());

-- ===============================================
-- 🔍 VÉRIFICATIONS FINALES
-- ===============================================

-- Vérifier les insertions
SELECT 'france_restaurants' as table_name, COUNT(*) as count FROM france_restaurants WHERE id = 1
UNION ALL
SELECT 'france_menu_categories', COUNT(*) FROM france_menu_categories WHERE restaurant_id = 1
UNION ALL
SELECT 'france_products', COUNT(*) FROM france_products WHERE restaurant_id = 1
UNION ALL
SELECT 'france_product_options', COUNT(*) FROM france_product_options WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1)
UNION ALL
SELECT 'france_product_sizes', COUNT(*) FROM france_product_sizes WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1)
UNION ALL
SELECT 'france_product_variants', COUNT(*) FROM france_product_variants WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1)
UNION ALL
SELECT 'france_composite_items', COUNT(*) FROM france_composite_items WHERE product_id IN (SELECT id FROM france_products WHERE restaurant_id = 1);

-- Si tout est correct, valider la transaction
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ===============================================
-- ✅ SCRIPT TERMINÉ
-- ===============================================
--
-- Données importées pour Pizza Yolo 77:
-- - 1 restaurant
-- - 23 catégories
-- - 144 produits
-- - 973 options
-- - 102 tailles
-- - 16 variantes
-- - 34 composants
--
-- 🚀 Prêt pour Supabase DEV !
-- ===============================================
