-- 🔧 INSERTION BOISSONS - VERSION CORRIGÉE SLUG
-- Utilise le bon slug 'drinks' au lieu de 'ice-cream-desserts-drinks'

BEGIN;

-- ============================================  
-- BOISSONS AVEC VARIANTES
-- ============================================

-- Coca Cola
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'COCA COLA', 'variant'::product_type_enum, 20
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

WITH coca_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks' AND p.name = 'COCA COLA'
)
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 1.50, 33, 'cl', 1 FROM coca_product
UNION ALL
SELECT id, '1L5', 3.00, 3.00, 150, 'cl', 2 FROM coca_product;

-- Coca Zero
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'COCA ZERO', 'variant'::product_type_enum, 21
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

WITH coca_zero_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks' AND p.name = 'COCA ZERO'
)
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 1.50, 33, 'cl', 1 FROM coca_zero_product
UNION ALL
SELECT id, '1L5', 3.00, 3.00, 150, 'cl', 2 FROM coca_zero_product;

-- SPRITE
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'SPRITE', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 22
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

-- FANTA ORANGE
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'FANTA ORANGE', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 23
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

-- ICE TEA
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'ICE TEA', 'variant'::product_type_enum, 24
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

WITH icetea_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks' AND p.name = 'ICE TEA'
)
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 1.50, 33, 'cl', 1 FROM icetea_product;

-- EAU MINÉRALE
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'EAU MINÉRALE', 'simple'::product_type_enum, 1.50, 1.50, '50cl', 25
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

-- Vérification
SELECT 
  p.name,
  p.product_type,
  COALESCE(p.price_on_site_base, 0) as prix_base,
  c.name as categorie
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1
ORDER BY p.display_order;

COMMIT;