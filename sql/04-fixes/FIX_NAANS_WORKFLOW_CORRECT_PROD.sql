-- ========================================================================
-- SCRIPT: Restauration WORKFLOW CORRECT pour NAANS
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Produit: NAANS (ID: 662)
-- Date: 2025-10-17
--
-- OBJECTIF: Restaurer le workflow COMPOSITE comme SANDWICHS
-- Structure: Plats → Sauces → Boisson 33CL incluse → Suppléments
-- ========================================================================

BEGIN;

-- 1. CONFIGURER LE WORKFLOW COMPOSITE (comme SANDWICHS)
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

-- 2. VÉRIFIER SI LES GROUPES SAUCES, BOISSONS, SUPPLÉMENTS EXISTENT DÉJÀ
-- Si le script workflow-edit les a créés, ils devraient être là

-- Vérification des groupes existants
SELECT
  'Groupes existants' as info,
  option_group,
  COUNT(*) as nb_options
FROM france_product_options
WHERE product_id = 662
GROUP BY option_group
ORDER BY
  CASE option_group
    WHEN 'Plats' THEN 1
    WHEN 'Sauces' THEN 2
    WHEN 'Boisson 33CL incluse' THEN 3
    WHEN 'Suppléments' THEN 4
    ELSE 5
  END;

-- 3. METTRE À JOUR LES group_order POUR CORRESPONDRE AUX STEPS
UPDATE france_product_options fpo
SET group_order = 1
FROM france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 662
  AND fp.restaurant_id = 1
  AND fp.name = 'NAANS'
  AND fpo.option_group = 'Plats';

UPDATE france_product_options fpo
SET group_order = 2
FROM france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 662
  AND fp.restaurant_id = 1
  AND fp.name = 'NAANS'
  AND fpo.option_group = 'Sauces';

UPDATE france_product_options fpo
SET group_order = 3
FROM france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 662
  AND fp.restaurant_id = 1
  AND fp.name = 'NAANS'
  AND fpo.option_group = 'Boisson 33CL incluse';

UPDATE france_product_options fpo
SET group_order = 4
FROM france_products fp
WHERE fpo.product_id = fp.id
  AND fp.id = 662
  AND fp.restaurant_id = 1
  AND fp.name = 'NAANS'
  AND fpo.option_group = 'Suppléments';

-- Vérification finale
SELECT
  'Produit' as type,
  name,
  workflow_type,
  price_on_site_base,
  price_delivery_base
FROM france_products
WHERE id = 662;

SELECT
  'Steps config' as info,
  steps_config
FROM france_products
WHERE id = 662;

SELECT
  'Options par groupe' as info,
  option_group,
  group_order,
  COUNT(*) as nb_options,
  STRING_AGG(option_name || ' (' || price_modifier || '€)', ', ' ORDER BY display_order) as options
FROM france_product_options
WHERE product_id = 662
GROUP BY option_group, group_order
ORDER BY group_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- - Produit workflow_type = 'universal_workflow_v2' ✅
-- - 4 steps configurés correctement ✅
-- - Tous les groupes ont le bon group_order (1, 2, 3, 4) ✅
-- - Bot affiche : Naans → Sauces → Boisson → Suppléments ✅
-- ========================================================================
