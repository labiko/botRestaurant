-- Vérifier pourquoi des catégories manquent

-- 1. Toutes les catégories créées pour Pizza Yolo 77
SELECT 
  c.name,
  c.slug,
  c.icon,
  c.display_order,
  c.is_active,
  COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
GROUP BY c.name, c.slug, c.icon, c.display_order, c.is_active
ORDER BY c.display_order;

-- 2. Vérifier s'il y a des produits dans les catégories manquantes
SELECT 
  c.name as category_name,
  c.slug,
  c.is_active,
  p.name as product_name,
  p.is_active as product_active
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id  
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND c.slug IN ('smashs', 'assiettes', 'naans', 'poulet-snacks')
ORDER BY c.display_order, p.display_order;