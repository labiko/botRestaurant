-- 🔍 VÉRIFICATION SIMPLE: Produits en doublon en base de données

-- Trouver les produits avec des noms identiques ou similaires
SELECT 
    name,
    COUNT(*) as nombre_produits,
    STRING_AGG(id::text, ', ') as ids_produits,
    STRING_AGG(created_at::text, ' | ') as dates_creation
FROM france_products 
WHERE is_active = true
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, name;