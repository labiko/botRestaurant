-- ========================================================================
-- CONFIGURATION LENGOPAY POUR RESTAURANT ID 18
-- DATE: 2025-01-14
-- OBJECTIF: Configurer LengoPay comme provider de paiement pour le restaurant ID 18
-- ========================================================================

BEGIN;

-- Vérifier si le restaurant ID 18 existe
SELECT id, name FROM france_restaurants WHERE id = 18;

-- Insérer ou mettre à jour la configuration LengoPay pour le restaurant ID 18
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
    send_on_delivery,
    created_at,
    updated_at
) VALUES (
    18,
    'lengopay',
    '',  -- api_key_public non utilisé pour LengoPay
    'VmVHNGZud2h1YVdUUnBSYnZ1R3BlNmtMTFhHN1NDNGpaU3plMENtQ1drZ084Y280S2J5ODZPWXJQVWZg==',  -- license_key
    'wyp6J7uN3pVG2Pjn',  -- website_id
    jsonb_build_object(
        'api_url', 'https://sandbox.lengopay.com/api/v1/payments',
        'website_id', 'wyp6J7uN3pVG2Pjn',
        'license_key', 'VmVHNGZud2h1YVdUUnBSYnZ1R3BlNmtMTFhHN1NDNGpaU3plMENtQ1drZ084Y280S2J5ODZPWXJQVWZg==',
        'currency', 'GNF',
        'environment', 'sandbox'
    ),
    'https://menu-ai-admin.vercel.app/payment-success',
    'https://menu-ai-admin.vercel.app/payment-cancel',
    'https://menu-ai-admin.vercel.app/api/lengopay-callback',
    true,   -- is_active
    false,  -- auto_send_on_order (pour test)
    false,  -- send_on_delivery (pour test)
    NOW(),
    NOW()
) ON CONFLICT (restaurant_id, provider)
DO UPDATE SET
    api_key_secret = EXCLUDED.api_key_secret,
    merchant_id = EXCLUDED.merchant_id,
    config = EXCLUDED.config,
    success_url = EXCLUDED.success_url,
    cancel_url = EXCLUDED.cancel_url,
    webhook_url = EXCLUDED.webhook_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Vérifier la configuration créée
SELECT
    id,
    restaurant_id,
    provider,
    merchant_id as website_id,
    config->>'api_url' as api_url,
    config->>'environment' as environment,
    success_url,
    cancel_url,
    webhook_url,
    is_active,
    created_at
FROM restaurant_payment_configs
WHERE restaurant_id = 18 AND provider = 'lengopay';

-- Vérifier que le restaurant a une configuration de paiement
SELECT
    r.id,
    r.name,
    rpc.provider,
    rpc.is_active
FROM france_restaurants r
LEFT JOIN restaurant_payment_configs rpc ON r.id = rpc.restaurant_id
WHERE r.id = 18;

COMMIT;

-- Note: Après ce script, il faudra :
-- 1. Créer le provider LengoPay dans le code Supabase
-- 2. Implémenter la gestion des callbacks LengoPay
-- 3. Tester l'intégration complète