-- ===============================================
-- AUDIT GLOBAL - PROBLÈMES DE NUMÉROTATION
-- Script unifié pour détecter tous les problèmes
-- ===============================================

-- REQUÊTE PRINCIPALE UNIFIÉE
WITH
-- 1. AUDIT OPTIONS: Doublons display_order
options_doublons AS (
    SELECT
        'OPTIONS_DOUBLONS_DISPLAY_ORDER' as type_probleme,
        fpo.product_id,
        fp.restaurant_id,
        fr.name as restaurant_name,
        fpo.option_group,
        fpo.display_order,
        COUNT(*) as nb_doublons,
        STRING_AGG(fpo.option_name, ' | ' ORDER BY fpo.id) as options_concernees,
        'Produit: ' || fp.name as contexte
    FROM france_product_options fpo
    JOIN france_products fp ON fpo.product_id = fp.id
    JOIN france_restaurants fr ON fp.restaurant_id = fr.id
    GROUP BY fpo.product_id, fp.restaurant_id, fr.name, fpo.option_group, fpo.display_order, fp.name
    HAVING COUNT(*) > 1
),

-- 2. AUDIT OPTIONS: Emojis numériques dans les noms
options_emojis AS (
    SELECT
        'OPTIONS_EMOJIS_NUMERIQUES' as type_probleme,
        fpo.product_id,
        fp.restaurant_id,
        fr.name as restaurant_name,
        fpo.option_group,
        fpo.display_order,
        1 as nb_problemes,
        fpo.option_name as options_concernees,
        'Produit: ' || fp.name as contexte
    FROM france_product_options fpo
    JOIN france_products fp ON fpo.product_id = fp.id
    JOIN france_restaurants fr ON fp.restaurant_id = fr.id
    WHERE fpo.option_name ~ '^[0-9️⃣🔟1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣]+'
),

-- 3. AUDIT OPTIONS: Incohérences séquence display_order
options_incoherences AS (
    SELECT
        'OPTIONS_SEQUENCE_INCOHERENTE' as type_probleme,
        fpo.product_id,
        fp.restaurant_id,
        fr.name as restaurant_name,
        fpo.option_group,
        fpo.display_order,
        1 as nb_problemes,
        fpo.option_name || ' (pos=' || ROW_NUMBER() OVER (PARTITION BY fpo.product_id, fpo.option_group ORDER BY fpo.display_order) || ', order=' || fpo.display_order || ')' as options_concernees,
        'Produit: ' || fp.name as contexte
    FROM france_product_options fpo
    JOIN france_products fp ON fpo.product_id = fp.id
    JOIN france_restaurants fr ON fp.restaurant_id = fr.id
    WHERE fpo.display_order != ROW_NUMBER() OVER (PARTITION BY fpo.product_id, fpo.option_group ORDER BY fpo.display_order)
),

-- 4. AUDIT PRODUITS: Doublons display_order par catégorie
produits_doublons AS (
    SELECT
        'PRODUITS_DOUBLONS_DISPLAY_ORDER' as type_probleme,
        fp.category_id::text as product_id,
        fp.restaurant_id,
        fr.name as restaurant_name,
        fmc.name as option_group,
        fp.display_order,
        COUNT(*) as nb_doublons,
        STRING_AGG(fp.name, ' | ' ORDER BY fp.id) as options_concernees,
        'Catégorie: ' || fmc.name as contexte
    FROM france_products fp
    JOIN france_restaurants fr ON fp.restaurant_id = fr.id
    JOIN france_menu_categories fmc ON fp.category_id = fmc.id
    WHERE fp.is_active = true
    GROUP BY fp.category_id, fp.restaurant_id, fr.name, fmc.name, fp.display_order
    HAVING COUNT(*) > 1
),

-- 5. AUDIT PRODUITS: Noms avec numérotation manuelle
produits_numerotes AS (
    SELECT
        'PRODUITS_NUMEROTATION_MANUELLE' as type_probleme,
        fp.id::text as product_id,
        fp.restaurant_id,
        fr.name as restaurant_name,
        fmc.name as option_group,
        fp.display_order,
        1 as nb_problemes,
        fp.name as options_concernees,
        'Catégorie: ' || fmc.name as contexte
    FROM france_products fp
    JOIN france_restaurants fr ON fp.restaurant_id = fr.id
    JOIN france_menu_categories fmc ON fp.category_id = fmc.id
    WHERE fp.name ~ '^[0-9]+[\.°\)]\s*'
       OR fp.name ~ '^[0-9️⃣🔟1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣]+'
),

