-- INSERTION BOISSONS ET DESSERTS - VERSION CORRIGÉE
-- Adaptation pour price_on_site et price_delivery (+1 EUR)
-- Date: 2025-09-01

-- ============================================
-- DESSERTS
-- ============================================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'FINGER', 'simple'::product_type_enum, 3.50, 3.50, 'Biscuit chocolat', 14
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

-- ============================================
-- BOISSONS AVEC VARIANTES
-- ============================================

-- Coca Cola
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'COCA COLA', 'variant'::product_type_enum, 20
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

WITH coca_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks' AND p.name = 'COCA COLA'
)
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 1.50, 33, 'cl', 1 FROM coca_product
UNION ALL
SELECT id, '1L5', 3.00, 3.00, 150, 'cl', 2 FROM coca_product
UNION ALL
SELECT id, '2L', 3.50, 3.50, 200, 'cl', 3 FROM coca_product;

-- Coca Zero
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'COCA ZERO', 'variant'::product_type_enum, 21
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

WITH coca_zero_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks' AND p.name = 'COCA ZERO'
)
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 1.50, 33, 'cl', 1 FROM coca_zero_product
UNION ALL
SELECT id, '1L5', 3.00, 3.00, 150, 'cl', 2 FROM coca_zero_product;

-- Oasis Tropical
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'OASIS TROPICAL', 'variant'::product_type_enum, 22
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

WITH oasis_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks' AND p.name = 'OASIS TROPICAL'
)
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 1.50, 33, 'cl', 1 FROM oasis_product
UNION ALL
SELECT id, '2L', 3.50, 3.50, 200, 'cl', 2 FROM oasis_product;

-- Ice Tea
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'ICE TEA', 'variant'::product_type_enum, 23
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

WITH icetea_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks' AND p.name = 'ICE TEA'
)
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 1.50, 33, 'cl', 1 FROM icetea_product
UNION ALL
SELECT id, '2L', 3.50, 3.50, 200, 'cl', 2 FROM icetea_product;

-- ============================================
-- BOISSONS SIMPLES (33CL UNIQUEMENT)
-- ============================================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'MIRANDA TROPICAL', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 24
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'MIRANDA FRAISE', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 25
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, '7 UP', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 26
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'EAU MINÉRALE', 'simple'::product_type_enum, 1.50, 1.50, '50cl', 27
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'SPRITE', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 28
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'FANTA ORANGE', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 29
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier les boissons insérées
SELECT 
  p.name,
  p.product_type,
  p.price_on_site_base,
  p.price_delivery_base
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
AND c.slug = 'ice-cream-desserts-drinks'
AND p.product_type = 'simple'
ORDER BY p.display_order;

-- Vérifier les variantes de boissons
SELECT 
  p.name,
  pv.variant_name,
  pv.price_on_site,
  pv.price_delivery,
  pv.quantity,
  pv.unit
FROM france_products p
JOIN france_product_variants pv ON p.id = pv.product_id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
AND c.slug = 'ice-cream-desserts-drinks'
ORDER BY p.name, pv.display_order;