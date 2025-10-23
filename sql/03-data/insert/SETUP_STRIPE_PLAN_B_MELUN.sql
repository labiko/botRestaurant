-- ========================================================================
-- CONFIGURATION STRIPE - Plan B Melun
-- DATE: 2025-01-23
-- RESTAURANT: Plan B Melun (restaurant_id=22)
-- OBJECTIF: Copier la configuration Stripe depuis restaurant_id=1
-- SOURCE: Configuration Stripe test de restaurant_id=1
-- ========================================================================

BEGIN;

-- 🔍 VÉRIFICATION AVANT - Configuration actuelle Plan B
SELECT
  id,
  restaurant_id,
  provider,
  is_active,
  auto_send_on_order,
  send_on_delivery
FROM restaurant_payment_configs
WHERE restaurant_id = 22;

-- 🔧 COPIE DE LA CONFIGURATION STRIPE
INSERT INTO restaurant_payment_configs (
  restaurant_id,
  provider,
  api_key_public,
  api_key_secret,
  merchant_id,
  config,
  success_url,
  cancel_url,
  webhook_url,
  is_active,
  auto_send_on_order,
  send_on_delivery
)
SELECT
  22 as restaurant_id,                    -- Plan B Melun
  provider,
  api_key_public,
  api_key_secret,
  merchant_id,
  config,
  success_url,
  cancel_url,
  webhook_url,
  false as is_active,                     -- Désactivé par défaut pour test
  false as auto_send_on_order,            -- Pas d'envoi auto pour le moment
  false as send_on_delivery               -- Pas d'envoi à la livraison
FROM restaurant_payment_configs
WHERE restaurant_id = 1 AND provider = 'stripe'
ON CONFLICT (restaurant_id, provider)
DO UPDATE SET
  api_key_public = EXCLUDED.api_key_public,
  api_key_secret = EXCLUDED.api_key_secret,
  merchant_id = EXCLUDED.merchant_id,
  config = EXCLUDED.config,
  success_url = EXCLUDED.success_url,
  cancel_url = EXCLUDED.cancel_url,
  webhook_url = EXCLUDED.webhook_url,
  updated_at = now();

-- ✅ VÉRIFICATION APRÈS - Configuration créée
SELECT
  id,
  restaurant_id,
  provider,
  api_key_public,
  merchant_id,
  config,
  success_url,
  cancel_url,
  webhook_url,
  is_active,
  auto_send_on_order,
  send_on_delivery,
  created_at
FROM restaurant_payment_configs
WHERE restaurant_id = 22;

COMMIT;

-- ========================================================================
-- RÉSUMÉ DE LA CONFIGURATION :
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Provider: Stripe
--
-- Configuration copiée :
-- - api_key_public: pk_test_51SD3HgRzslgA0Dk6loHK69YnBUhHJ6mPWgHxxC2COcwIVymLZx9rGbiuWFAEGGrlSH9VJapmIpBoo1p9JA609ZTs00oSmVOVl3
-- - api_key_secret: (copié depuis restaurant_id=1)
-- - config: {"currency": "EUR", "payment_methods": ["card"]}
-- - success_url: https://menu-ai-admin.vercel.app/payment-success.html?session_id={CHECKOUT_SESSION_ID}
-- - cancel_url: https://menu-ai-admin.vercel.app/payment-cancel.html?session_id={CHECKOUT_SESSION_ID}
-- - webhook_url: https://vywbhlnzvfqtiurwmrac.supabase.co/functions/v1/payment-webhook-handler
--
-- ⚠️ ÉTAT INITIAL :
-- - is_active: false (désactivé pour test)
-- - auto_send_on_order: false (pas d'envoi auto)
-- - send_on_delivery: false (pas d'envoi à la livraison)
--
-- 🔄 POUR ACTIVER LA CONFIG :
-- UPDATE restaurant_payment_configs
-- SET is_active = true, auto_send_on_order = true
-- WHERE restaurant_id = 22 AND provider = 'stripe';
--
-- ⚠️ NOTES :
-- - Configuration Stripe TEST (pk_test_...)
-- - Nécessite clés de production pour environnement réel
-- - Vérifier que le webhook handler fonctionne correctement
-- ========================================================================
