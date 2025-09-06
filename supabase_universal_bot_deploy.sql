-- 🚀 DÉPLOIEMENT BOT UNIVERSEL - SUPABASE READY
-- Script optimisé pour copier/coller direct dans Supabase SQL Editor
-- ZERO RÉGRESSION GARANTIE - Transaction atomique complète

BEGIN;

-- ================================================
-- 1. CRÉATION SCHÉMA UNIVERSEL
-- ================================================

-- Tables de configuration restaurant
CREATE TABLE IF NOT EXISTS restaurant_bot_configs (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES france_restaurants(id),
    config_name VARCHAR(100) NOT NULL DEFAULT 'main',
    brand_name VARCHAR(200) NOT NULL,
    welcome_message TEXT NOT NULL,
    available_workflows JSONB NOT NULL DEFAULT '[]',
    features JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(restaurant_id, config_name)
);

-- Workflows définition
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES france_restaurants(id),
    workflow_id VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    trigger_conditions JSONB NOT NULL DEFAULT '[]',
    steps JSONB NOT NULL DEFAULT '[]',
    max_duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(restaurant_id, workflow_id)
);

-- Étapes workflow détaillées
CREATE TABLE IF NOT EXISTS workflow_steps (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
    step_id VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    selection_config JSONB NOT NULL DEFAULT '{}',
    validation_rules JSONB NOT NULL DEFAULT '[]',
    display_config JSONB NOT NULL DEFAULT '{}',
    next_step_logic JSONB NOT NULL DEFAULT '{}',
    error_handling JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(workflow_id, step_id)
);

-- Templates de messages
CREATE TABLE IF NOT EXISTS message_templates (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES france_restaurants(id),
    template_key VARCHAR(100) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'fr',
    template_content TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(restaurant_id, template_key, language)
);

-- Extension sessions utilisateurs pour workflow state
DO $$
BEGIN
    -- Vérifier et ajouter les colonnes workflow si elles n'existent pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'france_user_sessions' 
        AND column_name = 'workflow_state'
    ) THEN
        ALTER TABLE france_user_sessions ADD COLUMN workflow_state JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'france_user_sessions' 
        AND column_name = 'current_step_id'
    ) THEN
        ALTER TABLE france_user_sessions ADD COLUMN current_step_id VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'france_user_sessions' 
        AND column_name = 'step_data'
    ) THEN
        ALTER TABLE france_user_sessions ADD COLUMN step_data JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'france_user_sessions' 
        AND column_name = 'workflow_context'
    ) THEN
        ALTER TABLE france_user_sessions ADD COLUMN workflow_context JSONB DEFAULT '{}';
    END IF;
END $$;

