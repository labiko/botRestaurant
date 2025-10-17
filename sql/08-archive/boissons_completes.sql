-- 🥤 TOUTES LES BOISSONS MANQUANTES - Ajout au script existant

BEGIN;

-- OASIS TROPICAL (variants 33CL, 2L)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'OASIS TROPICAL', 'variant'::product_type_enum, 26
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

WITH oasis_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks' AND p.name = 'OASIS TROPICAL'
)
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 1.50, 33, 'cl', 1 FROM oasis_product
UNION ALL
SELECT id, '2L', 3.50, 3.50, 200, 'cl', 2 FROM oasis_product;

-- MIRANDA TROPICAL (simple 33CL)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'MIRANDA TROPICAL', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 27
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

-- MIRANDA FRAISE (simple 33CL)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'MIRANDA FRAISE', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 28
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

-- 7 UP (simple 33CL)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, '7 UP', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 29
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

-- Compléter ICE TEA avec variant 2L manquant
WITH icetea_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks' AND p.name = 'ICE TEA'
)
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '2L', 3.50, 3.50, 200, 'cl', 2 FROM icetea_product;

-- Ajouter variant 2L à COCA COLA
WITH coca_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks' AND p.name = 'COCA COLA'
)
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '2L', 3.50, 3.50, 200, 'cl', 3 FROM coca_product;

-- Vérification finale - TOUTES les boissons
SELECT 
  p.name,
  p.product_type,
  COALESCE(p.price_on_site_base, 0) as prix_base,
  COUNT(pv.id) as nb_variants
FROM france_products p
LEFT JOIN france_product_variants pv ON p.id = pv.product_id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1
GROUP BY p.id, p.name, p.product_type, p.price_on_site_base
ORDER BY p.display_order;

COMMIT;