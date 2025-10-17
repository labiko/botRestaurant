-- =========================================================================
-- SYNCHRONISATION RESTAURANTS DEV → PROD (SMART SYNC)
-- DATE: 2025-10-06
-- ⚠️ À EXÉCUTER SUR PROD (vywbhlnzvfqtiurwmrac)
-- =========================================================================
-- DEV = SOURCE DE VÉRITÉ
-- - UPDATE : restaurants existants en PROD avec données DEV
-- - INSERT : restaurants qui n'existent qu'en DEV
-- =========================================================================

BEGIN;

-- =========================================================================
-- PARTIE 1 : UPDATE DES RESTAURANTS EXISTANTS (ID 1, 16, 17)
-- =========================================================================

-- Restaurant ID 1 - Pizza Yolo 77
UPDATE france_restaurants SET
    name = 'Pizza Yolo 77',
    slug = 'pizza-yolo-77',
    address = '251 Av. Philippe Bur, 77550 Moissy-Cramayel',
    city = 'Paris',
    postal_code = '77000',
    phone = '33601234567',
    whatsapp_number = '33601234567',
    delivery_zone_km = 5,
    min_order_amount = 0.00,
    delivery_fee = 2.50,
    is_active = true,
    business_hours = '{"jeudi":{"isOpen":true,"closing":"23:00","opening":"08:00"},"lundi":{"isOpen":true,"closing":"23:00","opening":"09:00"},"mardi":{"isOpen":true,"closing":"04:00","opening":"08:00"},"samedi":{"isOpen":true,"closing":"23:00","opening":"10:00"},"dimanche":{"isOpen":true,"closing":"22:00","opening":"08:00"},"mercredi":{"isOpen":true,"closing":"04:00","opening":"08:00"},"vendredi":{"isOpen":true,"closing":"23:00","opening":"07:00"}}'::jsonb,
    created_at = '2025-09-01 13:16:46.405758'::timestamp,
    updated_at = '2025-09-07 18:57:59.6647'::timestamp,
    password_hash = 'Passer@123',
    timezone = 'Europe/Paris',
    country_code = 'FR',
    hide_delivery_info = true,
    is_exceptionally_closed = false,
    latitude = 48.62753600,
    longitude = 2.59375800,
    audio_notifications_enabled = true,
    audio_volume = 35,
    audio_enabled_since = '2025-10-02 18:36:40'::timestamp,
    deployment_status = 'production',
    delivery_address_mode = 'address',
    currency = 'EUR'
WHERE id = 1;

-- Restaurant ID 16 - Le Nouveau O'CV Moissy
UPDATE france_restaurants SET
    name = 'Le Nouveau O''CV Moissy',
    slug = 'le-nouveau-ocv-moissy',
    address = '37 Pl. du 14 Juillet 1789, 77550 Moissy-Cramayel',
    city = 'Moissy-cramayel',
    postal_code = NULL,
    phone = '33675654321',
    whatsapp_number = '33675654321',
    delivery_zone_km = 5,
    min_order_amount = 0.00,
    delivery_fee = 2.50,
    is_active = true,
    business_hours = '{"jeudi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"lundi":{"isOpen":true,"closing":"23:59","opening":"10:00"},"mardi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"samedi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"dimanche":{"isOpen":true,"closing":"00:56","opening":"07:00"},"mercredi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"vendredi":{"isOpen":true,"closing":"23:50","opening":"07:00"}}'::jsonb,
    created_at = '2025-09-20 22:14:19.263306'::timestamp,
    updated_at = '2025-09-20 22:14:19.263306'::timestamp,
    password_hash = '810790',
    timezone = 'Europe/Paris',
    country_code = 'FR',
    hide_delivery_info = false,
    is_exceptionally_closed = false,
    latitude = NULL,
    longitude = NULL,
    audio_notifications_enabled = true,
    audio_volume = 50,
    audio_enabled_since = NULL,
    deployment_status = 'production',
    delivery_address_mode = 'address',
    currency = 'EUR'
WHERE id = 16;

-- Restaurant ID 17 - Le Carreman
UPDATE france_restaurants SET
    name = 'Le Carreman',
    slug = 'le-carreman',
    address = '206 rue de seville',
    city = 'NONGO TADY',
    postal_code = NULL,
    phone = '224601234567',
    whatsapp_number = '224601234567',
    delivery_zone_km = 5,
    min_order_amount = 0.00,
    delivery_fee = 2.50,
    is_active = true,
    business_hours = '{"jeudi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"lundi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"mardi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"samedi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"dimanche":{"isOpen":true,"closing":"23:50","opening":"07:00"},"mercredi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"vendredi":{"isOpen":true,"closing":"23:50","opening":"07:00"}}'::jsonb,
    created_at = '2025-09-23 17:37:36.896514'::timestamp,
    updated_at = '2025-10-06 11:13:10.466'::timestamp,
    password_hash = '810790',
    timezone = 'Africa/Conakry',
    country_code = 'GN',
    hide_delivery_info = false,
    is_exceptionally_closed = false,
    latitude = 48.62825690,
    longitude = 2.58958699,
    audio_notifications_enabled = true,
    audio_volume = 50,
    audio_enabled_since = NULL,
    deployment_status = 'production',
    delivery_address_mode = 'address',
    currency = 'GNF'
WHERE id = 17;

-- =========================================================================
-- PARTIE 2 : INSERT DES NOUVEAUX RESTAURANTS (ID 18)
-- =========================================================================

