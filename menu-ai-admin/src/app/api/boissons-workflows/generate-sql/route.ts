import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const { restaurant_id, product_ids } = await request.json();

    if (!restaurant_id || !product_ids || product_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'restaurant_id et product_ids requis' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClientForRequest(request);

    // 1. Récupérer les boissons 33cl de la catégorie Boissons
    const { data: boissonsCategory, error: categoryError } = await supabase
      .from('france_menu_categories')
      .select('id')
      .eq('restaurant_id', restaurant_id)
      .ilike('name', '%boisson%')
      .single();

    if (categoryError || !boissonsCategory) {
      return NextResponse.json(
        { success: false, error: 'Catégorie Boissons non trouvée' },
        { status: 404 }
      );
    }

    // 2. Récupérer les boissons 33cl
    const { data: boissons33cl, error: boissonsError } = await supabase
      .from('france_products')
      .select('id, name, price_on_site_base, icon')
      .eq('restaurant_id', restaurant_id)
      .eq('category_id', boissonsCategory.id)
      .ilike('name', '%33 cl%')
      .order('name');

    if (boissonsError) {
      return NextResponse.json(
        { success: false, error: boissonsError.message },
        { status: 500 }
      );
    }

    if (!boissons33cl || boissons33cl.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune boisson 33cl trouvée' },
        { status: 404 }
      );
    }

    // 3. Récupérer les informations des produits sélectionnés
    const { data: products, error: productsError } = await supabase
      .from('france_products')
      .select(`
        id,
        name,
        options:france_product_options!inner(
          id,
          option_group,
          option_name,
          group_order
        )
      `)
      .in('id', product_ids)
      .eq('options.option_group', 'Boissons');

    if (productsError) {
      return NextResponse.json(
        { success: false, error: productsError.message },
        { status: 500 }
      );
    }

    // 4. Générer le script de vérification
    let verificationSQL = `-- ========================================\n`;
    verificationSQL += `-- SCRIPT DE VÉRIFICATION\n`;
    verificationSQL += `-- Restaurant ID: ${restaurant_id}\n`;
    verificationSQL += `-- Date: ${new Date().toISOString().split('T')[0]}\n`;
    verificationSQL += `-- Produits concernés: ${product_ids.length}\n`;
    verificationSQL += `-- ========================================\n\n`;

    for (const product of (products || [])) {
      verificationSQL += `-- Produit: ${product.name} (ID: ${product.id})\n`;
      verificationSQL += `SELECT\n`;
      verificationSQL += `  '${product.name}' as produit,\n`;
      verificationSQL += `  po.option_name,\n`;
      verificationSQL += `  po.price_modifier,\n`;
      verificationSQL += `  po.display_order\n`;
      verificationSQL += `FROM france_product_options po\n`;
      verificationSQL += `WHERE po.product_id = ${product.id}\n`;
      verificationSQL += `  AND po.option_group = 'Boissons'\n`;
      verificationSQL += `ORDER BY po.display_order;\n\n`;
    }

    // 5. Générer le script d'exécution
    let executionSQL = `-- ========================================\n`;
    executionSQL += `-- SCRIPT D'EXÉCUTION - REMPLACEMENT BOISSONS\n`;
    executionSQL += `-- Restaurant ID: ${restaurant_id}\n`;
    executionSQL += `-- Date: ${new Date().toISOString().split('T')[0]}\n`;
    executionSQL += `-- Produits concernés: ${product_ids.length}\n`;
    executionSQL += `-- Boissons 33cl: ${boissons33cl.length}\n`;
    executionSQL += `-- ⚠️ ATTENTION: Ce script va supprimer et remplacer les boissons\n`;
    executionSQL += `-- ========================================\n\n`;
    executionSQL += `BEGIN;\n\n`;

    for (const product of (products || [])) {
      const groupOrder = product.options?.[0]?.group_order || 2;

      executionSQL += `-- ==========================================\n`;
      executionSQL += `-- Produit: ${product.name} (ID: ${product.id})\n`;
      executionSQL += `-- ==========================================\n\n`;

      // DELETE
      executionSQL += `-- Supprimer les anciennes boissons\n`;
      executionSQL += `DELETE FROM france_product_options\n`;
      executionSQL += `WHERE product_id = ${product.id}\n`;
      executionSQL += `  AND option_group = 'Boissons';\n\n`;

      // INSERT
      executionSQL += `-- Insérer les nouvelles boissons 33cl\n`;
      boissons33cl.forEach((boisson, index) => {
        executionSQL += `INSERT INTO france_product_options (\n`;
        executionSQL += `  product_id,\n`;
        executionSQL += `  option_group,\n`;
        executionSQL += `  option_name,\n`;
        executionSQL += `  price_modifier,\n`;
        executionSQL += `  display_order,\n`;
        executionSQL += `  group_order,\n`;
        executionSQL += `  is_required,\n`;
        executionSQL += `  is_active,\n`;
        executionSQL += `  icon\n`;
        executionSQL += `) VALUES (\n`;
        executionSQL += `  ${product.id},\n`;
        executionSQL += `  'Boissons',\n`;
        executionSQL += `  '${boisson.name.replace(/'/g, "''")}',\n`;
        executionSQL += `  0,\n`; // Prix = 0€ (inclus dans le menu)
        executionSQL += `  ${index + 1},\n`;
        executionSQL += `  ${groupOrder},\n`;
        executionSQL += `  true,\n`;
        executionSQL += `  true,\n`;
        executionSQL += `  ${boisson.icon ? `'${boisson.icon}'` : 'NULL'}\n`;
        executionSQL += `);\n\n`;
      });
    }

    executionSQL += `-- Vérification finale\n`;
    executionSQL += `SELECT\n`;
    executionSQL += `  p.name as produit,\n`;
    executionSQL += `  COUNT(po.id) as nb_boissons\n`;
    executionSQL += `FROM france_products p\n`;
    executionSQL += `LEFT JOIN france_product_options po ON po.product_id = p.id AND po.option_group = 'Boissons'\n`;
    executionSQL += `WHERE p.id IN (${product_ids.join(', ')})\n`;
    executionSQL += `GROUP BY p.id, p.name;\n\n`;

    executionSQL += `COMMIT;\n`;
    executionSQL += `-- En cas d'erreur : ROLLBACK;\n`;

    return NextResponse.json({
      success: true,
      verification: verificationSQL,
      execution: executionSQL,
      boissons_count: boissons33cl.length,
      products_count: product_ids.length
    });

  } catch (error: any) {
    console.error('Erreur API generate-sql:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
