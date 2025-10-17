-- ========================================================================
-- CORRECTION ORDRE DES STEPS - TOUTES LES CATÉGORIES
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
--
-- OBJECTIF: Uniformiser l'ordre des steps pour toutes les catégories
-- ORDRE STANDARD (C): Plats → Sauces → Boisson → Suppléments
--
-- PRODUITS À CORRIGER:
-- - BURGERS (658): actuellement Plats → Boisson → Suppléments → Sauces
-- - GOURMETS (660): actuellement Plats → Boisson → Sauces → Suppléments
-- - SMASHS (661): actuellement Plats → Boisson → Sauces → Suppléments
-- - NAANS (662): actuellement Boisson → Plats → Sauces → Suppléments (INVERSÉ!)
-- - PANINI (664): actuellement Plats → Boisson → Suppléments → Sauces
-- - ASSIETTES (665): actuellement Plats → Suppléments → Sauces → Boisson
--
-- PRODUITS DÉJÀ CORRECTS:
-- - SANDWICHS (663): Plats → Sauces → Boisson → Suppléments ✅
-- - BOWL (238): Plats → Sauces → Boisson → Suppléments ✅
-- ========================================================================

BEGIN;

-- ========================================================================
-- AFFICHAGE ÉTAT ACTUEL AVANT CORRECTION
-- ========================================================================

SELECT
    'ÉTAT ACTUEL - AVANT CORRECTION' AS info,
    p.id,
    p.name,
    steps_config->'steps'->0->>'option_groups' AS step1,
    steps_config->'steps'->1->>'option_groups' AS step2,
    steps_config->'steps'->2->>'option_groups' AS step3,
    steps_config->'steps'->3->>'option_groups' AS step4
FROM france_products p
WHERE p.id IN (658, 660, 661, 662, 664, 665)
ORDER BY p.id;

-- ========================================================================
-- CORRECTION 1: BURGERS (ID: 658)
-- ========================================================================

UPDATE france_products
SET steps_config = '{
    "steps": [
        {
            "step": 1,
            "type": "options_selection",
            "prompt": "Choisissez votre burger",
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
        },
        {
            "step": 4,
            "type": "options_selection",
            "prompt": "Suppléments (optionnel)",
            "option_groups": ["Suppléments"],
            "required": false,
            "max_selections": 3
        }
    ]
}'::jsonb
WHERE id = 658
AND restaurant_id = 1;

-- ========================================================================
-- CORRECTION 2: GOURMETS (ID: 660)
-- ========================================================================

UPDATE france_products
SET steps_config = '{
    "steps": [
        {
            "step": 1,
            "type": "options_selection",
            "prompt": "Choisissez votre gourmet",
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
        },
        {
            "step": 4,
            "type": "options_selection",
            "prompt": "Suppléments (optionnel)",
            "option_groups": ["Suppléments"],
            "required": false,
            "max_selections": 3
        }
    ]
}'::jsonb
WHERE id = 660
AND restaurant_id = 1;

-- ========================================================================
-- CORRECTION 3: SMASHS (ID: 661)
-- ========================================================================

UPDATE france_products
SET steps_config = '{
    "steps": [
        {
            "step": 1,
            "type": "options_selection",
            "prompt": "Choisissez votre smash",
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
        },
        {
            "step": 4,
            "type": "options_selection",
            "prompt": "Suppléments (optionnel)",
            "option_groups": ["Suppléments"],
            "required": false,
            "max_selections": 3
        }
    ]
}'::jsonb
WHERE id = 661
AND restaurant_id = 1;

-- ========================================================================
-- CORRECTION 4: NAANS (ID: 662) - CORRECTION PRIORITAIRE (Boisson en step 1!)
-- ========================================================================

UPDATE france_products
SET steps_config = '{
    "steps": [
        {
            "step": 1,
            "type": "options_selection",
            "prompt": "Choisissez votre naan",
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
        },
        {
            "step": 4,
            "type": "options_selection",
            "prompt": "Suppléments (optionnel)",
            "option_groups": ["Suppléments"],
            "required": false,
            "max_selections": 3
        }
    ]
}'::jsonb
WHERE id = 662
AND restaurant_id = 1;

-- ========================================================================
-- CORRECTION 5: PANINI (ID: 664)
-- ========================================================================

UPDATE france_products
SET steps_config = '{
    "steps": [
        {
            "step": 1,
            "type": "options_selection",
            "prompt": "Choisissez votre panini",
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
        },
        {
            "step": 4,
            "type": "options_selection",
            "prompt": "Suppléments (optionnel)",
            "option_groups": ["Suppléments"],
            "required": false,
            "max_selections": 3
        }
    ]
}'::jsonb
WHERE id = 664
AND restaurant_id = 1;

-- ========================================================================
-- CORRECTION 6: ASSIETTES (ID: 665)
-- ========================================================================

UPDATE france_products
SET steps_config = '{
    "steps": [
        {
            "step": 1,
            "type": "options_selection",
            "prompt": "Choisissez votre assiette",
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
        },
        {
            "step": 4,
            "type": "options_selection",
            "prompt": "Suppléments (optionnel)",
            "option_groups": ["Suppléments"],
            "required": false,
            "max_selections": 3
        }
    ]
}'::jsonb
WHERE id = 665
AND restaurant_id = 1;

-- ========================================================================
-- VÉRIFICATIONS POST-CORRECTION
-- ========================================================================

-- Vérifier que tous les produits ont maintenant l'ordre C
SELECT
    'ÉTAT APRÈS CORRECTION' AS info,
    p.id,
    p.name,
    steps_config->'steps'->0->>'option_groups' AS step1,
    steps_config->'steps'->1->>'option_groups' AS step2,
    steps_config->'steps'->2->>'option_groups' AS step3,
    steps_config->'steps'->3->>'option_groups' AS step4
FROM france_products p
WHERE p.id IN (658, 660, 661, 662, 663, 664, 665, 238)
ORDER BY p.id;

-- Vérifier l'ordre attendu
SELECT
    'VÉRIFICATION FINALE' AS info,
    COUNT(*) AS nb_produits_corriges,
    'Tous doivent avoir: ["Plats"] → ["Sauces"] → ["Boisson 33CL incluse"] → ["Suppléments"]' AS ordre_attendu
FROM france_products
WHERE id IN (658, 660, 661, 662, 663, 664, 665, 238)
AND steps_config->'steps'->0->>'option_groups' = '["Plats"]'
AND steps_config->'steps'->1->>'option_groups' = '["Sauces"]'
AND steps_config->'steps'->2->>'option_groups' = '["Boisson 33CL incluse"]'
AND steps_config->'steps'->3->>'option_groups' = '["Suppléments"]';

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU
-- ========================================================================
--
-- ✅ 8 produits avec ordre unifié: Plats → Sauces → Boisson → Suppléments
-- ✅ BURGERS (658) corrigé
-- ✅ GOURMETS (660) corrigé
-- ✅ SMASHS (661) corrigé
-- ✅ NAANS (662) corrigé (Boisson remis à step 3)
-- ✅ PANINI (664) corrigé
-- ✅ ASSIETTES (665) corrigé
-- ✅ SANDWICHS (663) déjà correct
-- ✅ BOWL (238) déjà correct
--
-- ========================================================================
