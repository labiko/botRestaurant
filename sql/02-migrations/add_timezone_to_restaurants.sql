BEGIN;

-- 1. Ajouter la colonne timezone à france_restaurants
ALTER TABLE france_restaurants 
ADD COLUMN timezone VARCHAR(50) DEFAULT 'Europe/Paris';

-- 2. Ajouter la colonne country pour identifier les pays (optionnel)
ALTER TABLE france_restaurants 
ADD COLUMN country_code VARCHAR(2) DEFAULT 'FR';

-- 3. Configurer les restaurants français existants
UPDATE france_restaurants 
SET timezone = 'Europe/Paris', 
    country_code = 'FR'
WHERE timezone IS NULL OR timezone = 'Europe/Paris';

-- 4. Exemple de configuration pour futurs restaurants guinéens
-- UPDATE france_restaurants 
-- SET timezone = 'Africa/Conakry', 
--     country_code = 'GN'
-- WHERE id IN (2, 3, 4); -- IDs des restaurants guinéens

-- 5. Vérification des données
SELECT 
    id, 
    name, 
    timezone, 
    country_code,
    created_at
FROM france_restaurants
ORDER BY id;

-- 6. Index pour performance sur les requêtes par timezone
CREATE INDEX IF NOT EXISTS idx_france_restaurants_timezone 
ON france_restaurants(timezone);

COMMIT;