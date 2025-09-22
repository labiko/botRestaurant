-- =========================================
-- SUPPRIMER L'OPTION "AJOUTER DES SUPPLÉMENTS"
-- =========================================
-- Garder uniquement l'option 0 = Pas de suppléments
-- Les suppléments seront directement accessibles

BEGIN;

-- =========================================
-- 1. VOIR LES OPTIONS ACTUELLES
-- =========================================

SELECT
  id,
  option_group,
  display_order,
  option_name,
  price_modifier
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Choix suppléments'
ORDER BY display_order;

-- =========================================
-- 2. SUPPRIMER L'OPTION "AJOUTER DES SUPPLÉMENTS"
-- =========================================

DELETE FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Choix suppléments'
  AND option_name LIKE '%Ajouter des suppléments%';

-- =========================================
-- 3. METTRE À JOUR L'OPTION "PAS DE SUPPLÉMENTS"
-- =========================================

UPDATE france_product_options
SET
  option_name = '0️⃣ Pas de suppléments',
  display_order = 0
WHERE product_id = 238
  AND option_group = 'Choix suppléments'
  AND option_name LIKE '%Pas de suppléments%';

-- =========================================
-- 4. SIMPLIFIER LE WORKFLOW
-- =========================================
-- Le workflow affichera directement tous les suppléments
-- avec l'option 0 pour ne pas en prendre

UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "🥩 CHOIX VIANDE :",
      "required": true,
      "option_groups": ["Choix viande"],
      "max_selections": 1
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "🥤 BOISSON 33CL INCLUSE :",
      "required": true,
      "option_groups": ["Boisson 33CL incluse"],
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "combined_display",
      "prompt": "🧀 SUPPLÉMENTS (+3€ chacun) :\n0️⃣ = Pas de suppléments\n━━━━━━━━━━━━━━━━━━",
      "required": false,
      "option_groups": ["Choix suppléments", "Suppléments BOWL"],
      "max_selections": 10,
      "display_mode": "unified",
      "zero_option": "Pas de suppléments"
    }
  ]
}'::json
WHERE id = 238;

-- =========================================
-- 5. VÉRIFICATION FINALE
-- =========================================

-- Vérifier qu'il ne reste qu'une option de navigation
SELECT
  'OPTIONS NAVIGATION' as type,
  option_name,
  display_order
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Choix suppléments'
UNION ALL
-- Vérifier les premiers suppléments
SELECT
  'SUPPLÉMENTS' as type,
  option_name,
  display_order
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
  AND display_order <= 5
ORDER BY type, display_order;

-- =========================================
-- 6. RÉSUMÉ
-- =========================================

SELECT
  '✅ Option "Ajouter des suppléments" supprimée' as action_1,
  '✅ Option 0️⃣ = Pas de suppléments conservée' as action_2,
  '✅ Suppléments directement affichés (1 à 16)' as action_3,
  '✅ Workflow simplifié avec affichage unifié' as resultat;

COMMIT;
-- En cas de problème : ROLLBACK;