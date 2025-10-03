-- ========================================================================
-- SCRIPT PIZZAS - Le Nouveau O'CV Moissy (ID: 16)
-- 3 catégories + 52 produits simples (26 pizzas × 2 tailles)
-- ========================================================================

BEGIN;

DO $$
DECLARE
  v_restaurant_id INTEGER := 16;
  v_category_tomate_id INTEGER;
  v_category_creme_id INTEGER;
  v_category_speciale_id INTEGER;
BEGIN

  RAISE NOTICE '🍕 Restaurant ID: %', v_restaurant_id;

  -- ================================================================
  -- CATÉGORIES
  -- ================================================================

  -- Catégorie 1: Pizzas Base Tomate
  INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order)
  VALUES (v_restaurant_id, 'Pizzas Base Tomate', 'pizzas-base-tomate', '🍅', 100)
  RETURNING id INTO v_category_tomate_id;

  -- Catégorie 2: Pizzas Base Crème
  INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order)
  VALUES (v_restaurant_id, 'Pizzas Base Crème', 'pizzas-base-creme', '🥛', 101)
  RETURNING id INTO v_category_creme_id;

  -- Catégorie 3: Pizzas Base Spéciale
  INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order)
  VALUES (v_restaurant_id, 'Pizzas Base Spéciale', 'pizzas-base-speciale', '🌶️', 102)
  RETURNING id INTO v_category_speciale_id;

  RAISE NOTICE '✅ Catégories créées - Tomate: %, Crème: %, Spéciale: %',
    v_category_tomate_id, v_category_creme_id, v_category_speciale_id;

  -- ================================================================
  -- PIZZAS BASE TOMATE (9 pizzas × 2 tailles = 18 produits)
  -- ================================================================

  -- Marguerita
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_tomate_id, '🍕 Marguerita Sénior', 'Fromage, origan', 'simple', 9, 10, false, 1),
    (v_restaurant_id, v_category_tomate_id, '🍕 Marguerita Méga', 'Fromage, origan', 'simple', 12, 13, false, 2);

  -- Reine
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_tomate_id, '🍕 Reine Sénior', 'Fromage, jambon, champignons', 'simple', 9, 10, false, 3),
    (v_restaurant_id, v_category_tomate_id, '🍕 Reine Méga', 'Fromage, jambon, champignons', 'simple', 12, 13, false, 4);

  -- Campione
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_tomate_id, '🍕 Campione Sénior', 'Fromage, viande hachée, champignons', 'simple', 9, 10, false, 5),
    (v_restaurant_id, v_category_tomate_id, '🍕 Campione Méga', 'Fromage, viande hachée, champignons', 'simple', 12, 13, false, 6);

  -- Pacifique
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_tomate_id, '🍕 Pacifique Sénior', 'Fromage, thon, olives, oignons', 'simple', 9, 10, false, 7),
    (v_restaurant_id, v_category_tomate_id, '🍕 Pacifique Méga', 'Fromage, thon, olives, oignons', 'simple', 12, 13, false, 8);

  -- Calzone
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_tomate_id, '🍕 Calzone Sénior', 'Fromage, viande hachée ou jambon', 'simple', 9, 10, false, 9),
    (v_restaurant_id, v_category_tomate_id, '🍕 Calzone Méga', 'Fromage, viande hachée ou jambon', 'simple', 12, 13, false, 10);

  -- Orientale
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_tomate_id, '🍕 Orientale Sénior', 'Merguez, œuf, poivrons, olives', 'simple', 9, 10, false, 11),
    (v_restaurant_id, v_category_tomate_id, '🍕 Orientale Méga', 'Merguez, œuf, poivrons, olives', 'simple', 12, 13, false, 12);

  -- 4 Fromages
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_tomate_id, '🍕 4 Fromages Sénior', 'Fromage brie, chèvre, bleu', 'simple', 9, 10, false, 13),
    (v_restaurant_id, v_category_tomate_id, '🍕 4 Fromages Méga', 'Fromage brie, chèvre, bleu', 'simple', 12, 13, false, 14);

  -- 4 Jambons
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_tomate_id, '🍕 4 Jambons Sénior', 'Fromage, jambon, lardons, pepperoni, chorizo', 'simple', 9, 10, false, 15),
    (v_restaurant_id, v_category_tomate_id, '🍕 4 Jambons Méga', 'Fromage, jambon, lardons, pepperoni, chorizo', 'simple', 12, 13, false, 16);

  -- Texane
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_tomate_id, '🍕 Texane Sénior', 'Fromage, viande hachée, chorizo, champignons', 'simple', 9, 10, false, 17),
    (v_restaurant_id, v_category_tomate_id, '🍕 Texane Méga', 'Fromage, viande hachée, chorizo, champignons', 'simple', 12, 13, false, 18);

  -- ================================================================
  -- PIZZAS BASE CRÈME (8 pizzas × 2 tailles = 16 produits)
  -- ================================================================

  -- Royale
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_creme_id, '🍕 Royale Sénior', 'Fromage, jambon, lardons, pomme de terre', 'simple', 9, 10, false, 1),
    (v_restaurant_id, v_category_creme_id, '🍕 Royale Méga', 'Fromage, jambon, lardons, pomme de terre', 'simple', 12, 13, false, 2);

  -- O'CV
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_creme_id, '🍕 O''CV Sénior', 'Fromage, lardons, poulet, pomme de terre', 'simple', 9, 10, false, 3),
    (v_restaurant_id, v_category_creme_id, '🍕 O''CV Méga', 'Fromage, lardons, poulet, pomme de terre', 'simple', 12, 13, false, 4);

  -- Country
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_creme_id, '🍕 Country Sénior', 'Fromage, viande hachée, merguez, pomme de terre', 'simple', 9, 10, false, 5),
    (v_restaurant_id, v_category_creme_id, '🍕 Country Méga', 'Fromage, viande hachée, merguez, pomme de terre', 'simple', 12, 13, false, 6);

  -- Tartiflette
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_creme_id, '🍕 Tartiflette Sénior', 'Fromage, lardons, reblochon, pomme de terre, oignons', 'simple', 9, 10, false, 7),
    (v_restaurant_id, v_category_creme_id, '🍕 Tartiflette Méga', 'Fromage, lardons, reblochon, pomme de terre, oignons', 'simple', 12, 13, false, 8);

  -- Chicken
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_creme_id, '🍕 Chicken Sénior', 'Fromage, poulet, champignons, pomme de terre', 'simple', 9, 10, false, 9),
    (v_restaurant_id, v_category_creme_id, '🍕 Chicken Méga', 'Fromage, poulet, champignons, pomme de terre', 'simple', 12, 13, false, 10);

  -- Norvégienne
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_creme_id, '🍕 Norvégienne Sénior', 'Fromage, saumon', 'simple', 9, 10, false, 11),
    (v_restaurant_id, v_category_creme_id, '🍕 Norvégienne Méga', 'Fromage, saumon', 'simple', 12, 13, false, 12);

  -- Raclette
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_creme_id, '🍕 Raclette Sénior', 'Raclette, poulet, pomme de terre', 'simple', 9, 10, false, 13),
    (v_restaurant_id, v_category_creme_id, '🍕 Raclette Méga', 'Raclette, poulet, pomme de terre', 'simple', 12, 13, false, 14);

  -- Boursin
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_creme_id, '🍕 Boursin Sénior', 'Fromage, viande hachée, boursin, oignons', 'simple', 9, 10, false, 15),
    (v_restaurant_id, v_category_creme_id, '🍕 Boursin Méga', 'Fromage, viande hachée, boursin, oignons', 'simple', 12, 13, false, 16);

  -- ================================================================
  -- PIZZAS BASE SPÉCIALE (7 pizzas × 2 tailles = 14 produits)
  -- ================================================================

  -- Barbecue
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_speciale_id, '🍕 Barbecue Sénior', 'Sauce barbecue, fromage, viande hachée, poulet, oignons', 'simple', 9, 10, false, 1),
    (v_restaurant_id, v_category_speciale_id, '🍕 Barbecue Méga', 'Sauce barbecue, fromage, viande hachée, poulet, oignons', 'simple', 12, 13, false, 2);

  -- Algérienne
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_speciale_id, '🍕 Algérienne Sénior', 'Sauce algérienne, fromage, poulet, merguez, poivrons', 'simple', 9, 10, false, 3),
    (v_restaurant_id, v_category_speciale_id, '🍕 Algérienne Méga', 'Sauce algérienne, fromage, poulet, merguez, poivrons', 'simple', 12, 13, false, 4);

  -- Indienne
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_speciale_id, '🍕 Indienne Sénior', 'Sauce curry, fromage, poulet, poivrons', 'simple', 9, 10, false, 5),
    (v_restaurant_id, v_category_speciale_id, '🍕 Indienne Méga', 'Sauce curry, fromage, poulet, poivrons', 'simple', 12, 13, false, 6);

  -- Hot Spicy
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_speciale_id, '🍕 Hot Spicy Sénior', 'Sauce salsa, fromage, poulet, viande hachée, poivrons, oignons', 'simple', 9, 10, false, 7),
    (v_restaurant_id, v_category_speciale_id, '🍕 Hot Spicy Méga', 'Sauce salsa, fromage, poulet, viande hachée, poivrons, oignons', 'simple', 12, 13, false, 8);

  -- Spéciale Kebab
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_speciale_id, '🍕 Spéciale Kebab Sénior', 'Sauce tomate, fromage, viande kebab', 'simple', 9, 10, false, 9),
    (v_restaurant_id, v_category_speciale_id, '🍕 Spéciale Kebab Méga', 'Sauce tomate, fromage, viande kebab', 'simple', 12, 13, false, 10);

  -- Biggy Burger
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_speciale_id, '🍕 Biggy Burger Sénior', 'Sauce burger, fromage, viande hachée, poulet, oignons', 'simple', 9, 10, false, 11),
    (v_restaurant_id, v_category_speciale_id, '🍕 Biggy Burger Méga', 'Sauce burger, fromage, viande hachée, poulet, oignons', 'simple', 12, 13, false, 12);

  -- Chèvre Miel
  INSERT INTO france_products (restaurant_id, category_id, name, composition, product_type, price_on_site_base, price_delivery_base, requires_steps, display_order)
  VALUES
    (v_restaurant_id, v_category_speciale_id, '🍕 Chèvre Miel Sénior', 'Sauce blanche, fromage, chèvre, miel', 'simple', 9, 10, false, 13),
    (v_restaurant_id, v_category_speciale_id, '🍕 Chèvre Miel Méga', 'Sauce blanche, fromage, chèvre, miel', 'simple', 12, 13, false, 14);

  RAISE NOTICE '✅ 52 pizzas créées !';

END $$;

-- ================================================================
-- VÉRIFICATIONS
-- ================================================================

SELECT
  '✅ Catégories créées' AS verification,
  COUNT(*) AS total
FROM france_menu_categories
WHERE restaurant_id = 16
AND name LIKE 'Pizzas%';

SELECT
  '✅ Produits créés' AS verification,
  COUNT(*) AS total
FROM france_products
WHERE restaurant_id = 16
AND category_id IN (
  SELECT id FROM france_menu_categories
  WHERE restaurant_id = 16
  AND name LIKE 'Pizzas%'
);

SELECT
  c.name AS categorie,
  COUNT(p.id) AS nb_pizzas
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id
WHERE c.restaurant_id = 16
AND c.name LIKE 'Pizzas%'
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

COMMIT;
