import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID produit invalide' },
        { status: 400 }
      );
    }

    // 1. Charger les informations du produit
    const { data: product, error: productError } = await supabase
      .from('france_products')
      .select(`
        id,
        name,
        price_on_site_base,
        price_delivery_base,
        steps_config,
        workflow_type,
        category_id,
        restaurant_id,
        france_menu_categories (
          name
        ),
        france_restaurants (
          id,
          name
        )
      `)
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que c'est bien un produit Universal Workflow V2
    if (product.workflow_type !== 'universal_workflow_v2') {
      return NextResponse.json(
        { error: 'Ce produit n\'est pas un workflow Universal V2' },
        { status: 400 }
      );
    }

    // 2. Charger les options réelles depuis france_product_options
    const { data: realOptions, error: optionsError } = await supabase
      .from('france_product_options')
      .select('*')
      .eq('product_id', productId)
      .order('id');

    // 3. Parser la configuration des steps
    let stepsConfig = {};
    let optionGroups: Record<string, any[]> = {};

    if (product.steps_config) {
      stepsConfig = product.steps_config;

      // Si on a des vraies options, les organiser par groupe
      if (realOptions && realOptions.length > 0) {
        console.log('🔍 DEBUG_ICONS: realOptions trouvées:', realOptions.length);
        console.log('🔍 DEBUG_ICONS: Premier élément:', JSON.stringify(realOptions[0], null, 2));

        // Grouper les options par leur groupe (à déterminer selon la structure de france_product_options)
        // Pour l'instant, créer des groupes par défaut
        optionGroups = {
          'Plats principaux': realOptions.slice(0, 3).map((opt, index) => {
            console.log(`🔍 DEBUG_ICONS: Plat ${index + 1} - emoji: ${opt.emoji}, icon: ${opt.icon}`);
            return {
              name: opt.name || `Option ${index + 1}`,
              price_modifier: opt.price_modifier || 0,
              display_order: index + 1,
              emoji: opt.emoji
            };
          }),
          'Suppléments': realOptions.slice(3).map((opt, index) => {
            console.log(`🔍 DEBUG_ICONS: Supplément ${index + 1} - emoji: ${opt.emoji}, icon: ${opt.icon}`);
            return {
              name: opt.name || `Supplément ${index + 1}`,
              price_modifier: opt.price_modifier || 0,
              display_order: index + 1,
              emoji: opt.emoji
            };
          })
        };
      } else {
        // Pas d'options réelles trouvées, utiliser les groupes depuis steps_config
        if (stepsConfig.steps) {
          const allGroups = new Set();
          stepsConfig.steps.forEach((step: any) => {
            if (step.option_groups) {
              step.option_groups.forEach((group: string) => allGroups.add(group));
            }
          });

          // Créer des options par défaut pour chaque groupe
          Array.from(allGroups).forEach((groupName: string) => {
            optionGroups[groupName] = [
              {
                name: `Option ${groupName} 1`,
                price_modifier: 0,
                display_order: 1,
                emoji: undefined
              },
              {
                name: `Option ${groupName} 2`,
                price_modifier: 1,
                display_order: 2,
                emoji: undefined
              }
            ];
          });
        }
      }
    }

    // 4. Construire la réponse
    const response = {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        price_on_site_base: product.price_on_site_base !== null ? product.price_on_site_base : (product.price_delivery_base ? product.price_delivery_base - 1 : 10),
        price_delivery_base: product.price_delivery_base,
        category: {
          name: product.france_menu_categories?.name || 'Non définie'
        },
        restaurant_id: product.restaurant_id
      },
      workflowConfig: {
        steps_config: stepsConfig,
        total_steps: stepsConfig.steps ? stepsConfig.steps.length : 0
      },
      optionGroups,
      realOptions: realOptions || [],
      debug: {
        has_real_options: (realOptions && realOptions.length > 0),
        steps_config_present: !!product.steps_config,
        option_groups_created: Object.keys(optionGroups).length
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur API workflow-config:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}