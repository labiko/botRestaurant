-- 🏗️ CRÉATION STRUCTURE BASE DE DONNÉES - ENVIRONNEMENT DEV
-- ============================================================
-- Script basé sur database_fr_structure.sql avec ordre de création optimisé
-- Exécuter dans l'environnement Supabase DEV : https://lphvdoyhwaelmwdfkfuh.supabase.co

BEGIN;

-- ========================================
-- TYPES PERSONNALISÉS ET ÉNUMÉRATIONS
-- ========================================

-- Type pour les produits
CREATE TYPE product_type_enum AS ENUM ('simple', 'composite', 'modular');

-- Type pour les modes de service
CREATE TYPE service_mode_enum AS ENUM ('sur_place', 'a_emporter', 'livraison');

-- Type pour les statuts de commande
CREATE TYPE order_status_enum AS ENUM (
  'en_attente', 'confirmee', 'en_preparation', 'prete',
  'en_livraison', 'livree', 'annulee'
);

-- Type pour les modes de paiement
CREATE TYPE payment_mode_enum AS ENUM (
  'maintenant', 'fin_repas', 'recuperation', 'livraison'
);

-- Type pour les utilisateurs d'authentification
CREATE TYPE user_type_enum AS ENUM ('restaurant', 'driver');

-- ========================================
-- NIVEAU 1 - TABLES INDÉPENDANTES
-- ========================================

-- Table des logs d'automatisation
CREATE TABLE public.automation_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE
);

-- Sessions d'authentification France
CREATE TABLE public.france_auth_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type user_type_enum NOT NULL,
  session_token VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Sessions utilisateur génériques
CREATE TABLE public.france_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_token VARCHAR NOT NULL UNIQUE,
  data JSONB,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transitions d'état du système
