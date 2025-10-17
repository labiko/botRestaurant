-- 🔍 DIAGNOSTIC COMPLET BOISSONS
-- Vérification de la disponibilité des boissons pour TACOS

-- 0. VÉRIFIER LES TABLES DISPONIBLES
SELECT 'TABLES DISPONIBLES' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%categor%' 
  OR table_name LIKE '%product%'
  OR table_name LIKE '%drink%'
  OR table_name LIKE '%boisson%'
ORDER BY table_name;

-- 1. ESSAYER AVEC TABLE CORRECTE (peut être product_categories)
SELECT 'VÉRIFICATION CATÉGORIE DRINKS' as check_type;
-- Tenter différents noms de tables
-- SELECT * FROM product_categories WHERE name ILIKE '%drink%' LIMIT 5;
-- SELECT * FROM categories WHERE name ILIKE '%drink%' LIMIT 5;

-- 2. VÉRIFIER STRUCTURE TABLES PRODUITS
SELECT 'STRUCTURE TABLES PRODUITS' as check_type;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name LIKE '%product%'
ORDER BY table_name, ordinal_position;

-- 3. RECHERCHE DIRECTE DANS TOUTES LES TABLES PRODUITS
SELECT 'RECHERCHE PRODUITS BOISSONS' as check_type;
-- À adapter selon les vraies tables trouvées