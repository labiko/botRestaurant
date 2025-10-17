-- ========================================================================
-- SUPPRESSION STEP SUPPLÉMENTS - TOUTES LES CATÉGORIES
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
--
-- OBJECTIF: Supprimer le step 4 (Suppléments) de toutes les catégories
-- WORKFLOW AVANT: Plats → Sauces → Boisson → Suppléments (4 steps)
-- WORKFLOW APRÈS: Plats → Sauces → Boisson (3 steps)
--
-- PRODUITS CONCERNÉS:
-- - BURGERS (658)
-- - GOURMETS (660)
-- - SMASHS (661)
-- - NAANS (662)
-- - SANDWICHS (663)
-- - PANINI (664)
-- - ASSIETTES (665)
-- - BOWL (238)
--
-- ⚠️ NOTE: Les options "Suppléments" restent en base mais ne seront plus
--          proposées dans le workflow du bot WhatsApp
-- ========================================================================

BEGIN;

-- ========================================================================
-- AFFICHAGE ÉTAT ACTUEL AVANT SUPPRESSION
-- ========================================================================

SELECT
    'ÉTAT ACTUEL - 4 STEPS' AS info,
    p.id,
    p.name,
    steps_config->'steps'->0->>'option_groups' AS step1,
    steps_config->'steps'->1->>'option_groups' AS step2,
    steps_config->'steps'->2->>'option_groups' AS step3,
    steps_config->'steps'->3->>'option_groups' AS step4
FROM france_products p
WHERE p.id IN (658, 660, 661, 662, 663, 664, 665, 238)
ORDER BY p.name;

-- ========================================================================
-- UPDATE: CONFIGURATION 3 STEPS (SANS SUPPLÉMENTS)
-- ========================================================================

-- Configuration universelle pour tous les produits
UPDATE france_products
SET steps_config = '{
    "steps": [
        {
            "step": 1,
            "type": "options_selection",
            "prompt": "Choisissez votre plat",
            "option_groups": ["Plats"],
            "required": true,
            "max_selections": 1
        },
        {
            "step": 2,
            "type": "options_selection",
            "prompt": "Choisissez votre sauce (optionnel)",
            "option_groups": ["Sauces"],
            "required": false,
            "max_selections": 1
        },
        {
            "step": 3,
            "type": "options_selection",
            "prompt": "Choisissez votre boisson 33CL incluse",
            "option_groups": ["Boisson 33CL incluse"],
            "required": true,
            "max_selections": 1
        }
    ]
}'::jsonb
WHERE id IN (658, 660, 661, 662, 663, 664, 665, 238)
AND restaurant_id = 1;

-- ========================================================================
-- VÉRIFICATIONS POST-SUPPRESSION
-- ========================================================================

-- Vérifier que tous les produits ont maintenant 3 steps
SELECT
    'ÉTAT APRÈS SUPPRESSION - 3 STEPS' AS info,
    p.id,
    p.name,
    steps_config->'steps'->0->>'option_groups' AS step1,
    steps_config->'steps'->1->>'option_groups' AS step2,
    steps_config->'steps'->2->>'option_groups' AS step3,
    steps_config->'steps'->3->>'option_groups' AS step4_should_be_null
FROM france_products p
WHERE p.id IN (658, 660, 661, 662, 663, 664, 665, 238)
ORDER BY p.name;

-- Vérifier le nombre de steps dans la configuration
SELECT
    p.id,
    p.name,
    jsonb_array_length(steps_config->'steps') AS nb_steps
FROM france_products p
WHERE p.id IN (658, 660, 661, 662, 663, 664, 665, 238)
ORDER BY p.name;

-- Vérifier que les options Suppléments existent toujours en base
SELECT
    'OPTIONS SUPPLÉMENTS - TOUJOURS EN BASE' AS info,
    p.name AS produit,
    COUNT(po.id) AS nb_supplements
FROM france_products p
LEFT JOIN france_product_options po ON po.product_id = p.id AND po.option_group = 'Suppléments'
WHERE p.id IN (658, 660, 661, 662, 663, 664, 665, 238)
GROUP BY p.name
ORDER BY p.name;

-- Vérification finale
SELECT
    'VÉRIFICATION FINALE' AS info,
    COUNT(*) AS nb_produits_avec_3_steps
FROM france_products
WHERE id IN (658, 660, 661, 662, 663, 664, 665, 238)
AND jsonb_array_length(steps_config->'steps') = 3;

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU
-- ========================================================================
--
-- ✅ 8 produits avec workflow 3 steps (au lieu de 4)
-- ✅ Step 1: Plats (obligatoire)
-- ✅ Step 2: Sauces (optionnel)
-- ✅ Step 3: Boisson 33CL incluse (obligatoire)
-- ✅ Step 4: Suppléments → SUPPRIMÉ du workflow
--
-- ⚠️ Les options Suppléments restent en base dans france_product_options
--    mais ne seront plus proposées dans le bot WhatsApp
--
-- ========================================================================
