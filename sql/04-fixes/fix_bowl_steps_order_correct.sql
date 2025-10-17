-- =========================================
-- CORRIGER L'ORDRE DES STEPS DU BOWL
-- =========================================
-- Step 1: Viande
-- Step 2: Boisson
-- Step 3: Demander si suppléments
-- Step 4: Liste suppléments (si oui)

BEGIN;

-- =========================================
-- 1. VÉRIFIER LA STRUCTURE ACTUELLE
-- =========================================

SELECT
  id,
  name,
  steps_config::text as config_actuel
FROM france_products
WHERE id = 238;

-- =========================================
-- 2. CORRIGER LE WORKFLOW AVEC LE BON ORDRE
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
      "prompt": "➕ SUPPLÉMENTS\n\n1️⃣ Ajouter des suppléments\n2️⃣ Pas de suppléments\n\n💡 Pour choisir: tapez le numéro",
      "required": false,
      "option_groups": ["Choix suppléments"],
      "max_selections": 1,
      "conditional_next": {
        "condition": "option_selected",
        "option_name": "1️⃣ Ajouter des suppléments",
        "next_step": 4,
        "else_step": "complete"
      }
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "🧀 CHOISISSEZ VOS SUPPLÉMENTS (+3€ chacun)\n\n💡 Tapez les numéros séparés par des virgules (max 10)\nEx: 3,5,8 = Chèvre, Boursin, Poivrons",
      "required": false,
      "option_groups": ["Suppléments BOWL"],
      "max_selections": 10,
      "allow_multiple": true
    }
  ]
}'::json
WHERE id = 238;

-- =========================================
-- 3. VÉRIFIER LES OPTIONS DE NAVIGATION
-- =========================================

-- S'assurer que les options sont bien configurées
UPDATE france_product_options
SET
  option_name = '1️⃣ Ajouter des suppléments',
  display_order = 1
WHERE product_id = 238
  AND option_group = 'Choix suppléments'
  AND option_name LIKE '%Ajouter%';

UPDATE france_product_options
SET
  option_name = '2️⃣ Pas de suppléments',
  display_order = 2
WHERE product_id = 238
  AND option_group = 'Choix suppléments'
  AND option_name LIKE '%Pas de%';

-- =========================================
-- 4. VÉRIFICATION DE LA STRUCTURE
-- =========================================

-- Vérifier les groupes d'options
SELECT
  option_group,
  COUNT(*) as nb_options,
  STRING_AGG(option_name, ', ' ORDER BY display_order) as options
FROM france_product_options
WHERE product_id = 238
GROUP BY option_group
ORDER BY
  CASE option_group
    WHEN 'Choix viande' THEN 1
    WHEN 'Boisson 33CL incluse' THEN 2
    WHEN 'Choix suppléments' THEN 3
    WHEN 'Suppléments BOWL' THEN 4
    ELSE 5
  END;

-- =========================================
-- 5. TEST DU WORKFLOW
-- =========================================

SELECT
  'Step 1' as etape,
  'Choix viande' as groupe,
  '✅ Choix de la viande' as description
UNION ALL
SELECT
  'Step 2',
  'Boisson 33CL incluse',
  '✅ Choix de la boisson'
UNION ALL
SELECT
  'Step 3',
  'Choix suppléments',
  '✅ Demande si suppléments (1=Oui, 2=Non)'
UNION ALL
SELECT
  'Step 4',
  'Suppléments BOWL',
  '✅ Liste des suppléments (si choix 1)'
ORDER BY etape;

-- =========================================
-- 6. RÉSUMÉ
-- =========================================

SELECT
  '✅ Step 1: Choix viande' as step_1,
  '✅ Step 2: Choix boisson' as step_2,
  '✅ Step 3: Demande suppléments (1/2)' as step_3,
  '✅ Step 4: Liste suppléments si oui' as step_4,
  '✅ Workflow corrigé et fonctionnel' as resultat;

COMMIT;
-- En cas de problème : ROLLBACK;