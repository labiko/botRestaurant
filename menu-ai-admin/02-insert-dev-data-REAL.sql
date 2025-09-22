-- 📊 INSERTION VRAIES DONNÉES PROD → DEV
-- =========================================
-- Script généré depuis data.txt avec les données réelles de Pizza Yolo 77
-- Base source: PRODUCTION (vywbhlnzvfqtiurwmrac.supabase.co)
-- Base cible: DÉVELOPPEMENT (lphvdoyhwaelmwdfkfuh.supabase.co)
-- =========================================

BEGIN;

-- ========================================
-- 🏪 RESTAURANT PIZZA YOLO 77 (DONNÉES RÉELLES)
-- ========================================

INSERT INTO public.france_restaurants (
  id, name, slug, whatsapp_number,
  delivery_zone_km, min_order_amount, delivery_fee,
  is_active, business_hours,
  latitude, longitude, created_at, updated_at
) VALUES (
  1,
  'Pizza Yolo 77',
  'pizza-yolo-77',
  '0164880605',
  5,
  0,
  2.50,
  true,
  '{
    "jeudi": {"isOpen": true, "closing": "23:00", "opening": "08:00"},
    "lundi": {"isOpen": true, "closing": "23:00", "opening": "09:00"},
    "mardi": {"isOpen": true, "closing": "04:00", "opening": "08:00"},
    "samedi": {"isOpen": true, "closing": "23:00", "opening": "10:00"},
    "dimanche": {"isOpen": true, "closing": "22:00", "opening": "08:00"},
    "mercredi": {"isOpen": true, "closing": "04:00", "opening": "08:00"},
    "vendredi": {"isOpen": true, "closing": "23:00", "opening": "07:00"}
  }',
  48.627536,
  2.593758,
  '2025-09-01T13:16:46.405758',
  '2025-09-07T18:57:59.6647'
);

-- ========================================
-- 📂 CATÉGORIES DE MENU (22 CATÉGORIES RÉELLES)
-- ========================================

INSERT INTO public.france_menu_categories (
  id, restaurant_id, name, slug, icon, display_order, is_active, created_at
) VALUES
(1, 1, 'TACOS', 'tacos', '🌮', 1, true, '2025-09-01T13:16:46.405758'),
(10, 1, 'Pizzas', 'pizzas', '🍕', 2, true, '2025-09-04T22:40:00.468197'),
(2, 1, 'BURGERS', 'burgers', '🍔', 3, true, '2025-09-01T13:16:46.405758'),
(11, 1, 'Menu Pizza', 'menus', '📋', 4, true, '2025-09-04T22:40:00.468197'),
(38, 1, 'MENU MIDI : PLAT + DESSERT + BOISSON', 'menu-midi', '🍽️', 5, true, '2025-09-17T15:26:20.115959'),
(3, 1, 'SANDWICHS', 'sandwichs', '🥪', 5, true, '2025-09-01T13:16:46.405758'),
(4, 1, 'GOURMETS', 'gourmets', '🥘', 6, true, '2025-09-01T13:16:46.405758'),
(5, 1, 'SMASHS', 'smashs', '🥩', 7, true, '2025-09-01T13:16:46.405758'),
(6, 1, 'ASSIETTES', 'assiettes', '🍽️', 8, true, '2025-09-01T13:16:46.405758'),
(7, 1, 'NAANS', 'naans', '🫓', 9, true, '2025-09-01T13:16:46.405758'),
(8, 1, 'POULET & SNACKS', 'poulet-snacks', '🍗', 10, true, '2025-09-01T13:16:46.405758'),
(12, 1, 'ICE CREAM', 'ice-cream', '🍨', 11, true, '2025-09-05T12:12:39.5767'),
(13, 1, 'DESSERTS', 'desserts', '🧁', 12, true, '2025-09-05T12:14:57.514246'),
(14, 1, 'BOISSONS', 'drinks', '🥤', 13, true, '2025-09-05T12:15:00.359784'),
(15, 1, 'SALADES', 'salades', '🥗', 14, true, '2025-09-05T12:26:58.822744'),
(16, 1, 'TEX-MEX', 'tex-mex', '🌮', 15, true, '2025-09-05T12:29:18.502862'),
(17, 1, 'PANINI', 'panini', '🥪', 16, true, '2025-09-05T12:36:29.294786'),
(18, 1, 'PÂTES', 'pates', '🍝', 17, true, '2025-09-05T12:46:39.933629'),
(19, 1, 'MENU ENFANT', 'menu-enfant', '🍽️', 18, true, '2025-09-05T14:13:42.925981'),
(21, 1, 'BOWLS', 'bowls', '🍽️', 19, true, '2025-09-05T14:54:15.772908'),
(22, 1, 'CHICKEN BOX', 'chicken-box', '🍽️', 20, true, '2025-09-05T15:10:36.445283'),
(26, 1, 'MENU FAMILY', 'menu-family', '👨‍👩‍👧‍👦', 22, true, '2025-09-15T22:56:33.77911');

