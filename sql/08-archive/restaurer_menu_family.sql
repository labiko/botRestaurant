-- ============================================
-- RESTAURATION MENU FAMILY
-- ============================================

BEGIN;

-- ===============================
-- MENU FAMILY (COMPOSITE)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'MENU FAMILY', 'composite'::product_type_enum, 29.90, 31.90, '6 Wings + 6 Tenders + 6 Nuggets + 2 Frites + 2 Mozza Stick + 2 Donuts + 4 Onion Rings + 1 Maxi Boisson', 20
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks';

-- Composition Menu Family
WITH menu_family_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks' AND p.name = 'MENU FAMILY'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Wings', 6, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Tenders', 6, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Nuggets', 6, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Frites', 2, 'portions' FROM menu_family_product
UNION ALL
SELECT id, 'Mozza Sticks', 2, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Donuts', 2, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Onion Rings', 4, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Maxi Boisson', 1, 'pièce' FROM menu_family_product;

-- ===============================
-- CONFIGURER INCLUDES_DRINK POUR MENU FAMILY (boissons 1L5)
-- ===============================

INSERT INTO france_product_sizes (product_id, size_name, price_on_site, price_delivery, display_order, includes_drink)
SELECT p.id, 'NORMAL', p.price_on_site_base, p.price_delivery_base, 1, true
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'poulet-snacks'
  AND p.name = 'MENU FAMILY';

-- Vérification MENU FAMILY
SELECT 
  p.name,
  p.product_type,
  p.price_on_site_base,
  p.price_delivery_base,
  ps.includes_drink,
  COUNT(ci.id) as nb_components
FROM france_products p
LEFT JOIN france_composite_items ci ON p.id = ci.composite_product_id
LEFT JOIN france_product_sizes ps ON p.id = ps.product_id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'poulet-snacks'
  AND p.name = 'MENU FAMILY'
GROUP BY p.id, p.name, p.product_type, p.price_on_site_base, p.price_delivery_base, ps.includes_drink;

-- Vérifier composition détaillée
SELECT 
  p.name as menu_name,
  ci.component_name,
  ci.quantity,
  ci.unit
FROM france_products p
JOIN france_composite_items ci ON p.id = ci.composite_product_id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'poulet-snacks'
  AND p.name = 'MENU FAMILY'
ORDER BY ci.component_name;

COMMIT;