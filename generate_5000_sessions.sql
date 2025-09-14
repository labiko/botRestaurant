-- 📊 GÉNÉRATION DE 5000 SESSIONS CLIENT POUR TEST DE PERFORMANCE
-- Simule des clients réels avec numéros aléatoires et workflows variés

BEGIN;

-- 🔧 SUPPRIMER TEMPORAIREMENT LA CONTRAINTE FK RESTAURANT_ID
ALTER TABLE france_user_sessions DROP CONSTRAINT IF EXISTS france_user_sessions_restaurant_id_fkey;

-- Fonction pour générer un numéro de téléphone français aléatoire
CREATE OR REPLACE FUNCTION generate_random_phone() 
RETURNS TEXT AS $$
DECLARE
    prefix TEXT[] := ARRAY['33601', '33602', '33603', '33604', '33605', '33606', '33607', '33608', '33609', 
                          '33610', '33611', '33612', '33613', '33614', '33615', '33616', '33617', '33618', '33619',
                          '33620', '33621', '33622', '33623', '33624', '33625', '33626', '33627', '33628', '33629',
                          '33630', '33631', '33632', '33633', '33634', '33635', '33636', '33637', '33638', '33639',
                          '33640', '33641', '33642', '33643', '33644', '33645', '33646', '33647', '33648', '33649'];
    random_prefix TEXT;
    random_suffix TEXT;
BEGIN
    -- Choisir un préfixe aléatoire
    random_prefix := prefix[floor(random() * array_length(prefix, 1) + 1)];
    
    -- Générer 6 chiffres aléatoires
    random_suffix := lpad(floor(random() * 1000000)::text, 6, '0');
    
    RETURN random_prefix || random_suffix || '@c.us';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un JSON session_data réaliste
CREATE OR REPLACE FUNCTION generate_session_data(step_type TEXT, restaurant_id INT)
RETURNS JSONB AS $$
DECLARE
    base_categories JSONB := '[
        {"id":1,"icon":"🌮","name":"TACOS","slug":"tacos","is_active":true,"display_order":1,"restaurant_id":1},
        {"id":10,"icon":"🍕","name":"Pizzas","slug":"pizzas","is_active":true,"display_order":2,"restaurant_id":1},
        {"id":2,"icon":"🍔","name":"BURGERS","slug":"burgers","is_active":true,"display_order":3,"restaurant_id":1},
        {"id":11,"icon":"📋","name":"Menu Pizza","slug":"menus","is_active":true,"display_order":4,"restaurant_id":1},
        {"id":14,"icon":"🥤","name":"BOISSONS","slug":"drinks","is_active":true,"display_order":13,"restaurant_id":1}
    ]';
    
    delivery_modes TEXT[] := ARRAY['sur_place', 'a_emporter', 'livraison'];
    random_mode TEXT;
    session_data JSONB;
BEGIN
    random_mode := delivery_modes[floor(random() * array_length(delivery_modes, 1) + 1)];
    
    CASE step_type
        WHEN 'CHOOSING_DELIVERY_MODE' THEN
            session_data := jsonb_build_object(
                'cart', '{}',
                'categories', base_categories,
                'totalPrice', floor(random() * 25 + 5), -- 5-30€
                'deliveryMode', random_mode,
                'availableModes', '["sur_place","a_emporter","livraison"]',
                'selectedRestaurantId', restaurant_id,
                'selectedRestaurantName', 'Restaurant ' || restaurant_id,
                'awaitingWorkflowActions', true
            );
        
        WHEN 'SELECTING_PRODUCTS' THEN
            session_data := jsonb_build_object(
                'cart', jsonb_build_object(
                    'items', jsonb_build_array(
                        jsonb_build_object('id', floor(random() * 300 + 200), 'name', 'Produit ' || floor(random() * 100), 'quantity', floor(random() * 3 + 1))
                    )
                ),
                'categories', base_categories,
                'totalPrice', floor(random() * 40 + 10), -- 10-50€
                'deliveryMode', random_mode,
                'selectedRestaurantId', restaurant_id,
                'currentCategoryId', floor(random() * 23 + 1)
            );
            
        WHEN 'IN_WORKFLOW' THEN
            session_data := jsonb_build_object(
                'cart', jsonb_build_object(
                    'items', jsonb_build_array(
                        jsonb_build_object('id', floor(random() * 300 + 200), 'name', 'Tacos ' || (ARRAY['M', 'L', 'XL'])[floor(random() * 3 + 1)], 'quantity', floor(random() * 2 + 1))
                    )
                ),
                'categories', base_categories,
                'totalPrice', floor(random() * 35 + 8), -- 8-43€
                'selectedProduct', jsonb_build_object(
                    'id', floor(random() * 300 + 200),
                    'name', 'TACOS MENU ' || (ARRAY['M', 'L', 'XL'])[floor(random() * 3 + 1)],
                    'price', floor(random() * 5 + 8) -- 8-13€
                ),
                'workflowTemplate', jsonb_build_object(
                    'id', floor(random() * 5 + 1),
                    'template_name', 'tacos_size_template'
                ),
                'selectedRestaurantId', restaurant_id,
                'variantSelection', true,
                'universalWorkflow', jsonb_build_object('currentStep', floor(random() * 3))
            );
        
        ELSE -- BROWSING_MENU par défaut
            session_data := jsonb_build_object(
                'cart', '{}',
                'categories', base_categories,
                'totalPrice', 0,
                'selectedRestaurantId', restaurant_id,
                'selectedRestaurantName', 'Restaurant ' || restaurant_id
            );
    END CASE;
    
    RETURN session_data;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les sessions existantes si besoin (optionnel)
-- DELETE FROM france_user_sessions WHERE id > 609;

