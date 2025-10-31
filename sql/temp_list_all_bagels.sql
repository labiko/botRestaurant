-- Voir tous les produits de la catégorie MENUS BAGELS
SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.display_order,
  p.is_active
FROM france_products p
WHERE p.category_id = 169
  AND p.restaurant_id = 22
ORDER BY p.display_order;
