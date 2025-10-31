-- Vérifier la catégorie MENUS BAGELS
SELECT
  id,
  name,
  slug,
  display_order,
  is_active
FROM france_menu_categories
WHERE restaurant_id = 22
  AND id = 169;

-- Lister les produits dans MENUS BAGELS
SELECT
  p.id,
  p.name,
  p.description,
  p.base_price,
  p.price_on_site_base,
  p.price_delivery_base,
  p.workflow_type,
  p.requires_steps,
  p.is_active
FROM france_products p
WHERE p.category_id = 169
  AND p.restaurant_id = 22
ORDER BY p.display_order;
