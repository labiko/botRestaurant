-- Analyser les produits composites existants pour comprendre leur structure

-- 1. Voir les produits composites existants
SELECT 
  id,
  name,
  product_type,
  workflow_type,
  requires_steps,
  steps_config,
  composition,
  description
FROM france_products 
WHERE product_type = 'composite'
ORDER BY id;

-- 2. Voir les éléments composites associés
SELECT 
  p.id as product_id,
  p.name as product_name,
  ci.id as item_id,
  ci.component_name,
  ci.quantity,
  ci.unit
FROM france_products p
LEFT JOIN france_composite_items ci ON p.id = ci.composite_product_id
WHERE p.product_type = 'composite'
ORDER BY p.id, ci.id;

-- 3. Voir la config des steps_config pour les produits composites
SELECT 
  id,
  name,
  steps_config
FROM france_products 
WHERE product_type = 'composite' 
  AND steps_config IS NOT NULL
ORDER BY id;