-- Script SQL pour créer la table de gestion des vitrines
-- À exécuter dans Supabase SQL Editor

-- Table pour les paramètres de vitrine des restaurants
CREATE TABLE restaurant_vitrine_settings (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES france_restaurants(id) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,

    -- Personnalisation couleurs
    primary_color VARCHAR(7) DEFAULT '#ff0000' NOT NULL,
    secondary_color VARCHAR(7) DEFAULT '#cc0000' NOT NULL,
    accent_color VARCHAR(7) DEFAULT '#ffc107' NOT NULL,
    logo_emoji VARCHAR(10) DEFAULT '🍕' NOT NULL,

    -- Textes personnalisables
    subtitle VARCHAR(200) DEFAULT 'Commandez en 30 secondes sur WhatsApp!' NOT NULL,
    promo_text VARCHAR(200) DEFAULT '🎉 LIVRAISON GRATUITE DÈS 25€ 🎉',

    -- Features (stockées en JSON)
    feature_1 TEXT DEFAULT '{"emoji": "🚀", "text": "Livraison rapide"}',
    feature_2 TEXT DEFAULT '{"emoji": "💯", "text": "Produits frais"}',
    feature_3 TEXT DEFAULT '{"emoji": "⭐", "text": "4.8 étoiles"}',

    -- Paramètres stats
    show_live_stats BOOLEAN DEFAULT true NOT NULL,
    average_rating DECIMAL(2,1) DEFAULT 4.8 NOT NULL CHECK (average_rating >= 0 AND average_rating <= 5),
    delivery_time_min INTEGER DEFAULT 25 NOT NULL CHECK (delivery_time_min > 0),

    -- Activation et dates
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_vitrine_restaurant ON restaurant_vitrine_settings(restaurant_id);
CREATE INDEX idx_vitrine_slug ON restaurant_vitrine_settings(slug);
CREATE INDEX idx_vitrine_active ON restaurant_vitrine_settings(is_active);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_vitrine_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vitrine_updated_at
    BEFORE UPDATE ON restaurant_vitrine_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_vitrine_updated_at();

-- Fonction pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_unique_vitrine_slug(restaurant_name TEXT, restaurant_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Générer le slug de base à partir du nom du restaurant
    base_slug := lower(restaurant_name);
    base_slug := regexp_replace(base_slug, '[^a-z0-9]', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(base_slug, '-');

    -- Ajouter l'ID du restaurant
    final_slug := base_slug || '-' || restaurant_id;

    -- Vérifier l'unicité
    WHILE EXISTS (SELECT 1 FROM restaurant_vitrine_settings WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || restaurant_id || '-' || counter;
        counter := counter + 1;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Exemple d'insertion pour tester
-- INSERT INTO restaurant_vitrine_settings (restaurant_id, slug)
-- SELECT id, generate_unique_vitrine_slug(name, id)
-- FROM france_restaurants
-- WHERE id = 1;

-- Politique de sécurité (RLS) - optionnel selon votre configuration
-- ALTER TABLE restaurant_vitrine_settings ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow authenticated users to manage vitrine settings" ON restaurant_vitrine_settings
-- FOR ALL USING (auth.role() = 'authenticated');

-- Commentaires sur les colonnes
COMMENT ON TABLE restaurant_vitrine_settings IS 'Paramètres de personnalisation des pages vitrine pour chaque restaurant';
COMMENT ON COLUMN restaurant_vitrine_settings.restaurant_id IS 'Référence vers le restaurant (france_restaurants.id)';
COMMENT ON COLUMN restaurant_vitrine_settings.slug IS 'URL slug unique pour la page vitrine (/vitrine/slug)';
COMMENT ON COLUMN restaurant_vitrine_settings.primary_color IS 'Couleur principale (hex) utilisée pour les éléments principaux';
COMMENT ON COLUMN restaurant_vitrine_settings.secondary_color IS 'Couleur secondaire (hex) pour les dégradés et éléments secondaires';
COMMENT ON COLUMN restaurant_vitrine_settings.feature_1 IS 'Premier point fort au format JSON: {"emoji": "🚀", "text": "Description"}';
COMMENT ON COLUMN restaurant_vitrine_settings.feature_2 IS 'Deuxième point fort au format JSON: {"emoji": "💯", "text": "Description"}';
COMMENT ON COLUMN restaurant_vitrine_settings.feature_3 IS 'Troisième point fort au format JSON: {"emoji": "⭐", "text": "Description"}';

-- Vérification de la structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'restaurant_vitrine_settings'
ORDER BY ordinal_position;