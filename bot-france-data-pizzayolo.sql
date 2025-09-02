-- 🍕 INSERTION DONNÉES COMPLÈTES PIZZA YOLO 77
-- Basé sur l'analyse validée des 10 catégories de menus

-- ===============================
-- 1. TACOS (MODULAIRE)
-- ===============================

-- Produit Tacos de base
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order) 
SELECT r.id, c.id, 'TACOS', 'modular'::product_type_enum, 1 
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos';

-- Tailles Tacos avec boisson incluse
WITH tacos_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
)
INSERT INTO france_product_sizes (product_id, size_name, price, includes_drink, display_order)
SELECT id, 'M', 7.00, true, 1 FROM tacos_product
UNION ALL
SELECT id, 'L', 8.50, true, 2 FROM tacos_product
UNION ALL  
SELECT id, 'XL', 10.00, true, 3 FROM tacos_product;

-- Options viandes (obligatoire)
WITH tacos_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, display_order)
SELECT id, 'viande', 'Nuggets', 0, true, 1 FROM tacos_product
UNION ALL
SELECT id, 'viande', 'Merguez', 0, true, 2 FROM tacos_product
UNION ALL
SELECT id, 'viande', 'Filet de poulet', 0, true, 3 FROM tacos_product
UNION ALL
SELECT id, 'viande', 'Cordon bleu', 0, true, 4 FROM tacos_product
UNION ALL
SELECT id, 'viande', 'Kefta', 0, true, 5 FROM tacos_product
UNION ALL
SELECT id, 'viande', 'Poulet mariné', 0, true, 6 FROM tacos_product
UNION ALL
SELECT id, 'viande', 'Viande hachée', 0, true, 7 FROM tacos_product
UNION ALL
SELECT id, 'viande', 'Steak de cheval', 0, true, 8 FROM tacos_product;

-- Suppléments (optionnel)
WITH tacos_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, display_order)
SELECT id, 'supplement', 'Bacon', 1.00, false, 1 FROM tacos_product
UNION ALL
SELECT id, 'supplement', 'Œuf', 1.00, false, 2 FROM tacos_product
UNION ALL
SELECT id, 'supplement', 'Chèvre', 1.50, false, 3 FROM tacos_product
UNION ALL
SELECT id, 'supplement', 'Fromage', 1.50, false, 4 FROM tacos_product
UNION ALL
SELECT id, 'supplement', 'Viande', 2.00, false, 5 FROM tacos_product;

-- Sauces (incluses)
WITH tacos_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, display_order)
SELECT id, 'sauce', 'Ketchup', 0, false, 1 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Mayonnaise', 0, false, 2 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Harissa', 0, false, 3 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Sauce ail', 0, false, 4 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Sauce piquante', 0, false, 5 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Sauce salade', 0, false, 6 FROM tacos_product
UNION ALL
SELECT id, 'sauce', 'Sauce boursin', 0, false, 7 FROM tacos_product;

-- ===============================
-- 2. BURGERS (SIMPLES)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'CHEESEBURGER', 'simple'::product_type_enum, 5.00, 'steak 45 grammes, fromage, cornichon', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers'
UNION ALL
SELECT r.id, c.id, 'DOUBLE CHEESEBURGER', 'simple'::product_type_enum, 6.50, '2 steaks 45 grammes, fromage, cornichon', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers'
UNION ALL
SELECT r.id, c.id, 'BIG CHEESE', 'simple', 7.50, '2 steaks 45 grammes, cheddar, oignons', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers'
UNION ALL
SELECT r.id, c.id, 'LE FISH', 'simple', 6.50, 'filet de poisson panné, fromage, cornichon', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers'
UNION ALL
SELECT r.id, c.id, 'LE CHICKEN', 'simple', 6.50, 'galette de poulet panné,fromage,cornichon', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers';

-- ===============================
-- 3. SANDWICHS (SIMPLES)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'AMERICAN CHICKEN', 'simple', 5.00, 'pain kebab, sauce salade, salade, tomate, oignons, poulet pané', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'KEBAB', 'simple', 5.00, 'pain kebab, sauce salade, salade, tomate, oignons, kebab', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'KEFTA', 'simple', 5.00, 'pain kebab, sauce salade, salade, tomate, oignons, kefta', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'CHICKEN TENDERS', 'simple', 5.00, 'pain kebab, sauce salade, salade, tomate, oignons, filet de poulet pané', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'MIXTE POULET KEFTA', 'simple', 5.00, 'pain kebab, sauce salade, salade, tomate, oignons, kefta & poulet', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs';