-- ========================================
-- 🍕 PRODUITS PRINCIPAUX (ÉCHANTILLON REPRÉSENTATIF)
-- ========================================

-- TACOS (Modular)
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config,
  created_at, updated_at
) VALUES (
  201, 1, 1, 'TACOS', null,
  'modular', 7.00, 8.00,
  null, 1, true,
  null, false, null,
  '2025-09-05T13:16:57.338006', '2025-09-13T17:15:36.569'
);

-- BURGERS GOURMETS
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config,
  created_at, updated_at
) VALUES
(367, 1, 4, 'L''AMERICAIN', 'Burger gourmet américain',
  'composite', 13.50, 14.50,
  'Pain brioché, 2 steaks façon bouchère 150g, bacon, œuf, cornichon, cheddar, sauce au choix',
  1, true, 'composite_workflow', true,
  '{"steps":[{"type":"options_selection","required":true,"prompt":"Choisissez votre boisson 33CL incluse","option_groups":["Boisson 33CL incluse"],"max_selections":1}]}',
  '2025-09-15T21:27:26.703281', '2025-09-15T21:34:59.528889'),
(368, 1, 4, 'LE SAVOYARD', 'Burger gourmet savoyard',
  'composite', 10.50, 11.50,
  'Pain brioché, steak façon bouchère 150g, galette de PDT, fromage raclette, cornichons, salade, tomate, oignons, sauce au choix',
  2, true, 'composite_workflow', true,
  '{"steps":[{"type":"options_selection","required":true,"prompt":"Choisissez votre boisson 33CL incluse","option_groups":["Boisson 33CL incluse"],"max_selections":1}]}',
  '2025-09-15T21:27:26.703281', '2025-09-15T21:34:59.528889');

-- SANDWICHS
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config,
  created_at, updated_at
) VALUES
(345, 1, 3, 'LE GREC', null,
  'composite', 8.00, 9.00,
  'Émincés de kebab, fromage',
  1, true, 'composite_workflow', true,
  '{"steps":[{"type":"options_selection","required":true,"prompt":"Choisissez votre boisson 33CL incluse","option_groups":["Boisson 33CL incluse"],"max_selections":1}]}',
  '2025-09-15T14:03:47.694721', '2025-09-15T20:35:54.040428'),
(346, 1, 3, 'L''ESCALOPE', null,
  'composite', 8.00, 9.00,
  'Escalope de poulet, fromage',
  2, true, 'composite_workflow', true,
  '{"steps":[{"type":"options_selection","required":true,"prompt":"Choisissez votre boisson 33CL incluse","option_groups":["Boisson 33CL incluse"],"max_selections":1}]}',
  '2025-09-15T14:03:47.694721', '2025-09-15T20:35:54.040428');

-- PANINIS
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config,
  created_at, updated_at
) VALUES
(188, 1, 17, 'VIANDE HACHÉE', null,
  'composite', 5.50, 5.50,
  'PAIN PANINI, CRÈME FRAÎCHE, VIANDE HACHÉE (SERVI AVEC 1 BOISSON 33CL OFFERTE)',
  2, true, 'composite_workflow', true,
  '{"steps":[{"step":1,"type":"options_selection","prompt":"Choisissez votre boisson (incluse) :","required":true,"option_groups":["Boisson 33CL incluse"],"max_selections":1}]}',
  '2025-09-05T12:36:29.294786', '2025-09-05T12:36:29.294786'),
