-- 🥤 RESET COMPLET DRINKS + INSERTION DONNÉES EXACTES UTILISATEUR
-- Suppression totale + insertion selon prix exacts

BEGIN;

-- 1. SUPPRESSION COMPLÈTE boissons existantes catégorie DRINKS
DELETE FROM france_product_variants 
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON p.category_id = c.id
    WHERE c.slug = 'drinks' AND c.restaurant_id = 1
);

DELETE FROM france_products 
WHERE category_id IN (
    SELECT id FROM france_menu_categories 
    WHERE slug = 'drinks' AND restaurant_id = 1
);

-- 2. INSERTION BOISSONS 33CL - Prix : 1€50 (même prix sur place et livraison)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'MIRANDA TROPICAL', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 1
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, 'MIRANDA FRAISE', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 2
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, 'OASIS TROPICAL', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 3
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, 'TROPICO', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 4
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, 'ICE TEA', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 5
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, '7 UP', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 6
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, '7UP TROPICAL', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 7
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, '7UP CHERRY', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 8
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, 'COCA COLA', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 9
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, 'COCA ZERO', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 10
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, 'EAU MINÉRALE', 'simple'::product_type_enum, 1.50, 1.50, '50cl', 11
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks'
UNION ALL
SELECT r.id, c.id, 'PERRIER', 'simple'::product_type_enum, 1.50, 1.50, '33cl', 12
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

-- 3. BOISSONS 1L5 avec variants (prix différents)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'COCA COLA 1L5', 'variant'::product_type_enum, 20
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

WITH coca_1l5 AS (SELECT p.id FROM france_products p JOIN france_menu_categories c ON p.category_id = c.id WHERE c.slug = 'drinks' AND c.restaurant_id = 1 AND p.name = 'COCA COLA 1L5')
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '1L5', 3.00, 3.00, 150, 'cl', 1 FROM coca_1l5;

INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'COCA ZERO 1L5', 'variant'::product_type_enum, 21
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

WITH coca_zero_1l5 AS (SELECT p.id FROM france_products p JOIN france_menu_categories c ON p.category_id = c.id WHERE c.slug = 'drinks' AND c.restaurant_id = 1 AND p.name = 'COCA ZERO 1L5')
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '1L5', 3.00, 3.00, 150, 'cl', 1 FROM coca_zero_1l5;

INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'FANTA 1L5', 'variant'::product_type_enum, 22
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

WITH fanta_1l5 AS (SELECT p.id FROM france_products p JOIN france_menu_categories c ON p.category_id = c.id WHERE c.slug = 'drinks' AND c.restaurant_id = 1 AND p.name = 'FANTA 1L5')
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '1L5', 3.00, 3.00, 150, 'cl', 1 FROM fanta_1l5;

INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'OASIS 1L5', 'variant'::product_type_enum, 23
FROM france_restaurants r JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'drinks';

WITH oasis_1l5 AS (SELECT p.id FROM france_products p JOIN france_menu_categories c ON p.category_id = c.id WHERE c.slug = 'drinks' AND c.restaurant_id = 1 AND p.name = 'OASIS 1L5')
INSERT INTO france_product_variants (product_id, variant_name, price_on_site, price_delivery, quantity, unit, display_order)
SELECT id, '1L5', 3.50, 3.50, 150, 'cl', 1 FROM oasis_1l5;

-- Vérification finale
SELECT 
  p.name,
  p.product_type,
  COALESCE(p.price_on_site_base, pv.price_on_site) as prix_sur_place,
  COALESCE(p.price_delivery_base, pv.price_delivery) as prix_livraison,
  COALESCE(p.composition, pv.variant_name) as format
FROM france_products p
LEFT JOIN france_product_variants pv ON p.id = pv.product_id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1
ORDER BY p.display_order;

SELECT COUNT(*) as total_boissons_creees FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks' AND c.restaurant_id = 1;

COMMIT;