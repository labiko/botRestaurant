-- ========================================================================
-- SCRIPT: Correction ordre des steps BOWL + Ajout suppléments TACOS
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Produit: BOWL (ID: 238)
-- Date: 2025-10-17
--
-- OBJECTIF:
-- 1. Corriger l'ordre des steps (Viandes en premier)
-- 2. Remplacer les 2 suppléments actuels par les 12 suppléments de TACOS
-- 3. Mettre à jour les group_order pour correspondre aux steps
--
-- ORDRE FINAL:
-- Step 1: Plats/Viandes (obligatoire, 1 choix)
-- Step 2: Sauces (optionnel, max 2)
-- Step 3: Boisson 33CL incluse (obligatoire, 1 choix)
-- Step 4: Suppléments (optionnel, max 3)
-- ========================================================================

BEGIN;

-- 1. METTRE À JOUR LE WORKFLOW AVEC LE BON ORDRE
UPDATE france_products
SET
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez votre viande",
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
  }'::json
WHERE id = 238
  AND restaurant_id = 1
  AND name = 'BOWL';

-- 2. METTRE À JOUR LES group_order POUR CORRESPONDRE AUX NOUVEAUX STEPS
UPDATE france_product_options
SET group_order = 1
WHERE product_id = 238
  AND option_group = 'Plats';

UPDATE france_product_options
SET group_order = 2
WHERE product_id = 238
  AND option_group = 'Sauces';

UPDATE france_product_options
SET group_order = 3
WHERE product_id = 238
  AND option_group = 'Boisson 33CL incluse';

-- 3. SUPPRIMER LES ANCIENS SUPPLÉMENTS (Potatoes, Frites maison)
DELETE FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments';

-- 4. COPIER LES 12 SUPPLÉMENTS DEPUIS TACOS (201)
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
  238 as product_id,  -- BOWL
  'Suppléments' as option_group,
  option_name,
  price_modifier,
  display_order,
  4 as group_order,  -- Step 4
  false as is_required,
  is_active,
  icon,
  composition
FROM france_product_options
WHERE product_id = 201  -- TACOS
  AND option_group = 'Suppléments'
ON CONFLICT DO NOTHING;

-- Vérification finale
SELECT
  'PRODUIT' as section,
  id,
  name,
  workflow_type,
  price_on_site_base,
  price_delivery_base
FROM france_products
WHERE id = 238;

SELECT
  'STEPS CONFIG' as section,
  steps_config::text
FROM france_products
WHERE id = 238;

SELECT
  'GROUPES OPTIONS' as section,
  option_group,
  group_order,
  COUNT(*) as nb_options
FROM france_product_options
WHERE product_id = 238
GROUP BY option_group, group_order
ORDER BY group_order;

SELECT
  'DÉTAIL SUPPLÉMENTS' as section,
  option_name,
  price_modifier,
  display_order
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments'
ORDER BY display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ Step 1: Plats (6 viandes)
-- ✅ Step 2: Sauces (16 sauces)
-- ✅ Step 3: Boisson 33CL incluse (12 boissons)
-- ✅ Step 4: Suppléments (12 suppléments copiés depuis TACOS)
-- ✅ Ordre logique : Viande → Sauces → Boisson → Suppléments
-- ========================================================================
