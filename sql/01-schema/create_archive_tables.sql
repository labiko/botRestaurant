-- =====================================================
-- CRÉATION DES TABLES D'ARCHIVE POUR SUPPRESSION COMPLÈTE
-- Option 2: Hard Delete avec Archivage
-- =====================================================

-- 1. Table d'archive pour restaurants
CREATE TABLE IF NOT EXISTS archive_restaurants (
  -- Copie de tous les champs de la table restaurants
  id uuid NOT NULL,
  nom character varying NOT NULL,
  adresse text,
  ville character varying,
  quartier character varying,
  telephone character varying,
  phone_whatsapp character varying,
  email character varying,
  latitude numeric,
  longitude numeric,
  logo_url text,
  banner_url text,
  description text,
  cuisine_types text[],
  heures_ouverture jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  status character varying,
  is_active boolean,
  can_delivery boolean,
  delivery_fee integer,
  delivery_min_amount integer,
  delivery_max_distance_km numeric,
  min_preparation_time integer,
  max_preparation_time integer,
  currency character varying,
  zone_livraison text[],
  deleted_at timestamp with time zone,
  
  -- Métadonnées d'archivage
  archived_at timestamp with time zone DEFAULT NOW(),
  archived_by uuid,
  archive_reason text,
  
  CONSTRAINT archive_restaurants_pkey PRIMARY KEY (id, archived_at)
);

-- 2. Table d'archive pour commandes
CREATE TABLE IF NOT EXISTS archive_commandes (
  id uuid NOT NULL,
  numero_commande character varying NOT NULL,
  client_id uuid NOT NULL,
  restaurant_id uuid NOT NULL,
  items jsonb,
  sous_total integer,
  frais_livraison integer,
  total integer,
  mode character varying,
  adresse_livraison text,
  latitude_livraison numeric,
  longitude_livraison numeric,
  distance_km numeric,
  statut character varying,
  paiement_mode character varying,
  paiement_statut character varying,
  paiement_methode character varying,
  paiement_id character varying,
  livreur_id uuid,
  notes text,
  temps_preparation integer,
  created_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  prepared_at timestamp with time zone,
  delivered_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  updated_at timestamp with time zone,
  
  -- Métadonnées d'archivage
  archived_at timestamp with time zone DEFAULT NOW(),
  
  CONSTRAINT archive_commandes_pkey PRIMARY KEY (id, archived_at)
);

-- 3. Table d'archive pour restaurant_payments
CREATE TABLE IF NOT EXISTS archive_restaurant_payments (
  id uuid NOT NULL,
  restaurant_id uuid,
  commande_id uuid,
  payment_id character varying,
  status character varying,
  amount numeric,
  client_phone character varying,
  message text,
  payment_url text,
  raw_json jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  processed_at timestamp with time zone,
  
  -- Métadonnées d'archivage
  archived_at timestamp with time zone DEFAULT NOW(),
  
  CONSTRAINT archive_restaurant_payments_pkey PRIMARY KEY (id, archived_at)
);

-- 4. Table d'archive pour menus
CREATE TABLE IF NOT EXISTS archive_menus (
  id uuid NOT NULL,
  restaurant_id uuid,
  categorie character varying,
  nom character varying,
  description text,
  prix integer,
  prix_promo integer,
  image_url text,
  is_available boolean,
  is_active boolean,
  ordre integer,
  options jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  
  -- Métadonnées d'archivage
  archived_at timestamp with time zone DEFAULT NOW(),
  
  CONSTRAINT archive_menus_pkey PRIMARY KEY (id, archived_at)
);

-- 5. Table d'archive pour restaurant_users
CREATE TABLE IF NOT EXISTS archive_restaurant_users (
  id uuid NOT NULL,
  restaurant_id uuid,
  telephone character varying,
  password character varying,
  role character varying,
  nom character varying,
  email character varying,
  is_active boolean,
  last_login timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  
  -- Métadonnées d'archivage
  archived_at timestamp with time zone DEFAULT NOW(),
  
  CONSTRAINT archive_restaurant_users_pkey PRIMARY KEY (id, archived_at)
);

