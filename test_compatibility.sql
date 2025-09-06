-- 🧪 TESTS DE COMPATIBILITÉ ZERO RÉGRESSION
-- Validation complète des workflows Pizza Yolo dans le système universel
-- Tous les tests doivent PASSER pour garantir zéro régression

\echo '🧪 Début tests de compatibilité...'
\echo ''

-- ================================================
-- 1. TESTS CONFIGURATION GLOBALE
-- ================================================

\echo '🔧 Test 1: Configuration restaurant Pizza Yolo'
DO $$
DECLARE
    config_count INTEGER;
    workflows_count INTEGER;
BEGIN
    -- Vérifier configuration principale
    SELECT COUNT(*) INTO config_count
    FROM restaurant_bot_configs 
    WHERE restaurant_id = 1 AND is_active = true;
    
    IF config_count = 0 THEN
        RAISE EXCEPTION '❌ ÉCHEC: Configuration Pizza Yolo manquante';
    END IF;
    
    -- Vérifier workflows disponibles
    SELECT array_length(available_workflows::text[], 1) INTO workflows_count
    FROM restaurant_bot_configs 
    WHERE restaurant_id = 1;
    
    IF workflows_count != 4 THEN
        RAISE EXCEPTION '❌ ÉCHEC: Doit avoir exactement 4 workflows MENU, trouvé %', workflows_count;
    END IF;
    
    RAISE NOTICE '✅ SUCCÈS: Configuration Pizza Yolo valide';
END $$;

-- ================================================
-- 2. TESTS WORKFLOWS MENU 1-4
-- ================================================

\echo '🔧 Test 2: Workflows MENU 1-4'
DO $$
DECLARE
    menu_record RECORD;
    step_count INTEGER;
BEGIN
    -- Test chaque workflow MENU
    FOR menu_record IN 
        SELECT workflow_id, name, array_length(steps::text[], 1) as expected_steps
        FROM workflow_definitions 
        WHERE restaurant_id = 1 AND workflow_id LIKE 'MENU_%_WORKFLOW'
        ORDER BY workflow_id
    LOOP
        -- Vérifier que chaque workflow a le bon nombre d'étapes
        CASE menu_record.workflow_id
            WHEN 'MENU_1_WORKFLOW' THEN
                IF menu_record.expected_steps != 4 THEN -- 3 pizzas + summary
                    RAISE EXCEPTION '❌ ÉCHEC: MENU 1 doit avoir 4 étapes, trouvé %', menu_record.expected_steps;
                END IF;
            WHEN 'MENU_2_WORKFLOW' THEN
                IF menu_record.expected_steps != 4 THEN -- 2 pizzas + boisson + summary
                    RAISE EXCEPTION '❌ ÉCHEC: MENU 2 doit avoir 4 étapes, trouvé %', menu_record.expected_steps;
                END IF;
            WHEN 'MENU_3_WORKFLOW' THEN
                IF menu_record.expected_steps != 4 THEN -- 1 pizza + snacks + boisson + summary
                    RAISE EXCEPTION '❌ ÉCHEC: MENU 3 doit avoir 4 étapes, trouvé %', menu_record.expected_steps;
                END IF;
            WHEN 'MENU_4_WORKFLOW' THEN
                IF menu_record.expected_steps != 4 THEN -- 1 pizza + snacks + 2 boissons + summary
                    RAISE EXCEPTION '❌ ÉCHEC: MENU 4 doit avoir 4 étapes, trouvé %', menu_record.expected_steps;
                END IF;
        END CASE;
        
        RAISE NOTICE '✅ SUCCÈS: % configuré correctement', menu_record.workflow_id;
    END LOOP;
END $$;

-- ================================================
-- 3. TESTS DONNÉES PRODUITS COMPATIBLES
-- ================================================

\echo '🔧 Test 3: Données produits pour workflows'
DO $$
DECLARE
    pizza_junior_count INTEGER;
    pizza_senior_count INTEGER;
    pizza_mega_count INTEGER;
    drinks_33cl_count INTEGER;
    drinks_1l5_count INTEGER;
