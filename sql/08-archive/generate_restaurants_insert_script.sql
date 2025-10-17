-- =========================================================================
-- GÉNÉRATION SCRIPT D'INSERTION RESTAURANTS - CORRIGÉ
-- DATE: 2025-10-06
-- OBJECTIF: Générer un script SQL INSERT avec TOUTES les colonnes
-- =========================================================================
-- ⚠️ EXÉCUTER SUR DEV (lphvdoyhwaelmwdfkfuh)
-- =========================================================================

SELECT string_agg(
    format(
        'INSERT INTO france_restaurants (id, name, slug, address, city, postal_code, phone, whatsapp_number, delivery_zone_km, min_order_amount, delivery_fee, is_active, business_hours, created_at, updated_at, password_hash, timezone, country_code, hide_delivery_info, is_exceptionally_closed, latitude, longitude, audio_notifications_enabled, audio_volume, audio_enabled_since, deployment_status, delivery_address_mode, currency) VALUES (%s, %L, %L, %L, %L, %L, %L, %L, %s, %s, %s, %s, %L::jsonb, %L, %L, %L, %L, %L, %s, %s, %s, %s, %s, %s, %L, %L, %L, %L);',
        id,
        name,
        slug,
        address,
        city,
        postal_code,
        phone,
        whatsapp_number,
        COALESCE(delivery_zone_km::TEXT, 'NULL'),
        COALESCE(min_order_amount::TEXT, 'NULL'),
        COALESCE(delivery_fee::TEXT, 'NULL'),
        is_active,
        COALESCE(business_hours::TEXT, '{}'),
        created_at,
        updated_at,
        password_hash,
        timezone,
        country_code,
        COALESCE(hide_delivery_info::TEXT, 'false'),
        COALESCE(is_exceptionally_closed::TEXT, 'false'),
        COALESCE(latitude::TEXT, 'NULL'),
        COALESCE(longitude::TEXT, 'NULL'),
        COALESCE(audio_notifications_enabled::TEXT, 'true'),
        COALESCE(audio_volume::TEXT, '50'),
        audio_enabled_since,
        deployment_status,
        delivery_address_mode,
        currency
    ),
    E'\n'
    ORDER BY id
) AS insert_script
FROM france_restaurants;

-- =========================================================================
-- INSTRUCTIONS
-- =========================================================================
-- 1. Exécuter cette requête sur DEV
-- 2. Copier le résultat (toutes les lignes INSERT)
-- 3. Utiliser le résultat dans le script de migration PROD
-- =========================================================================
