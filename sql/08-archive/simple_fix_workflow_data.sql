-- =========================================
-- SOLUTION SIMPLE - CORRIGER LES DONNÉES WORKFLOW
-- =========================================

-- =========================================
-- 1. CORRIGER LE PRIX MANQUANT
-- =========================================

UPDATE france_products
SET price_on_site_base = 18.00
WHERE id = 579 AND price_on_site_base IS NULL;

-- =========================================
-- 2. VÉRIFIER LA CORRECTION
-- =========================================

SELECT
  id,
  name,
  price_on_site_base,
  price_delivery_base,
  workflow_type
FROM france_products
WHERE id = 579;

-- =========================================
-- 3. EXTRAIRE LES GROUPES D'OPTIONS DEPUIS STEPS_CONFIG
-- =========================================

SELECT
  step_data->>'step' as step_number,
  step_data->>'prompt' as question,
  step_data->>'required' as obligatoire,
  step_data->'option_groups' as groupes_options
FROM france_products,
     jsonb_array_elements(steps_config->'steps') as step_data
WHERE id = 579
ORDER BY (step_data->>'step')::int;

-- =========================================
-- 4. LISTER TOUS LES GROUPES D'OPTIONS NÉCESSAIRES
-- =========================================

SELECT DISTINCT
  trim(both '"' from group_name::text) as "Groupe requis"
FROM france_products,
     jsonb_array_elements(steps_config->'steps') as step_data,
     jsonb_array_elements(step_data->'option_groups') as group_name
WHERE id = 579
ORDER BY 1;

-- =========================================
-- 5. DONNÉES POUR L'API WORKFLOW-EDIT
-- =========================================

SELECT
  json_build_object(
    'product', json_build_object(
      'id', 579,
      'name', 'FORMULE PIZZA COMPLÈTE',
      'price_on_site_base', 18.00,
      'price_delivery_base', 19.00,
      'category', json_build_object('name', 'Formules pizza'),
      'restaurant_id', 16
    ),
    'steps_config', steps_config,
    'message', 'Options par groupe à créer - groupes requis listés ci-dessus'
  ) as "Structure API complète"
FROM france_products
WHERE id = 579;