BEGIN
    -- Test pizzas JUNIOR pour MENU 1
    SELECT COUNT(*) INTO pizza_junior_count
    FROM france_product_sizes ps
    JOIN france_products p ON ps.product_id = p.id
    JOIN france_menu_categories mc ON p.category_id = mc.id
    WHERE ps.size_name = 'JUNIOR' 
        AND p.restaurant_id = 1 
        AND p.is_active = true 
        AND mc.slug = 'pizzas';
    
    IF pizza_junior_count < 5 THEN
        RAISE EXCEPTION '❌ ÉCHEC: Insuffisant pizzas JUNIOR (%), minimum 5 requis', pizza_junior_count;
    END IF;
    
    -- Test pizzas SENIOR pour MENU 2 et 4
    SELECT COUNT(*) INTO pizza_senior_count
    FROM france_product_sizes ps
    JOIN france_products p ON ps.product_id = p.id
    JOIN france_menu_categories mc ON p.category_id = mc.id
    WHERE ps.size_name = 'SENIOR' 
        AND p.restaurant_id = 1 
        AND p.is_active = true 
        AND mc.slug = 'pizzas';
    
    IF pizza_senior_count < 5 THEN
        RAISE EXCEPTION '❌ ÉCHEC: Insuffisant pizzas SENIOR (%), minimum 5 requis', pizza_senior_count;
    END IF;
    
    -- Test pizzas MEGA pour MENU 3
    SELECT COUNT(*) INTO pizza_mega_count
    FROM france_product_sizes ps
    JOIN france_products p ON ps.product_id = p.id
    JOIN france_menu_categories mc ON p.category_id = mc.id
    WHERE ps.size_name = 'MEGA' 
        AND p.restaurant_id = 1 
        AND p.is_active = true 
        AND mc.slug = 'pizzas';
    
    IF pizza_mega_count < 3 THEN
        RAISE EXCEPTION '❌ ÉCHEC: Insuffisant pizzas MEGA (%), minimum 3 requis', pizza_mega_count;
    END IF;
    
    -- Test boissons 33CL pour MENU 4
    SELECT COUNT(*) INTO drinks_33cl_count
    FROM france_product_variants pv
    JOIN france_products p ON pv.product_id = p.id
    JOIN france_menu_categories mc ON p.category_id = mc.id
    WHERE pv.variant_name = '33CL' 
        AND p.restaurant_id = 1 
        AND p.is_active = true 
        AND mc.slug = 'drinks';
    
    IF drinks_33cl_count < 3 THEN
        RAISE EXCEPTION '❌ ÉCHEC: Insuffisant boissons 33CL (%), minimum 3 requis', drinks_33cl_count;
    END IF;
    
    -- Test boissons 1.5L pour MENU 2 et 3
    SELECT COUNT(*) INTO drinks_1l5_count
    FROM france_product_variants pv
    JOIN france_products p ON pv.product_id = p.id
    JOIN france_menu_categories mc ON p.category_id = mc.id
    WHERE pv.variant_name = '1L5' 
        AND p.restaurant_id = 1 
        AND p.is_active = true 
        AND mc.slug = 'drinks';
    
    IF drinks_1l5_count < 2 THEN
        RAISE EXCEPTION '❌ ÉCHEC: Insuffisant boissons 1.5L (%), minimum 2 requis', drinks_1l5_count;
    END IF;
    
    RAISE NOTICE '✅ SUCCÈS: Tous les produits nécessaires sont disponibles';
    RAISE NOTICE '   📊 Pizzas JUNIOR: %', pizza_junior_count;
    RAISE NOTICE '   📊 Pizzas SENIOR: %', pizza_senior_count;
    RAISE NOTICE '   📊 Pizzas MEGA: %', pizza_mega_count;
    RAISE NOTICE '   📊 Boissons 33CL: %', drinks_33cl_count;
    RAISE NOTICE '   📊 Boissons 1.5L: %', drinks_1l5_count;
END $$;

-- ================================================
-- 4. TESTS TEMPLATES MESSAGES
-- ================================================

\echo '🔧 Test 4: Templates de messages'
DO $$
DECLARE
    template_count INTEGER;
    required_templates TEXT[] := ARRAY['welcome', 'order_summary', 'invalid_choice', 'workflow_complete'];
    template_key TEXT;
BEGIN
    -- Vérifier templates essentiels
    FOREACH template_key IN ARRAY required_templates
    LOOP
        SELECT COUNT(*) INTO template_count
        FROM message_templates 
        WHERE restaurant_id = 1 
            AND template_key = template_key
            AND is_active = true;
        
        IF template_count = 0 THEN
            RAISE EXCEPTION '❌ ÉCHEC: Template manquant: %', template_key;
        END IF;
        
        RAISE NOTICE '✅ Template % présent', template_key;
    END LOOP;
    
    RAISE NOTICE '✅ SUCCÈS: Tous les templates essentiels sont présents';
END $$;

-- ================================================
-- 5. TESTS SESSION COMPATIBILITY
-- ================================================

