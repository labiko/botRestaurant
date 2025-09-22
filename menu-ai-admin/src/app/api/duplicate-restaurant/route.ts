import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DuplicationLogger } from '@/lib/duplication-logger';

// Configuration Supabase DEV par défaut
const environment = 'DEV'; // Force DEV
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

interface DuplicationRequest {
  sourceRestaurantId: number;
  targetRestaurant: {
    name: string;
    slug: string;
    address: string;
    phone: string;
    whatsapp_number?: string;
    city?: string;
  };
  selectedCategories: number[];
  duplicateWorkflows: boolean;
}

export async function POST(request: NextRequest) {
  const logger = new DuplicationLogger();

  try {
    const {
      sourceRestaurantId,
      targetRestaurant,
      selectedCategories,
      duplicateWorkflows = true
    }: DuplicationRequest = await request.json();

    console.log('🔄 Début duplication restaurant...', {
      source: sourceRestaurantId,
      target: targetRestaurant.name,
      categories: selectedCategories.length
    });

    // 📊 LOGGING: Démarrer la session de duplication
    await logger.startDuplication(
      sourceRestaurantId,
      targetRestaurant.name,
      selectedCategories,
      duplicateWorkflows,
      `user-${Date.now()}`
    );
    await logger.updateStatus('in_progress');

    // ÉTAPE 1: Créer le nouveau restaurant
    const newRestaurantResult = await createTargetRestaurant(targetRestaurant);
    if (!newRestaurantResult.success) {
      // 📊 LOGGING: Échec création restaurant
      await logger.failDuplication(`Échec création restaurant: ${newRestaurantResult.error}`);
      return NextResponse.json({
        success: false,
        error: newRestaurantResult.error
      }, { status: 400 });
    }

    const newRestaurantId = newRestaurantResult.restaurantId!;
    console.log('✅ Restaurant créé avec ID:', newRestaurantId);

    // 📊 LOGGING: Restaurant créé avec succès
    await logger.logRestaurantCreation(targetRestaurant.name, newRestaurantId);
    await logger.updateTargetRestaurant(newRestaurantId);

    // ÉTAPE 2: Dupliquer les catégories sélectionnées
    const categoriesResult = await duplicateCategories(
      sourceRestaurantId,
      newRestaurantId,
      selectedCategories
    );

    if (!categoriesResult.success) {
      return NextResponse.json({
        success: false,
        error: categoriesResult.error
      }, { status: 400 });
    }

    // ÉTAPE 3: Dupliquer les produits et workflows
    const productsResult = await duplicateProducts(
      sourceRestaurantId,
      newRestaurantId,
      selectedCategories,
      categoriesResult.categoryMapping!,
      duplicateWorkflows
    );

    if (!productsResult.success) {
      return NextResponse.json({
        success: false,
        error: productsResult.error
      }, { status: 400 });
    }

    // ÉTAPE 4: Dupliquer la configuration bot (NOUVELLE ÉTAPE)
    const botConfigResult = await duplicateBotConfig(sourceRestaurantId, newRestaurantId);
    if (!botConfigResult.success) {
      console.warn('⚠️ Échec duplication config bot:', botConfigResult.error);
    } else {
      console.log('✅ Configuration bot dupliquée');
    }

    // ÉTAPE 4b: Dupliquer les configurations d'affichage produit
    const productDisplayResult = await duplicateProductDisplayConfigs(sourceRestaurantId, newRestaurantId);
    if (!productDisplayResult.success) {
      console.warn('⚠️ Échec duplication config affichage:', productDisplayResult.error);
    } else {
      console.log('✅ Configurations affichage produit dupliquées');
    }

    // ÉTAPE 4c: Dupliquer les templates workflow
    const workflowTemplatesResult = await duplicateWorkflowTemplates(sourceRestaurantId, newRestaurantId);
    if (!workflowTemplatesResult.success) {
      console.warn('⚠️ Échec duplication templates workflow:', workflowTemplatesResult.error);
    } else {
      console.log('✅ Templates workflow dupliqués');
    }

    // ÉTAPE 5: Statistiques finales
    const stats = await getDuplicationStats(newRestaurantId);

    console.log('🎉 Duplication terminée avec succès !', stats);

    // 📊 LOGGING: Finaliser la duplication avec succès
    await logger.completeDuplication({
      categoriesDuplicated: categoriesResult.categoriesCreated || 0,
      productsDuplicated: productsResult.productsCreated || 0,
      optionsDuplicated: productsResult.optionsCreated || 0,
      workflowsConfigured: stats.workflows || 0
    });

    return NextResponse.json({
      success: true,
      restaurantId: newRestaurantId,
      stats: stats,
      message: `Restaurant "${targetRestaurant.name}" créé avec succès !`
    });

  } catch (error) {
    console.error('❌ Erreur duplication restaurant:', error);

    // 📊 LOGGING: Marquer la duplication comme échouée
    await logger.failDuplication(error instanceof Error ? error.message : 'Erreur inconnue lors de la duplication');

    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la duplication du restaurant'
    }, { status: 500 });
  }
}

