-- Vérifier TOUS les produits par catégorie pour Pizza Yolo 77
-- Pour identifier lesquels devraient avoir includes_drink = true

-- 1. Tous les produits par catégorie
SELECT 
  c.name as category_name,
  c.slug as category_slug,
  p.name as product_name,
  p.product_type,
  p.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
ORDER BY c.display_order, p.display_order;

-- 2. Produits avec tailles (modulaires)
SELECT 
  c.name as category_name,
  p.name as product_name,
  p.product_type,
  COUNT(ps.id) as nb_tailles,
  STRING_AGG(ps.size_name || ' (' || ps.price_on_site || '€)', ', ' ORDER BY ps.display_order) as tailles
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
LEFT JOIN france_product_sizes ps ON p.id = ps.product_id
WHERE r.slug = 'pizza-yolo-77'
GROUP BY c.name, p.name, p.product_type, c.display_order, p.display_order
HAVING COUNT(ps.id) > 0
ORDER BY c.display_order, p.display_order;

-- 3. Produits sans tailles (simples/variants/composites)
SELECT 
  c.name as category_name,
  p.name as product_name,
  p.product_type,
  p.price_on_site_base,
  p.price_delivery_base
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
LEFT JOIN france_product_sizes ps ON p.id = ps.product_id
WHERE r.slug = 'pizza-yolo-77'
AND ps.id IS NULL
ORDER BY c.display_order, p.display_order;