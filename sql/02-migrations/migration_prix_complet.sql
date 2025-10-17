-- Migration complète pour ajouter prix livraison à TOUS les produits
-- Date: 2025-09-01

-- ============================================
-- 1. TABLE france_products (produits simples)
-- ============================================

-- Ajouter les nouvelles colonnes
ALTER TABLE france_products ADD COLUMN price_on_site_base numeric;
ALTER TABLE france_products ADD COLUMN price_delivery_base numeric;

-- Migrer base_price vers price_on_site_base
UPDATE france_products 
SET price_on_site_base = base_price
WHERE base_price IS NOT NULL;

-- Calculer price_delivery_base = price_on_site_base + 1.00
UPDATE france_products 
SET price_delivery_base = price_on_site_base + 1.00
WHERE price_on_site_base IS NOT NULL;

-- ============================================
-- 2. TABLE france_product_variants 
-- ============================================

-- Renommer colonne existante
ALTER TABLE france_product_variants RENAME COLUMN price TO price_on_site;

-- Ajouter nouvelle colonne
ALTER TABLE france_product_variants ADD COLUMN price_delivery numeric;

-- Calculer price_delivery = price_on_site + 1.00
UPDATE france_product_variants 
SET price_delivery = price_on_site + 1.00;

-- ============================================
-- 3. TABLE france_product_sizes (déjà fait)
-- ============================================
-- Cette table a déjà été modifiée dans la migration précédente

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Vérifier france_products
SELECT 
  'france_products' as table_name,
  name,
  base_price as ancien_prix,
  price_on_site_base,
  price_delivery_base,
  (price_delivery_base - price_on_site_base) as difference
FROM france_products
WHERE price_on_site_base IS NOT NULL
ORDER BY id
LIMIT 10;

-- Vérifier france_product_variants
SELECT 
  'france_product_variants' as table_name,
  variant_name,
  price_on_site,
  price_delivery,
  (price_delivery - price_on_site) as difference
FROM france_product_variants
ORDER BY id
LIMIT 10;

-- Vérifier france_product_sizes
SELECT 
  'france_product_sizes' as table_name,
  size_name,
  price_on_site,
  price_delivery,
  (price_delivery - price_on_site) as difference
FROM france_product_sizes
ORDER BY id
LIMIT 10;