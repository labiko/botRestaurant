// 🔄 API DUPLICATION DE CATÉGORIE
// =================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase selon l'environnement (DEV par défaut)
const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'DEV';
const supabaseUrl = environment === 'PROD'
  ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
  : process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

interface DuplicateCategoryRequest {
  sourceRestaurantId: number;
  sourceCategoryId: number;
  targetRestaurantId: number;
  action: 'create_new' | 'replace' | 'merge';
  newCategoryName?: string;
  duplicateWorkflows: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const {
      sourceRestaurantId,
      sourceCategoryId,
      targetRestaurantId,
      action = 'create_new',
      newCategoryName,
      duplicateWorkflows = true
    }: DuplicateCategoryRequest = await request.json();

    console.log('🔄 Début duplication catégorie...', {
      source: sourceRestaurantId,
      category: sourceCategoryId,
      target: targetRestaurantId,
      action
    });

    // Créer l'entrée dans duplication_logs
    const { data: duplicationLog, error: logError } = await supabase
      .from('duplication_logs')
      .insert({
        source_restaurant_id: sourceRestaurantId,
        target_restaurant_id: targetRestaurantId,
        status: 'started',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    // ÉTAPE 1: Récupérer la catégorie source
    const { data: sourceCategory, error: sourceCategoryError } = await supabase
      .from('france_menu_categories')
      .select('*')
      .eq('id', sourceCategoryId)
      .eq('restaurant_id', sourceRestaurantId)
      .single();

    if (sourceCategoryError || !sourceCategory) {
      return NextResponse.json({
        success: false,
        error: 'Catégorie source non trouvée'
      }, { status: 404 });
    }

    // ÉTAPE 2: Récupérer tous les produits de la catégorie source
    const { data: sourceProducts, error: sourceProductsError } = await supabase
      .from('france_products')
      .select('*')
      .eq('category_id', sourceCategoryId)
      .eq('restaurant_id', sourceRestaurantId)
      .order('display_order');

    if (sourceProductsError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur récupération produits source'
      }, { status: 400 });
    }

    console.log(`📦 ${sourceProducts?.length || 0} produits à dupliquer`);

    // ÉTAPE 3: Créer la nouvelle catégorie dans le restaurant cible
    const targetCategoryName = newCategoryName || sourceCategory.name;

    // Vérifier le prochain display_order pour la nouvelle catégorie
    const { data: existingCategories } = await supabase
      .from('france_menu_categories')
      .select('display_order')
      .eq('restaurant_id', targetRestaurantId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextDisplayOrder = existingCategories?.[0]?.display_order ?
      existingCategories[0].display_order + 1 : 1;

    const { data: newCategory, error: newCategoryError } = await supabase
      .from('france_menu_categories')
      .insert({
        restaurant_id: targetRestaurantId,
        name: targetCategoryName,
        slug: sourceCategory.slug,
        icon: sourceCategory.icon,
        display_order: nextDisplayOrder
      })
      .select()
      .single();

    if (newCategoryError || !newCategory) {
      return NextResponse.json({
        success: false,
        error: 'Erreur création nouvelle catégorie'
      }, { status: 400 });
    }

    console.log(`✅ Nouvelle catégorie créée: ${newCategory.name} (ID: ${newCategory.id})`);

    // ÉTAPE 4: Dupliquer tous les produits
    let duplicatedProductsCount = 0;
    let duplicatedOptionsCount = 0;

    if (sourceProducts && sourceProducts.length > 0) {
      for (const sourceProduct of sourceProducts) {
        try {
          // Dupliquer le produit
          const { data: newProduct, error: newProductError } = await supabase
            .from('france_products')
            .insert({
              restaurant_id: targetRestaurantId,
              category_id: newCategory.id,
              name: sourceProduct.name,
              slug: sourceProduct.slug,
              description: sourceProduct.description,
              composition: sourceProduct.composition,
              product_type: sourceProduct.product_type,
              price_on_site_base: sourceProduct.price_on_site_base,
              price_delivery_base: sourceProduct.price_delivery_base,
              base_price: sourceProduct.base_price,
              workflow_type: duplicateWorkflows ? sourceProduct.workflow_type : null,
              requires_steps: duplicateWorkflows ? sourceProduct.requires_steps : false,
              steps_config: duplicateWorkflows ? sourceProduct.steps_config : null,
              display_order: sourceProduct.display_order,
              is_available: sourceProduct.is_available
            })
            .select()
            .single();

          if (newProductError || !newProduct) {
            console.error(`❌ Erreur duplication produit ${sourceProduct.name}:`, newProductError);
            continue;
          }

          duplicatedProductsCount++;
          console.log(`✅ Produit dupliqué: ${newProduct.name}`);

          // ÉTAPE 5: Dupliquer les options du produit si elles existent
          if (duplicateWorkflows) {
            const { data: productOptions, error: optionsError } = await supabase
              .from('france_product_options')
              .select('*')
              .eq('product_id', sourceProduct.id);

            if (!optionsError && productOptions && productOptions.length > 0) {
              for (const option of productOptions) {
                const { error: newOptionError } = await supabase
                  .from('france_product_options')
                  .insert({
                    product_id: newProduct.id,
                    name: option.name,
                    price_modifier: option.price_modifier,
                    is_required: option.is_required,
                    display_order: option.display_order
                  });

                if (!newOptionError) {
                  duplicatedOptionsCount++;
                }
              }
            }

            // Dupliquer les éléments composites si ils existent
            const { data: compositeItems, error: compositeError } = await supabase
              .from('france_composite_items')
              .select('*')
              .eq('product_id', sourceProduct.id);

            if (!compositeError && compositeItems && compositeItems.length > 0) {
              for (const item of compositeItems) {
                await supabase
                  .from('france_composite_items')
                  .insert({
                    product_id: newProduct.id,
                    name: item.name,
                    option_group: item.option_group,
                    price_on_site: item.price_on_site,
                    price_delivery: item.price_delivery,
                    is_default: item.is_default,
                    display_order: item.display_order
                  });
              }
            }
          }

        } catch (productError) {
          console.error(`❌ Erreur duplication produit ${sourceProduct.name}:`, productError);
        }
      }
    }

    console.log(`🎉 Duplication terminée: ${duplicatedProductsCount} produits, ${duplicatedOptionsCount} options`);

    // Mettre à jour le log avec le succès
    if (duplicationLog?.id) {
      await supabase
        .from('duplication_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          summary: {
            categoriesDuplicated: 1,
            productsDuplicated: duplicatedProductsCount,
            optionsDuplicated: duplicatedOptionsCount,
            workflowsConfigured: duplicateWorkflows ? 1 : 0
          }
        })
        .eq('id', duplicationLog.id);
    }

    return NextResponse.json({
      success: true,
      message: `Catégorie "${targetCategoryName}" créée avec succès !`,
      result: {
        newCategoryId: newCategory.id,
        newCategoryName: targetCategoryName,
        duplicatedProducts: duplicatedProductsCount,
        duplicatedOptions: duplicatedOptionsCount,
        workflowsPreserved: duplicateWorkflows
      }
    });

  } catch (error) {
    console.error('❌ Erreur duplication catégorie:', error);

    // Mettre à jour le log avec l'échec
    if (duplicationLog?.id) {
      await supabase
        .from('duplication_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Erreur inconnue'
        })
        .eq('id', duplicationLog.id);
    }

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la duplication de la catégorie'
    }, { status: 500 });
  }
}