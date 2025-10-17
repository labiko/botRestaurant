-- ========================================================================
-- SCRIPT DE MIGRATION - BOWLS VERS UNIVERSAL_WORKFLOW_V2
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: BOWLS (ID: 21)
--
-- OBJECTIF: Migrer de composite_workflow vers universal_workflow_v2
-- PRODUIT EXISTANT: BOWLS (ID: 238)
--
-- ARCHITECTURE ACTUELLE:
-- - 1 produit composite avec composite_workflow
-- - 20 options: 6 viandes + 12 boissons + 2 suppléments
--
-- ARCHITECTURE CIBLE:
-- - 1 produit composite avec universal_workflow_v2
-- - Groupe "Plats" : 6 viandes (renommé de "Choix viande")
-- - Groupe "Sauces" : 16 sauces (NOUVEAU)
-- - Groupe "Boisson 33CL incluse" : 12 boissons
-- - Groupe "Suppléments" : Potatoes, Frites (+1€, remplace anciens)
-- - TOTAL: 36 options
-- - Workflow: ORDRE PERSONNALISÉ (Plats → Sauces → Boissons → Suppléments)
--
-- ⚠️ PARTICULARITÉ: Ordre différent des autres catégories !
-- ========================================================================

BEGIN;

-- ========================================================================
-- VÉRIFICATIONS DE SÉCURITÉ
-- ========================================================================

DO $$
DECLARE
    v_product_exists INTEGER;
    v_current_workflow TEXT;
    v_sauces_exists INTEGER;
BEGIN
    -- Vérifier que le produit BOWL existe
    SELECT COUNT(*), MAX(workflow_type) INTO v_product_exists, v_current_workflow
    FROM france_products
    WHERE id = 238
    AND restaurant_id = 1
    AND category_id = 21
    AND name = 'BOWL';

    IF v_product_exists = 0 THEN
        RAISE EXCEPTION 'ERREUR: Produit BOWLS (ID: 238) n''existe pas!';
    END IF;

    -- Vérifier que le groupe "Sauces" n'existe pas déjà (éviter doublons)
    SELECT COUNT(*) INTO v_sauces_exists
    FROM france_product_options
    WHERE product_id = 238
    AND option_group = 'Sauces';

    IF v_sauces_exists > 0 THEN
        RAISE EXCEPTION 'ERREUR: Le groupe Sauces existe déjà! Script déjà exécuté? Trouvé % sauces.', v_sauces_exists;
    END IF;

    RAISE NOTICE 'Vérifications OK - Produit BOWLS trouvé avec workflow: %', v_current_workflow;
END $$;

-- ========================================================================
-- AFFICHAGE ÉTAT ACTUEL AVANT MODIFICATION (pour traçabilité)
-- ========================================================================

-- Afficher le produit BOWLS actuel
SELECT
    'ÉTAT ACTUEL BOWLS - AVANT MIGRATION' AS info,
    id,
    name,
    product_type,
    workflow_type,
    requires_steps,
    price_on_site_base,
    is_active
FROM france_products
WHERE id = 238
AND restaurant_id = 1;

-- Afficher les options actuelles par groupe
SELECT
    option_group AS "Groupe actuel",
    COUNT(*) AS "Nb options",
    STRING_AGG(option_name, ', ' ORDER BY display_order) AS "Liste options"
FROM france_product_options
WHERE product_id = 238
GROUP BY option_group
ORDER BY option_group;

-- Afficher les suppléments qui vont être supprimés
SELECT
    option_name AS "Supplément à supprimer",
    price_modifier AS "Prix actuel",
    'VA ÊTRE SUPPRIMÉ' AS statut
FROM france_product_options
WHERE product_id = 238
AND option_group = 'Suppléments'
ORDER BY display_order;

-- ========================================================================
-- ÉTAPE 1: UPDATE DU PRODUIT BOWLS VERS UNIVERSAL_WORKFLOW_V2
-- ========================================================================

