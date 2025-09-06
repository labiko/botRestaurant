-- 🍗 CRÉATION - Produits spécifiques pour MENU 3 et MENU 4 avec noms exacts
-- Ces produits ont les noms exacts recherchés par le code du bot

BEGIN;

-- Récupérer l'ID de la catégorie SNACKS
DO $$
DECLARE
    v_category_id BIGINT;
BEGIN
    SELECT id INTO v_category_id 
    FROM france_menu_categories 
    WHERE restaurant_id = 1 AND slug = 'snacks';

    -- Créer les produits avec les noms EXACTS recherchés par le bot
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
    -- MENU 3: NUGGETS 14 PIÈCES (MENU)
    (
        1,
        v_category_id,
        'NUGGETS 14 PIÈCES (MENU)',
        '14 nuggets de poulet croustillants pour menu',
        '14 nuggets de poulet panés, sauce au choix',
        0.00,
        0.00,
        true,
        'simple',
        21
    ),
    -- MENU 3: WINGS 12 PIÈCES (MENU)
    (
        1,
        v_category_id,
        'WINGS 12 PIÈCES (MENU)',
        '12 ailes de poulet marinées pour menu',
        '12 ailes de poulet épicées, sauce au choix',
        0.00,
        0.00,
        true,
        'simple',
        22
    ),
    -- MENU 4: WINGS 6 PIÈCES (MENU)
    (
        1,
        v_category_id,
        'WINGS 6 PIÈCES (MENU)',
        '6 ailes de poulet marinées pour menu',
        '6 ailes de poulet épicées, sauce au choix',
        0.00,
        0.00,
        true,
        'simple',
        23
    ),
    -- MENU 4: NUGGETS 8 PIÈCES (MENU)
    (
        1,
        v_category_id,
        'NUGGETS 8 PIÈCES (MENU)',
        '8 nuggets de poulet croustillants pour menu',
        '8 nuggets de poulet panés, sauce au choix',
        0.00,
        0.00,
        true,
        'simple',
        24
    );

END $$;

-- Vérification des produits créés
SELECT 'VÉRIFICATION PRODUITS MENU' as etape;
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
  AND p.name LIKE '%(MENU)%'
ORDER BY p.display_order;

-- Test de recherche exacte comme le fait le bot
SELECT 'TEST RECHERCHE BOT - WINGS' as test;
SELECT p.id, p.name, p.composition
FROM france_products p
WHERE p.name = 'WINGS 6 PIÈCES (MENU)'
  AND p.restaurant_id = 1;

SELECT 'TEST RECHERCHE BOT - NUGGETS' as test;
SELECT p.id, p.name, p.composition
FROM france_products p
WHERE p.name = 'NUGGETS 8 PIÈCES (MENU)'
  AND p.restaurant_id = 1;

COMMIT;

-- ✅ Script créé avec les noms EXACTS recherchés par le bot
-- - "WINGS 6 PIÈCES (MENU)"
-- - "NUGGETS 8 PIÈCES (MENU)"