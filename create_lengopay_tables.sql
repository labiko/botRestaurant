-- Tables pour l'intégration LengoPay par restaurant

-- 1. Table de configuration des paiements par restaurant
CREATE TABLE IF NOT EXISTS public.restaurant_payment_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  provider_name VARCHAR(50) NOT NULL DEFAULT 'lengopay',
  is_active BOOLEAN DEFAULT false,
  
  -- Configuration LengoPay
  api_url VARCHAR(255) DEFAULT 'https://sandbox.lengopay.com/api/v1/payments',
  license_key TEXT NOT NULL,
  website_id VARCHAR(100) NOT NULL,
  callback_url VARCHAR(255) NOT NULL,
  
  -- Configuration Green API (pour notifications WhatsApp)
  green_api_instance_id VARCHAR(50),
  green_api_token TEXT,
  green_api_base_url VARCHAR(255) DEFAULT 'https://7105.api.greenapi.com',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(restaurant_id, provider_name)
);

-- 2. Table des transactions de paiement par restaurant
CREATE TABLE IF NOT EXISTS public.restaurant_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  commande_id UUID REFERENCES commandes(id),
  payment_id VARCHAR(255) NOT NULL, -- ID retourné par LengoPay
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
  amount DECIMAL(10,2) NOT NULL,
  -- Currency sera récupéré depuis la table restaurants
  client_phone VARCHAR(20) NOT NULL,
  message TEXT,
  payment_url TEXT, -- URL de paiement LengoPay
  raw_json JSONB, -- Réponse complète de l'API
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_notified_at TIMESTAMP WITH TIME ZONE
);

-- 3. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_restaurant_payments_restaurant_id ON restaurant_payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_payments_commande_id ON restaurant_payments(commande_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_payments_payment_id ON restaurant_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_payments_status ON restaurant_payments(status);
CREATE INDEX IF NOT EXISTS idx_restaurant_payment_config_restaurant_id ON restaurant_payment_config(restaurant_id);

-- 4. Trigger pour mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurant_payment_config_updated_at 
  BEFORE UPDATE ON restaurant_payment_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_payments_updated_at 
  BEFORE UPDATE ON restaurant_payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Données de test pour Brasserie de Savigny
INSERT INTO restaurant_payment_config (
  restaurant_id,
  provider_name,
  is_active,
  api_url,
  license_key,
  website_id,
  callback_url,
  green_api_instance_id,
  green_api_token
) VALUES (
  'a2b77ad7-dbdc-4f19-b0e1-2c28aaefef90', -- ID Brasserie de Savigny
  'lengopay',
  true,
  'https://sandbox.lengopay.com/api/v1/payments',
  'VmVHNGZud2h1YVdUUnBSYnZ1R3BlNmtMTFhHN1NDNGpaU3plMENtQ1drZ084Y280S2J5ODZPWXJQVWZRT05OWg==',
  'wyp6J7uN3pVG2Pjn',
  'https://www.labico.net/api/RestaurantLengoPayCallback',
  '7105303512',
  '022e5da3d2e641ab99a3f70539270b187fbfa80635c44b71ad'
) ON CONFLICT (restaurant_id, provider_name) DO UPDATE
SET 
  is_active = EXCLUDED.is_active,
  api_url = EXCLUDED.api_url,
  license_key = EXCLUDED.license_key,
  website_id = EXCLUDED.website_id,
  callback_url = EXCLUDED.callback_url,
  green_api_instance_id = EXCLUDED.green_api_instance_id,
  green_api_token = EXCLUDED.green_api_token,
  updated_at = NOW();