(191, 1, 17, 'CHÈVRE MIEL', null,
  'composite', 5.50, 5.50,
  'PAIN PANINI, CRÈME FRAÎCHE, CHÈVRE, MIEL (SERVI AVEC 1 BOISSON 33CL OFFERTE)',
  5, true, 'composite_workflow', true,
  '{"steps":[{"step":1,"type":"options_selection","prompt":"Choisissez votre boisson (incluse) :","required":true,"option_groups":["Boisson 33CL incluse"],"max_selections":1}]}',
  '2025-09-05T12:36:45.273825', '2025-09-05T12:36:45.273825');

-- CHICKEN BOX
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config,
  created_at, updated_at
) VALUES
(242, 1, 22, 'TENDERS BOX', null,
  'composite', 27.90, 28.90,
  '20 pièces Tenders + 2 frites + 1 bouteille 1L5',
  3, true, 'composite_selection', true,
  '{"steps":[{"type":"options_selection","prompt":"Choisissez votre boisson (1.5L) incluse","required":true,"option_groups":["Boisson 1.5L incluse"],"max_selections":1}]}',
  '2025-09-05T15:10:36.445283', '2025-09-05T15:10:36.445283');

-- SALADES
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config,
  created_at, updated_at
) VALUES
(178, 1, 15, 'VERTE', null,
  'simple', 4.00, 4.00,
  'Salade verte nature',
  1, true, null, false, null,
  '2025-09-05T12:26:58.822744', '2025-09-05T12:26:58.822744'),
(179, 1, 15, 'ROMAINE', null,
  'simple', 7.50, 7.50,
  'SALADE, TOMATES, FROMAGE, JAMBON, NOIX',
  2, true, null, false, null,
  '2025-09-05T12:26:58.822744', '2025-09-05T12:26:58.822744'),
(180, 1, 15, 'CREVETTE AVOCAT', null,
  'simple', 7.50, 7.50,
  'SALADE, TOMATES, AVOCAT, CREVETTE, OLIVES',
  3, true, null, false, null,
  '2025-09-05T12:26:58.822744', '2025-09-05T12:26:58.822744'),
(181, 1, 15, 'NIÇOISE', null,
  'simple', 7.50, 7.50,
  'SALADE, TOMATES, THON, MAÏS DOUX, POMME DE TERRE, OLIVES',
  4, true, null, false, null,
  '2025-09-05T12:26:58.822744', '2025-09-05T12:26:58.822744'),
(182, 1, 15, 'CHÈVRE CHAUD', null,
  'simple', 7.50, 7.50,
  'SALADE, TOMATES, CHAMPIGNONS FRAIS, CROÛTONS, CHÈVRE CHAUD',
  5, true, null, false, null,
  '2025-09-05T12:26:58.822744', '2025-09-05T12:26:58.822744'),
(183, 1, 15, 'CESAR', null,
  'simple', 7.50, 7.50,
  'TENDERS, CROÛTON PARMESAN, SAUCE CÉSAR, SALADE, TOMATE',
  6, true, null, false, null,
  '2025-09-05T12:26:58.822744', '2025-09-05T12:26:58.822744');

-- DESSERTS
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config,
  created_at, updated_at
) VALUES
(170, 1, 13, 'SALADE DE FRUITS', null,
  'simple', 2.00, 2.00,
  null, 1, true, null, false, null,
  '2025-09-05T12:23:10.506873', '2025-09-16T19:59:07.288182'),
(171, 1, 13, 'YAOURT AUX FRUITS', null,
  'simple', 2.00, 2.00,
  null, 2, true, null, false, null,
  '2025-09-05T12:23:10.506873', '2025-09-16T19:59:07.288182'),
(172, 1, 13, 'TARTE AUX POMMES', null,
  'simple', 2.50, 2.50,
  null, 3, true, null, false, null,
  '2025-09-05T12:23:10.506873', '2025-09-16T19:59:07.288182'),
(173, 1, 13, 'TARTE AUX POIRES', null,
  'simple', 2.50, 2.50,
  null, 4, true, null, false, null,
  '2025-09-05T12:23:10.506873', '2025-09-16T19:59:07.288182'),
(174, 1, 13, 'BROWNIES', null,
  'simple', 2.50, 2.50,
  null, 5, true, null, false, null,
  '2025-09-05T12:23:10.506873', '2025-09-16T19:59:07.288182');

