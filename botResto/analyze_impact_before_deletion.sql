-- ANALYSE D'IMPACT AVANT SUPPRESSION DES DOUBLONS
-- ⚠️ NE SUPPRIME RIEN - ANALYSE SEULEMENT

-- 1. Identifier le produit problématique avec ses détails
SELECT 
  p.id,
  p.name,
  p.description,
  p.product_type,
  p.restaurant_id,
  p.is_active
FROM france_products p
WHERE p.id = 201;

-- 2. Analyser TOUTES les tailles du produit 201 (doublons inclus)
SELECT 
  s.id as size_id,
  s.size_name,
  s.price_on_site,
  s.price_delivery,
  s.includes_drink,
  s.display_order,
  'ACTUEL' as status
FROM france_product_sizes s
WHERE s.product_id = 201
ORDER BY s.size_name, s.id;

-- 3. Identifier quels ID seront SUPPRIMÉS (simulation)
WITH duplicates AS (
  SELECT 
    product_id,
    size_name,
    MIN(id) as keep_id,
    ARRAY_AGG(id ORDER BY id) as all_ids
  FROM france_product_sizes 
  WHERE product_id = 201
  GROUP BY product_id, size_name 
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT UNNEST(
    ARRAY_REMOVE(all_ids, keep_id)
  ) as id_to_delete
  FROM duplicates
)
SELECT 
  s.id as size_id,
  s.size_name,
  s.price_on_site,
  s.price_delivery,
  s.includes_drink,
  s.display_order,
  CASE 
    WHEN s.id IN (SELECT id_to_delete FROM to_delete) THEN '❌ SERA SUPPRIMÉ'
    ELSE '✅ SERA CONSERVÉ'
  END as action
FROM france_product_sizes s
WHERE s.product_id = 201
ORDER BY s.size_name, s.id;

-- 4. Vérifier s'il y a des références à ces tailles dans d'autres tables
-- (Par exemple, dans les commandes, paniers, etc.)

-- Chercher dans les tables potentielles qui pourraient référencer les tailles
SELECT 'Vérification des références dans d''autres tables :' as info;

-- Note: Ici il faudrait vérifier toutes les tables qui pourraient référencer
-- les IDs des tailles (commandes, paniers, logs, etc.)

-- 5. Analyser les différences de prix entre doublons
WITH price_analysis AS (
  SELECT 
    size_name,
    COUNT(*) as count,
    MIN(price_on_site) as min_price_on_site,
    MAX(price_on_site) as max_price_on_site,
    MIN(price_delivery) as min_price_delivery,
    MAX(price_delivery) as max_price_delivery,
    CASE 
      WHEN MIN(price_on_site) != MAX(price_on_site) OR 
           MIN(price_delivery) != MAX(price_delivery) 
      THEN '⚠️ PRIX DIFFÉRENTS'
      ELSE '✅ PRIX IDENTIQUES'
    END as price_status
  FROM france_product_sizes
  WHERE product_id = 201
  GROUP BY size_name
)
SELECT 
  size_name,
  count,
  min_price_on_site,
  max_price_on_site,
  min_price_delivery,
  max_price_delivery,
  price_status
FROM price_analysis
ORDER BY size_name;

-- 6. Résumé d'impact
SELECT 
  'RÉSUMÉ D''IMPACT' as section,
  COUNT(*) as total_sizes_actuelles,
  COUNT(*) - COUNT(DISTINCT size_name) as nb_doublons_a_supprimer,
  COUNT(DISTINCT size_name) as sizes_finales_apres_nettoyage
FROM france_product_sizes
WHERE product_id = 201;