-- ========================================================================
-- SETUP COMPLET - Plan B Melun
-- DATE: 2025-01-23
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- OBJECTIF: Créer toutes les configurations manquantes pour le back office
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. RESTAURANT_BOT_CONFIGS
-- ========================================================================

INSERT INTO restaurant_bot_configs (
  restaurant_id,
  config_name,
  brand_name,
  welcome_message,
  available_workflows,
  features,
  is_active
) VALUES (
  22,
  'main',
  'Plan B Melun',
  'Bienvenue chez Plan B Melun ! 🍔🍕\n\nCommandez rapidement sur WhatsApp.\nTapez "menu" pour voir notre carte.',
  '["RESTAURANT_SELECTION", "MENU_DISPLAY", "CART_MANAGEMENT", "PRODUCT_CONFIGURATION", "DELIVERY_MODE", "ADDRESS_MANAGEMENT", "ORDER_FINALIZATION"]'::jsonb,
  '{
    "cart_enabled": true,
    "address_history": true,
    "delivery_enabled": true,
    "modular_products": true,
    "payment_deferred": true,
    "validation_codes": true,
    "composite_products": true,
    "location_detection": true,
    "daily_order_numbering": true,
    "google_places_enabled": true
  }'::jsonb,
  true
)
ON CONFLICT (restaurant_id, config_name)
DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  available_workflows = EXCLUDED.available_workflows,
  features = EXCLUDED.features,
  updated_at = now();

-- ========================================================================
-- 2. RESTAURANT_VITRINE_SETTINGS
-- ========================================================================

INSERT INTO restaurant_vitrine_settings (
  restaurant_id,
  slug,
  primary_color,
  secondary_color,
  accent_color,
  logo_emoji,
  subtitle,
  promo_text,
  feature_1,
  feature_2,
  feature_3,
  show_live_stats,
  average_rating,
  delivery_time_min,
  is_active
) VALUES (
  22,
  'plan-b-melun-vitrine',
  '#e74c3c',
  '#c0392b',
  '#f39c12',
  '🍔',
  'Commandez en 30 secondes sur WhatsApp!',
  '📱 100% DIGITAL SUR WHATSAPP',
  '{"emoji": "🚀", "text": "Livraison rapide"}',
  '{"emoji": "💯", "text": "Produits frais"}',
  '{"emoji": "⭐", "text": "4.8 étoiles"}',
  true,
  4.8,
  30,
  true
)
ON CONFLICT (restaurant_id)
DO UPDATE SET
  slug = EXCLUDED.slug,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  accent_color = EXCLUDED.accent_color,
  logo_emoji = EXCLUDED.logo_emoji,
  subtitle = EXCLUDED.subtitle,
  promo_text = EXCLUDED.promo_text,
  feature_1 = EXCLUDED.feature_1,
  feature_2 = EXCLUDED.feature_2,
  feature_3 = EXCLUDED.feature_3,
  show_live_stats = EXCLUDED.show_live_stats,
  average_rating = EXCLUDED.average_rating,
  delivery_time_min = EXCLUDED.delivery_time_min,
  updated_at = now();

-- ========================================================================
-- 3. MISE À JOUR FRANCE_RESTAURANTS
-- ========================================================================

-- Définir subscription_end_date à aujourd'hui + 1 mois
UPDATE france_restaurants
SET
  subscription_end_date = CURRENT_DATE + INTERVAL '1 month',
  updated_at = now()
WHERE id = 22;

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier restaurant_bot_configs
SELECT
  id,
  restaurant_id,
  config_name,
  brand_name,
  is_active,
  created_at
FROM restaurant_bot_configs
WHERE restaurant_id = 22;

-- Vérifier restaurant_vitrine_settings
SELECT
  id,
  restaurant_id,
  slug,
  primary_color,
  logo_emoji,
  subtitle,
  is_active,
  created_at
FROM restaurant_vitrine_settings
WHERE restaurant_id = 22;

-- Vérifier subscription_end_date
SELECT
  id,
  name,
  deployment_status,
  subscription_status,
  subscription_end_date,
  phone,
  whatsapp_number
FROM france_restaurants
WHERE id = 22;

COMMIT;

-- ========================================================================
-- RÉSUMÉ DES CHANGEMENTS :
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
--
-- 1. ✅ restaurant_bot_configs créé :
--    - Brand: "Plan B Melun"
--    - Workflows: RESTAURANT_SELECTION, MENU_DISPLAY, CART_MANAGEMENT, etc.
--    - Features: cart, delivery, composite_products, location_detection, etc.
--
-- 2. ✅ restaurant_vitrine_settings créé :
--    - Slug: "plan-b-melun-vitrine"
--    - Colors: Rouge (#e74c3c) / Accent orange (#f39c12)
--    - Logo: 🍔
--    - Subtitle: "Commandez en 30 secondes sur WhatsApp!"
--    - Rating: 4.8 ⭐
--    - Delivery time: 30 min
--
-- 3. ✅ subscription_end_date mis à jour :
--    - Date: AUJOURD'HUI + 1 mois
--
-- 4. ⚠️ NON MODIFIÉ (comme demandé) :
--    - deployment_status: reste "development"
--    - phone: 33101010102 (à remplacer manuellement si besoin)
--    - whatsapp_number: 33101010102 (à remplacer manuellement si besoin)
--
-- ⚠️ IMPORTANT :
-- Si tu veux changer le téléphone, exécute après :
-- UPDATE france_restaurants
-- SET phone = 'NOUVEAU_NUMERO', whatsapp_number = 'NOUVEAU_NUMERO'
-- WHERE id = 22;
-- ========================================================================