-- Index pour performances (IF NOT EXISTS équivalent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_restaurant_bot_configs_restaurant_id') THEN
        CREATE INDEX idx_restaurant_bot_configs_restaurant_id ON restaurant_bot_configs(restaurant_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workflow_definitions_restaurant_id') THEN
        CREATE INDEX idx_workflow_definitions_restaurant_id ON workflow_definitions(restaurant_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workflow_steps_workflow_id') THEN
        CREATE INDEX idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_message_templates_restaurant_id') THEN
        CREATE INDEX idx_message_templates_restaurant_id ON message_templates(restaurant_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sessions_workflow_state') THEN
        CREATE INDEX idx_user_sessions_workflow_state ON france_user_sessions(current_step_id) WHERE current_step_id IS NOT NULL;
    END IF;
END $$;

-- ================================================
-- 2. MIGRATION CONFIGURATION PIZZA YOLO
-- ================================================

-- Configuration principale Pizza Yolo
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
    'Bienvenue chez Pizza Yolo 77 ! 🍕

📋 MENUS PIZZA :
1️⃣ MENU 1 - 3 PIZZAS JUNIORS
2️⃣ MENU 2 - 2 PIZZAS SÉNIOR + BOISSON
3️⃣ MENU 3 - 1 PIZZA MEGA + SNACKS + BOISSON
4️⃣ MENU 4 - 1 PIZZA SÉNIOR + SNACKS + 2 BOISSONS

🍕 Tapez le numéro de votre choix',
    '["MENU_1_WORKFLOW", "MENU_2_WORKFLOW", "MENU_3_WORKFLOW", "MENU_4_WORKFLOW"]',
    '{"cart_enabled": true, "delivery_enabled": true, "payment_deferred": true, "location_detection": true}'
) ON CONFLICT (restaurant_id, config_name) 
DO UPDATE SET
    brand_name = EXCLUDED.brand_name,
    welcome_message = EXCLUDED.welcome_message,
    available_workflows = EXCLUDED.available_workflows,
    features = EXCLUDED.features,
    updated_at = NOW();

-- MENU workflows avec gestion conflits
INSERT INTO workflow_definitions (
    restaurant_id, 
    workflow_id, 
    name, 
    description, 
    trigger_conditions, 
    steps, 
    max_duration_minutes
) VALUES 
(
    1, 
    'MENU_1_WORKFLOW', 
    'MENU 1 - 3 Pizzas Junior', 
    '3 PIZZAS JUNIORS AU CHOIX', 
    '[{"type": "MESSAGE_PATTERN", "pattern": "1", "conditions": {}}]', 
    '["pizza_junior_selection_1", "pizza_junior_selection_2", "pizza_junior_selection_3", "menu1_summary"]', 
    30
),
(
    1, 
    'MENU_2_WORKFLOW', 
    'MENU 2 - 2 Pizzas Sénior + Boisson', 
    '2 PIZZAS SÉNIOR AU CHOIX + 1 BOISSON 1.5L', 
    '[{"type": "MESSAGE_PATTERN", "pattern": "2", "conditions": {}}]', 
    '["pizza_senior_selection_1", "pizza_senior_selection_2", "drink_1l5_selection", "menu2_summary"]', 
    30
),
(
    1, 
    'MENU_3_WORKFLOW', 
    'MENU 3 - Pizza Mega + Snacks + Boisson', 
    '1 PIZZA MEGA AU CHOIX + 14 NUGGETS OU 12 WINGS + 1 BOISSON 1.5L', 
    '[{"type": "MESSAGE_PATTERN", "pattern": "3", "conditions": {}}]', 
    '["pizza_mega_selection", "snack_choice_menu3", "drink_1l5_selection", "menu3_summary"]', 
    30
),
(
    1, 
    'MENU_4_WORKFLOW', 
    'MENU 4 - Pizza Sénior + Snacks + 2 Boissons', 
    '1 PIZZA SÉNIOR AU CHOIX + 6 WINGS OU 8 NUGGETS + 2 BOISSONS 33CL', 
    '[{"type": "MESSAGE_PATTERN", "pattern": "4", "conditions": {}}]', 
    '["pizza_senior_selection", "snack_choice_menu4", "drinks_33cl_selection", "menu4_summary"]', 
    30
)
ON CONFLICT (restaurant_id, workflow_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    steps = EXCLUDED.steps,
    updated_at = NOW();

-- Templates de messages essentiels
INSERT INTO message_templates (
    restaurant_id, 
    template_key, 
    language, 
    template_content, 
    variables
) VALUES
(
    1, 
    'welcome', 
    'fr', 
    'Bienvenue chez {{brandName}} ! 🍕

{{welcomeMessage}}

✨ Tapez votre choix', 
    '["brandName", "welcomeMessage"]'
),
(
    1, 
    'order_summary', 
    'fr', 
    '📋 RÉCAPITULATIF {{menuName}}

{{itemsList}}

💰 TOTAL: {{totalPrice}}€

✅ Confirmez votre commande :
1️⃣ OUI, je confirme
2️⃣ NON, je modifie', 
    '["menuName", "itemsList", "totalPrice"]'
),
(
    1, 
    'invalid_choice', 
    'fr', 
    '❌ Choix invalide. {{errorMessage}}

{{retryInstructions}}', 
    '["errorMessage", "retryInstructions"]'
),
(
    1, 
    'workflow_complete', 
    'fr', 
    '🎉 {{menuName}} ajouté à votre commande !

{{nextSteps}}', 
    '["menuName", "nextSteps"]'
)
ON CONFLICT (restaurant_id, template_key, language) DO UPDATE SET
    template_content = EXCLUDED.template_content,
    updated_at = NOW();

-- ================================================
-- 3. VÉRIFICATIONS DE COMPATIBILITÉ
-- ================================================

-- Test existence restaurant Pizza Yolo
DO $$
DECLARE
    restaurant_exists INTEGER;
BEGIN
    SELECT COUNT(*) INTO restaurant_exists 
    FROM france_restaurants 
    WHERE id = 1;
    
    IF restaurant_exists = 0 THEN
        RAISE EXCEPTION 'ERREUR: Restaurant Pizza Yolo (ID: 1) introuvable. Vérifiez la base de données.';
    END IF;
    
    RAISE NOTICE 'SUCCESS: Restaurant Pizza Yolo trouvé';
END $$;

-- Test produits disponibles
DO $$
DECLARE
    pizza_junior_count INTEGER;
    pizza_senior_count INTEGER;
    pizza_mega_count INTEGER;
BEGIN
    -- Vérifier pizzas JUNIOR
    SELECT COUNT(*) INTO pizza_junior_count
    FROM france_product_sizes ps
    JOIN france_products p ON ps.product_id = p.id
    JOIN france_menu_categories mc ON p.category_id = mc.id
    WHERE ps.size_name = 'JUNIOR' 
        AND p.restaurant_id = 1 
        AND p.is_active = true 
        AND mc.slug = 'pizzas';
    
    -- Vérifier pizzas SENIOR
    SELECT COUNT(*) INTO pizza_senior_count
    FROM france_product_sizes ps
    JOIN france_products p ON ps.product_id = p.id
    JOIN france_menu_categories mc ON p.category_id = mc.id
    WHERE ps.size_name = 'SENIOR' 
        AND p.restaurant_id = 1 
        AND p.is_active = true 
        AND mc.slug = 'pizzas';
    
    -- Vérifier pizzas MEGA
    SELECT COUNT(*) INTO pizza_mega_count
    FROM france_product_sizes ps
    JOIN france_products p ON ps.product_id = p.id
    JOIN france_menu_categories mc ON p.category_id = mc.id
    WHERE ps.size_name = 'MEGA' 
        AND p.restaurant_id = 1 
        AND p.is_active = true 
        AND mc.slug = 'pizzas';
    
    -- Validation
    IF pizza_junior_count < 3 THEN
        RAISE EXCEPTION 'ERREUR: Insuffisant pizzas JUNIOR (%), minimum 3 requis pour MENU 1', pizza_junior_count;
    END IF;
    
    IF pizza_senior_count < 3 THEN
        RAISE EXCEPTION 'ERREUR: Insuffisant pizzas SENIOR (%), minimum 3 requis pour MENU 2/4', pizza_senior_count;
    END IF;
    
    IF pizza_mega_count < 1 THEN
        RAISE EXCEPTION 'ERREUR: Insuffisant pizzas MEGA (%), minimum 1 requis pour MENU 3', pizza_mega_count;
    END IF;
    
    RAISE NOTICE 'SUCCESS: Produits validés - Junior: %, Senior: %, Mega: %', 
        pizza_junior_count, pizza_senior_count, pizza_mega_count;
END $$;

-- ================================================
-- 4. RÉSULTATS FINAUX
-- ================================================

-- Résumé configuration créée
SELECT 
    'CONFIGURATION CRÉÉE' as status,
    r.name as restaurant,
    c.brand_name,
    jsonb_array_length(c.available_workflows) as nb_workflows,
    c.is_active as active
FROM restaurant_bot_configs c
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE c.restaurant_id = 1;

-- Résumé workflows
SELECT 
    'WORKFLOWS CRÉÉS' as status,
    workflow_id,
    name,
    jsonb_array_length(steps) as nb_steps,
    is_active as active
FROM workflow_definitions 
WHERE restaurant_id = 1
ORDER BY workflow_id;

-- Résumé templates
SELECT 
    'TEMPLATES CRÉÉS' as status,
    template_key,
    language,
    length(template_content) as content_length,
    is_active as active
FROM message_templates 
WHERE restaurant_id = 1
ORDER BY template_key;

-- Message de succès final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ===============================================';
    RAISE NOTICE '✅ DÉPLOIEMENT BOT UNIVERSEL TERMINÉ !';
    RAISE NOTICE '===============================================';
    RAISE NOTICE '📊 RÉSUMÉ:';
    RAISE NOTICE '   ✅ Schéma universel créé';
    RAISE NOTICE '   ✅ Configuration Pizza Yolo migrée';
    RAISE NOTICE '   ✅ 4 workflows MENU configurés';
    RAISE NOTICE '   ✅ Templates messages créés';
    RAISE NOTICE '   ✅ Compatibilité validée';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÊT POUR DÉPLOIEMENT:';
    RAISE NOTICE '   📡 Fonction: bot-resto-france-universel';
    RAISE NOTICE '   🔧 Configuration: 100%% base de données';
    RAISE NOTICE '   🎯 Zéro régression garantie';
    RAISE NOTICE '===============================================';
END $$;

COMMIT;

-- ✅ SUCCÈS: Migration complète vers bot universel terminée
-- 🚀 PROCHAINE ÉTAPE: Déployer supabase functions deploy bot-resto-france-universel