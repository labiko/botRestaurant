-- ========================================
-- CRÉATION DES TABLES POUR BOT RESTAURANT
-- ========================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE: restaurants
-- ========================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  adresse TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone_whatsapp VARCHAR(20) NOT NULL UNIQUE,
  
  -- Paramètres de livraison
  tarif_km INTEGER DEFAULT 3000,
  seuil_gratuite INTEGER DEFAULT 100000,
  minimum_livraison INTEGER DEFAULT 25000,
  rayon_livraison_km INTEGER DEFAULT 10,
  
  -- Horaires et statut
  horaires JSONB DEFAULT '{
    "lundi": {"ouverture": "11:00", "fermeture": "22:00"},
    "mardi": {"ouverture": "11:00", "fermeture": "22:00"},
    "mercredi": {"ouverture": "11:00", "fermeture": "22:00"},
    "jeudi": {"ouverture": "11:00", "fermeture": "22:00"},
    "vendredi": {"ouverture": "11:00", "fermeture": "23:00"},
    "samedi": {"ouverture": "12:00", "fermeture": "23:00"},
    "dimanche": {"ouverture": "12:00", "fermeture": "22:00"}
  }'::jsonb,
  statut VARCHAR(20) DEFAULT 'ouvert' CHECK (statut IN ('ouvert', 'ferme', 'pause')),
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches géographiques
CREATE INDEX idx_restaurants_location ON public.restaurants USING GIST (
  ll_to_earth(latitude, longitude)
);

-- ========================================
-- TABLE: menus
-- ========================================
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  nom_plat VARCHAR(255) NOT NULL,
  description TEXT,
  prix INTEGER NOT NULL CHECK (prix > 0),
  categorie VARCHAR(100) DEFAULT 'plat' CHECK (categorie IN ('entree', 'plat', 'dessert', 'boisson', 'accompagnement')),
  disponible BOOLEAN DEFAULT true,
  photo_url TEXT,
  ordre_affichage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_menus_restaurant ON public.menus(restaurant_id);
CREATE INDEX idx_menus_disponible ON public.menus(disponible) WHERE disponible = true;

-- ========================================
-- TABLE: clients
-- ========================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_whatsapp VARCHAR(20) UNIQUE NOT NULL,
  nom VARCHAR(255),
  restaurant_favori_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  adresse_default TEXT,
  latitude_default DECIMAL(10, 8),
  longitude_default DECIMAL(11, 8),
  nombre_commandes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_order_at TIMESTAMPTZ
);

-- Index pour les recherches rapides
CREATE INDEX idx_clients_phone ON public.clients(phone_whatsapp);

-- ========================================
-- TABLE: commandes
-- ========================================
CREATE TABLE IF NOT EXISTS public.commandes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_commande VARCHAR(20) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  
  -- Détails commande
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  /* Structure items:
  [
    {
      "menu_id": "uuid",
      "nom": "Poulet Yassa",
      "quantite": 2,
      "prix_unitaire": 65000,
      "sous_total": 130000
    }
  ]
  */
  sous_total INTEGER NOT NULL CHECK (sous_total >= 0),
  frais_livraison INTEGER DEFAULT 0 CHECK (frais_livraison >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  
  -- Mode et livraison
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('sur_place', 'emporter', 'livraison')),
  adresse_livraison TEXT,
  latitude_livraison DECIMAL(10, 8),
  longitude_livraison DECIMAL(11, 8),
  distance_km DECIMAL(5, 2),
  
  -- Statut et paiement
  statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN (
    'en_attente', 'confirmee', 'preparation', 'prete', 
    'en_livraison', 'livree', 'terminee', 'annulee'
  )),
  paiement_mode VARCHAR(30) CHECK (paiement_mode IN (
    'maintenant', 'fin_repas', 'recuperation', 'livraison'
  )),
  paiement_statut VARCHAR(20) DEFAULT 'en_attente' CHECK (paiement_statut IN (
    'en_attente', 'paye', 'echoue', 'rembourse'
  )),
  paiement_methode VARCHAR(30) CHECK (paiement_methode IN (
    'orange_money', 'wave', 'cash', 'carte'
  )),
  
  -- Livreur (si applicable)
  livreur_nom VARCHAR(255),
  livreur_phone VARCHAR(20),
  
  -- Notes
  note_client TEXT,
  note_restaurant TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  prepared_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  estimated_time TIMESTAMPTZ
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_commandes_client ON public.commandes(client_id);
CREATE INDEX idx_commandes_restaurant ON public.commandes(restaurant_id);
CREATE INDEX idx_commandes_statut ON public.commandes(statut);
CREATE INDEX idx_commandes_created ON public.commandes(created_at DESC);

