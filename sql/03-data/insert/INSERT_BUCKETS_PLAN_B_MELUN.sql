-- ========================================================================
-- INSERTION BUCKETS - PLAN B MELUN
-- DATE: 2025-10-22
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Catégorie: BUCKETS
-- Objectif : Créer la catégorie et 5 buckets family
-- Total: 1 catégorie + 5 produits + 20 options (10 accompagnements + 10 boissons)
-- ========================================================================
-- Structure :
--   - FAMILY 1 WINGS (17.00€) - 14 wings + 2 frites + 1 boisson 1.5L
--   - FAMILY 1 TENDERS (20.00€) - 14 tenders + 2 frites + 1 boisson 1.5L
--   - FAMILY 2 WINGS (27.00€) - 24 wings + 4 frites + 1 boisson 1.5L
--   - FAMILY 2 TENDERS (30.00€) - 24 tenders + 4 frites + 1 boisson 1.5L
--   - FAMILY 3 (32.00€) - 14 wings + 12 tenders + 4 frites + 1 boisson 1.5L
-- ========================================================================
-- Workflow (identique pour tous) :
--   Step 1: Choix accompagnement (obligatoire, max 2 sélections)
--   Step 2: Choix boisson 1.5L (obligatoire, max 1 sélection)
-- ========================================================================
-- ⚠️ IMPORTANT : Prix identiques sur place ET livraison (pas de +1€)
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. CRÉATION DE LA CATÉGORIE
-- ========================================================================

INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order, is_active) VALUES
(22, 'BUCKETS', 'buckets', '🪣', 11, true);

-- ========================================================================
-- 2. INSERTION DES 5 PRODUITS (COMPOSITE)
-- ========================================================================

-- ========================================================================
-- 2.1. FAMILY 1 WINGS - 17.00€
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'buckets' AND restaurant_id = 22),
  'FAMILY 1 WINGS',
  '14 Chicken wings + 2 Frites + 1 Boisson 1.5l au choix',
  'composite',
  17.00,
  17.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "vos accompagnements (max 2)",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre boisson 1.5L",
        "option_groups": ["Boisson 1.5L"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  1
);

-- ========================================================================
-- 2.2. FAMILY 1 TENDERS - 20.00€
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'buckets' AND restaurant_id = 22),
  'FAMILY 1 TENDERS',
  '14 Tenders + 2 Frites + 1 Boisson 1.5l au choix',
  'composite',
  20.00,
  20.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "vos accompagnements (max 2)",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre boisson 1.5L",
        "option_groups": ["Boisson 1.5L"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  2
);

-- ========================================================================
-- 2.3. FAMILY 2 WINGS - 27.00€
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'buckets' AND restaurant_id = 22),
  'FAMILY 2 WINGS',
  '24 Chicken wings + 4 Frites + 1 Boisson 1.5l au choix',
  'composite',
  27.00,
  27.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "vos accompagnements (max 2)",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre boisson 1.5L",
        "option_groups": ["Boisson 1.5L"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  3
);

-- ========================================================================
-- 2.4. FAMILY 2 TENDERS - 30.00€
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'buckets' AND restaurant_id = 22),
  'FAMILY 2 TENDERS',
  '24 Tenders + 4 Frites + 1 Boisson 1.5l au choix',
  'composite',
  30.00,
  30.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "vos accompagnements (max 2)",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre boisson 1.5L",
        "option_groups": ["Boisson 1.5L"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  4
);

-- ========================================================================
-- 2.5. FAMILY 3 - 32.00€
-- ========================================================================

INSERT INTO france_products (
  restaurant_id, category_id, name, composition,
  product_type, price_on_site_base, price_delivery_base,
  workflow_type, requires_steps, steps_config, icon, is_active, display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'buckets' AND restaurant_id = 22),
  'FAMILY 3',
  '14 Chicken wings + 12 Tenders + 4 Frites + 1 Boisson 1.5l au choix',
  'composite',
  32.00,
  32.00,
  'universal_workflow_v2',
  true,
  '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "vos accompagnements (max 2)",
        "option_groups": ["Accompagnement"],
        "required": true,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "votre boisson 1.5L",
        "option_groups": ["Boisson 1.5L"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json,
  '🍗',
  true,
  5
);

-- ========================================================================
-- 3. OPTIONS - ACCOMPAGNEMENT (2 options pour TOUS les produits)
-- ========================================================================

-- Accompagnements pour FAMILY 1 WINGS
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'FRITES', NULL, 0.00, '🍟', 1, true
FROM france_products p WHERE p.name = 'FAMILY 1 WINGS' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'FRITES CHEDDAR BACON', NULL, 2.50, '🧀', 2, true
FROM france_products p WHERE p.name = 'FAMILY 1 WINGS' AND p.restaurant_id = 22;

-- Accompagnements pour FAMILY 1 TENDERS
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'FRITES', NULL, 0.00, '🍟', 1, true
FROM france_products p WHERE p.name = 'FAMILY 1 TENDERS' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'FRITES CHEDDAR BACON', NULL, 2.50, '🧀', 2, true
FROM france_products p WHERE p.name = 'FAMILY 1 TENDERS' AND p.restaurant_id = 22;

-- Accompagnements pour FAMILY 2 WINGS
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'FRITES', NULL, 0.00, '🍟', 1, true
FROM france_products p WHERE p.name = 'FAMILY 2 WINGS' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'FRITES CHEDDAR BACON', NULL, 2.50, '🧀', 2, true
FROM france_products p WHERE p.name = 'FAMILY 2 WINGS' AND p.restaurant_id = 22;

