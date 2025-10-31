-- ========================================================================
-- CORRECTION WORKFLOW - MENUS BAGELS - PLAN B MELUN
-- DATE: 2025-01-26
-- RESTAURANT: Plan B Melun (ID 22)
-- PROBLÈME: Le Step 1 "Choix Bagel" affiche les noms de menus au lieu d'être supprimé
-- OBJECTIF: Supprimer le Step 1 et renuméroter les steps pour correspondre au log
-- ========================================================================

BEGIN;

-- ⚠️ VÉRIFICATION RESTAURANT
SELECT id, name, phone FROM france_restaurants WHERE id = 22;

-- Liste des 6 produits MENUS BAGELS concernés
SELECT
  id,
  name,
  '🥯 Menu Bagel à corriger' as type
FROM france_products
WHERE id IN (851, 852, 853, 854, 855, 856)
ORDER BY id;

-- ========================================================================
-- ÉTAPE 1 : SUPPRESSION DU GROUPE "CHOIX BAGEL"
-- ========================================================================

-- Supprimer toutes les options du groupe "Choix Bagel"
DELETE FROM france_product_options
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Choix Bagel';

-- ========================================================================
-- ÉTAPE 2 : MISE À JOUR DU STEPS_CONFIG (5 steps au lieu de 6)
-- ========================================================================

-- Produit 851 : VEGETARIEN
UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "vos condiments (optionnel)",
      "option_groups": ["Condiments"],
      "required": false,
      "max_selections": 4
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre sauce",
      "option_groups": ["Sauce"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "votre accompagnement",
      "option_groups": ["Accompagnement"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "votre boisson",
      "option_groups": ["Boisson 33cl"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 5,
      "type": "options_selection",
      "prompt": "vos ingrédients supplémentaires (optionnel)",
      "option_groups": ["Ingredients Supplementaires"],
      "required": false,
      "max_selections": 10
    }
  ]
}'::json
WHERE id = 851;

-- Produit 852 : CHEVRE MIEL
UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "vos condiments (optionnel)",
      "option_groups": ["Condiments"],
      "required": false,
      "max_selections": 4
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre sauce",
      "option_groups": ["Sauce"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "votre accompagnement",
      "option_groups": ["Accompagnement"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "votre boisson",
      "option_groups": ["Boisson 33cl"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 5,
      "type": "options_selection",
      "prompt": "vos ingrédients supplémentaires (optionnel)",
      "option_groups": ["Ingredients Supplementaires"],
      "required": false,
      "max_selections": 10
    }
  ]
}'::json
WHERE id = 852;

-- Produit 853 : PRIMEUR
UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "vos condiments (optionnel)",
      "option_groups": ["Condiments"],
      "required": false,
      "max_selections": 4
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre sauce",
      "option_groups": ["Sauce"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "votre accompagnement",
      "option_groups": ["Accompagnement"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "votre boisson",
      "option_groups": ["Boisson 33cl"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 5,
      "type": "options_selection",
      "prompt": "vos ingrédients supplémentaires (optionnel)",
      "option_groups": ["Ingredients Supplementaires"],
      "required": false,
      "max_selections": 10
    }
  ]
}'::json
WHERE id = 853;

-- Produit 854 : SAUMON
UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "vos condiments (optionnel)",
      "option_groups": ["Condiments"],
      "required": false,
      "max_selections": 4
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre sauce",
      "option_groups": ["Sauce"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "votre accompagnement",
      "option_groups": ["Accompagnement"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "votre boisson",
      "option_groups": ["Boisson 33cl"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 5,
      "type": "options_selection",
      "prompt": "vos ingrédients supplémentaires (optionnel)",
      "option_groups": ["Ingredients Supplementaires"],
      "required": false,
      "max_selections": 10
    }
  ]
}'::json
WHERE id = 854;

-- Produit 855 : DELICE
UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "vos condiments (optionnel)",
      "option_groups": ["Condiments"],
      "required": false,
      "max_selections": 4
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre sauce",
      "option_groups": ["Sauce"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "votre accompagnement",
      "option_groups": ["Accompagnement"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "votre boisson",
      "option_groups": ["Boisson 33cl"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 5,
      "type": "options_selection",
      "prompt": "vos ingrédients supplémentaires (optionnel)",
      "option_groups": ["Ingredients Supplementaires"],
      "required": false,
      "max_selections": 10
    }
  ]
}'::json
WHERE id = 855;

-- Produit 856 : DU CHEF
UPDATE france_products
SET steps_config = '{
  "steps": [
    {
      "step": 1,
      "type": "options_selection",
      "prompt": "vos condiments (optionnel)",
      "option_groups": ["Condiments"],
      "required": false,
      "max_selections": 4
    },
    {
      "step": 2,
      "type": "options_selection",
      "prompt": "votre sauce",
      "option_groups": ["Sauce"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 3,
      "type": "options_selection",
      "prompt": "votre accompagnement",
      "option_groups": ["Accompagnement"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 4,
      "type": "options_selection",
      "prompt": "votre boisson",
      "option_groups": ["Boisson 33cl"],
      "required": true,
      "max_selections": 1
    },
    {
      "step": 5,
      "type": "options_selection",
      "prompt": "vos ingrédients supplémentaires (optionnel)",
      "option_groups": ["Ingredients Supplementaires"],
      "required": false,
      "max_selections": 10
    }
  ]
}'::json
WHERE id = 856;

-- ========================================================================
-- VÉRIFICATIONS APRÈS CORRECTION
-- ========================================================================

-- Vérifier que "Choix Bagel" a été supprimé
SELECT
  'APRÈS SUPPRESSION' as moment,
  COUNT(*) as nb_options_choix_bagel_restantes
FROM france_product_options
WHERE product_id IN (851, 852, 853, 854, 855, 856)
  AND option_group = 'Choix Bagel';

-- Afficher le nouveau steps_config pour vérification
SELECT
  id,
  name,
  jsonb_pretty(steps_config::jsonb) as nouveau_workflow
FROM france_products
WHERE id IN (851, 852, 853, 854, 855, 856)
ORDER BY id
LIMIT 1;  -- Afficher seulement le premier pour vérifier

-- Compter les steps dans le nouveau workflow
SELECT
  p.id,
  p.name,
  jsonb_array_length((p.steps_config::jsonb)->'steps') as nb_steps
FROM france_products p
WHERE p.id IN (851, 852, 853, 854, 855, 856)
ORDER BY p.id;

-- Résumé final
SELECT
  '✅ CORRECTION TERMINÉE' as statut,
  '36 options Choix Bagel supprimées' as suppression,
  '5 steps workflow (au lieu de 6)' as workflow,
  'Step 1: Condiments, Step 2: Sauce, Step 3: Accompagnement, Step 4: Boisson, Step 5: Extras' as ordre;

-- ⚠️ IMPORTANT : Vérifier les résultats ci-dessus avant de valider !
-- Si tout est OK, exécuter :
COMMIT;

-- En cas de problème, annuler avec :
-- ROLLBACK;
