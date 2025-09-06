-- 🔧 REQUÊTE CORRIGÉE - Vérifier produits dans catégorie DRINKS (ID=14)

SELECT 
    p.id, 
    p.name, 
    p.product_type, 
    p.is_active, 
    p.price_on_site_base,
    p.price_delivery_base
FROM france_products p 
WHERE p.category_id = 14 AND p.is_active = true;

-- ET vérifier les variants de ces produits boissons
SELECT 
    pv.id,
    pv.product_id, 
    pv.variant_name, 
    pv.price_on_site, 
    pv.price_delivery,
    pv.is_active,
    p.name as product_name
FROM france_product_variants pv
JOIN france_products p ON pv.product_id = p.id
WHERE p.category_id = 14 AND p.is_active = true AND pv.is_active = true;