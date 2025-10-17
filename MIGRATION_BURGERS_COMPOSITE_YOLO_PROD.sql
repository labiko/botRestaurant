-- ========================================================================
-- SCRIPT DE MIGRATION BURGERS PIZZA YOLO VERS ARCHITECTURE COMPOSITE
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: BURGERS (ID: 2)
--
-- OBJECTIF: Migrer de 10 produits individuels vers 1 produit composite
-- ARCHITECTURE CIBLE: Identique à OCV SMASH BURGERS
--
-- AVANT: 10 produits distincts (CHEESEBURGER, DOUBLE CHEESEBURGER, etc.)
-- APRÈS: 1 produit composite "BURGERS" avec options dans groupe "Plats"
--
-- WORKFLOW: universal_workflow_v2 avec 4 steps :
-- - Step 1: Choix burger (Plats)
-- - Step 2: Choix boisson incluse (Boisson 33CL incluse)
-- - Step 3: Suppléments optionnels (Suppléments)
-- - Step 4: Sauce optionnelle (Sauces)
--
-- NOTE: Les 10 produits individuels seront DÉSACTIVÉS (is_active=false)
--       mais conservés en base pour historique. Suppression manuelle après test.
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
    v_existing_composite INTEGER;
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

    -- Compter les burgers actuels
    SELECT COUNT(*) INTO v_burgers_count
    FROM france_products
    WHERE category_id = 2 AND is_active = true;

    -- Vérifier qu'aucun produit composite BURGERS n'existe déjà
    SELECT COUNT(*) INTO v_existing_composite
    FROM france_products
    WHERE category_id = 2
    AND product_type = 'composite'
    AND name = 'BURGERS';

    IF v_existing_composite > 0 THEN
        RAISE EXCEPTION 'ERREUR: Un produit composite BURGERS existe déjà (ID: %). Supprimez-le d''abord.',
            (SELECT id FROM france_products WHERE category_id = 2 AND product_type = 'composite' AND name = 'BURGERS' LIMIT 1);
    END IF;

    RAISE NOTICE 'Vérifications OK - Restaurant: %, Catégorie: %, Burgers actifs: %',
        v_yolo_count, v_category_count, v_burgers_count;
END $$;

-- ========================================================================
-- ÉTAPE 1: CRÉATION DU PRODUIT COMPOSITE "BURGERS"
-- ========================================================================

-- Insérer le nouveau produit composite
INSERT INTO france_products (
    restaurant_id,
    category_id,
    name,
    product_type,
    workflow_type,
    requires_steps,
    steps_config,
    price_on_site_base,
    price_delivery_base,
    display_order,
    is_active
)
VALUES (
    1,                      -- Pizza Yolo 77
    2,                      -- BURGERS
    'BURGERS',
    'composite',
    'universal_workflow_v2',
    true,
    '{
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
                "prompt": "Choisissez votre boisson 33CL incluse",
                "option_groups": ["Boisson 33CL incluse"],
                "required": true,
                "max_selections": 1
            },
            {
                "step": 3,
                "type": "options_selection",
                "prompt": "Suppléments (optionnel)",
                "option_groups": ["Suppléments"],
                "required": false,
                "max_selections": 3
            },
            {
                "step": 4,
                "type": "options_selection",
                "prompt": "Choisissez votre sauce (optionnel)",
                "option_groups": ["Sauces"],
                "required": false,
                "max_selections": 1
            }
        ]
    }'::json,
    0,                      -- Prix de base à 0 (prix dans les options)
    0,
    1,                      -- Ordre d'affichage
    true
)
RETURNING id;

-- Récupérer l'ID du nouveau produit
DO $$
DECLARE
    v_new_product_id INTEGER;
BEGIN
    SELECT id INTO v_new_product_id
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 2
    AND product_type = 'composite'
    AND name = 'BURGERS'
    LIMIT 1;

    RAISE NOTICE 'Nouveau produit composite BURGERS créé avec ID: %', v_new_product_id;

    -- Stocker l'ID dans une variable temporaire pour les prochaines étapes
    PERFORM set_config('migration.new_product_id', v_new_product_id::text, true);
END $$;

-- ========================================================================
-- ÉTAPE 2: CRÉATION DES OPTIONS GROUPE "PLATS" (10 BURGERS)
-- ========================================================================

-- Les 10 burgers deviennent des options du groupe "Plats"
DO $$
DECLARE
    v_product_id INTEGER;
