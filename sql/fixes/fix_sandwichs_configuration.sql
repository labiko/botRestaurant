-- 🔧 CORRECTION URGENTE : Remettre les SANDWICHS en configuration SIMPLE
-- Problème : configure_category_workflow a cassé les SANDWICHS avec un workflow composite incomplet

BEGIN;

-- 1. DIAGNOSTIC AVANT CORRECTION
SELECT 'AVANT CORRECTION - État des SANDWICHS:' as info;
SELECT 
    COUNT(*) as nb_sandwichs_composite,
    COUNT(CASE WHEN steps_config IS NOT NULL THEN 1 END) as nb_avec_steps,
    COUNT(CASE WHEN product_type = 'composite' THEN 1 END) as nb_composite_type
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs';

-- 2. NETTOYER TOUTE LA CONFIGURATION COMPOSITE POUR SANDWICHS
-- Supprimer les options de boisson créées par l'automation
DELETE FROM france_product_options
WHERE product_id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'sandwichs'
)
AND option_group = 'Boisson 33CL incluse';

-- Supprimer les tailles créées (si existantes)
DELETE FROM france_product_sizes
WHERE product_id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'sandwichs'
);

-- Supprimer les variantes créées (si existantes) 
DELETE FROM france_product_variants
WHERE product_id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'sandwichs'
);

-- Supprimer les composite_items créés (si existants)
DELETE FROM france_composite_items
WHERE composite_product_id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'sandwichs'
);

-- 3. REMETTRE LES SANDWICHS EN CONFIGURATION SIMPLE
UPDATE france_products 
SET 
    product_type = 'simple',
    workflow_type = NULL,
    requires_steps = false,
    steps_config = NULL
WHERE category_id IN (
    SELECT id FROM france_menu_categories 
    WHERE slug = 'sandwichs'
);

-- 4. VÉRIFICATION APRÈS CORRECTION
SELECT 'APRÈS CORRECTION - État des SANDWICHS:' as info;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    CASE WHEN p.steps_config IS NULL THEN 'NON' ELSE 'OUI' END as has_steps_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs'
ORDER BY p.name
LIMIT 5;

-- 5. COMPTEURS FINAUX
SELECT 
    COUNT(*) as nb_total_sandwichs,
    COUNT(CASE WHEN product_type = 'simple' THEN 1 END) as nb_simple,
    COUNT(CASE WHEN product_type = 'composite' THEN 1 END) as nb_composite_restant,
    COUNT(CASE WHEN steps_config IS NOT NULL THEN 1 END) as nb_avec_config_restant
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs';

-- 6. MESSAGE DE SUCCÈS
SELECT '✅ SANDWICHS REMIS EN CONFIGURATION SIMPLE - Prêts à fonctionner normalement!' as resultat;

COMMIT;