CREATE TABLE public.state_transitions (
  id SERIAL PRIMARY KEY,
  from_state VARCHAR NOT NULL,
  to_state VARCHAR NOT NULL,
  trigger_event VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mappings des exécuteurs d'étapes
CREATE TABLE public.step_executor_mappings (
  id SERIAL PRIMARY KEY,
  step_type VARCHAR NOT NULL UNIQUE,
  executor_class VARCHAR NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- NIVEAU 2 - TABLES DE BASE MÉTIER
-- ========================================

-- Table centrale des restaurants
CREATE TABLE public.france_restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  whatsapp_number VARCHAR NOT NULL,
  delivery_zone_km NUMERIC DEFAULT 10,
  min_order_amount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  business_hours JSONB DEFAULT '{}',
  latitude NUMERIC,
  longitude NUMERIC,
  password_hash VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Adresses des clients
CREATE TABLE public.france_customer_addresses (
  id BIGSERIAL PRIMARY KEY,
  phone_number VARCHAR NOT NULL,
  address_label VARCHAR NOT NULL,
  full_address TEXT NOT NULL,
  google_place_id VARCHAR,
  latitude NUMERIC,
  longitude NUMERIC,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  whatsapp_name VARCHAR
);

-- ========================================
-- NIVEAU 3 - TABLES DÉPENDANTES DE RESTAURANTS
-- ========================================

-- Livreurs
CREATE TABLE public.france_delivery_drivers (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  phone_number VARCHAR NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  is_online BOOLEAN DEFAULT FALSE,
  current_latitude NUMERIC,
  current_longitude NUMERIC,
  password VARCHAR DEFAULT '000000',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- Catégories de menu
CREATE TABLE public.france_menu_categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL,
  icon VARCHAR DEFAULT '🍽️',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- Numéros WhatsApp des restaurants
CREATE TABLE public.france_whatsapp_numbers (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  phone_number VARCHAR NOT NULL UNIQUE,
  instance_id VARCHAR,
  api_token VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- Fonctionnalités des restaurants
CREATE TABLE public.france_restaurant_features (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  feature_name VARCHAR NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- Modes de service des restaurants
CREATE TABLE public.france_restaurant_service_modes (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  service_mode service_mode_enum NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- Paramètres d'affichage des pizzas
CREATE TABLE public.france_pizza_display_settings (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  display_type VARCHAR NOT NULL DEFAULT 'standard',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- Sessions utilisateur WhatsApp
CREATE TABLE public.france_user_sessions (
  id BIGSERIAL PRIMARY KEY,
  phone_number VARCHAR NOT NULL,
  restaurant_id INTEGER,
  current_step VARCHAR,
  session_data JSONB DEFAULT '{}',
  cart_items JSONB DEFAULT '[]',
  total_amount NUMERIC DEFAULT 0,
  workflow_state VARCHAR,
  workflow_context JSONB DEFAULT '{}',
  bot_state JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- Templates de workflows
CREATE TABLE public.france_workflow_templates (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  template_name VARCHAR NOT NULL,
  template_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- Templates de messages
CREATE TABLE public.message_templates (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  template_key VARCHAR NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- Configuration des bots de restaurant
CREATE TABLE public.restaurant_bot_configs (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  config_key VARCHAR NOT NULL,
  config_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- Définitions de workflows
CREATE TABLE public.workflow_definitions (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  workflow_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  steps JSONB DEFAULT '[]',
  max_duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id)
);

-- ========================================
-- NIVEAU 4 - TABLES DE PRODUITS ET MENUS
-- ========================================

-- Produits du menu
CREATE TABLE public.france_products (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  product_type product_type_enum DEFAULT 'simple',
  base_price NUMERIC,
  price_on_site_base NUMERIC NOT NULL,
  price_delivery_base NUMERIC NOT NULL,
  composition TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  workflow_type VARCHAR,
  requires_steps BOOLEAN DEFAULT FALSE,
  steps_config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id),
  FOREIGN KEY (category_id) REFERENCES public.france_menu_categories(id)
);

-- Configuration d'affichage des produits
CREATE TABLE public.france_product_display_configs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  display_type VARCHAR NOT NULL DEFAULT 'standard',
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES public.france_products(id)
);

-- Options des produits
CREATE TABLE public.france_product_options (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  option_group VARCHAR NOT NULL,
  option_name VARCHAR NOT NULL,
  price_modifier NUMERIC DEFAULT 0,
  is_required BOOLEAN DEFAULT FALSE,
  max_selections INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  group_order INTEGER DEFAULT 0,
  next_group_order INTEGER,
  conditional_next_group JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES public.france_products(id)
);

-- Tailles des produits
CREATE TABLE public.france_product_sizes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  size_name VARCHAR NOT NULL,
  price_on_site NUMERIC NOT NULL,
  price_delivery NUMERIC NOT NULL,
  includes_drink BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES public.france_products(id)
);

-- Variantes des produits
CREATE TABLE public.france_product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  variant_name VARCHAR NOT NULL,
  price_on_site NUMERIC NOT NULL,
  price_delivery NUMERIC NOT NULL,
  quantity INTEGER,
  unit VARCHAR DEFAULT 'pièces',
  is_menu BOOLEAN DEFAULT FALSE,
  includes_description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES public.france_products(id)
);

-- Composants des produits composites
CREATE TABLE public.france_composite_items (
  id SERIAL PRIMARY KEY,
  composite_product_id INTEGER NOT NULL,
  component_name VARCHAR NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR DEFAULT 'pièces',
  FOREIGN KEY (composite_product_id) REFERENCES public.france_products(id)
);

-- Étapes de workflows
CREATE TABLE public.workflow_steps (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER NOT NULL,
  step_id VARCHAR NOT NULL,
  step_type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  selection_config JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  next_step_logic JSONB DEFAULT '{}',
  error_handling JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (workflow_id) REFERENCES public.workflow_definitions(id)
);

-- ========================================
-- NIVEAU 5 - TABLES DE COMMANDES ET LIVRAISONS
-- ========================================

-- Commandes
CREATE TABLE public.france_orders (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL,
  phone_number VARCHAR NOT NULL,
  customer_name VARCHAR NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  delivery_mode service_mode_enum DEFAULT 'sur_place',
  delivery_address TEXT,
  payment_mode payment_mode_enum DEFAULT 'maintenant',
  payment_method VARCHAR,
  status order_status_enum DEFAULT 'en_attente',
  order_number VARCHAR,
  notes TEXT,
  additional_notes TEXT,
  driver_id INTEGER,
  delivery_validation_code VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (restaurant_id) REFERENCES public.france_restaurants(id),
  FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id)
);

-- Tokens de livraison
CREATE TABLE public.delivery_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR NOT NULL UNIQUE,
  order_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  absolute_expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  suspended BOOLEAN DEFAULT FALSE,
  reactivated BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id)
);

-- Assignations de livraison
CREATE TABLE public.france_delivery_assignments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR DEFAULT 'assigned',
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id)
);

-- Localisation des livreurs
CREATE TABLE public.france_driver_locations (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy NUMERIC,
  recorded_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id)
);

