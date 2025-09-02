-- Table pour les sessions utilisateurs France
CREATE TABLE IF NOT EXISTS france_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_whatsapp VARCHAR(20) NOT NULL,
    state VARCHAR(50) DEFAULT 'INITIAL',
    context JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_france_sessions_phone ON france_sessions(phone_whatsapp);
CREATE INDEX IF NOT EXISTS idx_france_sessions_expires ON france_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_france_sessions_phone_expires ON france_sessions(phone_whatsapp, expires_at);

-- Commentaires pour documentation
COMMENT ON TABLE france_sessions IS 'Sessions utilisateurs pour le bot WhatsApp France';
COMMENT ON COLUMN france_sessions.phone_whatsapp IS 'Numéro de téléphone WhatsApp de l''utilisateur';
COMMENT ON COLUMN france_sessions.state IS 'État actuel de la conversation (INITIAL, VIEWING_MENU, etc.)';
COMMENT ON COLUMN france_sessions.context IS 'Données de contexte de la session (restaurant sélectionné, panier, etc.)';
COMMENT ON COLUMN france_sessions.expires_at IS 'Date d''expiration de la session (30 minutes par défaut)';