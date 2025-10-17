-- AFFICHAGE DE TOUS LES PRODUITS DE LA CATÉGORIE 🍗 POULET & SNACKS
-- Structure analysée: botResto\database_fr_structure.sql

SELECT 
    p.id,
    p.name as nom_produit,
    p.description,
    p.composition,
    p.product_type as type_produit,
    p.price_on_site_base as prix_sur_place,
    p.price_delivery_base as prix_livraison,
    p.workflow_type,
    p.requires_steps,
    p.display_order as ordre_affichage,
    p.is_active as actif,
    COUNT(po.id) as nb_options
FROM france_products p
JOIN france_menu_categories c ON c.id = p.category_id
LEFT JOIN france_product_options po ON po.product_id = p.id
WHERE c.name = '🍗 POULET & SNACKS'
   OR c.slug = 'poulet-snacks'
   OR c.slug = 'poulet_snacks'
   OR c.slug = 'chicken-snacks'
   OR c.slug = 'snacks'
GROUP BY 
    p.id, p.name, p.description, p.composition, 
    p.product_type, p.price_on_site_base, p.price_delivery_base,
    p.workflow_type, p.requires_steps, p.display_order, p.is_active
ORDER BY p.display_order, p.name;