BEGIN
    v_product_id := current_setting('migration.new_product_id')::INTEGER;

    -- 1. CHEESEBURGER - 5€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES (v_product_id, 'Plats', 'CHEESEBURGER', '🍔', 5.00, 1, true);

    -- 2. DOUBLE CHEESEBURGER - 6.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES (v_product_id, 'Plats', 'DOUBLE CHEESEBURGER', '🍔', 6.50, 2, true);

    -- 3. BIG CHEESE - 7.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES (v_product_id, 'Plats', 'BIG CHEESE', '🍔', 7.50, 3, true);

    -- 4. LE FISH - 6.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES (v_product_id, 'Plats', 'LE FISH', '🐟', 6.50, 4, true);

    -- 5. LE CHICKEN - 6.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES (v_product_id, 'Plats', 'LE CHICKEN', '🍗', 6.50, 5, true);

    -- 6. LE TOWER - 7.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES (v_product_id, 'Plats', 'LE TOWER', '🗼', 7.50, 6, true);

    -- 7. GÉANT - 6.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES (v_product_id, 'Plats', 'GÉANT', '🍔', 6.50, 7, true);

    -- 8. 180 - 8.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES (v_product_id, 'Plats', '180', '🍔', 8.50, 8, true);

    -- 9. LE BACON - 9.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES (v_product_id, 'Plats', 'LE BACON', '🥓', 9.50, 9, true);

    -- 10. 270 - 10€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES (v_product_id, 'Plats', '270', '🍔', 10.00, 10, true);

    RAISE NOTICE '10 burgers ajoutés au groupe Plats';
END $$;

-- ========================================================================
-- ÉTAPE 3: CRÉATION DES OPTIONS GROUPE "BOISSON 33CL INCLUSE" (12 BOISSONS)
-- ========================================================================

DO $$
DECLARE
    v_product_id INTEGER;
BEGIN
    v_product_id := current_setting('migration.new_product_id')::INTEGER;

    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES
        (v_product_id, 'Boisson 33CL incluse', '7 UP', '🥤', 0, 1, true),
        (v_product_id, 'Boisson 33CL incluse', '7UP CHERRY', '🍒', 0, 2, true),
        (v_product_id, 'Boisson 33CL incluse', '7UP TROPICAL', '🌴', 0, 3, true),
        (v_product_id, 'Boisson 33CL incluse', 'COCA COLA', '🥤', 0, 4, true),
        (v_product_id, 'Boisson 33CL incluse', 'COCA ZERO', '⚫', 0, 5, true),
        (v_product_id, 'Boisson 33CL incluse', 'EAU MINÉRALE', '💧', 0, 6, true),
        (v_product_id, 'Boisson 33CL incluse', 'ICE TEA', '🧋', 0, 7, true),
        (v_product_id, 'Boisson 33CL incluse', 'FANTA', '🍊', 0, 8, true),
        (v_product_id, 'Boisson 33CL incluse', 'OASIS TROPICAL', '🧃', 0, 9, true),
        (v_product_id, 'Boisson 33CL incluse', 'PERRIER', '🫧', 0, 10, true),
        (v_product_id, 'Boisson 33CL incluse', 'SPRITE', '🥤', 0, 11, true),
        (v_product_id, 'Boisson 33CL incluse', 'TROPICO', '🌴', 0, 12, true);

    RAISE NOTICE '12 boissons ajoutées au groupe Boisson 33CL incluse';
END $$;

-- ========================================================================
-- ÉTAPE 4: CRÉATION DES OPTIONS GROUPE "SAUCES" (16 SAUCES)
-- ========================================================================

DO $$
DECLARE
    v_product_id INTEGER;
BEGIN
    v_product_id := current_setting('migration.new_product_id')::INTEGER;

    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES
        (v_product_id, 'Sauces', 'Mayonnaise', '🍳', 0, 1, true),
        (v_product_id, 'Sauces', 'Ketchup', '🍅', 0, 2, true),
        (v_product_id, 'Sauces', 'Algérienne', '🌶️', 0, 3, true),
        (v_product_id, 'Sauces', 'Poivre', '⚫', 0, 4, true),
        (v_product_id, 'Sauces', 'Curry', '🍛', 0, 5, true),
        (v_product_id, 'Sauces', 'Samouraï', '🔥', 0, 6, true),
        (v_product_id, 'Sauces', 'Harissa', '🌶️', 0, 7, true),
        (v_product_id, 'Sauces', 'Blanche', '⚪', 0, 8, true),
        (v_product_id, 'Sauces', 'Biggy', '🍔', 0, 9, true),
        (v_product_id, 'Sauces', 'Barbecue (BBQ)', '🍖', 0, 10, true),
        (v_product_id, 'Sauces', 'Chili Thaï', '🌶️', 0, 11, true),
        (v_product_id, 'Sauces', 'Andalouse', '🍅', 0, 12, true),
        (v_product_id, 'Sauces', 'Moutarde', '🌾', 0, 13, true),
        (v_product_id, 'Sauces', 'Fromagère', '🧀', 0, 14, true),
        (v_product_id, 'Sauces', 'Burger', '🍔', 0, 15, true),
        (v_product_id, 'Sauces', 'Tomate', '🍅', 0, 16, true);

    RAISE NOTICE '16 sauces ajoutées au groupe Sauces';
