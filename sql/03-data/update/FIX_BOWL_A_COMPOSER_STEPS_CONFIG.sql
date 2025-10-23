-- ========================================================================
-- FIX: BOWL A COMPOSER - Regrouper tous les suppléments en 1 seul groupe
-- DATE: 2025-01-23
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- PROBLÈME: Le bot n'affiche que "Légumes" car il ne gère pas plusieurs
--           option_groups dans un même step
-- SOLUTION: Renommer tous les groupes vers "VOS SUPPLÉMENTS"
-- ========================================================================

BEGIN;

-- 🔍 VÉRIFICATION AVANT
SELECT
  id,
  name,
  steps_config
FROM france_products
WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22;

-- 🔧 ÉTAPE 1 : Renommer tous les option_groups vers "VOS SUPPLÉMENTS"
UPDATE france_product_options
SET option_group = 'VOS SUPPLÉMENTS'
WHERE product_id = (SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22)
  AND option_group IN ('Légumes', 'Viandes/Poissons', 'Fromages');

-- 🔧 ÉTAPE 2 : Mettre à jour le steps_config
UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "votre viande",
      "option_groups": ["Viandes"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre sauce",
      "option_groups": ["Sauces"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "vos suppléments",
      "option_groups": ["VOS SUPPLÉMENTS"],
      "required": false,
      "max_selections": 20
    }
  ]
}'::json
WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22;

-- ✅ VÉRIFICATION APRÈS
SELECT
  id,
  name,
  steps_config
FROM france_products
WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22;

-- Vérifier que toutes les options sont toujours actives
SELECT
  option_group,
  COUNT(*) as nb_options,
  STRING_AGG(option_name, ', ' ORDER BY display_order) as options_list
FROM france_product_options
WHERE product_id = (SELECT id FROM france_products WHERE name = 'BOWL A COMPOSER' AND restaurant_id = 22)
GROUP BY option_group
ORDER BY option_group;

COMMIT;

-- ========================================================================
-- RÉSUMÉ DES CHANGEMENTS :
-- ========================================================================
-- AVANT : 3 option_groups séparés (Légumes, Viandes/Poissons, Fromages)
-- APRÈS : 1 seul option_group "VOS SUPPLÉMENTS" avec toutes les options
--
-- Workflow final :
-- Step 1 : Viande (required, max 1) - 8 options
-- Step 2 : Sauce (required, max 1) - 13 options
-- Step 3 : VOS SUPPLÉMENTS (optionnel, max 20) - 17 options
--   └─ Champignons, Oignons, Oignons Frits, Oignons Rings, Poivrons (1-1.5€)
--   └─ Bacon, Escalope, Falafels, Lardons, Oeuf, Steak, Tenders, Viande Hachée (1.5€)
--   └─ Boursin, Cheddar, Mozzarella, Raclette (1€)
-- ========================================================================
