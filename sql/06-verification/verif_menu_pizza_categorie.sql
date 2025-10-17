-- 🔍 VÉRIFICATION URGENTE - Contenu de la catégorie "Menu Pizza"
-- Peut-être que les pizzas sont dans Menu Pizza et pas dans Pizzas

SELECT 'PRODUITS DANS MENU PIZZA' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.is_active,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'menus' 
  AND c.restaurant_id = 1
  AND p.is_active = true
ORDER BY p.display_order
LIMIT 20;