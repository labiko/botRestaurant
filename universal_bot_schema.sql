-- 🏢 SCHÉMA BOT UNIVERSEL - CONFIGURATION RESTAURANT
-- Architecture configuration-driven pour bot multi-restaurants

BEGIN;

-- ================================================
-- 1. CONFIGURATION RESTAURANTS
-- ================================================

CREATE TABLE IF NOT EXISTS restaurant_bot_configs (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES france_restaurants(id),
    config_name VARCHAR(100) NOT NULL, -- 'main', 'test', 'v2'
    
    -- Configuration générale
    brand_name VARCHAR(200) NOT NULL,
    welcome_message TEXT,
    languages JSONB DEFAULT '["fr"]',
    currency VARCHAR(10) DEFAULT 'EUR',
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    
    -- Configuration des workflows
    available_workflows JSONB NOT NULL DEFAULT '[]',
    default_workflow VARCHAR(100) DEFAULT 'menu_browsing',
    
    -- Configuration des features
    features JSONB NOT NULL DEFAULT '{}', -- {"cart_enabled": true, "delivery_enabled": true}
    
    -- Métadonnées
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(restaurant_id, config_name)
);

-- ================================================
-- 2. WORKFLOWS CONFIGURABLES
-- ================================================

CREATE TABLE IF NOT EXISTS workflow_definitions (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES france_restaurants(id),
    workflow_id VARCHAR(100) NOT NULL, -- 'MENU_1_WORKFLOW', 'MENU_2_WORKFLOW'
    
    -- Définition du workflow
    name VARCHAR(200) NOT NULL,
    description TEXT,
    trigger_conditions JSONB, -- Comment déclencher ce workflow
    
    -- Étapes du workflow
    steps JSONB NOT NULL DEFAULT '[]', -- Array des étapes
    
    -- Configuration globale du workflow
    max_duration_minutes INTEGER DEFAULT 30,
    auto_cancel_conditions JSONB,
    completion_actions JSONB,
    
    -- Métadonnées
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(restaurant_id, workflow_id)
);

-- ================================================
-- 3. DÉFINITION DES ÉTAPES
-- ================================================

CREATE TABLE IF NOT EXISTS workflow_steps (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER NOT NULL REFERENCES workflow_definitions(id),
    step_id VARCHAR(100) NOT NULL, -- 'pizza_selection', 'snack_choice'
    step_order INTEGER NOT NULL,
    
    -- Configuration de l'étape
    step_type VARCHAR(100) NOT NULL, -- 'PRODUCT_SELECTION', 'QUANTITY_INPUT', 'VALIDATION'
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- Logique de sélection
    selection_config JSONB NOT NULL DEFAULT '{}', -- Règles de sélection
    validation_rules JSONB NOT NULL DEFAULT '{}', -- Règles de validation
    
    -- Configuration d'affichage
    display_config JSONB NOT NULL DEFAULT '{}', -- Format d'affichage
    
    -- Actions post-étape
    next_step_logic JSONB, -- Conditions pour étape suivante
    error_handling JSONB, -- Gestion des erreurs
    
    -- Métadonnées
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(workflow_id, step_id)
);

-- ================================================
-- 4. SESSIONS ENRICHIES (ÉTAT BOT)
-- ================================================

-- Enrichir la table sessions existante
ALTER TABLE france_user_sessions ADD COLUMN IF NOT EXISTS bot_state JSONB DEFAULT '{"mode": "menu_browsing"}';
ALTER TABLE france_user_sessions ADD COLUMN IF NOT EXISTS current_workflow_id VARCHAR(100);
ALTER TABLE france_user_sessions ADD COLUMN IF NOT EXISTS workflow_step_id VARCHAR(100);
ALTER TABLE france_user_sessions ADD COLUMN IF NOT EXISTS workflow_data JSONB DEFAULT '{}';

-- ================================================
-- 5. CONFIGURATION PRODUITS PAR RESTAURANT
-- ================================================

CREATE TABLE IF NOT EXISTS restaurant_product_configs (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES france_restaurants(id),
    product_category VARCHAR(100) NOT NULL, -- 'pizzas', 'drinks', 'snacks'
    
    -- Configuration des requêtes
    query_config JSONB NOT NULL DEFAULT '{}', -- Comment chercher les produits
    display_config JSONB NOT NULL DEFAULT '{}', -- Comment afficher les produits
    pricing_rules JSONB NOT NULL DEFAULT '{}', -- Règles de prix
    
    -- Métadonnées
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(restaurant_id, product_category)
);

-- ================================================
-- 6. TEMPLATES DE MESSAGES
-- ================================================

CREATE TABLE IF NOT EXISTS message_templates (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES france_restaurants(id),
    template_key VARCHAR(100) NOT NULL, -- 'welcome', 'menu_display', 'cart_summary'
    language VARCHAR(10) DEFAULT 'fr',
    
    -- Template du message
    template_content TEXT NOT NULL, -- Avec placeholders {{variable}}
    variables JSONB DEFAULT '[]', -- Variables disponibles
    
    -- Métadonnées
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(restaurant_id, template_key, language)
);

-- ================================================
-- 7. INDEX ET OPTIMISATIONS
-- ================================================

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_restaurant_bot_configs_restaurant_active 
    ON restaurant_bot_configs(restaurant_id, is_active);
    
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_restaurant_active 
    ON workflow_definitions(restaurant_id, is_active);
    
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_order 
    ON workflow_steps(workflow_id, step_order);
    
CREATE INDEX IF NOT EXISTS idx_sessions_workflow 
    ON france_user_sessions(current_workflow_id);

-- ================================================
-- 8. CONFIGURATION INITIALE PIZZA YOLO 77
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
    'Bienvenue chez Pizza Yolo 77 ! 🍕\nChoisissez votre restaurant pour commander.',
    '["MENU_1_WORKFLOW", "MENU_2_WORKFLOW", "MENU_3_WORKFLOW", "MENU_4_WORKFLOW", "CATEGORY_BROWSING"]',
    '{"cart_enabled": true, "delivery_enabled": true, "payment_deferred": true, "location_detection": true}'
) ON CONFLICT (restaurant_id, config_name) DO NOTHING;

COMMIT;

-- ✅ Schéma créé pour bot universel configuration-driven
-- ✅ Support multi-restaurants natif
-- ✅ Workflows entièrement configurables
-- ✅ Compatibilité avec données existantes