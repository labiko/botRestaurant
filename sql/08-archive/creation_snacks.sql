-- ============================================
-- CRÉATION CATÉGORIE SNACKS AVEC WORKFLOW INTERACTIF
-- ============================================

BEGIN;

-- ===============================
-- ÉTAPE 1: CRÉER LA CATÉGORIE SNACKS
-- ===============================

INSERT INTO france_menu_categories (restaurant_id, name, slug, display_order, is_active)
SELECT r.id, 'SNACKS', 'snacks', 70, true
FROM france_restaurants r 
WHERE r.slug = 'pizza-yolo-77';

-- ===============================
-- ÉTAPE 2: PRODUITS SNACKS SIMPLES (SANS WORKFLOW)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, '1 TENDER', 'simple'::product_type_enum, 1.50, 2.50, '1 pièce tender de poulet', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks'
UNION ALL
SELECT r.id, c.id, '4 NUGGETS', 'simple'::product_type_enum, 3.50, 4.50, '4 pièces nuggets de poulet', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks'
UNION ALL
SELECT r.id, c.id, '4 WINGS', 'simple'::product_type_enum, 3.50, 4.50, '4 pièces wings de poulet', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks'
UNION ALL
SELECT r.id, c.id, 'DONUT POULET', 'simple'::product_type_enum, 2.00, 3.00, '1 pièce donut de poulet', 7
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks'
UNION ALL
SELECT r.id, c.id, 'MOZZA STICK', 'simple'::product_type_enum, 3.50, 4.50, '4 pièces mozza stick', 8
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks'
UNION ALL
SELECT r.id, c.id, 'JALAPENOS', 'simple'::product_type_enum, 3.50, 4.50, '4 pièces jalapeños', 9
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks'
UNION ALL
SELECT r.id, c.id, 'ONION RINGS', 'simple'::product_type_enum, 3.50, 4.50, '4 pièces onion rings', 10
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks'
UNION ALL
SELECT r.id, c.id, 'POTATOES', 'simple'::product_type_enum, 1.00, 2.00, 'Pommes de terre épicées', 11
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks';

-- ===============================
-- ÉTAPE 3: PRODUITS SNACKS AVEC WORKFLOW (AVEC FRITES ET BOISSON 33CL)
-- ===============================

-- 5 TENDERS (9€/10€) avec frites et boisson 33CL
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order, workflow_type, requires_steps, steps_config)
SELECT r.id, c.id, '5 TENDERS', 'composite'::product_type_enum, 9.00, 10.00, '5 pièces tenders + frites + boisson 33CL', 2, 'composite_selection', true, '{
  "steps": [
    {
      "type": "single_choice", 
      "title": "Choisissez votre boisson 33CL", 
      "options": ["Coca Cola 33CL", "Coca Zero 33CL", "Sprite 33CL", "Fanta Orange 33CL", "Miranda Tropical 33CL", "Miranda Fraise 33CL", "7 UP 33CL", "Eau Minérale 50CL"]
    }
  ],
  "final_format": "5 Tenders + frites + {boisson}"
}'::json
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks';

-- 10 NUGGETS (9€/10€) avec frites et boisson 33CL
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order, workflow_type, requires_steps, steps_config)
SELECT r.id, c.id, '10 NUGGETS', 'composite'::product_type_enum, 9.00, 10.00, '10 pièces nuggets + frites + boisson 33CL', 4, 'composite_selection', true, '{
  "steps": [
    {
      "type": "single_choice", 
      "title": "Choisissez votre boisson 33CL", 
      "options": ["Coca Cola 33CL", "Coca Zero 33CL", "Sprite 33CL", "Fanta Orange 33CL", "Miranda Tropical 33CL", "Miranda Fraise 33CL", "7 UP 33CL", "Eau Minérale 50CL"]
    }
  ],
  "final_format": "10 Nuggets + frites + {boisson}"
}'::json
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks';

-- 8 WINGS (9€/10€) avec frites et boisson 33CL
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order, workflow_type, requires_steps, steps_config)
SELECT r.id, c.id, '8 WINGS', 'composite'::product_type_enum, 9.00, 10.00, '8 pièces wings + frites + boisson 33CL', 6, 'composite_selection', true, '{
  "steps": [
    {
      "type": "single_choice", 
      "title": "Choisissez votre boisson 33CL", 
      "options": ["Coca Cola 33CL", "Coca Zero 33CL", "Sprite 33CL", "Fanta Orange 33CL", "Miranda Tropical 33CL", "Miranda Fraise 33CL", "7 UP 33CL", "Eau Minérale 50CL"]
    }
  ],
  "final_format": "8 Wings + frites + {boisson}"
}'::json
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks';

-- ===============================
-- ÉTAPE 4: COMPOSITION DES SNACKS AVEC WORKFLOW (ÉLÉMENTS FIXES)
-- ===============================

-- Composition 5 TENDERS
WITH tenders_5_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks' AND p.name = '5 TENDERS'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Tenders', 5, 'pièces' FROM tenders_5_product
UNION ALL
SELECT id, 'Frites', 1, 'portion' FROM tenders_5_product
UNION ALL
SELECT id, 'Boisson 33CL', 1, 'choix' FROM tenders_5_product;

-- Composition 10 NUGGETS
WITH nuggets_10_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks' AND p.name = '10 NUGGETS'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Nuggets', 10, 'pièces' FROM nuggets_10_product
UNION ALL
SELECT id, 'Frites', 1, 'portion' FROM nuggets_10_product
UNION ALL
SELECT id, 'Boisson 33CL', 1, 'choix' FROM nuggets_10_product;

-- Composition 8 WINGS
WITH wings_8_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks' AND p.name = '8 WINGS'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Wings', 8, 'pièces' FROM wings_8_product
UNION ALL
SELECT id, 'Frites', 1, 'portion' FROM wings_8_product
UNION ALL
SELECT id, 'Boisson 33CL', 1, 'choix' FROM wings_8_product;

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
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'snacks';

-- Vérifier tous les produits SNACKS
SELECT 
  p.name,
  p.product_type,
  p.price_on_site_base,
  p.price_delivery_base,
  p.workflow_type,
  p.requires_steps,
  CASE WHEN p.workflow_type IS NOT NULL THEN (SELECT COUNT(*) FROM france_composite_items ci WHERE ci.composite_product_id = p.id) ELSE 0 END as nb_components
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'snacks'
ORDER BY p.display_order;

-- Vérifier les compositions des produits avec workflow
SELECT 
  p.name as snack_name,
  ci.component_name,
  ci.quantity,
  ci.unit
FROM france_products p
JOIN france_composite_items ci ON p.id = ci.composite_product_id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'snacks'
ORDER BY p.name, ci.component_name;

COMMIT;