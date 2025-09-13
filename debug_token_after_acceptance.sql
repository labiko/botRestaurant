-- ========================================
-- DEBUG: ACCESSIBILITÉ TOKEN APRÈS ACCEPTATION
-- ========================================

-- 1. ÉTAT DU TOKEN APRÈS ACCEPTATION
SELECT 
    '=== TOKEN ÉTAT ===' as section,
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
    -- Vérifications temporelles
    CASE 
        WHEN dt.expires_at > NOW() THEN '✅ TOKEN NON EXPIRÉ'
        ELSE '❌ TOKEN EXPIRÉ (expires_at)'
    END as expires_check,
    CASE 
        WHEN dt.absolute_expires_at > NOW() THEN '✅ TOKEN NON EXPIRÉ ABSOLU'
        ELSE '❌ TOKEN EXPIRÉ ABSOLU'
    END as absolute_expires_check,
    -- Calcul des minutes restantes
    EXTRACT(EPOCH FROM (dt.expires_at - NOW()))/60 as minutes_until_expiry,
    EXTRACT(EPOCH FROM (dt.absolute_expires_at - NOW()))/60 as minutes_until_absolute_expiry
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number = '1309-0005';

-- 2. ÉTAT DE LA COMMANDE ASSIGNÉE
SELECT 
    '=== COMMANDE ASSIGNÉE ===' as section,
    fo.id,
    fo.order_number,
    fo.status,
    fo.driver_id,
    fo.driver_assignment_status,
    fdd.first_name || ' ' || fdd.last_name as assigned_driver_name,
    fo.updated_at as order_updated
FROM france_orders fo
LEFT JOIN france_delivery_drivers fdd ON fo.driver_id = fdd.id
WHERE fo.order_number = '1309-0005';

-- 3. SIMULATION VALIDATETOKEN - CE QUE LA FONCTION FERAIT
SELECT 
    '=== SIMULATION VALIDATETOKEN ===' as section,
    dt.token,
    -- Vérifications de la fonction validateToken
    CASE 
        WHEN dt.used = true AND fo.driver_id = dt.driver_id THEN 
            CASE 
                WHEN dt.expires_at > NOW() THEN '✅ ACCÈS POST-ACCEPTATION AUTORISÉ'
                ELSE '❌ SESSION EXPIRÉE (3h)'
            END
        WHEN dt.used = true AND fo.driver_id != dt.driver_id THEN '❌ TOKEN DÉJÀ UTILISÉ PAR AUTRE LIVREUR'
        WHEN dt.suspended = true THEN '❌ TOKEN SUSPENDU'
        WHEN dt.expires_at < NOW() THEN '❌ LIEN EXPIRÉ'
        WHEN dt.absolute_expires_at < NOW() THEN '❌ LIEN DÉFINITIVEMENT EXPIRÉ'
        WHEN fo.status != 'prete' THEN '❌ COMMANDE NON DISPONIBLE, STATUS: ' || fo.status
        WHEN fo.driver_id IS NOT NULL THEN '❌ COMMANDE DÉJÀ ASSIGNÉE'
        ELSE '✅ TOKEN VALIDE'
    END as validation_result,
    
    -- Détails de chaque vérification
    dt.used as token_used,
    dt.suspended as token_suspended,
    dt.expires_at < NOW() as is_expired,
    dt.absolute_expires_at < NOW() as is_absolute_expired,
    fo.status as order_status,
    fo.driver_id as order_driver_id,
    dt.driver_id as token_driver_id,
    fo.driver_id = dt.driver_id as driver_match
    
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number = '1309-0005';

-- 4. ACCÈS POST-ACCEPTATION - RÈGLES DÉTAILLÉES
SELECT 
    '=== RÈGLES ACCÈS POST-ACCEPTATION ===' as section,
    'Token utilisé: ' || dt.used as rule_1,
    'Livreur correspond: ' || (fo.driver_id = dt.driver_id) as rule_2,
    'Token non expiré: ' || (dt.expires_at > NOW()) as rule_3,
    CASE 
        WHEN dt.used = true AND fo.driver_id = dt.driver_id AND dt.expires_at > NOW() 
        THEN '✅ ACCÈS POST-ACCEPTATION POSSIBLE'
        ELSE '❌ ACCÈS POST-ACCEPTATION REFUSÉ'
    END as final_verdict,
    
    -- Temps restant pour accès
    CASE 
        WHEN dt.expires_at > NOW() 
        THEN EXTRACT(EPOCH FROM (dt.expires_at - NOW()))/60 || ' minutes restantes'
        ELSE 'EXPIRÉ depuis ' || ABS(EXTRACT(EPOCH FROM (dt.expires_at - NOW()))/60) || ' minutes'
    END as time_remaining

FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE fo.order_number = '1309-0005';

-- 5. URL DE TEST POUR VÉRIFICATION
SELECT 
    '=== URL TEST ===' as section,
    'https://botresto.vercel.app/restaurant-france/delivery-france/accept?token=' || dt.token as test_url,
    'Commande: ' || fo.order_number as order_info,
    'Livreur: ' || fdd.first_name || ' ' || fdd.last_name as driver_info
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id  
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
WHERE fo.order_number = '1309-0005';