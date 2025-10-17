-- ========================================================================
-- SCRIPT: Ajout sauces aux 3 menus POULET & SNACKS
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Produits: TENDERS 5 PIECES (380), NUGGETS 10 PIECES (381), WINGS 8 PIECES (382)
-- Date: 2025-10-17
--
-- OBJECTIF:
-- 1. Migrer vers universal_workflow_v2
-- 2. Ajouter step Sauces (optionnel, max 2)
-- 3. Garder step Boisson 33CL incluse (obligatoire)
-- ========================================================================

BEGIN;

-- 1. MIGRER TENDERS 5 PIECES (380) VERS universal_workflow_v2 + AJOUTER SAUCES
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "Choisissez votre boisson 33CL incluse",
        "option_groups": ["Boisson 33CL incluse"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json
WHERE id = 380
  AND restaurant_id = 1
  AND name = 'TENDERS 5 PIECES';

-- 2. MIGRER NUGGETS 10 PIECES (381) VERS universal_workflow_v2 + AJOUTER SAUCES
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "Choisissez votre boisson 33CL incluse",
        "option_groups": ["Boisson 33CL incluse"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json
WHERE id = 381
  AND restaurant_id = 1
  AND name = 'NUGGETS 10 PIECES';

-- 3. MIGRER WINGS 8 PIECES (382) VERS universal_workflow_v2 + AJOUTER SAUCES
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "Choisissez votre boisson 33CL incluse",
        "option_groups": ["Boisson 33CL incluse"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json
WHERE id = 382
  AND restaurant_id = 1
  AND name = 'WINGS 8 PIECES';

-- 4. COPIER LES SAUCES DEPUIS SANDWICHS (663) VERS TENDERS 5 PIECES (380)
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  group_order,
  is_required,
  is_active,
  icon,
  composition
)
SELECT
  380 as product_id,
  'Sauces' as option_group,
  option_name,
  0.00 as price_modifier,
  display_order,
  1 as group_order,  -- Step 1
  false as is_required,
  is_active,
  icon,
  composition
FROM france_product_options
WHERE product_id = 663  -- SANDWICHS
  AND option_group = 'Sauces'
ON CONFLICT DO NOTHING;

-- 5. COPIER LES SAUCES DEPUIS SANDWICHS (663) VERS NUGGETS 10 PIECES (381)
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  group_order,
  is_required,
  is_active,
  icon,
  composition
)
SELECT
  381 as product_id,
  'Sauces' as option_group,
  option_name,
  0.00 as price_modifier,
  display_order,
  1 as group_order,  -- Step 1
  false as is_required,
  is_active,
  icon,
  composition
FROM france_product_options
WHERE product_id = 663  -- SANDWICHS
  AND option_group = 'Sauces'
ON CONFLICT DO NOTHING;

-- 6. COPIER LES SAUCES DEPUIS SANDWICHS (663) VERS WINGS 8 PIECES (382)
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  group_order,
  is_required,
  is_active,
  icon,
  composition
)
SELECT
  382 as product_id,
  'Sauces' as option_group,
  option_name,
  0.00 as price_modifier,
  display_order,
  1 as group_order,  -- Step 1
  false as is_required,
  is_active,
  icon,
  composition
FROM france_product_options
WHERE product_id = 663  -- SANDWICHS
  AND option_group = 'Sauces'
ON CONFLICT DO NOTHING;

-- 7. METTRE À JOUR group_order DES BOISSONS (Step 2)
UPDATE france_product_options
SET group_order = 2
WHERE product_id IN (380, 381, 382)
  AND option_group = 'Boisson 33CL incluse';

-- Vérification finale
SELECT
  p.id,
  p.name AS produit,
  p.workflow_type,
  COUNT(DISTINCT po.option_group) as nb_groupes,
  STRING_AGG(DISTINCT po.option_group, ', ' ORDER BY po.option_group) as groupes
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id
WHERE p.id IN (380, 381, 382)
  AND p.restaurant_id = 1
GROUP BY p.id, p.name, p.workflow_type
ORDER BY p.id;

SELECT
  p.name AS produit,
  po.option_group,
  po.group_order,
  COUNT(*) as nb_options
FROM france_products p
JOIN france_product_options po ON p.id = po.product_id
WHERE p.id IN (380, 381, 382)
  AND p.restaurant_id = 1
GROUP BY p.name, po.option_group, po.group_order
ORDER BY p.id, po.group_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ 3 menus migrés vers universal_workflow_v2
-- ✅ Chaque menu a 2 groupes : Sauces (16 options) + Boisson 33CL (12 options)
-- ✅ Step 1 = Sauces (optionnel, max 2) → Step 2 = Boisson 33CL (obligatoire)
-- ========================================================================
