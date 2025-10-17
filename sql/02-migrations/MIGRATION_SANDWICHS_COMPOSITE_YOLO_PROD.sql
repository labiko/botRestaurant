-- ========================================================================
-- SCRIPT DE MIGRATION - SANDWICHS VERS ARCHITECTURE COMPOSITE
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: SANDWICHS (ID: 3)
--
-- OBJECTIF: Migrer de 11 produits individuels vers 1 produit composite
-- MODÈLE: Architecture OCV (1 produit avec options en groupes)
-- IDs À MIGRER: 345, 346, 347, 348, 349, 351, 352, 353, 354, 355, 356 (pas 350)
--
-- ARCHITECTURE CIBLE:
-- - 1 produit composite "SANDWICHS"
-- - Groupe "Plats" : 11 sandwichs avec prix individuels
-- - Groupe "Boisson 33CL incluse" : 12 boissons
-- - Groupe "Sauces" : 16 sauces (optionnel)
-- - Groupe "Suppléments" : Potatoes, Frites (+1€, optionnel)
-- - Workflow: universal_workflow_v2 (4 steps)
-- ========================================================================

BEGIN;

-- ========================================================================
-- VÉRIFICATIONS DE SÉCURITÉ
-- ========================================================================

DO $$
DECLARE
    v_category_exists INTEGER;
    v_products_count INTEGER;
BEGIN
    -- Vérifier que la catégorie SANDWICHS existe pour Pizza Yolo
    SELECT COUNT(*) INTO v_category_exists
    FROM france_menu_categories
    WHERE id = 3
    AND restaurant_id = 1
    AND name = 'SANDWICHS';

    IF v_category_exists = 0 THEN
        RAISE EXCEPTION 'ERREUR: Catégorie SANDWICHS (ID: 3) n''existe pas pour Pizza Yolo (ID: 1)';
    END IF;

    -- Vérifier que les 11 produits existent
    SELECT COUNT(*) INTO v_products_count
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 3
    AND id IN (345, 346, 347, 348, 349, 351, 352, 353, 354, 355, 356);

    IF v_products_count != 11 THEN
        RAISE EXCEPTION 'ERREUR: Nombre de produits SANDWICHS incorrect! Trouvé: % sur 11', v_products_count;
    END IF;

    RAISE NOTICE 'Vérifications OK - Catégorie et 11 produits SANDWICHS trouvés';
END $$;

-- ========================================================================
-- ÉTAPE 1: CRÉATION DU PRODUIT COMPOSITE "SANDWICHS"
-- ========================================================================

-- Créer le produit composite avec workflow universal_workflow_v2
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
    1,                    -- Pizza Yolo
    3,                    -- SANDWICHS
    'SANDWICHS',          -- Nom du produit composite
    'composite',          -- Type composite
    'universal_workflow_v2', -- Workflow moderne
    true,                 -- Nécessite des étapes
    '{
        "steps": [
            {
                "step": 1,
                "type": "options_selection",
                "prompt": "Choisissez votre sandwich",
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
    }'::jsonb,            -- Configuration des 4 steps
    0,                    -- Prix de base 0 (prix dans les options)
    0,                    -- Prix livraison de base 0
    1,                    -- Premier dans la catégorie
    true                  -- Actif
)
RETURNING id;

-- Récupérer l'ID du produit composite créé
DO $$
DECLARE
    v_composite_id INTEGER;
BEGIN
    SELECT id INTO v_composite_id
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 3
    AND name = 'SANDWICHS'
    AND product_type = 'composite'
    AND is_active = true;

    RAISE NOTICE 'Produit composite SANDWICHS créé avec ID: %', v_composite_id;

    -- Stocker l'ID dans une variable temporaire pour les prochaines étapes
    PERFORM set_config('migration.new_product_id', v_composite_id::text, true);
END $$;

-- ========================================================================
-- ÉTAPE 2: CRÉATION DU GROUPE "PLATS" (11 SANDWICHS)
-- ========================================================================

-- Insérer les 11 sandwichs comme options dans le groupe "Plats"
DO $$
DECLARE
    v_product_id INTEGER;
BEGIN
    v_product_id := current_setting('migration.new_product_id')::INTEGER;

    -- 1. LE GREC - 8.00€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'LE GREC', '🇬🇷', 8.00, 1, true,
            'Émincés de kebab, fromage');

    -- 2. L'ESCALOPE - 8.00€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'L''ESCALOPE', '🍗', 8.00, 2, true,
            'Escalope de poulet, fromage');

    -- 3. LE BUFFALO - 8.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'LE BUFFALO', '🦬', 8.50, 3, true,
            'Émincés de kebab & de poulet');

    -- 4. FOREST - 10.00€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'FOREST', '🌲', 10.00, 4, true,
            'Escalope, galette de P.D.T, cheddar, fromage raclette');

    -- 5. LE TANDOORI - 8.00€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'LE TANDOORI', '🍛', 8.00, 5, true,
            'Poulet mariné au tandoori, fromage');

    -- 6. LE BOURSIN - 8.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'LE BOURSIN', '🧀', 8.50, 6, true,
            'Escalope de poulet, fromage, boursin');

    -- 7. ROYAL - 9.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'ROYAL', '👑', 9.50, 7, true,
            'Escalope, cordon bleu, cheddar, crudités');

    -- 8. AMÉRICAIN - 8.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'AMÉRICAIN', '🇺🇸', 8.50, 8, true,
            '3 Steaks de 45g, œuf, fromage');

    -- 9. DU CHEF - 8.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'DU CHEF', '👨‍🍳', 8.50, 9, true,
            'Escalope de poulet, sauce gruyère, fromage râpé');

    -- 10. LE RADICAL - 8.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'LE RADICAL', '⚡', 8.50, 10, true,
            'Steak de 45g, cordon bleu, fromage');

    -- 11. RACLETTE - 9.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'RACLETTE', '🧀', 9.50, 11, true,
            '2 steaks, œufs, galette de P.D.T, cheddar, raclette');

    RAISE NOTICE '11 sandwichs ajoutés au groupe Plats';
