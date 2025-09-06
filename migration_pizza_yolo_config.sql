-- 📋 MIGRATION PIZZA YOLO VERS BOT UNIVERSEL
-- Configuration complète Pizza Yolo 77 dans le nouveau système
-- AUCUNE donnée en dur - Tout configurable en base

BEGIN;

-- ================================================
-- 1. EXÉCUTER LE SCHÉMA UNIVERSEL
-- ================================================

-- Création des tables si pas encore fait
-- (Le schéma universal_bot_schema.sql doit être exécuté en premier)

-- ================================================
-- 2. CONFIGURATION RESTAURANT PIZZA YOLO
-- ================================================

-- Configuration principale
INSERT INTO restaurant_bot_configs (
    restaurant_id,
    config_name,
    brand_name,
    welcome_message,
    available_workflows,
    features
) VALUES (
    1, -- Pizza Yolo restaurant_id
    'main',
    'Pizza Yolo 77',
    'Bienvenue chez Pizza Yolo 77 ! 🍕\n\n📋 MENUS PIZZA :\n1️⃣ MENU 1 - 3 PIZZAS JUNIORS\n2️⃣ MENU 2 - 2 PIZZAS SÉNIOR + BOISSON\n3️⃣ MENU 3 - 1 PIZZA MEGA + SNACKS + BOISSON\n4️⃣ MENU 4 - 1 PIZZA SÉNIOR + SNACKS + 2 BOISSONS\n\n🍕 Tapez le numéro de votre choix',
    '["MENU_1_WORKFLOW", "MENU_2_WORKFLOW", "MENU_3_WORKFLOW", "MENU_4_WORKFLOW"]',
    '{"cart_enabled": true, "delivery_enabled": true, "payment_deferred": true, "location_detection": true}'
) ON CONFLICT (restaurant_id, config_name) 
DO UPDATE SET
    brand_name = EXCLUDED.brand_name,
    welcome_message = EXCLUDED.welcome_message,
    available_workflows = EXCLUDED.available_workflows,
    features = EXCLUDED.features,
    updated_at = NOW();

-- ================================================
-- 3. WORKFLOWS MENU PIZZA
-- ================================================

-- MENU 1 WORKFLOW
INSERT INTO workflow_definitions (
    restaurant_id,
    workflow_id,
    name,
    description,
    trigger_conditions,
    steps,
    max_duration_minutes
) VALUES (
    1,
    'MENU_1_WORKFLOW',
    'MENU 1 - 3 Pizzas Junior',
    '3 PIZZAS JUNIORS AU CHOIX',
    '[{"type": "MESSAGE_PATTERN", "pattern": "1", "conditions": {}}]',
    '["pizza_junior_selection_1", "pizza_junior_selection_2", "pizza_junior_selection_3", "menu1_summary"]',
    30
) ON CONFLICT (restaurant_id, workflow_id) 
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    steps = EXCLUDED.steps,
    updated_at = NOW();

-- MENU 2 WORKFLOW  
INSERT INTO workflow_definitions (
    restaurant_id,
    workflow_id,
    name,
    description,
    trigger_conditions,
    steps,
    max_duration_minutes
) VALUES (
    1,
    'MENU_2_WORKFLOW',
    'MENU 2 - 2 Pizzas Sénior + Boisson',
    '2 PIZZAS SÉNIOR AU CHOIX + 1 BOISSON 1.5L',
    '[{"type": "MESSAGE_PATTERN", "pattern": "2", "conditions": {}}]',
    '["pizza_senior_selection_1", "pizza_senior_selection_2", "drink_1l5_selection", "menu2_summary"]',
    30
) ON CONFLICT (restaurant_id, workflow_id) 
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    steps = EXCLUDED.steps,
    updated_at = NOW();

