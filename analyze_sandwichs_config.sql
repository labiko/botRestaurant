-- 🔍 ANALYSE CONFIGURATION SANDWICHS vs TACOS

-- 1. Structure des produits SANDWICHS
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config,
    COUNT(ps.id) as nb_tailles,
    COUNT(pv.id) as nb_variants
FROM france_products p
LEFT JOIN france_product_sizes ps ON ps.product_id = p.id AND ps.is_active = true
LEFT JOIN france_product_variants pv ON pv.product_id = p.id AND pv.is_active = true
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 1 
AND c.slug = 'sandwichs'
GROUP BY p.id, p.name, p.product_type, p.workflow_type, p.requires_steps, p.steps_config
ORDER BY p.name;

-- 2. Comparer avec TACOS
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config,
    COUNT(ps.id) as nb_tailles,
    COUNT(pv.id) as nb_variants
FROM france_products p
LEFT JOIN france_product_sizes ps ON ps.product_id = p.id AND ps.is_active = true
LEFT JOIN france_product_variants pv ON pv.product_id = p.id AND pv.is_active = true
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 1 
AND c.slug = 'tacos'
GROUP BY p.id, p.name, p.product_type, p.workflow_type, p.requires_steps, p.steps_config
ORDER BY p.name;

-- 3. Vérifier les boissons incluses pour TACOS
SELECT 
    ps.id,
    ps.product_id,
    ps.size_name,
    ps.includes_drink,
    ps.price_on_site,
    p.name as product_name
FROM france_product_sizes ps
JOIN france_products p ON p.id = ps.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 1 
AND c.slug = 'tacos'
AND ps.is_active = true;

-- 4. Vérifier si SANDWICHS ont des steps_config
SELECT 
    p.name,
    p.steps_config,
    LENGTH(p.steps_config::text) as config_length
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 1 
AND c.slug = 'sandwichs'
AND p.steps_config IS NOT NULL;