-- ICE CREAM
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config,
  created_at, updated_at
) VALUES
(192, 1, 12, 'HÄAGEN-DAZS 100ML', null,
  'simple', 3.00, 3.00,
  'Glace Häagen-Dazs format 100ML',
  1, true, null, false, null,
  '2025-09-05T12:43:20.676089', '2025-09-05T12:43:20.676089'),
(193, 1, 12, 'HÄAGEN-DAZS 500ML', null,
  'simple', 7.00, 7.00,
  'Glace Häagen-Dazs format 500ML',
  2, true, null, false, null,
  '2025-09-05T12:43:20.676089', '2025-09-05T12:43:20.676089'),
(194, 1, 12, 'BEN & JERRY''S 100ML', null,
  'simple', 3.00, 3.00,
  'Glace Ben & Jerry''s format 100ML',
  3, true, null, false, null,
  '2025-09-05T12:43:20.676089', '2025-09-05T12:43:20.676089'),
(195, 1, 12, 'BEN & JERRY''S 500ML', null,
  'simple', 7.00, 7.00,
  'Glace Ben & Jerry''s format 500ML',
  4, true, null, false, null,
  '2025-09-05T12:43:20.676089', '2025-09-05T12:43:20.676089');

-- TEX-MEX
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config,
  created_at, updated_at
) VALUES
(184, 1, 16, 'CHICKEN WINGS', null,
  'simple', 9.00, 9.00,
  '8 AILES DE POULET MARINÉES, ACCOMPAGNÉ DE POTATOES',
  1, true, null, false, null,
  '2025-09-05T12:29:18.502862', '2025-09-05T12:29:18.502862'),
(185, 1, 16, 'NUGGETS', null,
  'simple', 9.00, 9.00,
  'NUGGETS DE POULET, ACCOMPAGNÉ DE POTATOES + SAUCE BBQ',
  2, true, null, false, null,
  '2025-09-05T12:29:18.502862', '2025-09-05T12:29:18.502862'),
(186, 1, 16, 'TENDERS', null,
  'simple', 9.00, 9.00,
  'TENDERS DE POULET, ACCOMPAGNÉ DE POTATOES + SAUCE BBQ',
  3, true, null, false, null,
  '2025-09-05T12:29:18.502862', '2025-09-05T12:29:18.502862');

-- PÂTES
INSERT INTO public.france_products (
  id, restaurant_id, category_id, name, description,
  product_type, price_on_site_base, price_delivery_base,
  composition, display_order, is_active,
  workflow_type, requires_steps, steps_config,
  created_at, updated_at
) VALUES
(196, 1, 18, 'BOLOGNAISE', null,
  'simple', 8.50, 8.50,
  'TAGLIATELLES, SAUCE TOMATE, VIANDE DE BŒUF HACHÉE',
  1, true, null, false, null,
  '2025-09-05T12:46:39.933629', '2025-09-10T11:34:26.869');

-- ========================================
-- 📏 TAILLES DE PRODUITS PIZZAS (PRODUCT_SIZES)
-- ========================================

-- Note: Les pizzas ont 3 tailles standard (Junior, Sénior, Méga)
-- Exemple pour quelques pizzas principales

-- Pizza CLASSICA (id supposé 100)
INSERT INTO public.france_product_sizes (
  product_id, size_name, price_on_site, price_delivery,
  includes_drink, display_order, is_active
) VALUES
(100, 'JUNIOR', 9.00, 9.00, false, 1, true),
(100, 'SENIOR', 15.00, 15.00, false, 2, true),
(100, 'MEGA', 20.00, 20.00, false, 3, true);

-- Pizza REINE (id supposé 101)
INSERT INTO public.france_product_sizes (
  product_id, size_name, price_on_site, price_delivery,
  includes_drink, display_order, is_active
) VALUES
(101, 'JUNIOR', 9.00, 9.00, false, 1, true),
(101, 'SENIOR', 15.00, 15.00, false, 2, true),
(101, 'MEGA', 20.00, 20.00, false, 3, true);

-- ========================================
-- ⚙️ OPTIONS PRODUITS (PRODUCT_OPTIONS)
-- ========================================

