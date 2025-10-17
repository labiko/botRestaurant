-- ========================================
-- VÉRIFICATION ASSOCIATION TOKEN → COMMANDE
-- Token: COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw
-- ========================================

-- 1. ASSOCIATION DIRECTE TOKEN → COMMANDE
SELECT 
    '=== ASSOCIATION TOKEN → COMMANDE ===' as section,
    dt.id as token_id,
    dt.token,
    dt.order_id as token_order_id,
    dt.driver_id as token_driver_id,
    dt.used,
    dt.expires_at,
    fo.id as actual_order_id,
    fo.order_number as actual_order_number,
    fo.status as actual_order_status,
    fo.driver_id as actual_order_driver_id,
    CASE 
        WHEN dt.order_id = fo.id THEN '✅ ASSOCIATION CORRECTE'
        ELSE '❌ ASSOCIATION INCORRECTE'
    END as association_check,
    CASE 
        WHEN fo.order_number = '1309-0007' THEN '✅ TOKEN POINTE VERS 1309-0007'
        ELSE '❌ TOKEN NE POINTE PAS VERS 1309-0007 - Pointe vers: ' || fo.order_number
    END as order_number_verification
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE dt.token = 'COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw';

-- 2. RECHERCHE COMMANDE 1309-0007 ET SES TOKENS
SELECT 
    '=== COMMANDE 1309-0007 ET SES TOKENS ===' as section,
    fo.id as order_id,
    fo.order_number,
    fo.status,
    fo.driver_id,
    fo.created_at,
    COUNT(dt.id) as tokens_count,
    STRING_AGG(
        dt.token || ' (used: ' || dt.used || ')', 
        ', '
    ) as all_tokens,
    STRING_AGG(
        CASE WHEN dt.token = 'COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw' 
        THEN '🎯 TOKEN RECHERCHÉ' 
        ELSE '📝 AUTRE TOKEN' END,
        ', '
    ) as token_types
FROM france_orders fo
LEFT JOIN delivery_tokens dt ON fo.id = dt.order_id
WHERE fo.order_number = '1309-0007'
GROUP BY fo.id, fo.order_number, fo.status, fo.driver_id, fo.created_at;

-- 3. VALIDATION - CE QUE VALIDATETOKEN() RETOURNE
SELECT 
    '=== SIMULATION VALIDATETOKEN ===' as section,
    dt.token,
    dt.order_id as token_points_to_order_id,
    fo.order_number as token_points_to_order_number,
    fo.status as order_status,
    fo.driver_id as order_driver_id,
    dt.driver_id as token_driver_id,
    dt.used,
    dt.expires_at > NOW() as is_valid_time,
    -- Simulation de la validation
    CASE 
        WHEN dt.used = true AND fo.driver_id = dt.driver_id AND dt.expires_at > NOW() THEN 
            '✅ ACCÈS POST-ACCEPTATION - Commande: ' || fo.order_number
        WHEN dt.used = false AND fo.status = 'assignee' THEN 
            '✅ ACCÈS NOUVELLE LOGIQUE - Commande: ' || fo.order_number
        ELSE '✅ ACCÈS NORMAL - Commande: ' || fo.order_number
    END as validation_result,
    
    -- Vérification finale
    CASE 
        WHEN fo.order_number = '1309-0007' THEN '✅ TOKEN POINTE BIEN VERS 1309-0007'
        ELSE '❌ TOKEN POINTE VERS: ' || fo.order_number || ' (ATTENDU: 1309-0007)'
    END as final_verification
    
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE dt.token = 'COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw';