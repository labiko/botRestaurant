-- ========================================================================
-- SCRIPT: Mettre TACOS en première position pour Le Nouveau OCV
-- Restaurant: Le Nouveau OCV Moissy (ID: 16)
-- Date: 2025-10-17
--
-- PROBLÈME:
-- TACOS est en position 2, mais doit être affiché en premier
-- BOISSONS est en position 1
--
-- SOLUTION:
-- TACOS → Position 1
-- Tout le reste décalé (positions 2-19)
-- BOISSONS → Position 20 (dernier)
-- ========================================================================

BEGIN;

-- =====================================================================
-- VÉRIFICATION PRÉALABLE
-- =====================================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM france_menu_categories
  WHERE restaurant_id = 16;

  IF v_count != 21 THEN
    RAISE EXCEPTION 'ERREUR: Restaurant OCV devrait avoir 21 catégories, trouvé %', v_count;
  END IF;

  RAISE NOTICE 'Vérification OK: 21 catégories trouvées pour OCV';
END $$;

-- =====================================================================
-- RÉORGANISATION : TACOS EN PREMIER, BOISSONS EN DERNIER
-- =====================================================================

-- Position 1: TACOS (était en 2)
UPDATE france_menu_categories SET display_order = 1 WHERE id = 102 AND restaurant_id = 16;

-- Position 2: MAKLOUBS (était en 3)
UPDATE france_menu_categories SET display_order = 2 WHERE id = 103 AND restaurant_id = 16;

-- Position 3: SALADES (était en 4)
UPDATE france_menu_categories SET display_order = 3 WHERE id = 104 AND restaurant_id = 16;

-- Position 4: PANINIS (était en 5)
UPDATE france_menu_categories SET display_order = 4 WHERE id = 105 AND restaurant_id = 16;

-- Position 5: BOXES (était en 6)
UPDATE france_menu_categories SET display_order = 5 WHERE id = 106 AND restaurant_id = 16;

-- Position 6: DESSERTS (était en 7)
UPDATE france_menu_categories SET display_order = 6 WHERE id = 107 AND restaurant_id = 16;

-- Position 7: GLACES (était en 8)
UPDATE france_menu_categories SET display_order = 7 WHERE id = 108 AND restaurant_id = 16;

-- Position 8: NOS CHEESE BOWL (était en 9)
UPDATE france_menu_categories SET display_order = 8 WHERE id = 109 AND restaurant_id = 16;

-- Position 9: MENU KIDS (était en 10)
UPDATE france_menu_categories SET display_order = 9 WHERE id = 110 AND restaurant_id = 16;

-- Position 10: MENU SOLO (était en 11)
UPDATE france_menu_categories SET display_order = 10 WHERE id = 111 AND restaurant_id = 16;

-- Position 11: MENU FAMILY (était en 12)
UPDATE france_menu_categories SET display_order = 11 WHERE id = 112 AND restaurant_id = 16;

-- Position 12: SMASH BURGERS (était en 13)
UPDATE france_menu_categories SET display_order = 12 WHERE id = 113 AND restaurant_id = 16;

-- Position 13: PETIT CHEESE BURGERS (était en 14)
UPDATE france_menu_categories SET display_order = 13 WHERE id = 114 AND restaurant_id = 16;

-- Position 14: BURGERS (était en 15)
UPDATE france_menu_categories SET display_order = 14 WHERE id = 115 AND restaurant_id = 16;

-- Position 15: CROUSTY (était en 16)
UPDATE france_menu_categories SET display_order = 15 WHERE id = 116 AND restaurant_id = 16;

-- Position 16: SANDWICHS (était en 17)
UPDATE france_menu_categories SET display_order = 16 WHERE id = 117 AND restaurant_id = 16;

-- Position 17: Pizzas Base Tomate (était en 18)
UPDATE france_menu_categories SET display_order = 17 WHERE id = 118 AND restaurant_id = 16;

-- Position 18: Pizzas Base Crème (était en 19)
UPDATE france_menu_categories SET display_order = 18 WHERE id = 119 AND restaurant_id = 16;

-- Position 19: Pizzas Base Spéciale (était en 20)
UPDATE france_menu_categories SET display_order = 19 WHERE id = 120 AND restaurant_id = 16;

-- Position 20: BOISSONS (était en 1) → DERNIER
UPDATE france_menu_categories SET display_order = 20 WHERE id = 101 AND restaurant_id = 16;

-- Position 99: SAUCES (inactive, reste en 99)
UPDATE france_menu_categories SET display_order = 99 WHERE id = 130 AND restaurant_id = 16;

-- =====================================================================
-- VÉRIFICATION
-- =====================================================================

SELECT
  '✅ NOUVEL ORDRE CATÉGORIES OCV' as section,
  display_order as position,
  name,
  is_active
FROM france_menu_categories
WHERE restaurant_id = 16
  AND is_active = true
ORDER BY display_order;

-- Vérifier TACOS est bien en premier
DO $$
DECLARE
  v_first_category VARCHAR(255);
  v_last_category VARCHAR(255);
BEGIN
  SELECT name INTO v_first_category
  FROM france_menu_categories
  WHERE restaurant_id = 16 AND is_active = true
  ORDER BY display_order
  LIMIT 1;

  SELECT name INTO v_last_category
  FROM france_menu_categories
  WHERE restaurant_id = 16 AND is_active = true
  ORDER BY display_order DESC
  LIMIT 1;

  IF v_first_category != 'TACOS' THEN
    RAISE EXCEPTION 'ERREUR: TACOS n''est pas en première position (trouvé: %)', v_first_category;
  END IF;

  IF v_last_category != 'BOISSONS' THEN
    RAISE EXCEPTION 'ERREUR: BOISSONS n''est pas en dernière position (trouvé: %)', v_last_category;
  END IF;

  RAISE NOTICE '✅ TACOS en première position';
  RAISE NOTICE '✅ BOISSONS en dernière position';
END $$;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU:
-- 1. 🌮 TACOS
-- 2. 🥔 MAKLOUBS
-- 3. 🥗 SALADES
-- 4. 🥪 PANINIS
-- 5. 🍨 BOXES
-- 6. 🍰 DESSERTS
-- 7. 🥞 GLACES
-- 8. 🍗 NOS CHEESE BOWL
-- 9. 🧃 MENU KIDS
-- 10. 🍝 MENU SOLO
-- 11. 👪 MENU FAMILY
-- 12. 🍔 SMASH BURGERS
-- 13. 🍔 PETIT CHEESE BURGERS
-- 14. 🍔 BURGERS
-- 15. 🍚 CROUSTY
-- 16. 🥪 SANDWICHS
-- 17. 🍅 Pizzas Base Tomate
-- 18. 🥛 Pizzas Base Crème
-- 19. 🌶 Pizzas Base Spéciale
-- 20. 🥤 BOISSONS
-- ========================================================================
