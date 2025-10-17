-- 🔍 DIAGNOSTIC SIMPLE TACOS - Les requêtes essentielles uniquement
BEGIN;

-- 1. Workflow complet TACOS (ordre des étapes)
SELECT 
    'WORKFLOW TACOS' as section,
    po.product_id,
    p.name as product_name,
    po.group_order,
    po.option_group,
    COUNT(*) as nb_options,
    BOOL_OR(po.is_required) as is_required
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos'
GROUP BY po.product_id, p.name, po.group_order, po.option_group
ORDER BY po.product_id, po.group_order;

-- 2. Options boisson TACOS
SELECT 
    'OPTIONS BOISSON TACOS' as section,
    po.product_id,
    p.name as product_name,
    po.option_group,
    po.option_name,
    po.group_order,
    po.is_required
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos'
  AND (po.option_group ILIKE '%boisson%' OR po.option_name ILIKE '%coca%' OR po.option_name ILIKE '%sprite%')
ORDER BY po.product_id, po.group_order;

-- 3. Configuration display TACOS
SELECT 
    'CONFIG DISPLAY TACOS' as section,
    pdc.product_id,
    p.name as product_name,
    pdc.template_name,
    pdc.custom_header_text
FROM france_product_display_configs pdc
JOIN france_products p ON pdc.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos';

-- 4. Templates workflow
SELECT 
    'TEMPLATES WORKFLOW' as section,
    wt.template_name,
    wt.steps_config::text as config
FROM france_workflow_templates wt
WHERE wt.template_name ILIKE '%tacos%'
   OR wt.id IN (
       SELECT DISTINCT pdc.template_name::integer 
       FROM france_product_display_configs pdc
       JOIN france_products p ON pdc.product_id = p.id
       JOIN france_menu_categories c ON p.category_id = c.id
       WHERE c.slug = 'tacos' 
       AND pdc.template_name ~ '^[0-9]+$'
   );

COMMIT;