-- Insérer 5000 sessions avec données réalistes
INSERT INTO france_user_sessions (
    phone_number,
    chat_id,
    restaurant_id,
    current_step,
    session_data,
    cart_items,
    total_amount,
    expires_at,
    created_at,
    updated_at,
    workflow_state,
    current_step_id,
    step_data,
    workflow_context,
    bot_state,
    current_workflow_id,
    workflow_data,
    workflow_step_id
)
SELECT 
    generate_random_phone() as phone_number,
    generate_random_phone() as chat_id, -- Même valeur que phone_number
    (floor(random() * 5) + 1)::int as restaurant_id, -- Restaurant 1, 2, 3, 4, ou 5 (même si n'existe pas)
    
    -- Étapes variées selon un workflow réaliste
    CASE floor(random() * 4)
        WHEN 0 THEN 'BROWSING_MENU'
        WHEN 1 THEN 'SELECTING_PRODUCTS' 
        WHEN 2 THEN 'CHOOSING_DELIVERY_MODE'
        ELSE 'IN_WORKFLOW'
    END as current_step,
    
    -- Session data correspondant à l'étape
    generate_session_data(
        CASE floor(random() * 4)
            WHEN 0 THEN 'BROWSING_MENU'
            WHEN 1 THEN 'SELECTING_PRODUCTS'
            WHEN 2 THEN 'CHOOSING_DELIVERY_MODE'
            ELSE 'IN_WORKFLOW'
        END,
        (floor(random() * 5) + 1)::int
    ) as session_data,
    
    -- Panier vide ou avec quelques items
    CASE WHEN random() > 0.3 THEN 
        ('[{"id":' || floor(random() * 300 + 200) || ',"name":"Produit ' || floor(random() * 100) || '","quantity":' || floor(random() * 3 + 1) || '}]')::jsonb
    ELSE 
        '[]'::jsonb
    END as cart_items,
    
    -- Montant total réaliste
    (random() * 45 + 5)::numeric(10,2) as total_amount, -- 5-50€
    
    -- Sessions qui expirent dans le futur (1-4 heures)
    NOW() + (random() * 4 + 1) * interval '1 hour' as expires_at,
    
    -- Créées dans les dernières 24h
    NOW() - (random() * 24) * interval '1 hour' as created_at,
    
    -- Mises à jour récemment
    NOW() - (random() * 2) * interval '1 hour' as updated_at,
    
    -- Workflow state vide ou avec données
    CASE WHEN random() > 0.5 THEN '{}'::jsonb ELSE '{"step": "active"}'::jsonb END as workflow_state,
    
    -- Current step ID
    CASE floor(random() * 4)
        WHEN 0 THEN 'BROWSING_MENU'
        WHEN 1 THEN 'SELECTING_PRODUCTS'
        WHEN 2 THEN 'CHOOSING_DELIVERY_MODE'
        ELSE 'IN_WORKFLOW'
    END as current_step_id,
    
    -- Step data
    CASE WHEN random() > 0.4 THEN '{"data": "active"}'::jsonb ELSE '{}'::jsonb END as step_data,
    
    -- Workflow context
    '{}'::jsonb as workflow_context,
    
    -- Bot state varié (JSONB format)
    ('"' || CASE floor(random() * 5)
        WHEN 0 THEN 'AWAITING_WORKFLOW_ACTIONS'
        WHEN 1 THEN 'AWAITING_PRODUCT_SELECTION'
        WHEN 2 THEN 'AWAITING_DELIVERY_MODE'
        WHEN 3 THEN 'PROCESSING_ORDER'
        ELSE 'BROWSING_MENU'
    END || '"')::jsonb as bot_state,
    
    -- Workflow ID
    CASE WHEN random() > 0.3 THEN 'restaurant_onboarding' ELSE NULL END as current_workflow_id,
    
    -- Workflow data
    ('{"workflowId":"restaurant_onboarding","stepHistory":[],"currentStepId":"' || 
     CASE floor(random() * 3)
         WHEN 0 THEN 'BROWSING_MENU'
         WHEN 1 THEN 'CHOOSING_DELIVERY_MODE'  
         ELSE 'SELECTING_PRODUCTS'
     END || 
     '","selectedItems":{},"validationErrors":[]}')::jsonb as workflow_data,
    
    -- Workflow step ID
    NULL as workflow_step_id
    
FROM generate_series(1, 5000);

-- Mettre à jour les statistiques PostgreSQL après insertion
ANALYZE france_user_sessions;

-- Nettoyer les fonctions temporaires
DROP FUNCTION generate_random_phone();
DROP FUNCTION generate_session_data(TEXT, INT);

-- 🔧 RECRÉER LA CONTRAINTE FK APRÈS LE TEST (optionnel)
-- Décommenter si vous voulez recréer la contrainte FK restaurant_id
/*
ALTER TABLE france_user_sessions 
ADD CONSTRAINT france_user_sessions_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) REFERENCES france_restaurants(id);
*/

-- Note: La contrainte FK restaurant_id a été supprimée pour ce test de performance
-- En production, il faudrait la recréer après les tests si nécessaire

-- Vérifier l'insertion
SELECT 
    COUNT(*) as total_sessions,
    COUNT(DISTINCT phone_number) as unique_phones,
    COUNT(DISTINCT restaurant_id) as restaurants_used,
    AVG(total_amount) as avg_amount,
    MIN(created_at) as oldest_session,
    MAX(created_at) as newest_session
FROM france_user_sessions;

COMMIT;

-- Afficher quelques exemples
SELECT 
    phone_number,
    restaurant_id,
    current_step,
    total_amount,
    bot_state,
    expires_at > NOW() as is_active
FROM france_user_sessions 
ORDER BY created_at DESC 
LIMIT 10;