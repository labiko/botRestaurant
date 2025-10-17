-- ========================================================================
-- SCRIPT D'AJOUT STEP SAUCES GOURMETS PIZZA YOLO - PROD
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: GOURMETS (ID: 4)
--
-- OBJECTIF: Ajouter un step de sélection de sauce aux 5 gourmets
-- MODIFICATIONS:
-- - Ajout de 16 sauces comme options pour chaque gourmet (80 lignes)
-- - Migration de composite_workflow vers universal_workflow_v2
-- - Mise à jour steps_config pour inclure le step sauces (step 1)
-- - Conservation du step boisson (devient step 2)
-- ========================================================================

BEGIN;

-- ========================================================================
-- VÉRIFICATION PRÉALABLE
-- ========================================================================

DO $$
DECLARE
    v_yolo_count INTEGER;
    v_category_count INTEGER;
    v_gourmets_count INTEGER;
BEGIN
    -- Vérifier que Pizza Yolo existe
    SELECT COUNT(*) INTO v_yolo_count
    FROM france_restaurants
    WHERE id = 1 AND name = 'Pizza Yolo 77';

    IF v_yolo_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Restaurant Pizza Yolo (ID: 1) non trouvé!';
    END IF;

    -- Vérifier que la catégorie GOURMETS existe
    SELECT COUNT(*) INTO v_category_count
    FROM france_menu_categories
    WHERE id = 4 AND restaurant_id = 1 AND name = 'GOURMETS';

    IF v_category_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Catégorie GOURMETS (ID: 4) non trouvée!';
    END IF;

    -- Compter les gourmets
    SELECT COUNT(*) INTO v_gourmets_count
    FROM france_products
    WHERE category_id = 4;

    RAISE NOTICE 'Vérifications OK - Restaurant: %, Catégorie: %, Gourmets: %',
        v_yolo_count, v_category_count, v_gourmets_count;
END $$;

-- ========================================================================
-- ÉTAPE 1: AJOUT DES 16 SAUCES POUR CHAQUE GOURMET
-- ========================================================================

-- IDs des gourmets: 367 (L'AMERICAIN), 368 (LE SAVOYARD), 369 (LE BBQ),
--                   370 (LE BIG CHEF), 371 (L'AVOCADO)

DO $$
DECLARE
    v_gourmet_id INTEGER;
    v_display_order INTEGER;
BEGIN
    -- Pour chaque gourmet (avec vérification restaurant)
    FOR v_gourmet_id IN
        SELECT p.id
        FROM france_products p
        JOIN france_menu_categories c ON p.category_id = c.id
        WHERE c.id = 4 AND c.restaurant_id = 1
        ORDER BY p.id
    LOOP
        v_display_order := 1;

        -- 1. Mayonnaise
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Mayonnaise', '🍳', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 2. Ketchup
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Ketchup', '🍅', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 3. Algérienne
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Algérienne', '🌶️', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 4. Poivre
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Poivre', '⚫', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 5. Curry
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Curry', '🍛', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 6. Samouraï
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Samouraï', '🔥', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 7. Harissa
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Harissa', '🌶️', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 8. Blanche
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Blanche', '⚪', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 9. Biggy
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Biggy', '🍔', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 10. Barbecue (BBQ)
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Barbecue (BBQ)', '🍖', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 11. Chili Thaï
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Chili Thaï', '🌶️', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 12. Andalouse
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Andalouse', '🍅', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 13. Moutarde
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Moutarde', '🌾', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 14. Fromagère
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Fromagère', '🧀', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 15. Burger
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Burger', '🍔', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 16. Tomate
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_gourmet_id, 'Sauces', 'Tomate', '🍅', 0, v_display_order, true);

        RAISE NOTICE 'Ajout de 16 sauces pour gourmet ID: %', v_gourmet_id;
    END LOOP;
END $$;

-- ========================================================================
-- ÉTAPE 2: MIGRATION VERS UNIVERSAL_WORKFLOW_V2 ET MISE À JOUR STEPS_CONFIG
-- ========================================================================

-- Nouvelle configuration avec step sauces en premier + migration workflow
UPDATE france_products
SET
    workflow_type = 'universal_workflow_v2',
    steps_config = '{
        "steps": [
            {
                "step": 1,
                "type": "options_selection",
                "prompt": "Choisissez votre sauce",
                "option_groups": ["Sauces"],
                "required": true,
                "max_selections": 1
            },
            {
                "step": 2,
                "type": "options_selection",
                "prompt": "Choisissez votre boisson 33CL incluse",
                "option_groups": ["Boisson 33CL incluse"],
                "required": true,
                "max_selections": 1
            }
        ]
    }'::json
WHERE category_id = 4
AND EXISTS (
    SELECT 1 FROM france_menu_categories c
    WHERE c.id = 4 AND c.restaurant_id = 1
);

-- ========================================================================
-- VÉRIFICATIONS POST-MISE À JOUR
-- ========================================================================

-- Compter les sauces ajoutées par gourmet
SELECT
    p.name AS "Gourmet",
    COUNT(CASE WHEN po.option_group = 'Sauces' THEN 1 END) AS "Nb sauces",
    COUNT(CASE WHEN po.option_group = 'Boisson 33CL incluse' THEN 1 END) AS "Nb boissons"
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id
WHERE p.category_id = 4
GROUP BY p.name, p.id
ORDER BY p.display_order;

-- Vérifier la nouvelle configuration et le workflow_type
SELECT
    p.id,
    p.name AS "Gourmet",
    p.workflow_type,
    jsonb_pretty(p.steps_config::jsonb) AS "Configuration"
FROM france_products p
WHERE p.category_id = 4
ORDER BY p.id
LIMIT 2;

-- Compter le total des sauces ajoutées
SELECT
    COUNT(*) AS "Total sauces ajoutées (doit être 80)"
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.category_id = 4
AND po.option_group = 'Sauces';

-- Vérifier qu'il ne reste aucun composite_workflow
SELECT
    COUNT(*) AS "Gourmets avec composite_workflow (doit être 0)"
FROM france_products
WHERE category_id = 4
AND workflow_type = 'composite_workflow';

-- Vérifier que tous sont en universal_workflow_v2
SELECT
    COUNT(*) AS "Gourmets avec universal_workflow_v2 (doit être 5)"
FROM france_products
WHERE category_id = 4
AND workflow_type = 'universal_workflow_v2';

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;
