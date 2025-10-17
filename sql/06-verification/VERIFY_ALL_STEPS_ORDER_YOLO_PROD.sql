-- ========================================================================
-- VÉRIFICATION ORDRE DES STEPS - TOUTES LES CATÉGORIES
-- DATE: 2025-01-16
-- RESTAURANT: Pizza Yolo 77 (ID: 1)
--
-- OBJECTIF: Vérifier l'ordre des steps pour toutes les catégories migrées
-- ORDRE STANDARD: Plats → Boisson → Suppléments → Sauces
-- ORDRE PERSONNALISÉ BOWLS: Plats → Sauces → Boisson → Suppléments
-- ========================================================================

-- Afficher l'ordre des steps pour toutes les catégories composites
SELECT
    p.id AS product_id,
    p.name AS produit,
    c.name AS categorie,
    steps_config->'steps'->0->>'option_groups' AS step1,
    steps_config->'steps'->1->>'option_groups' AS step2,
    steps_config->'steps'->2->>'option_groups' AS step3,
    steps_config->'steps'->3->>'option_groups' AS step4
FROM france_products p
JOIN france_menu_categories c ON p.category_id = c.id
WHERE c.restaurant_id = 1
AND p.product_type = 'composite'
AND c.name IN ('BURGERS', 'GOURMETS', 'SMASHS', 'NAANS', 'SANDWICHS', 'PANINI', 'ASSIETTES', 'BOWLS')
ORDER BY c.name;

-- Résumé attendu
SELECT
    'ORDRE STANDARD' AS type,
    'Plats → Boisson → Suppléments → Sauces' AS ordre,
    'BURGERS, GOURMETS, SMASHS, NAANS, PANINI, ASSIETTES' AS categories
UNION ALL
SELECT
    'ORDRE PERSONNALISÉ' AS type,
    'Plats → Sauces → Boisson → Suppléments' AS ordre,
    'BOWLS uniquement' AS categories;