-- Restaurant ID 18 - Bh Tacos one (N'EXISTE PAS EN PROD)
INSERT INTO france_restaurants (
    id, name, slug, address, city, postal_code, phone, whatsapp_number,
    delivery_zone_km, min_order_amount, delivery_fee, is_active,
    business_hours, created_at, updated_at, password_hash, timezone,
    country_code, hide_delivery_info, is_exceptionally_closed,
    latitude, longitude, audio_notifications_enabled, audio_volume,
    audio_enabled_since, deployment_status, delivery_address_mode, currency
)
SELECT
    18,
    'Bh Tacos one',
    'bh-tacos-one',
    '21 Pl. des Fontaines',
    '77176 Savigny-le-Temple',
    NULL,
    '33675123456',
    '33675123456',
    5,
    0.00,
    2.50,
    true,
    '{"jeudi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"lundi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"mardi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"samedi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"dimanche":{"isOpen":true,"closing":"23:50","opening":"07:00"},"mercredi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"vendredi":{"isOpen":true,"closing":"23:50","opening":"07:00"}}'::jsonb,
    '2025-09-28 15:41:30.110135'::timestamp,
    '2025-09-28 15:41:30.110135'::timestamp,
    '810790',
    'Europe/Paris',
    'FR',
    false,
    false,
    NULL,
    NULL,
    true,
    50,
    NULL,
    'production',
    'address',
    'EUR'
WHERE NOT EXISTS (SELECT 1 FROM france_restaurants WHERE id = 18);

-- =========================================================================
-- PARTIE 3 : RÉINITIALISER LA SÉQUENCE
-- =========================================================================
SELECT setval('france_restaurants_id_seq', 18);

-- =========================================================================
-- PARTIE 4 : VÉRIFICATIONS DÉTAILLÉES
-- =========================================================================
DO $$
DECLARE
    v_count INT;
    v_pizza RECORD;
    v_ocv RECORD;
    v_carreman RECORD;
    v_bh RECORD;
BEGIN
    SELECT COUNT(*) INTO v_count FROM france_restaurants;

    SELECT id, phone, whatsapp_number, audio_notifications_enabled INTO v_pizza
    FROM france_restaurants WHERE id = 1;

    SELECT id, phone INTO v_ocv
    FROM france_restaurants WHERE id = 16;

    SELECT id, phone, whatsapp_number, city, country_code, currency INTO v_carreman
    FROM france_restaurants WHERE id = 17;

    SELECT id, name, phone INTO v_bh
    FROM france_restaurants WHERE id = 18;

    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 VÉRIFICATION SYNCHRONISATION DEV → PROD';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total restaurants : % (attendu: 4)', v_count;
    RAISE NOTICE '';

    RAISE NOTICE '✅ ID 1 - Pizza Yolo 77:';
    RAISE NOTICE '   Phone: % ✓ 33601234567', v_pizza.phone;
    RAISE NOTICE '   WhatsApp: % ✓ 33601234567', v_pizza.whatsapp_number;
    RAISE NOTICE '   Audio notif: % ✓ true', v_pizza.audio_notifications_enabled;
    RAISE NOTICE '';

    RAISE NOTICE '✅ ID 16 - Le Nouveau O''CV Moissy:';
    RAISE NOTICE '   Phone: % ✓ 33675654321', v_ocv.phone;
    RAISE NOTICE '';

    RAISE NOTICE '✅ ID 17 - Le Carreman:';
    RAISE NOTICE '   Phone: % ✓ 224601234567', v_carreman.phone;
    RAISE NOTICE '   WhatsApp: % ✓ 224601234567', v_carreman.whatsapp_number;
    RAISE NOTICE '   City: % ✓ NONGO TADY', v_carreman.city;
    RAISE NOTICE '   Country: % ✓ GN', v_carreman.country_code;
    RAISE NOTICE '   Currency: % ✓ GNF', v_carreman.currency;
    RAISE NOTICE '';

    IF v_bh.id IS NOT NULL THEN
        RAISE NOTICE '✅ ID 18 - Bh Tacos one (NOUVEAU):';
        RAISE NOTICE '   Nom: % ✓ Bh Tacos one', v_bh.name;
        RAISE NOTICE '   Phone: % ✓ 33675123456', v_bh.phone;
    ELSE
        RAISE WARNING '❌ ID 18 - Bh Tacos one : NON CRÉÉ !';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';

    IF v_count = 4
       AND v_pizza.phone = '33601234567'
       AND v_ocv.phone = '33675654321'
       AND v_carreman.phone = '224601234567'
       AND v_carreman.country_code = 'GN'
       AND v_bh.id = 18 THEN
        RAISE NOTICE '🎉 SYNCHRONISATION RÉUSSIE !';
        RAISE NOTICE '✅ PROD est maintenant identique à DEV';
        RAISE NOTICE '';
        RAISE NOTICE '👉 Exécutez : COMMIT;';
    ELSE
        RAISE WARNING '⚠️ ATTENTION - Vérifiez les valeurs ci-dessus';
        RAISE WARNING '👉 Si problème, exécutez : ROLLBACK;';
    END IF;

    RAISE NOTICE '========================================';
END $$;

-- =========================================================================
-- PARTIE 5 : VALIDATION MANUELLE
-- =========================================================================
-- ⚠️ Lisez les vérifications ci-dessus, puis décommentez UNE des lignes :

-- Si tout est OK :
-- COMMIT;

-- Si problème :
-- ROLLBACK;
