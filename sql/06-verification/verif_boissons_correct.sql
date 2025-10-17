-- ✅ VÉRIFICATION AVEC LE BON SLUG: ice-cream-desserts-drinks

-- 1. Vérifier la catégorie avec le bon slug
SELECT id, name, slug, is_active, restaurant_id
FROM france_menu_categories 
WHERE slug = 'ice-cream-desserts-drinks' AND restaurant_id = 1;

-- 2. Vérifier les boissons dans cette catégorie 
SELECT 
    p.id, 
    p.name, 
    p.product_type, 
    p.is_active,
    p.price_on_site_base,
    p.price_delivery_base
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'ice-cream-desserts-drinks' 
  AND c.restaurant_id = 1 
  AND p.is_active = true
ORDER BY p.display_order;

-- 3. Vérifier les variants boissons (33CL, 1L5)
SELECT 
    p.name as produit,
    pv.variant_name,
    pv.price_on_site,
    pv.is_active
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'ice-cream-desserts-drinks' 
  AND c.restaurant_id = 1 
  AND pv.is_active = true
ORDER BY p.name, pv.display_order;