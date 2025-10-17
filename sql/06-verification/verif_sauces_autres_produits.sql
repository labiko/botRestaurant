-- 🔍 VÉRIFIER - Quels produits ont des sauces configurées ?

SELECT 'PRODUITS AVEC SAUCES' as verification;
SELECT 
    p.name as produit,
    p.product_type,
    po.option_group,
    COUNT(*) as nb_sauces,
    MAX(po.max_selections) as max_selections_actuel,
    CASE 
        WHEN MAX(po.max_selections) = 1 THEN '❌ 1 sauce seulement'
        WHEN MAX(po.max_selections) = 2 THEN '✅ 2 sauces possibles'
        ELSE '🔢 ' || MAX(po.max_selections) || ' sauces'
    END as config_actuelle
FROM france_products p
JOIN france_product_options po ON p.id = po.product_id
WHERE po.option_group = 'sauce' 
  AND p.restaurant_id = 1
GROUP BY p.id, p.name, p.product_type, po.option_group
ORDER BY p.name;