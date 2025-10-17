-- 🔍 VÉRIFICATION DES CONFIGURATIONS COMPOSITES EXISTANTES

-- 1. Voir quels produits sont déjà configurés comme composites
SELECT 
    c.name as categorie,
    p.name as produit,
    p.product_type,
    p.workflow_type,
    p.requires_steps
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.restaurant_id = 1
ORDER BY c.display_order, p.name;

-- 2. Voir les options existantes par produit
SELECT 
    p.name as produit,
    COUNT(DISTINCT po.option_group) as nb_groupes,
    string_agg(DISTINCT po.option_group, ', ' ORDER BY po.option_group) as groupes_options,
    COUNT(po.id) as nb_options_total
FROM france_products p
LEFT JOIN france_product_options po ON po.product_id = p.id
WHERE p.restaurant_id = 1
GROUP BY p.id, p.name
HAVING COUNT(po.id) > 0
ORDER BY p.name;

-- 3. Détail des options par groupe
SELECT 
    p.name as produit,
    po.option_group,
    po.group_order,
    COUNT(*) as nb_options,
    po.is_required,
    po.max_selections
FROM france_products p
JOIN france_product_options po ON po.product_id = p.id
WHERE p.restaurant_id = 1
GROUP BY p.name, po.option_group, po.group_order, po.is_required, po.max_selections
ORDER BY p.name, po.group_order;