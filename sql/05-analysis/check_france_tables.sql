-- Vérification des tables France dans la base de données
SELECT 
  table_name, 
  table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%france%'
ORDER BY table_name;

-- Vérifier également l'existence de la table france_restaurants spécifiquement
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'france_restaurants'
) as france_restaurants_exists;

-- Liste de toutes les tables publiques pour comparaison
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;