-- 🔧 CORRECTION: Remettre la bonne category_id pour le produit dupliqué

-- Corriger le produit ID 328 en copiant la category_id de l'original (260)
UPDATE france_products 
SET category_id = 14
WHERE id = 328 
  AND name = 'MIRANDA TROPICAL (Copie) v2';

-- Vérification du résultat
SELECT 
    id,
    name,
    category_id,
    restaurant_id,
    is_active
FROM france_products 
WHERE name ILIKE '%miranda%tropical%'
ORDER BY id;