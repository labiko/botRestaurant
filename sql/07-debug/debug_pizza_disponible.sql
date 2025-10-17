-- 🔍 DEBUG - Vérifier pourquoi "Aucune pizza disponible"
-- Analyser si le problème vient du workflow TACOS ou des pizzas

BEGIN;

-- 1. Vérifier les pizzas en base (restaurant_id = 1)
SELECT 'PIZZAS DISPONIBLES' as verification;
SELECT COUNT(*) as nb_pizzas_totales
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1 AND p.is_active = true
  AND (c.slug ILIKE '%pizza%' OR p.name ILIKE '%pizza%');

-- 2. Lister quelques pizzas pour vérifier
SELECT 'LISTE PIZZAS' as verification;
SELECT 
    p.id,
    p.name,
    p.product_type,
    p.is_active,
    c.name as categorie,
    c.slug as categorie_slug
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1 AND p.is_active = true
  AND (c.slug ILIKE '%pizza%' OR p.name ILIKE '%pizza%')
LIMIT 10;

-- 3. Vérifier toutes les catégories actives
SELECT 'TOUTES CATÉGORIES ACTIVES' as verification;
SELECT 
    c.id,
    c.name,
    c.slug,
    c.is_active,
    COUNT(p.id) as nb_produits_actifs
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id AND p.is_active = true
WHERE c.restaurant_id = 1 AND c.is_active = true
GROUP BY c.id, c.name, c.slug, c.is_active
ORDER BY c.display_order;

-- 4. Vérifier si le problème TACOS persiste
SELECT 'WORKFLOW TACOS ACTUEL' as verification;
SELECT 
    po.group_order,
    po.option_group,
    COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = 'TACOS' AND p.restaurant_id = 1
GROUP BY po.group_order, po.option_group
ORDER BY po.group_order;

ROLLBACK;