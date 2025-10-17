-- =========================================
-- CORRIGER L'ORDRE DES STEPS DU BOWL
-- =========================================
-- Problème: Les suppléments s'affichent AVANT la viande

BEGIN;

-- =========================================
-- 1. VOIR LE WORKFLOW ACTUEL
-- =========================================

SELECT
  id,
  name,
  steps_config::text as workflow_actuel
FROM france_products
WHERE id = 238;

-- =========================================
-- 2. VOIR LES GROUPES D'OPTIONS DISPONIBLES
-- =========================================

SELECT
  option_group,
  COUNT(*) as nb_options,
  STRING_AGG(
    display_order || '. ' || LEFT(option_name, 25),
    ' | '
    ORDER BY display_order
  ) as apercu
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
-- 3. CORRIGER LE WORKFLOW - VIANDE EN PREMIER !
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
      "prompt": "➕ SUPPLÉMENTS\n\n1️⃣ Ajouter des suppléments\n2️⃣ Pas de suppléments",
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
      "prompt": "🧀 CHOISISSEZ VOS SUPPLÉMENTS (+3€ chacun)",
      "required": false,
      "option_groups": ["Suppléments BOWL"],
      "max_selections": 10
    }
  ]
}'::json
WHERE id = 238;

-- =========================================
-- 4. VÉRIFIER LA CORRECTION
-- =========================================

SELECT
  id,
  name,
  CASE
    WHEN steps_config::text LIKE '%"step": 1%"Choix viande"%' THEN '✅ Step 1: Viande'
    ELSE '❌ Step 1: PAS la viande !'
  END as step_1_check,
  CASE
    WHEN steps_config::text LIKE '%"step": 2%"Boisson%' THEN '✅ Step 2: Boisson'
    ELSE '❌ Step 2: PAS la boisson !'
  END as step_2_check,
  CASE
    WHEN steps_config::text LIKE '%"step": 3%"Choix suppléments"%' THEN '✅ Step 3: Demande suppléments'
    ELSE '❌ Step 3: Problème !'
  END as step_3_check,
  CASE
    WHEN steps_config::text LIKE '%"step": 4%"Suppléments BOWL"%' THEN '✅ Step 4: Liste suppléments'
    ELSE '❌ Step 4: Problème !'
  END as step_4_check
FROM france_products
WHERE id = 238;

-- =========================================
-- 5. RÉSULTAT FINAL
-- =========================================

SELECT
  '✅ ORDRE CORRECT DES STEPS' as titre,
  '1️⃣ VIANDE en premier' as step_1,
  '2️⃣ BOISSON ensuite' as step_2,
  '3️⃣ DEMANDE suppléments' as step_3,
  '4️⃣ LISTE suppléments si oui' as step_4,
  '✅ Plus de suppléments avant la viande !' as resultat;

COMMIT;
-- En cas de problème : ROLLBACK;