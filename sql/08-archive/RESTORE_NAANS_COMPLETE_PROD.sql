-- ========================================================================
-- SCRIPT: Restauration COMPLÈTE NAANS avec workflow composite
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Produit: NAANS (ID: 662)
-- Date: 2025-10-17
--
-- STRATÉGIE: Copier les groupes Sauces/Boissons/Suppléments depuis SANDWICHS
-- ========================================================================

BEGIN;

-- 1. CONFIGURER LE WORKFLOW COMPOSITE
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez votre naan",
        "option_groups": ["Plats"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "Choisissez votre sauce (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      },
      {
        "step": 3,
        "type": "options_selection",
        "prompt": "Choisissez votre boisson 33CL incluse",
        "option_groups": ["Boisson 33CL incluse"],
        "required": true,
        "max_selections": 1
      },
      {
        "step": 4,
        "type": "options_selection",
        "prompt": "Suppléments (optionnel)",
        "option_groups": ["Suppléments"],
        "required": false,
        "max_selections": 3
      }
    ]
  }'::json,
  price_on_site_base = 0.00,
  price_delivery_base = 0.00
WHERE id = 662
  AND restaurant_id = 1
  AND name = 'NAANS';

-- 2. COPIER LES SAUCES DEPUIS SANDWICHS (663) VERS NAANS (662)
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
  662 as product_id,  -- NAANS
  option_group,
  option_name,
  price_modifier,
  display_order,
  2 as group_order,   -- Step 2 = Sauces
  false as is_required,
  is_active,
  icon,
  composition
FROM france_product_options
WHERE product_id = 663  -- SANDWICHS
  AND option_group = 'Sauces'
ON CONFLICT DO NOTHING;

-- 3. COPIER LES BOISSONS 33CL DEPUIS SANDWICHS (663) VERS NAANS (662)
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
  662 as product_id,  -- NAANS
  option_group,
  option_name,
  0.00 as price_modifier,  -- Boisson INCLUSE = 0€
  display_order,
  3 as group_order,   -- Step 3 = Boisson 33CL incluse
  true as is_required,
  is_active,
  icon,
  composition
FROM france_product_options
WHERE product_id = 663  -- SANDWICHS
  AND option_group = 'Boisson 33CL incluse'
ON CONFLICT DO NOTHING;

-- 4. COPIER LES SUPPLÉMENTS DEPUIS SANDWICHS (663) VERS NAANS (662)
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
  662 as product_id,  -- NAANS
  option_group,
  option_name,
  price_modifier,
  display_order,
  4 as group_order,   -- Step 4 = Suppléments
  false as is_required,
  is_active,
  icon,
  composition
FROM france_product_options
WHERE product_id = 663  -- SANDWICHS
  AND option_group = 'Suppléments'
ON CONFLICT DO NOTHING;

-- 5. METTRE À JOUR group_order POUR LES PLATS
UPDATE france_product_options fpo
SET group_order = 1
FROM france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 662
  AND fp.restaurant_id = 1
  AND fp.name = 'NAANS'
  AND fpo.option_group = 'Plats';

-- Vérification finale
SELECT
  'Produit' as type,
  id,
  name,
  workflow_type,
  price_on_site_base,
  price_delivery_base
FROM france_products
WHERE id = 662;

SELECT
  'Groupes restaurés' as info,
  option_group,
  group_order,
  COUNT(*) as nb_options,
  CASE
    WHEN option_group = 'Plats' THEN 'Step 1 - Choix naan'
    WHEN option_group = 'Sauces' THEN 'Step 2 - Sauces (optionnel, max 2)'
    WHEN option_group = 'Boisson 33CL incluse' THEN 'Step 3 - Boisson incluse (obligatoire)'
    WHEN option_group = 'Suppléments' THEN 'Step 4 - Suppléments (optionnel, max 3)'
  END as description
FROM france_product_options
WHERE product_id = 662
GROUP BY option_group, group_order
ORDER BY group_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- - Produit workflow_type = 'universal_workflow_v2' ✅
-- - 4 groupes restaurés (Plats, Sauces, Boisson 33CL incluse, Suppléments) ✅
-- - group_order correct (1, 2, 3, 4) ✅
-- - Bot affiche : Naans → Sauces → Boisson → Suppléments ✅
-- ========================================================================