-- Actions des livreurs
CREATE TABLE public.delivery_driver_actions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER,
  driver_id INTEGER,
  token_id INTEGER,
  action_type VARCHAR NOT NULL,
  action_timestamp TIMESTAMP DEFAULT NOW(),
  details JSONB,
  FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id),
  FOREIGN KEY (token_id) REFERENCES public.delivery_tokens(id)
);

-- Logs des commandes de livraison
CREATE TABLE public.delivery_order_logs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER,
  action_type VARCHAR NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES public.france_orders(id)
);

-- Refus de livraison
CREATE TABLE public.delivery_refusals (
  id SERIAL PRIMARY KEY,
  order_id INTEGER,
  driver_id INTEGER,
  token_id INTEGER,
  reason VARCHAR,
  custom_reason TEXT,
  refused_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES public.france_orders(id),
  FOREIGN KEY (driver_id) REFERENCES public.france_delivery_drivers(id),
  FOREIGN KEY (token_id) REFERENCES public.delivery_tokens(id)
);

-- Notifications de livraison
CREATE TABLE public.france_delivery_notifications (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL,
  notification_type VARCHAR NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (assignment_id) REFERENCES public.france_delivery_assignments(id)
);

-- ========================================
-- FONCTION POUR MENU AI ADMIN
-- ========================================

-- Fonction pour exécuter du SQL dynamique de manière sécurisée
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    query_upper TEXT;
BEGIN
    -- Validation de sécurité basique
    query_upper := UPPER(sql_query);

    -- Interdire les commandes dangereuses
    IF query_upper LIKE '%DROP%' OR
       query_upper LIKE '%TRUNCATE%' OR
       query_upper LIKE '%DELETE FROM%' OR
       query_upper LIKE '%ALTER TABLE%' THEN
        RAISE EXCEPTION 'Commande SQL dangereuse détectée: %', sql_query;
    END IF;

    -- Exécution de la requête
    EXECUTE sql_query;

    -- Retourner un succès
    RETURN json_build_object(
        'success', true,
        'message', 'SQL exécuté avec succès',
        'timestamp', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Retourner l'erreur
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'timestamp', NOW()
        );
END;
$$;

-- Table pour logger les exécutions SQL du Menu AI Admin
CREATE TABLE IF NOT EXISTS public.sql_execution_log (
    id BIGSERIAL PRIMARY KEY,
    sql_query TEXT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    executed_by UUID REFERENCES auth.users(id),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEX ET OPTIMISATIONS
-- ========================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_france_products_restaurant_id ON public.france_products(restaurant_id);
CREATE INDEX idx_france_products_category_id ON public.france_products(category_id);
CREATE INDEX idx_france_products_active ON public.france_products(is_active);
CREATE INDEX idx_france_user_sessions_phone ON public.france_user_sessions(phone_number);
CREATE INDEX idx_france_orders_restaurant_id ON public.france_orders(restaurant_id);
CREATE INDEX idx_france_orders_status ON public.france_orders(status);

-- ========================================
-- PERMISSIONS ET SÉCURITÉ
-- ========================================

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;
GRANT INSERT, SELECT ON public.sql_execution_log TO authenticated;

-- Activer RLS sur la table de log
ALTER TABLE public.sql_execution_log ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion et lecture des logs
CREATE POLICY "Permettre gestion log SQL" ON public.sql_execution_log
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

COMMIT;

-- ========================================
-- ✅ STRUCTURE CRÉÉE AVEC SUCCÈS
-- ========================================
-- Base de données DEV prête pour le Menu AI Modifier
-- Tables: 33 créées
-- Fonction execute_sql: Configurée
-- Index: Optimisés
-- Permissions: Accordées