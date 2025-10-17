-- 🔍 VÉRIFICATION SIMPLE : Toutes les boissons avec caractères étranges
SELECT 
    p.id,
    p.name as product_name,
    c.slug as category,
    po.option_name,
    CASE 
        WHEN po.option_name LIKE '%⿡%' OR po.option_name LIKE '%⿢%' OR po.option_name LIKE '%⿣%' 
             OR po.option_name LIKE '%⿤%' OR po.option_name LIKE '%⿥%' OR po.option_name LIKE '%⿦%'
             OR po.option_name LIKE '%⿧%' OR po.option_name LIKE '%⿨%' OR po.option_name LIKE '%⿩%'
             OR po.option_name LIKE '%⿪%' OR po.option_name LIKE '%⿫%' OR po.option_name LIKE '%⿬%'
        THEN '❌ CARACTÈRES ÉTRANGES'
        ELSE '✅ FORMAT OK'
    END as status
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id  
JOIN france_menu_categories c ON p.category_id = c.id
WHERE po.option_group = 'boisson'
ORDER BY p.id, po.display_order;