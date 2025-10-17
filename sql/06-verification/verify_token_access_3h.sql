-- ========================================
-- VÉRIFICATION ACCÈS TOKEN 3H APRÈS ACCEPTATION
-- Token: mIJVFC1HzmJfRGHixTUXc3xHfmha8iDI
-- ========================================

-- 1. ÉTAT COMPLET DU TOKEN
SELECT 
    '=== ÉTAT TOKEN ===' as section,
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
        WHEN dt.expires_at > NOW() THEN '✅ TOKEN NON EXPIRÉ (3h)'
        ELSE '❌ TOKEN EXPIRÉ (3h) depuis ' || ABS(EXTRACT(EPOCH FROM (dt.expires_at - NOW()))/60) || ' min'
    END as expires_3h_check,
    CASE 
        WHEN dt.absolute_expires_at > NOW() THEN '✅ TOKEN NON EXPIRÉ ABSOLU'
        ELSE '❌ TOKEN EXPIRÉ ABSOLU'
    END as absolute_expires_check,
    -- Temps restant
    ROUND(EXTRACT(EPOCH FROM (dt.expires_at - NOW()))/60) as minutes_until_3h_expiry,
    ROUND(EXTRACT(EPOCH FROM (dt.absolute_expires_at - NOW()))/60) as minutes_until_absolute_expiry
FROM delivery_tokens dt
WHERE dt.token = 'mIJVFC1HzmJfRGHixTUXc3xHfmha8iDI';

-- 2. ÉTAT DE LA COMMANDE ASSOCIÉE
SELECT 
    '=== COMMANDE ASSOCIÉE ===' as section,
    fo.id,
    fo.order_number,
    fo.status,
    fo.driver_id,
    fo.driver_assignment_status,
    fdd.first_name || ' ' || fdd.last_name as assigned_driver_name,
    fo.created_at as order_created,
    fo.updated_at as order_updated
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
LEFT JOIN france_delivery_drivers fdd ON fo.driver_id = fdd.id
WHERE dt.token = 'mIJVFC1HzmJfRGHixTUXc3xHfmha8iDI';

-- 3. SIMULATION VALIDATETOKEN AVEC NOUVELLE LOGIQUE
SELECT 
    '=== SIMULATION VALIDATETOKEN NOUVELLE ===' as section,
    dt.token,
    -- Vérifications selon nouvelle logique
    CASE 
        -- Token utilisé + même livreur + non expiré (3h) = Accès post-acceptation
        WHEN dt.used = true AND fo.driver_id = dt.driver_id AND dt.expires_at > NOW() THEN 
            '✅ ACCÈS POST-ACCEPTATION AUTORISÉ (Token utilisé, même livreur, <3h)'
        -- Token utilisé + même livreur + expiré (3h) = Session expirée
        WHEN dt.used = true AND fo.driver_id = dt.driver_id AND dt.expires_at <= NOW() THEN 
            '❌ SESSION EXPIRÉE (3h)'
        -- Token utilisé + autre livreur = Token déjà utilisé
        WHEN dt.used = true AND fo.driver_id != dt.driver_id THEN 
            '❌ TOKEN DÉJÀ UTILISÉ PAR AUTRE LIVREUR'
        -- Token non utilisé + suspendu = Token suspendu
        WHEN dt.suspended = true THEN 
            '❌ TOKEN SUSPENDU'
        -- Token non utilisé + expiré = Lien expiré
        WHEN dt.expires_at < NOW() THEN 
            '❌ LIEN EXPIRÉ'
        -- Token non utilisé + absolument expiré = Lien définitivement expiré
        WHEN dt.absolute_expires_at < NOW() THEN 
            '❌ LIEN DÉFINITIVEMENT EXPIRÉ'
        -- Token non utilisé + commande assignée = Accès autorisé (NOUVELLE LOGIQUE)
        WHEN dt.used = false AND fo.status = 'assignee' THEN 
            '✅ ACCÈS AUTORISÉ - Token non utilisé mais commande assignée (NOUVELLE LOGIQUE)'
        -- Token non utilisé + commande avec driver = Accès autorisé (NOUVELLE LOGIQUE)
        WHEN dt.used = false AND fo.driver_id IS NOT NULL THEN 
            '✅ ACCÈS AUTORISÉ - Token du livreur assigné (NOUVELLE LOGIQUE)'
        -- Token non utilisé + status != prete = Commande non disponible
        WHEN fo.status != 'prete' THEN 
            '❌ COMMANDE NON DISPONIBLE, STATUS: ' || fo.status
        -- Token non utilisé + commande déjà assignée = Commande déjà assignée
        WHEN fo.driver_id IS NOT NULL THEN 
            '❌ COMMANDE DÉJÀ ASSIGNÉE'
        -- Sinon = Token valide
        ELSE '✅ TOKEN VALIDE'
    END as validation_result_nouvelle_logique,
    
    -- Détails pour debug
    dt.used as token_used,
    dt.suspended as token_suspended,
    dt.expires_at < NOW() as is_expired_3h,
    dt.absolute_expires_at < NOW() as is_absolute_expired,
    fo.status as order_status,
    fo.driver_id as order_driver_id,
    dt.driver_id as token_driver_id,
    fo.driver_id = dt.driver_id as driver_match

FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE dt.token = 'mIJVFC1HzmJfRGHixTUXc3xHfmha8iDI';

-- 4. VÉRIFICATION RÈGLE 3H POST-ACCEPTATION
SELECT 
    '=== RÈGLE 3H POST-ACCEPTATION ===' as section,
    CASE 
        WHEN dt.used = true AND fo.driver_id = dt.driver_id THEN
            CASE 
                WHEN dt.expires_at > NOW() THEN 
                    '✅ ACCÈS 3H AUTORISÉ - Reste ' || ROUND(EXTRACT(EPOCH FROM (dt.expires_at - NOW()))/60) || ' minutes'
                ELSE 
                    '❌ ACCÈS 3H EXPIRÉ depuis ' || ABS(ROUND(EXTRACT(EPOCH FROM (dt.expires_at - NOW()))/60)) || ' minutes'
            END
        ELSE '❓ TOKEN NON UTILISÉ OU MAUVAIS LIVREUR'
    END as acces_3h_status,
    
    -- Timestamps pour debug
    dt.expires_at as expires_timestamp,
    NOW() as current_timestamp,
    dt.expires_at > NOW() as is_within_3h_window

FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id
WHERE dt.token = 'mIJVFC1HzmJfRGHixTUXc3xHfmha8iDI';

-- 5. URL DE TEST
SELECT 
    '=== URL TEST ===' as section,
    'https://botresto.vercel.app/restaurant-france/delivery-france/accept?token=' || dt.token as test_url,
    'Commande: ' || fo.order_number as order_info,
    'Livreur: ' || fdd.first_name || ' ' || fdd.last_name as driver_info,
    CASE 
        WHEN dt.used = true AND dt.expires_at > NOW() THEN '✅ URL ACCESSIBLE (POST-ACCEPTATION)'
        WHEN dt.used = false AND fo.status = 'assignee' THEN '✅ URL ACCESSIBLE (NOUVELLE LOGIQUE)'  
        ELSE '❌ URL NON ACCESSIBLE'
    END as accessibility_status
FROM delivery_tokens dt
LEFT JOIN france_orders fo ON dt.order_id = fo.id  
LEFT JOIN france_delivery_drivers fdd ON dt.driver_id = fdd.id
WHERE dt.token = 'mIJVFC1HzmJfRGHixTUXc3xHfmha8iDI';