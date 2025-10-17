-- 🔧 CONFIGURATION UNIVERSELLE - TOUS LES PRODUITS COMPOSITES
-- Architecture Bot Universel : 100% configuration BDD, 0% code

BEGIN;

-- ============================================
-- 1. VÉRIFICATION DES CATÉGORIES EXISTANTES
-- ============================================

SELECT 'CATÉGORIES EXISTANTES' as etape;
SELECT id, name, slug, icon 
FROM france_menu_categories 
WHERE restaurant_id = 1 
ORDER BY display_order;

-- ============================================
-- 2. CONFIGURATION BURGERS
-- ============================================

-- Identifier les burgers existants
WITH burger_products AS (
  SELECT p.id, p.name, p.price_on_site_base, p.price_delivery_base
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'burgers' AND c.restaurant_id = 1
)
UPDATE france_products 
SET 
  product_type = 'composite',
  workflow_type = 'burger_builder',
  requires_steps = true,
  steps_config = jsonb_build_object(
    'steps', jsonb_build_array('meat_choice', 'sauce_selection', 'extras_choice'),
    'meat_count', 1,
    'sauce_count', 2,
    'extras_optional', true
  )
WHERE id IN (SELECT id FROM burger_products);

-- Options pour les burgers
WITH burger_ids AS (
  SELECT p.id 
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'burgers' AND c.restaurant_id = 1
)
INSERT INTO france_product_options (product_id, option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
SELECT 
  id as product_id,
  option_group,
  option_name,
  price_adjustment,
  is_required,
  max_selections,
  group_order,
  display_order
FROM burger_ids
CROSS JOIN (VALUES
  -- Viandes (étape 1)
  ('viande', 'Steak haché', 0, true, 1, 1, 1),
  ('viande', 'Poulet pané', 0, true, 1, 1, 2),
  ('viande', 'Poisson pané', 0, true, 1, 1, 3),
  ('viande', 'Végétarien', 0, true, 1, 1, 4),
  
  -- Sauces (étape 2)
  ('sauce', 'Ketchup', 0, false, 2, 2, 1),
  ('sauce', 'Mayo', 0, false, 2, 2, 2),
  ('sauce', 'Barbecue', 0, false, 2, 2, 3),
  ('sauce', 'Burger', 0, false, 2, 2, 4),
  ('sauce', 'Algérienne', 0, false, 2, 2, 5),
  ('sauce', 'Samouraï', 0, false, 2, 2, 6),
  
  -- Suppléments (étape 3)
  ('extras', 'Bacon', 1.5, false, 3, 3, 1),
  ('extras', 'Fromage supplémentaire', 1, false, 3, 3, 2),
  ('extras', 'Œuf', 1, false, 3, 3, 3),
  ('extras', 'Oignons frits', 0.5, false, 3, 3, 4)
) AS options(option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
ON CONFLICT (product_id, option_group, option_name) DO UPDATE
SET 
  price_adjustment = EXCLUDED.price_adjustment,
  is_required = EXCLUDED.is_required,
  max_selections = EXCLUDED.max_selections,
  group_order = EXCLUDED.group_order,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 3. CONFIGURATION SANDWICHS
-- ============================================

WITH sandwich_products AS (
  SELECT p.id, p.name
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'sandwichs' AND c.restaurant_id = 1
)
UPDATE france_products 
SET 
  product_type = 'composite',
  workflow_type = 'sandwich_builder',
  requires_steps = true,
  steps_config = jsonb_build_object(
    'steps', jsonb_build_array('protein_choice', 'sauce_selection', 'vegetables'),
    'protein_count', 1,
    'sauce_count', 2,
    'vegetables_optional', true
  )
WHERE id IN (SELECT id FROM sandwich_products);

-- Options pour les sandwichs
WITH sandwich_ids AS (
  SELECT p.id 
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'sandwichs' AND c.restaurant_id = 1
)
INSERT INTO france_product_options (product_id, option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
SELECT 
  id as product_id,
  option_group,
  option_name,
  price_adjustment,
  is_required,
  max_selections,
  group_order,
  display_order
FROM sandwich_ids
CROSS JOIN (VALUES
  -- Protéines (étape 1)
  ('protein', 'Poulet', 0, true, 1, 1, 1),
  ('protein', 'Thon', 0, true, 1, 1, 2),
  ('protein', 'Jambon', 0, true, 1, 1, 3),
  ('protein', 'Kebab', 0, true, 1, 1, 4),
  ('protein', 'Merguez', 0, true, 1, 1, 5),
  
  -- Sauces (étape 2)
  ('sauce', 'Mayo', 0, false, 2, 2, 1),
  ('sauce', 'Harissa', 0, false, 2, 2, 2),
  ('sauce', 'Algérienne', 0, false, 2, 2, 3),
  ('sauce', 'Blanche', 0, false, 2, 2, 4),
  ('sauce', 'Barbecue', 0, false, 2, 2, 5),
  
  -- Légumes (étape 3)
  ('vegetables', 'Salade', 0, false, 5, 3, 1),
  ('vegetables', 'Tomates', 0, false, 5, 3, 2),
  ('vegetables', 'Oignons', 0, false, 5, 3, 3),
  ('vegetables', 'Cornichons', 0, false, 5, 3, 4)
) AS options(option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
ON CONFLICT (product_id, option_group, option_name) DO UPDATE
SET 
  price_adjustment = EXCLUDED.price_adjustment,
  is_required = EXCLUDED.is_required,
  max_selections = EXCLUDED.max_selections,
  group_order = EXCLUDED.group_order,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 4. CONFIGURATION ASSIETTES
-- ============================================

WITH assiette_products AS (
  SELECT p.id, p.name
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'assiettes' AND c.restaurant_id = 1
)
UPDATE france_products 
SET 
  product_type = 'composite',
  workflow_type = 'plate_builder',
  requires_steps = true,
  steps_config = jsonb_build_object(
    'steps', jsonb_build_array('meat_choice', 'side_choice', 'sauce_selection'),
    'meat_count', 1,
    'side_count', 2,
    'sauce_count', 2
  )
WHERE id IN (SELECT id FROM assiette_products);

-- Options pour les assiettes
WITH assiette_ids AS (
  SELECT p.id 
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'assiettes' AND c.restaurant_id = 1
)
INSERT INTO france_product_options (product_id, option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
SELECT 
  id as product_id,
  option_group,
  option_name,
  price_adjustment,
  is_required,
  max_selections,
  group_order,
  display_order
FROM assiette_ids
CROSS JOIN (VALUES
  -- Viandes (étape 1)
  ('meat', 'Poulet grillé', 0, true, 1, 1, 1),
  ('meat', 'Brochettes', 0, true, 1, 1, 2),
  ('meat', 'Merguez', 0, true, 1, 1, 3),
  ('meat', 'Kebab', 0, true, 1, 1, 4),
  ('meat', 'Kefta', 0, true, 1, 1, 5),
  
  -- Accompagnements (étape 2)
  ('side', 'Frites', 0, true, 2, 2, 1),
  ('side', 'Riz', 0, true, 2, 2, 2),
  ('side', 'Salade', 0, true, 2, 2, 3),
  ('side', 'Légumes grillés', 0, true, 2, 2, 4),
  
  -- Sauces (étape 3)
  ('sauce', 'Algérienne', 0, false, 2, 3, 1),
  ('sauce', 'Samouraï', 0, false, 2, 3, 2),
  ('sauce', 'Blanche', 0, false, 2, 3, 3),
  ('sauce', 'Harissa', 0, false, 2, 3, 4),
  ('sauce', 'Mayo', 0, false, 2, 3, 5)
) AS options(option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
ON CONFLICT (product_id, option_group, option_name) DO UPDATE
SET 
  price_adjustment = EXCLUDED.price_adjustment,
  is_required = EXCLUDED.is_required,
  max_selections = EXCLUDED.max_selections,
  group_order = EXCLUDED.group_order,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 5. CONFIGURATION NAANS
-- ============================================

WITH naan_products AS (
  SELECT p.id, p.name
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'naans' AND c.restaurant_id = 1
)
UPDATE france_products 
SET 
  product_type = 'composite',
  workflow_type = 'naan_builder',
  requires_steps = true,
  steps_config = jsonb_build_object(
    'steps', jsonb_build_array('filling_choice', 'cheese_choice', 'sauce_selection'),
    'filling_count', 1,
    'cheese_optional', true,
    'sauce_count', 1
  )
WHERE id IN (SELECT id FROM naan_products);

-- Options pour les naans
WITH naan_ids AS (
  SELECT p.id 
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'naans' AND c.restaurant_id = 1
)
INSERT INTO france_product_options (product_id, option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
SELECT 
  id as product_id,
  option_group,
  option_name,
  price_adjustment,
  is_required,
  max_selections,
  group_order,
  display_order
FROM naan_ids
CROSS JOIN (VALUES
  -- Garnitures (étape 1)
  ('filling', 'Poulet tikka', 0, true, 1, 1, 1),
  ('filling', 'Bœuf épicé', 0, true, 1, 1, 2),
  ('filling', 'Kebab', 0, true, 1, 1, 3),
  ('filling', 'Végétarien', 0, true, 1, 1, 4),
  
  -- Fromage (étape 2)
  ('cheese', 'Sans fromage', 0, false, 1, 2, 1),
  ('cheese', 'Emmental', 0, false, 1, 2, 2),
  ('cheese', 'Mozzarella', 0.5, false, 1, 2, 3),
  ('cheese', 'Chèvre', 1, false, 1, 2, 4),
  
  -- Sauces (étape 3)
  ('sauce', 'Curry', 0, true, 1, 3, 1),
  ('sauce', 'Blanche', 0, true, 1, 3, 2),
  ('sauce', 'Algérienne', 0, true, 1, 3, 3),
  ('sauce', 'Harissa', 0, true, 1, 3, 4)
) AS options(option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
ON CONFLICT (product_id, option_group, option_name) DO UPDATE
SET 
  price_adjustment = EXCLUDED.price_adjustment,
  is_required = EXCLUDED.is_required,
  max_selections = EXCLUDED.max_selections,
  group_order = EXCLUDED.group_order,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 6. CONFIGURATION SMASHS
-- ============================================

WITH smash_products AS (
  SELECT p.id, p.name
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'smashs' AND c.restaurant_id = 1
)
UPDATE france_products 
SET 
  product_type = 'composite',
  workflow_type = 'smash_builder',
  requires_steps = true,
  steps_config = jsonb_build_object(
    'steps', jsonb_build_array('patty_count', 'cheese_type', 'toppings', 'sauce_selection'),
    'min_patties', 1,
    'max_patties', 3,
    'cheese_required', true,
    'sauce_count', 2
  )
WHERE id IN (SELECT id FROM smash_products);

-- Options pour les smashs
WITH smash_ids AS (
  SELECT p.id 
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'smashs' AND c.restaurant_id = 1
)
INSERT INTO france_product_options (product_id, option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
SELECT 
  id as product_id,
  option_group,
  option_name,
  price_adjustment,
  is_required,
  max_selections,
  group_order,
  display_order
FROM smash_ids
CROSS JOIN (VALUES
  -- Nombre de steaks (étape 1)
  ('patty', 'Simple (1 steak)', 0, true, 1, 1, 1),
  ('patty', 'Double (2 steaks)', 3, true, 1, 1, 2),
  ('patty', 'Triple (3 steaks)', 6, true, 1, 1, 3),
  
  -- Type de fromage (étape 2)
  ('cheese', 'Cheddar', 0, true, 1, 2, 1),
  ('cheese', 'Emmental', 0, true, 1, 2, 2),
  ('cheese', 'Raclette', 0.5, true, 1, 2, 3),
  ('cheese', 'Bleu', 1, true, 1, 2, 4),
  
  -- Garnitures (étape 3)
  ('toppings', 'Bacon', 1.5, false, 4, 3, 1),
  ('toppings', 'Oignons caramélisés', 0.5, false, 4, 3, 2),
  ('toppings', 'Jalapeños', 0.5, false, 4, 3, 3),
  ('toppings', 'Cornichons', 0, false, 4, 3, 4),
  ('toppings', 'Tomates', 0, false, 4, 3, 5),
  ('toppings', 'Salade', 0, false, 4, 3, 6),
  
  -- Sauces (étape 4)
  ('sauce', 'Burger maison', 0, false, 2, 4, 1),
  ('sauce', 'BBQ fumé', 0, false, 2, 4, 2),
  ('sauce', 'Mayo épicée', 0, false, 2, 4, 3),
  ('sauce', 'Ketchup', 0, false, 2, 4, 4),
  ('sauce', 'Moutarde', 0, false, 2, 4, 5)
) AS options(option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
ON CONFLICT (product_id, option_group, option_name) DO UPDATE
SET 
  price_adjustment = EXCLUDED.price_adjustment,
  is_required = EXCLUDED.is_required,
  max_selections = EXCLUDED.max_selections,
  group_order = EXCLUDED.group_order,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 7. CONFIGURATION GOURMETS (BOWLS)
-- ============================================

WITH gourmet_products AS (
  SELECT p.id, p.name
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug IN ('gourmets', 'bowls') AND c.restaurant_id = 1
)
UPDATE france_products 
SET 
  product_type = 'composite',
  workflow_type = 'bowl_builder',
  requires_steps = true,
  steps_config = jsonb_build_object(
    'steps', jsonb_build_array('base_choice', 'protein_choice', 'toppings', 'sauce_selection'),
    'base_count', 1,
    'protein_count', 2,
    'toppings_count', 4,
    'sauce_count', 1
  )
WHERE id IN (SELECT id FROM gourmet_products);

-- Options pour les gourmets/bowls
WITH gourmet_ids AS (
  SELECT p.id 
  FROM france_products p
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug IN ('gourmets', 'bowls') AND c.restaurant_id = 1
)
INSERT INTO france_product_options (product_id, option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
SELECT 
  id as product_id,
  option_group,
  option_name,
  price_adjustment,
  is_required,
  max_selections,
  group_order,
  display_order
FROM gourmet_ids
CROSS JOIN (VALUES
  -- Base (étape 1)
  ('base', 'Riz blanc', 0, true, 1, 1, 1),
  ('base', 'Riz complet', 0, true, 1, 1, 2),
  ('base', 'Quinoa', 1, true, 1, 1, 3),
  ('base', 'Salade mixte', 0, true, 1, 1, 4),
  ('base', 'Pâtes', 0, true, 1, 1, 5),
  
  -- Protéines (étape 2)
  ('protein', 'Poulet grillé', 0, true, 2, 2, 1),
  ('protein', 'Bœuf mariné', 1, true, 2, 2, 2),
  ('protein', 'Saumon', 2, true, 2, 2, 3),
  ('protein', 'Tofu', 0, true, 2, 2, 4),
  ('protein', 'Crevettes', 2, true, 2, 2, 5),
  
  -- Garnitures (étape 3)
  ('toppings', 'Avocat', 1, false, 4, 3, 1),
  ('toppings', 'Maïs', 0, false, 4, 3, 2),
  ('toppings', 'Tomates cerises', 0, false, 4, 3, 3),
  ('toppings', 'Concombre', 0, false, 4, 3, 4),
  ('toppings', 'Carottes râpées', 0, false, 4, 3, 5),
  ('toppings', 'Edamame', 0.5, false, 4, 3, 6),
  ('toppings', 'Mangue', 0.5, false, 4, 3, 7),
  
  -- Sauces (étape 4)
  ('sauce', 'Vinaigrette maison', 0, true, 1, 4, 1),
  ('sauce', 'Sauce soja-sésame', 0, true, 1, 4, 2),
  ('sauce', 'Tahini', 0, true, 1, 4, 3),
  ('sauce', 'Sauce aigre-douce', 0, true, 1, 4, 4),
  ('sauce', 'Mayo épicée', 0, true, 1, 4, 5)
) AS options(option_group, option_name, price_adjustment, is_required, max_selections, group_order, display_order)
ON CONFLICT (product_id, option_group, option_name) DO UPDATE
SET 
  price_adjustment = EXCLUDED.price_adjustment,
  is_required = EXCLUDED.is_required,
  max_selections = EXCLUDED.max_selections,
  group_order = EXCLUDED.group_order,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 8. VÉRIFICATION FINALE
-- ============================================

SELECT 'PRODUITS COMPOSITES CONFIGURÉS' as verification;
SELECT 
  c.name as categorie,
  COUNT(p.id) as nb_produits,
  COUNT(CASE WHEN p.product_type = 'composite' THEN 1 END) as nb_composites,
  COUNT(DISTINCT p.workflow_type) as nb_workflows
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id
WHERE c.restaurant_id = 1
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

SELECT 'OPTIONS PAR PRODUIT' as verification;
SELECT 
  p.name as produit,
  p.workflow_type,
  COUNT(DISTINCT po.option_group) as nb_groupes,
  COUNT(po.id) as nb_options_total
FROM france_products p
LEFT JOIN france_product_options po ON po.product_id = p.id
WHERE p.product_type = 'composite'
  AND p.restaurant_id = 1
GROUP BY p.id, p.name, p.workflow_type
ORDER BY p.name;

COMMIT;

-- ============================================
-- NOTES D'IMPLÉMENTATION
-- ============================================
-- 
-- Cette configuration permet à chaque restaurant de :
-- 1. Définir ses propres workflows composites
-- 2. Personnaliser les options disponibles
-- 3. Ajuster les prix des suppléments
-- 4. Activer/désactiver des étapes
-- 
-- Le bot universel utilisera cette configuration pour :
-- - Charger dynamiquement les options
-- - Valider les sélections utilisateur
-- - Calculer les prix avec suppléments
-- - Générer les récapitulatifs de commande
--
-- ZÉRO MODIFICATION DE CODE NÉCESSAIRE !