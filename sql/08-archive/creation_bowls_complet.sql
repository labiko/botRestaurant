-- ============================================
-- CRÉATION CATÉGORIE BOWLS AVEC WORKFLOW INTERACTIF
-- ============================================

BEGIN;

-- ===============================
-- ÉTAPE 1: CRÉER LA CATÉGORIE BOWLS
-- ===============================

INSERT INTO france_menu_categories (restaurant_id, name, slug, display_order, is_active)
SELECT r.id, 'BOWLS', 'bowls', 50, true
FROM france_restaurants r 
WHERE r.slug = 'pizza-yolo-77';

-- ===============================
-- ÉTAPE 2: SUPPRIMER L'ANCIEN BOWL DES ASSIETTES
-- ===============================

DELETE FROM france_products 
WHERE name = 'BOWL' 
AND restaurant_id = (SELECT id FROM france_restaurants WHERE slug = 'pizza-yolo-77');

-- ===============================
-- ÉTAPE 3: CRÉER LES PRODUITS BOWL (COMPOSITE AVEC WORKFLOW)
-- ===============================

-- BOWL Normal (8€/9€)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order, workflow_type, requires_steps, steps_config)
SELECT r.id, c.id, 'BOWL', 'composite'::product_type_enum, 8.00, 9.00, '1 viande au choix + cheddar + sauce fromagère + frites', 1, 'composite_selection', true, '{
  "steps": [
    {
      "type": "single_choice", 
      "title": "Choisissez votre viande", 
      "options": ["Nuggets", "Merguez", "Filet de poulet", "Cordon bleu", "Kefta", "Poulet mariné", "Viande hachée", "Steak de cheval"]
    }
  ],
  "final_format": "{viande} + cheddar + sauce fromagère + frites"
}'::json
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'bowls';

-- BOWL Grande (9€/10€) - Prix ajusté pour la grande portion
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order, workflow_type, requires_steps, steps_config)
SELECT r.id, c.id, 'BOWL GRANDE', 'composite'::product_type_enum, 9.00, 10.00, '1 viande au choix + cheddar + sauce fromagère + frites (grande portion)', 2, 'composite_selection', true, '{
  "steps": [
    {
      "type": "single_choice", 
      "title": "Choisissez votre viande", 
      "options": ["Nuggets", "Merguez", "Filet de poulet", "Cordon bleu", "Kefta", "Poulet mariné", "Viande hachée", "Steak de cheval"]
    }
  ],
  "final_format": "{viande} + cheddar + sauce fromagère + frites (grande portion)"
}'::json
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'bowls';

-- ===============================
-- ÉTAPE 4: COMPOSITION DES BOWLS (ÉLÉMENTS FIXES)
-- ===============================

-- Composition BOWL Normal
WITH bowl_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'bowls' AND p.name = 'BOWL'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Viande', 1, 'choix' FROM bowl_product
UNION ALL
SELECT id, 'Cheddar', 1, 'portion' FROM bowl_product
UNION ALL
SELECT id, 'Sauce fromagère', 1, 'portion' FROM bowl_product
UNION ALL
SELECT id, 'Frites', 1, 'portion' FROM bowl_product;

-- Composition BOWL GRANDE
WITH bowl_grande_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'bowls' AND p.name = 'BOWL GRANDE'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Viande', 1, 'choix' FROM bowl_grande_product
UNION ALL
SELECT id, 'Cheddar', 1, 'grande portion' FROM bowl_grande_product
UNION ALL
SELECT id, 'Sauce fromagère', 1, 'grande portion' FROM bowl_grande_product
UNION ALL
SELECT id, 'Frites', 1, 'grande portion' FROM bowl_grande_product;

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
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'bowls';

-- Vérifier les produits BOWL
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
  AND c.slug = 'bowls'
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
  AND c.slug = 'bowls'
ORDER BY p.display_order;

-- Vérifier les compositions détaillées
SELECT 
  p.name as bowl_name,
  ci.component_name,
  ci.quantity,
  ci.unit
FROM france_products p
JOIN france_composite_items ci ON p.id = ci.composite_product_id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'bowls'
ORDER BY p.name, ci.component_name;

-- Vérifier que l'ancien BOWL a été supprimé des assiettes
SELECT COUNT(*) as nb_anciens_bowl
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
  AND c.slug = 'assiettes'
  AND p.name = 'BOWL';

COMMIT;