-- 🔍 DEBUG PRIX TACOS - Vérification des données price dans france_product_sizes

-- 1. Vérifier le produit TACOS et ses tailles
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.price_on_site_base,
    p.price_delivery_base,
    p.base_price,
    COUNT(ps.id) as nb_tailles
FROM france_products p
LEFT JOIN france_product_sizes ps ON ps.product_id = p.id AND ps.is_active = true
WHERE p.restaurant_id = 1 
AND p.name ILIKE '%tacos%'
GROUP BY p.id, p.name, p.price_on_site_base, p.price_delivery_base, p.base_price;

-- 2. Vérifier les détails des tailles TACOS
SELECT 
    ps.id,
    ps.product_id,
    ps.size_name,
    ps.price_on_site,
    ps.price_delivery,
    ps.is_active,
    p.name as product_name
FROM france_product_sizes ps
JOIN france_products p ON p.id = ps.product_id
WHERE p.restaurant_id = 1 
AND p.name ILIKE '%tacos%'
AND ps.is_active = true
ORDER BY ps.size_name;

-- 3. Vérifier les types de données des colonnes prix
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'france_product_sizes' 
AND column_name IN ('price_on_site', 'price_delivery')
ORDER BY column_name;

-- 4. Test de parsing des prix
SELECT 
    ps.size_name,
    ps.price_on_site,
    ps.price_delivery,
    ps.price_on_site::text as price_text,
    CASE 
        WHEN ps.price_on_site IS NULL THEN 'NULL'
        WHEN ps.price_on_site::text = '' THEN 'EMPTY'
        ELSE 'HAS_VALUE'
    END as price_status
FROM france_product_sizes ps
JOIN france_products p ON p.id = ps.product_id
WHERE p.restaurant_id = 1 
AND p.name ILIKE '%tacos%'
AND ps.is_active = true
ORDER BY ps.size_name;