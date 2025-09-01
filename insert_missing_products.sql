-- INSERTION DES PRODUITS MANQUANTS DANS LES 4 CATÉGORIES VIDES
-- Basé sur les fichiers md Pizza Yolo 77

-- ===============================
-- 1. SMASHS (6 produits - TOUS AVEC BOISSON)
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
-- 2. ASSIETTES (3 produits - TOUS AVEC BOISSON)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'L''ESCALOPE', 'simple'::product_type_enum, 9.90, 10.90, 'salade, tomates, oignons blé, escalope de poulet', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes'
UNION ALL
SELECT r.id, c.id, 'CHICKEN CHIKKA', 'simple'::product_type_enum, 9.90, 10.90, 'salade, tomates, oignons blé, chicken chikka', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes'
UNION ALL
SELECT r.id, c.id, 'GREC', 'simple'::product_type_enum, 9.90, 10.90, 'salade, tomates, oignons blé, viande de grec', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'assiettes';

-- ===============================
-- 3. NAANS (4 produits - TOUS AVEC BOISSON)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'TENDERS', 'simple'::product_type_enum, 8.50, 9.50, 'Pain chese naan, crudités, tenders de poulet', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans'
UNION ALL
SELECT r.id, c.id, 'STEAK', 'simple'::product_type_enum, 8.50, 9.50, 'Pain chese naan, crudités, steak', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans'
UNION ALL
SELECT r.id, c.id, 'MIXTE', 'simple'::product_type_enum, 8.50, 9.50, 'Pain chese naan, crudités, Tenders Poulet, steak', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans'
UNION ALL
SELECT r.id, c.id, 'KÉBAB', 'simple'::product_type_enum, 9.90, 10.90, 'Pain chese naan, crudités, kébab', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'naans';

-- ===============================
-- 4. POULET & SNACKS (13 produits - CERTAINS AVEC BOISSON)
-- ===============================

-- Produits individuels (SANS boisson)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'WINGS 4 PIÈCES', 'simple'::product_type_enum, 3.50, 3.50, '4 pièces', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'TENDERS 1 PIÈCE', 'simple'::product_type_enum, 1.50, 1.50, '1 pièce', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'NUGGETS 4 PIÈCES', 'simple'::product_type_enum, 3.50, 3.50, '4 pièces', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'DONUTS POULET 1 PIÈCE', 'simple'::product_type_enum, 2.00, 2.00, '1 pièce', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'MOZZA STICK 4 PIÈCES', 'simple'::product_type_enum, 3.50, 3.50, '4 pièces', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'JALAPEÑOS 4 PIÈCES', 'simple'::product_type_enum, 3.50, 3.50, '4 pièces', 6
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'ONION RINGS 4 PIÈCES', 'simple'::product_type_enum, 3.50, 3.50, '4 pièces', 7
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'POTATOES', 'simple'::product_type_enum, 1.00, 1.00, 'Portion', 8
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks';

-- Menus individuels (AVEC boisson et frites)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'WINGS 8 PIÈCES MENU', 'simple'::product_type_enum, 9.00, 10.00, '8 pièces avec frites et boisson 33cl', 9
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'TENDERS 5 PIÈCES MENU', 'simple'::product_type_enum, 9.00, 10.00, '5 pièces avec frites et boisson 33cl', 10
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks'
UNION ALL
SELECT r.id, c.id, 'NUGGETS 10 PIÈCES MENU', 'simple'::product_type_enum, 9.00, 10.00, '10 pièces avec frites et boisson 33cl', 11
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks';

-- Menu familial (AVEC maxi boisson)
INSERT INTO france_products (restaurant_id, category_id, name, product_type, price_on_site_base, price_delivery_base, composition, display_order)
SELECT r.id, c.id, 'MENU FAMILY', 'composite'::product_type_enum, 29.90, 31.90, '6 Wings + 6 Tenders + 6 Nuggets + 2 Frites + 2 Mozza Stick + 2 Donuts + 4 Onion Rings + 1 Maxi Boisson', 12
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'poulet-snacks';

-- ===============================
-- VÉRIFICATION
-- ===============================

-- Compter les produits ajoutés par catégorie
SELECT 
  c.name as category_name,
  c.display_order,
  COUNT(p.id) as nb_produits_ajoutes
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND c.slug IN ('smashs', 'assiettes', 'naans', 'poulet-snacks')
GROUP BY c.name, c.display_order
ORDER BY c.display_order;