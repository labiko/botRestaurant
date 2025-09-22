import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDataLoader } from '@/lib/supabase-data-loader';

/**
 * API d'analyse complète des configurations existantes
 * Version simplifiée pour éviter les erreurs de jointures
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Démarrage analyse complète des configurations...');

    const dataLoader = new SupabaseDataLoader();

    // 1. Récupérer tous les restaurants
    const { data: restaurants, error: restaurantsError } = await dataLoader.supabase
      .from('france_restaurants')
      .select('id, name, slug, address')
      .eq('is_active', true);

    if (restaurantsError) {
      console.error('Erreur restaurants:', restaurantsError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors du chargement des restaurants: ' + restaurantsError.message
      }, { status: 500 });
    }

    // 2. Récupérer toutes les catégories
    const { data: categories, error: categoriesError } = await dataLoader.supabase
      .from('france_menu_categories')
      .select('id, name, restaurant_id');

    if (categoriesError) {
      console.error('Erreur catégories:', categoriesError);
    }

    // 3. Récupérer tous les produits avec workflows
    const { data: products, error: productsError } = await dataLoader.supabase
      .from('france_products')
      .select('name, product_type, workflow_type, requires_steps, steps_config, restaurant_id, category_id')
      .eq('requires_steps', true)
      .not('steps_config', 'is', null);

    if (productsError) {
      console.error('Erreur produits:', productsError);
    }

    // 4. Diagnostic spécifique Panini
    const { data: paniniProducts, error: paniniError } = await dataLoader.supabase
      .from('france_products')
      .select('name, steps_config, restaurant_id, category_id')
      .or('name.ilike.%panini%,name.ilike.%choix%')
      .eq('requires_steps', true);

    if (paniniError) {
      console.error('Erreur panini:', paniniError);
    }

    // 5. Créer des maps pour faciliter les jointures
    const restaurantMap = new Map(restaurants?.map(r => [r.id, r]) || []);
    const categoryMap = new Map(categories?.map(c => [c.id, c]) || []);

    // 6. Enrichir les données panini
    const enrichedPanini = (paniniProducts || []).map(p => ({
      ...p,
      restaurant_name: restaurantMap.get(p.restaurant_id)?.name || 'Inconnu',
      category_name: categoryMap.get(p.category_id)?.name || 'Inconnu'
    }));

    // 7. Enrichir les données produits
    const enrichedProducts = (products || []).map(p => ({
      ...p,
      restaurant_name: restaurantMap.get(p.restaurant_id)?.name || 'Inconnu',
      category_name: categoryMap.get(p.category_id)?.name || 'Inconnu'
    }));

    // 8. Analyser les problèmes dans les configurations
    const problems = [];

    enrichedProducts.forEach(product => {
      try {
        const config = product.steps_config;

        if (!config || typeof config !== 'object') {
          problems.push({
            restaurant: product.restaurant_name,
            produit: product.name,
            probleme: 'Configuration manquante ou invalide',
            config_actuelle: String(config)
          });
          return;
        }

        if (!config.steps || !Array.isArray(config.steps) || config.steps.length === 0) {
          problems.push({
            restaurant: product.restaurant_name,
            produit: product.name,
            probleme: 'Aucune étape définie',
            config_actuelle: JSON.stringify(config)
          });
          return;
        }

        // Vérifier chaque étape
        config.steps.forEach((step: any, stepIndex: number) => {
          if (!step.options || !Array.isArray(step.options) || step.options.length === 0) {
            problems.push({
              restaurant: product.restaurant_name,
              produit: product.name,
              probleme: `Étape ${stepIndex + 1}: Aucune option définie`,
              config_actuelle: JSON.stringify(step)
            });
            return;
          }

          // Vérifier chaque option
          step.options.forEach((option: any, optionIndex: number) => {
            if (!option || typeof option !== 'object') {
              problems.push({
                restaurant: product.restaurant_name,
                produit: product.name,
                probleme: `Étape ${stepIndex + 1}, Option ${optionIndex + 1}: Option invalide`,
                config_actuelle: JSON.stringify(option)
              });
            } else if (!option.name || typeof option.name !== 'string') {
              problems.push({
                restaurant: product.restaurant_name,
                produit: product.name,
                probleme: `Étape ${stepIndex + 1}, Option ${optionIndex + 1}: Nom manquant ou invalide`,
                config_actuelle: JSON.stringify(option)
              });
            }
          });
        });

      } catch (error) {
        problems.push({
          restaurant: product.restaurant_name,
          produit: product.name,
          probleme: 'Erreur de parsing JSON',
          config_actuelle: String(product.steps_config)
        });
      }
    });

    // 9. Extraire les templates réussis (Pizza Yolo 77)
    const successfulTemplates = enrichedProducts
      .filter(p => p.restaurant_name === 'Pizza Yolo 77' && problems.findIndex(prob => prob.produit === p.name) === -1)
      .map(p => ({
        restaurant: p.restaurant_name,
        category: p.category_name,
        product: p.name,
        config: p.steps_config
      }));

    // 10. Statistiques par restaurant
    const restaurantStats = restaurants?.map(r => ({
      name: r.name,
      categories_count: categories?.filter(c => c.restaurant_id === r.id).length || 0,
      products_count: enrichedProducts.filter(p => p.restaurant_id === r.id).length || 0,
      composite_count: enrichedProducts.filter(p => p.restaurant_id === r.id && p.requires_steps).length || 0
    })) || [];

    // 11. Grouper workflows par restaurant
    const workflowsByRestaurant = enrichedProducts.reduce((acc: any, product) => {
      const restaurant = product.restaurant_name;
      acc[restaurant] = (acc[restaurant] || 0) + 1;
      return acc;
    }, {});

    // 12. Générer recommandations
    const recommendations = [];
    const criticalProblems = problems.filter(p => p.probleme.includes('Nom manquant'));

    if (problems.length > 0) {
      recommendations.push(`🚨 ${problems.length} problèmes détectés dans les configurations`);
    }

    if (criticalProblems.length > 0) {
      recommendations.push(`⚠️ ${criticalProblems.length} options sans nom (cause des [object Object])`);
    }

    if (successfulTemplates.length > 0) {
      recommendations.push(`✅ ${successfulTemplates.length} templates réussis disponibles`);
    }

    recommendations.push('🎯 Corriger les configurations avec des noms d\'options manquants');
    recommendations.push('🤖 Utiliser les templates Pizza Yolo 77 comme modèles');

    // 13. Construire la réponse
    const analysis = {
      diagnostic: {
        panini_problem: enrichedPanini,
        total_issues: problems.length,
        critical_issues: criticalProblems.length
      },
      existing_workflows: {
        total: enrichedProducts.length,
        by_restaurant: workflowsByRestaurant
      },
      restaurant_structures: restaurantStats,
      patterns: [], // À implémenter plus tard
      successful_templates: successfulTemplates,
      problems: problems,
      recommendations: recommendations
    };

    const summary = {
      total_restaurants: restaurants?.length || 0,
      total_workflows: enrichedProducts.length,
      total_problems: problems.length,
      success_rate: enrichedProducts.length > 0 ? ((enrichedProducts.length - problems.length) / enrichedProducts.length * 100) : 0
    };

    console.log('✅ Analyse terminée !');
    console.log(`📊 Résumé: ${summary.total_restaurants} restaurants, ${summary.total_workflows} workflows, ${summary.total_problems} problèmes`);

    return NextResponse.json({
      success: true,
      analysis,
      summary
    });

  } catch (error) {
    console.error('❌ Erreur analyse configurations:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'analyse des configurations',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}