-- 6. AUDIT CATÉGORIES: Doublons display_order par restaurant
categories_doublons AS (
    SELECT
        'CATEGORIES_DOUBLONS_DISPLAY_ORDER' as type_probleme,
        fmc.restaurant_id::text as product_id,
        fmc.restaurant_id,
        fr.name as restaurant_name,
        'Catégories restaurant' as option_group,
        fmc.display_order,
        COUNT(*) as nb_doublons,
        STRING_AGG(fmc.name, ' | ' ORDER BY fmc.id) as options_concernees,
        'Restaurant: ' || fr.name as contexte
    FROM france_menu_categories fmc
    JOIN france_restaurants fr ON fmc.restaurant_id = fr.id
    WHERE fmc.is_active = true
    GROUP BY fmc.restaurant_id, fr.name, fmc.display_order
    HAVING COUNT(*) > 1
),

-- 7. AUDIT CATÉGORIES: Noms avec numérotation manuelle
categories_numerotees AS (
    SELECT
        'CATEGORIES_NUMEROTATION_MANUELLE' as type_probleme,
        fmc.id::text as product_id,
        fmc.restaurant_id,
        fr.name as restaurant_name,
        'Catégorie' as option_group,
        fmc.display_order,
        1 as nb_problemes,
        fmc.name as options_concernees,
        'Restaurant: ' || fr.name as contexte
    FROM france_menu_categories fmc
    JOIN france_restaurants fr ON fmc.restaurant_id = fr.id
    WHERE fmc.name ~ '^[0-9]+[\.°\)]\s*'
       OR fmc.name ~ '^[0-9️⃣🔟1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣]+'
),

-- 8. UNION DE TOUS LES PROBLÈMES
tous_problemes AS (
    SELECT * FROM options_doublons
    UNION ALL
    SELECT * FROM options_emojis
    UNION ALL
    SELECT * FROM options_incoherences
    UNION ALL
    SELECT * FROM produits_doublons
    UNION ALL
    SELECT * FROM produits_numerotes
    UNION ALL
    SELECT * FROM categories_doublons
    UNION ALL
    SELECT * FROM categories_numerotees
),

-- 9. STATISTIQUES GLOBALES
stats_globales AS (
    SELECT
        'STATISTIQUES_GLOBALES' as type_probleme,
        'GLOBAL' as product_id,
        NULL::integer as restaurant_id,
        'TOUS' as restaurant_name,
        'Résumé général' as option_group,
        NULL::integer as display_order,
        COUNT(*) as nb_problemes,
        COUNT(DISTINCT restaurant_id) || ' restaurants concernés sur ' ||
        (SELECT COUNT(*) FROM france_restaurants WHERE is_active = true) || ' actifs' as options_concernees,
        'Total: ' || COUNT(*) || ' problèmes détectés' as contexte
    FROM tous_problemes
)

-- RÉSULTAT FINAL UNIFIÉ
SELECT
    type_probleme,
    restaurant_id,
    restaurant_name,
    option_group as zone_concernee,
    display_order,
    nb_problemes as nb_items_problematiques,
    options_concernees as details_probleme,
    contexte
FROM (
    SELECT * FROM tous_problemes
    UNION ALL
    SELECT * FROM stats_globales
) resultats
ORDER BY
    CASE
        WHEN type_probleme = 'STATISTIQUES_GLOBALES' THEN 1
        WHEN type_probleme LIKE '%DOUBLONS%' THEN 2
        WHEN type_probleme LIKE '%EMOJIS%' THEN 3
        WHEN type_probleme LIKE '%NUMEROTATION%' THEN 4
        WHEN type_probleme LIKE '%SEQUENCE%' THEN 5
        ELSE 6
    END,
    restaurant_id NULLS LAST,
    zone_concernee,
    display_order NULLS LAST;

-- AIDE À L'INTERPRÉTATION DES RÉSULTATS
/*
TYPES DE PROBLÈMES DÉTECTÉS :

1. STATISTIQUES_GLOBALES : Vue d'ensemble du nombre total de problèmes
2. *_DOUBLONS_DISPLAY_ORDER : Deux éléments ont le même numéro d'ordre
3. *_EMOJIS_NUMERIQUES : Des emojis chiffrés sont présents dans les noms (comme 1️⃣, 2️⃣)
4. *_NUMEROTATION_MANUELLE : Des numéros sont écrits dans les noms (comme "1. Pizza", "2) Burger")
5. *_SEQUENCE_INCOHERENTE : Les numéros d'ordre ne suivent pas la séquence logique (1,2,4,5 au lieu de 1,2,3,4)

ZONES CONCERNÉES :
- OPTIONS : france_product_options (choix dans les workflows)
- PRODUITS : france_products (items des menus)
- CATEGORIES : france_menu_categories (sections du menu)

ACTIONS RECOMMANDÉES :
- Corriger les doublons display_order en réorganisant les séquences
- Supprimer les emojis/numéros des noms pour laisser le bot numéroter automatiquement
- Vérifier que les séquences sont continues (1,2,3,4... sans trous)
*/