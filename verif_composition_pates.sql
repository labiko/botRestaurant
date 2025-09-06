-- 🔍 VÉRIFICATION - Compositions des pâtes

SELECT 'PÂTES - DÉTAILS COMPLETS' as verification;
SELECT 
    p.id,
    p.name,
    p.description,
    p.composition,
    p.product_type,
    p.price_on_site_base as prix,
    p.is_active,
    CASE 
        WHEN p.composition IS NULL AND p.description IS NULL THEN '❌ Aucune composition'
        WHEN p.composition IS NOT NULL THEN '✅ Composition présente'
        WHEN p.description IS NOT NULL THEN '⚠️ Description seulement'
    END as statut_composition
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.slug = 'pates' 
  AND c.restaurant_id = 1
  AND p.is_active = true
ORDER BY p.display_order;