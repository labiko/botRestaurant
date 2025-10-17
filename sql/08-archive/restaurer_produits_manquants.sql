-- ============================================
-- RESTAURATION DES PRODUITS MANQUANTS
-- ============================================

BEGIN;

-- ===============================
-- BURGERS
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'CHEESEBURGER', 'simple'::product_type_enum, 5.00, 6.00, 'steak 45 grammes, fromage, cornichon', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers'
UNION ALL
SELECT r.id, c.id, 'DOUBLE CHEESEBURGER', 'simple'::product_type_enum, 6.50, 7.50, '2 steaks 45 grammes, fromage, cornichon', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers'
UNION ALL
SELECT r.id, c.id, 'BIG CHEESE', 'simple'::product_type_enum, 7.50, 8.50, '2 steaks 45 grammes, cheddar, oignons', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers'
UNION ALL
SELECT r.id, c.id, 'LE FISH', 'simple'::product_type_enum, 6.50, 7.50, 'filet de poisson panné, fromage, cornichon', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers'
UNION ALL
SELECT r.id, c.id, 'LE CHICKEN', 'simple'::product_type_enum, 6.50, 7.50, 'galette de poulet panné,fromage,cornichon', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers';

-- ===============================
-- SANDWICHS
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'AMERICAN CHICKEN', 'simple'::product_type_enum, 5.00, 6.00, 'pain kebab, sauce salade, salade, tomate, oignons, poulet pané', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'KEBAB', 'simple'::product_type_enum, 5.00, 6.00, 'pain kebab, sauce salade, salade, tomate, oignons, kebab', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'KEFTA', 'simple'::product_type_enum, 5.00, 6.00, 'pain kebab, sauce salade, salade, tomate, oignons, kefta', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'CHICKEN TENDERS', 'simple'::product_type_enum, 5.00, 6.00, 'pain kebab, sauce salade, salade, tomate, oignons, filet de poulet pané', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'MIXTE POULET KEFTA', 'simple'::product_type_enum, 5.00, 6.00, 'pain kebab, sauce salade, salade, tomate, oignons, kefta & poulet', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs';

-- ===============================
-- GOURMETS
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'L''AMÉRICAIN', 'simple'::product_type_enum, 13.50, 14.50, 'pain brioche 2 steak façon bouchère 150g,bœuf, cornichons,cheddar, sauce au choix', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE BRITISH', 'simple'::product_type_enum, 13.50, 14.50, 'pain brioche, 2 steak façon bouchère 150g, bœuf bacons, oignons confits, champignons, sauce au choix', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE CLASSIQUE', 'simple'::product_type_enum, 11.50, 12.50, 'pain brioche, steak façon bouchère 150g, bœuf, salade tomates, oignons, fromage, sauce au choix', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'L''ITALIEN', 'simple'::product_type_enum, 12.50, 13.50, 'pain brioche, steak façon bouchère 150g, bœuf, oignons tomates cerises, mozzarella, sauce au choix', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE SPANISH', 'simple'::product_type_enum, 12.50, 13.50, 'pain brioche, steak façon bouchère 150g, bœuf, chorizo, poivrons, cheddar, sauce au choix', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE SAVOYARD', 'simple'::product_type_enum, 13.50, 14.50, 'pain brioche, steak façon bouchère 150g, bœuf, lardons, raclette, oignons confits', 6
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets';

-- ===============================
-- SMASHS
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'SMASH CLASSIC', 'simple'::product_type_enum, 8.90, 9.90, 'Pain buns, steak smash beef 70g, cheddar, crudités, sauce au choix', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs'
UNION ALL
SELECT r.id, c.id, 'L''ORIGINAL', 'simple'::product_type_enum, 11.90, 12.90, 'Pain, 2 steaks smash beef 70g, double cheddar, crudités, sauce au choix', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs'
UNION ALL
SELECT r.id, c.id, 'SMASH SIGNATURE', 'simple'::product_type_enum, 12.90, 13.90, 'Pain, 2 steaks smash beef 70g, double cheddar, oignons confits, sauce au choix', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs'
UNION ALL
SELECT r.id, c.id, 'SMASH BACON', 'simple'::product_type_enum, 11.90, 12.90, 'Pain buns, steak smash beef 70g, cheddar, bacon, œuf, crudités, oignons caramélisés', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs'
UNION ALL
SELECT r.id, c.id, 'LE SMASH MIELLEUX', 'simple'::product_type_enum, 11.90, 12.90, 'Pain buns, steak smash beef 70g, chèvre, miel, cheddar, crudités, noix', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs'
UNION ALL
SELECT r.id, c.id, 'CHICKEN CRAZY', 'simple'::product_type_enum, 11.90, 12.90, 'Pain buns, filet de poulet pané, cheddar, oignons confits, alloco, coleslaw, sauce samouraï', 6
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'smashs';

-- ===============================
-- ASSIETTES
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'BOWL', 'simple'::product_type_enum, 8.00, 9.00, '1 viande au choix + cheddar + sauce fromage + frites', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes'
UNION ALL
SELECT r.id, c.id, 'L''ESCALOPE', 'simple'::product_type_enum, 9.90, 10.90, 'salade, tomates, oignons blé, escalope de poulet', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes'
UNION ALL
SELECT r.id, c.id, 'CHICKEN CHIKKA', 'simple'::product_type_enum, 9.90, 10.90, 'salade, tomates, oignons blé, chicken chikka', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes'
UNION ALL
SELECT r.id, c.id, 'GREC', 'simple'::product_type_enum, 9.90, 10.90, 'salade, tomates, oignons blé, viande de grec', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes';

-- ===============================
-- NAANS  
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'TENDERS', 'simple'::product_type_enum, 8.90, 9.90, 'Pain cèse naan, crudités, tenders de poulet', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans'
UNION ALL
SELECT r.id, c.id, 'STEAK', 'simple'::product_type_enum, 9.90, 10.90, 'Pain cèse naan, crudités, steak', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans'
UNION ALL
SELECT r.id, c.id, 'MIXTE', 'simple'::product_type_enum, 9.90, 10.90, 'Pain cèse naan, crudités, steak + poulet', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans'
UNION ALL
SELECT r.id, c.id, 'KÉBAB', 'simple'::product_type_enum, 9.90, 10.90, 'Pain cèse naan, crudités, kébab', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans'
UNION ALL
SELECT r.id, c.id, 'POTATOES (Supplément)', 'simple'::product_type_enum, 1.00, 1.00, 'Pommes de terre épicées', 10
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans';

-- Vérification
SELECT 
  c.name as category,
  COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id
WHERE c.restaurant_id = 1
  AND c.slug IN ('burgers', 'sandwichs', 'gourmets', 'smashs', 'assiettes', 'naans')
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

COMMIT;