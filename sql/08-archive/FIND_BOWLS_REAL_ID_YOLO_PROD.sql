-- ========================================================================
-- RECHERCHE ID RÉEL DU PRODUIT BOWLS
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: BOWLS
--
-- OBJECTIF: Trouver le vrai ID du produit BOWLS
-- ========================================================================

-- Chercher la catégorie BOWLS
SELECT
    id AS "Category ID",
    name AS "Nom Catégorie",
    restaurant_id AS "Restaurant ID",
    display_order AS "Ordre"
FROM france_menu_categories
WHERE restaurant_id = 1
AND (name ILIKE '%BOWL%' OR name ILIKE '%BOL%')
ORDER BY id;

-- Chercher tous les produits dans une catégorie qui pourrait être BOWLS
SELECT
    c.id AS "Category ID",
    c.name AS "Catégorie",
    p.id AS "Product ID",
    p.name AS "Nom Produit",
    p.product_type AS "Type",
    p.workflow_type AS "Workflow",
    p.price_on_site_base AS "Prix",
    p.is_active AS "Actif",
    (SELECT COUNT(*) FROM france_product_options WHERE product_id = p.id) AS "Nb Options"
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
AND (c.name ILIKE '%BOWL%' OR c.name ILIKE '%BOL%' OR p.name ILIKE '%BOWL%' OR p.name ILIKE '%BOL%')
ORDER BY c.id, p.id;

-- Si BOWLS existe, afficher ses options par groupe
SELECT
    c.name AS "Catégorie",
    p.id AS "Product ID",
    p.name AS "Produit",
    po.option_group AS "Groupe",
    COUNT(*) AS "Nb Options"
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
AND (c.name ILIKE '%BOWL%' OR c.name ILIKE '%BOL%' OR p.name ILIKE '%BOWL%' OR p.name ILIKE '%BOL%')
GROUP BY c.name, p.id, p.name, po.option_group
ORDER BY p.id, po.option_group;
