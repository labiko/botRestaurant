-- 🇫🇷 SCHEMA BDD BOT WHATSAPP FRANCE - Version multi-restaurants
-- Optimisé pour les 4 modèles identifiés : MODULAIRE, FIXE, VARIANTES, COMPOSITE
-- Supports : Pizza Yolo 77, et autres restaurants France

-- ===============================
-- 1. RESTAURANTS FRANCE
-- ===============================

CREATE TABLE IF NOT EXISTS france_restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  phone VARCHAR(20),
  whatsapp_number VARCHAR(20) NOT NULL,
  delivery_zone_km INTEGER DEFAULT 5,
  min_order_amount DECIMAL(8,2) DEFAULT 0,
  delivery_fee DECIMAL(8,2) DEFAULT 2.50,
  is_active BOOLEAN DEFAULT true,
  business_hours JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- 2. CATÉGORIES DE MENU
-- ===============================

CREATE TABLE IF NOT EXISTS france_menu_categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES france_restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '🍽️',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id, slug)
);

-- ===============================
-- 3. PRODUITS UNIVERSELS
-- ===============================

CREATE TYPE product_type_enum AS ENUM ('simple', 'modular', 'variant', 'composite');

CREATE TABLE IF NOT EXISTS france_products (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES france_restaurants(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES france_menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  product_type product_type_enum NOT NULL,
  base_price DECIMAL(8,2),
  composition TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- 4. VARIANTES DE PRODUITS
-- ===============================

CREATE TABLE IF NOT EXISTS france_product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES france_products(id) ON DELETE CASCADE,
  variant_name VARCHAR(255) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  quantity INTEGER,
  unit VARCHAR(20),
  is_menu BOOLEAN DEFAULT false,
  includes_description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- ===============================
-- 5. OPTIONS MODULAIRES
-- ===============================

CREATE TABLE IF NOT EXISTS france_product_options (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES france_products(id) ON DELETE CASCADE,
  option_group VARCHAR(100) NOT NULL,
  option_name VARCHAR(255) NOT NULL,
  price_modifier DECIMAL(8,2) DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  max_selections INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- ===============================
-- 6. TAILLES PRODUITS
-- ===============================

CREATE TABLE IF NOT EXISTS france_product_sizes (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES france_products(id) ON DELETE CASCADE,
  size_name VARCHAR(10) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  includes_drink BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- ===============================
-- 7. COMPOSITIONS MENUS
-- ===============================

CREATE TABLE IF NOT EXISTS france_composite_items (
  id SERIAL PRIMARY KEY,
  composite_product_id INTEGER REFERENCES france_products(id) ON DELETE CASCADE,
  component_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(20) DEFAULT 'pièces'
);

-- ===============================
-- 8. SESSIONS UTILISATEUR
-- ===============================

CREATE TABLE IF NOT EXISTS france_user_sessions (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  chat_id VARCHAR(255) NOT NULL,
  restaurant_id INTEGER REFERENCES france_restaurants(id),
  current_step VARCHAR(100),
  session_data JSONB DEFAULT '{}'::jsonb,
  cart_items JSONB DEFAULT '[]'::jsonb,
  total_amount DECIMAL(8,2) DEFAULT 0,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 minutes'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(phone_number)
);

-- ===============================
-- 9. COMMANDES
-- ===============================

CREATE TABLE IF NOT EXISTS france_orders (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES france_restaurants(id),
  phone_number VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255),
  items JSONB NOT NULL,
  total_amount DECIMAL(8,2) NOT NULL,
  delivery_mode VARCHAR(50),
  delivery_address TEXT,
  payment_mode VARCHAR(50),
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'en_attente',
  notes TEXT,
  order_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- 10. NUMÉROS WHATSAPP AUTORISÉS
-- ===============================

CREATE TABLE IF NOT EXISTS france_whatsapp_numbers (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES france_restaurants(id) ON DELETE CASCADE,
  whatsapp_number VARCHAR(20) NOT NULL,
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id, whatsapp_number)
);

-- ===============================
-- 11. DONNÉES INITIALES PIZZA YOLO 77
-- ===============================

-- Restaurant Pizza Yolo 77
INSERT INTO france_restaurants (name, slug, address, city, postal_code, phone, whatsapp_number, business_hours) 
VALUES (
  'Pizza Yolo 77',
  'pizza-yolo-77',
  '123 Rue Example',
  'Paris',
  '77000',
  '0123456789',
  '33623456789',
  '{"lundi": "09:00-23:00", "mardi": "09:00-23:00", "mercredi": "09:00-23:00", "jeudi": "09:00-23:00", "vendredi": "09:00-23:00", "samedi": "09:00-23:00", "dimanche": "09:00-23:00"}'::jsonb
);

-- Catégories Pizza Yolo 77
INSERT INTO france_menu_categories (restaurant_id, name, slug, icon, display_order) 
SELECT 
  r.id,
  c.name,
  c.slug,
  c.icon,
  c.display_order
FROM france_restaurants r
CROSS JOIN (VALUES
  ('TACOS', 'tacos', '🌮', 1),
  ('BURGERS', 'burgers', '🍔', 2),
  ('SANDWICHS', 'sandwichs', '🥪', 3),
  ('GOURMETS', 'gourmets', '🥘', 4),
  ('SMASHS', 'smashs', '🥩', 5),
  ('ASSIETTES', 'assiettes', '🍽️', 6),
  ('NAANS', 'naans', '🫓', 7),
  ('POULET & SNACKS', 'poulet-snacks', '🍗', 8),
  ('ICE CREAM & DESSERTS & DRINKS', 'ice-cream-desserts-drinks', '🍨', 9)
) c(name, slug, icon, display_order)
WHERE r.slug = 'pizza-yolo-77';

-- ===============================
-- INDEX POUR PERFORMANCE
-- ===============================

CREATE INDEX IF NOT EXISTS idx_france_restaurants_slug ON france_restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_france_restaurants_active ON france_restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_france_categories_restaurant ON france_menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_france_products_restaurant ON france_products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_france_products_category ON france_products(category_id);
CREATE INDEX IF NOT EXISTS idx_france_products_active ON france_products(is_active);
CREATE INDEX IF NOT EXISTS idx_france_variants_product ON france_product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_france_sessions_phone ON france_user_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_france_sessions_expires ON france_user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_france_orders_restaurant ON france_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_france_orders_phone ON france_orders(phone_number);
CREATE INDEX IF NOT EXISTS idx_france_orders_created ON france_orders(created_at);

-- ===============================
-- COMMENTAIRES
-- ===============================

COMMENT ON TABLE france_restaurants IS 'Restaurants en France utilisant le bot WhatsApp';
COMMENT ON TABLE france_menu_categories IS 'Catégories de menu par restaurant';
COMMENT ON TABLE france_products IS 'Produits avec 4 types : simple, modular, variant, composite';
COMMENT ON TABLE france_product_variants IS 'Variantes pour produits à portions multiples';
COMMENT ON TABLE france_product_options IS 'Options pour produits modulaires';
COMMENT ON TABLE france_product_sizes IS 'Tailles pour produits modulaires';
COMMENT ON TABLE france_composite_items IS 'Composition des menus composites';
COMMENT ON TABLE france_user_sessions IS 'Sessions utilisateur avec panier et état';
COMMENT ON TABLE france_orders IS 'Commandes des restaurants France';
COMMENT ON TABLE france_whatsapp_numbers IS 'Numéros WhatsApp autorisés par restaurant';

-- ===============================
-- 📊 RÉSUMÉ ARCHITECTURE
-- ===============================
/*
MULTI-RESTAURANTS FRANCE :
- Support multiple restaurants avec structure identique
- Chaque restaurant a ses propres catégories et produits
- Sessions et commandes isolées par restaurant
- Numéros WhatsApp dédiés par restaurant

MODÈLES SUPPORTÉS :
1. SIMPLE : Prix fixe + composition
2. MODULAR : Tailles + choix + suppléments  
3. VARIANT : Portions multiples
4. COMPOSITE : Composition fixe multi-éléments

SCALABILITÉ :
- Ajout facile de nouveaux restaurants
- Performance optimisée avec indexes
- Structure flexible pour évolutions
*/