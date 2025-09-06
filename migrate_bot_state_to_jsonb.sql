-- Migration bot_state de TEXT vers JSONB pour compatibilité bot universel

BEGIN;

-- 1. Sauvegarder les valeurs existantes
CREATE TEMPORARY TABLE temp_bot_states AS
SELECT id, phone_number, bot_state as old_bot_state
FROM public.france_user_sessions;

-- 2. Supprimer l'ancienne colonne et recréer en JSONB
ALTER TABLE public.france_user_sessions DROP COLUMN bot_state;

ALTER TABLE public.france_user_sessions 
ADD COLUMN bot_state JSONB DEFAULT '{"mode": "menu_browsing", "language": "fr", "context": {}}'::JSONB;

-- 3. Mapper les anciennes valeurs vers le nouveau format JSONB
UPDATE public.france_user_sessions 
SET bot_state = CASE 
    WHEN temp.old_bot_state = 'INITIAL' THEN '{"mode": "menu_browsing", "language": "fr", "context": {}}'::JSONB
    WHEN temp.old_bot_state = 'CHOOSING_DELIVERY_MODE' THEN '"CHOOSING_DELIVERY_MODE"'::JSONB
    WHEN temp.old_bot_state = 'VIEWING_MENU' THEN '"VIEWING_MENU"'::JSONB
    WHEN temp.old_bot_state = 'SELECTING_PRODUCTS' THEN '"SELECTING_PRODUCTS"'::JSONB
    WHEN temp.old_bot_state = 'CART_REVIEW' THEN '"CART_REVIEW"'::JSONB
    WHEN temp.old_bot_state = 'ADDRESS_INPUT' THEN '"ADDRESS_INPUT"'::JSONB
    WHEN temp.old_bot_state = 'PAYMENT_CHOICE' THEN '"PAYMENT_CHOICE"'::JSONB
    WHEN temp.old_bot_state = 'ORDER_CONFIRMATION' THEN '"ORDER_CONFIRMATION"'::JSONB
    ELSE '{"mode": "menu_browsing", "language": "fr", "context": {}}'::JSONB
END
FROM temp_bot_states temp
WHERE france_user_sessions.id = temp.id;

-- 4. Vérifier la migration
SELECT 
    count(*) as total_sessions,
    count(*) FILTER (WHERE bot_state IS NOT NULL) as sessions_with_bot_state,
    jsonb_typeof(bot_state) as bot_state_type
FROM public.france_user_sessions
WHERE bot_state IS NOT NULL
GROUP BY jsonb_typeof(bot_state);

-- 5. Exemple de valeurs migrées
SELECT id, phone_number, bot_state
FROM public.france_user_sessions 
LIMIT 3;

COMMIT;

-- Vérification finale de la structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'france_user_sessions' 
  AND table_schema = 'public'
  AND column_name = 'bot_state';