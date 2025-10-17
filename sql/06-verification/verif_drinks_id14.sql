-- ✅ VÉRIFICATION DIRECTE CATÉGORIE DRINKS (ID=14)

-- 1. Compter les produits dans DRINKS (ID=14)
SELECT COUNT(*) as nb_produits_drinks
FROM france_products 
WHERE category_id = 14;

-- 2. Voir TOUS les produits dans DRINKS (même inactifs)
SELECT 
    p.id, 
    p.name, 
    p.product_type, 
    p.is_active,
    p.price_on_site_base,
    p.price_delivery_base,
    p.display_order
FROM france_products p
WHERE p.category_id = 14
ORDER BY p.display_order;

-- 3. Voir TOUS les variants dans DRINKS
SELECT 
    p.name as produit,
    pv.variant_name,
    pv.price_on_site,
    pv.is_active
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE p.category_id = 14
ORDER BY p.name, pv.display_order;

-- 4. Vérifier si le script a été exécuté en cherchant "COCA COLA" spécifiquement
SELECT 
    p.id, 
    p.name, 
    p.category_id,
    c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name = 'COCA COLA';