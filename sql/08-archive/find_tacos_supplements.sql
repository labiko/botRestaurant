-- =========================================
-- IDENTIFIER LES SUPPLÉMENTS TACOS POUR BOWL
-- =========================================

-- 1. Trouver tous les produits TACOS
SELECT
  p.id,
  p.name,
  p.restaurant_id,
  p.workflow_type,
  p.requires_steps
FROM france_products p
WHERE p.name ILIKE '%taco%'
  AND p.is_active = true
ORDER BY p.restaurant_id, p.name;

-- 2. Voir tous les groupes d'options des TACOS
SELECT DISTINCT
  po.option_group
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%taco%'
  AND p.is_active = true
ORDER BY po.option_group;

-- 3. Identifier les suppléments des TACOS (probablement "Suppléments" ou "Supplément")
SELECT
  p.name as product_name,
  po.option_group,
  po.option_name,
  po.price_modifier,
  po.display_order
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%taco%'
  AND p.is_active = true
  AND po.option_group ILIKE '%suppl%'
ORDER BY p.name, po.option_group, po.display_order;

-- 4. Si pas trouvé avec "suppl", chercher tous les groupes des tacos
SELECT
  p.name as product_name,
  po.option_group,
  COUNT(*) as nb_options,
  STRING_AGG(po.option_name, ', ' ORDER BY po.display_order) as options_list
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%taco%'
  AND p.is_active = true
GROUP BY p.name, po.option_group
ORDER BY p.name, po.option_group;

-- 5. Chercher spécifiquement les groupes avec 10+ options (probablement les suppléments)
SELECT
  p.name as product_name,
  po.option_group,
  COUNT(*) as nb_options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name ILIKE '%taco%'
  AND p.is_active = true
GROUP BY p.name, po.option_group
HAVING COUNT(*) >= 10
ORDER BY p.name, COUNT(*) DESC;