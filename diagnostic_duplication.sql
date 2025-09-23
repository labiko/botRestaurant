-- 🔍 DIAGNOSTIC DUPLICATION RESTAURANT LE CARREMAN
-- ===================================================

-- 1. Vérifier les restaurants avec nom similaire
SELECT
  id, name, slug, city,
  created_at, updated_at
FROM france_restaurants
WHERE LOWER(name) LIKE '%carreman%'
   OR LOWER(name) LIKE '%careman%'
ORDER BY id;

-- 2. Compter les produits par restaurant similaire
SELECT
  r.id, r.name,
  COUNT(p.id) as nb_produits
FROM france_restaurants r
LEFT JOIN france_products p ON p.restaurant_id = r.id
WHERE LOWER(r.name) LIKE '%carreman%'
   OR LOWER(r.name) LIKE '%careman%'
GROUP BY r.id, r.name
ORDER BY r.id;

-- 3. Identifier les doublons de produits
SELECT
  name, restaurant_id,
  COUNT(*) as occurrences,
  STRING_AGG(id::text, ', ') as product_ids
FROM france_products
WHERE restaurant_id IN (
  SELECT id FROM france_restaurants
  WHERE LOWER(name) LIKE '%carreman%' OR LOWER(name) LIKE '%careman%'
)
GROUP BY name, restaurant_id
HAVING COUNT(*) > 1
ORDER BY name;

-- 4. Vérifier les catégories dupliquées
SELECT
  name, restaurant_id,
  COUNT(*) as occurrences,
  STRING_AGG(id::text, ', ') as category_ids
FROM france_menu_categories
WHERE restaurant_id IN (
  SELECT id FROM france_restaurants
  WHERE LOWER(name) LIKE '%carreman%' OR LOWER(name) LIKE '%careman%'
)
GROUP BY name, restaurant_id
HAVING COUNT(*) > 1
ORDER BY name;

-- 5. Analyser l'historique des IDs pour Le Carreman
SELECT
  'restaurants' as table_name,
  id, name, created_at
FROM france_restaurants
WHERE LOWER(name) LIKE '%carreman%'

UNION ALL

SELECT
  'categories' as table_name,
  c.id, c.name, c.created_at
FROM france_menu_categories c
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE LOWER(r.name) LIKE '%carreman%'
ORDER BY table_name, id;