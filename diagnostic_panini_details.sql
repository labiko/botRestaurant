-- 🔍 DIAGNOSTIC DÉTAILLÉ PANINI
-- Analyser les produits PANINI en détail

BEGIN;

-- 1. Détail des 5 produits PANINI
SELECT
    'DÉTAIL PRODUITS PANINI' as diagnostic,
    p.id,
    p.name,
    p.composition,
    p.price_on_site_base,
    p.price_delivery_base,
    p.is_active,
    p.workflow_type,
    p.product_type,
    p.requires_steps,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'panini' AND p.is_active = true
ORDER BY p.display_order;

-- 2. Vérifier s'il y a des options/workflow pour PANINI
SELECT
    'OPTIONS PRODUITS PANINI' as diagnostic,
    p.name as product_name,
    fpo.option_group,
    fpo.option_name,
    fpo.price_modifier,
    fpo.is_required,
    fpo.display_order,
    fpo.is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'panini' AND p.is_active = true
ORDER BY p.name, fpo.option_group, fpo.display_order;

-- 3. Vérifier steps_config si c'est un produit composite
SELECT
    'STEPS CONFIG PANINI' as diagnostic,
    p.name,
    p.steps_config,
    p.workflow_type,
    p.product_type
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'panini'
AND p.is_active = true
AND p.steps_config IS NOT NULL;

-- 4. Vérifier les tailles/variantes PANINI
SELECT
    'TAILLES PANINI' as diagnostic,
    p.name as product_name,
    fps.size_name,
    fps.price_on_site,
    fps.price_delivery,
    fps.display_order,
    fps.is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_sizes fps ON fps.product_id = p.id
WHERE c.slug = 'panini' AND p.is_active = true
ORDER BY p.name, fps.display_order;

ROLLBACK;