END $$;

-- ========================================================================
-- ÉTAPE 5: CRÉATION DES OPTIONS GROUPE "SUPPLÉMENTS" (OPTIONNEL)
-- ========================================================================

DO $$
DECLARE
    v_product_id INTEGER;
BEGIN
    v_product_id := current_setting('migration.new_product_id')::INTEGER;

    -- Suppléments classiques
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES
        (v_product_id, 'Suppléments', 'Potatoes', '🍟', 1.00, 1, true),
        (v_product_id, 'Suppléments', 'Frites maison', '🍟', 1.00, 2, true);

    RAISE NOTICE '2 suppléments ajoutés au groupe Suppléments';
END $$;

-- ========================================================================
-- ÉTAPE 6: DÉSACTIVATION DES 10 PRODUITS INDIVIDUELS
-- ========================================================================

-- Marquer les 10 produits individuels comme inactifs
UPDATE france_products
SET is_active = false
WHERE restaurant_id = 1
AND category_id = 2
AND id IN (357, 358, 359, 360, 361, 362, 363, 364, 365, 366)
AND product_type = 'composite';

-- Vérifier combien de produits ont été désactivés
DO $$
DECLARE
    v_disabled_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_disabled_count
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 2
    AND id IN (357, 358, 359, 360, 361, 362, 363, 364, 365, 366)
    AND is_active = false;

    RAISE NOTICE '% produits individuels désactivés', v_disabled_count;
END $$;

-- ========================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ========================================================================

-- 1. Vérifier le nouveau produit composite
SELECT
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.is_active,
    jsonb_pretty(p.steps_config::jsonb) AS steps_config
FROM france_products p
WHERE p.restaurant_id = 1
AND p.category_id = 2
AND p.product_type = 'composite'
AND p.name = 'BURGERS';

-- 2. Compter les options par groupe
SELECT
    po.option_group,
    COUNT(*) AS nb_options,
    SUM(CASE WHEN po.price_modifier > 0 THEN 1 ELSE 0 END) AS nb_payantes
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.restaurant_id = 1
AND p.category_id = 2
AND p.product_type = 'composite'
AND p.name = 'BURGERS'
GROUP BY po.option_group
ORDER BY po.option_group;

-- 3. Vérifier les prix des burgers dans le groupe Plats
SELECT
    po.option_name AS "Burger",
    po.price_modifier AS "Prix sur place",
    (po.price_modifier + 1.00) AS "Prix livraison (+1€)",
    po.icon
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.restaurant_id = 1
AND p.category_id = 2
AND p.product_type = 'composite'
AND p.name = 'BURGERS'
AND po.option_group = 'Plats'
ORDER BY po.display_order;

-- 4. Vérifier les produits désactivés
SELECT
    id,
    name,
    is_active,
    'Ancien produit individuel désactivé' AS statut
FROM france_products
WHERE restaurant_id = 1
AND category_id = 2
AND id IN (357, 358, 359, 360, 361, 362, 363, 364, 365, 366)
ORDER BY display_order;

-- 5. Résumé final
SELECT
    'BURGERS COMPOSITE' AS type,
    COUNT(DISTINCT CASE WHEN p.product_type = 'composite' AND p.is_active THEN p.id END) AS nb_composite_actif,
    COUNT(DISTINCT CASE WHEN p.product_type = 'composite' AND NOT p.is_active THEN p.id END) AS nb_composite_inactif,
    COUNT(DISTINCT CASE WHEN p.product_type != 'composite' AND p.is_active THEN p.id END) AS nb_individuels_actifs,
    COUNT(DISTINCT CASE WHEN p.product_type != 'composite' AND NOT p.is_active THEN p.id END) AS nb_individuels_inactifs
FROM france_products p
WHERE p.restaurant_id = 1
AND p.category_id = 2;

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ========================================================================
-- NOTES POST-MIGRATION
-- ========================================================================
--
-- 1. Tester le nouveau produit composite dans le bot WhatsApp
-- 2. Vérifier que tous les workflows fonctionnent correctement
-- 3. Si tout fonctionne, supprimer les 10 produits individuels :
--    DELETE FROM france_products WHERE id IN (357, 358, 359, 360, 361, 362, 363, 364, 365, 366);
-- 4. Nettoyer les options orphelines si nécessaire
--
-- ========================================================================
