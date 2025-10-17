-- =========================================================================
-- MISE À JOUR PROD = DEV (ULTRA SIMPLE)
-- Basé sur l'analyse du log.txt
-- =========================================================================

-- ID 1 : Corriger téléphone + audio
UPDATE france_restaurants SET
    phone = '33601234567',
    whatsapp_number = '33601234567',
    audio_notifications_enabled = true,
    audio_enabled_since = '2025-10-02 18:36:40'::timestamp,
    business_hours = '{"jeudi":{"isOpen":true,"closing":"23:00","opening":"08:00"},"lundi":{"isOpen":true,"closing":"23:00","opening":"09:00"},"mardi":{"isOpen":true,"closing":"04:00","opening":"08:00"},"samedi":{"isOpen":true,"closing":"23:00","opening":"10:00"},"dimanche":{"isOpen":true,"closing":"22:00","opening":"08:00"},"mercredi":{"isOpen":true,"closing":"04:00","opening":"08:00"},"vendredi":{"isOpen":true,"closing":"23:00","opening":"07:00"}}'::jsonb
WHERE id = 1;

-- ID 16 : RIEN À FAIRE (déjà identique)

-- ID 17 : Corriger city + téléphone + pays + devise
UPDATE france_restaurants SET
    city = 'NONGO TADY',
    phone = '224601234567',
    whatsapp_number = '224601234567',
    password_hash = '810790',
    timezone = 'Africa/Conakry',
    country_code = 'GN',
    currency = 'GNF',
    updated_at = '2025-10-06 11:13:10.466'::timestamp
WHERE id = 17;

-- ID 18 : Nouveau restaurant (n'existe pas en PROD)
INSERT INTO france_restaurants (id, name, slug, address, city, postal_code, phone, whatsapp_number, delivery_zone_km, min_order_amount, delivery_fee, is_active, business_hours, created_at, updated_at, password_hash, timezone, country_code, hide_delivery_info, is_exceptionally_closed, latitude, longitude, audio_notifications_enabled, audio_volume, audio_enabled_since, deployment_status, delivery_address_mode, currency)
SELECT 18, 'Bh Tacos one', 'bh-tacos-one', '21 Pl. des Fontaines', '77176 Savigny-le-Temple', NULL, '33675123456', '33675123456', 5, 0.00, 2.50, true, '{"jeudi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"lundi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"mardi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"samedi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"dimanche":{"isOpen":true,"closing":"23:50","opening":"07:00"},"mercredi":{"isOpen":true,"closing":"23:50","opening":"07:00"},"vendredi":{"isOpen":true,"closing":"23:50","opening":"07:00"}}'::jsonb, '2025-09-28 15:41:30.110135'::timestamp, '2025-09-28 15:41:30.110135'::timestamp, '810790', 'Europe/Paris', 'FR', false, false, NULL, NULL, true, 50, NULL, 'production', 'address', 'EUR'
WHERE NOT EXISTS (SELECT 1 FROM france_restaurants WHERE id = 18);

-- Réinitialiser séquence
SELECT setval('france_restaurants_id_seq', 18);

-- Vérification
SELECT id, phone, whatsapp_number, city, country_code, currency FROM france_restaurants ORDER BY id;
