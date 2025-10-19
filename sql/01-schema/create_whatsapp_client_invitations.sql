-- ========================================================================
-- TABLE: whatsapp_client_invitations
-- DESCRIPTION: Tracking des invitations clients WhatsApp par restaurant
-- NOTE: Les champs conversation_started et first_order_placed sont
--       à remplir manuellement ou via scripts SQL (pas de détection auto)
-- ========================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS whatsapp_client_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id integer NOT NULL REFERENCES france_restaurants(id) ON DELETE CASCADE,
  client_phone_number text NOT NULL,
  invited_at timestamp DEFAULT now(),
  invited_by text, -- Nom du restaurant qui a invité

  -- Tracking conversion (à remplir manuellement)
  conversation_started boolean DEFAULT false,
  conversation_started_at timestamp,
  first_order_placed boolean DEFAULT false,
  first_order_at timestamp,

  created_at timestamp DEFAULT now(),

  -- Contrainte unique : un restaurant ne peut inviter le même numéro qu'une fois
  CONSTRAINT unique_restaurant_client UNIQUE(restaurant_id, client_phone_number)
);

-- Index pour requêtes rapides
CREATE INDEX idx_invitations_restaurant_date
  ON whatsapp_client_invitations(restaurant_id, invited_at DESC);

CREATE INDEX idx_invitations_client_phone
  ON whatsapp_client_invitations(client_phone_number);

-- Vue pour statistiques par restaurant
CREATE OR REPLACE VIEW restaurant_invitation_stats AS
SELECT
  restaurant_id,
  DATE(invited_at) as date,
  COUNT(*) as total_invitations,
  COUNT(*) FILTER (WHERE conversation_started) as total_conversions,
  COUNT(*) FILTER (WHERE first_order_placed) as total_orders,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE conversation_started) / NULLIF(COUNT(*), 0),
    1
  ) as conversion_rate
FROM whatsapp_client_invitations
GROUP BY restaurant_id, DATE(invited_at);

COMMENT ON TABLE whatsapp_client_invitations IS 'Tracking manuel des invitations clients WhatsApp';

SELECT 'Table whatsapp_client_invitations créée avec succès' as status;

COMMIT;
