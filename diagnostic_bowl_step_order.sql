-- =========================================
-- DIAGNOSTIC: POURQUOI SUPPLÉMENTS AVANT VIANDE ?
-- =========================================

BEGIN;

-- =========================================
-- 1. VÉRIFIER LE WORKFLOW ACTUEL
-- =========================================

SELECT
  id,
  name,
  jsonb_pretty(steps_config::jsonb) as workflow_complet
FROM france_products
WHERE id = 238;

-- =========================================
-- 2. ANALYSER CHAQUE STEP
-- =========================================

SELECT
  step_number,
  step_config->>'type' as type,
  step_config->>'prompt' as prompt,
  step_config->>'option_groups' as option_groups,
  step_config->>'required' as required
FROM (
  SELECT
    ordinality as step_number,
    value as step_config
  FROM france_products,
    jsonb_array_elements(steps_config->'steps') WITH ORDINALITY
  WHERE id = 238
) steps
ORDER BY step_number;

-- =========================================
-- 3. VÉRIFIER LES GROUPES D'OPTIONS
-- =========================================

SELECT
  option_group,
  COUNT(*) as nb_options,
  MIN(display_order) as min_order,
  MAX(display_order) as max_order,
  STRING_AGG(
    display_order || '. ' || LEFT(option_name, 30),
    ' | '
    ORDER BY display_order
  ) as apercu_options
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
-- 4. IDENTIFIER LE PROBLÈME
-- =========================================

SELECT
  'DIAGNOSTIC' as type,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM france_products,
        jsonb_array_elements(steps_config->'steps') WITH ORDINALITY
      WHERE id = 238
        AND ordinality = 1
        AND value->>'option_groups' LIKE '%Suppléments%'
    ) THEN '❌ ERREUR: Suppléments en step 1 !'
    WHEN EXISTS (
      SELECT 1
      FROM france_products,
        jsonb_array_elements(steps_config->'steps') WITH ORDINALITY
      WHERE id = 238
        AND ordinality = 1
        AND value->>'option_groups' LIKE '%viande%'
    ) THEN '✅ OK: Viande en step 1'
    ELSE '⚠️ Structure inconnue'
  END as resultat;

-- =========================================
-- 5. CORRIGER L'ORDRE SI NÉCESSAIRE
-- =========================================

-- Le workflow DOIT être dans cet ordre:
-- Step 1: Choix viande
-- Step 2: Boisson 33CL incluse
-- Step 3: Choix suppléments (Ajouter/Pas de)
-- Step 4: Suppléments BOWL (si Ajouter choisi)

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
      "prompt": "➕ SUPPLÉMENTS",
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
      "max_selections": 10,
      "allow_multiple": true
    }
  ]
}'::json
WHERE id = 238;

-- =========================================
-- 6. VÉRIFICATION APRÈS CORRECTION
-- =========================================

SELECT
  'Step ' || ordinality as etape,
  value->>'prompt' as prompt,
  value->>'option_groups' as groupe
FROM france_products,
  jsonb_array_elements(steps_config->'steps') WITH ORDINALITY
WHERE id = 238
ORDER BY ordinality;

-- =========================================
-- 7. RÉSULTAT ATTENDU
-- =========================================

SELECT
  '✅ Step 1: CHOIX VIANDE en premier' as correction_1,
  '✅ Step 2: BOISSON ensuite' as correction_2,
  '✅ Step 3: Demande de suppléments' as correction_3,
  '✅ Step 4: Liste suppléments si oui' as correction_4,
  '✅ Ordre correct: Viande → Boisson → Suppléments' as resultat_final;

COMMIT;
-- En cas de problème : ROLLBACK;