-- =========================================
-- ANALYSE WORKFLOW BOWL ACTUEL
-- =========================================

-- 1. Trouver le produit BOWL
SELECT
  p.id,
  p.name,
  p.restaurant_id,
  p.workflow_type,
  p.requires_steps,
  p.steps_config,
  p.base_price,
  p.price_delivery_base,
  p.is_active
FROM france_products p
WHERE p.name ILIKE '%bowl%'
ORDER BY p.restaurant_id, p.name;

-- 2. Voir la configuration steps_config détaillée du BOWL
SELECT
  p.name,
  p.steps_config::text as steps_config_raw,
  jsonb_pretty(p.steps_config) as steps_config_formatted
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

-- 5. Vérifier la structure attendue par le bot universel
-- Le bot attend : steps_config.steps[].option_groups[]
SELECT
  p.name,
  step_data.*
FROM france_products p,
LATERAL jsonb_array_elements(p.steps_config->'steps') AS step_data
WHERE p.name ILIKE '%bowl%'
  AND p.steps_config IS NOT NULL;

-- 6. Analyser chaque step du workflow BOWL
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

-- 7. Vérifier la cohérence entre steps et options
-- Chaque option_group dans steps doit avoir des options dans france_product_options
SELECT
  'STEP REFERENCE' as type,
  p.name as product_name,
  option_group_name.value as option_group_name,
  'Referenced in step ' || (step_data->>'step') as source
FROM france_products p,
LATERAL jsonb_array_elements(p.steps_config->'steps') AS step_data,
LATERAL jsonb_array_elements_text(step_data->'option_groups') AS option_group_name
WHERE p.name ILIKE '%bowl%'
  AND p.steps_config IS NOT NULL

UNION ALL

SELECT
  'OPTIONS AVAILABLE' as type,
  p.name as product_name,
  po.option_group as option_group_name,
  'Available options: ' || COUNT(*) as source
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%bowl%'
GROUP BY p.name, po.option_group

ORDER BY product_name, option_group_name, type;

-- 8. Diagnostic de problèmes potentiels
SELECT
  'PROBLÈME DÉTECTÉ' as status,
  p.name as product_name,
  CASE
    WHEN p.workflow_type != 'composite_workflow' THEN 'workflow_type incorrect: ' || COALESCE(p.workflow_type, 'NULL')
    WHEN p.requires_steps != true THEN 'requires_steps doit être true'
    WHEN p.steps_config IS NULL THEN 'steps_config manquant'
    WHEN NOT jsonb_path_exists(p.steps_config, '$.steps') THEN 'steps_config.steps manquant'
    WHEN jsonb_array_length(p.steps_config->'steps') = 0 THEN 'Aucun step défini'
    ELSE 'Configuration semble correcte'
  END as probleme
FROM france_products p
WHERE p.name ILIKE '%bowl%';