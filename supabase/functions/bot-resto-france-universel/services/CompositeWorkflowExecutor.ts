// 🏗️ SERVICE DE WORKFLOW COMPOSITE - ARCHITECTURE UNIVERSELLE
// SOLID : Single Responsibility - Gestion des workflows composites uniquement

import { IMessageSender } from '../types.ts';
import { SessionManager } from './SessionManager.ts';
import { QueryPerformanceMonitor } from './QueryPerformanceMonitor.ts';

/**
 * Exécuteur de workflows composites (TACOS, PIZZAS avec suppléments, etc.)
 * SOLID : Strategy Pattern - Différentes stratégies selon le type de produit
 */
export class CompositeWorkflowExecutor {
  private sessionManager: SessionManager; // ✅ AJOUT: Instance SessionManager pour centralisation

  constructor(
    private messageSender: IMessageSender,
    private supabaseUrl: string,
    private supabaseKey: string
  ) {
    // Initialiser SessionManager pour éviter les accès directs DB
    this.sessionManager = new SessionManager(supabaseUrl, supabaseKey);
  }

  /**
   * Workflow spécifique pour les menus pizza
   * Gère la sélection multiple de pizzas et les composants additionnels
   */
  async startMenuPizzaWorkflow(
    phoneNumber: string,
    product: any,
    session: any
  ): Promise<void> {
    console.log(`🔍 DEBUG_MENU: Démarrage startMenuPizzaWorkflow pour: ${product.name}`);
    console.log(`🔍 DEBUG_MENU: Produit reçu:`, product);
    console.log(`🔍 DEBUG_MENU: Session reçue:`, { sessionId: session.id, currentState: session.currentState });
    
    try {
        console.log(`🔍 DEBUG_MENU: Vérification steps_config...`);
        console.log(`🔍 DEBUG_MENU: product.steps_config existe: ${!!product.steps_config}`);
        
        if (product.steps_config) {
            console.log(`🔍 DEBUG_MENU: steps_config contenu:`, product.steps_config);
        }
        
        const menuConfig = product.steps_config?.menu_config;
        console.log(`🔍 DEBUG_MENU: menuConfig extrait: ${!!menuConfig}`);
        
        if (!menuConfig) {
            console.log(`🔍 DEBUG_MENU: ERREUR - menuConfig manquant`);
            console.log(`🔍 DEBUG_MENU: steps_config disponible:`, product.steps_config);
            throw new Error('Configuration du menu manquante');
        }

        console.log(`🔍 DEBUG_MENU: menuConfig trouvé:`, menuConfig);
        console.log(`🔍 DEBUG_MENU: Appel initializeMenuWorkflow...`);

        // Initialiser le workflow dans la session
        await this.initializeMenuWorkflow(phoneNumber, session, product, menuConfig);
        
        console.log(`🔍 DEBUG_MENU: initializeMenuWorkflow terminé, appel processNextMenuComponent...`);
        
        // Démarrer avec le premier composant
        await this.processNextMenuComponent(phoneNumber, session, 0);
        
        console.log(`🔍 DEBUG_MENU: processNextMenuComponent terminé avec succès`);
        
    } catch (error) {
        console.error('🔍 DEBUG_MENU: ERREUR CAPTURÉE:', error);
        console.error('🔍 DEBUG_MENU: Stack trace:', error.stack);
        await this.messageSender.sendMessage(phoneNumber, 
            '❌ Erreur lors de la configuration du menu. Tapez "resto" pour recommencer.');
    }
  }