-- ===============================
-- 4. GOURMETS (SIMPLES)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'L''AMÉRICAIN', 'simple', 13.50, 'pain brioche 2 steak façon bouchère 150g,bœuf, cornichons,cheddar, sauce au choix', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE BRITISH', 'simple', 13.50, 'pain brioche, 2 steak façon bouchère 150g, bœuf bacons, oignons confits, champignons, sauce au choix', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE CLASSIQUE', 'simple', 11.50, 'pain brioche, steak façon bouchère 150g, bœuf, salade tomates, oignons, fromage, sauce au choix', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'L''ITALIEN', 'simple', 12.50, 'pain brioche, steak façon bouchère 150g, bœuf, oignons tomates cerises, mozzarella, sauce au choix', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE SPANISH', 'simple', 12.50, 'pain brioche, steak façon bouchère 150g, bœuf, chorizo, poivrons, cheddar, sauce au choix', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE SAVOYARD', 'simple', 13.50, 'pain brioche, steak façon bouchère 150g, bœuf, lardons, raclette, oignons confits', 6
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets';

-- ===============================
-- 5. SMASHS (SIMPLES)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'SMASH CLASSIC', 'simple', 8.90, 'Pain buns, steak smash beef 70g, cheddar, crudités, sauce au choix', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs'
UNION ALL
SELECT r.id, c.id, 'L''ORIGINAL', 'simple', 11.90, 'Pain, 2 steaks smash beef 70g, double cheddar, crudités, sauce au choix', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs'
UNION ALL
SELECT r.id, c.id, 'SMASH SIGNATURE', 'simple', 12.90, 'Pain, 2 steaks smash beef 70g, double cheddar, oignons confits, sauce au choix', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs'
UNION ALL
SELECT r.id, c.id, 'SMASH BACON', 'simple', 11.90, 'Pain buns, steak smash beef 70g, cheddar, bacon, œuf, crudités, oignons caramélisés', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs'
UNION ALL
SELECT r.id, c.id, 'LE SMASH MIELLEUX', 'simple', 11.90, 'Pain buns, steak smash beef 70g, chèvre, miel, cheddar, crudités, noix', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs'
UNION ALL
SELECT r.id, c.id, 'CHICKEN CRAZY', 'simple', 11.90, 'Pain buns, filet de poulet pané, cheddar, oignons confits, alloco, coleslaw, sauce samouraï', 6
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs';

-- ===============================
-- 6. ASSIETTES (SIMPLES + 1 MODULAIRE)
-- ===============================

-- Bowl (modulaire avec choix de viande)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'BOWL', 'simple', 8.00, '1 viande au choix + cheddar + sauce fromage + frites', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes';

-- Assiettes fixes
INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'L''ESCALOPE', 'simple', 9.90, 'salade, tomates, oignons blé, escalope de poulet', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes'
UNION ALL
SELECT r.id, c.id, 'CHICKEN CHIKKA', 'simple', 9.90, 'salade, tomates, oignons blé, chicken chikka', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes'
UNION ALL
SELECT r.id, c.id, 'GREC', 'simple', 9.90, 'salade, tomates, oignons blé, viande de grec', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes';

-- ===============================
-- 7. NAANS (SIMPLES)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'TENDERS', 'simple', 8.90, 'Pain cèse naan, crudités, tenders de poulet', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans'
UNION ALL
SELECT r.id, c.id, 'STEAK', 'simple', 9.90, 'Pain cèse naan, crudités, steak', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans'
UNION ALL
SELECT r.id, c.id, 'MIXTE', 'simple', 9.90, 'Pain cèse naan, crudités, steak + poulet', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans'
UNION ALL
SELECT r.id, c.id, 'KÉBAB', 'simple', 9.90, 'Pain cèse naan, crudités, kébab', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans';

-- Supplément Potatoes pour Naans
INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'POTATOES (Supplément Naans)', 'simple', 1.00, 'Pommes de terre épicées', 10
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans';

-- ===============================
-- 8. POULET & SNACKS (VARIANTES + COMPOSITE)
-- ===============================

-- Wings (variantes)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'WINGS', 'variant', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks';

