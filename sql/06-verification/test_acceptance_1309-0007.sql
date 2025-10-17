-- ========================================
-- TEST ACCEPTATION COMMANDE 1309-0007
-- Commande ID: 81 - Status: prete - Livreur: null
-- ========================================

-- 1. ÉTAT INITIAL DE LA COMMANDE
SELECT 
    '=== ÉTAT INITIAL COMMANDE ===' as section,
    fo.id,
    fo.order_number,
    fo.status,
    fo.driver_id,
    fo.driver_assignment_status,
    fo.delivery_started_at,
    fo.assignment_timeout_at,
    fo.assignment_started_at,
    fo.created_at,
    fo.updated_at,
    fdd.first_name || ' ' || fdd.last_name as assigned_driver_name
FROM france_orders fo
LEFT JOIN france_delivery_drivers fdd ON fo.driver_id = fdd.id
WHERE fo.order_number = '1309-0007';

-- 2. TOKENS DISPONIBLES POUR CETTE COMMANDE
SELECT 
    '=== TOKENS DISPONIBLES ===' as section,
    dt.id as token_id,
    dt.token,
    dt.order_id,
    dt.driver_id,
    dt.used,
    dt.suspended,
    dt.reactivated,
    dt.expires_at,
    dt.absolute_expires_at,
    dt.created_at as token_created,
    dt.updated_at as token_updated,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    -- Vérifications temporelles
    CASE 
        WHEN dt.expires_at > NOW() THEN '✅ NON EXPIRÉ'
        ELSE '❌ EXPIRÉ'
    END as expires_status,
    ROUND(EXTRACT(EPOCH FROM (dt.expires_at - NOW()))/60) as minutes_remaining
FROM delivery_tokens dt
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number = '1309-0007'
ORDER BY dt.created_at DESC;

-- 3. SIMULATION D'ACCEPTATION - CE QUI VA SE PASSER
SELECT 
    '=== SIMULATION ACCEPTATION ===' as section,
    dt.token,
    -- Test de la nouvelle logique sans contrôle livreur
    CASE 
        WHEN dt.used = true THEN '❌ TOKEN DÉJÀ UTILISÉ'
        WHEN dt.suspended = true THEN '❌ TOKEN SUSPENDU'
        WHEN dt.expires_at < NOW() THEN '❌ TOKEN EXPIRÉ'
        WHEN dt.absolute_expires_at < NOW() THEN '❌ TOKEN ABSOLUMENT EXPIRÉ'
        WHEN fo.status != 'prete' THEN '❌ COMMANDE NON PRETE, STATUS: ' || fo.status
        WHEN fo.driver_id IS NOT NULL THEN '❌ COMMANDE DÉJÀ ASSIGNÉE'
        ELSE '✅ TOKEN PRÊT POUR ACCEPTATION'
    END as acceptation_readiness,
    
    -- Détails
    dt.used as token_used,
    dt.suspended as token_suspended,
    dt.expires_at < NOW() as is_expired,
    fo.status as order_status,
    fo.driver_id as current_driver_assigned,
    dt.driver_id as token_driver_id

FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number = '1309-0007';

-- 4. ASSIGNATIONS EXISTANTES
SELECT 
    '=== ASSIGNATIONS EXISTANTES ===' as section,
    fda.id as assignment_id,
    fda.order_id,
    fda.driver_id,
    fda.assignment_status,
    fda.created_at as assignment_created,
    fda.expires_at as assignment_expires,
    fda.accepted_at,
    fda.rejected_at,
    fdd.first_name || ' ' || fdd.last_name as driver_name
FROM france_delivery_assignments fda
LEFT JOIN france_delivery_drivers fdd ON fda.driver_id = fdd.id
LEFT JOIN france_orders fo ON fda.order_id = fo.id
WHERE fo.order_number = '1309-0007'
ORDER BY fda.created_at DESC;

-- 5. ACTIONS LIVREUR HISTORIQUE
SELECT 
    '=== ACTIONS LIVREUR ===' as section,
    dda.id as action_id,
    dda.order_id,
    dda.driver_id,
    dda.action_type,
    dda.details,
    dda.created_at as action_created,
    fdd.first_name || ' ' || fdd.last_name as driver_name
FROM delivery_driver_actions dda
LEFT JOIN france_delivery_drivers fdd ON dda.driver_id = fdd.id
LEFT JOIN france_orders fo ON dda.order_id = fo.id
WHERE fo.order_number = '1309-0007'
ORDER BY dda.created_at DESC;

-- 6. URL DE TEST POUR ACCEPTATION
SELECT 
    '=== URLS TEST ===' as section,
    dt.token,
    'https://botresto.vercel.app/restaurant-france/delivery-france/accept?token=' || dt.token as test_url,
    'Commande: ' || fo.order_number as order_info,
    'Livreur du token: ' || fdd.first_name || ' ' || fdd.last_name as token_driver_info,
    CASE 
        WHEN dt.expires_at > NOW() AND dt.used = false AND dt.suspended = false 
        THEN '✅ URL ACCESSIBLE'
        ELSE '❌ URL NON ACCESSIBLE'
    END as url_status
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id  
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
WHERE fo.order_number = '1309-0007'
ORDER BY dt.created_at DESC;

-- 7. PRÉDICTION POST-ACCEPTATION
SELECT 
    '=== PRÉDICTION POST-ACCEPTATION ===' as section,
    'AVANT ACCEPTATION:' as phase,
    fo.status as current_status,
    fo.driver_id as current_driver_id,
    fo.driver_assignment_status as current_assignment_status,
    COUNT(dt.id) as total_tokens,
    'APRÈS ACCEPTATION ATTENDU:' as expected_phase,
    '''assignee''' as expected_status,
    'ID du livreur qui accepte' as expected_driver_id,
    '''assigned''' as expected_assignment_status,
    'Tokens marqués used=true' as expected_tokens_status
FROM france_orders fo
LEFT JOIN delivery_tokens dt ON fo.id = dt.order_id
WHERE fo.order_number = '1309-0007'
GROUP BY fo.id, fo.status, fo.driver_id, fo.driver_assignment_status;