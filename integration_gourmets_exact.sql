-- REMPLACEMENT DES GOURMETS - Pizza Yolo 77
-- Source EXACTE: C:\Users\diall\Documents\BOT-RESTO\BOT-UNIVERSEL\DATA\GOURMETS\dataBrut.txt
-- Structure analysée: botResto\database_fr_structure.sql

BEGIN;

-- 1. Vérifier que la catégorie GOURMETS existe
SELECT 'VÉRIFICATION CATÉGORIE GOURMETS' as info, 
       COUNT(*) as nb_categories 
FROM france_menu_categories 
WHERE slug = 'gourmets';

-- 2. NETTOYAGE - Supprimer tous les gourmets existants pour éviter les doublons
DELETE FROM france_product_options 
WHERE product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'gourmets'
);

DELETE FROM france_composite_items 
WHERE composite_product_id IN (
    SELECT p.id FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'gourmets'
);

DELETE FROM france_products 
WHERE category_id IN (
    SELECT id FROM france_menu_categories WHERE slug = 'gourmets'
);

SELECT 'NETTOYAGE TERMINÉ' as info;

-- 3. Récupérer l'ID de la catégorie GOURMETS et du restaurant
WITH gourmet_category AS (
    SELECT c.id as category_id, c.restaurant_id
    FROM france_menu_categories c 
    WHERE c.slug = 'gourmets' 
    LIMIT 1
)
-- 4. Insertion des 5 GOURMETS EXACTEMENT comme dans dataBrut.txt
INSERT INTO france_products (
    restaurant_id, category_id, name, description,
    product_type, price_on_site_base, price_delivery_base,
    composition, display_order, is_active
) 
SELECT 
    gc.restaurant_id,
    gc.category_id,
    gourmet_data.name,
    gourmet_data.description,
    'simple'::product_type_enum as product_type,
    gourmet_data.prix_sur_place,
    gourmet_data.prix_livraison,
    gourmet_data.composition,
    gourmet_data.display_order,
    true as is_active
FROM gourmet_category gc,
(VALUES
    -- LES 5 GOURMETS EXACTEMENT COMME DANS dataBrut.txt (mis à jour)
    ('L''AMERICAIN', 'Burger gourmet américain', 'Pain brioché, 2 steaks façon bouchère 150g, bacon, œuf, cornichon, cheddar, sauce au choix', 13.50, 14.50, 1),
    ('LE SAVOYARD', 'Burger gourmet savoyard', 'Pain brioché, steak façon bouchère 150g, galette de PDT, fromage raclette, cornichons, salade, tomate, oignons, sauce au choix', 10.50, 11.50, 2),
    ('LE BBQ', 'Burger gourmet BBQ', 'Pain brioché, steak façon bouchère 150g, bacon, cheddar, oignons, cornichons, salade, sauce au choix', 9, 10.40, 3),
    ('LE BIG CHEF', 'Burger gourmet du chef', 'Pain brioché, steak façon bouchère 150g, salade, tomates, oignons, cheddar, bacon, œuf', 11.50, 12.50, 4),
    ('L''AVOCADO', 'Burger gourmet avocat', 'Pain brioché, 1 steak façon bouchère 150g, cheddar, avocat, salade, tomate, sauce au choix', 10.50, 11.50, 5)
) AS gourmet_data(name, description, composition, prix_sur_place, prix_livraison, display_order);

-- 5. Vérification de l'insertion
SELECT 'RÉSULTAT INSERTION' as info,
       COUNT(*) as nb_gourmets_inserés
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'gourmets';

-- 6. Affichage des gourmets insérés
SELECT 'LISTE COMPLÈTE DES GOURMETS' as section,
       p.id, p.name, p.price_on_site_base, p.price_delivery_base, p.display_order
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'gourmets'
ORDER BY p.display_order;

COMMIT;

-- Après exécution, configurer GOURMETS avec:
-- SELECT configure_category_workflow('GOURMETS', 'copy_from', 'SANDWICHS');
-- (Si SANDWICHS a déjà une configuration fonctionnelle avec boissons)