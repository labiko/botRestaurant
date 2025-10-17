-- ========================================================================
-- SCRIPT DE MIGRATION - PANINI VERS ARCHITECTURE COMPOSITE
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: PANINI (ID: 17)
--
-- OBJECTIF: Migrer de 5 produits individuels vers 1 produit composite
-- MODÈLE: Architecture OCV (1 produit avec options en groupes)
-- IDs À MIGRER: 187, 188, 189, 190, 191
--
-- ARCHITECTURE CIBLE:
-- - 1 produit composite "PANINI"
-- - Groupe "Plats" : 5 paninis avec prix identique 5.50€
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
    -- Vérifier que la catégorie PANINI existe pour Pizza Yolo
    SELECT COUNT(*) INTO v_category_exists
    FROM france_menu_categories
    WHERE id = 17
    AND restaurant_id = 1
    AND name = 'PANINI';

    IF v_category_exists = 0 THEN
        RAISE EXCEPTION 'ERREUR: Catégorie PANINI (ID: 17) n''existe pas pour Pizza Yolo (ID: 1)';
    END IF;

    -- Vérifier que les 5 produits existent
    SELECT COUNT(*) INTO v_products_count
    FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 17
    AND id IN (187, 188, 189, 190, 191);

    IF v_products_count != 5 THEN
        RAISE EXCEPTION 'ERREUR: Nombre de produits PANINI incorrect! Trouvé: % sur 5', v_products_count;
    END IF;

    RAISE NOTICE 'Vérifications OK - Catégorie et 5 produits PANINI trouvés';
END $$;

-- ========================================================================
-- ÉTAPE 1: CRÉATION DU PRODUIT COMPOSITE "PANINI"
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
    17,                   -- PANINI
    'PANINI',             -- Nom du produit composite
    'composite',          -- Type composite
    'universal_workflow_v2', -- Workflow moderne
    true,                 -- Nécessite des étapes
    '{
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
    AND category_id = 17
    AND name = 'PANINI'
    AND product_type = 'composite'
    AND is_active = true;

    RAISE NOTICE 'Produit composite PANINI créé avec ID: %', v_composite_id;

    -- Stocker l'ID dans une variable temporaire pour les prochaines étapes
    PERFORM set_config('migration.new_product_id', v_composite_id::text, true);
END $$;

-- ========================================================================
-- ÉTAPE 2: CRÉATION DU GROUPE "PLATS" (5 PANINI)
-- ========================================================================

-- Insérer les 5 paninis comme options dans le groupe "Plats"
DO $$
DECLARE
    v_product_id INTEGER;
BEGIN
    v_product_id := current_setting('migration.new_product_id')::INTEGER;

    -- 1. 4 FROMAGES - 5.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', '4 FROMAGES', '🧀', 5.50, 1, true,
            'PAIN PANINI, CRÈME FRAÎCHE, EMMENTAL, BRIE, BLEU, RÂPÉ ITALIEN (SERVI AVEC 1 BOISSON 33CL OFFERTE)');

    -- 2. VIANDE HACHÉE - 5.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'VIANDE HACHÉE', '🥩', 5.50, 2, true,
            'PAIN PANINI, CRÈME FRAÎCHE, VIANDE HACHÉE (SERVI AVEC 1 BOISSON 33CL OFFERTE)');

    -- 3. POULET - 5.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'POULET', '🐔', 5.50, 3, true,
            'PAIN PANINI, SAUCE TOMATE, FROMAGE, POULET (SERVI AVEC 1 BOISSON 33CL OFFERTE)');

    -- 4. SAUMON - 5.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'SAUMON', '🐟', 5.50, 4, true,
            'PAIN PANINI, CRÈME FRAÎCHE, FROMAGE, SAUMON (SERVI AVEC 1 BOISSON 33CL OFFERTE)');

    -- 5. CHÈVRE MIEL - 5.50€
    INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active, composition)
    VALUES (v_product_id, 'Plats', 'CHÈVRE MIEL', '🍯', 5.50, 5, true,
            'PAIN PANINI, CRÈME FRAÎCHE, CHÈVRE, MIEL (SERVI AVEC 1 BOISSON 33CL OFFERTE)');

    RAISE NOTICE '5 paninis ajoutés au groupe Plats';
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

-- Désactiver les 5 anciens produits individuels (NE PAS SUPPRIMER)
UPDATE france_products
SET is_active = false
WHERE restaurant_id = 1
AND category_id = 17
AND id IN (187, 188, 189, 190, 191);

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
AND category_id = 17
AND name = 'PANINI'
AND product_type = 'composite';

-- Vérifier le nombre d'options par groupe
SELECT
    option_group AS "Groupe",
    COUNT(*) AS "Nb options"
FROM france_product_options
WHERE product_id = (
    SELECT id FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 17
    AND name = 'PANINI'
    AND product_type = 'composite'
    LIMIT 1
)
GROUP BY option_group
ORDER BY option_group;

-- Vérifier que les compositions sont présentes
SELECT
    option_name AS "Panini",
    LEFT(composition, 60) AS "Composition (extrait)",
    price_modifier AS "Prix"
FROM france_product_options
WHERE product_id = (
    SELECT id FROM france_products
    WHERE restaurant_id = 1
    AND category_id = 17
    AND name = 'PANINI'
    AND product_type = 'composite'
    LIMIT 1
)
AND option_group = 'Plats'
ORDER BY display_order;

-- Vérifier l'état de la catégorie PANINI
SELECT
    'ÉTAT FINAL PANINI' AS info,
    COUNT(*) AS nb_produits_total,
    COUNT(*) FILTER (WHERE product_type = 'composite' AND is_active = true) AS nb_composite_actif,
    COUNT(*) FILTER (WHERE product_type = 'composite' AND is_active = false) AS nb_composite_inactif,
    COUNT(*) FILTER (WHERE product_type != 'composite' AND is_active = true) AS nb_individuels_actifs,
    COUNT(*) FILTER (WHERE product_type != 'composite' AND is_active = false) AS nb_individuels_inactifs
FROM france_products
WHERE restaurant_id = 1
AND category_id = 17;

-- Vérifier que les anciens produits sont désactivés
SELECT
    id,
    name,
    is_active,
    'DÉSACTIVÉ (à supprimer après test)' AS statut
FROM france_products
WHERE restaurant_id = 1
AND category_id = 17
AND id IN (187, 188, 189, 190, 191)
ORDER BY id;

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU
-- ========================================================================
--
-- ✅ 1 produit composite "PANINI" créé
-- ✅ 5 options dans groupe "Plats" (avec compositions, tous 5.50€)
-- ✅ 12 options dans groupe "Boisson 33CL incluse"
-- ✅ 16 options dans groupe "Sauces"
-- ✅ 2 options dans groupe "Suppléments"
-- ✅ TOTAL: 35 options
-- ✅ Workflow: universal_workflow_v2 (4 steps)
-- ✅ 5 anciens produits désactivés (187-191)
--
-- ========================================================================
