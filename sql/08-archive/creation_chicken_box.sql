-- ============================================
-- CRÉATION CATÉGORIE CHICKEN BOX AVEC WORKFLOW INTERACTIF
-- ============================================

BEGIN;

-- ===============================
-- ÉTAPE 1: CRÉER LA CATÉGORIE CHICKEN BOX
-- ===============================

INSERT INTO france_menu_categories (restaurant_id, name, slug, display_order, is_active)
SELECT r.id, 'CHICKEN BOX', 'chicken-box', 60, true
FROM france_restaurants r 
WHERE r.slug = 'pizza-yolo-77';

-- ===============================
-- ÉTAPE 2: CRÉER LES PRODUITS CHICKEN BOX (COMPOSITE AVEC WORKFLOW)
-- ===============================

-- CHICKEN BOX (21€/22€)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order, workflow_type, requires_steps, steps_config)
SELECT r.id, c.id, 'CHICKEN BOX', 'composite'::product_type_enum, 21.00, 22.00, '25 pièces Wings + 2 frites + 1 bouteille 1L5', 1, 'composite_selection', true, '{
  "steps": [
    {
      "type": "single_choice", 
      "title": "Choisissez votre boisson 1L5", 
      "options": ["Coca Cola 1L5", "Coca Zero 1L5", "Oasis Tropical 2L", "Ice Tea 2L"]
    }
  ],
  "final_format": "25 Wings + 2 frites + {boisson}"
}'::json
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'chicken-box';

-- MIXTE BOX (27€90/28€90)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order, workflow_type, requires_steps, steps_config)
SELECT r.id, c.id, 'MIXTE BOX', 'composite'::product_type_enum, 27.90, 28.90, '8 pièces Tenders + 15 pièces Wings + 2 frites + 1 bouteille 1L5', 2, 'composite_selection', true, '{
  "steps": [
    {
      "type": "single_choice", 
      "title": "Choisissez votre boisson 1L5", 
      "options": ["Coca Cola 1L5", "Coca Zero 1L5", "Oasis Tropical 2L", "Ice Tea 2L"]
    }
  ],
  "final_format": "8 Tenders + 15 Wings + 2 frites + {boisson}"
}'::json
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'chicken-box';

-- TENDERS BOX (27€90/28€90)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order, workflow_type, requires_steps, steps_config)
SELECT r.id, c.id, 'TENDERS BOX', 'composite'::product_type_enum, 27.90, 28.90, '20 pièces Tenders + 2 frites + 1 bouteille 1L5', 3, 'composite_selection', true, '{
  "steps": [
    {
      "type": "single_choice", 
      "title": "Choisissez votre boisson 1L5", 
      "options": ["Coca Cola 1L5", "Coca Zero 1L5", "Oasis Tropical 2L", "Ice Tea 2L"]
    }
  ],
  "final_format": "20 Tenders + 2 frites + {boisson}"
}'::json
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'chicken-box';

-- ===============================
-- ÉTAPE 3: COMPOSITION DES CHICKEN BOX (ÉLÉMENTS FIXES)
-- ===============================

-- Composition CHICKEN BOX
WITH chicken_box_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'chicken-box' AND p.name = 'CHICKEN BOX'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Wings', 25, 'pièces' FROM chicken_box_product
UNION ALL
SELECT id, 'Frites', 2, 'portions' FROM chicken_box_product
UNION ALL
SELECT id, 'Boisson 1L5', 1, 'choix' FROM chicken_box_product;

-- Composition MIXTE BOX
WITH mixte_box_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'chicken-box' AND p.name = 'MIXTE BOX'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Tenders', 8, 'pièces' FROM mixte_box_product
UNION ALL
SELECT id, 'Wings', 15, 'pièces' FROM mixte_box_product
UNION ALL
SELECT id, 'Frites', 2, 'portions' FROM mixte_box_product
UNION ALL
SELECT id, 'Boisson 1L5', 1, 'choix' FROM mixte_box_product;

-- Composition TENDERS BOX
WITH tenders_box_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'chicken-box' AND p.name = 'TENDERS BOX'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Tenders', 20, 'pièces' FROM tenders_box_product
UNION ALL
SELECT id, 'Frites', 2, 'portions' FROM tenders_box_product
UNION ALL
SELECT id, 'Boisson 1L5', 1, 'choix' FROM tenders_box_product;

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
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'chicken-box';

-- Vérifier les produits CHICKEN BOX
SELECT 
  p.name,
  p.product_type,
  p.price_on_site_base,
  p.price_delivery_base,
  p.workflow_type,
  p.requires_steps,
  COUNT(ci.id) as nb_components
FROM france_products p
LEFT JOIN france_composite_items ci ON p.id = ci.composite_product_id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'chicken-box'
GROUP BY p.id, p.name, p.product_type, p.price_on_site_base, p.price_delivery_base, p.workflow_type, p.requires_steps
ORDER BY p.display_order;

-- Vérifier la configuration JSON séparément
SELECT 
  p.name,
  p.steps_config
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'chicken-box'
ORDER BY p.display_order;

-- Vérifier les compositions détaillées
SELECT 
  p.name as box_name,
  ci.component_name,
  ci.quantity,
  ci.unit
FROM france_products p
JOIN france_composite_items ci ON p.id = ci.composite_product_id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'chicken-box'
ORDER BY p.name, ci.component_name;

COMMIT;