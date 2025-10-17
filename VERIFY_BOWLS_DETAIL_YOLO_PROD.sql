-- ========================================================================
-- VÉRIFICATION DÉTAILLÉE - BOWLS PIZZA YOLO
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
-- CATÉGORIE: BOWLS (ID: 21)
--
-- OBJECTIF: Voir la structure complète avant migration vers universal_workflow_v2
-- ========================================================================

-- Afficher le produit BOWL avec son workflow actuel
SELECT
    p.id AS "Product ID",
    p.name AS "Nom",
    p.product_type AS "Type",
    p.workflow_type AS "Workflow",
    p.price_on_site_base AS "Prix base",
    p.steps_config AS "Steps Config"
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
AND c.name = 'BOWLS';

-- Détail de toutes les options par groupe
SELECT
    po.option_group AS "Groupe",
    po.option_name AS "Option",
    po.price_modifier AS "Prix",
    po.icon AS "Icon",
    po.composition AS "Composition",
    po.display_order AS "Ordre"
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
AND c.name = 'BOWLS'
ORDER BY po.option_group, po.display_order;

-- Résumé par groupe
SELECT
    po.option_group AS "Groupe",
    COUNT(*) AS "Nb Options",
    STRING_AGG(po.option_name, ', ' ORDER BY po.display_order) AS "Liste Options"
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
AND c.name = 'BOWLS'
GROUP BY po.option_group
ORDER BY po.option_group;
