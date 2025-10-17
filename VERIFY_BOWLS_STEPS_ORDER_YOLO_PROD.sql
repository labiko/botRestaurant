-- ========================================================================
-- VÉRIFICATION ORDRE DES STEPS - BOWL
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- PRODUIT: BOWL (ID: 238)
--
-- OBJECTIF: Vérifier que l'ordre des steps est correct :
-- Step 1: Plats (viandes)
-- Step 2: Sauces (optionnel)
-- Step 3: Boisson 33CL incluse
-- Step 4: Suppléments (optionnel)
-- ========================================================================

-- Afficher la configuration complète des steps
SELECT
    'CONFIGURATION STEPS - BOWL' AS info,
    id,
    name,
    workflow_type,
    steps_config
FROM france_products
WHERE id = 238;

-- Extraire chaque step individuellement
SELECT
    'STEP 1' AS step_info,
    steps_config->'steps'->0->>'step' AS step_number,
    steps_config->'steps'->0->>'prompt' AS prompt,
    steps_config->'steps'->0->>'option_groups' AS option_groups,
    steps_config->'steps'->0->>'required' AS required,
    steps_config->'steps'->0->>'max_selections' AS max_selections
FROM france_products
WHERE id = 238

UNION ALL

SELECT
    'STEP 2' AS step_info,
    steps_config->'steps'->1->>'step' AS step_number,
    steps_config->'steps'->1->>'prompt' AS prompt,
    steps_config->'steps'->1->>'option_groups' AS option_groups,
    steps_config->'steps'->1->>'required' AS required,
    steps_config->'steps'->1->>'max_selections' AS max_selections
FROM france_products
WHERE id = 238

UNION ALL

SELECT
    'STEP 3' AS step_info,
    steps_config->'steps'->2->>'step' AS step_number,
    steps_config->'steps'->2->>'prompt' AS prompt,
    steps_config->'steps'->2->>'option_groups' AS option_groups,
    steps_config->'steps'->2->>'required' AS required,
    steps_config->'steps'->2->>'max_selections' AS max_selections
FROM france_products
WHERE id = 238

UNION ALL

SELECT
    'STEP 4' AS step_info,
    steps_config->'steps'->3->>'step' AS step_number,
    steps_config->'steps'->3->>'prompt' AS prompt,
    steps_config->'steps'->3->>'option_groups' AS option_groups,
    steps_config->'steps'->3->>'required' AS required,
    steps_config->'steps'->3->>'max_selections' AS max_selections
FROM france_products
WHERE id = 238;

-- Vérification : Ordre attendu
SELECT
    'ORDRE ATTENDU' AS verification,
    'Step 1: Plats → Step 2: Sauces → Step 3: Boisson → Step 4: Suppléments' AS ordre;