-- Accompagnements pour FAMILY 2 TENDERS
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'FRITES', NULL, 0.00, '🍟', 1, true
FROM france_products p WHERE p.name = 'FAMILY 2 TENDERS' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'FRITES CHEDDAR BACON', NULL, 2.50, '🧀', 2, true
FROM france_products p WHERE p.name = 'FAMILY 2 TENDERS' AND p.restaurant_id = 22;

-- Accompagnements pour FAMILY 3
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'FRITES', NULL, 0.00, '🍟', 1, true
FROM france_products p WHERE p.name = 'FAMILY 3' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Accompagnement', 'FRITES CHEDDAR BACON', NULL, 2.50, '🧀', 2, true
FROM france_products p WHERE p.name = 'FAMILY 3' AND p.restaurant_id = 22;

-- ========================================================================
-- 4. OPTIONS - BOISSON 1.5L (2 options pour TOUS les produits)
-- ========================================================================

-- Boissons pour FAMILY 1 WINGS
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 1.5L', 'COCA COLA 1.5L', NULL, 0.00, '🥤', 1, true
FROM france_products p WHERE p.name = 'FAMILY 1 WINGS' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 1.5L', 'MAXI FANTA 1.5L', NULL, 0.00, '🟠', 2, true
FROM france_products p WHERE p.name = 'FAMILY 1 WINGS' AND p.restaurant_id = 22;

-- Boissons pour FAMILY 1 TENDERS
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 1.5L', 'COCA COLA 1.5L', NULL, 0.00, '🥤', 1, true
FROM france_products p WHERE p.name = 'FAMILY 1 TENDERS' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 1.5L', 'MAXI FANTA 1.5L', NULL, 0.00, '🟠', 2, true
FROM france_products p WHERE p.name = 'FAMILY 1 TENDERS' AND p.restaurant_id = 22;

-- Boissons pour FAMILY 2 WINGS
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 1.5L', 'COCA COLA 1.5L', NULL, 0.00, '🥤', 1, true
FROM france_products p WHERE p.name = 'FAMILY 2 WINGS' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 1.5L', 'MAXI FANTA 1.5L', NULL, 0.00, '🟠', 2, true
FROM france_products p WHERE p.name = 'FAMILY 2 WINGS' AND p.restaurant_id = 22;

-- Boissons pour FAMILY 2 TENDERS
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 1.5L', 'COCA COLA 1.5L', NULL, 0.00, '🥤', 1, true
FROM france_products p WHERE p.name = 'FAMILY 2 TENDERS' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 1.5L', 'MAXI FANTA 1.5L', NULL, 0.00, '🟠', 2, true
FROM france_products p WHERE p.name = 'FAMILY 2 TENDERS' AND p.restaurant_id = 22;

-- Boissons pour FAMILY 3
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 1.5L', 'COCA COLA 1.5L', NULL, 0.00, '🥤', 1, true
FROM france_products p WHERE p.name = 'FAMILY 3' AND p.restaurant_id = 22;

INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active)
SELECT p.id, 'Boisson 1.5L', 'MAXI FANTA 1.5L', NULL, 0.00, '🟠', 2, true
FROM france_products p WHERE p.name = 'FAMILY 3' AND p.restaurant_id = 22;

-- ========================================================================
-- 5. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie
SELECT id, name, slug FROM france_menu_categories WHERE slug = 'buckets' AND restaurant_id = 22;

-- Vérifier les 5 produits
SELECT name, price_on_site_base, price_delivery_base, product_type FROM france_products
WHERE restaurant_id = 22 AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'buckets' AND restaurant_id = 22)
ORDER BY display_order;

-- Vérifier le total d'options (doit être 20)
SELECT COUNT(*) as total_options, '20 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'buckets' AND restaurant_id = 22);

-- Vérifier la répartition par produit
SELECT p.name, COUNT(po.id) as nb_options
FROM france_products p
LEFT JOIN france_product_options po ON po.product_id = p.id
WHERE p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'buckets' AND restaurant_id = 22)
GROUP BY p.name, p.display_order
ORDER BY p.display_order;

-- Vérifier la répartition par groupe
SELECT po.option_group, COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE p.restaurant_id = 22 AND p.category_id = (SELECT id FROM france_menu_categories WHERE slug = 'buckets' AND restaurant_id = 22)
GROUP BY po.option_group
ORDER BY po.option_group;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 1 catégorie "BUCKETS" créée
-- 5 produits créés :
--   1. FAMILY 1 WINGS (17.00€) - 4 options (2 accompagnements + 2 boissons)
--   2. FAMILY 1 TENDERS (20.00€) - 4 options (2 accompagnements + 2 boissons)
--   3. FAMILY 2 WINGS (27.00€) - 4 options (2 accompagnements + 2 boissons)
--   4. FAMILY 2 TENDERS (30.00€) - 4 options (2 accompagnements + 2 boissons)
--   5. FAMILY 3 (32.00€) - 4 options (2 accompagnements + 2 boissons)
-- Total : 20 options
--
-- Workflows (tous identiques) :
--   Step 1: Accompagnement (max 2 sélections)
--   Step 2: Boisson 1.5L (max 1 sélection)
-- ========================================================================
