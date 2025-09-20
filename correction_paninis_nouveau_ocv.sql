-- 🧹 CORRECTION PANINIS - Le Nouveau O'CV Moissy
-- ===============================================
-- PHASE 4.1 : Nettoyage + PHASE 4.2 : Insertion vrais paninis

BEGIN;

-- 1. Identifier l'ID du restaurant
DO $$
DECLARE
    resto_id INTEGER;
    cat_panini_id INTEGER;
BEGIN
    -- Récupérer l'ID du restaurant
    SELECT id INTO resto_id FROM france_restaurants
    WHERE name = 'Le Nouveau O''CV Moissy';

    IF resto_id IS NULL THEN
        RAISE EXCEPTION 'Restaurant Le Nouveau O''CV Moissy non trouvé';
    END IF;

    -- Récupérer l'ID de la catégorie paninis
    SELECT id INTO cat_panini_id FROM france_menu_categories
    WHERE restaurant_id = resto_id AND name = 'Nos Paninis';

    IF cat_panini_id IS NULL THEN
        RAISE EXCEPTION 'Catégorie Nos Paninis non trouvée';
    END IF;

    -- 4.1 NETTOYAGE : Supprimer le faux panini composite
    RAISE NOTICE 'Suppression du faux panini composite...';
    DELETE FROM france_products
    WHERE name = 'Panini au choix + Boisson 33cl'
    AND restaurant_id = resto_id;

    -- 4.2 INSERTION : Créer les 6 vrais paninis (produits simples)
    RAISE NOTICE 'Insertion des 6 vrais paninis...';

    INSERT INTO france_products (
        name, category_id, restaurant_id, product_type, workflow_type,
        requires_steps, price_on_site_base, price_delivery_base, display_order
    ) VALUES
        ('Panini 4 Fromages', cat_panini_id, resto_id, 'simple', null, false, null, null, 1),
        ('Panini Poulet', cat_panini_id, resto_id, 'simple', null, false, null, null, 2),
        ('Panini Thon', cat_panini_id, resto_id, 'simple', null, false, null, null, 3),
        ('Panini Merguez', cat_panini_id, resto_id, 'simple', null, false, null, null, 4),
        ('Panini Viande Hachée', cat_panini_id, resto_id, 'simple', null, false, null, null, 5),
        ('Panini Saumon', cat_panini_id, resto_id, 'simple', null, false, null, null, 6);

    -- Vérification
    RAISE NOTICE 'Paninis créés: %', (
        SELECT COUNT(*) FROM france_products
        WHERE restaurant_id = resto_id AND category_id = cat_panini_id
    );

END $$;

COMMIT;

-- Vérification finale
SELECT
    'PANINIS FINAUX' as type,
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
JOIN france_restaurants r ON p.restaurant_id = r.id
WHERE r.name = 'Le Nouveau O''CV Moissy'
AND c.name = 'Nos Paninis'
ORDER BY p.display_order;