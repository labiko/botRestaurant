-- 🔍 DIAGNOSTIC COMPLET : Pourquoi les boissons ne sont pas proposées pour les TACOS
-- Script pour analyser la configuration des TACOS et des boissons

BEGIN;

-- 1. Vérifier la catégorie TACOS et ses produits
SELECT 
    'CATÉGORIE TACOS' as section,
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    COUNT(p.id) as nb_produits_actifs
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id AND p.is_active = true
WHERE c.slug ILIKE '%tacos%' OR c.name ILIKE '%tacos%'
GROUP BY c.id, c.name, c.slug;

-- 2. Lister tous les produits TACOS avec leurs détails
SELECT 
    'PRODUITS TACOS' as section,
    p.id,
    p.name,
    p.restaurant_id,
    p.is_active,
    p.product_type,
    c.slug as category_slug
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug ILIKE '%tacos%'
ORDER BY p.id;

-- 3. Vérifier les tailles/variantes des TACOS
SELECT 
    'TAILLES TACOS' as section,
    ps.id,
    ps.product_id,
    p.name as product_name,
    ps.size_name,
    ps.includes_drink,
    ps.is_active,
    ps.display_order
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug ILIKE '%tacos%'
ORDER BY ps.product_id, ps.display_order;

-- 4. Vérifier les options de workflow pour les TACOS
SELECT 
    'OPTIONS WORKFLOW TACOS' as section,
    po.id,
    po.product_id,
    p.name as product_name,
    po.option_group,
    po.option_name,
    po.group_order,
    po.display_order,
    po.is_required
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug ILIKE '%tacos%'
ORDER BY po.product_id, po.group_order, po.display_order;

-- 5. Vérifier si il y a des groupes "boisson" dans les options TACOS
SELECT 
    'GROUPES BOISSON TACOS' as section,
    po.product_id,
    p.name as product_name,
    po.option_group,
    COUNT(*) as nb_options_boisson
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug ILIKE '%tacos%'
  AND (po.option_group ILIKE '%boisson%' OR po.option_group ILIKE '%drink%')
GROUP BY po.product_id, p.name, po.option_group;

-- 6. Comparer avec une catégorie qui fonctionne (ex: pizzas)
SELECT 
    'COMPARAISON PIZZAS (référence)' as section,
    po.product_id,
    p.name as product_name,
    po.option_group,
    COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug ILIKE '%pizza%'
  AND (po.option_group ILIKE '%boisson%' OR po.option_group ILIKE '%drink%')
GROUP BY po.product_id, p.name, po.option_group
LIMIT 3;

-- 7. Vérifier les produits avec includes_drink = true
SELECT 
    'PRODUITS AVEC BOISSON INCLUSE' as section,
    ps.product_id,
    p.name as product_name,
    c.slug as category_slug,
    ps.size_name,
    ps.includes_drink,
    ps.price_on_site,
    ps.price_delivery
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE ps.includes_drink = true
ORDER BY c.slug, p.name, ps.size_name;

-- 8. Diagnostic de la logique dans CompositeWorkflowExecutor
SELECT 
    'LOGIQUE WORKFLOW - Étapes prévues pour TACOS' as section,
    po.product_id,
    p.name as product_name,
    po.group_order,
    po.option_group as group_name,
    COUNT(*) as nb_options,
    BOOL_OR(po.is_required) as is_required
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug ILIKE '%tacos%'
GROUP BY po.product_id, p.name, po.group_order, po.option_group
ORDER BY po.product_id, po.group_order;

COMMIT;