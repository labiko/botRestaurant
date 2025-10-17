-- ========================================================================
-- SCRIPT: Ajout step 6 supplément viandes pour TACOS OCV (VERSION SÉCURISÉE)
-- Restaurant: Le Nouveau OCV Moissy (ID: 16)
-- Produit: TACOS (ID: 554)
-- Date: 2025-10-17
--
-- OBJECTIF:
-- Ajouter un step 6 après les sauces pour permettre l'ajout de suppléments de viande
-- Prix: +1.50€ par viande supplémentaire
--
-- SÉCURITÉ:
-- ✅ Protection contre double exécution
-- ✅ Vérification restaurant_id explicite
-- ✅ Nettoyage avant insertion
-- ========================================================================

BEGIN;

-- =====================================================================
-- VÉRIFICATION PRÉALABLE : S'assurer qu'on cible le bon restaurant
-- =====================================================================

DO $$
DECLARE
  v_restaurant_id INTEGER;
BEGIN
  SELECT restaurant_id INTO v_restaurant_id
  FROM france_products
  WHERE id = 554;

  IF v_restaurant_id IS NULL THEN
    RAISE EXCEPTION 'ERREUR: Produit 554 introuvable';
  END IF;

  IF v_restaurant_id != 16 THEN
    RAISE EXCEPTION 'ERREUR: Produit 554 n''appartient pas au restaurant OCV (ID: 16)';
  END IF;

  RAISE NOTICE 'Vérification OK: Produit 554 appartient bien au restaurant OCV (ID: 16)';
END $$;

-- =====================================================================
-- PARTIE 1 : NETTOYAGE (au cas où script déjà exécuté)
-- =====================================================================

DELETE FROM france_product_options
WHERE product_id = 554
  AND option_group = 'Supplément viandes';

-- Vérifier le nettoyage
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ Nettoyage OK - Aucun doublon'
    ELSE '⚠️ Des options existaient déjà'
  END as verification
FROM france_product_options
WHERE product_id = 554
  AND option_group = 'Supplément viandes';

-- =====================================================================
-- PARTIE 2 : CRÉATION OPTIONS "Supplément viandes" avec +1.50€
-- =====================================================================

INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  is_active,
  icon,
  composition
)
SELECT
  product_id,
  'Supplément viandes' as option_group,
  option_name,
  1.50 as price_modifier,
  display_order,
  is_active,
  icon,
  composition
FROM france_product_options
WHERE product_id = 554
  AND option_group = 'Viandes'
  AND is_active = true
ORDER BY display_order;

-- Vérification nombre d'insertions
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM france_product_options
  WHERE product_id = 554
    AND option_group = 'Supplément viandes';

  IF v_count != 8 THEN
    RAISE EXCEPTION 'ERREUR: % options créées au lieu de 8', v_count;
  END IF;

  RAISE NOTICE '✅ 8 options "Supplément viandes" créées avec succès';
END $$;

-- =====================================================================
-- PARTIE 3 : MODIFICATION STEPS_CONFIG - Ajout step 6
-- =====================================================================

UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "votre plat",
      "option_groups": ["Plats"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre viande",
      "option_groups": ["Viandes"],
      "required": true,
      "max_selections": 3,
      "conditional_max": {
        "based_on_step": 1,
        "extract_number_from_name": true
      }
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "EXTRAS",
      "option_groups": ["Extras"],
      "required": false,
      "max_selections": 3
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "votre condiments",
      "option_groups": ["Condiments"],
      "required": false,
      "max_selections": 3
    },
    {
      "step": 5,
      "type": "options_selection",
      "prompt": "votre sauces",
      "option_groups": ["Sauces"],
      "required": false,
      "max_selections": 2
    },
    {
      "step": 6,
      "type": "options_selection",
      "prompt": "Supplément viandes : +1,50€",
      "option_groups": ["Supplément viandes"],
      "required": false,
      "max_selections": 5
    }
  ]
}'::jsonb
WHERE id = 554
  AND restaurant_id = 16;

-- Vérification UPDATE
DO $$
DECLARE
  v_nb_steps INTEGER;
BEGIN
  SELECT jsonb_array_length((steps_config::jsonb)->'steps') INTO v_nb_steps
  FROM france_products
  WHERE id = 554 AND restaurant_id = 16;

  IF v_nb_steps != 6 THEN
    RAISE EXCEPTION 'ERREUR: Configuration a % steps au lieu de 6', v_nb_steps;
  END IF;

  RAISE NOTICE '✅ Configuration mise à jour : 6 steps confirmés';
END $$;

-- =====================================================================
-- VÉRIFICATIONS FINALES
-- =====================================================================

-- 1. Afficher les options créées
SELECT
  '✅ OPTIONS SUPPLÉMENT VIANDES' as section,
  id,
  option_name,
  price_modifier,
  display_order
FROM france_product_options
WHERE product_id = 554
  AND option_group = 'Supplément viandes'
ORDER BY display_order;

-- 2. Afficher la configuration finale
SELECT
  '✅ CONFIGURATION FINALE' as section,
  id,
  name,
  workflow_type,
  jsonb_array_length((steps_config::jsonb)->'steps') as nb_steps
FROM france_products
WHERE id = 554
  AND restaurant_id = 16;

-- 3. Vérification totale
SELECT
  '📊 RÉSUMÉ' as section,
  COUNT(*) FILTER (WHERE option_group = 'Viandes') as viandes_base,
  COUNT(*) FILTER (WHERE option_group = 'Supplément viandes') as supplements,
  COUNT(*) as total_options
FROM france_product_options
WHERE product_id = 554
  AND is_active = true;

COMMIT;

-- ========================================================================
-- ✅ SÉCURITÉ GARANTIE:
-- - Protection contre double exécution (DELETE avant INSERT)
-- - Vérifications restaurant_id explicites
-- - Validations à chaque étape
-- - Rollback automatique en cas d'erreur
--
-- RÉSULTAT ATTENDU:
-- ✅ 8 options "Supplément viandes" avec +1.50€
-- ✅ 6 steps dans la configuration TACOS
-- ✅ Aucune régression sur autres restaurants
-- ========================================================================
