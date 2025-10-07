import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClientForRequest } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurant_id = searchParams.get('restaurant_id');

    if (!restaurant_id) {
      return NextResponse.json(
        { success: false, error: 'restaurant_id requis' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClientForRequest(request);

    // Récupérer tous les produits avec step "Sauces" dans leur configuration
    const { data: products, error } = await supabase.rpc('get_products_with_sauces_step', {
      p_restaurant_id: parseInt(restaurant_id)
    });

    if (error) {
      // Si la fonction RPC n'existe pas, utiliser une requête directe
      console.log('RPC non trouvée, utilisation requête directe');

      const { data: productsData, error: queryError } = await supabase
        .from('france_products')
        .select(`
          id,
          name,
          steps_config,
          category:france_menu_categories!inner(name),
          options:france_product_options(id, option_group)
        `)
        .eq('restaurant_id', parseInt(restaurant_id))
        .not('steps_config', 'is', null);

      if (queryError) {
        return NextResponse.json(
          { success: false, error: queryError.message },
          { status: 500 }
        );
      }

      // Filtrer les produits qui ont un step avec option_group "Sauces"
      const filteredProducts = productsData
        ?.filter((product: any) => {
          try {
            const stepsConfig = product.steps_config;
            if (!stepsConfig) return false;

            const steps = stepsConfig.steps || [];
            return steps.some((step: any) =>
              step.option_groups && step.option_groups.includes('Sauces')
            );
          } catch (e) {
            return false;
          }
        })
        .map((product: any) => ({
          id: product.id,
          name: product.name,
          category_name: product.category?.name || 'N/A',
          sauces_count: product.options?.filter((o: any) => o.option_group === 'Sauces').length || 0
        })) || [];

      return NextResponse.json({
        success: true,
        products: filteredProducts
      });
    }

    return NextResponse.json({
      success: true,
      products: products || []
    });

  } catch (error: any) {
    console.error('Erreur API list-products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
