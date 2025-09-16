-- CRÉATION CATÉGORIE MENU FAMILY
-- Flux comme SANDWICHS mais avec TOUTES les boissons (pas que 33CL)

BEGIN;

-- 1. Créer la catégorie MENU FAMILY
INSERT INTO france_menu_categories (
    restaurant_id, 
    name, 
    slug, 
    icon, 
    display_order, 
    is_active
) 
SELECT 
    1 as restaurant_id,  -- Pizza Yolo restaurant_id
    'MENU FAMILY' as name,
    'menu-family' as slug,
    '👨‍👩‍👧‍👦' as icon,
    25 as display_order,  -- Après les autres catégories
    true as is_active
WHERE NOT EXISTS (
    SELECT 1 FROM france_menu_categories 
    WHERE name = 'MENU FAMILY' OR slug = 'menu-family'
);

-- 2. Vérification création
SELECT 'CATÉGORIE CRÉÉE' as info,
       id, name, slug, icon, display_order
FROM france_menu_categories 
WHERE name = 'MENU FAMILY';

-- 3. Insérer le produit MENU FAMILY (29.90€)
INSERT INTO france_products (
    restaurant_id, category_id, name, description,
    product_type, price_on_site_base, price_delivery_base,
    composition, display_order, is_active
)
SELECT 
    1 as restaurant_id,
    c.id as category_id,
    'MENU FAMILY' as name,
    'Menu familial pour 4-5 personnes' as description,
    'composite'::product_type_enum as product_type,
    29.90 as price_on_site_base,
    31.90 as price_delivery_base,
    '6 Wings + 6 Tenders + 6 Nuggets + 2 Frites + 2 Mozza Stick + 2 Donuts + 4 Onion Rings + 1 Maxi Boisson' as composition,
    1 as display_order,
    true as is_active
FROM france_menu_categories c
WHERE c.name = 'MENU FAMILY'
AND NOT EXISTS (
    SELECT 1 FROM france_products p2
    JOIN france_menu_categories c2 ON c2.id = p2.category_id
    WHERE c2.name = 'MENU FAMILY' AND p2.name = 'MENU FAMILY'
);

-- 4. Vérification produit créé
SELECT 'PRODUIT CRÉÉ' as info,
       p.id, p.name, p.product_type, p.price_on_site_base, p.price_delivery_base
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.name = 'MENU FAMILY';

COMMIT;

-- ÉTAPE SUIVANTE: Configuration avec TOUTES les boissons
-- PROBLÈME: configure_category_workflow copie que les boissons 33CL
-- SOLUTION: Créer les options manuellement avec TOUTES les boissons
-- ou utiliser la catégorie BOISSONS comme source (qui a tous les formats)