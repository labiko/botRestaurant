-- Vérifier l'existence de la table restaurant_categories
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'restaurant_categories'
  AND table_schema = 'public';

-- Vérifier aussi toutes les tables qui contiennent "categories"
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name ILIKE '%categor%'
  AND table_schema = 'public';

-- Vérifier aussi toutes les tables qui contiennent "restaurant"
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name ILIKE '%restaurant%'
  AND table_schema = 'public';