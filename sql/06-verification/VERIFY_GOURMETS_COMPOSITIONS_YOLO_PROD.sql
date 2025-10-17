-- ========================================================================
-- VÉRIFICATION - COMPOSITIONS GOURMETS PIZZA YOLO
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: GOURMETS (ID: 4)
--
-- OBJECTIF: Vérifier si les produits GOURMETS ont des compositions
-- IDs à vérifier: 367, 368, 369, 370, 371
-- ========================================================================

-- Afficher les produits GOURMETS avec leurs compositions
SELECT
    p.id,
    p.name AS "Nom du produit",
    p.composition AS "Composition",
    p.price_on_site_base AS "Prix sur place",
    p.price_delivery_base AS "Prix livraison",
    CASE
        WHEN p.composition IS NULL OR p.composition = '' THEN '❌ PAS DE COMPOSITION'
        ELSE '✅ COMPOSITION PRÉSENTE'
    END AS "Statut"
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.id = 4
AND c.restaurant_id = 1
AND p.restaurant_id = 1
AND p.id IN (367, 368, 369, 370, 371)
ORDER BY p.id;

-- Compter les produits avec/sans composition
SELECT
    COUNT(*) AS "Total produits",
    COUNT(*) FILTER (WHERE composition IS NOT NULL AND composition != '') AS "Avec composition",
    COUNT(*) FILTER (WHERE composition IS NULL OR composition = '') AS "Sans composition"
FROM france_products
WHERE restaurant_id = 1
AND category_id = 4
AND id IN (367, 368, 369, 370, 371);
