-- ========================================
-- VÉRIFICATION POST-ACCEPTATION COMMANDE 1309-0007
-- Token utilisé: COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw
-- ========================================

-- 1. ÉTAT DE LA COMMANDE APRÈS ACCEPTATION
SELECT 
    '=== COMMANDE APRÈS ACCEPTATION ===' as section,
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
    fdd.first_name || ' ' || fdd.last_name as assigned_driver_name,
    -- Vérifications
    CASE 
        WHEN fo.status = 'assignee' THEN '✅ STATUS CORRECT'
        ELSE '❌ STATUS INCORRECT: ' || fo.status
    END as status_check,
    CASE 
        WHEN fo.driver_id IS NOT NULL THEN '✅ LIVREUR ASSIGNÉ'
        ELSE '❌ AUCUN LIVREUR ASSIGNÉ'
    END as driver_check,
    CASE 
        WHEN fo.driver_assignment_status = 'assigned' THEN '✅ ASSIGNMENT STATUS CORRECT'
        ELSE '❌ ASSIGNMENT STATUS INCORRECT: ' || fo.driver_assignment_status
    END as assignment_status_check
FROM france_orders fo
LEFT JOIN france_delivery_drivers fdd ON fo.driver_id = fdd.id
WHERE fo.order_number = '1309-0007';

-- 2. ÉTAT DU TOKEN UTILISÉ POUR ACCEPTATION
SELECT 
    '=== TOKEN UTILISÉ ===' as section,
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
    fdd.first_name || ' ' || fdd.last_name as token_driver_name,
    -- Vérifications
    CASE 
        WHEN dt.used = true THEN '✅ TOKEN MARQUÉ UTILISÉ'
        ELSE '❌ TOKEN NON MARQUÉ UTILISÉ'
    END as used_check,
    CASE 
        WHEN dt.expires_at > NOW() THEN '✅ TOKEN ENCORE VALIDE (3H)'
        ELSE '❌ TOKEN EXPIRÉ'
    END as validity_check,
    ROUND(EXTRACT(EPOCH FROM (dt.expires_at - NOW()))/60) as minutes_remaining_3h
FROM delivery_tokens dt
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
WHERE dt.token = 'COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw';

-- 3. TOUS LES TOKENS DE LA COMMANDE APRÈS ACCEPTATION
SELECT 
    '=== TOUS TOKENS COMMANDE ===' as section,
    dt.id as token_id,
    dt.token,
    dt.driver_id,
    dt.used,
    dt.suspended,
    dt.expires_at,
    dt.updated_at as token_updated,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    CASE 
        WHEN dt.token = 'COk9sdv8Aw03cmNGr3AkOtBFyUgsRJXw' THEN '🎯 TOKEN UTILISÉ POUR ACCEPTATION'
        WHEN dt.used = true THEN '✅ TOKEN UTILISÉ'
        WHEN dt.used = false THEN '⚪ TOKEN NON UTILISÉ'
        ELSE '❓ STATUT INCONNU'
    END as token_status
FROM delivery_tokens dt
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number = '1309-0007'
ORDER BY dt.created_at DESC;

-- 4. ASSIGNATIONS CRÉÉES LORS DE L'ACCEPTATION
SELECT 
    '=== ASSIGNATIONS POST-ACCEPTATION ===' as section,
    fda.id as assignment_id,
    fda.order_id,
    fda.driver_id,
    fda.assignment_status,
    fda.created_at as assignment_created,
    fda.expires_at as assignment_expires,
    fda.accepted_at,
    fda.rejected_at,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    CASE 
        WHEN fda.assignment_status = 'accepted' THEN '✅ ASSIGNATION ACCEPTÉE'
        ELSE '❌ ASSIGNATION NON ACCEPTÉE: ' || fda.assignment_status
    END as assignment_check
FROM france_delivery_assignments fda
LEFT JOIN france_delivery_drivers fdd ON fda.driver_id = fdd.id
LEFT JOIN france_orders fo ON fda.order_id = fo.id
WHERE fo.order_number = '1309-0007'
ORDER BY fda.created_at DESC;

