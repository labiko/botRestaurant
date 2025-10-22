-- ========================================================================
-- FIX: Correction erreur "5L" → "1.5L" dans options boisson BUCKETS
-- DATE: 2025-01-22
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- PROBLÈME: Les options affichent "COCA COLA 5L" au lieu de "COCA COLA 1.5L"
-- ========================================================================

BEGIN;

-- Vérification avant correction
SELECT
  po.id,
  po.option_name,
  po.option_group
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'buckets'
  AND c.restaurant_id = 22
  AND po.option_name LIKE '%5L%'
ORDER BY po.option_group, po.display_order;

-- Correction: Remplacer "5L" par "1.5L" dans les noms d'options
UPDATE france_product_options
SET option_name = REPLACE(option_name, '5L', '1.5L')
WHERE id IN (
  SELECT po.id
  FROM france_product_options po
  JOIN france_products p ON po.product_id = p.id
  JOIN france_menu_categories c ON p.category_id = c.id
  WHERE c.slug = 'buckets'
    AND c.restaurant_id = 22
    AND po.option_name LIKE '%5L%'
);

-- Vérification après correction
SELECT
  po.id,
  po.option_name,
  po.option_group
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'buckets'
  AND c.restaurant_id = 22
  AND po.option_group = 'Boisson 1.5L'
ORDER BY po.display_order;

-- Compter les options corrigées
SELECT
  'Options corrigées' AS info,
  COUNT(*) AS total
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'buckets'
  AND c.restaurant_id = 22
  AND po.option_group = 'Boisson 1.5L'
  AND po.option_name LIKE '%1.5L%';

COMMIT;
-- En cas de problème: ROLLBACK;
