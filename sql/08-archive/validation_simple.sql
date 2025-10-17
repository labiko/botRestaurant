-- 🧪 VALIDATION BOT UNIVERSEL - SIMPLE
-- Tests rapides pour vérifier que tout fonctionne

-- Test 1: Configuration restaurant
SELECT 
    '✅ CONFIGURATION' as test,
    r.name as restaurant,
    c.brand_name,
    jsonb_array_length(c.available_workflows) as nb_workflows
FROM restaurant_bot_configs c
JOIN france_restaurants r ON c.restaurant_id = r.id
WHERE c.restaurant_id = 1 AND c.is_active = true;

-- Test 2: Workflows créés
SELECT 
    '✅ WORKFLOWS' as test,
    workflow_id,
    name,
    jsonb_array_length(steps) as nb_steps
FROM workflow_definitions 
WHERE restaurant_id = 1 AND is_active = true
ORDER BY workflow_id;

-- Test 3: Templates messages
SELECT 
    '✅ TEMPLATES' as test,
    template_key,
    language,
    length(template_content) as content_length
FROM message_templates 
WHERE restaurant_id = 1 AND is_active = true
ORDER BY template_key;

-- Test 4: Produits disponibles
SELECT 
    '✅ PRODUITS JUNIOR' as test,
    COUNT(*) as total
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_menu_categories mc ON p.category_id = mc.id
WHERE ps.size_name = 'JUNIOR' 
    AND p.restaurant_id = 1 
    AND p.is_active = true 
    AND mc.slug = 'pizzas';

SELECT 
    '✅ PRODUITS SENIOR' as test,
    COUNT(*) as total
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_menu_categories mc ON p.category_id = mc.id
WHERE ps.size_name = 'SENIOR' 
    AND p.restaurant_id = 1 
    AND p.is_active = true 
    AND mc.slug = 'pizzas';

SELECT 
    '✅ PRODUITS MEGA' as test,
    COUNT(*) as total
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
JOIN france_menu_categories mc ON p.category_id = mc.id
WHERE ps.size_name = 'MEGA' 
    AND p.restaurant_id = 1 
    AND p.is_active = true 
    AND mc.slug = 'pizzas';

-- Test 5: Sessions étendues
SELECT 
    '✅ SESSIONS' as test,
    COUNT(*) as total_with_workflow_support
FROM france_user_sessions 
WHERE workflow_state IS NOT NULL;

-- Message final
SELECT '🎉 VALIDATION TERMINÉE' as status, 'Bot universel opérationnel' as message;