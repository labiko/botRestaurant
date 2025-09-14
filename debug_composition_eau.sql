-- 🔍 DIAGNOSTIC: Vérifier le champ composition de EAU MINÉRALE
-- Hypothèse: Le bot affiche product.composition au lieu du variant_name

BEGIN;

-- Vérifier TOUTES les données de EAU MINÉRALE
SELECT 
    'DONNÉES COMPLÈTES EAU MINÉRALE' as section,
    p.id,
    p.name,
    p.composition,  -- ⭐ CHAMP SUSPECT - peut contenir "50CL"
    p.description,
    p.product_type,
    p.base_price,
    p.is_active,
    p.workflow_type,
    p.requires_steps
FROM france_products p
WHERE p.name ILIKE '%EAU%MINERALE%' 
   OR p.name ILIKE '%EAU MINERALE%'
   OR p.name = 'EAU MINÉRALE'
ORDER BY p.id;

-- Vérifier tous les produits de la catégorie DRINKS avec composition contenant CL
SELECT 
    'PRODUITS DRINKS AVEC CL' as section,
    p.name,
    p.composition,
    pv.variant_name,
    CASE 
        WHEN p.composition ILIKE '%50CL%' THEN '🚨 COMPOSITION contient 50CL'
        WHEN p.composition ILIKE '%33CL%' THEN '✅ COMPOSITION contient 33CL'
        ELSE '➖ Pas de CL dans composition'
    END as diagnostic_composition
FROM france_products p
LEFT JOIN france_product_variants pv ON p.id = pv.product_id AND pv.display_order = 1
LEFT JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.name = 'DRINKS' OR c.slug = 'drinks'
  AND p.is_active = true
ORDER BY p.name;

COMMIT;