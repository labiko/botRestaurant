-- ============================================================================
-- MIGRATION: SYSTÈME DE PAIEMENT EN LIGNE
-- Date: 2025-01-30
-- Description: Création des tables pour le système de paiement en ligne
--              (Stripe, Lengopay, etc.)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLE: restaurant_payment_configs
-- Description: Configuration des moyens de paiement par restaurant
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.restaurant_payment_configs (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES public.france_restaurants(id) ON DELETE CASCADE,

  -- Provider de paiement
  provider VARCHAR NOT NULL CHECK (provider IN ('stripe', 'lengopay', 'wave', 'orange_money', 'custom')),

  -- Identifiants API (chiffrés en production)
  api_key_public VARCHAR,      -- Clé publique (ex: pk_test_...)
  api_key_secret VARCHAR,       -- Clé secrète (chiffrée)
  merchant_id VARCHAR,          -- ID marchand (pour Lengopay, Wave, etc.)

  -- Configuration spécifique
  config JSONB DEFAULT '{}',    -- Config flexible par provider

  -- URLs de callback
  success_url VARCHAR,          -- URL de succès personnalisée
  cancel_url VARCHAR,           -- URL d'annulation personnalisée
  webhook_url VARCHAR,          -- URL webhook pour notifications

  -- Options
  is_active BOOLEAN DEFAULT true,
  auto_send_on_order BOOLEAN DEFAULT false,  -- Envoi automatique à chaque commande
  send_on_delivery BOOLEAN DEFAULT false,    -- Envoi automatique à la livraison

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_restaurant_provider UNIQUE (restaurant_id, provider)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_payment_configs_restaurant ON public.restaurant_payment_configs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payment_configs_active ON public.restaurant_payment_configs(is_active);

-- Commentaires
COMMENT ON TABLE public.restaurant_payment_configs IS 'Configuration des moyens de paiement en ligne par restaurant (Stripe, Lengopay, etc.)';
COMMENT ON COLUMN public.restaurant_payment_configs.provider IS 'Provider de paiement: stripe, lengopay, wave, orange_money, custom';
COMMENT ON COLUMN public.restaurant_payment_configs.config IS 'Configuration JSON flexible (currency, payment_methods, etc.)';

-- ============================================================================
-- 2. TABLE: payment_links
-- Description: Historique des liens de paiement générés et envoyés
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_links (
  id BIGSERIAL PRIMARY KEY,

  -- Relations
  order_id INTEGER NOT NULL REFERENCES public.france_orders(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES public.france_restaurants(id),
  config_id BIGINT NOT NULL REFERENCES public.restaurant_payment_configs(id),

  -- Détails du lien
  provider VARCHAR NOT NULL,
  payment_link_url TEXT NOT NULL,
  payment_intent_id VARCHAR,     -- ID transaction chez le provider (ex: pi_xxx pour Stripe)

  -- Montant
  amount NUMERIC NOT NULL,
  currency VARCHAR DEFAULT 'EUR',

  -- Statut
  status VARCHAR NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'viewed', 'paid', 'failed', 'expired', 'cancelled')),

  -- Qui a envoyé le lien
  sent_by_id INTEGER,            -- ID du user (restaurant staff ou livreur)
  sent_by_type VARCHAR CHECK (sent_by_type IN ('restaurant', 'driver', 'system')),
  sent_at TIMESTAMPTZ,

  -- Tracking
  viewed_at TIMESTAMPTZ,         -- Quand le client a ouvert le lien
  paid_at TIMESTAMPTZ,           -- Quand le paiement a été effectué

  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

  -- Métadonnées
  metadata JSONB DEFAULT '{}',   -- Infos supplémentaires du provider
  webhook_events JSONB DEFAULT '[]',  -- Log des événements webhook reçus

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_payment_links_order ON public.payment_links(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON public.payment_links(status);
CREATE INDEX IF NOT EXISTS idx_payment_links_provider ON public.payment_links(provider);
CREATE INDEX IF NOT EXISTS idx_payment_links_created_at ON public.payment_links(created_at DESC);

-- Commentaires
COMMENT ON TABLE public.payment_links IS 'Historique complet des liens de paiement générés et envoyés aux clients';
COMMENT ON COLUMN public.payment_links.status IS 'Statut: pending, sent, viewed, paid, failed, expired, cancelled';
COMMENT ON COLUMN public.payment_links.sent_by_type IS 'Qui a envoyé: restaurant, driver, system';
COMMENT ON COLUMN public.payment_links.webhook_events IS 'Log JSON des événements webhook reçus du provider';

-- ============================================================================
-- 3. MODIFICATION TABLE: france_orders
-- Description: Ajout colonne pour tracker l'état du paiement en ligne
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'france_orders'
    AND column_name = 'online_payment_status'
  ) THEN
    ALTER TABLE public.france_orders
    ADD COLUMN online_payment_status VARCHAR
      CHECK (online_payment_status IN ('not_sent', 'link_sent', 'paid', 'failed'))
      DEFAULT 'not_sent';
  END IF;
END $$;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_orders_online_payment_status ON public.france_orders(online_payment_status);

COMMENT ON COLUMN public.france_orders.online_payment_status IS 'Statut paiement en ligne: not_sent, link_sent, paid, failed';

-- ============================================================================
-- 4. FONCTION: update_updated_at_column
-- Description: Mise à jour automatique de la colonne updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. TRIGGERS: Mise à jour automatique updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_restaurant_payment_configs_updated_at ON public.restaurant_payment_configs;
CREATE TRIGGER update_restaurant_payment_configs_updated_at
  BEFORE UPDATE ON public.restaurant_payment_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_links_updated_at ON public.payment_links;
CREATE TRIGGER update_payment_links_updated_at
  BEFORE UPDATE ON public.payment_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. VÉRIFICATIONS
-- ============================================================================

-- Vérifier que toutes les tables ont été créées
SELECT
  'restaurant_payment_configs' as table_name,
  COUNT(*) as row_count
FROM public.restaurant_payment_configs
UNION ALL
SELECT
  'payment_links' as table_name,
  COUNT(*) as row_count
FROM public.payment_links;

-- Vérifier que la colonne online_payment_status existe
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'france_orders'
  AND column_name = 'online_payment_status';

COMMIT;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================