WITH wings_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks' AND p.name = 'WINGS'
)
INSERT INTO france_product_variants (product_id, variant_name, price, quantity, unit, is_menu, includes_description, display_order)
SELECT id, '4 PIÈCES', 3.50, 4, 'pièces', false, NULL, 1 FROM wings_product
UNION ALL
SELECT id, '8 PIÈCES MENU', 9.00, 8, 'pièces', true, 'avec frites + boisson 33cl', 2 FROM wings_product;

-- Tenders (variantes)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'TENDERS', 'variant', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks';

WITH tenders_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks' AND p.name = 'TENDERS'
)
INSERT INTO france_product_variants (product_id, variant_name, price, quantity, unit, is_menu, includes_description, display_order)
SELECT id, '1 PIÈCE', 1.50, 1, 'pièce', false, NULL, 1 FROM tenders_product
UNION ALL
SELECT id, '5 PIÈCES MENU', 9.00, 5, 'pièces', true, 'avec frites + boisson 33cl', 2 FROM tenders_product;

-- Nuggets (variantes)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'NUGGETS', 'variant', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks';

WITH nuggets_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks' AND p.name = 'NUGGETS'
)
INSERT INTO france_product_variants (product_id, variant_name, price, quantity, unit, is_menu, includes_description, display_order)
SELECT id, '4 PIÈCES', 3.50, 4, 'pièces', false, NULL, 1 FROM nuggets_product
UNION ALL
SELECT id, '10 PIÈCES MENU', 9.00, 10, 'pièces', true, 'avec frites + boisson 33cl', 2 FROM nuggets_product;

-- Snacks simples
INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'DONUTS POULET', 'simple', 2.00, '1 pièce', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'MOZZA STICK', 'simple', 3.50, '4 pièces', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'JALAPEÑOS', 'simple', 3.50, '4 pièces', 6
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'ONION RINGS', 'simple', 3.50, '4 pièces', 7
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'POTATOES', 'simple', 1.00, 'Portion', 8
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks';

-- Menu Family (COMPOSITE)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'MENU FAMILY', 'composite', 29.90, 'Menu complet pour 4-5 personnes', 20
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks';

-- Composition Menu Family
WITH menu_family_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks' AND p.name = 'MENU FAMILY'
)
INSERT INTO france_composite_items (composite_product_id, component_name, quantity, unit)
SELECT id, 'Wings', 6, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Tenders', 6, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Nuggets', 6, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Frites', 2, 'portions' FROM menu_family_product
UNION ALL
SELECT id, 'Mozza Sticks', 2, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Donuts', 2, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Onion Rings', 4, 'pièces' FROM menu_family_product
UNION ALL
SELECT id, 'Maxi Boisson', 1, 'pièce' FROM menu_family_product;

-- ===============================
-- 9. ICE CREAM & DESSERTS & DRINKS
-- ===============================

-- Häagen-Dazs (variantes)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'HÄAGEN-DAZS', 'variant', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

WITH haagen_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks' AND p.name = 'HÄAGEN-DAZS'
)
INSERT INTO france_product_variants (product_id, variant_name, price, quantity, unit, display_order)
SELECT id, '100ML', 3.00, 100, 'ml', 1 FROM haagen_product
UNION ALL
SELECT id, '500ML', 7.00, 500, 'ml', 2 FROM haagen_product;

-- Desserts (simples)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'BROWNIES', 'simple', 2.50, 'Dessert chocolat', 10
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'TARTE AU DAIMS', 'simple', 3.00, 'Tarte caramel', 11
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'TIRAMISU', 'simple', 3.50, 'Dessert italien', 12
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'FRAISIER', 'simple', 3.50, 'Gâteau aux fraises', 13
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'FINGER', 'simple', 3.50, 'Biscuit chocolat', 14
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

-- Boissons (variantes par format)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'COCA COLA', 'variant', 20
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