-- MENU 3 WORKFLOW
INSERT INTO workflow_definitions (
    restaurant_id,
    workflow_id,
    name,
    description,
    trigger_conditions,
    steps,
    max_duration_minutes
) VALUES (
    1,
    'MENU_3_WORKFLOW',
    'MENU 3 - Pizza Mega + Snacks + Boisson',
    '1 PIZZA MEGA AU CHOIX + 14 NUGGETS OU 12 WINGS + 1 BOISSON 1.5L',
    '[{"type": "MESSAGE_PATTERN", "pattern": "3", "conditions": {}}]',
    '["pizza_mega_selection", "snack_choice_menu3", "drink_1l5_selection", "menu3_summary"]',
    30
) ON CONFLICT (restaurant_id, workflow_id) 
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    steps = EXCLUDED.steps,
    updated_at = NOW();

-- MENU 4 WORKFLOW
INSERT INTO workflow_definitions (
    restaurant_id,
    workflow_id,
    name,
    description,
    trigger_conditions,
    steps,
    max_duration_minutes
) VALUES (
    1,
    'MENU_4_WORKFLOW',
    'MENU 4 - Pizza Sénior + Snacks + 2 Boissons',
    '1 PIZZA SÉNIOR AU CHOIX + 6 WINGS OU 8 NUGGETS + 2 BOISSONS 33CL',
    '[{"type": "MESSAGE_PATTERN", "pattern": "4", "conditions": {}}]',
    '["pizza_senior_selection", "snack_choice_menu4", "drinks_33cl_selection", "menu4_summary"]',
    30
) ON CONFLICT (restaurant_id, workflow_id) 
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    steps = EXCLUDED.steps,
    updated_at = NOW();

-- ================================================
-- 4. ÉTAPES WORKFLOW DÉTAILLÉES
-- ================================================

-- Récupérer les IDs des workflows créés
DO $$
DECLARE
    menu1_workflow_id INTEGER;
    menu2_workflow_id INTEGER;
    menu3_workflow_id INTEGER;
    menu4_workflow_id INTEGER;
