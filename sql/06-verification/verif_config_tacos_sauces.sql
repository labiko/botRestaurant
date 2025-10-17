-- 🔍 VÉRIFICATION CONFIGURATION TACOS - SAUCES
-- Analyser pourquoi les sauces ne sont pas proposées après la viande

BEGIN;

-- 1. Identifier le produit TACOS
SELECT 'PRODUIT TACOS' as verification;
SELECT id, name, product_type, workflow_type, requires_steps 
FROM france_products 
WHERE name ILIKE '%TACOS%' AND restaurant_id = 1;

-- 2. Vérifier TOUTES les options configurées pour TACOS
SELECT 'OPTIONS TACOS - TOUTES' as verification;
SELECT 
    po.id,
    po.option_group,
    po.option_name,
    po.is_required,
    po.group_order,
    po.max_selections,
    po.price_modifier,
    po.display_order
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%TACOS%' AND p.restaurant_id = 1
ORDER BY po.group_order, po.display_order;

-- 3. Vérifier spécifiquement les VIANDES (group_order = 1)
SELECT 'OPTIONS TACOS - VIANDES (group_order=1)' as verification;
SELECT 
    po.option_group,
    po.option_name,
    po.is_required,
    po.group_order,
    po.max_selections,
    po.display_order
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%TACOS%' AND p.restaurant_id = 1
  AND po.group_order = 1
ORDER BY po.display_order;

-- 4. Vérifier spécifiquement les SAUCES (group_order = 2)
SELECT 'OPTIONS TACOS - SAUCES (group_order=2)' as verification;
SELECT 
    po.option_group,
    po.option_name,
    po.is_required,
    po.group_order,
    po.max_selections,
    po.display_order
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%TACOS%' AND p.restaurant_id = 1
  AND po.group_order = 2
ORDER BY po.display_order;

-- 5. Compter les étapes configurées par group_order
SELECT 'NOMBRE D\'ÉTAPES TACOS' as verification;
SELECT 
    po.group_order,
    COUNT(*) as nb_options,
    po.option_group,
    MAX(po.is_required::int) as est_obligatoire
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%TACOS%' AND p.restaurant_id = 1
GROUP BY po.group_order, po.option_group
ORDER BY po.group_order;

-- 6. Vérifier si d'autres étapes existent (group_order > 2)
SELECT 'AUTRES ÉTAPES TACOS (group_order > 2)' as verification;
SELECT 
    po.group_order,
    po.option_group,
    po.option_name,
    po.is_required
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%TACOS%' AND p.restaurant_id = 1
  AND po.group_order > 2
ORDER BY po.group_order, po.display_order;

ROLLBACK;