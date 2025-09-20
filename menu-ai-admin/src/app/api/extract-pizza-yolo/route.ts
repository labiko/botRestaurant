import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';

/**
 * API d'extraction complète Pizza Yolo 77 en LECTURE SEULE
 * Pour analyser les configurations qui fonctionnent
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🍕 Extraction complète Pizza Yolo 77...');

    const dataLoader = new SupabaseDataLoader();

    // 1. Récupérer Pizza Yolo 77
    const { data: restaurant, error: restaurantError } = await dataLoader.supabase
      .from('france_restaurants')
      .select('*')
      .eq('name', 'Pizza Yolo 77')
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant Pizza Yolo 77 non trouvé'
      }, { status: 404 });
    }

    // 2. Récupérer toutes les catégories
    const { data: categories, error: categoriesError } = await dataLoader.supabase
      .from('france_menu_categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('display_order');

    if (categoriesError) {
      console.error('Erreur catégories:', categoriesError);
    }

    // 3. Récupérer tous les produits
    const { data: products, error: productsError } = await dataLoader.supabase
      .from('france_products')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('category_id, display_order');

    if (productsError) {
      console.error('Erreur produits:', productsError);
    }

    // 4. Organiser les données par catégorie
    const categoriesWithProducts = (categories || []).map(category => ({
      ...category,
      products_simple: (products || []).filter(p =>
        p.category_id === category.id && !p.requires_steps
      ),
      products_composite: (products || []).filter(p =>
        p.category_id === category.id && p.requires_steps
      )
    }));

    // 5. Analyser les workflows composites
    const compositeAnalysis = (products || [])
      .filter(p => p.requires_steps && p.steps_config)
      .map(product => {
        const category = categories?.find(c => c.id === product.category_id);
        try {
          const config = product.steps_config;
          return {
            category_name: category?.name || 'Inconnu',
            product_name: product.name,
            price_on_site: product.price_on_site_base,
            price_delivery: product.price_delivery_base,
            workflow_type: product.workflow_type,
            steps_count: config?.steps?.length || 0,
            steps_config: config,
            steps_analysis: config?.steps?.map((step: any, index: number) => ({
              step_number: index + 1,
              step_type: step.step_type,
              title: step.title,
              is_required: step.is_required,
              options_count: step.options?.length || 0,
              options: step.options?.map((opt: any) => ({
                name: opt.name,
                price_modifier: opt.price_modifier,
                has_valid_name: typeof opt.name === 'string' && opt.name.length > 0
              })) || []
            })) || []
          };
        } catch (error) {
          console.error('Erreur parsing config:', error);
          return {
            category_name: category?.name || 'Inconnu',
            product_name: product.name,
            error: 'Erreur de parsing JSON',
            steps_config: product.steps_config
          };
        }
      });

    // 6. Générer des templates pour l'IA
    const successfulTemplates = compositeAnalysis
      .filter(item => !item.error && item.steps_analysis)
      .map(item => ({
        category: item.category_name,
        product: item.product_name,
        price_on_site: item.price_on_site,
        price_delivery: item.price_delivery,
        workflow_type: item.workflow_type,
        template_config: item.steps_config
      }));

    // 7. Identifier les patterns de réussite
    const patterns = {
      categories: {
        naming_pattern: categories?.map(c => c.name) || [],
        icon_pattern: categories?.map(c => c.icon) || [],
        slug_pattern: categories?.map(c => c.slug) || []
      },
      products_simple: {
        count: products?.filter(p => !p.requires_steps).length || 0,
        price_ranges: {
          on_site: {
            min: Math.min(...(products?.filter(p => !p.requires_steps).map(p => p.price_on_site_base) || [0])),
            max: Math.max(...(products?.filter(p => !p.requires_steps).map(p => p.price_on_site_base) || [0]))
          }
        }
      },
      workflows: {
        types: [...new Set(compositeAnalysis.map(c => c.workflow_type).filter(Boolean))],
        step_types: [...new Set(compositeAnalysis.flatMap(c =>
          c.steps_analysis?.map(s => s.step_type) || []
        ))],
        common_titles: [...new Set(compositeAnalysis.flatMap(c =>
          c.steps_analysis?.map(s => s.title) || []
        ))]
      }
    };

    // 8. Statistiques complètes
    const statistics = {
      restaurant: {
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        delivery_zone: restaurant.delivery_zone_km,
        delivery_fee: restaurant.delivery_fee
      },
      structure: {
        categories_count: categories?.length || 0,
        products_total: products?.length || 0,
        products_simple: products?.filter(p => !p.requires_steps).length || 0,
        products_composite: products?.filter(p => p.requires_steps).length || 0
      },
      workflows: {
        total_composites: compositeAnalysis.length,
        successful_configs: successfulTemplates.length,
        failed_configs: compositeAnalysis.filter(c => c.error).length
      }
    };

    const extractionData = {
      restaurant_info: restaurant,
      categories: categoriesWithProducts,
      composite_analysis: compositeAnalysis,
      successful_templates: successfulTemplates,
      patterns: patterns,
      statistics: statistics,
      extraction_timestamp: new Date().toISOString()
    };

    console.log('✅ Extraction Pizza Yolo 77 terminée !');
    console.log(`📊 ${statistics.structure.categories_count} catégories, ${statistics.structure.products_total} produits, ${statistics.workflows.successful_configs} workflows réussis`);

    return NextResponse.json({
      success: true,
      data: extractionData
    });

  } catch (error) {
    console.error('❌ Erreur extraction Pizza Yolo 77:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'extraction',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}