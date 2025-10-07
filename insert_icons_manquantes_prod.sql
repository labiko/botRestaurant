-- =========================================================================
-- INSERTION DES ICÔNES MANQUANTES EN PROD
-- DATE: 2025-10-07
-- ⚠️ À EXÉCUTER SUR PROD (vywbhlnzvfqtiurwmrac)
-- =========================================================================
-- DEV contient 61 icônes, PROD contient seulement 50 icônes
-- Ce script ajoute les 11 icônes manquantes (IDs 51-61)
-- =========================================================================

BEGIN;

-- =========================================================================
-- INSERTION DES 11 ICÔNES MANQUANTES
-- =========================================================================

-- ID 51 - Salade
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 51, '🥗', 'Salade', '🍕 Nourriture', ARRAY['salade'], '2025-10-03 09:36:12.566865', '2025-10-03 09:36:12.566865'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 51);

-- ID 52 - Menu Famille
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 52, '👪', 'Menu Famille', 'menus', ARRAY['famille','partage','groupe'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 52);

-- ID 53 - Menu Enfant
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 53, '👶', 'Menu Enfant', 'menus', ARRAY['enfant','kids','petit'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 53);

-- ID 54 - Menu Complet
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 54, '🍽️', 'Menu Complet', 'menus', ARRAY['complet','formule','menu'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 54);

-- ID 55 - Menu Rapide
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 55, '🥪', 'Menu Rapide', 'menus', ARRAY['rapide','express','snack'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 55);

-- ID 56 - Menu Duo
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 56, '💑', 'Menu Duo', 'menus', ARRAY['duo','couple','partage'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 56);

-- ID 57 - Menu Fête
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 57, '🎉', 'Menu Fête', 'menus', ARRAY['fête','célébration','spécial'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 57);

-- ID 58 - Menu Premium
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 58, '⭐', 'Menu Premium', 'menus', ARRAY['premium','luxe','haut-gamme'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 58);

-- ID 59 - Menu Économique
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 59, '💰', 'Menu Économique', 'menus', ARRAY['économique','pas-cher','budget'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 59);

-- ID 60 - Menu Découverte
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 60, '🍱', 'Menu Découverte', 'menus', ARRAY['découverte','dégustation','variété'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 60);

-- ID 61 - Menu du Jour
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
SELECT 61, '🎯', 'Menu du Jour', 'menus', ARRAY['jour','quotidien','spécialité'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664'
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 61);

-- =========================================================================
-- RÉINITIALISER LA SÉQUENCE
-- =========================================================================
SELECT setval('france_icons_id_seq', 61);

-- =========================================================================
-- VÉRIFICATIONS
-- =========================================================================
DO $$
DECLARE
    v_count INT;
    v_missing TEXT := '';
BEGIN
    SELECT COUNT(*) INTO v_count FROM france_icons;

    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 VÉRIFICATION INSERTION ICÔNES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total icônes : % (attendu: 61)', v_count;
    RAISE NOTICE '';

    -- Vérifier chaque icône ajoutée
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 51) THEN
        v_missing := v_missing || '51, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 52) THEN
        v_missing := v_missing || '52, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 53) THEN
        v_missing := v_missing || '53, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 54) THEN
        v_missing := v_missing || '54, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 55) THEN
        v_missing := v_missing || '55, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 56) THEN
        v_missing := v_missing || '56, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 57) THEN
        v_missing := v_missing || '57, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 58) THEN
        v_missing := v_missing || '58, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 59) THEN
        v_missing := v_missing || '59, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 60) THEN
        v_missing := v_missing || '60, ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM france_icons WHERE id = 61) THEN
        v_missing := v_missing || '61, ';
    END IF;

    IF v_missing = '' THEN
        RAISE NOTICE '✅ Toutes les icônes (51-61) ont été ajoutées avec succès';
    ELSE
        RAISE WARNING '⚠️ Icônes manquantes: %', v_missing;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';

    IF v_count = 61 AND v_missing = '' THEN
        RAISE NOTICE '🎉 INSERTION RÉUSSIE !';
        RAISE NOTICE '✅ PROD contient maintenant 61 icônes (identique à DEV)';
        RAISE NOTICE '';
        RAISE NOTICE '👉 Exécutez : COMMIT;';
    ELSE
        RAISE WARNING '⚠️ ATTENTION - Vérifiez les valeurs ci-dessus';
        RAISE WARNING '👉 Si problème, exécutez : ROLLBACK;';
    END IF;

    RAISE NOTICE '========================================';
END $$;

-- =========================================================================
-- VALIDATION MANUELLE
-- =========================================================================
-- ⚠️ Lisez les vérifications ci-dessus, puis décommentez UNE des lignes :

-- Si tout est OK :
-- COMMIT;

-- Si problème :
-- ROLLBACK;
