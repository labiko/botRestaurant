-- Correction des doublons identifiés pour le product_id 201
-- Basé sur les résultats : MENU XL (2), MENU M (2), MENU L (2)

BEGIN;

-- Supprimer les doublons de tailles (garder le premier ID de chaque taille)
WITH duplicates AS (
  SELECT 
    product_id,
    size_name,
    MIN(id) as keep_id,
    ARRAY_AGG(id ORDER BY id) as all_ids
  FROM france_product_sizes 
  WHERE product_id = 201  -- Cibler spécifiquement le produit problématique
  GROUP BY product_id, size_name 
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT UNNEST(
    ARRAY_REMOVE(all_ids, keep_id)
  ) as id_to_delete
  FROM duplicates
)
DELETE FROM france_product_sizes 
WHERE id IN (SELECT id_to_delete FROM to_delete);

-- Vérification : il ne devrait plus y avoir de doublons
SELECT 
  product_id,
  size_name,
  COUNT(*) as count,
  ARRAY_AGG(id ORDER BY id) as remaining_ids
FROM france_product_sizes 
WHERE product_id = 201
GROUP BY product_id, size_name 
ORDER BY size_name;

-- Réorganiser les display_order pour le produit 201
UPDATE france_product_sizes 
SET display_order = subq.new_order
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY size_name) as new_order
  FROM france_product_sizes
  WHERE product_id = 201
) subq
WHERE france_product_sizes.id = subq.id;

-- Vérification finale : afficher toutes les tailles restantes pour le produit 201
SELECT 
  id,
  product_id,
  size_name,
  price_on_site,
  price_delivery,
  includes_drink,
  display_order
FROM france_product_sizes 
WHERE product_id = 201
ORDER BY display_order;

COMMIT;