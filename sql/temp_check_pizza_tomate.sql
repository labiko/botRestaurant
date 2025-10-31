-- Vérifier configuration produit 2 PIZZAS TOMATE
SELECT
  p.id,
  p.name,
  p.price_on_site_base,
  p.price_delivery_base,
  p.workflow_type,
  p.requires_steps,
  p.steps_config
FROM france_products p
WHERE p.id = 782;
