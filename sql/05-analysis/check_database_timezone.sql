-- ============================================
-- DIAGNOSTIC TIMEZONE BASE DE DONNÉES
-- ============================================

-- 1. Vérifier le timezone actuel de la base de données
SELECT name, setting 
FROM pg_settings 
WHERE name = 'TimeZone';

-- 2. Afficher l'heure actuelle selon la base de données
SELECT 
    NOW() AS heure_actuelle_base,
    NOW() AT TIME ZONE 'UTC' AS heure_utc,
    NOW() AT TIME ZONE 'Europe/Paris' AS heure_france;

-- 3. Vérifier les 5 dernières commandes avec leurs timestamps
SELECT 
    id,
    order_number,
    created_at,
    created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Paris' AS created_at_france
FROM france_orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Vérifier la différence entre UTC et heure locale
SELECT 
    '10:16:00'::TIME AS heure_commande_reelle,
    '08:16:00'::TIME AS heure_stockee_base,
    AGE('10:16:00'::TIME, '08:16:00'::TIME) AS difference;

-- 5. Information sur la configuration PostgreSQL
SELECT 
    current_setting('timezone') AS current_timezone,
    extract(timezone_hour from now()) AS offset_hours,
    extract(timezone_minute from now()) AS offset_minutes;

-- ============================================
-- SOLUTION : Configurer le timezone France
-- ============================================

-- OPTION A : Changer le timezone de la session (temporaire)
-- SET timezone = 'Europe/Paris';

-- OPTION B : Changer le timezone de la base (permanent - nécessite privilèges admin)
-- ALTER DATABASE postgres SET timezone = 'Europe/Paris';

-- OPTION C : Forcer le timezone lors des insertions (dans le code bot)
-- INSERT avec : NOW() AT TIME ZONE 'Europe/Paris'