-- 5. ACTIONS LIVREUR CRÉÉES
SELECT 
    '=== ACTIONS LIVREUR POST-ACCEPTATION ===' as section,
    dda.id as action_id,
    dda.order_id,
    dda.driver_id,
    dda.action_type,
    dda.details,
    dda.created_at as action_created,
    fdd.first_name || ' ' || fdd.last_name as driver_name,
    CASE 
        WHEN dda.action_type = 'accepted' THEN '✅ ACTION ACCEPTATION ENREGISTRÉE'
        ELSE '📝 AUTRE ACTION: ' || dda.action_type
    END as action_check
FROM delivery_driver_actions dda
LEFT JOIN france_delivery_drivers fdd ON dda.driver_id = fdd.id
LEFT JOIN france_orders fo ON dda.order_id = fo.id
WHERE fo.order_number = '1309-0007'
ORDER BY dda.created_at DESC;

-- 6. ACCESSIBILITÉ DES TOKENS APRÈS ACCEPTATION
SELECT 
    '=== ACCESSIBILITÉ TOKENS ===' as section,
    dt.token,
    dt.used,
    dt.driver_id as token_driver_id,
    fo.driver_id as order_driver_id,
    fo.status as order_status,
    -- Test de la nouvelle logique validateToken
    CASE 
        -- Token utilisé + même livreur + non expiré = Accès post-acceptation
        WHEN dt.used = true AND fo.driver_id = dt.driver_id AND dt.expires_at > NOW() THEN 
            '✅ ACCÈS POST-ACCEPTATION AUTORISÉ (3H)'
        -- Token utilisé + autre livreur = Token déjà utilisé
        WHEN dt.used = true AND fo.driver_id != dt.driver_id THEN 
            '❌ TOKEN UTILISÉ PAR AUTRE LIVREUR'
        -- Token utilisé + expiré = Session expirée
        WHEN dt.used = true AND dt.expires_at <= NOW() THEN 
            '❌ SESSION EXPIRÉE (3H)'
        -- Token non utilisé + commande assignée = Accès autorisé (NOUVELLE LOGIQUE)
        WHEN dt.used = false AND fo.status = 'assignee' THEN 
            '✅ ACCÈS AUTORISÉ - Token non utilisé mais commande assignée (NOUVELLE LOGIQUE)'
        -- Token non utilisé + status != prete = Commande non disponible
        WHEN fo.status != 'prete' THEN 
            '❌ COMMANDE NON DISPONIBLE, STATUS: ' || fo.status
        ELSE '✅ TOKEN VALIDE'
    END as accessibility_status,
    
    'https://botresto.vercel.app/restaurant-france/delivery-france/accept?token=' || dt.token as test_url
    
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number = '1309-0007'
ORDER BY dt.created_at DESC;

-- 7. RÉSUMÉ COMPLET DE L'ACCEPTATION
SELECT 
    '=== RÉSUMÉ ACCEPTATION ===' as section,
    fo.order_number,
    fo.status as final_status,
    fo.driver_id as assigned_driver_id,
    fdd.first_name || ' ' || fdd.last_name as assigned_driver_name,
    fo.driver_assignment_status as final_assignment_status,
    COUNT(dt.id) as total_tokens,
    COUNT(CASE WHEN dt.used = true THEN 1 END) as used_tokens,
    COUNT(CASE WHEN dt.used = false THEN 1 END) as unused_tokens,
    COUNT(fda.id) as total_assignments,
    COUNT(CASE WHEN fda.assignment_status = 'accepted' THEN 1 END) as accepted_assignments,
    -- Vérification globale
    CASE 
        WHEN fo.status = 'assignee' AND fo.driver_id IS NOT NULL AND fo.driver_assignment_status = 'assigned'
        THEN '✅ ACCEPTATION RÉUSSIE COMPLÈTEMENT'
        ELSE '❌ ACCEPTATION INCOMPLÈTE'
    END as overall_status
FROM france_orders fo
LEFT JOIN france_delivery_drivers fdd ON fo.driver_id = fdd.id
LEFT JOIN delivery_tokens dt ON fo.id = dt.order_id
LEFT JOIN france_delivery_assignments fda ON fo.id = fda.order_id
WHERE fo.order_number = '1309-0007'
GROUP BY fo.id, fo.order_number, fo.status, fo.driver_id, fdd.first_name, fdd.last_name, fo.driver_assignment_status;