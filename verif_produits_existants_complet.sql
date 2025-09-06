-- 🔍 VÉRIFICATION COMPLÈTE DES PRODUITS EXISTANTS POUR PIZZA YOLO
-- ⚠️ Script de vérification UNIQUEMENT - ne modifie rien

-- 1. APERÇU GÉNÉRAL DES CATÉGORIES ET PRODUITS
SELECT 
    c.id as category_id,
    c.name as categorie,
    c.display_order,
    COUNT(p.id) as nb_produits,
    COUNT(CASE WHEN p.requires_steps = true THEN 1 END) as nb_avec_workflow,
    COUNT(CASE WHEN po.id IS NOT NULL THEN 1 END) as nb_avec_options
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id AND p.restaurant_id = 1
LEFT JOIN france_product_options po ON po.product_id = p.id
WHERE c.restaurant_id = 1
GROUP BY c.id, c.name, c.display_order
ORDER BY c.display_order;

-- 2. DÉTAIL PAR CATÉGORIE - TOUS LES PRODUITS
SELECT 
    c.name as categorie,
    p.id as product_id,
    p.name as produit,
    p.price_on_site_base as prix_place,
    p.price_delivery_base as prix_livraison,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    CASE WHEN po.product_id IS NOT NULL THEN 'OUI' ELSE 'NON' END as a_des_options
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id AND p.restaurant_id = 1
LEFT JOIN (
    SELECT DISTINCT product_id 
    FROM france_product_options 
) po ON po.product_id = p.id
WHERE c.restaurant_id = 1
ORDER BY c.display_order, p.name;

-- 3. PRODUITS AVEC OPTIONS EXISTANTES - DÉTAIL COMPLET
SELECT 
    c.name as categorie,
    p.name as produit,
    po.option_group,
    po.group_order,
    po.option_name,
    po.price_modifier,
    po.is_required,
    po.max_selections
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id AND p.restaurant_id = 1
JOIN france_product_options po ON po.product_id = p.id
ORDER BY c.display_order, p.name, po.group_order, po.option_name;

-- 4. ANALYSE DES WORKFLOWS EXISTANTS
SELECT 
    p.workflow_type,
    COUNT(*) as nb_produits,
    string_agg(DISTINCT c.name, ', ') as categories,
    string_agg(DISTINCT p.name, ', ' ORDER BY p.name) as produits_exemples
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 1 
  AND (p.workflow_type IS NOT NULL OR p.requires_steps = true)
GROUP BY p.workflow_type
ORDER BY nb_produits DESC;

-- 5. PRODUITS SANS CONFIGURATION (potentiellement à configurer)
SELECT 
    c.name as categorie,
    p.name as produit,
    p.price_on_site_base,
    'Pas de workflow configuré' as status
FROM france_menu_categories c
JOIN france_products p ON p.category_id = c.id AND p.restaurant_id = 1
LEFT JOIN france_product_options po ON po.product_id = p.id
WHERE p.workflow_type IS NULL 
  AND p.requires_steps IS NOT true
  AND po.id IS NULL
ORDER BY c.display_order, p.name;