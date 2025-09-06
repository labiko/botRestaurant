-- 🥤 CRÉATION - Variants 33CL pour uniformiser avec MENU 3
-- Ajouter des variants 33CL aux boissons existantes (même logique que 1L5)

BEGIN;

-- Récupérer les IDs des produits de boissons simples
DO $$
DECLARE
    drink_record RECORD;
BEGIN
    -- Pour chaque boisson simple dans la catégorie drinks
    FOR drink_record IN (
        SELECT p.id, p.name
        FROM france_products p
        JOIN france_menu_categories c ON p.category_id = c.id
        WHERE c.slug = 'drinks'
          AND c.restaurant_id = 1
          AND p.product_type = 'simple'
          AND p.name NOT LIKE '%1L5%' -- Exclure les produits déjà 1L5
    ) LOOP
        
        -- Créer le variant 33CL pour chaque boisson
        INSERT INTO france_product_variants (
            product_id,
            variant_name,
            price_on_site,
            price_delivery,
            quantity,
            unit,
            is_menu,
            includes_description,
            display_order,
            is_active
        ) VALUES (
            drink_record.id,
            '33CL',
            3.00, -- Prix sur place
            3.00, -- Prix livraison (même prix comme demandé)
            33,
            'cl',
            false,
            NULL,
            1,
            true
        );
        
    END LOOP;
END $$;

-- Vérification des variants 33CL créés
SELECT 'VÉRIFICATION VARIANTS 33CL' as etape;
SELECT 
    p.name,
    pv.variant_name,
    pv.quantity,
    pv.unit,
    pv.price_on_site,
    pv.is_active
FROM france_products p
JOIN france_product_variants pv ON p.id = pv.product_id
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'drinks'
  AND c.restaurant_id = 1
  AND pv.variant_name = '33CL'
ORDER BY p.name;

COMMIT;

-- ✅ Maintenant MENU 4 peut utiliser la même logique que MENU 3
-- ✅ Recherche dans france_product_variants avec variant_name = '33CL'