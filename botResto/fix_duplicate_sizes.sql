-- Script de correction des tailles dupliquées
-- ⚠️ À exécuter APRÈS avoir vérifié avec debug_duplicate_sizes.sql

BEGIN;

-- Identifier et corriger les doublons de tailles
WITH duplicates AS (
  SELECT 
    product_id,
    size_name,
    MIN(id) as keep_id,
    ARRAY_AGG(id ORDER BY id) as all_ids
  FROM france_product_sizes 
  GROUP BY product_id, size_name 
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT UNNEST(
    ARRAY_REMOVE(all_ids, keep_id)
  ) as id_to_delete
  FROM duplicates
)
-- Supprimer les doublons (garder le premier)
DELETE FROM france_product_sizes 
WHERE id IN (SELECT id_to_delete FROM to_delete);

-- Vérification après correction
SELECT 
  product_id,
  size_name,
  COUNT(*) as count
FROM france_product_sizes 
GROUP BY product_id, size_name 
HAVING COUNT(*) > 1;

-- Si aucun résultat, c'est que tous les doublons ont été supprimés

COMMIT;

-- Optionnel : Réorganiser les display_order après correction
UPDATE france_product_sizes 
SET display_order = subq.new_order
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY display_order, id) as new_order
  FROM france_product_sizes
) subq
WHERE france_product_sizes.id = subq.id;