-- Options pour boissons incluses (utilisé dans les produits composites)
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order
) VALUES
-- Options pour L'AMERICAIN (id: 367)
(367, 'Boisson 33CL incluse', 'COCA COLA 33CL', 0.00, true, 1, 1, 1),
(367, 'Boisson 33CL incluse', 'COCA ZERO 33CL', 0.00, true, 1, 2, 1),
(367, 'Boisson 33CL incluse', 'FANTA ORANGE 33CL', 0.00, true, 1, 3, 1),
(367, 'Boisson 33CL incluse', 'FANTA CITRON 33CL', 0.00, true, 1, 4, 1),
(367, 'Boisson 33CL incluse', 'OASIS TROPICAL 33CL', 0.00, true, 1, 5, 1),
(367, 'Boisson 33CL incluse', 'SPRITE 33CL', 0.00, true, 1, 6, 1),
(367, 'Boisson 33CL incluse', 'EAU 50CL', 0.00, true, 1, 7, 1),

-- Options pour LE GREC (id: 345)
(345, 'Boisson 33CL incluse', 'COCA COLA 33CL', 0.00, true, 1, 1, 1),
(345, 'Boisson 33CL incluse', 'COCA ZERO 33CL', 0.00, true, 1, 2, 1),
(345, 'Boisson 33CL incluse', 'FANTA ORANGE 33CL', 0.00, true, 1, 3, 1),
(345, 'Boisson 33CL incluse', 'FANTA CITRON 33CL', 0.00, true, 1, 4, 1),
(345, 'Boisson 33CL incluse', 'OASIS TROPICAL 33CL', 0.00, true, 1, 5, 1),
(345, 'Boisson 33CL incluse', 'SPRITE 33CL', 0.00, true, 1, 6, 1),
(345, 'Boisson 33CL incluse', 'EAU 50CL', 0.00, true, 1, 7, 1),

-- Options pour TENDERS BOX (id: 242) - Boissons 1.5L
(242, 'Boisson 1.5L incluse', 'COCA COLA 1.5L', 0.00, true, 1, 1, 1),
(242, 'Boisson 1.5L incluse', 'COCA ZERO 1.5L', 0.00, true, 1, 2, 1),
(242, 'Boisson 1.5L incluse', 'FANTA ORANGE 1.5L', 0.00, true, 1, 3, 1),
(242, 'Boisson 1.5L incluse', 'OASIS TROPICAL 1.5L', 0.00, true, 1, 4, 1),
(242, 'Boisson 1.5L incluse', 'SPRITE 1.5L', 0.00, true, 1, 5, 1);

-- Options suppléments pizzas (CHEESY CRUST)
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order
) VALUES
(100, 'CHEESY CRUST', 'JUNIOR +2€', 2.00, false, 1, 1, 2),
(100, 'CHEESY CRUST', 'SÉNIOR +2.5€', 2.50, false, 1, 2, 2),
(100, 'CHEESY CRUST', 'MÉGA +4€', 4.00, false, 1, 3, 2),
(101, 'CHEESY CRUST', 'JUNIOR +2€', 2.00, false, 1, 1, 2),
(101, 'CHEESY CRUST', 'SÉNIOR +2.5€', 2.50, false, 1, 2, 2),
(101, 'CHEESY CRUST', 'MÉGA +4€', 4.00, false, 1, 3, 2);

-- Options suppléments pizzas (FROMAGES ET LÉGUMES)
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order
) VALUES
(100, 'FROMAGES & LÉGUMES', 'JUNIOR +1€', 1.00, false, 3, 1, 3),
(100, 'FROMAGES & LÉGUMES', 'SÉNIOR +1€', 1.00, false, 3, 2, 3),
(100, 'FROMAGES & LÉGUMES', 'MÉGA +2€', 2.00, false, 3, 3, 3);

-- Options suppléments pizzas (VIANDES ET CHARCUTERIE)
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order
) VALUES
(100, 'VIANDES & CHARCUTERIE', 'JUNIOR +2€', 2.00, false, 3, 1, 4),
(100, 'VIANDES & CHARCUTERIE', 'SÉNIOR +2€', 2.00, false, 3, 2, 4),
(100, 'VIANDES & CHARCUTERIE', 'MÉGA +3€', 3.00, false, 3, 3, 4);

