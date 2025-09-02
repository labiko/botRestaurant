-- Migration pour ajouter les prix de livraison
-- Date: 2025-09-01

-- Ajouter la nouvelle colonne price_delivery
ALTER TABLE france_product_sizes ADD COLUMN price_delivery numeric;

-- Renommer la colonne existante 
ALTER TABLE france_product_sizes RENAME COLUMN price TO price_on_site;

-- Remplir price_delivery = price_on_site + 1 EUR
UPDATE france_product_sizes 
SET price_delivery = price_on_site + 1.00;

-- Vérification
SELECT 
  id,
  product_id,
  size_name,
  price_on_site,
  price_delivery,
  (price_delivery - price_on_site) as difference
FROM france_product_sizes
ORDER BY product_id, id;