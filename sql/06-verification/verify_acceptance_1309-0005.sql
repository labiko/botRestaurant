-- ========================================
-- VÉRIFICATION ACCEPTATION COMMANDE 1309-0005
-- ========================================

-- 1. ÉTAT DE LA COMMANDE
SELECT 
    '=== ÉTAT COMMANDE ===' as section,
    id,
    order_number,
    status,
    driver_id,
    driver_assignment_status,
    delivery_started_at,
    assignment_timeout_at,
    assignment_started_at,
    created_at,
    updated_at
FROM france_orders 
WHERE order_number = '1309-0005';

-- 2. TOKENS ASSOCIÉS À LA COMMANDE
SELECT 
    '=== TOKENS COMMANDE ===' as section,
    dt.id as token_id,
    dt.token,
    dt.order_id,
    dt.driver_id,
    dt.used,
    dt.suspended,
    dt.reactivated,
    dt.created_at as token_created,
    dt.expires_at,
    dt.absolute_expires_at,
    dt.updated_at as token_updated,
    fdd.first_name || ' ' || fdd.last_name as driver_name
FROM delivery_tokens dt
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number = '1309-0005'
ORDER BY dt.created_at DESC;

-- 3. ASSIGNATIONS DE LIVRAISON
SELECT 
    '=== ASSIGNATIONS LIVRAISON ===' as section,
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
WHERE fo.order_number = '1309-0005'
ORDER BY fda.created_at DESC;

-- 4. ACTIONS LIVREUR
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
WHERE fo.order_number = '1309-0005'
ORDER BY dda.created_at DESC;

-- 5. RÉSUMÉ ACCEPTATION
SELECT 
    '=== RÉSUMÉ ACCEPTATION ===' as section,
    fo.order_number,
    fo.status as order_status,
    fo.driver_id,
    fdd.first_name || ' ' || fdd.last_name as assigned_driver,
    fo.driver_assignment_status,
    COUNT(dt.id) as total_tokens,
    COUNT(CASE WHEN dt.used = true THEN 1 END) as used_tokens,
    COUNT(fda.id) as total_assignments,
    COUNT(CASE WHEN fda.assignment_status = 'accepted' THEN 1 END) as accepted_assignments,
    fo.created_at as order_created,
    fo.updated_at as order_updated
FROM france_orders fo
LEFT JOIN france_delivery_drivers fdd ON fo.driver_id = fdd.id
LEFT JOIN delivery_tokens dt ON fo.id = dt.order_id
LEFT JOIN france_delivery_assignments fda ON fo.id = fda.order_id
WHERE fo.order_number = '1309-0005'
GROUP BY fo.id, fo.order_number, fo.status, fo.driver_id, fdd.first_name, fdd.last_name, fo.driver_assignment_status, fo.created_at, fo.updated_at;

-- 6. VÉRIFICATION FONCTIONNEMENT ATTENDU
SELECT 
    '=== VÉRIFICATIONS ===' as section,
    CASE 
        WHEN fo.status = 'prete' AND fo.driver_id IS NULL THEN '❌ COMMANDE NON ACCEPTÉE'
        WHEN fo.status = 'assignee' AND fo.driver_id IS NOT NULL THEN '✅ COMMANDE ACCEPTÉE'
        WHEN fo.status = 'en_livraison' THEN '✅ COMMANDE EN LIVRAISON'
        WHEN fo.status = 'livree' THEN '✅ COMMANDE LIVRÉE'
        ELSE '⚠️ ÉTAT INCONNU: ' || fo.status
    END as verification_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM delivery_tokens dt WHERE dt.order_id = fo.id AND dt.used = true) 
        THEN '✅ TOKEN UTILISÉ' 
        ELSE '❌ AUCUN TOKEN UTILISÉ' 
    END as token_verification,
    CASE 
        WHEN EXISTS(SELECT 1 FROM france_delivery_assignments fda WHERE fda.order_id = fo.id AND fda.assignment_status = 'accepted') 
        THEN '✅ ASSIGNATION ACCEPTÉE' 
        ELSE '❌ AUCUNE ASSIGNATION ACCEPTÉE' 
    END as assignment_verification
FROM france_orders fo
WHERE fo.order_number = '1309-0005';