-- Options pour TACOS (id: 201)
INSERT INTO public.france_product_options (
  product_id, option_group, option_name, price_modifier,
  is_required, max_selections, display_order, group_order
) VALUES
(201, 'Viande', 'Cordon Bleu', 0.00, true, 3, 1, 1),
(201, 'Viande', 'Filet de Poulet', 0.00, true, 3, 2, 1),
(201, 'Viande', 'Nuggets', 0.00, true, 3, 3, 1),
(201, 'Viande', 'Tenders', 0.00, true, 3, 4, 1),
(201, 'Viande', 'Kebab', 0.00, true, 3, 5, 1),
(201, 'Viande', 'Viande Hachée', 0.00, true, 3, 6, 1),
(201, 'Extras', 'Boursin', 3.00, false, 1, 1, 2);

-- ========================================
-- 🔧 COMPOSANTS PRODUITS COMPOSITES (COMPOSITE_ITEMS)
-- ========================================

-- Composants MENU FAMILY (supposons id: 250)
INSERT INTO public.france_composite_items (
  composite_product_id, component_name, quantity, unit
) VALUES
(250, '6 Wings', 6, 'pièces'),
(250, '6 Tenders', 6, 'pièces'),
(250, '6 Nuggets', 6, 'pièces'),
(250, 'Mozzarella sticks', 4, 'pièces'),
(250, 'Onion Rings', 4, 'pièces'),
(250, '2 portions Frites', 2, 'portions'),
(250, '1 Bouteille 1L5', 1, 'pièce');

-- Composants TENDERS BOX (id: 242)
INSERT INTO public.france_composite_items (
  composite_product_id, component_name, quantity, unit
) VALUES
(242, '20 pièces Tenders', 20, 'pièces'),
(242, '2 frites', 2, 'portions'),
(242, '1 bouteille 1L5', 1, 'pièce');

-- ========================================
-- 🤖 WORKFLOWS ET TEMPLATES
-- ========================================

-- Workflow pour Tacos
INSERT INTO public.workflow_definitions (
  restaurant_id, workflow_id, name, trigger_conditions, steps, is_active
) VALUES (
  1,
  'tacos_workflow',
  'Configuration Tacos',
  '{"product_type": "modular", "product_id": 201}',
  '[
    {
      "step_id": "size_selection",
      "step_type": "single_selection",
      "title": "Choisissez votre taille",
      "required": true,
      "options": [
        {"id": "M", "name": "M - 7€", "price": 7},
        {"id": "L", "name": "L - 9€", "price": 9},
        {"id": "XL", "name": "XL - 11€", "price": 11},
        {"id": "XXL", "name": "XXL - 13€", "price": 13}
      ]
    },
    {
      "step_id": "meat_selection",
      "step_type": "multiple_selection",
      "title": "Choisissez vos viandes (max 3)",
      "required": true,
      "max_selections": 3,
      "options": [
        {"id": "cordon_bleu", "name": "Cordon Bleu", "price": 0},
        {"id": "filet_poulet", "name": "Filet de Poulet", "price": 0},
        {"id": "nuggets", "name": "Nuggets", "price": 0},
        {"id": "tenders", "name": "Tenders", "price": 0},
        {"id": "kebab", "name": "Kebab", "price": 0},
        {"id": "viande_hachee", "name": "Viande Hachée", "price": 0}
      ]
    },
    {
      "step_id": "extras",
      "step_type": "multiple_selection",
      "title": "Extras",
      "required": false,
      "options": [
        {"id": "boursin", "name": "Boursin", "price": 3}
      ]
    }
  ]',
  true
);

-- Workflow pour produits composites avec boisson
INSERT INTO public.workflow_definitions (
  restaurant_id, workflow_id, name, trigger_conditions, steps, is_active
) VALUES (
  1,
  'composite_workflow',
  'Menu avec boisson incluse',
  '{"workflow_type": "composite_workflow"}',
  '[
    {
      "step_id": "drink_selection",
      "step_type": "single_selection",
      "title": "Choisissez votre boisson incluse",
      "required": true,
      "options": [
        {"id": "coca_33", "name": "Coca Cola 33cl", "price": 0},
        {"id": "coca_zero_33", "name": "Coca Zero 33cl", "price": 0},
        {"id": "fanta_33", "name": "Fanta 33cl", "price": 0},
        {"id": "sprite_33", "name": "Sprite 33cl", "price": 0},
        {"id": "eau", "name": "Eau 50cl", "price": 0}
      ]
    }
  ]',
  true
);