-- 6. Table d'archive pour delivery_users
CREATE TABLE IF NOT EXISTS archive_delivery_users (
  id uuid NOT NULL,
  restaurant_id uuid,
  telephone character varying,
  password character varying,
  nom character varying,
  prenom character varying,
  type_vehicule character varying,
  numero_vehicule character varying,
  is_active boolean,
  is_available boolean,
  current_location jsonb,
  total_deliveries integer,
  rating numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_seen timestamp with time zone,
  
  -- Métadonnées d'archivage
  archived_at timestamp with time zone DEFAULT NOW(),
  
  CONSTRAINT archive_delivery_users_pkey PRIMARY KEY (id, archived_at)
);

-- 7. Table d'archive pour restaurant_analytics
CREATE TABLE IF NOT EXISTS archive_restaurant_analytics (
  id uuid NOT NULL,
  restaurant_id uuid,
  date date,
  total_orders integer,
  total_revenue numeric,
  average_order_value numeric,
  new_customers integer,
  returning_customers integer,
  cancelled_orders integer,
  average_preparation_time integer,
  average_delivery_time integer,
  top_dishes jsonb,
  peak_hours jsonb,
  created_at timestamp with time zone,
  
  -- Métadonnées d'archivage
  archived_at timestamp with time zone DEFAULT NOW(),
  
  CONSTRAINT archive_restaurant_analytics_pkey PRIMARY KEY (id, archived_at)
);

-- 8. Table d'archive pour restaurant_payment_config
CREATE TABLE IF NOT EXISTS archive_restaurant_payment_config (
  id uuid NOT NULL,
  restaurant_id uuid,
  provider_name character varying,
  is_active boolean,
  api_url text,
  license_key text,
  website_id character varying,
  callback_url text,
  telephone_marchand character varying,
  green_api_instance_id character varying,
  green_api_token text,
  green_api_base_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  
  -- Métadonnées d'archivage
  archived_at timestamp with time zone DEFAULT NOW(),
  
  CONSTRAINT archive_restaurant_payment_config_pkey PRIMARY KEY (id, archived_at)
);

-- 9. Table d'archive pour restaurant_delivery_config
CREATE TABLE IF NOT EXISTS archive_restaurant_delivery_config (
  id uuid NOT NULL,
  restaurant_id uuid,
  zone_name character varying,
  coordinates text[],
  delivery_fee integer,
  min_order_amount integer,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  
  -- Métadonnées d'archivage
  archived_at timestamp with time zone DEFAULT NOW(),
  
  CONSTRAINT archive_restaurant_delivery_config_pkey PRIMARY KEY (id, archived_at)
);

-- 10. Table d'archive pour restaurant_subscriptions
CREATE TABLE IF NOT EXISTS archive_restaurant_subscriptions (
  id uuid NOT NULL,
  restaurant_id uuid,
  plan_name character varying,
  price numeric,
  billing_cycle character varying,
  features jsonb,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  status character varying,
  auto_renew boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  
  -- Métadonnées d'archivage
  archived_at timestamp with time zone DEFAULT NOW(),
  
  CONSTRAINT archive_restaurant_subscriptions_pkey PRIMARY KEY (id, archived_at)
);

-- Index pour recherches dans les archives
CREATE INDEX IF NOT EXISTS idx_archive_restaurants_nom ON archive_restaurants(nom);
CREATE INDEX IF NOT EXISTS idx_archive_restaurants_archived_at ON archive_restaurants(archived_at);
CREATE INDEX IF NOT EXISTS idx_archive_commandes_numero ON archive_commandes(numero_commande);
CREATE INDEX IF NOT EXISTS idx_archive_commandes_restaurant_id ON archive_commandes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_archive_commandes_archived_at ON archive_commandes(archived_at);

-- Commentaires sur les tables
COMMENT ON TABLE archive_restaurants IS 'Archive des restaurants supprimés avec toutes leurs données';
COMMENT ON TABLE archive_commandes IS 'Archive des commandes des restaurants supprimés';
COMMENT ON TABLE archive_restaurant_payments IS 'Archive des paiements des restaurants supprimés';
COMMENT ON TABLE archive_menus IS 'Archive des menus des restaurants supprimés';
COMMENT ON TABLE archive_restaurant_users IS 'Archive des utilisateurs des restaurants supprimés';
COMMENT ON TABLE archive_delivery_users IS 'Archive des livreurs des restaurants supprimés';