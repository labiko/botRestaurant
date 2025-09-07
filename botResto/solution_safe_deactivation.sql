-- SOLUTION SÛRE : DÉSACTIVER LES DOUBLONS AU LIEU DE LES SUPPRIMER
-- Garde l'intégrité référentielle tout en résolvant l'affichage

-- D'abord, ajouter une colonne is_active si elle n'existe pas
-- (Vérifier d'abord si la colonne existe)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'france_product_sizes' 
  AND column_name = 'is_active';

-- Si la colonne n'existe pas, l'ajouter :
-- ALTER TABLE france_product_sizes ADD COLUMN is_active BOOLEAN DEFAULT true;

-- SOLUTION : Désactiver les doublons (garder le premier de chaque nom)
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
to_deactivate AS (
  SELECT UNNEST(
    ARRAY_REMOVE(all_ids, keep_id)
  ) as id_to_deactivate
  FROM duplicates
)
-- Marquer les doublons comme inactifs au lieu de les supprimer
UPDATE france_product_sizes 
SET is_active = false
WHERE id IN (SELECT id_to_deactivate FROM to_deactivate);

-- Vérification
SELECT 
  'APRÈS DÉSACTIVATION' as section,
  s.id,
  s.size_name,
  s.price_on_site,
  s.price_delivery,
  s.is_active,
  CASE 
    WHEN s.is_active THEN '✅ ACTIF'
    ELSE '❌ DÉSACTIVÉ'
  END as status
FROM france_product_sizes s
WHERE s.product_id = 201
ORDER BY s.size_name, s.id;