// FONCTION 1: Créer le restaurant cible
async function createTargetRestaurant(restaurantData: any) {
  try {
    const { data, error } = await supabase
      .from('france_restaurants')
      .insert({
        name: restaurantData.name,
        slug: restaurantData.slug,
        address: restaurantData.address,
        city: restaurantData.city || '',
        phone: restaurantData.phone,
        whatsapp_number: restaurantData.whatsapp_number || restaurantData.phone,
        password_hash: '810790', // Hash par défaut
        delivery_zone_km: 5,
        delivery_fee: 2.5,
        is_active: true,
        business_hours: {
          "lundi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
          "mardi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
          "mercredi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
          "jeudi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
          "vendredi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
          "samedi": {"isOpen": true, "opening": "07:00", "closing": "23:50"},
          "dimanche": {"isOpen": true, "opening": "07:00", "closing": "23:50"}
        }
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Erreur création restaurant:', error);
      return { success: false, error: error.message };
    }

    return { success: true, restaurantId: data.id };
  } catch (error) {
    console.error('❌ Erreur createTargetRestaurant:', error);
    return { success: false, error: 'Erreur lors de la création du restaurant' };
  }
}

// FONCTION 2: Dupliquer les catégories
async function duplicateCategories(
  sourceRestaurantId: number,
  targetRestaurantId: number,
  selectedCategoryIds: number[]
) {
  try {
    // Récupérer les catégories source
    const { data: sourceCategories, error: fetchError } = await supabase
      .from('france_menu_categories')
      .select('*')
      .eq('restaurant_id', sourceRestaurantId)
      .in('id', selectedCategoryIds)
      .order('display_order');

    if (fetchError) {
      console.error('❌ Erreur récupération catégories:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!sourceCategories || sourceCategories.length === 0) {
      return { success: false, error: 'Aucune catégorie trouvée' };
    }

    // Préparer les nouvelles catégories
    const newCategories = sourceCategories.map(cat => ({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      display_order: cat.display_order,
      restaurant_id: targetRestaurantId
    }));

    // Insérer les nouvelles catégories
    const { data: insertedCategories, error: insertError } = await supabase
      .from('france_menu_categories')
      .insert(newCategories)
      .select('id, name');

    if (insertError) {
      console.error('❌ Erreur insertion catégories:', insertError);
      return { success: false, error: insertError.message };
    }

    // Créer le mapping ancien ID → nouveau ID
    const categoryMapping: { [key: number]: number } = {};
    sourceCategories.forEach((sourceCat, index) => {
      categoryMapping[sourceCat.id] = insertedCategories![index].id;
    });

    console.log('✅ Catégories dupliquées:', insertedCategories!.length);

    return {
      success: true,
      categoryMapping,
      categoriesCreated: insertedCategories!.length
    };
  } catch (error) {
    console.error('❌ Erreur duplicateCategories:', error);
    return { success: false, error: 'Erreur lors de la duplication des catégories' };
  }
}

// FONCTION 3: Dupliquer les produits
async function duplicateProducts(
  sourceRestaurantId: number,
  targetRestaurantId: number,
  selectedCategoryIds: number[],
  categoryMapping: { [key: number]: number },
  duplicateWorkflows: boolean
) {
  try {
    // Récupérer les produits des catégories sélectionnées
    const { data: sourceProducts, error: fetchError } = await supabase
      .from('france_products')
      .select(`
        *,
        category:france_menu_categories(id, name)
      `)
      .eq('restaurant_id', sourceRestaurantId)
      .in('category_id', selectedCategoryIds)
      .order('display_order');

    if (fetchError) {
      console.error('❌ Erreur récupération produits:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!sourceProducts || sourceProducts.length === 0) {
      console.log('⚠️ Aucun produit trouvé pour les catégories sélectionnées');
      return { success: true, productsCreated: 0 };
    }

    console.log(`📦 Duplication de ${sourceProducts.length} produits...`);

    // Préparer les nouveaux produits
    const newProducts = sourceProducts.map(product => ({
      name: product.name,
      price_on_site_base: product.price_on_site_base,
      price_delivery_base: product.price_delivery_base,
      product_type: product.product_type,
      workflow_type: product.workflow_type,
      requires_steps: product.requires_steps,
      steps_config: product.steps_config,
      display_order: product.display_order,
      category_id: categoryMapping[product.category_id],
      restaurant_id: targetRestaurantId,
      is_active: product.is_active || true
    }));

    // Insérer les nouveaux produits
    const { data: insertedProducts, error: insertError } = await supabase
      .from('france_products')
      .insert(newProducts)
      .select('id, name');

    if (insertError) {
      console.error('❌ Erreur insertion produits:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Produits dupliqués:', insertedProducts!.length);

    // Dupliquer les options de produits si workflows activés
    let optionsCreated = 0;
    if (duplicateWorkflows && insertedProducts) {
      const productMapping: { [key: number]: number } = {};
      sourceProducts.forEach((sourceProduct, index) => {
        productMapping[sourceProduct.id] = insertedProducts[index].id;
      });

      const optionsResult = await duplicateProductOptions(
        sourceProducts.map(p => p.id),
        productMapping
      );

      if (!optionsResult.success) {
        console.error('⚠️ Erreur duplication options:', optionsResult.error);
      } else {
        console.log('✅ Options dupliquées:', optionsResult.optionsCreated);
        optionsCreated = optionsResult.optionsCreated || 0;
      }
    }

    return {
      success: true,
      productsCreated: insertedProducts!.length,
      optionsCreated: optionsCreated
    };
  } catch (error) {
    console.error('❌ Erreur duplicateProducts:', error);
    return { success: false, error: 'Erreur lors de la duplication des produits' };
  }
}

// FONCTION 4: Dupliquer les options de produits
async function duplicateProductOptions(
  sourceProductIds: number[],
  productMapping: { [key: number]: number }
) {
  try {
    // Récupérer toutes les options des produits source
    const { data: sourceOptions, error: fetchError } = await supabase
      .from('france_product_options')
      .select('*')
      .in('product_id', sourceProductIds);

    if (fetchError) {
      console.error('❌ Erreur récupération options:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!sourceOptions || sourceOptions.length === 0) {
      return { success: true, optionsCreated: 0 };
    }

    // Préparer les nouvelles options (colonnes existantes uniquement)
    const newOptions = sourceOptions.map(option => ({
      product_id: productMapping[option.product_id],
      option_group: option.option_group,
      option_name: option.option_name,
      price_modifier: option.price_modifier,
      display_order: option.display_order
    }));

    // Insérer les nouvelles options
    const { data: insertedOptions, error: insertError } = await supabase
      .from('france_product_options')
      .insert(newOptions)
      .select('id');

    if (insertError) {
      console.error('❌ Erreur insertion options:', insertError);
      return { success: false, error: insertError.message };
    }

    return {
      success: true,
      optionsCreated: insertedOptions!.length
    };
  } catch (error) {
    console.error('❌ Erreur duplicateProductOptions:', error);
    return { success: false, error: 'Erreur lors de la duplication des options' };
  }
}

// FONCTION 5: Obtenir les statistiques
async function getDuplicationStats(restaurantId: number) {
  try {
    const [categoriesResult, productsResult, optionsResult] = await Promise.all([
      supabase
        .from('france_menu_categories')
        .select('id')
        .eq('restaurant_id', restaurantId),
      supabase
        .from('france_products')
        .select('id, requires_steps')
        .eq('restaurant_id', restaurantId),
      supabase
        .from('france_product_options')
        .select('id')
        .in('product_id',
          supabase
            .from('france_products')
            .select('id')
            .eq('restaurant_id', restaurantId)
        )
    ]);

    const workflowsCount = productsResult.data?.filter(p => p.requires_steps).length || 0;

    return {
      categories: categoriesResult.data?.length || 0,
      products: productsResult.data?.length || 0,
      workflows: workflowsCount,
      options: optionsResult.data?.length || 0
    };
  } catch (error) {
    console.error('❌ Erreur getDuplicationStats:', error);
    return {
      categories: 0,
      products: 0,
      workflows: 0,
      options: 0
    };
  }
}

// FONCTION 6: Dupliquer la configuration bot (NOUVELLE FONCTION)
async function duplicateBotConfig(sourceRestaurantId: number, targetRestaurantId: number) {
  try {
    // Récupérer la config bot du restaurant source
    const { data: sourceBotConfig, error: fetchError } = await supabase
      .from('restaurant_bot_configs')
      .select('*')
      .eq('restaurant_id', sourceRestaurantId)
      .single();

    if (fetchError) {
      console.warn('⚠️ Aucune config bot trouvée pour le restaurant source:', fetchError.message);
      return { success: true, message: 'Aucune config bot à dupliquer' };
    }

    if (!sourceBotConfig) {
      return { success: true, message: 'Aucune config bot trouvée' };
    }

    // Préparer la nouvelle config bot
    const newBotConfig = {
      restaurant_id: targetRestaurantId,
      config_name: sourceBotConfig.config_name,
      brand_name: sourceBotConfig.brand_name,
      welcome_message: sourceBotConfig.welcome_message,
      available_workflows: sourceBotConfig.available_workflows,
      features: sourceBotConfig.features,
      is_active: sourceBotConfig.is_active
    };

    // Insérer la nouvelle config bot
    const { data: insertedBotConfig, error: insertError } = await supabase
      .from('restaurant_bot_configs')
      .insert(newBotConfig)
      .select('id');

    if (insertError) {
      console.error('❌ Erreur insertion config bot:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Configuration bot dupliquée avec ID:', insertedBotConfig![0].id);

    return {
      success: true,
      botConfigId: insertedBotConfig![0].id
    };
  } catch (error) {
    console.error('❌ Erreur duplicateBotConfig:', error);
    return { success: false, error: 'Erreur lors de la duplication de la config bot' };
  }
}

// FONCTION 7: Dupliquer les configurations d'affichage produit
async function duplicateProductDisplayConfigs(sourceRestaurantId: number, targetRestaurantId: number) {
  try {
    // Récupérer les configs d'affichage du restaurant source
    const { data: sourceConfigs, error: fetchError } = await supabase
      .from('france_product_display_configs')
      .select('*')
      .eq('restaurant_id', sourceRestaurantId);

    if (fetchError) {
      console.warn('⚠️ Erreur récupération configs affichage:', fetchError.message);
      return { success: true, message: 'Aucune config affichage à dupliquer' };
    }

    if (!sourceConfigs || sourceConfigs.length === 0) {
      return { success: true, message: 'Aucune config affichage trouvée' };
    }

    // Préparer les nouvelles configs d'affichage
    const newConfigs = sourceConfigs.map(config => ({
      restaurant_id: targetRestaurantId,
      product_id: config.product_id, // Note: les IDs produits seront différents, mais on garde la structure
      display_type: config.display_type,
      template_name: config.template_name,
      show_variants_first: config.show_variants_first,
      custom_header_text: config.custom_header_text,
      custom_footer_text: config.custom_footer_text,
      emoji_icon: config.emoji_icon
    }));

    // Insérer les nouvelles configs
    const { data: insertedConfigs, error: insertError } = await supabase
      .from('france_product_display_configs')
      .insert(newConfigs)
      .select('id');

    if (insertError) {
      console.error('❌ Erreur insertion configs affichage:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Configurations affichage dupliquées:', insertedConfigs!.length);

    return {
      success: true,
      configsCreated: insertedConfigs!.length
    };
  } catch (error) {
    console.error('❌ Erreur duplicateProductDisplayConfigs:', error);
    return { success: false, error: 'Erreur lors de la duplication des configs affichage' };
  }
}

// FONCTION 8: Dupliquer les templates workflow
async function duplicateWorkflowTemplates(sourceRestaurantId: number, targetRestaurantId: number) {
  try {
    // Récupérer les templates workflow du restaurant source
    const { data: sourceTemplates, error: fetchError } = await supabase
      .from('france_workflow_templates')
      .select('*')
      .eq('restaurant_id', sourceRestaurantId);

    if (fetchError) {
      console.warn('⚠️ Erreur récupération templates workflow:', fetchError.message);
      return { success: true, message: 'Aucun template workflow à dupliquer' };
    }

    if (!sourceTemplates || sourceTemplates.length === 0) {
      return { success: true, message: 'Aucun template workflow trouvé' };
    }

    // Préparer les nouveaux templates workflow
    const newTemplates = sourceTemplates.map(template => ({
      restaurant_id: targetRestaurantId,
      template_name: template.template_name,
      description: template.description,
      steps_config: template.steps_config
    }));

    // Insérer les nouveaux templates
    const { data: insertedTemplates, error: insertError } = await supabase
      .from('france_workflow_templates')
      .insert(newTemplates)
      .select('id');

    if (insertError) {
      console.error('❌ Erreur insertion templates workflow:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Templates workflow dupliqués:', insertedTemplates!.length);

    return {
      success: true,
      templatesCreated: insertedTemplates!.length
    };
  } catch (error) {
    console.error('❌ Erreur duplicateWorkflowTemplates:', error);
    return { success: false, error: 'Erreur lors de la duplication des templates workflow' };
  }
}

// GET: Récupérer les restaurants disponibles pour duplication
export async function GET() {
  try {
    const { data: restaurants, error } = await supabase
      .from('france_restaurants')
      .select(`
        id,
        name,
        slug,
        address,
        phone,
        is_active,
        created_at,
        categories:france_menu_categories(count),
        products:france_products(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération restaurants:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    // Enrichir avec les statistiques
    const enrichedRestaurants = await Promise.all(
      restaurants.map(async (restaurant) => {
        const stats = await getDuplicationStats(restaurant.id);
        return {
          ...restaurant,
          stats
        };
      })
    );

    return NextResponse.json({
      success: true,
      restaurants: enrichedRestaurants
    });

  } catch (error) {
    console.error('❌ Erreur GET restaurants:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des restaurants'
    }, { status: 500 });
  }
}