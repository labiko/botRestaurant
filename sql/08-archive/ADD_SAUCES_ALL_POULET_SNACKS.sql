-- ========================================================================
-- SCRIPT: Ajout sauces à TOUS les produits POULET & SNACKS
-- Restaurant: Pizza Yolo 77 (ID: 1)
-- Date: 2025-10-17
--
-- OBJECTIF:
-- Ajouter step Sauces (optionnel, max 2) aux 11 produits :
-- - 8 produits simples : Transformer en universal_workflow_v2 avec step Sauces
-- - 3 menus : Ajouter step Sauces + garder step Boisson
-- ========================================================================

BEGIN;

-- =====================================================================
-- PARTIE 1 : LES 8 PRODUITS SIMPLES (sans workflow actuellement)
-- Transformer en universal_workflow_v2 avec SEULEMENT step Sauces
-- =====================================================================

-- 1. TENDERS 1 PIECE (372)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      }
    ]
  }'::json
WHERE id = 372 AND restaurant_id = 1;

-- 2. NUGGETS 4 PIECES (373)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      }
    ]
  }'::json
WHERE id = 373 AND restaurant_id = 1;

-- 3. WINGS 4 PIECES (374)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      }
    ]
  }'::json
WHERE id = 374 AND restaurant_id = 1;

-- 4. DONUTS POULET 1 PIECE (375)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      }
    ]
  }'::json
WHERE id = 375 AND restaurant_id = 1;

-- 5. MOZZA STICK 4 PIECES (376)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      }
    ]
  }'::json
WHERE id = 376 AND restaurant_id = 1;

-- 6. JALAPENOS 4 PIECES (377)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      }
    ]
  }'::json
WHERE id = 377 AND restaurant_id = 1;

-- 7. ONION RINGS 4 PIECES (378)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      }
    ]
  }'::json
WHERE id = 378 AND restaurant_id = 1;

-- 8. POTATOES (379)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      }
    ]
  }'::json
WHERE id = 379 AND restaurant_id = 1;

-- =====================================================================
-- PARTIE 2 : LES 3 MENUS (avec boisson incluse)
-- Ajouter step Sauces + garder step Boisson
-- =====================================================================

-- 9. TENDERS 5 PIECES (380)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "Choisissez votre boisson 33CL incluse",
        "option_groups": ["Boisson 33CL incluse"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json
WHERE id = 380 AND restaurant_id = 1;

-- 10. NUGGETS 10 PIECES (381)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "Choisissez votre boisson 33CL incluse",
        "option_groups": ["Boisson 33CL incluse"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json
WHERE id = 381 AND restaurant_id = 1;

-- 11. WINGS 8 PIECES (382)
UPDATE france_products
SET
  workflow_type = 'universal_workflow_v2',
  steps_config = '{
    "steps": [
      {
        "step": 1,
        "type": "options_selection",
        "prompt": "Choisissez vos sauces (optionnel)",
        "option_groups": ["Sauces"],
        "required": false,
        "max_selections": 2
      },
      {
        "step": 2,
        "type": "options_selection",
        "prompt": "Choisissez votre boisson 33CL incluse",
        "option_groups": ["Boisson 33CL incluse"],
        "required": true,
        "max_selections": 1
      }
    ]
  }'::json
WHERE id = 382 AND restaurant_id = 1;

-- =====================================================================
-- PARTIE 3 : COPIER LES 16 SAUCES VERS LES 11 PRODUITS
-- =====================================================================

-- Copie des sauces pour les IDs 372 à 382
INSERT INTO france_product_options (
  product_id,
  option_group,
  option_name,
  price_modifier,
  display_order,
  group_order,
  is_required,
  is_active,
  icon,
  composition
)
SELECT
  p.id as product_id,
  'Sauces' as option_group,
  s.option_name,
  0.00 as price_modifier,
  s.display_order,
  1 as group_order,
  false as is_required,
  s.is_active,
  s.icon,
  s.composition
FROM france_products p
CROSS JOIN (
  SELECT option_name, display_order, is_active, icon, composition
  FROM france_product_options
  WHERE product_id = 663 AND option_group = 'Sauces'
) s
WHERE p.id IN (372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382)
  AND p.restaurant_id = 1
ON CONFLICT DO NOTHING;

-- Mettre à jour group_order des boissons (Step 2 pour les 3 menus)
UPDATE france_product_options
SET group_order = 2
WHERE product_id IN (380, 381, 382)
  AND option_group = 'Boisson 33CL incluse';

-- Vérification finale
SELECT
  'TOUS LES PRODUITS' as section,
  p.id,
  p.name,
  p.workflow_type,
  COUNT(DISTINCT po.option_group) as nb_groupes
FROM france_products p
LEFT JOIN france_product_options po ON p.id = po.product_id
WHERE p.id IN (372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382)
  AND p.restaurant_id = 1
GROUP BY p.id, p.name, p.workflow_type
ORDER BY p.id;

SELECT
  'OPTIONS PAR PRODUIT' as section,
  p.id,
  p.name,
  po.option_group,
  COUNT(*) as nb_options
FROM france_products p
JOIN france_product_options po ON p.id = po.product_id
WHERE p.id IN (372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382)
  AND p.restaurant_id = 1
GROUP BY p.id, p.name, po.option_group
ORDER BY p.id, po.option_group;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- ✅ 11 produits avec workflow_type = 'universal_workflow_v2'
-- ✅ 8 produits simples : 1 groupe (Sauces - 16 options)
-- ✅ 3 menus : 2 groupes (Sauces - 16 options + Boisson 33CL - 12 options)
-- ✅ Tous peuvent choisir max 2 sauces
-- ========================================================================
