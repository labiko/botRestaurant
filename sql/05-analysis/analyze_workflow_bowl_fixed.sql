-- =========================================
-- ANALYSE WORKFLOW BOWL ACTUEL - VERSION CORRIGÉE
-- =========================================

-- 1. Trouver le produit BOWL
SELECT
  p.id,
  p.name,
  p.restaurant_id,
  p.workflow_type,
  p.requires_steps,
  p.base_price,
  p.price_delivery_base,
  p.is_active
FROM france_products p
WHERE p.name ILIKE '%bowl%'
ORDER BY p.restaurant_id, p.name;

-- 2. Voir la configuration steps_config détaillée du BOWL (sans jsonb_pretty)
SELECT
  p.name,
  p.steps_config::text as steps_config_raw
FROM france_products p
WHERE p.name ILIKE '%bowl%'
  AND p.steps_config IS NOT NULL;

-- 3. Vérifier les options associées au BOWL
SELECT
  po.product_id,
  p.name as product_name,
  po.option_group,
  po.option_name,
  po.price_modifier,
  po.display_order
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%bowl%'
ORDER BY po.product_id, po.option_group, po.display_order;

-- 4. Compter les groupes d'options par produit BOWL
SELECT
  p.name as product_name,
  po.option_group,
  COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%bowl%'
GROUP BY p.name, po.option_group
ORDER BY p.name, po.option_group;

-- 5. Analyser chaque step du workflow BOWL
SELECT
  p.name as product_name,
  (step_data->>'step')::int as step_number,
  step_data->>'type' as step_type,
  step_data->>'prompt' as prompt,
  step_data->'option_groups' as option_groups_referenced,
  step_data->>'required' as required,
  step_data->>'max_selections' as max_selections
FROM france_products p,
LATERAL jsonb_array_elements(p.steps_config->'steps') AS step_data
WHERE p.name ILIKE '%bowl%'
  AND p.steps_config IS NOT NULL
ORDER BY p.name, (step_data->>'step')::int;

-- 6. Vérifier la cohérence entre steps et options disponibles
-- Lister tous les groupes d'options référencés dans les steps
SELECT DISTINCT
  'STEP REFERENCE' as type,
  p.name as product_name,
  option_group_name.value as option_group_name
FROM france_products p,
LATERAL jsonb_array_elements(p.steps_config->'steps') AS step_data,
LATERAL jsonb_array_elements_text(step_data->'option_groups') AS option_group_name
WHERE p.name ILIKE '%bowl%'
  AND p.steps_config IS NOT NULL

UNION ALL

-- Lister tous les groupes d'options disponibles
SELECT DISTINCT
  'OPTIONS AVAILABLE' as type,
  p.name as product_name,
  po.option_group as option_group_name
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%bowl%'

ORDER BY product_name, option_group_name, type;

-- 7. Diagnostic de problèmes spécifiques pour le BOWL
SELECT
  p.name as product_name,
  'CONFIGURATION' as aspect,
  CASE
    WHEN p.workflow_type != 'composite_workflow' THEN 'ERREUR: workflow_type incorrect'
    WHEN p.requires_steps != true THEN 'ERREUR: requires_steps doit être true'
    WHEN p.steps_config IS NULL THEN 'ERREUR: steps_config manquant'
    WHEN NOT jsonb_path_exists(p.steps_config, '$.steps') THEN 'ERREUR: steps_config.steps manquant'
    WHEN jsonb_array_length(p.steps_config->'steps') = 0 THEN 'ERREUR: Aucun step défini'
    ELSE 'OK: Configuration de base correcte'
  END as diagnostic
FROM france_products p
WHERE p.name ILIKE '%bowl%'

UNION ALL

-- Diagnostic des steps individuels
SELECT
  p.name as product_name,
  'STEP ' || (step_data->>'step') as aspect,
  CASE
    WHEN (step_data->>'step')::int = 3 AND step_data->>'required' = 'true' THEN 'PROBLÈME: Step 3 required=true empêche skip suppléments'
    WHEN (step_data->>'step')::int = 3 AND (step_data->>'max_selections')::int = 1 THEN 'PROBLÈME: Step 3 max_selections=1 limite les suppléments'
    WHEN step_data->>'type' != 'options_selection' THEN 'ERREUR: Type step incorrect'
    WHEN step_data->'option_groups' IS NULL THEN 'ERREUR: option_groups manquant'
    ELSE 'OK: Step configuré correctement'
  END as diagnostic
FROM france_products p,
LATERAL jsonb_array_elements(p.steps_config->'steps') AS step_data
WHERE p.name ILIKE '%bowl%'
  AND p.steps_config IS NOT NULL

ORDER BY product_name, aspect;