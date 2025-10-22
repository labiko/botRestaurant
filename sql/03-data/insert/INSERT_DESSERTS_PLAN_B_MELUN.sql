-- ========================================================================
-- SCRIPT: Insertion catégorie DESSERTS - Plan B Melun
-- DATE: 2025-01-22
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- CATÉGORIE: DESSERTS
-- PRODUITS: 7 desserts simples (pas de workflow)
-- PRIX: 3.00€ à 4.50€
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. CRÉATION CATÉGORIE
-- ========================================================================

INSERT INTO france_menu_categories (
  restaurant_id,
  name,
  slug,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  'DESSERTS',
  'desserts',
  '🍰',
  true,
  14
) ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- ========================================================================
-- 2. INSERTION DES 7 PRODUITS
-- ========================================================================

-- 2.1. TARTE AUX DAIMS (3.50€)
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'desserts' AND restaurant_id = 22),
  'TARTE AUX DAIMS',
  'Fait maison.',
  'simple',
  3.50,
  3.50,
  '🍰',
  true,
  1
);

-- 2.2. TIRAMISU NUTELLA (4.50€)
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'desserts' AND restaurant_id = 22),
  'TIRAMISU NUTELLA',
  'Fait maison.',
  'simple',
  4.50,
  4.50,
  '🍰',
  true,
  2
);

-- 2.3. TIRAMISU CARAMEL (4.50€)
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'desserts' AND restaurant_id = 22),
  'TIRAMISU CARAMEL',
  'Fait maison.',
  'simple',
  4.50,
  4.50,
  '🍰',
  true,
  3
);

-- 2.4. TIRAMISU GRANOLA (3.00€)
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'desserts' AND restaurant_id = 22),
  'TIRAMISU GRANOLA',
  'Fait maison.',
  'simple',
  3.00,
  3.00,
  '🍰',
  true,
  4
);

-- 2.5. TIRAMISU OREO (4.50€)
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'desserts' AND restaurant_id = 22),
  'TIRAMISU OREO',
  'Fait maison.',
  'simple',
  4.50,
  4.50,
  '🍰',
  true,
  5
);

-- 2.6. TIRAMISU SPECULOOS (4.50€)
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'desserts' AND restaurant_id = 22),
  'TIRAMISU SPECULOOS',
  'Fait maison.',
  'simple',
  4.50,
  4.50,
  '🍰',
  true,
  6
);

-- 2.7. KINDER SURPRISE (3.50€)
INSERT INTO france_products (
  restaurant_id,
  category_id,
  name,
  composition,
  product_type,
  price_on_site_base,
  price_delivery_base,
  icon,
  is_active,
  display_order
) VALUES (
  22,
  (SELECT id FROM france_menu_categories WHERE slug = 'desserts' AND restaurant_id = 22),
  'KINDER SURPRISE',
  '',
  'simple',
  3.50,
  3.50,
  '🍫',
  true,
  7
);

-- ========================================================================
-- 3. VÉRIFICATIONS
-- ========================================================================

-- Vérifier la catégorie créée
SELECT
  id,
  name,
  slug,
  icon,
  display_order
FROM france_menu_categories
WHERE slug = 'desserts' AND restaurant_id = 22;

-- Vérifier les 7 produits créés
SELECT
  id,
  name,
  composition,
  price_on_site_base,
  price_delivery_base,
  product_type,
  display_order
FROM france_products
WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'desserts' AND restaurant_id = 22)
ORDER BY display_order;

-- Compter les produits créés
SELECT
  'Total produits créés' AS info,
  COUNT(*) AS total
FROM france_products
WHERE category_id = (SELECT id FROM france_menu_categories WHERE slug = 'desserts' AND restaurant_id = 22);

COMMIT;
-- En cas de problème: ROLLBACK;