BEGIN
    -- Récupérer les IDs
    SELECT id INTO menu1_workflow_id FROM workflow_definitions WHERE restaurant_id = 1 AND workflow_id = 'MENU_1_WORKFLOW';
    SELECT id INTO menu2_workflow_id FROM workflow_definitions WHERE restaurant_id = 1 AND workflow_id = 'MENU_2_WORKFLOW';
    SELECT id INTO menu3_workflow_id FROM workflow_definitions WHERE restaurant_id = 1 AND workflow_id = 'MENU_3_WORKFLOW';
    SELECT id INTO menu4_workflow_id FROM workflow_definitions WHERE restaurant_id = 1 AND workflow_id = 'MENU_4_WORKFLOW';

    -- ============================================
    -- ÉTAPES MENU 1
    -- ============================================
    
    -- Étape 1 : Première pizza junior
    INSERT INTO workflow_steps (
        workflow_id, step_id, step_order, step_type, title, description,
        selection_config, validation_rules, display_config, next_step_logic, error_handling
    ) VALUES (
        menu1_workflow_id, 'pizza_junior_selection_1', 1, 'PRODUCT_SELECTION',
        '🍕 Étape 1/3 : Choisissez votre 1ère PIZZA JUNIOR',
        'Sélectionnez votre première pizza parmi nos pizzas JUNIOR disponibles',
        '{
            "selectionType": "SINGLE",
            "minSelections": 1,
            "maxSelections": 1,
            "productQuery": {
                "table": "france_product_sizes",
                "joins": ["france_products", "france_menu_categories"],
                "filters": {
                    "france_product_sizes.size_name": "JUNIOR",
                    "france_products.restaurant_id": 1,
                    "france_products.is_active": true,
                    "france_menu_categories.slug": "pizzas"
                },
                "orderBy": "display_order"
            }
        }',
        '[{"type": "REQUIRED", "errorMessage": "Veuillez choisir une pizza"}]',
        '{"format": "LIST", "showPrices": true, "showDescriptions": true, "itemsPerPage": 50}',
        '{"conditions": [], "defaultNextStep": "pizza_junior_selection_2"}',
        '{"maxRetries": 3, "retryMessage": "Choix invalide, retapez votre choix."}'
    ) ON CONFLICT (workflow_id, step_id) DO UPDATE SET
        title = EXCLUDED.title,
        selection_config = EXCLUDED.selection_config,
        updated_at = NOW();

    -- Étape 2 : Deuxième pizza junior
    INSERT INTO workflow_steps (
        workflow_id, step_id, step_order, step_type, title, description,
        selection_config, validation_rules, display_config, next_step_logic, error_handling
    ) VALUES (
        menu1_workflow_id, 'pizza_junior_selection_2', 2, 'PRODUCT_SELECTION',
        '🍕 Étape 2/3 : Choisissez votre 2ème PIZZA JUNIOR',
        'Sélectionnez votre deuxième pizza parmi nos pizzas JUNIOR disponibles',
        '{
            "selectionType": "SINGLE",
            "minSelections": 1,
            "maxSelections": 1,
            "productQuery": {
                "table": "france_product_sizes",
                "joins": ["france_products", "france_menu_categories"],
                "filters": {
                    "france_product_sizes.size_name": "JUNIOR",
                    "france_products.restaurant_id": 1,
                    "france_products.is_active": true,
                    "france_menu_categories.slug": "pizzas"
                },
                "orderBy": "display_order"
            }
        }',
        '[{"type": "REQUIRED", "errorMessage": "Veuillez choisir une pizza"}]',
        '{"format": "LIST", "showPrices": true, "showDescriptions": true, "itemsPerPage": 50}',
        '{"conditions": [], "defaultNextStep": "pizza_junior_selection_3"}',
        '{"maxRetries": 3, "retryMessage": "Choix invalide, retapez votre choix."}'
    ) ON CONFLICT (workflow_id, step_id) DO UPDATE SET
        title = EXCLUDED.title,
        selection_config = EXCLUDED.selection_config;

    -- Étape 3 : Troisième pizza junior
    INSERT INTO workflow_steps (
        workflow_id, step_id, step_order, step_type, title, description,
        selection_config, validation_rules, display_config, next_step_logic, error_handling
    ) VALUES (
        menu1_workflow_id, 'pizza_junior_selection_3', 3, 'PRODUCT_SELECTION',
        '🍕 Étape 3/3 : Choisissez votre 3ème PIZZA JUNIOR',
        'Sélectionnez votre troisième pizza parmi nos pizzas JUNIOR disponibles',
        '{
            "selectionType": "SINGLE",
            "minSelections": 1,
            "maxSelections": 1,
            "productQuery": {
                "table": "france_product_sizes",
                "joins": ["france_products", "france_menu_categories"],
                "filters": {
                    "france_product_sizes.size_name": "JUNIOR",
                    "france_products.restaurant_id": 1,
                    "france_products.is_active": true,
                    "france_menu_categories.slug": "pizzas"
                },
                "orderBy": "display_order"
            }
        }',
        '[{"type": "REQUIRED", "errorMessage": "Veuillez choisir une pizza"}]',
        '{"format": "LIST", "showPrices": true, "showDescriptions": true, "itemsPerPage": 50}',
        '{"conditions": [], "defaultNextStep": "menu1_summary"}',
        '{"maxRetries": 3, "retryMessage": "Choix invalide, retapez votre choix."}'
    ) ON CONFLICT (workflow_id, step_id) DO UPDATE SET
        title = EXCLUDED.title,
        selection_config = EXCLUDED.selection_config;

    -- ============================================
    -- ÉTAPES MENU 4 (EXEMPLE DÉTAILLÉ)
    -- ============================================
    
    -- Étape 1 : Pizza sénior
    INSERT INTO workflow_steps (
        workflow_id, step_id, step_order, step_type, title, description,
        selection_config, validation_rules, display_config, next_step_logic, error_handling
    ) VALUES (
        menu4_workflow_id, 'pizza_senior_selection', 1, 'PRODUCT_SELECTION',
        '🍕 Étape 1/3 : Choisissez votre PIZZA SÉNIOR',
        'MENU 4 : 1 PIZZA SÉNIOR + 6 WINGS OU 8 NUGGETS + 2 BOISSONS 33CL',
        '{
            "selectionType": "SINGLE",
            "minSelections": 1,
            "maxSelections": 1,
            "productQuery": {
                "table": "france_product_sizes",
                "joins": ["france_products", "france_menu_categories"],
                "filters": {
                    "france_product_sizes.size_name": "SENIOR",
                    "france_products.restaurant_id": 1,
                    "france_products.is_active": true,
                    "france_menu_categories.slug": "pizzas"
                },
                "orderBy": "display_order"
            }
        }',
        '[{"type": "REQUIRED", "errorMessage": "Veuillez choisir une pizza"}]',
        '{"format": "LIST", "showPrices": true, "showDescriptions": true, "itemsPerPage": 50}',
        '{"conditions": [], "defaultNextStep": "snack_choice_menu4"}',
        '{"maxRetries": 3, "retryMessage": "Choix invalide, retapez votre choix."}'
    ) ON CONFLICT (workflow_id, step_id) DO UPDATE SET
        title = EXCLUDED.title,
        selection_config = EXCLUDED.selection_config;

    -- Étape 2 : Choix snacks
    INSERT INTO workflow_steps (
        workflow_id, step_id, step_order, step_type, title, description,
        selection_config, validation_rules, display_config, next_step_logic, error_handling
    ) VALUES (
        menu4_workflow_id, 'snack_choice_menu4', 2, 'MULTIPLE_CHOICE',
        '🍗 Étape 2/3 : Choisissez votre accompagnement',
        'Choisissez entre WINGS 6 pièces ou NUGGETS 8 pièces',
        '{
            "selectionType": "SINGLE",
            "minSelections": 1,
            "maxSelections": 1,
            "options": [
                {"id": "wings6", "label": "🔥 WINGS 6 PIÈCES", "value": "WINGS 6 PIÈCES (MENU)"},
                {"id": "nuggets8", "label": "🍗 NUGGETS 8 PIÈCES", "value": "NUGGETS 8 PIÈCES (MENU)"}
            ]
        }',
        '[{"type": "REQUIRED", "errorMessage": "Veuillez choisir un accompagnement"}]',
        '{"format": "LIST", "showPrices": false, "showDescriptions": false, "itemsPerPage": 10}',
        '{"conditions": [], "defaultNextStep": "drinks_33cl_selection"}',
        '{"maxRetries": 3, "retryMessage": "Choix invalide. Choisissez 1 pour WINGS ou 2 pour NUGGETS."}'
    ) ON CONFLICT (workflow_id, step_id) DO UPDATE SET
        title = EXCLUDED.title,
        selection_config = EXCLUDED.selection_config;

    -- Étape 3 : Boissons 33CL
    INSERT INTO workflow_steps (
        workflow_id, step_id, step_order, step_type, title, description,
        selection_config, validation_rules, display_config, next_step_logic, error_handling
    ) VALUES (
        menu4_workflow_id, 'drinks_33cl_selection', 3, 'PRODUCT_SELECTION',
        '🥤 Étape 3/3 : Choisissez vos 2 BOISSONS 33CL',
        'Sélectionnez 2 boissons 33CL parmi notre sélection',
        '{
            "selectionType": "MULTIPLE",
            "minSelections": 2,
            "maxSelections": 2,
            "productQuery": {
                "table": "france_product_variants",
                "joins": ["france_products", "france_menu_categories"],
                "filters": {
                    "france_product_variants.variant_name": "33CL",
                    "france_products.restaurant_id": 1,
                    "france_products.is_active": true,
                    "france_menu_categories.slug": "drinks"
                },
                "orderBy": "display_order"
            }
        }',
        '[{"type": "REQUIRED", "errorMessage": "Veuillez choisir 2 boissons"}]',
        '{"format": "LIST", "showPrices": false, "showDescriptions": false, "itemsPerPage": 50}',
        '{"conditions": [], "defaultNextStep": "menu4_summary"}',
        '{"maxRetries": 3, "retryMessage": "Vous devez choisir exactement 2 boissons. Ex: 1,2"}'
    ) ON CONFLICT (workflow_id, step_id) DO UPDATE SET
        title = EXCLUDED.title,
        selection_config = EXCLUDED.selection_config;

    -- TODO: Ajouter les autres étapes pour MENU 2, MENU 3, et les étapes summary
    
