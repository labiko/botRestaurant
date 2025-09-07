-- Script pour identifier et corriger les tailles dupliquées
-- Utilisé pour résoudre le problème des menus affichés en double

-- 1. Identifier les tailles dupliquées pour un même produit
SELECT 
  product_id,
  size_name,
  COUNT(*) as count,
  ARRAY_AGG(id ORDER BY id) as size_ids,
  ARRAY_AGG(price_on_site ORDER BY id) as prices_on_site,
  ARRAY_AGG(price_delivery ORDER BY id) as prices_delivery
FROM france_product_sizes 
GROUP BY product_id, size_name 
HAVING COUNT(*) > 1
ORDER BY product_id, size_name;

-- 2. Voir les détails des produits avec des tailles dupliquées
WITH duplicates AS (
  SELECT 
    product_id,
    size_name,
    COUNT(*) as count
  FROM france_product_sizes 
  GROUP BY product_id, size_name 
  HAVING COUNT(*) > 1
)
SELECT 
  p.id,
  p.name as product_name,
  p.product_type,
  s.id as size_id,
  s.size_name,
  s.price_on_site,
  s.price_delivery,
  s.includes_drink,
  s.display_order
FROM france_products p
JOIN france_product_sizes s ON p.id = s.product_id
WHERE p.id IN (SELECT product_id FROM duplicates)
ORDER BY p.id, s.size_name, s.id;

-- 3. Identifier les produits suspects (nom contenant "TACOS")
SELECT 
  p.id,
  p.name as product_name,
  p.product_type,
  COUNT(s.id) as size_count
FROM france_products p
LEFT JOIN france_product_sizes s ON p.id = s.product_id
WHERE UPPER(p.name) LIKE '%TACOS%' OR UPPER(p.description) LIKE '%TACOS%'
GROUP BY p.id, p.name, p.product_type
ORDER BY p.id;

-- 4. Voir toutes les tailles du produit TACOS suspect
SELECT 
  p.name as product_name,
  s.id,
  s.size_name,
  s.price_on_site,
  s.price_delivery,
  s.includes_drink,
  s.display_order
FROM france_products p
JOIN france_product_sizes s ON p.id = s.product_id
WHERE UPPER(p.name) LIKE '%TACOS%'
ORDER BY p.id, s.display_order, s.id;