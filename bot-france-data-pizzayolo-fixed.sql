-- 🍕 INSERTION DONNÉES COMPLÈTES PIZZA YOLO 77 - VERSION CORRIGÉE
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
INSERT INTO france_product_sizes (product_id, size_name, price, includes_drink, display_order)
SELECT p.id, 'M', 7.00, true, 1 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'L', 8.50, true, 2 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'XL', 10.00, true, 3 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS';

-- Options viandes (obligatoire)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, display_order)
SELECT p.id, 'viande', 'Nuggets', 0, true, 1 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'viande', 'Merguez', 0, true, 2 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'viande', 'Filet de poulet', 0, true, 3 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'viande', 'Cordon bleu', 0, true, 4 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'viande', 'Kefta', 0, true, 5 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'viande', 'Poulet mariné', 0, true, 6 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'viande', 'Viande hachée', 0, true, 7 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'viande', 'Steak de cheval', 0, true, 8 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS';

-- Suppléments (optionnel)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, display_order)
SELECT p.id, 'supplement', 'Bacon', 1.00, false, 1 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'supplement', 'Œuf', 1.00, false, 2 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'supplement', 'Chèvre', 1.50, false, 3 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'supplement', 'Fromage', 1.50, false, 4 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'supplement', 'Viande', 2.00, false, 5 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS';

-- Sauces (incluses)
INSERT INTO france_product_options (product_id, option_group, option_name, price_modifier, is_required, display_order)
SELECT p.id, 'sauce', 'Ketchup', 0, false, 1 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'sauce', 'Mayonnaise', 0, false, 2 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'sauce', 'Harissa', 0, false, 3 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'sauce', 'Sauce ail', 0, false, 4 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'sauce', 'Sauce piquante', 0, false, 5 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'sauce', 'Sauce salade', 0, false, 6 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS'
UNION ALL
SELECT p.id, 'sauce', 'Sauce boursin', 0, false, 7 FROM france_products p 
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'tacos' AND p.name = 'TACOS';

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
SELECT r.id, c.id, 'BIG CHEESE', 'simple'::product_type_enum, 7.50, '2 steaks 45 grammes, cheddar, oignons', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers'
UNION ALL
SELECT r.id, c.id, 'LE FISH', 'simple'::product_type_enum, 6.50, 'filet de poisson panné, fromage, cornichon', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers'
UNION ALL
SELECT r.id, c.id, 'LE CHICKEN', 'simple'::product_type_enum, 6.50, 'galette de poulet panné,fromage,cornichon', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'burgers';

-- ===============================
-- 3. SANDWICHS (SIMPLES)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'AMERICAN CHICKEN', 'simple'::product_type_enum, 5.00, 'pain kebab, sauce salade, salade, tomate, oignons, poulet pané', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'KEBAB', 'simple'::product_type_enum, 5.00, 'pain kebab, sauce salade, salade, tomate, oignons, kebab', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'KEFTA', 'simple'::product_type_enum, 5.00, 'pain kebab, sauce salade, salade, tomate, oignons, kefta', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'CHICKEN TENDERS', 'simple'::product_type_enum, 5.00, 'pain kebab, sauce salade, salade, tomate, oignons, filet de poulet pané', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs'
UNION ALL
SELECT r.id, c.id, 'MIXTE POULET KEFTA', 'simple'::product_type_enum, 5.00, 'pain kebab, sauce salade, salade, tomate, oignons, kefta & poulet', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'sandwichs';

-- ===============================
-- 4. GOURMETS (SIMPLES)
-- ===============================

INSERT INTO france_products (restaurant_id, category_id, name, product_type, base_price, composition, display_order)
SELECT r.id, c.id, 'L''AMÉRICAIN', 'simple'::product_type_enum, 13.50, 'pain brioche 2 steak façon bouchère 150g,bœuf, cornichons,cheddar, sauce au choix', 1
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE BRITISH', 'simple'::product_type_enum, 13.50, 'pain brioche, 2 steak façon bouchère 150g, bœuf bacons, oignons confits, champignons, sauce au choix', 2
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE CLASSIQUE', 'simple'::product_type_enum, 11.50, 'pain brioche, steak façon bouchère 150g, bœuf, salade tomates, oignons, fromage, sauce au choix', 3
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'L''ITALIEN', 'simple'::product_type_enum, 12.50, 'pain brioche, steak façon bouchère 150g, bœuf, oignons tomates cerises, mozzarella, sauce au choix', 4
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE SPANISH', 'simple'::product_type_enum, 12.50, 'pain brioche, steak façon bouchère 150g, bœuf, chorizo, poivrons, cheddar, sauce au choix', 5
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets'
UNION ALL
SELECT r.id, c.id, 'LE SAVOYARD', 'simple'::product_type_enum, 13.50, 'pain brioche, steak façon bouchère 150g, bœuf, lardons, raclette, oignons confits', 6
FROM france_restaurants r 
JOIN france_menu_categories c ON c.restaurant_id = r.id 
WHERE r.slug = 'pizza-yolo-77' AND c.slug = 'gourmets';

-- ===============================
-- VÉRIFICATION FINALE
-- ===============================

-- Compter les produits par catégorie  
SELECT 
  c.name as categorie,
  COUNT(p.id) as nb_produits
FROM france_menu_categories c
LEFT JOIN france_products p ON c.id = p.category_id
WHERE c.restaurant_id = (SELECT id FROM france_restaurants WHERE slug = 'pizza-yolo-77')
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

-- ===============================
-- 📊 RÉSUMÉ 
-- ===============================
/*
VERSION CORRIGÉE avec ::product_type_enum pour éviter les erreurs PostgreSQL
Données essentielles insérées pour test initial :
✅ TACOS : Modèle modulaire complet
✅ BURGERS : 5 burgers
✅ SANDWICHS : 5 sandwichs  
✅ GOURMETS : 6 burgers gourmets

Les autres catégories peuvent être ajoutées après validation de cette base.
*/