-- =========================================================================
-- INSERTION DES ICÔNES MANQUANTES EN PROD - VERSION 2 SÉCURISÉE
-- DATE: 2025-10-07
-- ⚠️ À EXÉCUTER SUR PROD (vywbhlnzvfqtiurwmrac)
-- =========================================================================
-- ⚠️ PROTECTION ANTI-DOUBLONS :
-- - ON CONFLICT (id) DO NOTHING sur chaque INSERT
-- - Vérifications avant/après
-- - Aucune modification si l'ID existe déjà
-- =========================================================================

-- Vérifier d'abord ce qui existe
SELECT 'Icônes actuellement en PROD:' as info, COUNT(*) as total FROM france_icons;
SELECT 'Icônes manquantes (51-61):' as info, id FROM generate_series(51, 61) as id
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE france_icons.id = id)
ORDER BY id;

-- =========================================================================
-- INSERTION SÉCURISÉE (ON CONFLICT = pas de doublon possible)
-- =========================================================================

-- ID 51 - Salade
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (51, '🥗', 'Salade', '🍕 Nourriture', ARRAY['salade'], '2025-10-03 09:36:12.566865', '2025-10-03 09:36:12.566865')
ON CONFLICT (id) DO NOTHING;

-- ID 52 - Menu Famille
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (52, '👪', 'Menu Famille', 'menus', ARRAY['famille','partage','groupe'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664')
ON CONFLICT (id) DO NOTHING;

-- ID 53 - Menu Enfant
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (53, '👶', 'Menu Enfant', 'menus', ARRAY['enfant','kids','petit'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664')
ON CONFLICT (id) DO NOTHING;

-- ID 54 - Menu Complet
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (54, '🍽️', 'Menu Complet', 'menus', ARRAY['complet','formule','menu'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664')
ON CONFLICT (id) DO NOTHING;

-- ID 55 - Menu Rapide
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (55, '🥪', 'Menu Rapide', 'menus', ARRAY['rapide','express','snack'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664')
ON CONFLICT (id) DO NOTHING;

-- ID 56 - Menu Duo
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (56, '💑', 'Menu Duo', 'menus', ARRAY['duo','couple','partage'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664')
ON CONFLICT (id) DO NOTHING;

-- ID 57 - Menu Fête
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (57, '🎉', 'Menu Fête', 'menus', ARRAY['fête','célébration','spécial'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664')
ON CONFLICT (id) DO NOTHING;

-- ID 58 - Menu Premium
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (58, '⭐', 'Menu Premium', 'menus', ARRAY['premium','luxe','haut-gamme'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664')
ON CONFLICT (id) DO NOTHING;

-- ID 59 - Menu Économique
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (59, '💰', 'Menu Économique', 'menus', ARRAY['économique','pas-cher','budget'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664')
ON CONFLICT (id) DO NOTHING;

-- ID 60 - Menu Découverte
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (60, '🍱', 'Menu Découverte', 'menus', ARRAY['découverte','dégustation','variété'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664')
ON CONFLICT (id) DO NOTHING;

-- ID 61 - Menu du Jour
INSERT INTO france_icons (id, emoji, name, category, tags, created_at, updated_at)
VALUES (61, '🎯', 'Menu du Jour', 'menus', ARRAY['jour','quotidien','spécialité'], '2025-10-04 10:02:03.861664', '2025-10-04 10:02:03.861664')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- RÉINITIALISER LA SÉQUENCE
-- =========================================================================
SELECT setval('france_icons_id_seq', 61, true);

-- =========================================================================
-- VÉRIFICATION FINALE
-- =========================================================================
SELECT 'Résultat après insertion:' as info, COUNT(*) as total FROM france_icons;
SELECT 'Icônes ajoutées (51-61):' as info, id, name, emoji FROM france_icons WHERE id BETWEEN 51 AND 61 ORDER BY id;
