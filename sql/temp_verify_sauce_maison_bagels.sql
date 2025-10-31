-- Vérifier la présence de la sauce MAISON pour tous les bagels
SELECT
  p.id,
  p.name as produit,
  po.option_name as sauce,
  po.display_order,
  po.is_active
FROM france_products p
JOIN france_product_options po ON po.product_id = p.id
WHERE p.category_id = 169
  AND p.restaurant_id = 22
  AND po.option_group = 'Sauce'
  AND UPPER(po.option_name) = 'MAISON'
ORDER BY p.id;

-- Compter combien de produits bagels ont la sauce MAISON
SELECT
  COUNT(DISTINCT p.id) as nb_produits_avec_maison
FROM france_products p
JOIN france_product_options po ON po.product_id = p.id
WHERE p.category_id = 169
  AND p.restaurant_id = 22
  AND po.option_group = 'Sauce'
  AND UPPER(po.option_name) = 'MAISON';

-- Total de produits bagels
SELECT COUNT(*) as total_produits_bagels
FROM france_products
WHERE category_id = 169
  AND restaurant_id = 22;
