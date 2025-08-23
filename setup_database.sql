-- ========================================
-- SCRIPT COMPLET DE CRÉATION ET INITIALISATION
-- Bot Restaurant WhatsApp - Base de données
-- ========================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE: restaurants
-- ========================================
DROP TABLE IF EXISTS public.restaurants CASCADE;
CREATE TABLE public.restaurants (
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

-- ========================================
-- TABLE: menus
-- ========================================
DROP TABLE IF EXISTS public.menus CASCADE;
CREATE TABLE public.menus (
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

-- ========================================
-- TABLE: clients
-- ========================================
DROP TABLE IF EXISTS public.clients CASCADE;
CREATE TABLE public.clients (
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

-- ========================================
-- TABLE: commandes
-- ========================================
DROP TABLE IF EXISTS public.commandes CASCADE;
CREATE TABLE public.commandes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_commande VARCHAR(20) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  
  -- Détails commande
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
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
  
  -- Livreur
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

-- ========================================
-- TABLE: sessions
-- ========================================
DROP TABLE IF EXISTS public.sessions CASCADE;
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_whatsapp VARCHAR(20) NOT NULL,
  state VARCHAR(50) NOT NULL DEFAULT 'INITIAL',
  context JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- TABLE: logs_webhook
-- ========================================
DROP TABLE IF EXISTS public.logs_webhook CASCADE;
CREATE TABLE public.logs_webhook (
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

-- ========================================
-- INDEX POUR PERFORMANCE
-- ========================================

-- Index pour les recherches géographiques
CREATE INDEX idx_restaurants_location ON public.restaurants (latitude, longitude);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_menus_restaurant ON public.menus(restaurant_id);
CREATE INDEX idx_menus_disponible ON public.menus(disponible) WHERE disponible = true;
CREATE INDEX idx_menus_categorie ON public.menus(categorie);

CREATE INDEX idx_clients_phone ON public.clients(phone_whatsapp);
CREATE INDEX idx_clients_favori ON public.clients(restaurant_favori_id);

CREATE INDEX idx_commandes_client ON public.commandes(client_id);
CREATE INDEX idx_commandes_restaurant ON public.commandes(restaurant_id);
CREATE INDEX idx_commandes_statut ON public.commandes(statut);
CREATE INDEX idx_commandes_created ON public.commandes(created_at DESC);
CREATE INDEX idx_commandes_numero ON public.commandes(numero_commande);

CREATE INDEX idx_sessions_phone ON public.sessions(phone_whatsapp);
CREATE INDEX idx_sessions_expires ON public.sessions(expires_at);
CREATE INDEX idx_sessions_state ON public.sessions(state);

CREATE INDEX idx_logs_phone ON public.logs_webhook(phone_whatsapp);
CREATE INDEX idx_logs_created ON public.logs_webhook(created_at DESC);

-- ========================================
-- FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour calculer la distance Haversine (compatible Supabase)
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
  lat1_rad DECIMAL;
  lat2_rad DECIMAL;
BEGIN
  -- Conversion en radians
  lat1_rad := lat1 * pi() / 180;
  lat2_rad := lat2 * pi() / 180;
  dLat := (lat2 - lat1) * pi() / 180;
  dLon := (lon2 - lon1) * pi() / 180;
  
  -- Formule de Haversine
  a := power(sin(dLat/2), 2) +
       cos(lat1_rad) * cos(lat2_rad) *
       power(sin(dLon/2), 2);
  
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
  current_time_val TIME;
  opening_time TIME;
  closing_time TIME;
BEGIN
  SELECT * INTO resto FROM public.restaurants WHERE id = restaurant_id;
  
  IF resto.statut != 'ouvert' THEN
    RETURN FALSE;
  END IF;
  
  current_day := LOWER(TO_CHAR(NOW(), 'day'));
  current_day := TRIM(current_day);
  current_time_val := LOCALTIME;
  
  -- Mapper les jours français
  CASE current_day
    WHEN 'monday' THEN current_day := 'lundi';
    WHEN 'tuesday' THEN current_day := 'mardi';
    WHEN 'wednesday' THEN current_day := 'mercredi';
    WHEN 'thursday' THEN current_day := 'jeudi';
    WHEN 'friday' THEN current_day := 'vendredi';
    WHEN 'saturday' THEN current_day := 'samedi';
    WHEN 'sunday' THEN current_day := 'dimanche';
    ELSE current_day := 'lundi';
  END CASE;
  
  IF resto.horaires ? current_day THEN
    opening_time := (resto.horaires->current_day->>'ouverture')::TIME;
    closing_time := (resto.horaires->current_day->>'fermeture')::TIME;
    
    RETURN current_time_val BETWEEN opening_time AND closing_time;
  END IF;
  
  RETURN FALSE;
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
  IF NEW.numero_commande IS NULL OR NEW.numero_commande = '' THEN
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
  IF NEW.statut = 'terminee' AND (OLD IS NULL OR OLD.statut != 'terminee') THEN
    UPDATE public.clients 
    SET nombre_commandes = nombre_commandes + 1,
        last_order_at = NOW()
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_orders_trigger AFTER INSERT OR UPDATE ON public.commandes
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
ALTER TABLE public.logs_webhook ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Service role has full access to logs" ON public.logs_webhook
  FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- DONNÉES DE TEST - RESTAURANTS CONAKRY
-- ========================================

INSERT INTO public.restaurants (nom, adresse, latitude, longitude, phone_whatsapp, tarif_km, seuil_gratuite, minimum_livraison, rayon_livraison_km) VALUES
('Restaurant Le Damier', 'Quartier Taouyah, Commune de Kaloum, Conakry', 9.535747, -13.677290, '224625000001', 3000, 100000, 25000, 15),
('Le Petit Bistro', 'Kipé, Commune de Ratoma, Conakry', 9.554123, -13.661234, '224625000002', 2500, 80000, 20000, 12),
('Chez Mariama', 'Cosa, Commune de Ratoma, Conakry', 9.562890, -13.645678, '224625000003', 3500, 120000, 30000, 18),
('La Terrasse Moderne', 'Minière, Commune de Dixinn, Conakry', 9.541234, -13.654321, '224625000004', 4000, 150000, 35000, 20),
('Le Bambou Doré', 'Hamdallaye, Commune de Ratoma, Conakry', 9.571234, -13.652890, '224625000005', 2800, 90000, 22000, 14),
('Restaurant Almamya', 'Almamya, Commune de Kaloum, Conakry', 9.509876, -13.712345, '224625000006', 3200, 110000, 28000, 16),
('Chez Fatoumata', 'Coléah, Commune de Matam, Conakry', 9.525678, -13.645123, '224625000007', 3800, 140000, 32000, 17);

-- ========================================
-- DONNÉES DE TEST - MENUS
-- ========================================

-- Menu Restaurant Le Damier
INSERT INTO public.menus (restaurant_id, nom_plat, description, prix, categorie, ordre_affichage) VALUES
((SELECT id FROM restaurants WHERE nom = 'Restaurant Le Damier'), 'Salade César', 'Salade verte, croûtons, parmesan, sauce césar', 35000, 'entree', 1),
((SELECT id FROM restaurants WHERE nom = 'Restaurant Le Damier'), 'Avocat aux crevettes', 'Avocat farci aux crevettes, sauce cocktail', 45000, 'entree', 2),
((SELECT id FROM restaurants WHERE nom = 'Restaurant Le Damier'), 'Poulet Yassa', 'Poulet mariné à la sauce yassa, riz blanc', 65000, 'plat', 3),
((SELECT id FROM restaurants WHERE nom = 'Restaurant Le Damier'), 'Poisson Braisé', 'Poisson frais braisé, légumes, attiéké', 75000, 'plat', 4),
((SELECT id FROM restaurants WHERE nom = 'Restaurant Le Damier'), 'Riz Gras', 'Riz gras traditionnel guinéen, viande', 55000, 'plat', 5),
((SELECT id FROM restaurants WHERE nom = 'Restaurant Le Damier'), 'Tarte aux fruits', 'Tarte maison aux fruits de saison', 25000, 'dessert', 6),
((SELECT id FROM restaurants WHERE nom = 'Restaurant Le Damier'), 'Jus d''orange frais', 'Jus d''orange pressé minute', 15000, 'boisson', 7),
((SELECT id FROM restaurants WHERE nom = 'Restaurant Le Damier'), 'Café expresso', 'Café italien, servi avec petit four', 12000, 'boisson', 8);

-- Menu Le Petit Bistro
INSERT INTO public.menus (restaurant_id, nom_plat, description, prix, categorie, ordre_affichage) VALUES
((SELECT id FROM restaurants WHERE nom = 'Le Petit Bistro'), 'Soupe de poisson', 'Soupe traditionnelle aux épices', 30000, 'entree', 1),
((SELECT id FROM restaurants WHERE nom = 'Le Petit Bistro'), 'Salade mixte', 'Salade de légumes frais de saison', 28000, 'entree', 2),
((SELECT id FROM restaurants WHERE nom = 'Le Petit Bistro'), 'Capitaine sauce', 'Poisson capitaine, sauce tomate', 70000, 'plat', 3),
((SELECT id FROM restaurants WHERE nom = 'Le Petit Bistro'), 'Poulet rôti', 'Poulet fermier rôti aux herbes', 60000, 'plat', 4),
((SELECT id FROM restaurants WHERE nom = 'Le Petit Bistro'), 'Fonio aux légumes', 'Fonio traditionnel, légumes frais', 45000, 'plat', 5),
((SELECT id FROM restaurants WHERE nom = 'Le Petit Bistro'), 'Banane plantain frite', 'Accompagnement de bananes frites', 18000, 'accompagnement', 6),
((SELECT id FROM restaurants WHERE nom = 'Le Petit Bistro'), 'Bissap frais', 'Jus de bissap maison, glacé', 12000, 'boisson', 7);

-- Menu Chez Mariama
INSERT INTO public.menus (restaurant_id, nom_plat, description, prix, categorie, ordre_affichage) VALUES
((SELECT id FROM restaurants WHERE nom = 'Chez Mariama'), 'Salade de fruits de mer', 'Salade fraîche aux fruits de mer', 50000, 'entree', 1),
((SELECT id FROM restaurants WHERE nom = 'Chez Mariama'), 'Crevettes grillées', 'Crevettes fraîches grillées, riz', 85000, 'plat', 2),
((SELECT id FROM restaurants WHERE nom = 'Chez Mariama'), 'Thiéboudienne', 'Riz au poisson, légumes traditionnels', 80000, 'plat', 3),
((SELECT id FROM restaurants WHERE nom = 'Chez Mariama'), 'Langouste grillée', 'Langouste locale grillée, beurre à l''ail', 120000, 'plat', 4),
((SELECT id FROM restaurants WHERE nom = 'Chez Mariama'), 'Sorbet coco', 'Sorbet maison à la noix de coco', 22000, 'dessert', 5),
((SELECT id FROM restaurants WHERE nom = 'Chez Mariama'), 'Jus de gingembre', 'Jus de gingembre frais, miel', 18000, 'boisson', 6);

-- ========================================
-- FONCTION DE NETTOYAGE AUTOMATIQUE
-- ========================================

-- Nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VUES UTILES
-- ========================================

-- Vue des restaurants avec menus disponibles
CREATE OR REPLACE VIEW restaurants_with_menus AS
SELECT 
  r.*,
  COUNT(m.id) as nombre_plats,
  MIN(m.prix) as prix_min,
  MAX(m.prix) as prix_max,
  is_restaurant_open(r.id) as est_ouvert
FROM restaurants r
LEFT JOIN menus m ON r.id = m.restaurant_id AND m.disponible = true
GROUP BY r.id;

-- Vue des commandes avec détails
CREATE OR REPLACE VIEW commandes_details AS
SELECT 
  c.*,
  r.nom as restaurant_nom,
  r.adresse as restaurant_adresse,
  cl.nom as client_nom,
  cl.phone_whatsapp as client_phone
FROM commandes c
JOIN restaurants r ON c.restaurant_id = r.id
JOIN clients cl ON c.client_id = cl.id;

-- ========================================
-- NOTIFICATION
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Base de données Bot Restaurant initialisée avec succès!';
  RAISE NOTICE '📊 Restaurants créés: %', (SELECT COUNT(*) FROM restaurants);
  RAISE NOTICE '🍽️ Plats au menu: %', (SELECT COUNT(*) FROM menus);
  RAISE NOTICE '🚀 Système prêt pour déploiement!';
END $$;