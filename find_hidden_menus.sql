-- Script pour trouver TOUTES les références à 'menus'

-- 1. Vérifier TOUTES les tables (même privées/système)
SELECT table_schema, table_name, table_type
FROM information_schema.tables
WHERE table_name ILIKE '%menu%'
ORDER BY table_schema, table_name;

-- 2. Vérifier TOUTES les vues
SELECT schemaname, viewname, definition
FROM pg_views
WHERE viewname ILIKE '%menu%';

-- 3. Chercher des ALIAS ou SYNONYMES
SELECT *
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname ILIKE '%menu%';

-- 4. Vérifier les FONCTIONS qui retournent des menus
SELECT routine_name, routine_type, routine_definition
FROM information_schema.routines
WHERE routine_definition ILIKE '%menu%'
  AND routine_type = 'FUNCTION';

-- 5. Vérifier si 'menus' est un alias vers autre chose
SELECT t.tablename, t.schemaname
FROM pg_tables t
WHERE t.tablename ILIKE '%product%' OR t.tablename ILIKE '%menu%';