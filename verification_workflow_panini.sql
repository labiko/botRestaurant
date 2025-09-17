-- 🔍 VÉRIFICATION WORKFLOW PANINI ACTUEL
-- Comparer avec BOWL qui fonctionne

BEGIN;

-- 1. Vérifier la configuration workflow des produits PANINI
SELECT
    'WORKFLOW PANINI ACTUEL' as diagnostic,
    p.name,
    p.workflow_type,
    p.product_type,
    p.requires_steps,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'panini' AND p.is_active = true;

-- 2. Comparer avec BOWL qui fonctionne (pour référence)
SELECT
    'WORKFLOW BOWL RÉFÉRENCE' as diagnostic,
    p.name,
    p.workflow_type,
    p.product_type,
    p.requires_steps,
    p.steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'bowls' AND p.name = 'BOWL';

-- 3. Vérifier les options actuelles des produits PANINI
SELECT
    'OPTIONS PANINI ACTUELLES' as diagnostic,
    p.name as product_name,
    fpo.option_group,
    fpo.option_name,
    fpo.price_modifier,
    fpo.is_required,
    fpo.group_order,
    fpo.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options fpo ON fpo.product_id = p.id
WHERE c.slug = 'panini' AND p.is_active = true
ORDER BY p.name, fpo.group_order, fpo.display_order;

-- 4. Lister tous les produits PANINI pour savoir lesquels configurer
SELECT
    'PRODUITS PANINI À CONFIGURER' as diagnostic,
    p.id,
    p.name,
    p.price_on_site_base,
    p.price_delivery_base,
    p.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'panini' AND p.is_active = true
ORDER BY p.display_order;

ROLLBACK;