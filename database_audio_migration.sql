-- =================================================
-- MIGRATION AUDIO NOTIFICATIONS
-- Ajout des fonctionnalités de notification audio
-- =================================================

BEGIN;

-- Ajouter colonnes audio dans table france_restaurants
ALTER TABLE france_restaurants 
ADD COLUMN IF NOT EXISTS audio_notifications_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS audio_volume INTEGER DEFAULT 50 CHECK (audio_volume >= 0 AND audio_volume <= 100),
ADD COLUMN IF NOT EXISTS audio_enabled_since TIMESTAMP WITHOUT TIME ZONE NULL;

-- Ajouter colonne audio dans table france_orders  
ALTER TABLE france_orders 
ADD COLUMN IF NOT EXISTS audio_played BOOLEAN DEFAULT FALSE;

-- Commentaires pour documentation
COMMENT ON COLUMN france_restaurants.audio_notifications_enabled IS 'Active/désactive les notifications audio pour ce restaurant';
COMMENT ON COLUMN france_restaurants.audio_volume IS 'Volume des notifications audio (0-100)';
COMMENT ON COLUMN france_restaurants.audio_enabled_since IS 'Timestamp depuis quand l''audio est activé (NULL si désactivé)';
COMMENT ON COLUMN france_orders.audio_played IS 'Indique si la notification audio a été jouée pour cette commande';

-- Vérification des ajouts
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('france_restaurants', 'france_orders') 
AND column_name LIKE '%audio%'
ORDER BY table_name, column_name;

-- Si tout est correct, valider
COMMIT;

-- En cas de problème, annuler avec : ROLLBACK;