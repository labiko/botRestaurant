-- 🔧 CORRECTION - Mettre à jour price_delivery_base pour les menus pizza
-- price_delivery_base = price_on_site_base (même prix sur place et livraison)

BEGIN;

-- 1. Vérifier l'état actuel des prix
SELECT 'AVANT CORRECTION' as etape;
SELECT 
    p.name,
    p.price_on_site_base,
    p.price_delivery_base,
    CASE 
        WHEN p.price_delivery_base IS NULL THEN '❌ Prix livraison NULL'
        ELSE '✅ Prix livraison: ' || p.price_delivery_base || '€'
    END as statut
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name LIKE '%MENU%' 
  AND c.slug = 'menus'
  AND c.restaurant_id = 1
ORDER BY p.display_order;

-- 2. CORRECTION: price_delivery_base = price_on_site_base
UPDATE france_products 
SET price_delivery_base = price_on_site_base
WHERE id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON p.category_id = c.id
    WHERE p.name LIKE '%MENU%' 
      AND c.slug = 'menus'
      AND c.restaurant_id = 1
);

-- 3. Vérification après correction
SELECT 'APRÈS CORRECTION' as etape;
SELECT 
    p.name,
    p.price_on_site_base as prix_sur_place,
    p.price_delivery_base as prix_livraison,
    CASE 
        WHEN p.price_delivery_base = p.price_on_site_base THEN '✅ Prix identiques'
        ELSE '❌ Erreur'
    END as statut
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name LIKE '%MENU%' 
  AND c.slug = 'menus'
  AND c.restaurant_id = 1
ORDER BY p.display_order;

COMMIT;