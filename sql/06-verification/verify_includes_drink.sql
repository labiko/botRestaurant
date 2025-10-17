-- Vérification de tous les produits avec includes_drink = true
-- Pour Pizza Yolo 77

-- 1. Vérifier dans france_product_sizes (pour produits modulaires AVEC boisson incluse)
SELECT 
  r.name as restaurant_name,
  c.name as category_name,
  p.name as product_name,
  p.product_type,
  ps.size_name,
  ps.price_on_site,
  ps.price_delivery,
  ps.includes_drink
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
AND ps.includes_drink = true
ORDER BY c.display_order, p.display_order, ps.display_order;

-- 2. Vérifier tous les produits modulaires (pour voir lesquels ont includes_drink)
SELECT 
  r.name as restaurant_name,
  c.name as category_name,
  p.name as product_name,
  p.product_type,
  ps.size_name,
  ps.price_on_site,
  ps.price_delivery,
  ps.includes_drink
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
ORDER BY c.display_order, p.display_order, ps.display_order;

-- 3. Vérifier toutes les boissons disponibles (33CL)
SELECT 
  p.name as product_name,
  pv.variant_name,
  pv.price_on_site,
  pv.price_delivery,
  pv.quantity,
  pv.unit
FROM france_products p
JOIN france_product_variants pv ON p.id = pv.product_id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' 
AND c.slug = 'ice-cream-desserts-drinks'
AND pv.quantity = 33
AND pv.unit = 'cl'
ORDER BY p.name, pv.display_order;