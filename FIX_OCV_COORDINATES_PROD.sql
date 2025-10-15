-- ========================================================================
-- FIX: Ajout coordonnées GPS pour Le Nouveau O'CV Moissy (PROD)
-- DATE: 2025-10-15
-- ENVIRONNEMENT: PRODUCTION
-- RESTAURANT: Le Nouveau O'CV Moissy (id=16)
-- ========================================================================
-- PROBLÈME:
-- Le restaurant OCV n'a pas de coordonnées GPS (latitude/longitude = NULL)
-- Conséquence: La validation du rayon de livraison ne fonctionne pas
-- Toutes les adresses sont acceptées par défaut (fallback non-bloquant)
-- ========================================================================
-- SOLUTION:
-- Ajouter les coordonnées GPS obtenues via OpenStreetMap Nominatim
-- Adresse: 37 Pl. du 14 Juillet 1789, 77550 Moissy-Cramayel
-- ========================================================================

BEGIN;

-- ========================================================================
-- VÉRIFICATION AVANT MISE À JOUR
-- ========================================================================

-- État actuel du restaurant
SELECT
    id,
    name,
    address,
    latitude,
    longitude,
    delivery_zone_km,
    CASE
        WHEN latitude IS NULL OR longitude IS NULL THEN 'MANQUANT'
        ELSE 'OK'
    END as statut_coordonnees
FROM france_restaurants
WHERE id = 16;

-- ========================================================================
-- MISE À JOUR DES COORDONNÉES GPS
-- ========================================================================

UPDATE france_restaurants
SET
    latitude = 48.6281259,      -- Place du 14 Juillet 1789, Moissy-Cramayel
    longitude = 2.5902222,      -- Coordonnées vérifiées OpenStreetMap
    updated_at = NOW()
WHERE id = 16 AND slug = 'le-nouveau-ocv-moissy';

-- ========================================================================
-- VÉRIFICATIONS APRÈS MISE À JOUR
-- ========================================================================

-- Vérifier le restaurant mis à jour
SELECT
    id,
    name,
    address,
    city,
    postal_code,
    latitude,
    longitude,
    delivery_zone_km,
    CASE
        WHEN latitude IS NULL OR longitude IS NULL THEN '❌ MANQUANT'
        ELSE '✅ OK'
    END as statut_coordonnees
FROM france_restaurants
WHERE id = 16;

-- Test de distance vers un point connu (Pizza Yolo 77)
-- Pizza Yolo: 48.62753600, 2.59375800
-- OCV: 48.6281259, 2.5902222
-- Distance attendue: ~0.3 km (très proche)
SELECT
    'Distance OCV vers Pizza Yolo 77' as test,
    ROUND(
        6371 * 2 * ASIN(
            SQRT(
                POWER(SIN(RADIANS((48.62753600 - 48.6281259) / 2)), 2) +
                COS(RADIANS(48.6281259)) * COS(RADIANS(48.62753600)) *
                POWER(SIN(RADIANS((2.59375800 - 2.5902222) / 2)), 2)
            )
        ),
        2
    ) as distance_km,
    CASE
        WHEN ROUND(
            6371 * 2 * ASIN(
                SQRT(
                    POWER(SIN(RADIANS((48.62753600 - 48.6281259) / 2)), 2) +
                    COS(RADIANS(48.6281259)) * COS(RADIANS(48.62753600)) *
                    POWER(SIN(RADIANS((2.59375800 - 2.5902222) / 2)), 2)
                )
            ),
            2
        ) < 1 THEN '✅ Coordonnées cohérentes'
        ELSE '⚠️ Vérifier coordonnées'
    END as validation;

-- Liste tous les restaurants avec leur statut de coordonnées
SELECT
    id,
    name,
    delivery_zone_km,
    CASE
        WHEN latitude IS NULL OR longitude IS NULL THEN '❌ MANQUANT'
        ELSE '✅ OK'
    END as coordonnees,
    is_active
FROM france_restaurants
WHERE is_active = true
ORDER BY
    CASE WHEN latitude IS NULL OR longitude IS NULL THEN 0 ELSE 1 END,
    name;

-- Résumé final
SELECT
    'RESTAURANTS ACTIFS' as info,
    COUNT(*) as total
FROM france_restaurants
WHERE is_active = true

UNION ALL

SELECT
    'AVEC COORDONNÉES GPS',
    COUNT(*)
FROM france_restaurants
WHERE is_active = true
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL

UNION ALL

SELECT
    'SANS COORDONNÉES GPS',
    COUNT(*)
FROM france_restaurants
WHERE is_active = true
  AND (latitude IS NULL OR longitude IS NULL);

-- ========================================================================
-- Si tout est correct, exécuter COMMIT;
-- En cas de problème, exécuter ROLLBACK;
-- ========================================================================

COMMIT;
