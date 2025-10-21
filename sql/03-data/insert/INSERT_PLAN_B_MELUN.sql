-- ========================================================================
-- CRÉATION RESTAURANT PLAN B MELUN (Duplication OCV)
-- DATE: 2025-10-20
-- ========================================================================
-- Restaurant: Plan B Melun
-- Téléphone: 33101010102 (01.64.38.77.77 en format international)
-- Adresse: 11 Rue l'Eperon, 77000 Melun
-- Site: https://www.planb-melun.fr/
-- ========================================================================

BEGIN;

-- Insertion du nouveau restaurant (copie des paramètres d'OCV Moissy)
INSERT INTO france_restaurants (
  name,
  slug,
  address,
  city,
  postal_code,
  phone,
  whatsapp_number,
  delivery_zone_km,
  min_order_amount,
  delivery_fee,
  is_active,
  business_hours,
  password_hash,
  timezone,
  country_code,
  hide_delivery_info,
  is_exceptionally_closed,
  latitude,
  longitude,
  audio_notifications_enabled,
  audio_volume,
  deployment_status,
  delivery_address_mode,
  currency,
  subscription_status,
  subscription_plan,
  auto_print_enabled
) VALUES (
  'Plan B Melun',                                           -- name
  'plan-b-melun',                                           -- slug
  '11 Rue l''Eperon, 77000 Melun',                         -- address
  'Melun',                                                  -- city
  '77000',                                                  -- postal_code
  '33101010102',                                            -- phone (numéro de test)
  '33101010102',                                            -- whatsapp_number
  8,                                                        -- delivery_zone_km (même que OCV)
  0.00,                                                     -- min_order_amount
  2.50,                                                     -- delivery_fee (même que OCV)
  true,                                                     -- is_active
  '{
    "lundi": {"isOpen": true, "opening": "11:00", "closing": "23:59"},
    "mardi": {"isOpen": true, "opening": "11:00", "closing": "23:59"},
    "mercredi": {"isOpen": true, "opening": "11:00", "closing": "23:59"},
    "jeudi": {"isOpen": true, "opening": "11:00", "closing": "23:59"},
    "vendredi": {"isOpen": true, "opening": "11:00", "closing": "23:59"},
    "samedi": {"isOpen": true, "opening": "11:00", "closing": "23:59"},
    "dimanche": {"isOpen": true, "opening": "11:00", "closing": "23:59"}
  }'::jsonb,                                                -- business_hours (même que OCV)
  '$2b$10$SyPhv9L6slDamX2/XvFKHuvjR0k23COXb4C362M5AMiwFVwISlqfO', -- password_hash (hash pour "password123" - À CHANGER !)
  'Europe/Paris',                                           -- timezone
  'FR',                                                     -- country_code
  false,                                                    -- hide_delivery_info
  false,                                                    -- is_exceptionally_closed
  48.5395,                                                  -- latitude (Centre Melun approximatif)
  2.6606,                                                   -- longitude (Centre Melun approximatif)
  true,                                                     -- audio_notifications_enabled
  50,                                                       -- audio_volume
  'development',                                            -- deployment_status (DEV par défaut)
  'address',                                                -- delivery_address_mode
  'EUR',                                                    -- currency
  'active',                                                 -- subscription_status (actif comme OCV)
  'monthly',                                                -- subscription_plan
  true                                                      -- auto_print_enabled
);

-- Vérification du restaurant créé
SELECT
  id,
  name,
  slug,
  phone,
  whatsapp_number,
  city,
  postal_code,
  is_active,
  deployment_status,
  subscription_status
FROM france_restaurants
WHERE slug = 'plan-b-melun';

-- ⚠️ IMPORTANT : Si le résultat est correct, décommenter la ligne suivante:
COMMIT;

-- Si erreur, faire: ROLLBACK;

-- ========================================================================
-- NOTES IMPORTANTES:
-- ========================================================================
-- 1. Téléphone utilisé: 33101010102 (numéro de test/démo)
-- 2. VRAI numéro du site web: 01.64.38.77.77 (33164387777)
--    Tu pourras le changer plus tard si besoin
-- 3. Mot de passe temporaire: "password123" - À CHANGER après création !
-- 4. Coordonnées GPS approximatives - À affiner si besoin
-- 5. Restaurant créé en mode 'development' - À passer en 'production' plus tard
-- 6. Subscription en 'trial' - À configurer selon l'accord commercial
-- ========================================================================