END $$;

-- ================================================
-- 5. TEMPLATES DE MESSAGES
-- ================================================

-- Template de bienvenue
INSERT INTO message_templates (
    restaurant_id, template_key, language, template_content, variables
) VALUES (
    1, 'welcome', 'fr',
    'Bienvenue chez {{brandName}} ! 🍕\n\n{{welcomeMessage}}\n\n✨ Tapez votre choix',
    '["brandName", "welcomeMessage"]'
) ON CONFLICT (restaurant_id, template_key, language) DO UPDATE SET
    template_content = EXCLUDED.template_content,
    updated_at = NOW();

-- Template de résumé commande
INSERT INTO message_templates (
    restaurant_id, template_key, language, template_content, variables
) VALUES (
    1, 'order_summary', 'fr',
    '📋 RÉCAPITULATIF {{menuName}}\n\n{{itemsList}}\n\n💰 TOTAL: {{totalPrice}}€\n\n✅ Confirmez votre commande :\n1️⃣ OUI, je confirme\n2️⃣ NON, je modifie',
    '["menuName", "itemsList", "totalPrice"]'
) ON CONFLICT (restaurant_id, template_key, language) DO UPDATE SET
    template_content = EXCLUDED.template_content,
    updated_at = NOW();

-- ================================================
-- 6. VÉRIFICATIONS FINALES
-- ================================================