END $$;

-- ========================================================================
-- ÉTAPE 3: CRÉATION DU GROUPE "BOISSON 33CL INCLUSE" (12 BOISSONS)
-- ========================================================================

-- Insérer les 12 boissons (identique à BURGERS)
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
-- ÉTAPE 4: CRÉATION DU GROUPE "SAUCES" (16 SAUCES)
-- ========================================================================

-- Insérer les 16 sauces (identique à BURGERS)
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
-- ÉTAPE 5: CRÉATION DU GROUPE "SUPPLÉMENTS" (2 OPTIONS)
-- ========================================================================

-- Insérer les 2 suppléments (identique à BURGERS)
DO $$
DECLARE
    v_product_id INTEGER;
BEGIN
    v_product_id := current_setting('migration.new_product_id')::INTEGER;

    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
    VALUES
        (v_product_id, 'Suppléments', 'Potatoes', '🍟', 1.00, 1, true),
        (v_product_id, 'Suppléments', 'Frites maison', '🍟', 1.00, 2, true);

    RAISE NOTICE '2 suppléments ajoutés au groupe Suppléments';
END $$;

-- ========================================================================
-- ÉTAPE 6: DÉSACTIVATION DES ANCIENS PRODUITS
-- ========================================================================

-- Désactiver les 11 anciens produits individuels (NE PAS SUPPRIMER)
UPDATE france_products
SET is_active = false
WHERE restaurant_id = 1
AND category_id = 3
AND id IN (345, 346, 347, 348, 349, 351, 352, 353, 354, 355, 356);

-- ========================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ========================================================================

-- Vérifier la création du produit composite
SELECT
    'PRODUIT COMPOSITE CRÉÉ' AS info,
    id,
    name,
    product_type,
    workflow_type,
    requires_steps,
    is_active
FROM france_products
WHERE restaurant_id = 1
AND category_id = 3
AND name = 'SANDWICHS'
AND product_type = 'composite';

-- Vérifier le nombre d'options par groupe
SELECT
    option_group AS "Groupe",
    COUNT(*) AS "Nb options"
FROM france_product_options
WHERE product_id = (
    SELECT id FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 3
    AND name = 'SANDWICHS'
    AND product_type = 'composite'
    LIMIT 1
)
GROUP BY option_group
ORDER BY option_group;

-- Vérifier que les compositions sont présentes
SELECT
    option_name AS "Sandwich",
    composition AS "Composition",
    price_modifier AS "Prix sur place",
    (price_modifier + 1.00) AS "Prix livraison (+1€)"
FROM france_product_options
WHERE product_id = (
    SELECT id FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 3
    AND name = 'SANDWICHS'
    AND product_type = 'composite'
    LIMIT 1
)
AND option_group = 'Plats'
ORDER BY display_order;

-- Vérifier l'état de la catégorie SANDWICHS
SELECT
    'ÉTAT FINAL SANDWICHS' AS info,
    COUNT(*) AS nb_produits_total,
    COUNT(*) FILTER (WHERE product_type = 'composite' AND is_active = true) AS nb_composite_actif,
    COUNT(*) FILTER (WHERE product_type = 'composite' AND is_active = false) AS nb_composite_inactif,
    COUNT(*) FILTER (WHERE product_type != 'composite' AND is_active = true) AS nb_individuels_actifs,
    COUNT(*) FILTER (WHERE product_type != 'composite' AND is_active = false) AS nb_individuels_inactifs
FROM france_products
WHERE restaurant_id = 1
AND category_id = 3;

-- Vérifier que les anciens produits sont désactivés
SELECT
    id,
    name,
    is_active,
    'DÉSACTIVÉ (à supprimer après test)' AS statut
FROM france_products
WHERE restaurant_id = 1
AND category_id = 3
AND id IN (345, 346, 347, 348, 349, 351, 352, 353, 354, 355, 356)
ORDER BY id;

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU
-- ========================================================================
--
-- ✅ 1 produit composite "SANDWICHS" créé
-- ✅ 11 options dans groupe "Plats" (avec compositions)
-- ✅ 12 options dans groupe "Boisson 33CL incluse"
-- ✅ 16 options dans groupe "Sauces"
-- ✅ 2 options dans groupe "Suppléments"
-- ✅ TOTAL: 41 options
-- ✅ Workflow: universal_workflow_v2 (4 steps)
-- ✅ 11 anciens produits désactivés (345-356, sauf 350)
--
-- ========================================================================
