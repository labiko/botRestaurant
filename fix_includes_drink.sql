-- ============================================
-- FIX: Ajouter la colonne includes_drink manquante
-- ============================================

-- 1. Ajouter la colonne includes_drink à france_product_variants
ALTER TABLE france_product_variants 
ADD COLUMN IF NOT EXISTS includes_drink boolean DEFAULT false;

-- 2. Mettre à jour les TACOS taille M pour inclure une boisson
UPDATE france_product_variants
SET includes_drink = true
WHERE product_id IN (
  SELECT id FROM france_products 
  WHERE UPPER(name) LIKE '%TACOS%'
)
AND size_name = 'M';

-- 3. Mettre à jour les TACOS taille L et XL pour inclure une boisson
UPDATE france_product_variants
SET includes_drink = true
WHERE product_id IN (
  SELECT id FROM france_products 
  WHERE UPPER(name) LIKE '%TACOS%'
)
AND size_name IN ('L', 'XL');

-- 4. Vérifier les modifications
SELECT 
  pv.id,
  p.name as product_name,
  pv.size_name,
  pv.includes_drink,
  pv.price_on_site,
  pv.price_delivery
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE p.name LIKE '%TACOS%'
ORDER BY p.name, pv.display_order;

-- 5. Optionnel: Mettre à jour d'autres menus qui devraient inclure des boissons
-- Par exemple, les menus BURGERS taille L/XL
UPDATE france_product_variants
SET includes_drink = true
WHERE product_id IN (
  SELECT id FROM france_products 
  WHERE UPPER(name) LIKE '%BURGER%' 
  OR UPPER(name) LIKE '%MENU%'
)
AND size_name IN ('L', 'XL');

-- 6. Afficher un résumé des produits avec boissons incluses
SELECT 
  COUNT(*) as total_variants_with_drinks,
  STRING_AGG(DISTINCT p.name, ', ') as products_with_drinks
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE pv.includes_drink = true;