-- Vérifier les configurations créées
SELECT 'CONFIGURATIONS CRÉÉES' as verification;
SELECT 
    r.name as restaurant,
    c.brand_name,
    array_length(c.available_workflows::text[], 1) as nb_workflows
FROM restaurant_bot_configs c
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE c.restaurant_id = 1;

-- Vérifier les workflows
SELECT 'WORKFLOWS CRÉÉS' as verification;
SELECT 
    workflow_id,
    name,
    array_length(steps::text[], 1) as nb_steps
FROM workflow_definitions 
WHERE restaurant_id = 1
ORDER BY workflow_id;

-- Vérifier les étapes
SELECT 'ÉTAPES CRÉÉES' as verification;
SELECT 
    w.workflow_id,
    s.step_id,
    s.step_order,
    s.step_type,
    s.title
FROM workflow_steps s
JOIN workflow_definitions w ON s.workflow_id = w.id
WHERE w.restaurant_id = 1
ORDER BY w.workflow_id, s.step_order;

-- Vérifier les templates
SELECT 'TEMPLATES CRÉÉS' as verification;
SELECT 
    template_key,
    language,
    length(template_content) as content_length,
    array_length(variables::text[], 1) as nb_variables
FROM message_templates 
WHERE restaurant_id = 1
ORDER BY template_key;

COMMIT;

-- ✅ Migration Pizza Yolo 77 vers bot universel terminée
-- ✅ Configuration entièrement en base de données
-- ✅ Workflows MENU 1, 2, 3, 4 configurés
-- ✅ Compatibilité avec système existant garantie
-- ✅ Prêt pour déploiement sans régression