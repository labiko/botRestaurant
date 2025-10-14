-- ========================================================================
-- CRÉATION DES VITRINES POUR TOUS LES RESTAURANTS - PROD
-- Date: 2025-10-14
-- Description: Crée une page vitrine pour chaque restaurant
-- ========================================================================

BEGIN;

-- Vérifier les restaurants existants
SELECT
  id,
  name,
  slug,
  CASE
    WHEN EXISTS (SELECT 1 FROM restaurant_vitrine_settings WHERE restaurant_id = france_restaurants.id)
    THEN '✅ Vitrine existe déjà'
    ELSE '❌ Pas de vitrine'
  END as statut_vitrine
FROM france_restaurants
ORDER BY id;

-- 1. Pizza Yolo 77 (ID: 1)
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
  1,
  'pizza-yolo-77-vitrine',
  '#ff0000',
  '#cc0000',
  '#ffc107',
  '🍕',
  'Commandez en 30 secondes sur WhatsApp!',
  '📱 100% DIGITAL SUR WHATSAPP',
  '{"emoji": "🚀", "text": "Livraison rapide"}',
  '{"emoji": "💯", "text": "Produits frais"}',
  '{"emoji": "⭐", "text": "4.8 étoiles"}',
  true,
  4.8,
  25,
  true
)
ON CONFLICT (restaurant_id) DO NOTHING;

-- 2. Le Nouveau O'CV Moissy (ID: 16)
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
  16,
  'le-nouveau-ocv-moissy-vitrine',
  '#ff6600',
  '#cc5200',
  '#ffc107',
  '🍔',
  'Commandez en 30 secondes sur WhatsApp!',
  '📱 100% DIGITAL SUR WHATSAPP',
  '{"emoji": "🚀", "text": "Livraison rapide"}',
  '{"emoji": "💯", "text": "Produits frais"}',
  '{"emoji": "⭐", "text": "4.7 étoiles"}',
  true,
  4.7,
  30,
  true
)
ON CONFLICT (restaurant_id) DO NOTHING;

-- 3. Le Carreman (ID: 17)
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
  17,
  'le-carreman-vitrine',
  '#2ecc71',
  '#27ae60',
  '#f39c12',
  '🥙',
  'Commandez en 30 secondes sur WhatsApp!',
  '📱 100% DIGITAL SUR WHATSAPP',
  '{"emoji": "🚀", "text": "Livraison rapide"}',
  '{"emoji": "💯", "text": "Produits frais"}',
  '{"emoji": "⭐", "text": "4.6 étoiles"}',
  true,
  4.6,
  25,
  true
)
ON CONFLICT (restaurant_id) DO NOTHING;

-- 4. Bh Tacos one (ID: 18)
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
  18,
  'bh-tacos-one-vitrine',
  '#e74c3c',
  '#c0392b',
  '#f39c12',
  '🌮',
  'Commandez en 30 secondes sur WhatsApp!',
  '📱 100% DIGITAL SUR WHATSAPP',
  '{"emoji": "🚀", "text": "Livraison rapide"}',
  '{"emoji": "💯", "text": "Produits frais"}',
  '{"emoji": "⭐", "text": "4.5 étoiles"}',
  true,
  4.5,
  20,
  true
)
ON CONFLICT (restaurant_id) DO NOTHING;

-- Vérification finale
SELECT
  v.id,
  r.name as restaurant,
  v.slug,
  v.logo_emoji,
  v.is_active,
  v.created_at
FROM restaurant_vitrine_settings v
JOIN france_restaurants r ON r.id = v.restaurant_id
ORDER BY v.id;

-- Si tout est OK, valider
COMMIT;

-- En cas de problème : ROLLBACK;
