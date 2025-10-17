-- 🔍 DIAGNOSTIC WORKFLOW TACOS - Configuration et Templates
-- Script pour analyser la configuration complète du workflow TACOS

BEGIN;

-- 1. Vérifier la configuration d'affichage des produits TACOS
SELECT 
    'CONFIGURATION AFFICHAGE TACOS' as section,
    pdc.id,
    pdc.product_id,
    p.name as product_name,
    pdc.template_name,
    pdc.emoji_icon,
    pdc.custom_header_text,
    pdc.show_ingredients,
    pdc.show_nutrition,
    pdc.created_at
FROM france_product_display_configs pdc
JOIN france_products p ON pdc.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos'
ORDER BY pdc.product_id;

-- 2. Vérifier les templates de workflow utilisés par les TACOS
SELECT 
    'TEMPLATES WORKFLOW TACOS' as section,
    wt.id,
    wt.restaurant_id,
    wt.template_name,
    wt.steps_config,
    wt.is_active,
    wt.created_at
FROM france_workflow_templates wt
WHERE wt.template_name IN (
    SELECT DISTINCT pdc.template_name 
    FROM france_product_display_configs pdc
    JOIN france_products p ON pdc.product_id = p.id
    JOIN france_menu_categories c ON p.category_id = c.id
    WHERE c.slug = 'tacos' AND pdc.template_name IS NOT NULL
)
OR wt.template_name ILIKE '%tacos%';

-- 3. Analyser la configuration steps_config pour show_drink_note
SELECT 
    'ANALYSE SHOW_DRINK_NOTE' as section,
    wt.template_name,
    wt.steps_config::text as config_text,
    CASE 
        WHEN wt.steps_config::text ILIKE '%show_drink_note%' THEN 'TROUVÉ'
        ELSE 'ABSENT'
    END as show_drink_note_status,
    CASE 
        WHEN wt.steps_config::text ILIKE '%"show_drink_note":%true%' THEN 'TRUE'
        WHEN wt.steps_config::text ILIKE '%"show_drink_note":%false%' THEN 'FALSE'
        ELSE 'NON CONFIGURÉ'
    END as show_drink_note_value
FROM france_workflow_templates wt
WHERE wt.template_name IN (
    SELECT DISTINCT pdc.template_name 
    FROM france_product_display_configs pdc
    JOIN france_products p ON pdc.product_id = p.id
    JOIN france_menu_categories c ON p.category_id = c.id
    WHERE c.slug = 'tacos' AND pdc.template_name IS NOT NULL
);

-- 4. Vérifier TOUS les groupes d'options pour les TACOS (ordre chronologique)
SELECT 
    'WORKFLOW COMPLET TACOS' as section,
    po.product_id,
    p.name as product_name,
    po.group_order,
    po.option_group,
    COUNT(*) as nb_options,
    BOOL_OR(po.is_required) as is_required,
    MAX(po.max_selections) as max_selections,
    STRING_AGG(po.option_name, ', ' ORDER BY po.display_order) as all_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos'
GROUP BY po.product_id, p.name, po.group_order, po.option_group
ORDER BY po.product_id, po.group_order;

-- 5. Rechercher spécifiquement les options de boisson pour TACOS
SELECT 
    'OPTIONS BOISSON DÉTAILLÉES TACOS' as section,
    po.id,
    po.product_id,
    p.name as product_name,
    po.option_group,
    po.option_name,
    po.group_order,
    po.display_order,
    po.is_required,
    po.max_selections,
    po.price_adjustment
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos'
  AND (po.option_group ILIKE '%boisson%' 
       OR po.option_group ILIKE '%drink%' 
       OR po.option_name ILIKE '%coca%'
       OR po.option_name ILIKE '%pepsi%'
       OR po.option_name ILIKE '%fanta%'
       OR po.option_name ILIKE '%sprite%'
       OR po.option_name ILIKE '%eau%')
ORDER BY po.product_id, po.group_order, po.display_order;

-- 6. Comparer avec une catégorie qui fonctionne (burgers)
SELECT 
    'COMPARAISON WORKFLOW BURGERS' as section,
    po.product_id,
    p.name as product_name,
    po.group_order,
    po.option_group,
    COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'burgers'
GROUP BY po.product_id, p.name, po.group_order, po.option_group
ORDER BY po.product_id, po.group_order
LIMIT 10;

-- 7. Vérifier les choix "_choice" qui peuvent skipper les étapes
SELECT 
    'CHOIX CONDITIONNELS TACOS' as section,
    po.product_id,
    p.name as product_name,
    po.option_group,
    po.option_name,
    po.group_order,
    CASE 
        WHEN po.option_name ILIKE '%pas de%' OR po.option_name ILIKE '%sans%' THEN 'CHOIX NÉGATIF'
        ELSE 'CHOIX STANDARD'
    END as type_choix
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'tacos'
  AND po.option_group ILIKE '%_choice%'
ORDER BY po.product_id, po.group_order, po.display_order;

-- 8. Diagnostic final : Résumé de la configuration TACOS
SELECT 
    'RÉSUMÉ DIAGNOSTIC TACOS' as section,
    p.id as product_id,
    p.name as product_name,
    COUNT(DISTINCT po.option_group) as nb_groupes_workflow,
    COUNT(DISTINCT CASE WHEN po.option_group ILIKE '%boisson%' THEN po.option_group END) as nb_groupes_boisson,
    COUNT(DISTINCT ps.size_name) as nb_tailles,
    COUNT(DISTINCT CASE WHEN ps.includes_drink = true THEN ps.size_name END) as nb_tailles_avec_boisson,
    COALESCE(pdc.template_name, 'PAS DE TEMPLATE') as template_utilise
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
LEFT JOIN france_product_options po ON p.id = po.product_id
LEFT JOIN france_product_sizes ps ON p.id = ps.product_id
LEFT JOIN france_product_display_configs pdc ON p.id = pdc.product_id
WHERE c.slug = 'tacos'
GROUP BY p.id, p.name, pdc.template_name
ORDER BY p.id;

COMMIT;