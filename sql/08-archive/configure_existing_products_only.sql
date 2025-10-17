-- 🔧 CONFIGURATION DES PRODUITS EXISTANTS SEULEMENT
-- ⚠️ RESPECT TOTAL DE L'EXISTANT - AUCUN NOUVEAU PRODUIT AJOUTÉ

BEGIN;

-- ============================================================================
-- 1. CONFIGURATION DES WORKFLOWS POUR PRODUITS MODULAR EXISTANTS
-- ============================================================================

-- BURGERS (5 produits existants - type modular)
UPDATE france_products SET 
    workflow_type = 'modular_selection',
    requires_steps = true
WHERE restaurant_id = 1 
  AND category_id = 2 
  AND product_type = 'modular'
  AND workflow_type IS NULL;

-- SANDWICHS (5 produits existants - type modular)
UPDATE france_products SET 
    workflow_type = 'modular_selection',
    requires_steps = true
WHERE restaurant_id = 1 
  AND category_id = 3 
  AND product_type = 'modular'
  AND workflow_type IS NULL;

-- GOURMETS (6 produits existants - type modular)
UPDATE france_products SET 
    workflow_type = 'modular_selection',
    requires_steps = true
WHERE restaurant_id = 1 
  AND category_id = 4 
  AND product_type = 'modular'
  AND workflow_type IS NULL;

-- SMASHS (6 produits existants - type modular)
UPDATE france_products SET 
    workflow_type = 'modular_selection',
    requires_steps = true
WHERE restaurant_id = 1 
  AND category_id = 5 
  AND product_type = 'modular'
  AND workflow_type IS NULL;

-- ASSIETTES (3 produits existants - type modular)
UPDATE france_products SET 
    workflow_type = 'modular_selection',
    requires_steps = true
WHERE restaurant_id = 1 
  AND category_id = 6 
  AND product_type = 'modular'
  AND workflow_type IS NULL;

-- NAANS (4 produits existants - type modular)
UPDATE france_products SET 
    workflow_type = 'modular_selection',
    requires_steps = true
WHERE restaurant_id = 1 
  AND category_id = 7 
  AND product_type = 'modular'
  AND workflow_type IS NULL;

-- PANINI (5 produits existants - type modular)
UPDATE france_products SET 
    workflow_type = 'modular_selection',
    requires_steps = true
WHERE restaurant_id = 1 
  AND category_id = 17 
  AND product_type = 'modular'
  AND workflow_type IS NULL;

-- ICE CREAM (4 produits existants - type simple - laissés inchangés)
-- DESSERTS (8 produits existants - type simple - laissés inchangés)  
-- DRINKS (16 produits existants - type simple/variant - laissés inchangés)
-- SALADES (6 produits existants - type simple - laissés inchangés)
-- PÂTES (5 produits existants - type simple - laissés inchangés)

-- TEX-MEX (3 produits existants - type simple - laissés inchangés)
-- Note: Ces produits sont CHICKEN WINGS, NUGGETS, TENDERS (type simple)

-- ============================================================================
-- 2. CONFIGURATION DES WORKFLOWS POUR PRODUITS COMPOSITE EXISTANTS
-- ============================================================================

-- Menu Pizza (4 produits existants - type composite)
UPDATE france_products SET 
    workflow_type = 'composite_selection',
    requires_steps = true
WHERE restaurant_id = 1 
  AND category_id = 11 
  AND product_type = 'composite'
  AND workflow_type IS NULL;

-- MENU FAMILY (1 produit existant - type composite)
UPDATE france_products SET 
    workflow_type = 'composite_selection',
    requires_steps = true
WHERE restaurant_id = 1 
  AND category_id = 8 
  AND name = 'MENU FAMILY'
  AND product_type = 'composite'
  AND workflow_type IS NULL;

-- ============================================================================
-- 3. VÉRIFICATIONS FINALES
-- ============================================================================

-- Vérifier que tous les workflows sont configurés
SELECT 
    c.name as categorie,
    COUNT(p.id) as total_produits,
    COUNT(CASE WHEN p.workflow_type IS NOT NULL THEN 1 END) as avec_workflow,
    COUNT(CASE WHEN p.workflow_type IS NULL AND p.product_type IN ('modular', 'composite') THEN 1 END) as sans_workflow
FROM france_menu_categories c
LEFT JOIN france_products p ON p.category_id = c.id AND p.restaurant_id = 1
WHERE c.restaurant_id = 1
  AND p.product_type IN ('modular', 'composite')
GROUP BY c.id, c.name
ORDER BY c.display_order;

-- Vérifier les produits configurés par type
SELECT 
    p.workflow_type,
    COUNT(*) as nb_produits,
    string_agg(DISTINCT c.name, ', ') as categories
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 1 
  AND p.workflow_type IS NOT NULL
GROUP BY p.workflow_type
ORDER BY p.workflow_type;

-- Vérifier qu'aucun produit simple n'a été modifié
SELECT 
    c.name as categorie,
    COUNT(*) as nb_produits_simple
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 1 
  AND p.product_type = 'simple'
  AND (p.workflow_type IS NOT NULL OR p.requires_steps = true)
GROUP BY c.name;

COMMIT;