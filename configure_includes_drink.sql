-- CONFIGURATION INCLUDES_DRINK = TRUE POUR TOUS LES MENUS
-- Convertir les produits 'simple' en 'modular' et ajouter france_product_sizes avec includes_drink

-- ===============================
-- ÉTAPE 1: IDENTIFIER LES MENUS QUI INCLUENT DES BOISSONS
-- ===============================

-- Menus qui incluent des boissons (selon les fichiers md) :
-- - TOUS les TACOS (déjà configuré ✅)
-- - TOUS les BURGERS (5 produits) 
-- - TOUS les SANDWICHS (5 produits)
-- - TOUS les GOURMETS (6 produits)
-- - TOUS les SMASHS (6 produits)
-- - TOUS les ASSIETTES (3 produits)  
-- - TOUS les NAANS (4 produits)
-- - MENUS POULET seulement (3 menus individuels + 1 familial)

-- ===============================
-- ÉTAPE 2: CONVERTIR LES PRODUITS SIMPLE EN MODULAR
-- ===============================

-- 2.1 BURGERS (5 produits)
UPDATE france_products 
SET product_type = 'modular'::product_type_enum
FROM france_menu_categories c, france_restaurants r
WHERE france_products.category_id = c.id
AND c.restaurant_id = r.id
AND r.slug = 'pizza-yolo-77'
AND c.slug = 'burgers'
AND france_products.product_type = 'simple';

-- 2.2 SANDWICHS (5 produits) 
UPDATE france_products 
SET product_type = 'modular'::product_type_enum
FROM france_menu_categories c, france_restaurants r
WHERE france_products.category_id = c.id
AND c.restaurant_id = r.id
AND r.slug = 'pizza-yolo-77'
AND c.slug = 'sandwichs'
AND france_products.product_type = 'simple';

-- 2.3 GOURMETS (6 produits)
UPDATE france_products 
SET product_type = 'modular'::product_type_enum
FROM france_menu_categories c, france_restaurants r
WHERE france_products.category_id = c.id
AND c.restaurant_id = r.id
AND r.slug = 'pizza-yolo-77'
AND c.slug = 'gourmets'
AND france_products.product_type = 'simple';

-- 2.4 SMASHS (6 produits)
UPDATE france_products 
SET product_type = 'modular'::product_type_enum
FROM france_menu_categories c, france_restaurants r
WHERE france_products.category_id = c.id
AND c.restaurant_id = r.id
AND r.slug = 'pizza-yolo-77'
AND c.slug = 'smashs'
AND france_products.product_type = 'simple';

-- 2.5 ASSIETTES (3 produits)
UPDATE france_products 
SET product_type = 'modular'::product_type_enum
FROM france_menu_categories c, france_restaurants r
WHERE france_products.category_id = c.id
AND c.restaurant_id = r.id
AND r.slug = 'pizza-yolo-77'
AND c.slug = 'assiettes'
AND france_products.product_type = 'simple';

-- 2.6 NAANS (4 produits)
UPDATE france_products 
SET product_type = 'modular'::product_type_enum
FROM france_menu_categories c, france_restaurants r
WHERE france_products.category_id = c.id
AND c.restaurant_id = r.id
AND r.slug = 'pizza-yolo-77'
AND c.slug = 'naans'
AND france_products.product_type = 'simple';

-- 2.7 POULET MENUS seulement (pas les produits individuels)
UPDATE france_products 
SET product_type = 'modular'::product_type_enum
FROM france_menu_categories c, france_restaurants r
WHERE france_products.category_id = c.id
AND c.restaurant_id = r.id
AND r.slug = 'pizza-yolo-77'
AND c.slug = 'poulet-snacks'
AND france_products.product_type = 'simple'
AND (france_products.name ILIKE '%MENU%' OR france_products.name = 'MENU FAMILY');

-- ===============================
-- ÉTAPE 3: CRÉER LES TAILLES AVEC INCLUDES_DRINK = TRUE
-- ===============================

-- 3.1 BURGERS - Taille unique avec prix existant
INSERT INTO france_product_sizes (product_id, size_name, price_on_site, price_delivery, includes_drink, display_order)
SELECT 
  p.id,
  'MENU',
  p.price_on_site_base,
  p.price_delivery_base,
  true,
  1
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND c.slug = 'burgers'
AND p.product_type = 'modular';

-- 3.2 SANDWICHS - Taille unique avec prix existant
INSERT INTO france_product_sizes (product_id, size_name, price_on_site, price_delivery, includes_drink, display_order)
SELECT 
  p.id,
  'MENU',
  p.price_on_site_base,
  p.price_delivery_base,
  true,
  1
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND c.slug = 'sandwichs'
AND p.product_type = 'modular';

-- 3.3 GOURMETS - Taille unique avec prix existant
INSERT INTO france_product_sizes (product_id, size_name, price_on_site, price_delivery, includes_drink, display_order)
SELECT 
  p.id,
  'MENU',
  p.price_on_site_base,
  p.price_delivery_base,
  true,
  1
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND c.slug = 'gourmets'
AND p.product_type = 'modular';

-- 3.4 SMASHS - Taille unique avec prix existant
INSERT INTO france_product_sizes (product_id, size_name, price_on_site, price_delivery, includes_drink, display_order)
SELECT 
  p.id,
  'MENU',
  p.price_on_site_base,
  p.price_delivery_base,
  true,
  1
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND c.slug = 'smashs'
AND p.product_type = 'modular';

-- 3.5 ASSIETTES - Taille unique avec prix existant
INSERT INTO france_product_sizes (product_id, size_name, price_on_site, price_delivery, includes_drink, display_order)
SELECT 
  p.id,
  'MENU',
  p.price_on_site_base,
  p.price_delivery_base,
  true,
  1
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND c.slug = 'assiettes'
AND p.product_type = 'modular';

-- 3.6 NAANS - Taille unique avec prix existant
INSERT INTO france_product_sizes (product_id, size_name, price_on_site, price_delivery, includes_drink, display_order)
SELECT 
  p.id,
  'MENU',
  p.price_on_site_base,
  p.price_delivery_base,
  true,
  1
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND c.slug = 'naans'
AND p.product_type = 'modular';

-- 3.7 POULET MENUS - Taille unique avec prix existant
INSERT INTO france_product_sizes (product_id, size_name, price_on_site, price_delivery, includes_drink, display_order)
SELECT 
  p.id,
  'MENU',
  p.price_on_site_base,
  p.price_delivery_base,
  true,
  1
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND c.slug = 'poulet-snacks'
AND p.product_type = 'modular';

-- ===============================
-- VÉRIFICATION FINALE
-- ===============================

-- Compter tous les menus avec includes_drink = true
SELECT 
  c.name as category_name,
  COUNT(ps.id) as nb_menus_avec_boisson
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND ps.includes_drink = true
GROUP BY c.name, c.display_order
ORDER BY c.display_order;

-- Total général
SELECT COUNT(ps.id) as total_menus_avec_boisson
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-yolo-77'
AND ps.includes_drink = true;