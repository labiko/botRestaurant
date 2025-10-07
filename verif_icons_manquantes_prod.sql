-- =========================================================================
-- VÉRIFICATION DES ICÔNES MANQUANTES EN PROD
-- DATE: 2025-10-07
-- ⚠️ À EXÉCUTER SUR PROD (vywbhlnzvfqtiurwmrac)
-- =========================================================================
-- Ce script NE FAIT AUCUNE MODIFICATION
-- Il affiche uniquement ce qui manque en PROD par rapport à DEV
-- =========================================================================

-- 1. Compter total icônes en PROD
SELECT 'Total icônes actuellement en PROD:' as info, COUNT(*) as count FROM france_icons;

-- 2. Lister les IDs manquants entre 51 et 61
SELECT
  'IDs manquants en PROD:' as info,
  id as id_manquant
FROM generate_series(51, 61) as id
WHERE NOT EXISTS (SELECT 1 FROM france_icons WHERE france_icons.id = id)
ORDER BY id;

-- 3. Lister les icônes qui EXISTENT déjà (51-61)
SELECT
  'IDs déjà présents (51-61):' as info,
  id,
  name,
  emoji
FROM france_icons
WHERE id BETWEEN 51 AND 61
ORDER BY id;

-- 4. Comparer avec la liste complète attendue de DEV
SELECT
  expected.id,
  expected.name,
  expected.emoji,
  CASE
    WHEN EXISTS (SELECT 1 FROM france_icons WHERE france_icons.id = expected.id)
    THEN '✅ Existe'
    ELSE '❌ Manquant'
  END as status
FROM (VALUES
  (51, 'Salade', '🥗'),
  (52, 'Menu Famille', '👪'),
  (53, 'Menu Enfant', '👶'),
  (54, 'Menu Complet', '🍽️'),
  (55, 'Menu Rapide', '🥪'),
  (56, 'Menu Duo', '💑'),
  (57, 'Menu Fête', '🎉'),
  (58, 'Menu Premium', '⭐'),
  (59, 'Menu Économique', '💰'),
  (60, 'Menu Découverte', '🍱'),
  (61, 'Menu du Jour', '🎯')
) AS expected(id, name, emoji)
ORDER BY expected.id;

-- =========================================================================
-- RÉSUMÉ
-- =========================================================================
SELECT
  '📊 RÉSUMÉ' as info,
  (SELECT COUNT(*) FROM france_icons) as total_prod,
  61 as total_attendu,
  61 - (SELECT COUNT(*) FROM france_icons) as manquants;
