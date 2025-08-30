-- ========================================
-- SCRIPT DE CRÉATION DES TABLES SUPER ADMIN
-- ========================================

-- Table super_admins
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'support')),
  permissions JSONB DEFAULT '[]'::jsonb,
  mfa_secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table audit_logs pour traçabilité
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES super_admins(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical'))
);

-- Table system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  updated_by UUID REFERENCES super_admins(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table subscription_plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GNF',
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  max_orders INTEGER,
  max_drivers INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table restaurant_subscriptions
CREATE TABLE IF NOT EXISTS restaurant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'trial', 'suspended', 'cancelled', 'expired')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  payment_method JSONB,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table invoices pour la facturation SaaS
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES restaurant_subscriptions(id),
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GNF',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajouter des colonnes manquantes à la table restaurants pour Super Admin
DO $$
BEGIN
    -- Ajouter status si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'status') THEN
        ALTER TABLE restaurants ADD COLUMN status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('active', 'suspended', 'pending', 'banned', 'deleted'));
    END IF;

    -- Ajouter owner_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'owner_name') THEN
        ALTER TABLE restaurants ADD COLUMN owner_name VARCHAR(255);
    END IF;

    -- Ajouter last_activity_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'last_activity_at') THEN
        ALTER TABLE restaurants ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Ajouter suspension_reason si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'suspension_reason') THEN
        ALTER TABLE restaurants ADD COLUMN suspension_reason TEXT;
    END IF;

    -- Ajouter deleted_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'deleted_at') THEN
        ALTER TABLE restaurants ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Ajouter first_login si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'first_login') THEN
        ALTER TABLE restaurants ADD COLUMN first_login BOOLEAN DEFAULT true;
    END IF;

    -- Ajouter is_blocked si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'is_blocked') THEN
        ALTER TABLE restaurants ADD COLUMN is_blocked BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_restaurant_id ON restaurant_subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_subscriptions_status ON restaurant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Insertion des données par défaut

-- Super Admin par défaut (mot de passe: admin123 - À CHANGER EN PRODUCTION!)
INSERT INTO super_admins (email, password_hash, role, permissions) VALUES 
('admin@restaurant.com', 'admin123', 'super_admin', '["*"]'::jsonb)
ON CONFLICT (email) DO NOTHING;

-- Plans d'abonnement par défaut
INSERT INTO subscription_plans (name, price, currency, features, billing_cycle, max_orders, max_drivers) VALUES 
('Starter', 50000, 'GNF', '{"analytics": false, "customDomain": false, "prioritySupport": false, "apiAccess": false}'::jsonb, 'monthly', 100, 2),
('Business', 120000, 'GNF', '{"analytics": true, "customDomain": false, "prioritySupport": true, "apiAccess": false}'::jsonb, 'monthly', 500, 10),
('Enterprise', 300000, 'GNF', '{"analytics": true, "customDomain": true, "prioritySupport": true, "apiAccess": true}'::jsonb, 'monthly', -1, -1)
ON CONFLICT (name) DO NOTHING;

-- Paramètres système par défaut
INSERT INTO system_settings (key, value, description, category) VALUES 
('max_delivery_radius', '25', 'Rayon maximum de livraison en km', 'delivery'),
('default_preparation_time', '30', 'Temps de préparation par défaut en minutes', 'orders'),
('commission_rate', '5', 'Taux de commission par défaut en %', 'finance'),
('whatsapp_notifications_enabled', 'true', 'Notifications WhatsApp activées', 'notifications'),
('maintenance_mode', 'false', 'Mode maintenance activé', 'system')
ON CONFLICT (key) DO NOTHING;

-- Mettre à jour les restaurants existants avec le status 'active' s'ils n'en ont pas
UPDATE restaurants SET status = 'active' WHERE status IS NULL;

COMMENT ON TABLE super_admins IS 'Table des administrateurs du système';
COMMENT ON TABLE admin_audit_logs IS 'Logs d''audit des actions administrateurs';
COMMENT ON TABLE subscription_plans IS 'Plans d''abonnement SaaS';
COMMENT ON TABLE restaurant_subscriptions IS 'Abonnements des restaurants';
COMMENT ON TABLE invoices IS 'Factures des abonnements';
COMMENT ON TABLE system_settings IS 'Paramètres système configurables';

-- Vues utiles pour le Super Admin
CREATE OR REPLACE VIEW v_restaurant_overview AS
SELECT 
    r.id,
    r.nom,
    r.status,
    r.owner_name,
    r.phone_whatsapp,
    r.email,
    r.created_at,
    r.last_activity_at,
    COALESCE(stats.total_orders, 0) as order_count,
    COALESCE(stats.total_revenue, 0) as revenue,
    COALESCE(sub.plan_name, 'Aucun') as subscription_plan,
    sub.subscription_status
FROM restaurants r
LEFT JOIN (
    SELECT 
        restaurant_id,
        COUNT(*) as total_orders,
        SUM(CASE WHEN statut IN ('livree', 'terminee') THEN total ELSE 0 END) as total_revenue
    FROM commandes 
    GROUP BY restaurant_id
) stats ON r.id = stats.restaurant_id
LEFT JOIN (
    SELECT 
        rs.restaurant_id,
        sp.name as plan_name,
        rs.status as subscription_status
    FROM restaurant_subscriptions rs
    JOIN subscription_plans sp ON rs.plan_id = sp.id
    WHERE rs.status = 'active'
) sub ON r.id = sub.restaurant_id
WHERE r.status != 'deleted' OR r.status IS NULL;

COMMENT ON VIEW v_restaurant_overview IS 'Vue d''ensemble des restaurants avec leurs statistiques';