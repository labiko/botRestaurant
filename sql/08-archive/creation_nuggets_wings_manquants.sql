-- 🍗 CRÉATION - NUGGETS et WINGS manquants pour MENU 3 et MENU 4
-- Restaurant: Pizza Yolo 77 (id = 1)

BEGIN;

-- 1. Vérifier/créer la catégorie SNACKS
INSERT INTO france_menu_categories (
    restaurant_id,
    name,
    slug,
    display_order,
    is_active,
    icon
) VALUES (
    1,
    'SNACKS',
    'snacks',
    20,
    true,
    '🍿'
) ON CONFLICT (restaurant_id, slug) DO NOTHING;

-- 2. Récupérer l'ID de la catégorie SNACKS
DO $$
DECLARE
    v_category_id BIGINT;
BEGIN
    SELECT id INTO v_category_id 
    FROM france_menu_categories 
    WHERE restaurant_id = 1 AND slug = 'snacks';

    -- 3. Créer les produits NUGGETS et WINGS manquants
    
    -- NUGGETS et WINGS manquants
    INSERT INTO france_products (
        restaurant_id,
        category_id,
        name,
        description,
        composition,
        price_on_site_base,
        price_delivery_base,
        is_active,
        product_type,
        display_order
    ) VALUES 
    -- NUGGETS 6 PIÈCES
    (
        1,
        v_category_id,
        'NUGGETS 6 PIÈCES',
        '6 nuggets de poulet croustillants',
        '6 nuggets de poulet panés, sauce au choix',
        5.00,
        6.00,
        true,
        'simple',
        1
    ),
    -- NUGGETS 8 PIÈCES (pour MENU 4)
    (
        1,
        v_category_id,
        'NUGGETS 8 PIÈCES',
        '8 nuggets de poulet croustillants',
        '8 nuggets de poulet panés, sauce au choix',
        7.00,
        8.00,
        true,
        'simple',
        2
    ),
    -- NUGGETS 10 PIÈCES (standard)
    (
        1,
        v_category_id,
        'NUGGETS 10 PIÈCES',
        '10 nuggets de poulet croustillants',
        '10 nuggets de poulet panés, sauce au choix',
        9.00,
        10.00,
        true,
        'simple',
        3
    ),
    -- NUGGETS 14 PIÈCES (pour MENU 3)
    (
        1,
        v_category_id,
        'NUGGETS 14 PIÈCES',
        '14 nuggets de poulet croustillants',
        '14 nuggets de poulet panés, sauce au choix',
        12.00,
        13.00,
        true,
        'simple',
        4
    ),
    -- WINGS 6 PIÈCES (pour MENU 4)
    (
        1,
        v_category_id,
        'WINGS 6 PIÈCES',
        '6 ailes de poulet marinées',
        '6 ailes de poulet épicées, sauce au choix',
        6.00,
        7.00,
        true,
        'simple',
        5
    ),
    -- WINGS 8 PIÈCES (standard)
    (
        1,
        v_category_id,
        'WINGS 8 PIÈCES',
        '8 ailes de poulet marinées',
        '8 ailes de poulet épicées, sauce au choix',
        8.00,
        9.00,
        true,
        'simple',
        6
    ),
    -- WINGS 10 PIÈCES (standard)
    (
        1,
        v_category_id,
        'WINGS 10 PIÈCES',
        '10 ailes de poulet marinées',
        '10 ailes de poulet épicées, sauce au choix',
        10.00,
        11.00,
        true,
        'simple',
        7
    ),
    -- WINGS 12 PIÈCES (pour MENU 3)
    (
        1,
        v_category_id,
        'WINGS 12 PIÈCES',
        '12 ailes de poulet marinées',
        '12 ailes de poulet épicées, sauce au choix',
        12.00,
        13.00,
        true,
        'simple',
        8
    );

END $$;

-- 4. Vérification après insertion
SELECT 'VÉRIFICATION NUGGETS' as etape;
SELECT 
    p.id,
    p.name,
    p.price_on_site_base as prix_sur_place,
    p.price_delivery_base as prix_livraison,
    p.is_active
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'snacks'
  AND c.restaurant_id = 1
  AND p.name LIKE '%NUGGETS%'
ORDER BY p.display_order;

SELECT 'VÉRIFICATION WINGS' as etape;
SELECT 
    p.id,
    p.name,
    p.price_on_site_base as prix_sur_place,
    p.price_delivery_base as prix_livraison,
    p.is_active
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'snacks'
  AND c.restaurant_id = 1
  AND p.name LIKE '%WINGS%'
ORDER BY p.display_order;

-- 5. Vérification spécifique pour les menus
SELECT 'VÉRIFICATION PRODUITS POUR MENUS' as etape;
SELECT 
    'MENU 3' as menu,
    p.name,
    CASE 
        WHEN p.name IN ('NUGGETS 14 PIÈCES', 'WINGS 12 PIÈCES') THEN '✅ Trouvé'
        ELSE '❌ Manquant'
    END as statut
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
  AND p.name IN ('NUGGETS 14 PIÈCES', 'WINGS 12 PIÈCES')
UNION ALL
SELECT 
    'MENU 4' as menu,
    p.name,
    CASE 
        WHEN p.name IN ('NUGGETS 8 PIÈCES', 'WINGS 6 PIÈCES') THEN '✅ Trouvé'
        ELSE '❌ Manquant'
    END as statut
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
  AND p.name IN ('NUGGETS 8 PIÈCES', 'WINGS 6 PIÈCES');

COMMIT;

-- ✅ Script créé avec :
-- - NUGGETS : 6, 8, 10, 14 pièces
-- - WINGS : 6, 8, 10, 12 pièces
-- - Prix livraison = Prix sur place + 1€
-- - Catégorie SNACKS (display_order = 20)