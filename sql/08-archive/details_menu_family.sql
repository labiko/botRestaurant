-- DÉTAILS COMPLETS MENU FAMILY - 29.90€
-- Basé sur les données trouvées dans les scripts existants

SELECT 'MENU FAMILY - DONNÉES TROUVÉES' as section;

-- COMPOSITION EXACTE DU MENU FAMILY (29.90€) :
/*
6 Wings + 6 Tenders + 6 Nuggets + 2 Frites + 2 Mozza Stick + 2 Donuts + 4 Onion Rings + 1 Maxi Boisson

DÉTAIL DES COMPOSANTS :
- 6 Wings (pièces)
- 6 Tenders (pièces)  
- 6 Nuggets (pièces)
- 2 Frites (portions)
- 2 Mozza Sticks (pièces)
- 2 Donuts (pièces)
- 4 Onion Rings (pièces)
- 1 Maxi Boisson (pièce)

PRIX :
- Sur place : 29.90€
- Livraison : 31.90€ (+2€)

TYPE :
- product_type : 'composite'
- workflow_type : 'composite_selection' 
- requires_steps : true

CATÉGORIE :
- POULET & SNACKS (slug: poulet-snacks)

POSITION :
- display_order : 20 (après les autres produits)
*/

-- Vérifier si MENU FAMILY existe déjà
SELECT 
    'VÉRIFICATION EXISTENCE' as info,
    p.id,
    p.name,
    p.product_type,
    p.price_on_site_base,
    p.price_delivery_base,
    p.composition,
    p.workflow_type,
    p.requires_steps
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.name = 'POULET & SNACKS'
AND p.name = 'MENU FAMILY';

-- Vérifier les composants du menu family
SELECT 
    'COMPOSANTS MENU FAMILY' as info,
    ci.component_name,
    ci.quantity,
    ci.unit
FROM france_composite_items ci
JOIN france_products p ON p.id = ci.composite_product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE c.name = 'POULET & SNACKS'
AND p.name = 'MENU FAMILY'
ORDER BY ci.id;