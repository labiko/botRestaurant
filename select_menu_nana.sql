-- ================================================
-- REQUÊTE POUR VOIR TOUS LES PRODUITS/OPTIONS MENU NANA
-- ================================================

-- 1. Trouver le produit MENU NANA
SELECT
  p.id as product_id,
  p.name as product_name,
  p.product_type,
  p.workflow_type,
  p.steps_config,
  p.icon as product_icon
FROM france_products p
WHERE UPPER(p.name) LIKE '%MENU NANA%'
LIMIT 1;

-- 2. Voir toutes les options du MENU NANA (Thiep, Yassa, etc.)
SELECT
  po.id,
  po.product_id,
  po.option_group,
  po.option_name,
  po.price_adjustment,
  po.display_order,
  po.icon,
  p.name as product_name
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE UPPER(p.name) LIKE '%MENU NANA%'
ORDER BY po.option_group, po.display_order, po.option_name;

-- 3. Version simplifiée - Focus sur Thiep et Yassa
SELECT
  po.option_name,
  po.option_group,
  po.icon,
  po.price_adjustment,
  p.name as menu_name
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
WHERE UPPER(p.name) LIKE '%MENU NANA%'
  AND (LOWER(po.option_name) LIKE '%thiep%' OR LOWER(po.option_name) LIKE '%yassa%');