-- Mettre à jour le workflow du produit BOWLS existant
UPDATE france_products
SET
    workflow_type = 'universal_workflow_v2',
    requires_steps = true,
    steps_config = '{
        "steps": [
            {
                "step": 1,
                "type": "options_selection",
                "prompt": "Choisissez votre viande",
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
WHERE id = 238
AND restaurant_id = 1;

-- ========================================================================
-- ÉTAPE 2: RENOMMER LE GROUPE "Choix viande" EN "Plats"
-- ========================================================================

UPDATE france_product_options
SET option_group = 'Plats'
WHERE product_id = 238
AND option_group = 'Choix viande';

-- ========================================================================
-- ÉTAPE 3: AJOUTER LE GROUPE "SAUCES" (16 SAUCES)
-- ========================================================================

-- Insérer les 16 sauces (identique aux autres catégories)
INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
VALUES
    (238, 'Sauces', 'Mayonnaise', '🍳', 0, 1, true),
    (238, 'Sauces', 'Ketchup', '🍅', 0, 2, true),
    (238, 'Sauces', 'Algérienne', '🌶️', 0, 3, true),
    (238, 'Sauces', 'Poivre', '⚫', 0, 4, true),
    (238, 'Sauces', 'Curry', '🍛', 0, 5, true),
    (238, 'Sauces', 'Samouraï', '🔥', 0, 6, true),
    (238, 'Sauces', 'Harissa', '🌶️', 0, 7, true),
    (238, 'Sauces', 'Blanche', '⚪', 0, 8, true),
    (238, 'Sauces', 'Biggy', '🍔', 0, 9, true),
    (238, 'Sauces', 'Barbecue (BBQ)', '🍖', 0, 10, true),
    (238, 'Sauces', 'Chili Thaï', '🌶️', 0, 11, true),
    (238, 'Sauces', 'Andalouse', '🍅', 0, 12, true),
    (238, 'Sauces', 'Moutarde', '🌾', 0, 13, true),
    (238, 'Sauces', 'Fromagère', '🧀', 0, 14, true),
    (238, 'Sauces', 'Burger', '🍔', 0, 15, true),
    (238, 'Sauces', 'Tomate', '🍅', 0, 16, true);

-- ========================================================================
-- ÉTAPE 4: REMPLACER LES ANCIENS SUPPLÉMENTS
-- ========================================================================

-- Supprimer les anciens suppléments ("Pas de suppléments", "Ajouter des suppléments")
DELETE FROM france_product_options
WHERE product_id = 238
AND option_group = 'Suppléments';

-- Ajouter les nouveaux suppléments standards (identique aux autres catégories)
INSERT INTO france_product_options (product_id, option_group, option_name, icon, price_modifier, display_order, is_active)
VALUES
    (238, 'Suppléments', 'Potatoes', '🍟', 1.00, 1, true),
    (238, 'Suppléments', 'Frites maison', '🍟', 1.00, 2, true);

-- ========================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ========================================================================

-- Vérifier le produit BOWLS mis à jour
SELECT
    'PRODUIT BOWLS MIS À JOUR' AS info,
    id,
    name,
    product_type,
    workflow_type,
    requires_steps,
    price_on_site_base,
    is_active
FROM france_products
WHERE id = 238;

-- Vérifier le nombre d'options par groupe
SELECT
    option_group AS "Groupe",
    COUNT(*) AS "Nb options"
FROM france_product_options
WHERE product_id = 238
GROUP BY option_group
ORDER BY
    CASE option_group
        WHEN 'Plats' THEN 1
        WHEN 'Sauces' THEN 2
        WHEN 'Boisson 33CL incluse' THEN 3
        WHEN 'Suppléments' THEN 4
        ELSE 5
    END;

-- Vérifier les 6 viandes du groupe "Plats"
SELECT
    option_name AS "Viande",
    price_modifier AS "Prix",
    display_order AS "Ordre"
FROM france_product_options
WHERE product_id = 238
AND option_group = 'Plats'
ORDER BY display_order;

-- Vérifier les 16 sauces ajoutées
SELECT
    COUNT(*) AS "Nb sauces ajoutées",
    STRING_AGG(option_name, ', ' ORDER BY display_order) AS "Liste sauces"
FROM france_product_options
WHERE product_id = 238
AND option_group = 'Sauces';

-- Vérifier les nouveaux suppléments
SELECT
    option_name AS "Supplément",
    price_modifier AS "Prix (+)",
    display_order AS "Ordre"
FROM france_product_options
WHERE product_id = 238
AND option_group = 'Suppléments'
ORDER BY display_order;

-- Vérifier que les boissons sont intactes
SELECT
    COUNT(*) AS "Nb boissons",
    STRING_AGG(option_name, ', ' ORDER BY display_order) AS "Liste boissons"
FROM france_product_options
WHERE product_id = 238
AND option_group = 'Boisson 33CL incluse';

-- Afficher le résumé final
SELECT
    'RÉSUMÉ FINAL BOWLS' AS info,
    (SELECT COUNT(*) FROM france_product_options WHERE product_id = 238) AS total_options,
    (SELECT COUNT(*) FROM france_product_options WHERE product_id = 238 AND option_group = 'Plats') AS nb_plats,
    (SELECT COUNT(*) FROM france_product_options WHERE product_id = 238 AND option_group = 'Sauces') AS nb_sauces,
    (SELECT COUNT(*) FROM france_product_options WHERE product_id = 238 AND option_group = 'Boisson 33CL incluse') AS nb_boissons,
    (SELECT COUNT(*) FROM france_product_options WHERE product_id = 238 AND option_group = 'Suppléments') AS nb_supplements;

-- Afficher la configuration des steps
SELECT
    id,
    workflow_type,
    steps_config
FROM france_products
WHERE id = 238;

-- Si tout est OK, valider
COMMIT;

-- En cas de problème, annuler avec: ROLLBACK;

-- ========================================================================
-- RÉSULTAT ATTENDU
-- ========================================================================
--
-- ✅ Produit BOWLS (ID: 238) mis à jour vers universal_workflow_v2
-- ✅ Groupe "Plats" : 6 viandes (renommé de "Choix viande")
-- ✅ Groupe "Sauces" : 16 sauces (NOUVEAU)
-- ✅ Groupe "Boisson 33CL incluse" : 12 boissons (inchangé)
-- ✅ Groupe "Suppléments" : 2 options (Potatoes, Frites maison +1€)
-- ✅ TOTAL: 36 options (6 + 16 + 12 + 2)
-- ✅ Workflow: ORDRE PERSONNALISÉ
--    Step 1: Plats (viandes)
--    Step 2: Sauces (optionnel)
--    Step 3: Boisson 33CL incluse
--    Step 4: Suppléments (optionnel)
--
-- ⚠️ NOTE: Cet ordre est différent des 7 autres catégories migrées !
-- ========================================================================
