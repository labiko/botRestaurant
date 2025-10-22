#!/usr/bin/env python3
"""
Générateur de script SQL pour les ingrédients supplémentaires TORTILLAS
Crée 264 insertions (22 ingrédients × 12 produits)
"""

# Liste des 12 produits TORTILLAS
PRODUITS = [
    'TORTILLA CURRY',
    'TORTILLA TANDOORI',
    'TORTILLA MIX TENDERS',
    'TORTILLA BOURSIN',
    'TORTILLA VACHE QUI RIT',
    'TORTILLA DINA',
    'TORTILLA BOX MASTER',
    'TORTILLA SPECIAL',
    'TORTILLA RUSTIK',
    'TORTILLA TRIPLE X',
    'TORTILLA B SIX',
    'TORTILLA C SIX'
]

# Les 22 ingrédients supplémentaires
INGREDIENTS = [
    # LÉGUMES (1.00€)
    {'name': 'oignons rouges', 'desc': 'Oignons rouges supplémentaires', 'price': 1.00, 'icon': '🧅'},
    {'name': 'olives', 'desc': 'Olives supplémentaires', 'price': 1.00, 'icon': '🫒'},
    {'name': 'poivrons', 'desc': 'Poivrons supplémentaires', 'price': 1.00, 'icon': '🫑'},
    {'name': 'salade', 'desc': 'Salade supplémentaire', 'price': 1.00, 'icon': '🥗'},
    {'name': 'tomates', 'desc': 'Tomates supplémentaires', 'price': 1.00, 'icon': '🍅'},
    # VIANDES/POISSONS
    {'name': 'bacon', 'desc': 'Bacon supplémentaire', 'price': 1.50, 'icon': '🥓'},
    {'name': 'crevettes', 'desc': 'Crevettes supplémentaires', 'price': 1.50, 'icon': '🦐'},
    {'name': 'escalope', 'desc': 'Escalope supplémentaire', 'price': 1.50, 'icon': '🍗'},
    {'name': 'oeuf', 'desc': 'Œuf supplémentaire', 'price': 1.50, 'icon': '🥚'},
    {'name': 'poulet', 'desc': 'Poulet supplémentaire', 'price': 1.50, 'icon': '🍗'},
    {'name': 'poulet curry', 'desc': 'Poulet curry supplémentaire', 'price': 1.50, 'icon': '🍛'},
    {'name': 'poulet tandoori', 'desc': 'Poulet tandoori supplémentaire', 'price': 1.50, 'icon': '🌶️'},
    {'name': 'saumon', 'desc': 'Saumon supplémentaire', 'price': 1.50, 'icon': '🐟'},
    {'name': 'steak 120gr', 'desc': 'Steak 120gr supplémentaire', 'price': 2.00, 'icon': '🥩'},
    {'name': 'steak 90gr', 'desc': 'Steak 90gr supplémentaire', 'price': 2.00, 'icon': '🥩'},
    {'name': 'tenders', 'desc': 'Tenders supplémentaires', 'price': 1.50, 'icon': '🍗'},
    # FROMAGES (1.00€)
    {'name': 'boursin', 'desc': 'Boursin supplémentaire', 'price': 1.00, 'icon': '🧀'},
    {'name': 'cheddar', 'desc': 'Cheddar supplémentaire', 'price': 1.00, 'icon': '🧀'},
    {'name': 'chèvre', 'desc': 'Chèvre supplémentaire', 'price': 1.00, 'icon': '🐐'},
    {'name': 'mozzarella', 'desc': 'Mozzarella supplémentaire', 'price': 1.00, 'icon': '🧀'},
    {'name': 'raclette', 'desc': 'Raclette supplémentaire', 'price': 1.00, 'icon': '🧀'},
    {'name': 'reblochon', 'desc': 'Reblochon supplémentaire', 'price': 1.00, 'icon': '🧀'}
]

def generate_sql():
    """Génère le script SQL complet"""

    sql = """-- ========================================================================
-- INSERTION INGRÉDIENTS SUPPLÉMENTAIRES TORTILLAS - TOUS LES PRODUITS (COMPLET)
-- DATE: 2025-10-21
-- ========================================================================
-- Restaurant: Plan B Melun (id=22)
-- Objectif : Ajouter les 22 ingrédients supplémentaires pour tous les 12 produits TORTILLAS
-- Total: 264 options (22 ingrédients × 12 produits)
-- ========================================================================
-- Généré automatiquement par generate_tortillas_ingredients.py
-- ========================================================================

BEGIN;

"""

    for produit in PRODUITS:
        sql += f"""-- ========================================================================
-- INGRÉDIENTS SUPPLÉMENTAIRES POUR {produit} (22 options)
-- ========================================================================
INSERT INTO france_product_options (product_id, option_group, option_name, composition, price_modifier, icon, display_order, is_active) VALUES
"""

        lines = []
        for idx, ing in enumerate(INGREDIENTS, 1):
            line = f"((SELECT id FROM france_products WHERE name = '{produit}' AND category_id = (SELECT id FROM france_menu_categories WHERE slug = 'tortillas' AND restaurant_id = 22)), 'Ingredients Supplementaires', '{ing['name']}', '{ing['desc']}', {ing['price']:.2f}, '{ing['icon']}', {idx}, true)"
            lines.append(line)

        sql += ",\n".join(lines) + ";\n\n"

    sql += """-- ========================================================================
-- VÉRIFICATIONS
-- ========================================================================

-- Vérifier le nombre d'ingrédients par produit (doit être 22 partout)
SELECT
  p.name as produit,
  COUNT(*) as nb_ingredients
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'tortillas'
  AND po.option_group = 'Ingredients Supplementaires'
GROUP BY p.name, p.display_order
ORDER BY p.display_order;

-- Vérifier le total (doit être 264)
SELECT COUNT(*) as total_ingredients, '264 attendu' AS verification
FROM france_product_options po
JOIN france_products p ON p.id = po.product_id
JOIN france_menu_categories c ON c.id = p.category_id
WHERE p.restaurant_id = 22
  AND c.slug = 'tortillas'
  AND po.option_group = 'Ingredients Supplementaires';

COMMIT;

-- ========================================================================
-- RÉSULTAT ATTENDU :
-- ========================================================================
-- 264 options d'ingrédients supplémentaires ajoutées (22 × 12 produits)
--
-- Total options TORTILLAS après ce script :
-- - Choix Pain: 24 options (2 × 12)
-- - Sauces: 156 options (13 × 12)
-- - Ingrédients Supplémentaires: 264 options (22 × 12)
-- TOTAL: 444 options
-- ========================================================================
"""

    return sql

if __name__ == '__main__':
    # Générer et afficher le SQL
    sql_output = generate_sql()

    # Écrire dans un fichier
    output_file = 'INSERT_TORTILLAS_INGREDIENTS_SUPPLEMENT_COMPLET.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql_output)

    print(f"[OK] Script SQL genere : {output_file}")
    print(f"Total : 264 insertions (22 ingredients x 12 produits)")
    print(f"Taille : {len(sql_output)} caracteres")