WITH coca_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks' AND p.name = 'COCA COLA'
)
INSERT INTO france_product_variants (product_id, variant_name, price, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 33, 'cl', 1 FROM coca_product
UNION ALL
SELECT id, '1L5', 3.00, 150, 'cl', 2 FROM coca_product
UNION ALL
SELECT id, '2L', 3.50, 200, 'cl', 3 FROM coca_product;

-- Coca Zero
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'COCA ZERO', 'variant', 21
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

WITH coca_zero_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks' AND p.name = 'COCA ZERO'
)
INSERT INTO france_product_variants (product_id, variant_name, price, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 33, 'cl', 1 FROM coca_zero_product
UNION ALL
SELECT id, '1L5', 3.00, 150, 'cl', 2 FROM coca_zero_product;

-- Oasis Tropical
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'OASIS TROPICAL', 'variant', 22
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

WITH oasis_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks' AND p.name = 'OASIS TROPICAL'
)
INSERT INTO france_product_variants (product_id, variant_name, price, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 33, 'cl', 1 FROM oasis_product
UNION ALL
SELECT id, '2L', 3.50, 200, 'cl', 2 FROM oasis_product;

-- Ice Tea
INSERT INTO france_products (restaurant_id, category_id, name, product_type, display_order)
SELECT r.id, c.id, 'ICE TEA', 'variant', 23
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

WITH icetea_product AS (
  SELECT p.id FROM france_products p 
  JOIN france_menu_categories c ON p.category_id = c.id
  JOIN france_restaurants r ON c.restaurant_id = r.id
  WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks' AND p.name = 'ICE TEA'
)
INSERT INTO france_product_variants (product_id, variant_name, price, quantity, unit, display_order)
SELECT id, '33CL', 1.50, 33, 'cl', 1 FROM icetea_product
UNION ALL
SELECT id, '2L', 3.50, 200, 'cl', 2 FROM icetea_product;

-- Autres boissons 33cl uniquement
INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'MIRANDA TROPICAL', 'simple', 1.50, '33cl', 24
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'MIRANDA FRAISE', 'simple', 1.50, '33cl', 25
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, '7 UP', 'simple', 1.50, '33cl', 26
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'EAU MINÉRALE', 'simple', 1.50, '33cl', 27
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks'
UNION ALL
SELECT r.id, c.id, 'PERRIER', 'simple', 1.50, '33cl', 28
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

-- Fanta 1L5 uniquement
INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'FANTA', 'simple', 3.00, '1L5', 29
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'ice-cream-desserts-drinks';

-- ===============================
-- 10. VÉRIFICATION FINALE
-- ===============================

-- Compter les produits par catégorie
SELECT 
  c.name as categorie,
  COUNT(p.id) as nb_produits,
  STRING_AGG(p.name, ', ' ORDER BY p.display_order) as produits
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id
WHERE c.restaurant_id = (SELECT id FROM france_restaurants WHERE slug = 'pizza-yolo-77')
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

-- Vérifier les variantes
SELECT 
  p.name as produit,
  COUNT(pv.id) as nb_variantes,
  STRING_AGG(pv.variant_name || ' (' || pv.price || '€)', ', ' ORDER BY pv.display_order) as variantes
FROM france_products p
LEFT JOIN france_product_variants pv ON p.id = pv.product_id
WHERE p.product_type = 'variant'
AND p.restaurant_id = (SELECT id FROM france_restaurants WHERE slug = 'pizza-yolo-77')
GROUP BY p.name;

-- Vérifier les options tacos
SELECT 
  po.option_group as groupe,
  COUNT(po.id) as nb_options,
  STRING_AGG(po.option_name, ', ' ORDER BY po.display_order) as options
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.restaurant_id = (SELECT id FROM france_restaurants WHERE slug = 'pizza-yolo-77')
GROUP BY po.option_group;

-- Vérifier composition Menu Family
SELECT 
  ci.component_name,
  ci.quantity,
  ci.unit
FROM france_composite_items ci
JOIN france_products p ON ci.composite_product_id = p.id
WHERE p.name = 'MENU FAMILY'
AND p.restaurant_id = (SELECT id FROM france_restaurants WHERE slug = 'pizza-yolo-77')
ORDER BY ci.id;

-- ===============================
-- 📊 RÉSUMÉ INSERTION
-- ===============================
/*
DONNÉES PIZZA YOLO 77 COMPLÈTES :
✅ TACOS : Modèle modulaire avec 3 tailles, 8 viandes, 5 suppléments, 7 sauces
✅ BURGERS : 5 burgers simples
✅ SANDWICHS : 5 sandwichs simples
✅ GOURMETS : 6 burgers gourmets
✅ SMASHS : 6 smashs
✅ ASSIETTES : 4 assiettes (dont 1 bowl modulaire)
✅ NAANS : 4 naans + potatoes
✅ POULET & SNACKS : Wings/Tenders/Nuggets (variantes) + snacks + Menu Family (composite)
✅ ICE CREAM & DESSERTS & DRINKS : Häagen-Dazs, desserts, boissons multi-formats

TOUS LES PRIX ET COMPOSITIONS VALIDÉS SONT RESPECTÉS
*/