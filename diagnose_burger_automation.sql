-- Diagnostic : Pourquoi NOS BURGER n'a pas été automatisé ?

-- 1. Vérifier si la fonction existe
SELECT 'FONCTIONS EXISTANTES:' as info;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('configure_category_workflow', 'apply_composite_config')
AND routine_schema = 'public';

-- 2. Vérifier l'état actuel de LE FISH
SELECT 'ÉTAT ACTUEL DE LE FISH:' as info;
SELECT 
    p.name,
    p.product_type,
    p.workflow_type,
    p.requires_steps,
    p.steps_config IS NOT NULL as has_config,
    c.name as category_name
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE p.name = 'LE FISH';

-- 3. Vérifier les tailles existantes
SELECT 'TAILLES DE LE FISH:' as info;
SELECT 
    ps.size_name,
    ps.price_on_site,
    ps.price_delivery
FROM france_product_sizes ps
JOIN france_products p ON ps.product_id = p.id
WHERE p.name = 'LE FISH';

-- 4. Vérifier les options boisson
SELECT 'OPTIONS BOISSON DE LE FISH:' as info;
SELECT COUNT(*) as nb_boissons
FROM france_product_options po
JOIN france_products p ON po.product_id = p.id
WHERE p.name = 'LE FISH'
AND po.option_group = 'Boisson 33CL incluse';

-- 5. Test manuel de la fonction
SELECT 'TEST DIRECT DE LA FONCTION:' as info;
SELECT configure_category_workflow('NOS BURGER', 'composite', true) as result;