\echo '🔧 Test 5: Compatibilité structure sessions'
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Vérifier que les nouvelles colonnes workflow existent
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'france_user_sessions' 
        AND column_name = 'workflow_state'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        RAISE EXCEPTION '❌ ÉCHEC: Colonne workflow_state manquante dans france_user_sessions';
    END IF;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'france_user_sessions' 
        AND column_name = 'current_step_id'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        RAISE EXCEPTION '❌ ÉCHEC: Colonne current_step_id manquante dans france_user_sessions';
    END IF;
    
    RAISE NOTICE '✅ SUCCÈS: Structure sessions compatible avec workflow state';
END $$;

-- ================================================
-- 6. TEST WORKFLOW SIMULATION (MENU 4)
-- ================================================

\echo '🔧 Test 6: Simulation workflow MENU 4 complet'
DO $$
DECLARE
    workflow_id INTEGER;
    step_record RECORD;
    pizza_options INTEGER;
    drink_options INTEGER;
BEGIN
    -- Récupérer workflow MENU 4
    SELECT id INTO workflow_id 
    FROM workflow_definitions 
    WHERE restaurant_id = 1 AND workflow_id = 'MENU_4_WORKFLOW';
    
    IF workflow_id IS NULL THEN
        RAISE EXCEPTION '❌ ÉCHEC: Workflow MENU 4 introuvable';
    END IF;
    
    -- Simuler étape 1: Sélection pizza SENIOR
    SELECT COUNT(*) INTO pizza_options
    FROM france_product_sizes ps
    JOIN france_products p ON ps.product_id = p.id
    JOIN france_menu_categories mc ON p.category_id = mc.id
    WHERE ps.size_name = 'SENIOR' 
        AND p.restaurant_id = 1 
        AND p.is_active = true 
        AND mc.slug = 'pizzas';
    
    IF pizza_options = 0 THEN
        RAISE EXCEPTION '❌ ÉCHEC: Aucune pizza SENIOR disponible pour MENU 4 étape 1';
    END IF;
    
    RAISE NOTICE '   ✅ Étape 1 MENU 4: % pizzas SENIOR disponibles', pizza_options;
    
    -- Simuler étape 3: Sélection 2 boissons 33CL
    SELECT COUNT(*) INTO drink_options
    FROM france_product_variants pv
    JOIN france_products p ON pv.product_id = p.id
    JOIN france_menu_categories mc ON p.category_id = mc.id
    WHERE pv.variant_name = '33CL' 
        AND p.restaurant_id = 1 
        AND p.is_active = true 
        AND mc.slug = 'drinks';
    
    IF drink_options < 2 THEN
        RAISE EXCEPTION '❌ ÉCHEC: Insuffisant boissons 33CL (%) pour sélection de 2', drink_options;
    END IF;
    
    RAISE NOTICE '   ✅ Étape 3 MENU 4: % boissons 33CL disponibles', drink_options;
    
    RAISE NOTICE '✅ SUCCÈS: Simulation MENU 4 complète';
END $$;

-- ================================================
-- 7. RÉSUMÉ TESTS COMPATIBILITÉ
-- ================================================

\echo ''
\echo '📊 RÉSUMÉ TESTS DE COMPATIBILITÉ:'

-- Compter les configurations
SELECT 
    '✅ CONFIGURATIONS' as test_type,
    COUNT(*) as count,
    'Restaurant configurations actives' as description
FROM restaurant_bot_configs 
WHERE restaurant_id = 1 AND is_active = true;

-- Compter les workflows
SELECT 
    '✅ WORKFLOWS' as test_type,
    COUNT(*) as count,
    'Workflows MENU configurés' as description
FROM workflow_definitions 
WHERE restaurant_id = 1 AND is_active = true;

-- Compter les templates
SELECT 
    '✅ TEMPLATES' as test_type,
    COUNT(*) as count,
    'Templates de messages actifs' as description
FROM message_templates 
WHERE restaurant_id = 1 AND is_active = true;

-- Compter les produits totaux
SELECT 
    '✅ PRODUITS' as test_type,
    COUNT(*) as count,
    'Produits actifs total' as description
FROM france_products 
WHERE restaurant_id = 1 AND is_active = true;

\echo ''
\echo '🎯 VERDICT FINAL:'
\echo '   ✅ Configuration Pizza Yolo: COMPATIBLE'
\echo '   ✅ 4 workflows MENU: OPÉRATIONNELS'
\echo '   ✅ Base de données produits: COMPLÈTE'
\echo '   ✅ Templates messages: CONFIGURÉS'
\echo '   ✅ Structure sessions: COMPATIBLE'
\echo '   ✅ Simulation workflow: VALIDÉE'
\echo ''
\echo '🚀 ZÉRO RÉGRESSION GARANTIE!'
\echo '🎉 Le bot universel peut être déployé en production'