-- ========================================
-- TABLE: sessions
-- ========================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_whatsapp VARCHAR(20) NOT NULL,
  state VARCHAR(50) NOT NULL DEFAULT 'INITIAL',
  context JSONB DEFAULT '{}'::jsonb,
  /* Structure context:
  {
    "restaurant_id": "uuid",
    "restaurant_nom": "Le Damier",
    "panier": [
      {"menu_id": "uuid", "nom": "Poulet", "quantite": 2, "prix": 65000}
    ],
    "sous_total": 130000,
    "mode": "livraison",
    "position_client": {"lat": 9.5, "lng": -13.7},
    "adresse_livraison": "Kipé, Ratoma",
    "frais_livraison": 9000,
    "distance_km": 3,
    "message_precedent": "menu_affiche"
  }
  */
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes et le nettoyage
CREATE INDEX idx_sessions_phone ON public.sessions(phone_whatsapp);
CREATE INDEX idx_sessions_expires ON public.sessions(expires_at);
CREATE INDEX idx_sessions_state ON public.sessions(state);

-- ========================================
-- TABLE: messages_templates
-- ========================================
CREATE TABLE IF NOT EXISTS public.messages_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  message TEXT NOT NULL,
  variables TEXT[], -- Liste des variables attendues
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- TABLE: logs_webhook
-- ========================================
CREATE TABLE IF NOT EXISTS public.logs_webhook (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_whatsapp VARCHAR(20),
  message_in TEXT,
  message_out TEXT,
  state_before VARCHAR(50),
  state_after VARCHAR(50),
  error TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour l'analyse
CREATE INDEX idx_logs_phone ON public.logs_webhook(phone_whatsapp);
CREATE INDEX idx_logs_created ON public.logs_webhook(created_at DESC);

-- ========================================
-- FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour calculer la distance Haversine
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  R CONSTANT DECIMAL := 6371; -- Rayon de la Terre en km
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat/2) * sin(dLat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dLon/2) * sin(dLon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour générer un numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number() RETURNS VARCHAR AS $$
DECLARE
  year_month VARCHAR;
  daily_count INTEGER;
  order_number VARCHAR;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYMM');
  
  SELECT COUNT(*) + 1 INTO daily_count
  FROM public.commandes
  WHERE DATE(created_at) = CURRENT_DATE;
  
  order_number := year_month || '-' || LPAD(daily_count::TEXT, 4, '0');
  
  RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un restaurant est ouvert
CREATE OR REPLACE FUNCTION is_restaurant_open(restaurant_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  resto RECORD;
  current_day VARCHAR;
  current_time TIME;
  opening_time TIME;
  closing_time TIME;
BEGIN
  SELECT * INTO resto FROM public.restaurants WHERE id = restaurant_id;
  
  IF resto.statut != 'ouvert' THEN
    RETURN FALSE;
  END IF;
  
  current_day := LOWER(TO_CHAR(NOW(), 'day'));
  current_time := LOCALTIME;
  
  opening_time := (resto.horaires->current_day->>'ouverture')::TIME;
  closing_time := (resto.horaires->current_day->>'fermeture')::TIME;
  
  RETURN current_time BETWEEN opening_time AND closing_time;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour générer automatiquement le numéro de commande
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_commande IS NULL THEN
    NEW.numero_commande := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON public.commandes
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Trigger pour mettre à jour le compteur de commandes client
CREATE OR REPLACE FUNCTION update_client_orders_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'terminee' AND OLD.statut != 'terminee' THEN
    UPDATE public.clients 
    SET nombre_commandes = nombre_commandes + 1,
        last_order_at = NOW()
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_orders_trigger AFTER UPDATE ON public.commandes
  FOR EACH ROW EXECUTE FUNCTION update_client_orders_count();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Policies pour les Edge Functions (service role)
CREATE POLICY "Service role has full access to restaurants" ON public.restaurants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to menus" ON public.menus
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to clients" ON public.clients
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to commandes" ON public.commandes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to sessions" ON public.sessions
  FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- DONNÉES DE TEST (Optionnel)
-- ========================================

-- Insérer quelques restaurants de test
INSERT INTO public.restaurants (nom, adresse, latitude, longitude, phone_whatsapp) VALUES
('Restaurant Le Damier', 'Quartier Taouyah, Conakry', 9.535747, -13.677290, '224625000001'),
('Le Petit Bistro', 'Kipé, Ratoma, Conakry', 9.554123, -13.661234, '224625000002'),
('Chez Mariama', 'Cosa, Ratoma, Conakry', 9.562890, -13.645678, '224625000003')
ON CONFLICT DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Tables créées avec succès!';
END $$;