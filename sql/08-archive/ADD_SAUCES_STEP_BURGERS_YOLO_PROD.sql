-- ========================================================================
-- SCRIPT D'AJOUT STEP SAUCES BURGERS PIZZA YOLO - PROD
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: BURGERS (ID: 2)
--
-- OBJECTIF: Ajouter un step de sélection de sauce aux 10 burgers
-- MODIFICATIONS:
-- - Ajout de 16 sauces comme options pour chaque burger (160 lignes)
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
    v_burgers_count INTEGER;
BEGIN
    -- Vérifier que Pizza Yolo existe
    SELECT COUNT(*) INTO v_yolo_count
    FROM france_restaurants
    WHERE id = 1 AND name = 'Pizza Yolo 77';

    IF v_yolo_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Restaurant Pizza Yolo (ID: 1) non trouvé!';
    END IF;

    -- Vérifier que la catégorie BURGERS existe
    SELECT COUNT(*) INTO v_category_count
    FROM france_menu_categories
    WHERE id = 2 AND restaurant_id = 1 AND name = 'BURGERS';

    IF v_category_count = 0 THEN
        RAISE EXCEPTION 'ERREUR: Catégorie BURGERS (ID: 2) non trouvée!';
    END IF;

    -- Compter les burgers
    SELECT COUNT(*) INTO v_burgers_count
    FROM france_products
    WHERE category_id = 2;

    RAISE NOTICE 'Vérifications OK - Restaurant: %, Catégorie: %, Burgers: %',
        v_yolo_count, v_category_count, v_burgers_count;
END $$;

-- ========================================================================
-- ÉTAPE 1: AJOUT DES 16 SAUCES POUR CHAQUE BURGER
-- ========================================================================

-- IDs des burgers: 357, 358, 359, 360, 361, 362, 363, 364, 365, 366

-- Fonction temporaire pour insérer les sauces
DO $$
DECLARE
    v_burger_id INTEGER;
    v_display_order INTEGER;
BEGIN
    -- Pour chaque burger
    FOR v_burger_id IN
        SELECT id FROM france_products WHERE category_id = 2 ORDER BY id
    LOOP
        v_display_order := 1;

        -- 1. Mayonnaise
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Mayonnaise', '🍳', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 2. Ketchup
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Ketchup', '🍅', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 3. Algérienne
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Algérienne', '🌶️', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 4. Poivre
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Poivre', '⚫', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 5. Curry
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Curry', '🍛', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 6. Samouraï
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Samouraï', '🔥', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 7. Harissa
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Harissa', '🌶️', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 8. Blanche
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Blanche', '⚪', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 9. Biggy
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Biggy', '🍔', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 10. Barbecue (BBQ)
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Barbecue (BBQ)', '🍖', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 11. Chili Thaï
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Chili Thaï', '🌶️', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 12. Andalouse
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Andalouse', '🍅', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 13. Moutarde
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Moutarde', '🌾', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 14. Fromagère
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Fromagère', '🧀', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 15. Burger
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Burger', '🍔', 0, v_display_order, true);
        v_display_order := v_display_order + 1;

        -- 16. Tomate
        INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
        VALUES (v_burger_id, 'Sauces', 'Tomate', '🍅', 0, v_display_order, true);

        RAISE NOTICE 'Ajout de 16 sauces pour burger ID: %', v_burger_id;
    END LOOP;
END $$;

-- ========================================================================
-- ÉTAPE 2: MISE À JOUR DES STEPS_CONFIG
-- ========================================================================

-- Nouvelle configuration avec step sauces en premier
UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "required": true,
      "prompt": "Choisissez votre sauce",
      "option_groups": ["Sauces"],
      "max_selections": 1
    },
    {
      "step": 2,
      "type": "options_selection",
      "required": true,
      "prompt": "Choisissez votre boisson 33CL incluse",
      "option_groups": ["Boisson 33CL incluse"],
      "max_selections": 1
    }
  ]
}'::json
WHERE category_id = 2
AND workflow_type = 'composite_workflow';

-- ========================================================================
-- VÉRIFICATIONS POST-MISE À JOUR
-- ========================================================================

-- Compter les sauces ajoutées par burger
SELECT
    p.name AS "Burger",
    COUNT(CASE WHEN po.option_group = 'Sauces' THEN 1 END) AS "Nb sauces",
    COUNT(CASE WHEN po.option_group = 'Boisson 33CL incluse' THEN 1 END) AS "Nb boissons"
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id
WHERE p.category_id = 2
GROUP BY p.name, p.id
ORDER BY p.display_order;

-- Vérifier la nouvelle configuration d'un burger
SELECT
    name AS "Burger",
    steps_config::text AS "Configuration"
FROM france_products
WHERE category_id = 2
LIMIT 1;

-- Compter le total des sauces ajoutées
SELECT
    COUNT(*) AS "Total sauces ajoutées"
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.category_id = 2
AND po.option_group = 'Sauces';

-- Vérifier qu'aucun autre restaurant n'est affecté
SELECT
    r.name AS "Restaurant",
    c.name AS "Catégorie",
    COUNT(DISTINCT po.product_id) AS "Produits avec sauces"
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE po.option_group = 'Sauces'
GROUP BY r.name, c.name
ORDER BY r.name, c.name;

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;
