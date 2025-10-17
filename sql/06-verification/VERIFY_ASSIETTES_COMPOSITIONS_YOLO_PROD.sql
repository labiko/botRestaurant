-- ========================================================================
-- VÉRIFICATION - COMPOSITIONS ET OPTIONS ASSIETTES PIZZA YOLO
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: ASSIETTES (ID: 6)
--
-- OBJECTIF: Vérifier si les produits ASSIETTES ont des compositions
-- IDs à vérifier: 456, 226, 227
-- ⚠️ ATTENTION: Produit 456 avait 0 options dans l'analyse initiale
-- ========================================================================

-- Afficher les produits ASSIETTES avec leurs compositions
SELECT
    p.id,
    p.name AS "Nom du produit",
    p.composition AS "Composition",
    p.price_on_site_base AS "Prix sur place",
    p.price_delivery_base AS "Prix livraison",
    CASE
        WHEN p.composition IS NULL OR p.composition = '' THEN 'PAS DE COMPOSITION'
        ELSE 'COMPOSITION PRESENTE'
    END AS "Statut composition"
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.id = 6
AND c.restaurant_id = 1
AND p.restaurant_id = 1
AND p.id IN (456, 226, 227)
ORDER BY p.id;

-- Compter les produits avec/sans composition
SELECT
    COUNT(*) AS "Total produits",
    COUNT(*) FILTER (WHERE composition IS NOT NULL AND composition != '') AS "Avec composition",
    COUNT(*) FILTER (WHERE composition IS NULL OR composition = '') AS "Sans composition"
FROM france_products
WHERE restaurant_id = 1
AND category_id = 6
AND id IN (456, 226, 227);

-- Vérifier les options actuelles pour chaque produit
SELECT
    p.id AS "Product ID",
    p.name AS "Nom produit",
    COUNT(po.id) AS "Nb options actuelles"
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id
WHERE p.restaurant_id = 1
AND p.category_id = 6
AND p.id IN (456, 226, 227)
GROUP BY p.id, p.name
ORDER BY p.id;

-- Détail des options pour chaque produit (si existantes)
SELECT
    p.id AS "Product ID",
    p.name AS "Produit",
    po.option_group AS "Groupe option",
    po.option_name AS "Option",
    po.price_modifier AS "Prix"
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id
WHERE p.restaurant_id = 1
AND p.category_id = 6
AND p.id IN (456, 226, 227)
ORDER BY p.id, po.option_group, po.display_order;
