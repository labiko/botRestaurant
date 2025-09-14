-- 🔍 VÉRIFICATION: MIRANDA TROPICAL et ses copies

SELECT 
    id,
    name,
    created_at,
    is_active
FROM france_products 
WHERE name ILIKE '%miranda%tropical%'
ORDER BY created_at DESC;