  /**
   * Démarrer un workflow composite
   * SOLID : Open/Closed - Extensible pour nouveaux workflows sans modification
   */
  async startCompositeWorkflow(
    phoneNumber: string,
    product: any,
    session: any
  ): Promise<void> {
    console.log(`🔄 [CompositeWorkflow] Démarrage workflow pour: ${product.name}`);
    
    // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer l'entrée dans CompositeWorkflowExecutor
    console.log('🔍 CATEGORY_WORKFLOW_DEBUG - CompositeWorkflowExecutor.startCompositeWorkflow:', {
      productId: product.id,
      productName: product.name,
      currentCategoryName: session.sessionData?.currentCategoryName,
      workflowType: product.workflow_type || product.type,
      hasStepsConfig: !!product.steps_config,
      phoneNumber
    });
    
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      
      // APPROCHE UNIVERSELLE : Vérifier si le produit a des variantes de taille configurées
      const hasSizeVariants = await this.checkForSizeVariants(supabase, product.id);
      
      if (hasSizeVariants) {
        await this.showSizeVariantSelection(phoneNumber, session, product, supabase);
        return;
      }
      
      // 1. Charger les options depuis france_product_options
      const { data: productOptions, error } = await supabase
        .from('france_product_options')
        .select('*')
        .eq('product_id', product.id)
        .order('group_order', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error || !productOptions || productOptions.length === 0) {
        // PRIORITÉ 3: Vérifier steps_config si pas d'options dans france_product_options
        console.log(`🔍 [DEBUG-STEPS-CHICKEN-BOX] Produit: ${product.name}`);
        console.log(`🔍 [DEBUG-STEPS-CHICKEN-BOX] steps_config brut:`, product.steps_config);
        console.log(`🔍 [DEBUG-STEPS-CHICKEN-BOX] Type steps_config:`, typeof product.steps_config);
        
        // Convertir steps_config en objet si c'est un string JSON
        let stepsConfig = product.steps_config;
        if (typeof stepsConfig === 'string') {
          try {
            stepsConfig = JSON.parse(stepsConfig);
            console.log(`🔄 [DEBUG-STEPS-CHICKEN-BOX] steps_config parsé:`, stepsConfig);
          } catch (parseError) {
            console.error(`❌ [DEBUG-STEPS-CHICKEN-BOX] Erreur parsing JSON:`, parseError);
          }
        }
        
        if (stepsConfig && stepsConfig.steps && stepsConfig.steps.length > 0) {
          console.log(`✅ [CompositeWorkflow] Utilisation steps_config pour ${product.name}`);
          // Utiliser l'objet parsé
          const productWithParsedConfig = { ...product, steps_config: stepsConfig };
          await this.handleStepsConfigWorkflow(phoneNumber, session, productWithParsedConfig);
          return;
        } else {
          console.log(`❌ [DEBUG-STEPS-CHICKEN-BOX] steps_config invalide:`, {
            hasStepsConfig: !!stepsConfig,
            hasSteps: !!(stepsConfig && stepsConfig.steps),
            stepsLength: stepsConfig && stepsConfig.steps ? stepsConfig.steps.length : 0
          });
        }
        
        console.error('❌ [CompositeWorkflow] Pas d\'options trouvées:', error);
        await this.messageSender.sendMessage(phoneNumber, 
          `❌ Configuration non disponible pour ${product.name}.\nVeuillez choisir un autre produit.`);
        return;
      }
      
      console.log(`✅ [CompositeWorkflow] ${productOptions.length} options trouvées`);
      
      // 2. Grouper les options par group_order
      const optionGroups = this.groupOptionsByStep(productOptions);
      console.log(`📦 [CompositeWorkflow] ${optionGroups.length} groupes d'options`);
      
      // 3. Initialiser le workflow dans la session
      const workflowData = {
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        currentStep: 0,
        totalSteps: optionGroups.length,
        optionGroups: optionGroups,
        selections: {},
        completed: false
      };
      
      // 4. Démarrer avec la première étape
      await this.showWorkflowStep(phoneNumber, session, workflowData, 0);
      
    } catch (error) {
      console.error('❌ [CompositeWorkflow] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur lors de la configuration. Veuillez réessayer.');
    }
  }
  
  /**
   * Vérifier si un produit a des tailles dans les tables existantes
   * APPROCHE UNIVERSELLE - Utilise france_product_sizes d'abord
   */
  private async checkForSizeVariants(supabase: any, productId: number): Promise<boolean> {
    // Vérifier dans france_product_sizes (table existante parfaite pour les tailles)
    const { data: sizes } = await supabase
      .from('france_product_sizes')
      .select('id')
      .eq('product_id', productId);
    
    if (sizes && sizes.length > 0) {
      return true;
    }
    
    // Vérifier dans france_product_variants
    const { data: variants } = await supabase
      .from('france_product_variants')
      .select('id')
      .eq('product_id', productId)
      .eq('is_active', true);
    
    if (variants && variants.length > 0) {
      return true;
    }
    
    // Fallback vers france_product_options pour produits non encore migrés
    const { data: sizeOptions } = await supabase
      .from('france_product_options')
      .select('option_group')
      .eq('product_id', productId)
      .ilike('option_group', '%size%')
      .or('option_group.ilike.%taille%,option_group.ilike.%menu%');
    
    return sizeOptions && sizeOptions.length > 0;
  }
  
  /**
   * Affichage universel pour sélection de variantes
   * 100% UNIVERSEL - Basé sur les nouvelles tables de configuration
   */
  private async showSizeVariantSelection(
    phoneNumber: string,
    session: any,
    product: any,
    supabase: any
  ): Promise<void> {
    // 1. Récupérer les informations du restaurant et la configuration d'affichage
    const [restaurantResult, displayConfigResult, sizesResult, variantsResult] = await Promise.all([
      supabase
        .from('france_restaurants')
        .select('name')
        .eq('id', session.restaurantId)
        .single(),
      
      supabase
        .from('france_product_display_configs')
        .select('*')
        .eq('product_id', product.id)
        .single(),
        
      supabase
        .from('france_product_sizes')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)
        .order('display_order'),
        
      supabase
        .from('france_product_variants')
        .select('*')
        .eq('product_id', product.id)
        .eq('is_active', true)
        .order('display_order')
    ]);
    
    const restaurant = restaurantResult.data;
    const displayConfig = displayConfigResult.data;
    const sizes = sizesResult.data || [];
    const variants = variantsResult.data || [];
    
    // Récupérer le mode de livraison depuis la session
    const deliveryMode = session.sessionData?.deliveryMode || 'sur_place';
    console.log(`🔍 [SizeVariants] Mode de livraison: ${deliveryMode}`);
    
    // Utiliser sizes en priorité si disponible (format adapté pour tailles TACOS)
    let allVariants = sizes.length > 0 ? sizes : variants;
    
    // FILTRER selon le mode de livraison choisi
    let finalVariants = [];
    if (sizes.length > 0) {
      // Grouper les tailles par size_name et prendre le bon prix selon le mode
      const sizeGroups = new Map();
      
      sizes.forEach(size => {
        const key = size.size_name;
        if (!sizeGroups.has(key)) {
          sizeGroups.set(key, []);
        }
        sizeGroups.get(key).push(size);
      });
      
      // Pour chaque taille, prendre la variante avec le bon prix
      sizeGroups.forEach((sizeList, sizeName) => {
        // Trier par prix croissant
        sizeList.sort((a, b) => a.price_on_site - b.price_on_site);
        
        // Sélectionner la bonne variante selon le mode
        let selectedSize;
        if (deliveryMode === 'livraison') {
          // Prendre la variante avec prix livraison (généralement la plus chère)
          selectedSize = sizeList.find(s => s.price_delivery > s.price_on_site) || sizeList[sizeList.length - 1];
        } else {
          // Prendre la variante avec prix sur place (généralement la moins chère)
          selectedSize = sizeList[0];
        }
        
        finalVariants.push({
          ...selectedSize,
          variant_name: selectedSize.size_name,
          has_drink_included: selectedSize.includes_drink,
          variant_type: 'size'
        });
        
        console.log(`✅ [SizeFilter] ${sizeName}: ${deliveryMode === 'livraison' ? selectedSize.price_delivery : selectedSize.price_on_site}€`);
      });
      
      // Trier par display_order
      finalVariants.sort((a, b) => a.display_order - b.display_order);
    } else {
      // Pour les variantes classiques, adapter les colonnes
      finalVariants = allVariants.map(variant => ({
        ...variant,
        variant_name: variant.variant_name || variant.name,
        variant_type: 'variant'
      }));
    }
    
    if (finalVariants.length === 0) {
      // Fallback vers workflow standard si pas de variantes configurées
      return this.startStandardWorkflow(phoneNumber, session, product, supabase);
    }
    
    // 2. Récupérer le template de workflow si configuré
    let workflowTemplate = null;
    if (displayConfig?.template_name) {
      const { data: template } = await supabase
        .from('france_workflow_templates')
        .select('*')
        .eq('restaurant_id', session.restaurantId)
        .eq('template_name', displayConfig.template_name)
        .single();
      
      workflowTemplate = template;
    }
    
    // 3. Construire le message selon la configuration universelle
    const config = workflowTemplate?.steps_config || {};
    const emoji = displayConfig?.emoji_icon || '🍽';
    const restaurantName = restaurant?.name || 'Restaurant';
    
    let message = `${emoji} ${product.name}\n`;
    
    if (config.show_restaurant_name !== false) {
      message += `📍 ${restaurantName}\n`;
    }
    
    if (config.show_separator !== false) {
      message += '\n━━━━━━━━━━━━━━━━━━━━━\n';
    }
    
    message += `🎯 *${product.name.toUpperCase()}*\n\n`;
    
    const variantTitle = config.variant_selection?.title || displayConfig?.custom_header_text || '💰 Choisissez votre taille:';
    message += `${variantTitle}\n`;
    
    // 4. Lister les variantes selon la configuration
    const format = config.variant_selection?.format || '🔸 {variant_name} ({price} EUR) - Tapez {index}';
    
    finalVariants.forEach((variant, index) => {
      // Utiliser le prix selon le mode de livraison
      const price = deliveryMode === 'livraison' ? 
        (variant.price_delivery || variant.price_on_site + 1) : 
        (variant.price_on_site || variant.base_price);
      
      let variantLine = format
        .replace('{variant_name}', variant.variant_name)
        .replace('{price}', price)
        .replace('{index}', (index + 1).toString());
      
      message += `   ${variantLine}`;
      
      if (config.variant_selection?.show_drink_note && variant.has_drink_included) {
        message += ' (+ boisson)';
      }
      
      message += '\n';
    });
    
    message += '\n\n💡 Choisissez votre option: tapez le numéro\n';
    message += `Ex: 1 = ${finalVariants[0]?.variant_name}\n`;
    message += '(Chaque produit sera configuré individuellement)\n\n';
    
    // 5. Footer selon configuration
    const footerOptions = config.footer_options || [
      '🔙 Tapez "0" pour les catégories',
      '🛒 Tapez "00" pour voir votre commande', 
      '❌ Tapez "annuler" pour arrêter'
    ];
    
    footerOptions.forEach(option => {
      message += `${option}\n`;
    });

    await this.messageSender.sendMessage(phoneNumber, message);
    
    // Mettre à jour la session avec les variantes configurées
    console.log('🚨 [SPREAD_DEBUG_007] CompositeWorkflowExecutor ligne 381');
    const updatedData = {
      ...session.sessionData,
      variantSelection: true,
      selectedProduct: product,
      availableVariants: finalVariants,
      displayConfig: displayConfig,
      workflowTemplate: workflowTemplate,
      awaitingVariantSelection: true
    };
    
    // ✅ CENTRALISATION: Remplacer accès direct DB par SessionManager
    console.log('📝 [CompositeWorkflowExecutor:395] Mise à jour session via SessionManager');
    await this.sessionManager.updateSession(session.id, {
      botState: 'AWAITING_SIZE_SELECTION',
      sessionData: updatedData
    });
  }
  
  /**
   * Méthode fallback pour workflow standard
   */
  private async startStandardWorkflow(
    phoneNumber: string,
    session: any,
    product: any,
    supabase: any
  ): Promise<void> {
    // Continuer avec le workflow classique sans variantes
    const { data: productOptions, error } = await QueryPerformanceMonitor.measureQuery(
      'PRODUCT_OPTIONS_DOUBLE_ORDER_BY',
      supabase
        .from('france_product_options')
        .select('*')
        .eq('product_id', product.id)
        .order('group_order', { ascending: true })
        .order('display_order', { ascending: true })
    );
    
    if (error || !productOptions || productOptions.length === 0) {
      console.error('❌ [StandardWorkflow] Pas d\'options trouvées:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Configuration non disponible pour ${product.name}.\nVeuillez choisir un autre produit.`);
      return;
    }
    
    const optionGroups = this.groupOptionsByStep(productOptions);
    
    const workflowData = {
      productId: product.id,
      productName: product.name,
      productPrice: product.base_price || product.price_on_site_base,
      currentStep: 0,
      totalSteps: optionGroups.length,
      optionGroups: optionGroups,
      selections: {},
      completed: false
    };
    
    await this.showWorkflowStep(phoneNumber, session, workflowData, 0);
  }
  
  /**
   * Retour aux catégories - Reset session et affichage menu
   */
  async returnToCategories(phoneNumber: string, session: any): Promise<void> {
    console.log(`🔙 [returnToCategories] Retour aux catégories demandé`);
    
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);

      // Reset session state vers AWAITING_MENU_CHOICE
      console.log('🚨 [SPREAD_DEBUG_008] CompositeWorkflowExecutor ligne 451');
      const updatedData = {
        ...session.sessionData,
        selectedProduct: null,
        availableVariants: null,
        compositeWorkflow: null
      };

      // ✅ CENTRALISATION: Remplacer accès direct DB par SessionManager
      console.log('📝 [CompositeWorkflowExecutor:463] Mise à jour session via SessionManager');
      await this.sessionManager.updateSession(session.id, {
        botState: 'AWAITING_MENU_CHOICE',
        sessionData: updatedData
      });

      // DUPLICATION EXACTE de showMenuAfterDeliveryModeChoice()
      const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;
      const deliveryMode = session.sessionData?.deliveryMode;
      
      // Récupérer l'objet restaurant depuis la BDD
      const restaurant = await supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
      
      if (!restaurant.data) {
        console.error('❌ [returnToCategories] Restaurant non trouvé pour ID:', restaurantId);
        await this.messageSender.sendMessage(phoneNumber, '❌ Restaurant non trouvé. Tapez "resto" pour recommencer.');
        return;
      }
      
      // Chargement dynamique des catégories depuis la BDD
      console.log(`🔍 [CATBUG_DEBUG] Restaurant ID utilisé: ${restaurant.data.id}`);
      
      const { data: categories, error: catError } = await supabase
        .from('france_menu_categories')
        .select('*')
        .eq('restaurant_id', restaurant.data.id)
        .eq('is_active', true)
        .order('display_order');

      console.log(`🔍 [CATBUG_DEBUG] Catégories récupérées depuis BDD: ${categories ? categories.length : 'null'}`);
      if (categories) {
        console.log(`🔍 [CATBUG_DEBUG] Premières catégories: ${categories.slice(0, 5).map(c => c.name).join(', ')}`);
        console.log(`🔍 [CATBUG_DEBUG] Dernières catégories: ${categories.slice(-3).map(c => c.name).join(', ')}`);
      }

      if (catError || !categories || categories.length === 0) {
        console.error('❌ Erreur catégories:', catError);
        await this.messageSender.sendMessage(phoneNumber, `❌ Menu temporairement indisponible pour ${restaurant.data.name}.\n\n💡 Contactez le restaurant directement ou réessayez plus tard.`);
        return;
      }

      // Construction dynamique du menu
      let menuText = `🍽️ *MENU ${restaurant.data.name.toUpperCase()}*\n`;
      
      // Afficher le mode choisi
      const modeEmoji = deliveryMode === 'sur_place' ? '📍' : deliveryMode === 'a_emporter' ? '📦' : '🚚';
      const modeText = deliveryMode === 'sur_place' ? 'Sur place' : deliveryMode === 'a_emporter' ? 'À emporter' : 'Livraison';
      menuText += `${modeEmoji} *Mode: ${modeText}*\n\n`;
      
      categories.forEach((category, index) => {
        const displayNumber = `${index + 1}.`;
        menuText += `${displayNumber} ${category.icon || '🍽️'} ${category.name}\n`;
      });
      
      menuText += '\nTapez le numéro de votre choix pour voir les produits.';

      await this.messageSender.sendMessage(phoneNumber, menuText);
      
      // Mettre à jour la session vers VIEWING_MENU (comme dans showMenuAfterDeliveryModeChoice)
      console.log('🚨 [SPREAD_DEBUG_009] CompositeWorkflowExecutor ligne 525');
      const updatedSessionData = {
        ...session.sessionData,
        categories: categories,
        deliveryMode: deliveryMode,
        selectedServiceMode: deliveryMode,
        cart: session.sessionData?.cart || {},
        totalPrice: session.sessionData?.totalPrice || 0,
        selectedProduct: null,
        availableVariants: null,
        compositeWorkflow: null
      };
      
      console.log(`🔍 [CATBUG_DEBUG] AVANT sauvegarde session - categories.length: ${categories.length}`);
      console.log(`🔍 [CATBUG_DEBUG] updatedSessionData.categories.length: ${updatedSessionData.categories.length}`);
      console.log(`🔍 [CATBUG_DEBUG] Dernières categories dans updatedSessionData: ${updatedSessionData.categories.slice(-3).map(c => c.name).join(', ')}`);
      
      console.log(`🔄 [STATE_DEBUG] AVANT mise à jour état - Ancien état: ${session.botState}`);
      console.log(`🔄 [STATE_DEBUG] Transition vers: VIEWING_MENU`);
      
      const { error: updateError } = await supabase
        .from('france_user_sessions')
        .update({
          bot_state: 'VIEWING_MENU',
          session_data: updatedSessionData
        })
        .eq('id', session.id);
        
      if (updateError) {
        console.error(`❌ [CATBUG_DEBUG] Erreur sauvegarde session:`, updateError);
        console.error(`❌ [STATE_DEBUG] Échec transition état vers VIEWING_MENU`);
      } else {
        console.log(`✅ [CATBUG_DEBUG] Session sauvegardée avec ${categories.length} catégories`);
        console.log(`✅ [STATE_DEBUG] État transitionné vers VIEWING_MENU`);
      }
      
      // Vérifier ce qui a été vraiment sauvegardé
      const { data: verifySession } = await supabase
        .from('france_user_sessions')
        .select('bot_state, session_data')
        .eq('id', session.id)
        .single();
        
      if (verifySession) {
        const savedCategories = verifySession.session_data?.categories || [];
        const savedState = verifySession.bot_state;
        
        console.log(`🔍 [CATBUG_DEBUG] APRÈS sauvegarde - categories sauvegardées: ${savedCategories.length}`);
        console.log(`🔍 [STATE_DEBUG] APRÈS sauvegarde - état sauvegardé: ${savedState}`);
        
        if (savedCategories.length !== categories.length) {
          console.error(`❌ [CATBUG_DEBUG] PROBLÈME ! ${categories.length} catégories envoyées mais ${savedCategories.length} sauvegardées`);
        }
        if (savedState !== 'VIEWING_MENU') {
          console.error(`❌ [STATE_DEBUG] PROBLÈME ! État attendu: VIEWING_MENU, État sauvegardé: ${savedState}`);
        }
      }
      
      console.log(`✅ [returnToCategories] Menu catégories affiché`);

    } catch (error) {
      console.error('❌ [returnToCategories] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors du retour au menu. Tapez "resto" pour recommencer.');
    }
  }

  /**
   * Traitement universel sélection de variante
   * 100% UNIVERSEL - Utilise les nouvelles tables de configuration
   */
  async handleSizeSelection(
    phoneNumber: string,
    session: any,
    message: string
  ): Promise<void> {
    // Traitement spécial pour "0" - retour aux catégories
    if (message.trim() === '0') {
      await this.returnToCategories(phoneNumber, session);
      return;
    }

    const choice = parseInt(message.trim());
    const availableVariants = session.sessionData?.availableVariants;
    
    if (!availableVariants || choice < 1 || choice > availableVariants.length) {
      await this.messageSender.sendMessage(phoneNumber,
        `❌ Choix invalide. Tapez un numéro entre 1 et ${availableVariants?.length || 0}.`);
      return;
    }
    
    // Récupérer la variante sélectionnée depuis la configuration universelle
    const selectedVariant = availableVariants[choice - 1];
    const product = session.sessionData.selectedProduct;
    const finalPrice = selectedVariant.price_on_site || selectedVariant.base_price;
    
    console.log(`✅ [VariantSelection] Sélection: ${selectedVariant.variant_name} (${finalPrice}€)`);
    
    // Construire le nom complet du produit avec variante
    const fullProductName = `${product.name} ${selectedVariant.variant_name}`;
    
    // Passer à la configuration des ingrédients avec la nouvelle architecture
    await this.startUniversalConfiguration(phoneNumber, session, selectedVariant, finalPrice, fullProductName);
  }
  
  /**
   * Démarrage configuration universelle après sélection variante
   * COMPLÈTEMENT UNIVERSEL - PAS DE HARDCODING
   */
  private async startUniversalConfiguration(
    phoneNumber: string,
    session: any,
    selectedVariant: any,
    finalPrice: number,
    fullProductName?: string
  ): Promise<void> {
    console.log(`🔧 [UniversalConfig] Démarrage configuration ${selectedVariant.variant_name}`);
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    // Charger TOUTES les options du produit (pas de filtrage de taille car c'est dans les variantes maintenant)
    const { data: productOptions, error } = await supabase
      .from('france_product_options')
      .select('*')
      .eq('product_id', session.sessionData.selectedProduct.id)
      .order('group_order', { ascending: true })
      .order('display_order', { ascending: true });
    
    if (error || !productOptions) {
      console.error('❌ [UniversalConfig] Erreur options:', error);
      return;
    }
    
    // Grouper les options
    const optionGroups = this.groupOptionsByStep(productOptions);
    
    // Utiliser le nom complet du produit
    const product = session.sessionData.selectedProduct;
    const productName = fullProductName || `${product.name} ${selectedVariant.variant_name}`;
    
    // Initialiser le workflow universel avec variante
    const workflowData = {
      productId: product.id,
      productName: productName,
      productPrice: finalPrice,
      selectedVariant: selectedVariant,
      currentStep: 0,
      totalSteps: optionGroups.length,
      optionGroups: optionGroups,
      selections: {
        // Pré-remplir avec la sélection de variante
        [selectedVariant.variant_type]: [selectedVariant]
      },
      completed: false
    };
    
    // Démarrer avec la première étape
    await this.showUniversalWorkflowStep(phoneNumber, session, workflowData, 0);
  }
  
  /**
   * Affichage étape workflow universel avec template adaptatif
   * BASÉ SUR LA CONFIGURATION - PLUS D'HARDCODING TACOS
   */
  private async showUniversalWorkflowStep(
    phoneNumber: string,
    session: any,
    workflowData: any,
    stepIndex: number
  ): Promise<void> {
    const optionGroup = workflowData.optionGroups[stepIndex];
    
    if (!optionGroup) {
      // Workflow terminé
      await this.completeUniversalWorkflow(phoneNumber, session, workflowData);
      return;
    }
    
    // Template adaptatif basé sur la configuration
    let message = `🔧 *Configuration: ${workflowData.productName}*\n\n`;
    message += `📋 *${optionGroup.displayName.toUpperCase()}*`;
    
    if (optionGroup.isRequired) {
      message += ' (obligatoire)';
    }
    message += '\n\n';
    
    // Lister les options avec numérotation simple compatible mobile
    optionGroup.options.forEach((option: any, index: number) => {
      message += `${index + 1}. ${option.option_name}`;
      if (option.price_modifier && option.price_modifier > 0) {
        message += ` (+${option.price_modifier}€)`;
      }
      message += '\n';
    });
    
    message += '\n💡 Pour choisir votre ';
    message += optionGroup.groupName === 'viande' ? 'viande' : optionGroup.displayName.toLowerCase();
    message += ': tapez les numéros\n';
    message += `Ex: 1 = ${optionGroup.options[0]?.option_name}\n\n`;
    message += '00 - Finaliser cette étape\n';
    message += '000 - Ajouter au panier et continuer\n';
    message += '0000 - Recommencer la configuration\n\n';
    message += '❌ Tapez "annuler" pour arrêter';
    
    await this.messageSender.sendMessage(phoneNumber, message);
    
    // Mettre à jour la session
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    const updatedData = {
      ...session.sessionData,
      universalWorkflow: workflowData,
      awaitingUniversalWorkflowInput: true
    };
    
    await supabase
      .from('france_user_sessions')
      .update({
        bot_state: 'AWAITING_UNIVERSAL_WORKFLOW',
        session_data: updatedData
      })
      .eq('id', session.id);
  }
  
  /**
   * Finalisation workflow universel
   */
  private async completeUniversalWorkflow(
    phoneNumber: string,
    session: any,
    workflowData: any
  ): Promise<void> {
    // Récapitulatif avec format standard universel
    const productName = workflowData.productName.split(' ')[0]; // Ex: "TACOS" depuis "TACOS MENU M"
    let recap = `✅ *${productName} configuré avec succès !*\n\n`;
    recap += `🍽 *${workflowData.productName} (${workflowData.productPrice} EUR)*\n`;
    
    for (const [groupName, selections] of Object.entries(workflowData.selections)) {
      const items = (selections as any[]).map(s => s.option_name).join(', ');
      const displayName = this.getGroupDisplayName(groupName);
      recap += `• ${displayName}: ${items}\n`;
    }
    
    recap += `\n*Que souhaitez-vous faire ?*\n`;
    recap += `1 Ajouter au panier\n`;
    recap += `2 Recommencer\n`;
    recap += `0 Retour menu`;
    
    await this.messageSender.sendMessage(phoneNumber, recap);
    
    // Mettre à jour session
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    const updatedData = {
      ...session.sessionData,
      selectedProduct: {
        id: workflowData.productId,
        name: workflowData.productName,
        price: workflowData.productPrice,
        configuration: workflowData.selections
      },
      universalWorkflow: null,
      awaitingWorkflowActions: true
    };
    
    await supabase
      .from('france_user_sessions')
      .update({
        bot_state: 'AWAITING_WORKFLOW_ACTIONS',
        session_data: updatedData
      })
      .eq('id', session.id);
  }
  
  /**
   * Traitement universel des réponses workflow
   */
  async handleUniversalWorkflowResponse(
    phoneNumber: string,
    session: any,
    message: string
  ): Promise<void> {
    console.log(`🚨 [UniversalWorkflow] ENTRÉE DANS handleUniversalWorkflowResponse`);
    console.log(`🚨 [UniversalWorkflow] Message reçu: "${message}"`);
    console.log(`🚨 [UniversalWorkflow] Session complète:`, JSON.stringify(session.sessionData, null, 2));
    
    // Vérifier si c'est un workflow menu pizza
    if (session.sessionData?.menuPizzaWorkflow) {
        await this.handleMenuPizzaResponse(phoneNumber, session, message);
        return;
    }
    
    const workflowData = session.sessionData?.universalWorkflow;
    
    if (!workflowData) {
      console.error('❌ [UniversalWorkflow] Pas de workflow en cours - workflowData est undefined/null');
      console.error('❌ [UniversalWorkflow] Session.sessionData disponible:', Object.keys(session.sessionData || {}));
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur de session. Veuillez recommencer.');
      return;
    }
    
    // AVANT parseUserSelection, ajouter :
    const choice = message.trim();
    if (choice === '99' || choice === '00' || choice === '0') {
      // Déléguer aux actions existantes
      return await this.handleCartActions(phoneNumber, session, message);
    }
    
    const currentStep = workflowData.currentStep;
    const optionGroup = workflowData.optionGroups[currentStep];
    
    console.log(`🔍 [UniversalWorkflow] Traitement réponse étape ${currentStep}: "${message}"`);
    console.log(`🔍 [UniversalWorkflow] Option group actuel:`, JSON.stringify(optionGroup, null, 2));
    
    // Valider et parser la sélection
    console.log(`🔍 [UniversalWorkflow] Appel parseUserSelection avec message: "${message}"`);
    const selections = this.parseUserSelection(message, optionGroup);
    console.log(`🔍 [UniversalWorkflow] Résultat parseUserSelection:`, selections);
    
    if (!selections || selections.length === 0) {
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Sélection invalide.\n${this.getSelectionHelp(optionGroup)}`);
      return;
    }
    
    // Valider les contraintes
    console.log(`🔍 [UniversalWorkflow] Appel validateSelections...`);
    const validation = this.validateSelections(selections, optionGroup);
    console.log(`🔍 [UniversalWorkflow] Résultat validation:`, validation);
    
    if (!validation.valid) {
      console.log(`❌ [UniversalWorkflow] Validation échouée: ${validation.error}`);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ ${validation.error}\n${this.getSelectionHelp(optionGroup)}`);
      return;
    }
    
    console.log(`✅ [UniversalWorkflow] Validation réussie, stockage des sélections...`);
    
    // Stocker les sélections
    const selectedOptions = selections.map(s => optionGroup.options[s - 1]);
    workflowData.selections[optionGroup.groupName] = selectedOptions;
    
    // LOGIQUE UNIVERSELLE : Déterminer la prochaine étape selon les règles conditionnelles
    console.log(`🚨 [UniversalWorkflow] Appel determineNextStep pour groupe: ${optionGroup.groupName}`);
    const nextStep = await this.determineNextStep(workflowData, selectedOptions, optionGroup);
    workflowData.currentStep = nextStep;
    
    console.log(`🔄 [UniversalWorkflow] Passage à l'étape ${workflowData.currentStep}`);
    console.log(`🔄 [UniversalWorkflow] Total étapes: ${workflowData.optionGroups.length}`);
    
    // Afficher un récap de la sélection
    const selectedNames = selectedOptions.map(s => s.option_name).join(', ');
    await this.messageSender.sendMessage(phoneNumber, 
      `✅ ${optionGroup.displayName}: ${selectedNames}`);
    
    // Passer à l'étape suivante
    await this.showUniversalWorkflowStep(phoneNumber, session, workflowData, workflowData.currentStep);
  }
  
  /**
   * Afficher une étape du workflow
   * SOLID : Command Pattern - Chaque étape est une commande
   */
  async showWorkflowStep(
    phoneNumber: string,
    session: any,
    workflowData: any,
    stepIndex: number
  ): Promise<void> {
    console.log(`🚨 [DEBUG-showWorkflowStep] ENTRÉE - stepIndex: ${stepIndex}`);
    console.log(`🚨 [DEBUG-showWorkflowStep] optionGroups.length: ${workflowData.optionGroups.length}`);
    console.log(`🔍 [DEBUG-showWorkflowStep] optionGroups:`, workflowData.optionGroups.map(g => g.groupName));
    
    const optionGroup = workflowData.optionGroups[stepIndex];
    
    console.log(`🚨 [DEBUG-showWorkflowStep] optionGroup:`, optionGroup ? `${optionGroup.groupName}` : 'undefined');
    
    if (!optionGroup) {
      // Workflow terminé - demander la quantité
      console.log(`🚨 [DEBUG-showWorkflowStep] PAS D'OPTION GROUP - Appel completeWorkflow`);
      await this.completeWorkflow(phoneNumber, session, workflowData);
      return;
    }
    
    console.log(`📝 [WorkflowStep] Étape ${stepIndex + 1}/${workflowData.totalSteps}: ${optionGroup.groupName}`);
    
    // Construire le message selon le type d'options
    let message = this.buildStepMessage(workflowData, optionGroup);
    
    await this.messageSender.sendMessage(phoneNumber, message);
    
    // Mettre à jour la session avec l'état du workflow
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    const updatedData = {
      ...session.sessionData,
      compositeWorkflow: workflowData,
      awaitingWorkflowInput: true
    };
    
    await supabase
      .from('france_user_sessions')
      .update({
        bot_state: 'COMPOSITE_WORKFLOW_STEP',
        session_data: updatedData
      })
      .eq('id', session.id);
  }
  
  /**
   * Traiter la réponse utilisateur pour une étape
   * SOLID : Single Responsibility - Validation et traitement séparés
   */
  async handleWorkflowStepResponse(
    phoneNumber: string,
    session: any,
    message: string
  ): Promise<void> {
    const workflowData = session.sessionData?.compositeWorkflow;
    
    if (!workflowData) {
      console.error('❌ [WorkflowStep] Pas de workflow en cours');
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur de session. Veuillez recommencer.');
      return;
    }
    
    const currentStep = workflowData.currentStep;
    const optionGroup = workflowData.optionGroups[currentStep];
    
    console.log(`🔍 [WorkflowStep] Traitement réponse étape ${currentStep}: "${message}"`);
    
    // Valider et parser la sélection
    const selections = this.parseUserSelection(message, optionGroup);
    
    if (!selections || selections.length === 0) {
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Sélection invalide.\n${this.getSelectionHelp(optionGroup)}`);
      return;
    }
    
    // Valider les contraintes (min/max selections)
    const validation = this.validateSelections(selections, optionGroup);
    
    if (!validation.valid) {
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ ${validation.error}\n${this.getSelectionHelp(optionGroup)}`);
      return;
    }
    
    // Stocker les sélections
    const selectedOptions = selections.map(s => optionGroup.options[s - 1]);
    workflowData.selections[optionGroup.groupName] = selectedOptions;
    
    // Afficher un récap de la sélection
    const selectedNames = selectedOptions.map(s => s.option_name).join(', ');
    await this.messageSender.sendMessage(phoneNumber, 
      `✅ ${optionGroup.displayName}: ${selectedNames}`);
    
    // LOGIQUE UNIVERSELLE : Déterminer la prochaine étape selon les règles conditionnelles
    const nextStep = await this.determineNextStep(workflowData, selectedOptions, optionGroup);
    workflowData.currentStep = nextStep;
    
    // Passer à l'étape suivante
    
    // CORRECTION : Vérifier si le workflow est terminé avant d'appeler showWorkflowStep
    if (workflowData.currentStep >= workflowData.optionGroups.length) {
      console.log(`✅ [Workflow] Workflow terminé - Appel completeUniversalWorkflow`);
      await this.completeUniversalWorkflow(phoneNumber, session, workflowData);
    } else {
      await this.showWorkflowStep(phoneNumber, session, workflowData, workflowData.currentStep);
    }
  }
  
  /**
   * LOGIQUE UNIVERSELLE : Déterminer la prochaine étape selon les règles conditionnelles
   * Compatible avec tous les restaurants et types de produits
   */
  private async determineNextStep(
    workflowData: any, 
    selectedOptions: any[], 
    currentGroup: any
  ): Promise<number> {
    console.log(`🚨 [DEBUG-determineNextStep] ENTRÉE - currentStep: ${workflowData.currentStep}`);
    console.log(`🚨 [DEBUG-determineNextStep] currentGroup:`, JSON.stringify(currentGroup, null, 2));
    console.log(`🚨 [DEBUG-determineNextStep] selectedOptions:`, JSON.stringify(selectedOptions, null, 2));
    
    const currentStep = workflowData.currentStep;
    let nextStep = currentStep + 1;
    
    console.log(`🚨 [DEBUG-determineNextStep] nextStep initial: ${nextStep}`);
    
    // Règle universelle : Si choix "Pas de..." dans un groupe X_choice, 
    // skipper les groupes facultatifs suivants du même type
    if (currentGroup.groupName.includes('_choice')) {
      console.log(`🚨 [DEBUG-determineNextStep] Groupe _choice détecté: ${currentGroup.groupName}`);
      const selectedChoice = selectedOptions[0]?.option_name?.toLowerCase();
      console.log(`🚨 [DEBUG-determineNextStep] selectedChoice: "${selectedChoice}"`);
      
      // Détecter les choix négatifs universels (pas de, sans, aucun, etc.)
      const negativeChoices = ['pas de', 'sans', 'aucun', 'no ', 'none'];
      const isNegativeChoice = negativeChoices.some(neg => selectedChoice?.includes(neg));
      console.log(`🚨 [DEBUG-determineNextStep] isNegativeChoice: ${isNegativeChoice}`);
      
      if (isNegativeChoice) {
        console.log(`🔄 [Workflow] Choix négatif détecté: "${selectedChoice}" - Recherche de groupes à skipper`);
        
        // Chercher le groupe principal associé (ex: extras_choice -> extras)
        const baseGroupName = currentGroup.groupName.replace('_choice', '');
        
        // Skipper tous les groupes facultatifs suivants de même type
        while (nextStep < workflowData.optionGroups.length) {
          const nextGroup = workflowData.optionGroups[nextStep];
          
          // Si le groupe suivant est facultatif ET du même type, le skipper
          if (!nextGroup.isRequired && nextGroup.groupName.startsWith(baseGroupName)) {
            console.log(`⏭️ [Workflow] Skip groupe facultatif: ${nextGroup.groupName}`);
            nextStep++;
          } else {
            break; // Arrêter au premier groupe obligatoire ou différent
          }
        }
      }
    }
    
    console.log(`📍 [Workflow] Étape ${currentStep} -> ${nextStep} (total: ${workflowData.optionGroups.length})`);
    console.log(`🚨 [DEBUG-determineNextStep] SORTIE - nextStep final: ${nextStep}`);
    
    // VÉRIFICATION CRITIQUE : Si nextStep dépasse le nombre d'étapes
    if (nextStep >= workflowData.optionGroups.length) {
      console.log(`🚨 [DEBUG-determineNextStep] nextStep (${nextStep}) >= optionGroups.length (${workflowData.optionGroups.length}) - Workflow terminé`);
    } else {
      console.log(`🚨 [DEBUG-determineNextStep] Prochaine étape: ${workflowData.optionGroups[nextStep]?.groupName}`);
    }
    
    return nextStep;
  }

  /**
   * Finaliser le workflow et demander la quantité
   */
  private async completeWorkflow(
    phoneNumber: string,
    session: any,
    workflowData: any
  ): Promise<void> {
    console.log('✅ [CompositeWorkflow] Workflow terminé, récapitulatif');
    
    // Construire le récapitulatif
    let recap = `📝 *RÉCAPITULATIF ${workflowData.productName.toUpperCase()}*\n\n`;
    
    // Si c'est un produit avec steps_config (CHICKEN BOX, etc.)
    if (workflowData.originalStepsConfig && workflowData.originalStepsConfig.final_format) {
      // Utiliser le format final défini dans steps_config
      let finalDescription = workflowData.originalStepsConfig.final_format;
      
      // Remplacer les placeholders par les sélections
      for (const [groupName, selections] of Object.entries(workflowData.selections)) {
        const selectedValue = (selections as any[])[0]?.name || '';
        finalDescription = finalDescription.replace(`{${groupName}}`, selectedValue);
      }
      
      recap += `🍟 ${finalDescription}\n`;
    } else {
      // Format standard pour les autres produits
      for (const [groupName, selections] of Object.entries(workflowData.selections)) {
        const items = (selections as any[]).map(s => s.option_name || s.name).join(', ');
        const emoji = this.getGroupEmoji(groupName);
        recap += `${emoji} ${this.getGroupDisplayName(groupName)}: ${items}\n`;
      }
    }
    
    recap += `\n💰 Prix unitaire: ${workflowData.productPrice}€\n`;
    recap += `\n📝 Ex: 1 pour 1 produit, 1,1 pour 2 fois le même produit`;
    
    await this.messageSender.sendMessage(phoneNumber, recap);
    
    // Ajouter directement au panier avec quantité 1
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    // Simuler handleQuantityInput avec quantité 1
    const selectedProduct = {
      id: workflowData.productId,
      name: workflowData.productName,
      price: workflowData.productPrice,
      configuration: workflowData.selections
    };
    
    const rawCart = session.sessionData?.cart || [];
    const cart = Array.isArray(rawCart) ? rawCart : [];
    
    // 🔍 CATEGORY_WORKFLOW_DEBUG - Analyser pourquoi currentCategoryName est absent
    console.log('🔍 CATEGORY_WORKFLOW_DEBUG - CompositeWorkflowExecutor.completeWorkflow:', {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      currentCategoryName: session.sessionData?.currentCategoryName,
      categoryNameUsed: session.sessionData?.currentCategoryName || 'Produit',
      sessionData: {
        currentCategoryName: session.sessionData?.currentCategoryName,
        selectedRestaurantId: session.sessionData?.selectedRestaurantId,
        currentState: session.sessionData?.currentState,
        previousState: session.sessionData?.previousState
      }
    });
    
    cart.push({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      categoryName: session.sessionData?.currentCategoryName || 'Produit',
      quantity: 1,
      unitPrice: selectedProduct.price,
      totalPrice: selectedProduct.price,
      configuration: selectedProduct.configuration
    });
    
    const updatedData = {
      ...session.sessionData,
      cart: cart,
      selectedProduct: null,
      compositeWorkflow: null
    };
    
    await supabase
      .from('france_user_sessions')
      .update({
        bot_state: 'SELECTING_PRODUCTS',
        session_data: updatedData
      })
      .eq('id', session.id);
  }
  
  /**
   * Grouper les options par étape
   */
  private groupOptionsByStep(options: any[]): any[] {
    const groups: { [key: number]: any } = {};
    
    options.forEach(option => {
      const groupOrder = option.group_order || 0;
      
      if (!groups[groupOrder]) {
        groups[groupOrder] = {
          groupName: option.option_group,
          displayName: this.getGroupDisplayName(option.option_group),
          groupOrder: groupOrder,
          isRequired: option.is_required || false,
          maxSelections: option.max_selections || 1,
          options: []
        };
      }
      
      groups[groupOrder].options.push(option);
    });
    
    return Object.values(groups).sort((a, b) => a.groupOrder - b.groupOrder);
  }
  
  /**
   * Construire le message pour une étape
   */
  private buildStepMessage(workflowData: any, optionGroup: any): string {
    const stepNumber = workflowData.currentStep + 1;
    const totalSteps = workflowData.totalSteps;
    
    let message = `📋 *${workflowData.productName.toUpperCase()}* - Étape ${stepNumber}/${totalSteps}\n\n`;
    
    const emoji = this.getGroupEmoji(optionGroup.groupName);
    message += `${emoji} *${optionGroup.displayName.toUpperCase()}*`;
    
    if (optionGroup.maxSelections > 1) {
      message += ` (${optionGroup.maxSelections} maximum)`;
    }
    message += '\n\n';
    
    // Utiliser les noms d'options tels qu'ils sont dans la base (ils contiennent déjà ⿡⿢⿣)
    optionGroup.options.forEach((option: any, index: number) => {
      // Ne pas nettoyer les caractères ⿡⿢⿣ - ils sont les vrais numéros !
      message += `${option.option_name}`;
      if (option.price_adjustment && option.price_adjustment > 0) {
        message += ` (+${option.price_adjustment}€)`;
      }
      message += '\n';
    });
    
    message += '\n' + this.getSelectionHelp(optionGroup);
    
    return message;
  }
  
  /**
   * Parser la sélection utilisateur
   */
  private parseUserSelection(message: string, optionGroup: any): number[] | null {
    const trimmed = message.trim();
    
    // Si une seule sélection attendue
    if (optionGroup.maxSelections === 1) {
      const num = parseInt(trimmed);
      if (!isNaN(num) && num >= 1 && num <= optionGroup.options.length) {
        return [num];
      }
      return null;
    }
    
    // Sélections multiples (format: "1,3,5" ou "1 3 5")
    const parts = trimmed.split(/[,\s]+/);
    const selections: number[] = [];
    
    for (const part of parts) {
      const num = parseInt(part);
      if (isNaN(num) || num < 1 || num > optionGroup.options.length) {
        return null;
      }
      if (!selections.includes(num)) {
        selections.push(num);
      }
    }
    
    return selections.length > 0 ? selections : null;
  }
  
  /**
   * Valider les sélections
   */
  private validateSelections(selections: number[], optionGroup: any): { valid: boolean; error?: string } {
    if (optionGroup.isRequired && selections.length === 0) {
      return { valid: false, error: 'Cette sélection est obligatoire' };
    }
    
    if (selections.length > optionGroup.maxSelections) {
      return { valid: false, error: `Maximum ${optionGroup.maxSelections} sélection(s) autorisée(s)` };
    }
    
    return { valid: true };
  }
  
  /**
   * Obtenir l'aide pour la sélection
   */
  private getSelectionHelp(optionGroup: any): string {
    if (optionGroup.maxSelections === 1) {
      return '💡 Tapez le numéro de votre choix';
    } else {
      return `💡 Tapez ${optionGroup.maxSelections} numéros séparés par une virgule\nExemple: 1,3 pour les choix 1 et 3`;
    }
  }
  
  /**
   * Obtenir l'emoji pour un groupe
   */
  private getGroupEmoji(groupName: string): string {
    const emojis: { [key: string]: string } = {
      'viande': '🥩',
      'viandes': '🥩',
      'sauce': '🍟',
      'sauces': '🍟',
      'extras': '➕',
      'extras_choice': '❓',
      'supplements': '🧀',
      'boisson': '🥤',
      'boissons': '🥤',
      'accompagnement': '🍟',
      'taille': '📏',
      'size': '📏'
    };
    
    return emojis[groupName.toLowerCase()] || '📋';
  }

  /**
   * Récupérer les options par groupe depuis france_product_options
   */
  private async getOptionsByGroup(productId: number, optionGroup: string, filterVariant?: string): Promise<any[]> {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);

    let query = supabase
      .from('france_product_options')
      .select('*')
      .eq('product_id', productId)
      .eq('option_group', optionGroup)
      .eq('is_active', true)
      .order('display_order');

    if (filterVariant) {
      query = query.ilike('option_name', `%${filterVariant}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [getOptionsByGroup] Erreur requête:', error);
      return [];
    }

    return (data || []).map((option, index) => ({
      id: option.id,
      name: option.option_name,
      option_name: option.option_name,
      price_modifier: option.price_modifier || 0,
      is_available: true
    }));
  }
  
  /**
   * Obtenir le nom d'affichage pour un groupe
   */
  private getGroupDisplayName(groupName: string): string {
    const displayNames: { [key: string]: string } = {
      'viande': 'Viandes',
      'viandes': 'Viandes',
      'sauce': 'Sauces',
      'sauces': 'Sauces',
      'extras': 'Suppléments',
      'extras_choice': 'Suppléments',
      'supplements': 'Suppléments',
      'boisson': 'Boisson',
      'boissons': 'Boissons',
      'accompagnement': 'Accompagnement',
      'taille': 'Taille',
      'size': 'Taille'
    };
    
    return displayNames[groupName.toLowerCase()] || groupName;
  }

  /**
   * PRIORITÉ 3: Gérer les produits avec steps_config (CHICKEN BOX)
   */
  private async handleStepsConfigWorkflow(
    phoneNumber: string,
    session: any,
    product: any
  ): Promise<void> {
    try {
      const steps = product.steps_config.steps;
      
      // Transformer steps_config en optionGroups compatible avec le système existant
      const optionGroups = await Promise.all(steps.map(async (step: any, stepIndex: number) => {
        // Extraire le nom du groupe depuis le titre (ex: "Choisissez votre viande" -> "viande")
        let groupName = `step_${stepIndex + 1}`;
        if (step.title.toLowerCase().includes('viande')) {
          groupName = 'viande';
        } else if (step.title.toLowerCase().includes('boisson')) {
          groupName = 'boisson';
        }
        
        // Système hybride : DB si option_group défini, sinon steps_config.options
        let options;
        if (step.option_group) {
          // Requête dynamique depuis france_product_options
          options = await this.getOptionsByGroup(product.id, step.option_group, step.filter_variant);
        } else {
          // Fallback : utiliser step.options sans numérotation (déjà incluse)
          options = step.options.map((optionName: string, optIndex: number) => ({
            id: optIndex + 1,
            name: optionName,
            option_name: optionName,
            price_modifier: step.price_modifier || 0,
            is_available: true
          }));
        }
        
        return {
          groupName: groupName,
          displayName: step.title,
          type: step.type || 'single_choice',
          required: true,
          minSelections: 1,
          maxSelections: 1,
          options: options
        };
      }));
      
      // Créer workflowData compatible avec le système existant
      const workflowData = {
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        currentStep: 0,
        totalSteps: optionGroups.length,
        optionGroups: optionGroups,
        selections: {},
        completed: false,
        // Garder une référence au steps_config original pour le format final
        originalStepsConfig: product.steps_config
      };
      
      console.log(`🍟 [StepsConfig] Workflow transformé pour ${product.name}:`, {
        totalSteps: workflowData.totalSteps,
        groups: optionGroups.map(g => g.groupName)
      });
      
      // Utiliser showUniversalWorkflowStep pour afficher la première étape
      await this.showUniversalWorkflowStep(phoneNumber, session, workflowData, 0);
      
    } catch (error) {
      console.error('❌ [StepsConfig] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Erreur configuration ${product.name}.\nVeuillez réessayer.`);
    }
  }

  // ============================================
  // MÉTHODES POUR LE WORKFLOW MENU PIZZA
  // ============================================

  /**
   * Initialiser le workflow menu pizza dans la session
   */
  private async initializeMenuWorkflow(phoneNumber: string, session: any, product: any, menuConfig: any): Promise<void> {
    console.log(`🔍 DEBUG_MENU: DÉBUT initializeMenuWorkflow`);
    console.log(`🔍 DEBUG_MENU: menuConfig reçu:`, menuConfig);
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    console.log(`🔍 DEBUG_MENU: Supabase client créé`);

    // Créer les données du workflow
    const workflowData = {
      product: product,
      menuConfig: menuConfig,
      currentComponent: 0,
      selections: {},
      waitingFor: null,
      expectedQuantity: null,
      selectionMode: null
    };
    
    console.log(`🔍 DEBUG_MENU: workflowData créé:`, workflowData);
    console.log(`🔍 DEBUG_MENU: Tentative mise à jour session ID: ${session.id}`);

    // Mettre à jour la session
    const { data: updateResult, error: updateError } = await supabase
      .from('france_user_sessions')
      .update({
        bot_state: 'MENU_PIZZA_WORKFLOW',
        session_data: {
          ...session.sessionData,
          menuPizzaWorkflow: workflowData
        }
      })
      .eq('id', session.id);

    if (updateError) {
      console.error(`🔍 DEBUG_MENU: ERREUR mise à jour session:`, updateError);
      throw updateError;
    }
    
    console.log(`🔍 DEBUG_MENU: Session mise à jour avec succès:`, updateResult);
    console.log(`✅ [MenuPizza] Workflow initialisé pour ${product.name}`);
  }

  /**
   * Traiter le composant suivant du menu
   */
  private async processNextMenuComponent(phoneNumber: string, session: any, componentIndex: number): Promise<void> {
    console.log(`🔍 DEBUG_SELECTIONS: === processNextMenuComponent ENTRÉE ===`);
    console.log(`🔍 DEBUG_SELECTIONS: componentIndex demandé: ${componentIndex}`);
    console.log(`🔍 DEBUG_SELECTIONS: session.sessionData workflow selections AVANT refresh:`, JSON.stringify(session.sessionData?.menuPizzaWorkflow?.selections, null, 2));
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);

    // Récupérer les données de session actualisées
    const { data: sessionData } = await supabase
      .from('france_user_sessions')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    console.log(`🔍 DEBUG_SELECTIONS: session rafraîchie de la DB - selections:`, JSON.stringify(sessionData.session_data?.menuPizzaWorkflow?.selections, null, 2));

    const menuConfig = sessionData.session_data.menuPizzaWorkflow.menuConfig;
    const components = menuConfig.components;
    
    console.log(`🔍 DEBUG_SELECTIONS: components.length: ${components.length}`);
    
    if (componentIndex >= components.length) {
        // Tous les composants traités - finaliser
        await this.finalizeMenuOrder(phoneNumber, sessionData);
        return;
    }
    
    const component = components[componentIndex];
    
    switch (component.type) {
        case 'pizza_selection':
            await this.showPizzaSelection(phoneNumber, sessionData, component, componentIndex);
            break;
            
        case 'beverage_selection':
            await this.showBeverageSelection(phoneNumber, sessionData, component, componentIndex);
            break;
            
        case 'side_selection':
            await this.showSideSelection(phoneNumber, sessionData, component, componentIndex);
            break;
            
        default:
            console.error(`Type de composant inconnu: ${component.type}`);
    }
  }

  /**
   * Afficher la sélection de pizzas
   */
  private async showPizzaSelection(phoneNumber: string, session: any, component: any, componentIndex: number): Promise<void> {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    
    const restaurantId = session.session_data.selectedRestaurantId || session.restaurant_id;
    
    // Résoudre dynamiquement l'ID de la catégorie Pizzas
    const { data: pizzaCategory } = await supabase
        .from('france_menu_categories')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('slug', 'pizzas')
        .single();
    
    if (!pizzaCategory) {
        console.error('🔍 DEBUG_MENU: ERREUR - Catégorie pizzas introuvable');
        throw new Error('Catégorie pizzas introuvable');
    }
    
    console.log(`🔍 DEBUG_MENU: Catégorie pizzas trouvée - ID: ${pizzaCategory.id}`);
    
    // Récupérer les pizzas disponibles
    const { data: pizzas } = await supabase
        .from('france_products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('category_id', pizzaCategory.id)
        .eq('is_active', true)
        .order('display_order');
    
    // Normaliser la taille (minuscules → majuscules)
    const size = component.size; // junior/senior/mega
    const normalizedSize = size.toUpperCase(); // JUNIOR/SENIOR/MEGA
    
    // Récupérer les prix selon la taille
    const { data: variants } = await supabase
        .from('france_product_variants')
        .select('*')
        .in('product_id', pizzas?.map(p => p.id) || [])
        .eq('variant_name', normalizedSize);
    
    console.log(`🔍 DEBUG_MENU: pizzas récupérées: ${pizzas?.length || 0}`);
    console.log(`🔍 DEBUG_MENU: variants récupérées: ${variants?.length || 0}`);
    console.log(`🔍 DEBUG_MENU: taille recherchée: ${size} → ${normalizedSize}`);
    
    // Construire le message
    let message = `🍕 ${component.title}\n`;
    
    console.log(`🔍 DEBUG_MENU: session.session_data existe: ${!!session.session_data}`);
    console.log(`🔍 DEBUG_MENU: session.session_data:`, session.session_data);
    
    const menuPrice = session.session_data?.menuPizzaWorkflow?.menuConfig?.price || 'N/A';
    message += `Prix du menu: ${menuPrice}€\n\n`;
    message += `PIZZAS DISPONIBLES (Taille ${normalizedSize}):\n`;
    
    pizzas?.forEach((pizza, index) => {
        const variant = variants?.find(v => v.product_id === pizza.id);
        const price = variant?.price_on_site || 0;
        message += `${index + 1}. ${pizza.name} - ${price}€\n`;
    });
    
    message += `\n📝 ${component.instruction}`;
    
    // Mettre à jour la session pour attendre la réponse
    await this.updateMenuSession(phoneNumber, session, {
        currentComponent: componentIndex,
        waitingFor: 'pizza_selection',
        availablePizzas: pizzas,
        pizzaVariants: variants,
        expectedQuantity: component.quantity,
        selectionMode: component.selection_mode
    });
    
    await this.messageSender.sendMessage(phoneNumber, message);
  }

  /**
   * Mettre à jour la session du menu
   */
  private async updateMenuSession(phoneNumber: string, session: any, updates: any, currentSelections?: any): Promise<void> {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);

    // Détecter la structure de session (sessionData vs session_data)
    const sessionData = session.sessionData || session.session_data;
    
    console.log(`🔍 DEBUG_SELECTIONS: === updateMenuSession ENTRÉE ===`);
    console.log(`🔍 DEBUG_SELECTIONS: updates reçus:`, JSON.stringify(updates, null, 2));
    console.log(`🔍 DEBUG_SELECTIONS: sessionData avant:`, JSON.stringify(sessionData?.menuPizzaWorkflow, null, 2));
    
    // Préserver les sélections : priorité aux sélections locales, puis existantes en DB
    const existingWorkflow = sessionData?.menuPizzaWorkflow || {};
    const preservedSelections = currentSelections || existingWorkflow.selections || {};
    
    console.log(`🔍 DEBUG_SELECTIONS: sélections existantes en DB:`, JSON.stringify(existingWorkflow.selections, null, 2));
    console.log(`🔍 DEBUG_SELECTIONS: sélections locales passées:`, JSON.stringify(currentSelections, null, 2));
    console.log(`🔍 DEBUG_SELECTIONS: sélections finales préservées:`, JSON.stringify(preservedSelections, null, 2));

    // Construire le nouvel état workflow en préservant les sélections
    const newWorkflowState = {
      ...existingWorkflow,
      ...updates
    };
    
    // Préserver les sélections (priorité : updates.selections > currentSelections > existingWorkflow.selections)
    if (!updates.selections) {
      newWorkflowState.selections = preservedSelections;
    }
    
    console.log(`🔍 DEBUG_SELECTIONS: nouvel état workflow:`, JSON.stringify(newWorkflowState, null, 2));

    const updatedSessionData = {
      ...sessionData,
      menuPizzaWorkflow: newWorkflowState
    };

    await supabase
      .from('france_user_sessions')
      .update({
        session_data: updatedSessionData
      })
      .eq('id', session.id);
      
    console.log(`🔍 DEBUG_SELECTIONS: === updateMenuSession SORTIE - Sauvegardé en base ===`);
  }

  /**
   * Finaliser la commande du menu
   */
  private async finalizeMenuOrder(phoneNumber: string, session: any): Promise<void> {
    const workflow = session.session_data.menuPizzaWorkflow;
    const selections = workflow.selections;
    
    // Construire le récapitulatif
    let recap = `✅ ${workflow.product.name} - Confirmation\n\n`;
    recap += `Votre menu:\n`;
    
    // Pizzas
    if (selections.pizzas) {
        selections.pizzas.forEach((pizza: any, i: number) => {
            recap += `• Pizza ${i + 1}: ${pizza.name} (${pizza.size})\n`;
        });
    }
    
    // Boissons
    if (selections.beverages) {
        selections.beverages.forEach((bev: any) => {
            recap += `• Boisson: ${bev.name}\n`;
        });
    }
    
    // Accompagnements
    if (selections.sides) {
        recap += `• Accompagnement: ${selections.sides.name}\n`;
    }
    
    recap += `\nPrix total du menu: ${workflow.menuConfig.price}€\n`;
    recap += `\nConfirmer l'ajout au panier?\n`;
    recap += `1. ✅ Oui, ajouter au panier\n`;
    recap += `2. ❌ Non, recommencer`;
    
    // Mettre à jour pour attendre confirmation
    await this.updateMenuSession(phoneNumber, session, {
      waitingFor: 'confirmation'
    });
    
    await this.messageSender.sendMessage(phoneNumber, recap);
  }

  /**
   * Gérer les réponses du workflow menu pizza
   */
  private async handleMenuPizzaResponse(phoneNumber: string, session: any, message: string): Promise<void> {
    const workflow = session.sessionData.menuPizzaWorkflow;
    const waitingFor = workflow.waitingFor;
    
    console.log(`🔍 DEBUG_SELECTIONS: === handleMenuPizzaResponse ENTRÉE ===`);
    console.log(`🔍 DEBUG_SELECTIONS: handleMenuPizzaResponse - waitingFor: "${waitingFor}"`);
    console.log(`🔍 DEBUG_SELECTIONS: handleMenuPizzaResponse - message: "${message}"`);
    console.log(`🔍 DEBUG_SELECTIONS: handleMenuPizzaResponse - workflow complet:`, JSON.stringify(workflow, null, 2));
    console.log(`🔍 DEBUG_SELECTIONS: handleMenuPizzaResponse - selections avant:`, JSON.stringify(workflow.selections, null, 2));
    
    switch (waitingFor) {
        case 'pizza_selection':
            console.log(`🔍 DEBUG_SELECTIONS: Appel processPizzaSelectionResponse`);
            await this.processPizzaSelectionResponse(phoneNumber, session, message);
            break;
            
        case 'beverage_selection':
            console.log(`🔍 DEBUG_SELECTIONS: Appel processBeverageSelectionResponse`);
            await this.processBeverageSelectionResponse(phoneNumber, session, message);
            break;
            
        case 'side_selection':
            console.log(`🔍 DEBUG_SELECTIONS: Appel processSideSelectionResponse`);
            await this.processSideSelectionResponse(phoneNumber, session, message);
            break;
            
        case 'confirmation':
            console.log(`🔍 DEBUG_SELECTIONS: Appel processMenuConfirmation`);
            await this.processMenuConfirmation(phoneNumber, session, message);
            break;
    }
  }

  /**
   * Traiter la sélection de pizzas
   */
  private async processPizzaSelectionResponse(phoneNumber: string, session: any, message: string): Promise<void> {
    console.log(`🔍 DEBUG_SELECTIONS: === DÉBUT processPizzaSelectionResponse ===`);
    const workflow = session.sessionData.menuPizzaWorkflow;
    const expectedQuantity = workflow.expectedQuantity;
    const selectionMode = workflow.selectionMode;
    
    console.log(`🔍 DEBUG_SELECTIONS: expectedQuantity: ${expectedQuantity}`);
    console.log(`🔍 DEBUG_SELECTIONS: selectionMode: ${selectionMode}`);
    console.log(`🔍 DEBUG_SELECTIONS: availablePizzas count: ${workflow.availablePizzas?.length}`);
    
    let selections = [];
    
    if (selectionMode === 'multiple') {
        // Parser "1,3,5" en tableau [1, 3, 5]
        selections = message.split(',').map((s: string) => parseInt(s.trim()));
        
        // Valider le nombre
        if (selections.length !== expectedQuantity) {
            await this.messageSender.sendMessage(phoneNumber,
                `❌ Vous devez choisir exactement ${expectedQuantity} pizzas.\n` +
                `Exemple: ${Array.from({length: expectedQuantity}, (_, i) => i + 1).join(',')}`);
            return;
        }
    } else {
        // Sélection simple
        selections = [parseInt(message.trim())];
    }
    
    // Valider les numéros
    const availablePizzas = workflow.availablePizzas;
    for (const selection of selections) {
        if (isNaN(selection) || selection < 1 || selection > availablePizzas.length) {
            await this.messageSender.sendMessage(phoneNumber,
                `❌ Choix invalide: ${selection}. Choisissez entre 1 et ${availablePizzas.length}.`);
            return;
        }
    }
    
    // Stocker les sélections
    console.log(`🔍 DEBUG_SELECTIONS: selections validées:`, selections);
    const selectedPizzas = selections.map((index: number) => {
        const pizza = availablePizzas[index - 1];
        console.log(`🔍 DEBUG_SELECTIONS: pizza sélectionnée[${index}]:`, pizza?.name);
        const variant = workflow.pizzaVariants.find((v: any) => v.product_id === pizza.id);
        const selectedPizza = {
            id: pizza.id,
            name: pizza.name,
            size: workflow.currentComponent?.size || 'unknown',
            price: variant?.price_on_site || 0
        };
        console.log(`🔍 DEBUG_SELECTIONS: selectedPizza créée:`, selectedPizza);
        return selectedPizza;
    });
    
    console.log(`🔍 DEBUG_SELECTIONS: selectedPizzas final:`, selectedPizzas);
    
    // Ajouter au workflow
    if (!workflow.selections) workflow.selections = {};
    workflow.selections.pizzas = selectedPizzas;
    
    console.log(`🔍 DEBUG_SELECTIONS: workflow.selections après ajout:`, workflow.selections);
    console.log(`🔍 DEBUG_SELECTIONS: Passage au composant suivant: ${workflow.currentComponent + 1}`);
    
    // Sauvegarder les sélections avant de passer au composant suivant
    await this.updateMenuSession(phoneNumber, session, {
      currentComponent: workflow.currentComponent + 1
    }, workflow.selections);
    
    // Passer au composant suivant
    await this.processNextMenuComponent(phoneNumber, session, workflow.currentComponent + 1);
  }

  /**
   * Afficher sélection de boissons
   */
  private async showBeverageSelection(phoneNumber: string, session: any, component: any, componentIndex: number): Promise<void> {
    let message = `🥤 ${component.title}\n\n`;
    
    component.options.forEach((option: any, index: number) => {
        message += `${index + 1}. ${option.name}\n`;
    });
    
    message += `\nTapez le numéro de votre choix`;
    
    // Mettre à jour la session
    await this.updateMenuSession(phoneNumber, session, {
        currentComponent: componentIndex,
        waitingFor: 'beverage_selection',
        availableOptions: component.options,
        expectedQuantity: component.quantity || 1,
        selectionMode: component.selection_mode || 'single'
    });
    
    await this.messageSender.sendMessage(phoneNumber, message);
  }

  /**
   * Afficher sélection d'accompagnements
   */
  private async showSideSelection(phoneNumber: string, session: any, component: any, componentIndex: number): Promise<void> {
    let message = `🍗 ${component.title}\n\n`;
    
    component.options.forEach((option: any, index: number) => {
        message += `${index + 1}. ${option.name}\n`;
    });
    
    message += `\nTapez le numéro de votre choix`;
    
    // Mettre à jour la session
    await this.updateMenuSession(phoneNumber, session, {
        currentComponent: componentIndex,
        waitingFor: 'side_selection',
        availableOptions: component.options,
        expectedQuantity: component.quantity || 1,
        selectionMode: component.selection_mode || 'single'
    });
    
    await this.messageSender.sendMessage(phoneNumber, message);
  }

  /**
   * Traiter sélection de boissons
   */
  private async processBeverageSelectionResponse(phoneNumber: string, session: any, message: string): Promise<void> {
    console.log(`🔍 DEBUG_SELECTIONS: === processBeverageSelectionResponse ENTRÉE ===`);
    const workflow = session.sessionData.menuPizzaWorkflow;
    console.log(`🔍 DEBUG_SELECTIONS: selections AVANT boisson:`, JSON.stringify(workflow.selections, null, 2));
    
    const choice = parseInt(message.trim());
    const availableOptions = workflow.availableOptions;
    
    if (isNaN(choice) || choice < 1 || choice > availableOptions.length) {
        await this.messageSender.sendMessage(phoneNumber,
            `❌ Choix invalide. Tapez un numéro entre 1 et ${availableOptions.length}.`);
        return;
    }
    
    const selectedOption = availableOptions[choice - 1];
    console.log(`🔍 DEBUG_SELECTIONS: selectedOption boisson:`, selectedOption);
    
    // Ajouter aux sélections
    if (!workflow.selections) workflow.selections = {};
    if (!workflow.selections.beverages) workflow.selections.beverages = [];
    workflow.selections.beverages.push(selectedOption);
    
    console.log(`🔍 DEBUG_SELECTIONS: selections APRÈS boisson:`, JSON.stringify(workflow.selections, null, 2));
    
    // Sauvegarder les sélections avant de passer au composant suivant
    await this.updateMenuSession(phoneNumber, session, {
      currentComponent: workflow.currentComponent + 1
    }, workflow.selections);
    
    // Passer au composant suivant
    await this.processNextMenuComponent(phoneNumber, session, workflow.currentComponent + 1);
  }

  /**
   * Traiter sélection d'accompagnements
   */
  private async processSideSelectionResponse(phoneNumber: string, session: any, message: string): Promise<void> {
    console.log(`🔍 DEBUG_SELECTIONS: === processSideSelectionResponse ENTRÉE ===`);
    const workflow = session.sessionData.menuPizzaWorkflow;
    console.log(`🔍 DEBUG_SELECTIONS: selections AVANT accompagnement:`, JSON.stringify(workflow.selections, null, 2));
    
    const choice = parseInt(message.trim());
    const availableOptions = workflow.availableOptions;
    
    if (isNaN(choice) || choice < 1 || choice > availableOptions.length) {
        await this.messageSender.sendMessage(phoneNumber,
            `❌ Choix invalide. Tapez un numéro entre 1 et ${availableOptions.length}.`);
        return;
    }
    
    const selectedOption = availableOptions[choice - 1];
    console.log(`🔍 DEBUG_SELECTIONS: selectedOption accompagnement:`, selectedOption);
    
    // Ajouter aux sélections
    if (!workflow.selections) workflow.selections = {};
    workflow.selections.sides = selectedOption;
    
    console.log(`🔍 DEBUG_SELECTIONS: selections APRÈS accompagnement:`, JSON.stringify(workflow.selections, null, 2));
    
    // Sauvegarder les sélections avant de passer au composant suivant
    await this.updateMenuSession(phoneNumber, session, {
      currentComponent: workflow.currentComponent + 1
    }, workflow.selections);
    
    // Passer au composant suivant
    await this.processNextMenuComponent(phoneNumber, session, workflow.currentComponent + 1);
  }

  /**
   * Confirmer et ajouter au panier
   */
  private async processMenuConfirmation(phoneNumber: string, session: any, message: string): Promise<void> {
    console.log(`🔍 DEBUG_SELECTIONS: === processMenuConfirmation ENTRÉE ===`);
    const choice = message.trim();
    console.log(`🔍 DEBUG_SELECTIONS: choix utilisateur: "${choice}"`);
    
    if (choice === '1') {
        // Ajouter au panier
        const workflow = session.sessionData.menuPizzaWorkflow;
        console.log(`🔍 DEBUG_SELECTIONS: workflow.selections au moment de la confirmation:`, JSON.stringify(workflow.selections, null, 2));
        
        const cartItem = {
            id: workflow.product.id,
            name: workflow.product.name,
            price: workflow.menuConfig.price,
            quantity: 1,
            type: 'menu_pizza',
            details: workflow.selections,
            deliveryMode: session.sessionData.deliveryMode
        };
        
        console.log(`🔍 DEBUG_SELECTIONS: cartItem créé:`, JSON.stringify(cartItem, null, 2));
        
        // Ajouter au panier existant
        const cart = session.sessionData.cart || {};
        const itemKey = `menu_${workflow.product.id}_${Date.now()}`;
        cart[itemKey] = cartItem;
        
        // Calculer le total
        const totalPrice = Object.values(cart).reduce((sum: number, item: any) => 
            sum + (item.price * item.quantity), 0);
        
        // Sauvegarder
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabase = createClient(this.supabaseUrl, this.supabaseKey);
        
        await supabase
          .from('france_user_sessions')
          .update({
            bot_state: 'SELECTING_PRODUCTS',
            session_data: {
              ...session.sessionData,
              cart: cart,
              totalPrice: totalPrice,
              menuPizzaWorkflow: null // Nettoyer le workflow
            }
          })
          .eq('id', session.id);
        
        await this.messageSender.sendMessage(phoneNumber,
            `✅ ${workflow.product.name} ajouté au panier!\n\n` +
            `Que voulez-vous faire?\n` +
            `1. Continuer mes achats\n` +
            `2. Voir le panier (99)\n` +
            `3. Vider le panier (00)`);
            
    } else if (choice === '2') {
        // Recommencer
        const workflow = session.sessionData.menuPizzaWorkflow;
        await this.startMenuPizzaWorkflow(phoneNumber, workflow.product, session);
    } else {
        await this.messageSender.sendMessage(phoneNumber,
            `❌ Choix invalide. Tapez 1 pour confirmer ou 2 pour recommencer.`);
    }
  }
}