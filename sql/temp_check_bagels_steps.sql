-- Vérifier steps_config pour le menu promo bagels
SELECT
  id,
  name,
  price_on_site_base,
  price_delivery_base,
  workflow_type,
  requires_steps,
  steps_config
FROM france_products
WHERE id = 857;

-- Vérifier steps_config pour un bagel normal (VEGETARIEN)
SELECT
  id,
  name,
  price_on_site_base,
  price_delivery_base,
  workflow_type,
  requires_steps,
  steps_config
FROM france_products
WHERE id = 851;
