-- ========================================================================
-- INSERTION SAUCES TORTILLAS - COMPLÉMENT (11 produits restants)
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Objectif : Ajouter les 13 sauces pour les 11 produits TORTILLAS restants
-- Total: 143 options (13 sauces × 11 produits)
-- ========================================================================

BEGIN;

-- ========================================================================
-- SAUCES POUR TORTILLA TANDOORI (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TANDOORI' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- SAUCES POUR TORTILLA MIX TENDERS (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA MIX TENDERS' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- SAUCES POUR TORTILLA BOURSIN (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOURSIN' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- SAUCES POUR TORTILLA VACHE QUI RIT (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA VACHE QUI RIT' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- SAUCES POUR TORTILLA DINA (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA DINA' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- SAUCES POUR TORTILLA BOX MASTER (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA BOX MASTER' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- SAUCES POUR TORTILLA SPECIAL (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA SPECIAL' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- SAUCES POUR TORTILLA RUSTIK (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA RUSTIK' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- SAUCES POUR TORTILLA TRIPLE X (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA TRIPLE X' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- SAUCES POUR TORTILLA B SIX (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA B SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- SAUCES POUR TORTILLA C SIX (13 sauces)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ALGERIENNE', 'Sauce algérienne', 0.00, '🌶️', 1, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MAYONNAISE', 'Sauce mayonnaise', 0.00, '🥚', 2, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'KETCHUP', 'Sauce ketchup', 0.00, '🍅', 3, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'HARISSA', 'Sauce harissa', 0.00, '🔥', 4, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BARBECUE', 'Sauce barbecue', 0.00, '🍖', 5, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BLANCHE', 'Sauce blanche', 0.00, '⚪', 6, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'SAMOURAI', 'Sauce samouraï', 0.00, '⚔️', 7, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'POIVRE', 'Sauce poivre', 0.00, '⚫', 8, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'FISH TO FISH', 'Sauce fish to fish', 0.00, '🐟', 9, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'MOUTARDE', 'Sauce moutarde', 0.00, '🟡', 10, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'BIGGY BURGER', 'Sauce biggy burger', 0.00, '🍔', 11, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'CHILI THAI', 'Sauce chili thaï', 0.00, '🌶️', 12, true),
((SELECT id FROM france_products WHERE name = 'TORTILLA C SIX' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Sauces', 'ANDALOUSE', 'Sauce andalouse', 0.00, '🌶️', 13, true);

-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier le nombre de sauces par produit (doit être 13 partout)
SELECT
  p.name as produit,
  COUNT(*) as nb_sauces
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'tortillas'
  AND po.option_group = 'Sauces'
GROUP BY p.name, p.display_order
ORDER BY p.display_order;

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 143 options de sauces ajoutées (13 sauces × 11 produits)
-- Total sauces TORTILLAS: 156 options (13 × 12 produits incluant CURRY)
-- ========================================================================
