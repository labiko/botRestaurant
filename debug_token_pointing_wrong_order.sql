-- ========================================
-- DEBUG: TOKEN POINTE VERS MAUVAISE COMMANDE
-- Token: COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw
-- ========================================

-- 1. VÉRIFICATION ASSOCIATION TOKEN → COMMANDE
SELECT 
    '=== ASSOCIATION TOKEN → COMMANDE ===' as section,
    dt.id as token_id,
    dt.token,
    dt.order_id as token_order_id,
    dt.driver_id as token_driver_id,
    dt.used,
    fo.id as actual_order_id,
    fo.order_number as actual_order_number,
    fo.status as actual_order_status,
    fo.driver_id as actual_order_driver_id,
    CASE 
        WHEN dt.order_id = fo.id THEN '✅ ASSOCIATION CORRECTE'
        ELSE '❌ ASSOCIATION INCORRECTE'
    END as association_check
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE dt.token = 'COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw';

-- 2. TOUTES LES COMMANDES DU MÊME LIVREUR
SELECT 
    '=== COMMANDES DU MÊME LIVREUR ===' as section,
    fo.id as order_id,
    fo.order_number,
    fo.status,
    fo.driver_id,
    fo.created_at,
    fo.updated_at,
    CASE 
        WHEN fo.id = 81 THEN '🎯 COMMANDE ATTENDUE (1309-0007)'
        ELSE '📝 AUTRE COMMANDE'
    END as order_type
FROM france_orders fo
WHERE fo.driver_id = 3
ORDER BY fo.created_at DESC;

-- 3. TOUS LES TOKENS DU LIVREUR 3
SELECT 
    '=== TOUS TOKENS LIVREUR 3 ===' as section,
    dt.id as token_id,
    dt.token,
    dt.order_id,
    dt.used,
    dt.created_at,
    fo.order_number,
    fo.status,
    CASE 
        WHEN dt.token = 'COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw' THEN '🎯 TOKEN PROBLÉMATIQUE'
        ELSE '📝 AUTRE TOKEN'
    END as token_type
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE dt.driver_id = 3
ORDER BY dt.created_at DESC;

-- 4. VALIDATION TOKEN - CE QUE VALIDATETOKEN() RETOURNE
SELECT 
    '=== SIMULATION VALIDATETOKEN ===' as section,
    dt.token,
    dt.order_id as token_points_to_order_id,
    fo.order_number as token_points_to_order_number,
    fo.status as token_points_to_status,
    fo.driver_id as token_points_to_driver_id,
    -- Ce que validateToken devrait retourner
    CASE 
        WHEN dt.used = true AND fo.driver_id = dt.driver_id AND dt.expires_at > NOW() THEN 
            'ACCÈS POST-ACCEPTATION - Commande: ' || fo.order_number
        WHEN dt.used = false AND fo.status = 'assignee' THEN 
            'ACCÈS NOUVELLE LOGIQUE - Commande: ' || fo.order_number
        ELSE 'ACCÈS NORMAL - Commande: ' || fo.order_number
    END as validation_result,
    
    -- Vérification si c'est la bonne commande
    CASE 
        WHEN fo.order_number = '1309-0007' THEN '✅ BONNE COMMANDE'
        ELSE '❌ MAUVAISE COMMANDE: ' || fo.order_number || ' (attendu: 1309-0007)'
    END as order_correctness_check
    
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE dt.token = 'COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw';

-- 5. RECHERCHE COMMANDE 1309-0007
SELECT 
    '=== RECHERCHE COMMANDE 1309-0007 ===' as section,
    fo.id,
    fo.order_number,
    fo.status,
    fo.driver_id,
    fo.created_at,
    fo.updated_at,
    COUNT(dt.id) as tokens_count,
    STRING_AGG(dt.token, ', ') as all_tokens
FROM france_orders fo
LEFT JOIN delivery_tokens dt ON fo.id = dt.order_id
WHERE fo.order_number = '1309-0007'
GROUP BY fo.id, fo.order_number, fo.status, fo.driver_id, fo.created_at, fo.updated_at;

-- 6. VÉRIFICATION SI TOKEN EXISTE POUR 1309-0007
SELECT 
    '=== TOKENS POUR 1309-0007 ===' as section,
    dt.id as token_id,
    dt.token,
    dt.order_id,
    dt.driver_id,
    dt.used,
    dt.created_at,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    CASE 
        WHEN dt.token = 'COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw' THEN '🎯 TOKEN PROBLÉMATIQUE'
        ELSE '📝 TOKEN NORMAL'
    END as token_analysis
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
WHERE fo.order_number = '1309-0007'
ORDER BY dt.created_at DESC;