-- =========================================
-- VÉRIFIER LA CONFIGURATION WORKFLOW BOWL (CORRIGÉ)
-- =========================================
-- Comprendre pourquoi step 1 (viande) ne s'affiche pas en premier

BEGIN;

-- =========================================
-- 1. VOIR LA CONFIGURATION COMPLÈTE DU BOWL
-- =========================================

SELECT
  id,
  name,
  product_type,
  workflow_type,
  requires_steps,
  steps_config::text as workflow_json
FROM france_products
WHERE id = 238;

-- =========================================
-- 2. ANALYSER LES STEPS UN PAR UN
-- =========================================

-- Extraire chaque step pour voir l'ordre exact
SELECT
  'Step ' || (ROW_NUMBER() OVER()) as step_info,
  step_data->>'step' as step_number,
  step_data->>'type' as step_type,
  step_data->>'prompt' as prompt,
  step_data->>'option_groups' as option_groups,
  step_data->>'required' as required
FROM (
  SELECT
    json_array_elements(steps_config->'steps') as step_data
  FROM france_products
  WHERE id = 238
) steps;

-- =========================================
-- 3. VÉRIFIER SI LE PRODUIT EST DÉTECTÉ COMME COMPOSITE
-- =========================================

SELECT
  id,
  name,
  CASE
    WHEN requires_steps = true THEN '✅ COMPOSITE (requires_steps = true)'
    WHEN workflow_type IS NOT NULL THEN '✅ COMPOSITE (workflow_type = ' || workflow_type || ')'
    WHEN product_type = 'composite' THEN '✅ COMPOSITE (product_type = composite)'
    WHEN steps_config IS NOT NULL THEN '✅ COMPOSITE (steps_config présent)'
    ELSE '❌ SIMPLE'
  END as type_detection,
  requires_steps,
  workflow_type,
  product_type,
  CASE
    WHEN steps_config IS NOT NULL THEN '✅ Steps configurés'
    ELSE '❌ Pas de steps'
  END as steps_status
FROM france_products
WHERE id = 238;

-- =========================================
-- 4. COMPARER AVEC UN TACOS QUI FONCTIONNE
-- =========================================

-- Voir comment est configuré un tacos qui fonctionne bien
SELECT
  id,
  name,
  product_type,
  workflow_type,
  requires_steps,
  LEFT(steps_config::text, 200) as workflow_debut
FROM france_products
WHERE name LIKE '%TACOS%'
  AND steps_config IS NOT NULL
LIMIT 1;

-- =========================================
-- 5. VÉRIFIER LES GROUPES D'OPTIONS DISPONIBLES
-- =========================================

SELECT
  option_group,
  COUNT(*) as nb_options,
  STRING_AGG(
    display_order || '. ' || LEFT(option_name, 25),
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
-- 6. VÉRIFIER L'ORDRE EXACT DES STEPS
-- =========================================

SELECT
  step_num,
  step_config->>'step' as step_id,
  step_config->>'prompt' as prompt_text,
  step_config->'option_groups'->0 as first_group,
  'ORDRE: ' || step_num || ' → ' || (step_config->'option_groups'->0)::text as ordre_reel
FROM (
  SELECT
    ROW_NUMBER() OVER() as step_num,
    json_array_elements(steps_config->'steps') as step_config
  FROM france_products
  WHERE id = 238
) steps_ordered;

-- =========================================
-- 7. DIAGNOSTIC FINAL
-- =========================================

SELECT
  'DIAGNOSTIC BOWL' as type,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM france_products
      WHERE id = 238
        AND steps_config::text LIKE '%"step": 1%'
        AND steps_config::text LIKE '%Choix viande%'
    ) THEN '✅ Config: Step 1 = Viande'
    ELSE '❌ Config: Step 1 ≠ Viande'
  END as config_step_1,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM france_products
      WHERE id = 238
        AND requires_steps = true
    ) THEN '✅ Détecté composite'
    ELSE '⚠️ Détecté simple'
  END as detection,
  'Si config OK mais affichage KO → Problème dans le code bot' as conclusion;

COMMIT;