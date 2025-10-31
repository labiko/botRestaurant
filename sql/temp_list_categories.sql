-- Lister toutes les catégories Plan B Melun
SELECT
  id,
  name,
  slug,
  display_order,
  is_active
FROM france_menu_categories
WHERE restaurant_id = 22
ORDER BY display_order;
