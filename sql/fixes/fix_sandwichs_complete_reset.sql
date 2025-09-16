-- 🔧 CORRECTION COMPLÈTE : Forcer le reset total des SANDWICHS
-- Problème : Cache/Session garde l'ancienne config même après correction DB

BEGIN;

-- 1. DIAGNOSTIC COMPLET AVANT CORRECTION
\echo '=== AVANT CORRECTION ==='
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    CASE WHEN p.steps_config IS NULL THEN 'NULL' ELSE 'NOT NULL' END as steps_config_status
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs'
ORDER BY p.name
LIMIT 3;

-- 2. NETTOYAGE RADICAL DE TOUTE LA CONFIGURATION COMPOSITE
\echo ''
\echo '=== NETTOYAGE COMPLET ==='

-- Supprimer TOUTES les product_options pour SANDWICHS
DELETE FROM france_product_options
WHERE product_id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'sandwichs'
);

-- Supprimer TOUTES les product_sizes pour SANDWICHS
DELETE FROM france_product_sizes
WHERE product_id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'sandwichs'
);

-- Supprimer TOUTES les product_variants pour SANDWICHS
DELETE FROM france_product_variants
WHERE product_id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'sandwichs'
);

-- Supprimer TOUS les composite_items pour SANDWICHS
DELETE FROM france_composite_items
WHERE composite_product_id IN (
    SELECT p.id 
    FROM france_products p
    JOIN france_menu_categories c ON c.id = p.category_id
    WHERE c.slug = 'sandwichs'
);

-- 3. FORCER LA CONFIGURATION SIMPLE PURE
\echo ''
\echo '=== CONFIGURATION SIMPLE PURE ==='

UPDATE france_products 
SET 
    product_type = 'simple',
    workflow_type = NULL,
    requires_steps = false,
    steps_config = NULL,
    -- FORCER la mise à jour du timestamp pour invalider les caches
    updated_at = NOW()
WHERE category_id IN (
    SELECT id FROM france_menu_categories 
    WHERE slug = 'sandwichs'
);

-- 4. VÉRIFICATION POST-CORRECTION
\echo ''
\echo '=== APRÈS CORRECTION ==='
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    CASE WHEN p.steps_config IS NULL THEN 'NULL' ELSE 'NOT NULL' END as steps_config_status,
    p.updated_at
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs'
ORDER BY p.name
LIMIT 5;

-- 5. COMPTEURS FINAUX DE VÉRIFICATION
\echo ''
\echo '=== COMPTEURS FINAUX ==='
SELECT 
    'SANDWICHS' as category,
    COUNT(*) as total_produits,
    COUNT(CASE WHEN product_type = 'simple' THEN 1 END) as nb_simple,
    COUNT(CASE WHEN product_type = 'composite' THEN 1 END) as nb_composite,
    COUNT(CASE WHEN workflow_type IS NOT NULL THEN 1 END) as nb_avec_workflow,
    COUNT(CASE WHEN requires_steps = true THEN 1 END) as nb_avec_steps,
    COUNT(CASE WHEN steps_config IS NOT NULL THEN 1 END) as nb_avec_config
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs';

-- 6. VÉRIFIER QU'IL N'Y A PLUS RIEN DE COMPOSITE
\echo ''
\echo '=== VÉRIFICATION AUCUN RESTE COMPOSITE ==='
SELECT 
    COUNT(*) as nb_options_restantes
FROM france_product_options fpo
JOIN france_products p ON p.id = fpo.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs';

SELECT 
    COUNT(*) as nb_composite_items_restants
FROM france_composite_items fci
JOIN france_products p ON p.id = fci.composite_product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.slug = 'sandwichs';

-- 7. MESSAGE FINAL
\echo ''
\echo '✅ CORRECTION COMPLÈTE TERMINÉE'
\echo '🔄 REDÉMARRE LE BOT pour vider le cache de session'
\echo '🧪 TESTE ensuite LE GREC pour vérifier le fonctionnement'

COMMIT;