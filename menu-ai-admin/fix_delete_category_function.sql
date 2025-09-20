-- 🔧 CORRECTION FONCTION SUPPRESSION CATÉGORIE
-- ===============================================
-- Bug : La suppression supprime les options de tous les produits
-- Fix : Filtrage strict par category_id pour ne supprimer que les options des produits de la catégorie ciblée

-- Supprimer l'ancienne fonction défaillante (si elle existe)
DROP FUNCTION IF EXISTS public.delete_category_complete(integer, integer);

-- Créer la nouvelle fonction sécurisée avec filtrage correct
CREATE OR REPLACE FUNCTION public.delete_category_complete(
  p_category_id INTEGER,
  p_restaurant_id INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_category_name VARCHAR;
  v_deleted_products INTEGER := 0;
  v_deleted_options INTEGER := 0;
  v_deleted_composite_items INTEGER := 0;
  v_products_to_delete INTEGER[];
BEGIN
  -- 🔒 SÉCURITÉ : Vérifier que la catégorie appartient au restaurant
  SELECT name INTO v_category_name
  FROM france_menu_categories
  WHERE id = p_category_id AND restaurant_id = p_restaurant_id;

  IF v_category_name IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Catégorie non trouvée ou accès interdit'
    );
  END IF;

  -- 🎯 ÉTAPE 1: Récupérer UNIQUEMENT les produits de cette catégorie
  SELECT ARRAY(
    SELECT id
    FROM france_products
    WHERE category_id = p_category_id
      AND restaurant_id = p_restaurant_id
  ) INTO v_products_to_delete;

  -- 📊 LOG: Produits qui vont être supprimés
  RAISE NOTICE '🗑️ Produits à supprimer pour catégorie % (restaurant %): %', p_category_id, p_restaurant_id, v_products_to_delete;

  -- 🔥 ÉTAPE 2: Supprimer les options UNIQUEMENT pour les produits de cette catégorie
  DELETE FROM france_product_options
  WHERE product_id = ANY(v_products_to_delete);

  GET DIAGNOSTICS v_deleted_options = ROW_COUNT;
  RAISE NOTICE '✅ Options supprimées: %', v_deleted_options;

  -- 🔥 ÉTAPE 3: Supprimer les éléments composites UNIQUEMENT pour les produits de cette catégorie
  DELETE FROM france_composite_items
  WHERE composite_product_id = ANY(v_products_to_delete);

  GET DIAGNOSTICS v_deleted_composite_items = ROW_COUNT;
  RAISE NOTICE '✅ Éléments composites supprimés: %', v_deleted_composite_items;

  -- 🔥 ÉTAPE 4: Supprimer les produits de cette catégorie
  DELETE FROM france_products
  WHERE category_id = p_category_id
    AND restaurant_id = p_restaurant_id;

  GET DIAGNOSTICS v_deleted_products = ROW_COUNT;
  RAISE NOTICE '✅ Produits supprimés: %', v_deleted_products;

  -- 🔥 ÉTAPE 5: Supprimer la catégorie
  DELETE FROM france_menu_categories
  WHERE id = p_category_id
    AND restaurant_id = p_restaurant_id;

  RAISE NOTICE '✅ Catégorie "%s" supprimée complètement', v_category_name;

  -- 📊 Retourner le résultat détaillé
  RETURN json_build_object(
    'success', true,
    'message', format('Catégorie "%s" supprimée avec succès', v_category_name),
    'deleted', json_build_object(
      'category', v_category_name,
      'products', v_deleted_products,
      'options', v_deleted_options,
      'composite_items', v_deleted_composite_items
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    -- 🚨 Rollback automatique en cas d'erreur
    RAISE NOTICE '❌ Erreur suppression catégorie: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', format('Erreur lors de la suppression: %s', SQLERRM)
    );
END;
$$;

-- 🔐 Accorder les permissions
GRANT EXECUTE ON FUNCTION public.delete_category_complete(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.delete_category_complete(INTEGER, INTEGER) TO authenticated;

-- ✅ Test de sécurité de la fonction
-- Cette requête permet de vérifier que la fonction filtre bien par catégorie
-- SELECT public.delete_category_complete(1, 1); -- TEST: remplacer par de vraies valeurs

-- 📝 NOTES IMPORTANTES:
-- 1. La fonction utilise maintenant v_products_to_delete pour ne supprimer que les bonnes options
-- 2. Filtrage strict par restaurant_id ET category_id partout
-- 3. Logs détaillés pour debug (RAISE NOTICE)
-- 4. Transaction implicite : tout réussit ou tout échoue
-- 5. Plus de suppression d'options d'autres catégories !