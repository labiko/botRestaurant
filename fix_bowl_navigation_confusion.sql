-- =========================================
-- FIX BOWL NAVIGATION VS SUPPLÉMENTS CONFUSION
-- =========================================
-- Problème: Les options de navigation (1. Pas de suppléments, 2. Ajouter)
-- sont mélangées avec la liste des suppléments
-- Cela cause une confusion dans la numérotation

BEGIN;

-- =========================================
-- 1. DIAGNOSTIC - VOIR TOUTES LES OPTIONS
-- =========================================

SELECT
  option_group,
  display_order,
  option_name,
  price_modifier,
  CASE
    WHEN option_name LIKE '%Pas de suppléments%' THEN 'NAVIGATION'
    WHEN option_name LIKE '%Ajouter des suppléments%' THEN 'NAVIGATION'
    ELSE 'SUPPLÉMENT'
  END as type_option
FROM france_product_options
WHERE product_id = 238
  AND option_group IN ('Choix suppléments', 'Suppléments BOWL')
ORDER BY option_group, display_order;

-- =========================================
-- 2. CORRIGER LES OPTIONS DE NAVIGATION
-- =========================================
-- Les options de navigation ne doivent PAS avoir de numéro
-- ou utiliser un format différent

UPDATE france_product_options
SET option_name = CASE
  WHEN option_name LIKE '%Pas de suppléments%' THEN '❌ Pas de suppléments'
  WHEN option_name LIKE '%Ajouter des suppléments%' THEN '➕ Ajouter des suppléments'
  ELSE option_name
END
WHERE product_id = 238
  AND option_group = 'Choix suppléments';

-- =========================================
-- 3. S'ASSURER QUE "VIANDE" N'EST PAS UNE OPTION NAVIGATION
-- =========================================

-- Vérifier où est "Viande"
SELECT
  option_group,
  option_name,
  display_order,
  price_modifier
FROM france_product_options
WHERE product_id = 238
  AND option_name LIKE '%Viande%';

-- Si "Viande" est dans "Choix suppléments", le déplacer vers "Suppléments BOWL"
UPDATE france_product_options
SET option_group = 'Suppléments BOWL',
    option_name = '6. Viande (+3€)',
    display_order = 6
WHERE product_id = 238
  AND option_name LIKE '%Viande%'
  AND option_group = 'Choix suppléments';

-- =========================================
-- 4. RÉORGANISER COMPLÈTEMENT LES SUPPLÉMENTS
-- =========================================

-- D'abord, supprimer toute confusion avec les émojis numériques
UPDATE france_product_options
SET option_name = CASE
  WHEN option_name LIKE '%Mozzarella%' THEN '1. Mozzarella (+3€)'
  WHEN option_name LIKE '%Cheddar%' AND option_name NOT LIKE '%gratiné%' THEN '2. Cheddar (+3€)'
  WHEN option_name LIKE '%Chèvre%' THEN '3. Chèvre (+3€)'
  WHEN option_name LIKE '%Vache qui rit%' AND option_name NOT LIKE '%gratiné%' THEN '4. Vache qui rit (+3€)'
  WHEN option_name LIKE '%Boursin%' THEN '5. Boursin (+3€)'
  WHEN option_name LIKE '%Viande%' THEN '6. Viande (+3€)'
  WHEN option_name LIKE '%Vache qui rit gratiné%' THEN '7. Vache qui rit gratiné (+3€)'
  WHEN option_name LIKE '%Poivrons%' THEN '8. Poivrons (+3€)'
  WHEN option_name LIKE '%Cheddar gratiné%' THEN '9. Cheddar gratiné (+3€)'
  WHEN option_name LIKE '%Raclette gratiné%' THEN '10. Raclette gratiné (+3€)'
  WHEN option_name LIKE '%Champignons%' THEN '11. Champignons (+3€)'
  WHEN option_name LIKE '%Raclette%' AND option_name NOT LIKE '%gratiné%' THEN '12. Raclette (+3€)'
  WHEN option_name LIKE '%Emmental gratiné%' THEN '13. Emmental gratiné (+3€)'
  WHEN option_name LIKE '%Bacon de Bœuf%' THEN '14. Bacon de Bœuf (+3€)'
  WHEN option_name LIKE '%Galette%' THEN '15. Galette (+3€)'
  WHEN option_name LIKE '%Poulet%' THEN '16. Poulet (+3€)'
  ELSE option_name
END,
display_order = CASE
  WHEN option_name LIKE '%Mozzarella%' THEN 1
  WHEN option_name LIKE '%Cheddar%' AND option_name NOT LIKE '%gratiné%' THEN 2
  WHEN option_name LIKE '%Chèvre%' THEN 3
  WHEN option_name LIKE '%Vache qui rit%' AND option_name NOT LIKE '%gratiné%' THEN 4
  WHEN option_name LIKE '%Boursin%' THEN 5
  WHEN option_name LIKE '%Viande%' THEN 6
  WHEN option_name LIKE '%Vache qui rit gratiné%' THEN 7
  WHEN option_name LIKE '%Poivrons%' THEN 8
  WHEN option_name LIKE '%Cheddar gratiné%' THEN 9
  WHEN option_name LIKE '%Raclette gratiné%' THEN 10
  WHEN option_name LIKE '%Champignons%' THEN 11
  WHEN option_name LIKE '%Raclette%' AND option_name NOT LIKE '%gratiné%' THEN 12
  WHEN option_name LIKE '%Emmental gratiné%' THEN 13
  WHEN option_name LIKE '%Bacon de Bœuf%' THEN 14
  WHEN option_name LIKE '%Galette%' THEN 15
  WHEN option_name LIKE '%Poulet%' THEN 16
  ELSE display_order
END
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL';

-- =========================================
-- 5. VÉRIFIER LA STRUCTURE FINALE
-- =========================================

-- Options de navigation (sans numéro)
SELECT
  'NAVIGATION' as type,
  display_order,
  option_name
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Choix suppléments'
ORDER BY display_order;

-- Suppléments (avec numéros 1-16)
SELECT
  'SUPPLÉMENT' as type,
  display_order,
  option_name,
  price_modifier
FROM france_product_options
WHERE product_id = 238
  AND option_group = 'Suppléments BOWL'
ORDER BY display_order;

-- =========================================
-- 6. METTRE À JOUR LE WORKFLOW POUR CLARIFIER
-- =========================================

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
      "type": "options_selection",
      "prompt": "🍽️ VOULEZ-VOUS DES SUPPLÉMENTS ?",
      "required": false,
      "option_groups": ["Choix suppléments"],
      "max_selections": 1,
      "conditional_next": {
        "condition": "option_selected",
        "option_name": "➕ Ajouter des suppléments",
        "next_step": 4,
        "else_step": "complete"
      }
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "🧀 CHOISISSEZ VOS SUPPLÉMENTS (tapez les numéros séparés par des virgules, max 10) :",
      "required": false,
      "option_groups": ["Suppléments BOWL"],
      "max_selections": 10,
      "display_format": "numbered_list"
    }
  ]
}'::json
WHERE id = 238;

-- =========================================
-- 7. RÉSUMÉ FINAL
-- =========================================

SELECT
  '✅ Options de navigation sans numéros (❌/➕)' as correction_1,
  '✅ Suppléments numérotés de 1 à 16' as correction_2,
  '✅ Pas de mélange entre navigation et suppléments' as correction_3,
  '✅ Workflow clarifié avec prompts explicites' as correction_4;

COMMIT;
-- En cas de problème : ROLLBACK;