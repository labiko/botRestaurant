-- ============================================
-- CRÉATION MENU ENFANT
-- ============================================

BEGIN;

-- ===============================
-- ÉTAPE 1: CRÉER LA CATÉGORIE MENU ENFANT
-- ===============================

INSERT INTO france_menu_categories (restaurant_id, name, slug, display_order, is_active)
SELECT r.id, 'MENU ENFANT', 'menu-enfant', 100, true
FROM france_restaurants r 
WHERE r.slug = 'pizza-yolo-77';

-- ===============================
-- ÉTAPE 2: CRÉER LE PRODUIT MENU ENFANT (COMPOSITE)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'MENU ENFANT', 'composite'::product_type_enum, 7.00, 8.00, 'Cheeseburger OU Nuggets + Frites + Kinder Surprise + Compote OU Caprisun', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'menu-enfant';

-- ===============================
-- ÉTAPE 3: COMPOSITION MENU ENFANT (ÉLÉMENTS FIXES)
-- ===============================

WITH menu_enfant_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'menu-enfant' AND p.name = 'MENU ENFANT'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Frites', 1, 'portion' FROM menu_enfant_product
UNION ALL
SELECT id, 'Kinder Surprise', 1, 'pièce' FROM menu_enfant_product
UNION ALL
SELECT id, 'Plat Principal', 1, 'choix' FROM menu_enfant_product
UNION ALL
SELECT id, 'Boisson Enfant', 1, 'choix' FROM menu_enfant_product;

-- ===============================
-- VÉRIFICATIONS
-- ===============================

-- Vérifier la catégorie créée
SELECT 
  r.name as restaurant,
  c.name as category,
  c.slug,
  c.display_order,
  c.is_active
FROM france_menu_categories c
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'menu-enfant';

-- Vérifier le produit MENU ENFANT
SELECT 
  p.name,
  p.product_type,
  p.price_on_site_base,
  p.price_delivery_base,
  p.composition,
  COUNT(ci.id) as nb_components
FROM france_products p
LEFT JOIN france_composite_items ci ON p.id = ci.composite_product_id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'menu-enfant'
  AND p.name = 'MENU ENFANT'
GROUP BY p.id, p.name, p.product_type, p.price_on_site_base, p.price_delivery_base, p.composition;

-- Vérifier la composition détaillée
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
  AND c.slug = 'menu-enfant'
  AND p.name = 'MENU ENFANT'
ORDER BY ci.component_name;

COMMIT;