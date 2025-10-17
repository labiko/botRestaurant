-- ========================================================================
-- VÉRIFICATION - ÉTAT CATÉGORIE BOWLS PIZZA YOLO
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: BOWLS
--
-- OBJECTIF: Vérifier si BOWLS est déjà en architecture composite
-- ========================================================================

-- Trouver la catégorie BOWLS
SELECT
    c.id AS "Category ID",
    c.name AS "Nom Catégorie",
    c.restaurant_id AS "Restaurant ID"
FROM france_menu_categories c
WHERE c.restaurant_id = 1
AND c.name = 'BOWLS';

-- Afficher les produits de la catégorie BOWLS
SELECT
    p.id AS "Product ID",
    p.name AS "Nom Produit",
    p.product_type AS "Type",
    p.workflow_type AS "Workflow",
    p.requires_steps AS "Steps?",
    p.is_active AS "Actif",
    (SELECT COUNT(*) FROM france_product_options WHERE product_id = p.id) AS "Nb Options"
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
AND c.name = 'BOWLS'
ORDER BY p.id;

-- Compter les produits par type
SELECT
    'BOWLS - Résumé' AS "Info",
    COUNT(*) AS "Total Produits",
    COUNT(*) FILTER (WHERE product_type = 'composite') AS "Composites",
    COUNT(*) FILTER (WHERE product_type = 'simple') AS "Simples"
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
AND c.name = 'BOWLS';

-- Si composite, afficher les options par groupe
SELECT
    po.option_group AS "Groupe Option",
    COUNT(*) AS "Nb Options"
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
AND c.name = 'BOWLS'
AND p.product_type = 'composite'
GROUP BY po.option_group
ORDER BY po.option_group;
