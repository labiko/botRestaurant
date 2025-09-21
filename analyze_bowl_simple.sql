-- =========================================
-- ANALYSE SIMPLE WORKFLOW BOWL
-- =========================================

-- 1. Voir les options disponibles pour BOWL
SELECT
  po.product_id,
  p.name as product_name,
  po.option_group,
  po.option_name,
  po.price_modifier,
  po.display_order
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%bowl%'
ORDER BY po.product_id, po.option_group, po.display_order;

-- 2. Compter les groupes d'options pour BOWL
SELECT
  p.name as product_name,
  po.option_group,
  COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%bowl%'
GROUP BY p.name, po.option_group
ORDER BY p.name, po.option_group;