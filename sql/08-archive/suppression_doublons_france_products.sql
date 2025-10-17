-- 🗑️ SUPPRESSION DOUBLONS BOISSONS - SIMPLE ET DIRECT

BEGIN;

-- Supprimer directement par ID
DELETE FROM france_products
WHERE id IN (384, 385, 387);
-- 384 = 7 UP (Copie) v1
-- 385 = MIRANDA TROPICALv2
-- 387 = MIRANDA TROPICALv3

-- Vérification après suppression
SELECT
    'BOISSONS APRÈS NETTOYAGE' as info,
    p.id,
    p.name,
    p.price_on_site_base,
    p.is_active
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE (c.name ILIKE '%boisson%' OR c.slug ILIKE '%boisson%' OR c.slug ILIKE '%drink%')
AND (p.name ILIKE '%MIRANDA%' OR p.name ILIKE '%7 UP%')
ORDER BY p.name;

COMMIT;