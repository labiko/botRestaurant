-- ========================================================================
-- TABLE france_gdpr_consents
-- Stockage des consentements GDPR (Article 7 RGPD - Preuve du consentement)
-- ENVIRONNEMENT : PROD
-- DATE : 2025-10-15
-- ========================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.france_gdpr_consents (
  id BIGSERIAL PRIMARY KEY,
  phone_number VARCHAR NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  consent_method VARCHAR NOT NULL, -- 'whatsapp', 'web', 'app'
  consent_withdrawn_date TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par téléphone
CREATE INDEX idx_gdpr_consents_phone ON public.france_gdpr_consents(phone_number);

-- Commentaires
COMMENT ON TABLE public.france_gdpr_consents IS 'Stockage des consentements GDPR (Article 7 - Preuve du consentement)';
COMMENT ON COLUMN public.france_gdpr_consents.consent_method IS 'Méthode d''obtention du consentement (whatsapp, web, app)';
COMMENT ON COLUMN public.france_gdpr_consents.consent_withdrawn_date IS 'Date de retrait du consentement si applicable';

-- Vérification
SELECT COUNT(*) as table_created FROM pg_tables WHERE tablename = 'france_gdpr_consents';

COMMIT;
