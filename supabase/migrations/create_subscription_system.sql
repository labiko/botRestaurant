-- ============================================================================
-- MIGRATION: SYSTÈME DE GESTION D'ABONNEMENTS SAAS
-- Date: 2025-01-30
-- Description: Création des tables pour la gestion des abonnements restaurants
-- Inspiré de: restaurant_payment_configs
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLE: admin_stripe_config
-- Description: Configuration Stripe du super admin pour recevoir les paiements d'abonnement
-- Inspirée de: restaurant_payment_configs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_stripe_config (
  id BIGSERIAL PRIMARY KEY,

  -- Nom de configuration (pour gérer plusieurs configs si besoin)
  config_name VARCHAR(50) DEFAULT 'main' UNIQUE,

  -- Identifiants API Stripe (chiffrés en production)
  stripe_public_key TEXT NOT NULL,      -- pk_live_xxx ou pk_test_xxx
  stripe_secret_key TEXT NOT NULL,      -- sk_live_xxx ou sk_test_xxx (chiffré)
  stripe_webhook_secret TEXT,           -- whsec_xxx pour valider les webhooks

  -- Price IDs Stripe pour les abonnements
  price_id_monthly TEXT,                -- ID du prix mensuel (price_xxx)
  price_id_quarterly TEXT,              -- ID du prix trimestriel
  price_id_annual TEXT,                 -- ID du prix annuel

  -- Montants de référence (pour affichage)
  amount_monthly DECIMAL(10,2) DEFAULT 49.00,
  amount_quarterly DECIMAL(10,2) DEFAULT 127.00,   -- ~14% réduction
  amount_annual DECIMAL(10,2) DEFAULT 420.00,      -- ~29% réduction

  -- Configuration
  currency VARCHAR(3) DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT true,
  environment VARCHAR(20) DEFAULT 'live' CHECK (environment IN ('test', 'live')),

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_stripe_config_active ON public.admin_stripe_config(is_active);

-- Commentaires
COMMENT ON TABLE public.admin_stripe_config IS 'Configuration Stripe du super admin pour gérer les abonnements des restaurants';
COMMENT ON COLUMN public.admin_stripe_config.config_name IS 'Nom de la configuration (main par défaut)';
COMMENT ON COLUMN public.admin_stripe_config.environment IS 'Environnement: test ou live';

-- ============================================================================
-- 2. MODIFICATION TABLE: france_restaurants
-- Description: Ajout des colonnes de gestion d'abonnement
-- ============================================================================

DO $$
BEGIN
  -- Colonne: subscription_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'france_restaurants'
    AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE public.france_restaurants
    ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active'
      CHECK (subscription_status IN ('active', 'expiring', 'expired', 'suspended'));
  END IF;

  -- Colonne: subscription_end_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'france_restaurants'
    AND column_name = 'subscription_end_date'
  ) THEN
    ALTER TABLE public.france_restaurants
    ADD COLUMN subscription_end_date TIMESTAMPTZ;
  END IF;

  -- Colonne: subscription_plan
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'france_restaurants'
    AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE public.france_restaurants
    ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'monthly'
      CHECK (subscription_plan IN ('monthly', 'quarterly', 'annual'));
  END IF;
END $$;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_restaurants_subscription_status ON public.france_restaurants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_restaurants_subscription_end_date ON public.france_restaurants(subscription_end_date);

COMMENT ON COLUMN public.france_restaurants.subscription_status IS 'Statut abonnement: active, expiring, expired, suspended';
COMMENT ON COLUMN public.france_restaurants.subscription_end_date IS 'Date de fin d''abonnement';
COMMENT ON COLUMN public.france_restaurants.subscription_plan IS 'Plan: monthly, quarterly, annual';

-- ============================================================================
-- 3. TABLE: subscription_history
-- Description: Historique complet des renouvellements et prolongations
-- Inspirée de: payment_links
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_history (
  id BIGSERIAL PRIMARY KEY,

  -- Relations
  restaurant_id INTEGER NOT NULL REFERENCES public.france_restaurants(id) ON DELETE CASCADE,

  -- Type d'action
  action VARCHAR(50) NOT NULL CHECK (action IN ('manual_renewal', 'stripe_renewal', 'initial_setup', 'suspension', 'reactivation')),

  -- Dates
  old_end_date TIMESTAMPTZ,
  new_end_date TIMESTAMPTZ,

  -- Détails
  duration_months INTEGER,               -- Durée ajoutée (1, 3, 12)
  amount_paid DECIMAL(10,2),            -- Montant payé (NULL si gratuit/manuel)
  payment_method VARCHAR(50) CHECK (payment_method IN ('manual', 'stripe', 'free')),

  -- Tracking super admin
  admin_user VARCHAR(100),               -- Email/nom du super admin (si prolongation manuelle)

  -- Stripe (si paiement automatique)
  stripe_session_id VARCHAR(255),        -- ID session Stripe (cs_xxx)
  stripe_payment_intent VARCHAR(255),    -- ID payment intent (pi_xxx)

  -- Métadonnées
  notes TEXT,                            -- Notes de l'admin (ex: "Paiement mobile money reçu")
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_subscription_history_restaurant ON public.subscription_history(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_action ON public.subscription_history(action);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON public.subscription_history(created_at DESC);

-- Commentaires
COMMENT ON TABLE public.subscription_history IS 'Historique complet de tous les renouvellements et modifications d''abonnement';
COMMENT ON COLUMN public.subscription_history.action IS 'Type: manual_renewal, stripe_renewal, initial_setup, suspension, reactivation';
COMMENT ON COLUMN public.subscription_history.payment_method IS 'Méthode: manual (mobile money), stripe, free';

-- ============================================================================
-- 4. FONCTION: update_updated_at_column
-- Description: Mise à jour automatique de updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_admin_stripe_config_updated_at ON public.admin_stripe_config;
CREATE TRIGGER update_admin_stripe_config_updated_at
  BEFORE UPDATE ON public.admin_stripe_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. VÉRIFICATIONS
-- ============================================================================

-- Vérifier tables créées
SELECT
  'admin_stripe_config' as table_name,
  COUNT(*) as row_count
FROM public.admin_stripe_config
UNION ALL
SELECT
  'subscription_history' as table_name,
  COUNT(*) as row_count
FROM public.subscription_history;

-- Vérifier colonnes ajoutées
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'france_restaurants'
  AND column_name IN ('subscription_status', 'subscription_end_date', 'subscription_plan')
ORDER BY column_name;

COMMIT;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
