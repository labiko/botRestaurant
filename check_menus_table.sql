-- Script pour vérifier l'existence et la structure de la table 'menus'

-- 1. Vérifier l'existence de la table 'menus'
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'menus'
  AND table_schema = 'public';

-- 2. Si elle existe, voir sa structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'menus'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier s'il y a une vue 'menus'
SELECT schemaname, viewname, definition
FROM pg_views
WHERE viewname = 'menus';

-- 4. Compter les enregistrements dans menus
SELECT COUNT(*) as total_menus FROM menus;

-- 5. Voir quelques exemples de la table menus
SELECT * FROM menus LIMIT 3;