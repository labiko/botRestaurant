-- ========================================================================
-- SCRIPT: Ajout step 6 supplément viandes pour TACOS OCV
-- Restaurant: Le Nouveau OCV Moissy (ID: 16)
-- Produit: TACOS (ID: 554)
-- Date: 2025-10-17
--
-- OBJECTIF:
-- Ajouter un step 6 après les sauces pour permettre l'ajout de suppléments de viande
-- Prix: +1.50€ par viande supplémentaire
-- ========================================================================

BEGIN;

-- =====================================================================
-- PARTIE 1 : CRÉATION OPTIONS "Supplément viandes" avec +1.50€
-- =====================================================================

-- Copier toutes les viandes existantes dans un nouveau groupe "Supplément viandes"
-- avec price_modifier = 1.50

INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  is_active,
  icon,
  composition
)
SELECT
  product_id,
  'Supplément viandes' as option_group,
  option_name,
  1.50 as price_modifier,
  display_order,
  is_active,
  icon,
  composition
FROM france_product_options
WHERE product_id = 554
  AND option_group = 'Viandes'
ORDER BY display_order;

-- =====================================================================
-- PARTIE 2 : MODIFICATION STEPS_CONFIG - Ajout step 6
-- =====================================================================

UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "votre plat",
      "option_groups": ["Plats"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre viande",
      "option_groups": ["Viandes"],
      "required": true,
      "max_selections": 3,
      "conditional_max": {
        "based_on_step": 1,
        "extract_number_from_name": true
      }
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "EXTRAS",
      "option_groups": ["Extras"],
      "required": false,
      "max_selections": 3
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "votre condiments",
      "option_groups": ["Condiments"],
      "required": false,
      "max_selections": 3
    },
    {
      "step": 5,
      "type": "options_selection",
      "prompt": "votre sauces",
      "option_groups": ["Sauces"],
      "required": false,
      "max_selections": 2
    },
    {
      "step": 6,
      "type": "options_selection",
      "prompt": "Supplément viandes : +1,50€",
      "option_groups": ["Supplément viandes"],
      "required": false,
      "max_selections": 5
    }
  ]
}'::jsonb
WHERE id = 554
  AND restaurant_id = 16;

-- =====================================================================
-- VÉRIFICATIONS
-- =====================================================================

-- 1. Vérifier les options créées
SELECT
  'OPTIONS SUPPLÉMENT VIANDES' as section,
  id,
  option_name,
  option_group,
  price_modifier,
  display_order
FROM france_product_options
WHERE product_id = 554
  AND option_group = 'Supplément viandes'
ORDER BY display_order;

-- 2. Vérifier la nouvelle configuration
SELECT
  'NOUVELLE CONFIGURATION TACOS' as section,
  id,
  name,
  workflow_type,
  jsonb_array_length((steps_config::jsonb)->'steps') as nb_steps
FROM france_products
WHERE id = 554
  AND restaurant_id = 16;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ 8 nouvelles options "Supplément viandes" créées avec +1.50€
-- ✅ Step 6 ajouté après sauces
-- ✅ 6 steps au total dans la config
--
-- WORKFLOW FINAL:
-- Step 1: Choix plat (obligatoire)
-- Step 2: Choix viandes (obligatoire, max selon plat)
-- Step 3: Extras (optionnel, max 3)
-- Step 4: Condiments (optionnel, max 3)
-- Step 5: Sauces (optionnel, max 2)
-- Step 6: Supplément viandes +1.50€ (optionnel, max 5)
-- ========================================================================
