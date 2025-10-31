-- Vérifier les options du groupe "Choix Bagel" pour DELICE (855)
SELECT
  option_group,
  option_name,
  price_modifier,
  display_order,
  is_active
FROM france_product_options
WHERE product_id = 855
  AND option_group = 'Choix Bagel'
ORDER BY display_order;

-- Vérifier pour TOUS les produits bagels
SELECT
  p.id,
  p.name as produit,
  po.option_name as choix_bagel,
  po.price_modifier,
  po.display_order
FROM france_products p
JOIN france_product_options po ON po.product_id = p.id
WHERE p.id IN (851, 852, 853, 854, 855, 856)
  AND po.option_group = 'Choix Bagel'
ORDER BY p.id, po.display_order;