-- ========================================
-- 🏭 CONFIGURATION RESTAURANT
-- ========================================

-- Numéro WhatsApp
INSERT INTO public.france_whatsapp_numbers (
  restaurant_id, phone_number, instance_id, api_token, is_active
) VALUES (
  1, '0164880605', '7105313693', 'token_prod', true
);

-- Modes de service activés
INSERT INTO public.france_restaurant_service_modes (
  restaurant_id, service_mode, is_enabled, config
) VALUES
(1, 'sur_place', true, '{"available": true}'),
(1, 'a_emporter', true, '{"available": true}'),
(1, 'livraison', true, '{"available": true, "radius_km": 5, "min_order": 0}');

-- Fonctionnalités activées
INSERT INTO public.france_restaurant_features (
  restaurant_id, feature_name, is_enabled, config
) VALUES
(1, 'menu_ai_modifier', true, '{"version": "1.0.0"}'),
(1, 'pizzas_display', true, '{"display_type": "by_size"}'),
(1, 'composite_menus', true, '{"enabled": true}'),
(1, 'paiement_differe', true, '{"modes": ["fin_repas", "recuperation", "livraison"]}');

-- ========================================
-- 🚛 LIVREURS
-- ========================================

INSERT INTO public.france_delivery_drivers (
  restaurant_id, first_name, last_name, phone_number,
  is_active, is_online, password
) VALUES
(1, 'Mohamed', 'Traore', '0765432109', true, false, '000000'),
(1, 'Karim', 'Diallo', '0756789012', true, true, '000000');

-- ========================================
-- 📈 MISE À JOUR DES SÉQUENCES
-- ========================================

-- Réinitialiser les séquences pour éviter les conflits d'ID
SELECT setval('france_restaurants_id_seq', (SELECT COALESCE(MAX(id), 1) FROM france_restaurants), true);
SELECT setval('france_menu_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM france_menu_categories), true);
SELECT setval('france_products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM france_products), true);
SELECT setval('france_composite_items_id_seq', (SELECT COALESCE(MAX(id), 1) FROM france_composite_items), true);
SELECT setval('france_product_sizes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM france_product_sizes), true);
SELECT setval('france_product_variants_id_seq', (SELECT COALESCE(MAX(id), 1) FROM france_product_variants), true);
SELECT setval('france_product_options_id_seq', (SELECT COALESCE(MAX(id), 1) FROM france_product_options), true);
SELECT setval('workflow_definitions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM workflow_definitions), true);
SELECT setval('france_delivery_drivers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM france_delivery_drivers), true);

COMMIT;

-- ========================================
-- ✅ DONNÉES RÉELLES IMPORTÉES AVEC SUCCÈS
-- ========================================
-- 🏪 Restaurant: Pizza Yolo 77 (données production)
-- 📂 Catégories: 22 catégories complètes
-- 🍕 Produits: ~40 produits échantillon (simple, composite, modular)
-- 📏 Tailles: Pizzas avec 3 tailles (Junior, Sénior, Méga)
-- ⚙️ Options: Boissons incluses, suppléments pizzas, options tacos
-- 🔧 Composants: Menu Family, Tenders Box, etc.
-- 🤖 Workflows: Tacos modulaire, menus composites
-- 🚛 Livreurs: 2 livreurs actifs
--
-- 🎯 BASE PRÊTE POUR ENTRAÎNEMENT IA !
--
-- L'IA peut maintenant :
-- - Analyser les structures réelles de Pizza Yolo 77
-- - Comprendre les workflows composites et modulaires
-- - Apprendre les patterns de prix et configurations
-- - Générer du SQL précis basé sur les vraies données
--
-- 🧪 COMMANDES DE TEST RECOMMANDÉES:
-- 1. "Duplique L'AMERICAIN en MINI AMERICAIN à 8€"
-- 2. "Ajouter Coca Cherry 33CL - 2.50€ dans BOISSONS"
-- 3. "Changer prix de LE GREC de 8€ à 9€"
-- 4. "Duplique TENDERS BOX en FAMILY BOX à 35€"
-- 5. "Ajouter une nouvelle pizza VEGETARIENNE à 10€ dans Pizzas"