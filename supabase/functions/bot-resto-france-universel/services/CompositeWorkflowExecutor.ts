// 🏗️ SERVICE DE WORKFLOW COMPOSITE - ARCHITECTURE UNIVERSELLE
// SOLID : Single Responsibility - Gestion des workflows composites uniquement
import { SessionManager } from './SessionManager.ts';
import { QueryPerformanceMonitor } from './QueryPerformanceMonitor.ts';
/**
 * Obtenir l'heure actuelle dans le bon fuseau horaire
 * ✅ Version avec support multi-timezone
 */ function getCurrentTime(timezone: string = 'Europe/Paris') {
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const utcNow = new Date();
  const formatted = formatter.format(utcNow);
  const parts = formatted.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (parts) {
    const [, day, month, year, hour, minute, second] = parts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
  }
  return utcNow;
}
/**
 * Exécuteur de workflows composites (TACOS, PIZZAS avec suppléments, etc.)
 * SOLID : Strategy Pattern - Différentes stratégies selon le type de produit
 */ export class CompositeWorkflowExecutor {
  messageSender;
  supabaseUrl;
  supabaseKey;
  sessionManager;
  constructor(messageSender, supabaseUrl, supabaseKey){
    this.messageSender = messageSender;
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    // Initialiser SessionManager pour éviter les accès directs DB
    this.sessionManager = new SessionManager(supabaseUrl, supabaseKey);
  }
  /**
   * Workflow spécifique pour les menus pizza
   * Gère la sélection multiple de pizzas et les composants additionnels
   */ async startMenuPizzaWorkflow(phoneNumber, product, session) {
    try {
      const menuConfig = product.steps_config?.menu_config;
      if (!menuConfig) {
        throw new Error('Configuration du menu manquante');
      }
      // Initialiser le workflow dans la session
      await this.initializeMenuWorkflow(phoneNumber, session, product, menuConfig);
      // Démarrer avec le premier composant
      await this.processNextMenuComponent(phoneNumber, session, 0);
    } catch (error) {
      console.error('❌ [MenuWorkflow] Erreur:', error.message);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de la configuration du menu. Tapez "resto" pour recommencer.');
    }
  }
  /**
   * Démarrer un workflow composite
   * SOLID : Open/Closed - Extensible pour nouveaux workflows sans modification
   */ async startCompositeWorkflow(phoneNumber, product, session) {
    console.log(`✅ [CompositeWorkflow] Démarrage: ${product.name}`);
    // Vérifier si c'est un produit Universal Workflow V2
    if (product.workflow_type === 'universal_workflow_v2') {
      await this.handleStepsConfigWorkflow(phoneNumber, session, product);
      return;
    }
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
      const { data: productOptions, error } = await supabase.from('france_product_options').select('*').eq('product_id', product.id).eq('is_active', true).order('group_order', {
        ascending: true
      }).order('display_order', {
        ascending: true
      });
      if (error || !productOptions || productOptions.length === 0) {
        // PRIORITÉ 3: Vérifier steps_config si pas d'options dans france_product_options
        // Convertir steps_config en objet si c'est un string JSON
        let stepsConfig = product.steps_config;
        if (typeof stepsConfig === 'string') {
          try {
            stepsConfig = JSON.parse(stepsConfig);
          } catch (parseError) {
            console.error(`❌ Erreur parsing JSON steps_config:`, parseError.message);
          }
        }
        if (stepsConfig && stepsConfig.steps && stepsConfig.steps.length > 0) {
          // Utiliser l'objet parsé
          const productWithParsedConfig = {
            ...product,
            steps_config: stepsConfig
          };
          await this.handleStepsConfigWorkflow(phoneNumber, session, productWithParsedConfig);
          return;
        } else {
          // steps_config invalide
        }
        console.error('❌ [CompositeWorkflow] Pas d\'options trouvées:', error);
        await this.messageSender.sendMessage(phoneNumber, `❌ Configuration non disponible pour ${product.name}.\nVeuillez choisir un autre produit.`);
        return;
      }
      // 2. Grouper les options par group_order
      const optionGroups = this.groupOptionsByStep(productOptions);
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
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de la configuration. Veuillez réessayer.');
    }
  }
  /**
   * Vérifier si un produit a des tailles dans les tables existantes
   * APPROCHE UNIVERSELLE - Utilise france_product_sizes d'abord
   */ async checkForSizeVariants(supabase, productId) {
    // Vérifier dans france_product_sizes (table existante parfaite pour les tailles)
    const { data: sizes } = await supabase.from('france_product_sizes').select('id').eq('product_id', productId);
    if (sizes && sizes.length > 0) {
      return true;
    }
    // Vérifier dans france_product_variants
    const { data: variants } = await supabase.from('france_product_variants').select('id').eq('product_id', productId).eq('is_active', true);
    if (variants && variants.length > 0) {
      return true;
    }
    // Fallback vers france_product_options pour produits non encore migrés
    const { data: sizeOptions } = await supabase.from('france_product_options').select('option_group').eq('product_id', productId).eq('is_active', true).ilike('option_group', '%size%').or('option_group.ilike.%taille%,option_group.ilike.%menu%');
    return sizeOptions && sizeOptions.length > 0;
  }
  /**
   * Affichage universel pour sélection de variantes
   * 100% UNIVERSEL - Basé sur les nouvelles tables de configuration
   */ async showSizeVariantSelection(phoneNumber, session, product, supabase) {
    // 1. Récupérer les informations du restaurant et la configuration d'affichage
    const [restaurantResult, displayConfigResult, sizesResult, variantsResult] = await Promise.all([
      supabase.from('france_restaurants').select('name').eq('id', session.restaurantId).single(),
      supabase.from('france_product_display_configs').select('*').eq('product_id', product.id).single(),
      supabase.from('france_product_sizes').select('*').eq('product_id', product.id).eq('is_active', true).order('display_order'),
      supabase.from('france_product_variants').select('*').eq('product_id', product.id).eq('is_active', true).order('display_order')
    ]);
    const restaurant = restaurantResult.data;
    const displayConfig = displayConfigResult.data;
    const sizes = sizesResult.data || [];
    const variants = variantsResult.data || [];
    // Récupérer le mode de livraison depuis la session
    const deliveryMode = session.sessionData?.deliveryMode || 'sur_place';
    // Utiliser sizes en priorité si disponible (format adapté pour tailles TACOS)
    let allVariants = sizes.length > 0 ? sizes : variants;
    // FILTRER selon le mode de livraison choisi
    let finalVariants = [];
    if (sizes.length > 0) {
      // Grouper les tailles par size_name et prendre le bon prix selon le mode
      const sizeGroups = new Map();
      sizes.forEach((size)=>{
        const key = size.size_name;
        if (!sizeGroups.has(key)) {
          sizeGroups.set(key, []);
        }
        sizeGroups.get(key).push(size);
      });
      // Pour chaque taille, prendre la variante avec le bon prix
      sizeGroups.forEach((sizeList, sizeName)=>{
        // Trier par prix croissant
        sizeList.sort((a, b)=>a.price_on_site - b.price_on_site);
        // Sélectionner la bonne variante selon le mode
        let selectedSize;
        if (deliveryMode === 'livraison') {
          // Prendre la variante avec prix livraison (généralement la plus chère)
          selectedSize = sizeList.find((s)=>s.price_delivery > s.price_on_site) || sizeList[sizeList.length - 1];
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
        // Filtré par mode de livraison
      });
      // Trier par display_order
      finalVariants.sort((a, b)=>a.display_order - b.display_order);
    } else {
      // Pour les variantes classiques, adapter les colonnes
      finalVariants = allVariants.map((variant)=>({
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
      const { data: template } = await supabase.from('france_workflow_templates').select('*').eq('restaurant_id', session.restaurantId).eq('template_name', displayConfig.template_name).single();
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
    // DEBUG: Tracer l'icône pour TACOS
    if (product.name.includes('TACOS')) {
      console.log(`🔍 [DEBUG_COMPOSITE_TACOS] product.icon: "${product.icon}" (${typeof product.icon})`);
    }

    // Utiliser l'icône du produit ou fallback sur 🎯
    const productIcon = product.icon || '🎯';
    message += `${productIcon} *${product.name.toUpperCase()}*\n\n`;
    const variantTitle = config.variant_selection?.title || displayConfig?.custom_header_text || '💰 Choisissez votre taille:';
    message += `${variantTitle}\n`;
    // 4. Lister les variantes selon la configuration
    // Utiliser l'icône du produit pour les variantes au lieu de 🔸
    const variantIcon = product.icon || '🔸';
    const format = config.variant_selection?.format || `${variantIcon} {variant_name} ({price} EUR) - Tapez {index}`;
    finalVariants.forEach((variant, index)=>{
      // Utiliser le prix selon le mode de livraison
      const price = deliveryMode === 'livraison' ? variant.price_delivery || variant.price_on_site : variant.price_on_site || variant.base_price;
      let variantLine = format.replace('{variant_name}', variant.variant_name).replace('{price}', price).replace('{index}', (index + 1).toString());
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
    footerOptions.forEach((option)=>{
      message += `${option}\n`;
    });
    await this.messageSender.sendMessage(phoneNumber, message);
    // Mettre à jour la session avec les variantes configurées
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
   */ async startStandardWorkflow(phoneNumber, session, product, supabase) {
    // Continuer avec le workflow classique sans variantes
    const { data: productOptions, error } = await QueryPerformanceMonitor.measureQuery('PRODUCT_OPTIONS_DOUBLE_ORDER_BY', supabase.from('france_product_options').select('*').eq('product_id', product.id).eq('is_active', true).order('group_order', {
      ascending: true
    }).order('display_order', {
      ascending: true
    }));
    if (error || !productOptions || productOptions.length === 0) {
      console.error('❌ [StandardWorkflow] Pas d\'options trouvées:', error);
      await this.messageSender.sendMessage(phoneNumber, `❌ Configuration non disponible pour ${product.name}.\nVeuillez choisir un autre produit.`);
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
   */ async returnToCategories(phoneNumber, session) {
    console.log(`🔙 [returnToCategories] Retour aux catégories demandé`);
    console.log(`🚨 [TRACE_FONCTION_L321] returnToCategories APPELÉE - CompositeWorkflowExecutor.ts:321`);
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      // 🔍 DEBUG_CART_PRESERVATION - Tracer la préservation du panier lors du retour aux catégories
      console.log('🔍 DEBUG_CART_PRESERVATION: session.sessionData.cart AVANT reset:', JSON.stringify(session.sessionData?.cart));
      console.log('🔍 DEBUG_CART_PRESERVATION: Type cart AVANT:', typeof session.sessionData?.cart);

      // Reset session state vers AWAITING_MENU_CHOICE
      const updatedData = {
        ...session.sessionData,
        selectedProduct: null,
        availableVariants: null,
        compositeWorkflow: null
      };

      console.log('🔍 DEBUG_CART_PRESERVATION: updatedData.cart APRÈS reset:', JSON.stringify(updatedData?.cart));
      console.log('🔍 DEBUG_CART_PRESERVATION: Type cart APRÈS:', typeof updatedData?.cart);
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
      const restaurant = await supabase.from('france_restaurants').select('*').eq('id', restaurantId).single();
      if (!restaurant.data) {
        console.error('❌ [returnToCategories] Restaurant non trouvé pour ID:', restaurantId);
        await this.messageSender.sendMessage(phoneNumber, '❌ Restaurant non trouvé. Tapez "resto" pour recommencer.');
        return;
      }
      // Chargement dynamique des catégories depuis la BDD
      const { data: categories, error: catError } = await supabase.from('france_menu_categories').select('*').eq('restaurant_id', restaurant.data.id).eq('is_active', true).order('display_order');
      if (categories) {
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
      categories.forEach((category, index)=>{
        const displayNumber = `${index + 1}.`;
        menuText += `${displayNumber} ${category.icon || '🍽️'} ${category.name}\n`;
      });
      menuText += '\nTapez le numéro de votre choix pour voir les produits.';
      await this.messageSender.sendMessage(phoneNumber, menuText);
      // Mettre à jour la session vers VIEWING_MENU (comme dans showMenuAfterDeliveryModeChoice)
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
      const { error: updateError } = await supabase.from('france_user_sessions').update({
        bot_state: 'VIEWING_MENU',
        session_data: updatedSessionData
      }).eq('id', session.id);
      if (updateError) {
        console.error(`❌ [CATBUG_DEBUG] Erreur sauvegarde session:`, updateError);
        console.error(`❌ Échec transition état vers VIEWING_MENU`);
      } else {
      }
      // Vérifier ce qui a été vraiment sauvegardé
      const { data: verifySession } = await supabase.from('france_user_sessions').select('bot_state, session_data').eq('id', session.id).single();
      if (verifySession) {
        const savedCategories = verifySession.session_data?.categories || [];
        const savedState = verifySession.bot_state;
        if (savedCategories.length !== categories.length) {
          console.error(`❌ [CATBUG_DEBUG] PROBLÈME ! ${categories.length} catégories envoyées mais ${savedCategories.length} sauvegardées`);
        }
        if (savedState !== 'VIEWING_MENU') {
          console.error(`❌ PROBLÈME ! État attendu: VIEWING_MENU, État sauvegardé: ${savedState}`);
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
   */ async handleSizeSelection(phoneNumber, session, message) {
    // Traitement spécial pour "0" - retour aux catégories
    if (message.trim() === '0') {
      await this.returnToCategories(phoneNumber, session);
      return;
    }
    const choice = parseInt(message.trim());
    const availableVariants = session.sessionData?.availableVariants;
    if (!availableVariants || choice < 1 || choice > availableVariants.length) {
      await this.messageSender.sendMessage(phoneNumber, `❌ Choix invalide. Tapez un numéro entre 1 et ${availableVariants?.length || 0}.`);
      return;
    }
    // Récupérer la variante sélectionnée depuis la configuration universelle
    const selectedVariant = availableVariants[choice - 1];
    const product = session.sessionData.selectedProduct;
    // Utiliser le bon prix selon le mode de livraison
    const deliveryMode = session.sessionData?.deliveryMode;
    const finalPrice = deliveryMode === 'livraison' ? selectedVariant.price_delivery : selectedVariant.price_on_site;
    console.log(`✅ [VariantSelection] Sélection: ${selectedVariant.variant_name} (${finalPrice}€)`);
    // Construire le nom complet du produit avec variante
    const fullProductName = `${product.name} ${selectedVariant.variant_name}`;
    // Passer à la configuration des ingrédients avec la nouvelle architecture
    await this.startUniversalConfiguration(phoneNumber, session, selectedVariant, finalPrice, fullProductName);
  }
  /**
   * Démarrage configuration universelle après sélection variante
   * COMPLÈTEMENT UNIVERSEL - PAS DE HARDCODING
   */ async startUniversalConfiguration(phoneNumber, session, selectedVariant, finalPrice, fullProductName) {
    console.log(`🔧 [UniversalConfig] Démarrage configuration ${selectedVariant.variant_name}`);
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    // Charger TOUTES les options du produit (pas de filtrage de taille car c'est dans les variantes maintenant)
    const { data: productOptions, error } = await supabase.from('france_product_options').select('*').eq('product_id', session.sessionData.selectedProduct.id).eq('is_active', true).order('group_order', {
      ascending: true
    }).order('display_order', {
      ascending: true
    });
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
        [selectedVariant.variant_type]: [
          selectedVariant
        ]
      },
      completed: false
    };
    // Démarrer avec la première étape
    await this.showUniversalWorkflowStep(phoneNumber, session, workflowData, 0);
  }
  /**
   * Affichage étape workflow universel avec template adaptatif
   * BASÉ SUR LA CONFIGURATION - PLUS D'HARDCODING TACOS
   */ async showUniversalWorkflowStep(phoneNumber, session, workflowData, stepIndex) {
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
    // Ajouter option "x" pour les étapes facultatives
    // Fallback compatible avec anciens ET nouveaux workflows
    const isStepRequired = optionGroup.required !== undefined
        ? optionGroup.required
        : optionGroup.isRequired;
    console.log(`🔍 [DEBUG_REQUIRED] Groupe: ${optionGroup.groupName}, isRequired: ${optionGroup.isRequired}, required: ${optionGroup.required}, final: ${isStepRequired}`);
    if (!isStepRequired) {
      // Extraire le nom simple du groupe (garniture, boisson, etc.)
      const groupName = optionGroup.groupName || 'option';
      console.log(`✅ [DEBUG_REQUIRED] Ajout "x. Aucun" pour groupe optionnel: ${groupName}`);
      message += `x. Aucun(e) ${groupName}\n`;
    } else {
      console.log(`❌ [DEBUG_REQUIRED] PAS d'ajout "x. Aucun" pour groupe obligatoire: ${optionGroup.groupName}`);
    }
    // Lister les options avec numérotation simple compatible mobile
    optionGroup.options.forEach((option, index)=>{
      const optionIcon = (option.icon && option.icon !== 'undefined') ? `${option.icon} ` : '';
      message += `${index + 1}. ${optionIcon}${option.option_name}`;
      if (option.price_modifier && option.price_modifier !== 0) {
        const sign = option.price_modifier > 0 ? '+' : '';
        message += ` (${sign}${option.price_modifier}€)`;
      }
      message += '\n';
    });
    message += '\n💡 Pour choisir votre ';
    message += optionGroup.groupName === 'viande' ? 'viande' : optionGroup.displayName.toLowerCase();
    message += ': tapez les numéros\n';
    if (optionGroup.groupName === 'sauces' || optionGroup.displayName.toLowerCase() === 'sauces') {
      // Exemple spécial pour sauces (sélection multiple)
      const sauce1 = optionGroup.options[0]?.option_name || 'Option1';
      const sauce2 = optionGroup.options[1]?.option_name || 'Option2';
      message += `Ex: 1,2 = ${sauce1},${sauce2}\n\n`;
    } else {
      // Exemple standard pour autres catégories (sélection simple)
      message += `Ex: 1 = ${optionGroup.options[0]?.option_name}\n\n`;
    }
    // message += '00 - Finaliser cette étape\n';
    // message += '000 - Ajouter au panier et continuer\n';
    // message += '0000 - Recommencer la configuration\n\n';
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
    await supabase.from('france_user_sessions').update({
      bot_state: 'AWAITING_UNIVERSAL_WORKFLOW',
      session_data: updatedData
    }).eq('id', session.id);
  }
  /**
   * Finalisation workflow universel
   */ async completeUniversalWorkflow(phoneNumber, session, workflowData) {
    // Récapitulatif avec format standard universel
    const productName = workflowData.productName.split(' ')[0]; // Ex: "TACOS" depuis "TACOS MENU M"
    let recap = `✅ *${productName} configuré avec succès !*\n\n`;
    // Calculer le prix total avec price_modifier pour Workflow Universal V2
    const calculatedPrice = this.calculateUniversalWorkflowPrice(workflowData);
    recap += `🍽 *${workflowData.productName} (${calculatedPrice.toFixed(2)} EUR)*\n`;
    for (const [groupName, selections] of Object.entries(workflowData.selections)){
      const items = selections.map((s)=>s.option_name).join(', ');
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
        price: this.calculateUniversalWorkflowPrice(workflowData),
        configuration: workflowData.selections
      },
      universalWorkflow: null,
      awaitingWorkflowActions: true
    };
    await supabase.from('france_user_sessions').update({
      bot_state: 'AWAITING_WORKFLOW_ACTIONS',
      session_data: updatedData
    }).eq('id', session.id);
  }
  /**
   * Traitement universel des réponses workflow
   */ async handleUniversalWorkflowResponse(phoneNumber, session, message) {
    console.log(`🚨 [UniversalWorkflow] ENTRÉE DANS handleUniversalWorkflowResponse`);
    console.log(`🚨 [UniversalWorkflow] Message reçu: "${message}"`);
    // Vérifier si c'est un workflow menu pizza
    if (session.sessionData?.menuPizzaWorkflow) {
      await this.handleMenuPizzaResponse(phoneNumber, session, message);
      return;
    }
    const workflowData = session.sessionData?.universalWorkflow;
    if (!workflowData) {
      console.error('❌ [UniversalWorkflow] Pas de workflow en cours - workflowData est undefined/null');
      console.error('❌ [UniversalWorkflow] Session.sessionData disponible:', Object.keys(session.sessionData || {}));
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur de session. Veuillez recommencer.');
      return;
    }
    // AVANT parseUserSelection, ajouter :
    const choice = message.trim();
    console.log('🔍 DEBUG_COMPOSITE_WORKFLOW_CHOICE:', choice);

    if (choice === '99' || choice === '00' || choice === '0') {
      console.log('🔍 DEBUG_COMPOSITE_TRYING_HANDLECARTACTIONS: Tentative appel handleCartActions');
      console.error('❌ DEBUG_COMPOSITE_ERROR: handleCartActions method does not exist!');
      // FIXME: Cette méthode n'existe pas - déléguer au UniversalBot
      // return await this.handleCartActions(phoneNumber, session, message);
      console.log('🔍 DEBUG_COMPOSITE_SKIPPING_DELEGATION: Méthode manquante, continue workflow');
    }
    const currentStep = workflowData.currentStep;
    const optionGroup = workflowData.optionGroups[currentStep];
    // Gérer "x" pour les étapes facultatives
    if (choice.toLowerCase() === 'x' && !optionGroup.isRequired) {
      // Passer à l'étape suivante sans sélection
      const nextStep = await this.determineNextStep(workflowData, [], optionGroup);
      workflowData.currentStep = nextStep;
      await this.messageSender.sendMessage(phoneNumber, `✅ ${optionGroup.displayName}: Aucune sélection`);
      return await this.showUniversalWorkflowStep(phoneNumber, session, workflowData, workflowData.currentStep);
    }
    // Valider et parser la sélection
    const selections = this.parseUserSelection(message, optionGroup);
    if (!selections || selections.length === 0) {
      await this.messageSender.sendMessage(phoneNumber, `❌ Sélection invalide.\n${this.getSelectionHelp(optionGroup)}`);
      return;
    }
    // Valider les contraintes
    const validation = this.validateSelections(selections, optionGroup);
    if (!validation.valid) {
      await this.messageSender.sendMessage(phoneNumber, `❌ ${validation.error}\n${this.getSelectionHelp(optionGroup)}`);
      return;
    }
    console.log(`✅ [UniversalWorkflow] Validation réussie, stockage des sélections...`);
    // Stocker les sélections
    const selectedOptions = selections.map((s)=>{
      const option = optionGroup.options[s - 1];
      return {
        ...option,
        option_name: this.cleanOptionName(option.option_name) // Nettoyage avec emoji
      };
    });
    workflowData.selections[optionGroup.groupName] = selectedOptions;
    // LOGIQUE UNIVERSELLE : Déterminer la prochaine étape selon les règles conditionnelles
    console.log(`🚨 [UniversalWorkflow] Appel determineNextStep pour groupe: ${optionGroup.groupName}`);
    const nextStep = await this.determineNextStep(workflowData, selectedOptions, optionGroup);
    workflowData.currentStep = nextStep;
    console.log(`🔄 [UniversalWorkflow] Passage à l'étape ${workflowData.currentStep}`);
    console.log(`🔄 [UniversalWorkflow] Total étapes: ${workflowData.optionGroups.length}`);
    // Afficher un récap de la sélection
    const selectedNames = selectedOptions.map((s)=>s.option_name).join(', ');
    await this.messageSender.sendMessage(phoneNumber, `✅ ${optionGroup.displayName}: ${selectedNames}`);
    // Passer à l'étape suivante
    await this.showUniversalWorkflowStep(phoneNumber, session, workflowData, workflowData.currentStep);
  }
  /**
   * Afficher une étape du workflow
   * SOLID : Command Pattern - Chaque étape est une commande
   */ async showWorkflowStep(phoneNumber, session, workflowData, stepIndex) {
    const optionGroup = workflowData.optionGroups[stepIndex];
    if (!optionGroup) {
      // Workflow terminé - demander la quantité
      await this.completeWorkflow(phoneNumber, session, workflowData);
      return;
    }
    console.log(`📝 [WorkflowStep] Étape ${stepIndex + 1}/${workflowData.totalSteps}: ${optionGroup.groupName}`);

    // DEBUG ICONS MENU NANA
    console.log(`🔍 [DEBUG_ICONS] Product: ${workflowData.productName}`);
    console.log(`🔍 [DEBUG_ICONS] Options count: ${optionGroup.options?.length || 0}`);
    if (optionGroup.options) {
      optionGroup.options.forEach((opt, idx) => {
        console.log(`🔍 [DEBUG_ICONS] Option ${idx}: name="${opt.option_name}", icon="${opt.icon}" (${typeof opt.icon})`);
      });
    }

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
    await supabase.from('france_user_sessions').update({
      bot_state: 'COMPOSITE_WORKFLOW_STEP',
      session_data: updatedData
    }).eq('id', session.id);
  }
  /**
   * Traiter la réponse utilisateur pour une étape
   * SOLID : Single Responsibility - Validation et traitement séparés
   */ async handleWorkflowStepResponse(phoneNumber, session, message) {
    const workflowData = session.sessionData?.compositeWorkflow;
    if (!workflowData) {
      console.error('❌ [WorkflowStep] Pas de workflow en cours');
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur de session. Veuillez recommencer.');
      return;
    }
    const currentStep = workflowData.currentStep;
    const optionGroup = workflowData.optionGroups[currentStep];
    console.log(`🔍 [WorkflowStep] Traitement réponse étape ${currentStep}: "${message}"`);
    // Valider et parser la sélection
    const selections = this.parseUserSelection(message, optionGroup);
    if (!selections || selections.length === 0) {
      await this.messageSender.sendMessage(phoneNumber, `❌ Sélection invalide.\n${this.getSelectionHelp(optionGroup)}`);
      return;
    }
    // Valider les contraintes (min/max selections)
    const validation = this.validateSelections(selections, optionGroup);
    if (!validation.valid) {
      await this.messageSender.sendMessage(phoneNumber, `❌ ${validation.error}\n${this.getSelectionHelp(optionGroup)}`);
      return;
    }
    // Stocker les sélections
    const selectedOptions = selections.map((s)=>{
      const option = optionGroup.options[s - 1];
      return {
        ...option,
        option_name: this.cleanOptionName(option.option_name) // Nettoyage avec emoji
      };
    });
    workflowData.selections[optionGroup.groupName] = selectedOptions;
    // Afficher un récap de la sélection
    const selectedNames = selectedOptions.map((s)=>s.option_name).join(', ');
    await this.messageSender.sendMessage(phoneNumber, `✅ ${optionGroup.displayName}: ${selectedNames}`);
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
   */ async determineNextStep(workflowData, selectedOptions, currentGroup) {
    const currentStep = workflowData.currentStep;
    let nextStep = currentStep + 1;
    // NOUVELLE LOGIQUE CONDITIONNELLE (sans casser l'existant)
    const conditionalConfig = currentGroup.options?.[0]?.conditional_next_group;
    if (conditionalConfig && selectedOptions.length > 0) {
      // Utiliser display_order de l'option sélectionnée
      const selectedDisplayOrder = selectedOptions[0]?.display_order?.toString();
      if (selectedDisplayOrder && conditionalConfig[selectedDisplayOrder]) {
        const targetGroupOrder = conditionalConfig[selectedDisplayOrder];
        const targetIndex = workflowData.optionGroups.findIndex((g)=>g.groupOrder === targetGroupOrder);
        if (targetIndex !== -1) {
          return targetIndex;
        }
      }
    }
    // Logique universelle configurée : Vérifier next_group_order
    const configuredNext = currentGroup.options?.[0]?.next_group_order;
    if (configuredNext) {
      const targetIndex = workflowData.optionGroups.findIndex((g)=>g.groupOrder === configuredNext);
      if (targetIndex !== -1) {
        return targetIndex;
      }
    }
    // Règle universelle : Si choix "Pas de..." dans un groupe X_choice,
    // skipper les groupes facultatifs suivants du même type
    if (currentGroup.groupName.includes('_choice')) {
      const selectedChoice = selectedOptions[0]?.option_name?.toLowerCase();
      // Détecter les choix négatifs universels (pas de, sans, aucun, etc.)
      const negativeChoices = [
        'pas de',
        'sans',
        'aucun',
        'no ',
        'none'
      ];
      const isNegativeChoice = negativeChoices.some((neg)=>selectedChoice?.includes(neg));
      if (isNegativeChoice) {
        // Chercher le groupe principal associé (ex: extras_choice -> extras)
        const baseGroupName = currentGroup.groupName.replace('_choice', '');
        // Skipper tous les groupes facultatifs suivants de même type
        while(nextStep < workflowData.optionGroups.length){
          const nextGroup = workflowData.optionGroups[nextStep];
          // Si le groupe suivant est facultatif ET du même type, le skipper
          if (!nextGroup.isRequired && nextGroup.groupName.startsWith(baseGroupName)) {
            nextStep++;
          } else {
            break; // Arrêter au premier groupe obligatoire ou différent
          }
        }
      }
    }
    // VÉRIFICATION CRITIQUE : Si nextStep dépasse le nombre d'étapes
    if (nextStep >= workflowData.optionGroups.length) {} else {
      console.log(`🚨 [DEBUG-determineNextStep] Prochaine étape: ${workflowData.optionGroups[nextStep]?.groupName}`);
    }
    return nextStep;
  }
  /**
   * Finaliser le workflow et demander la quantité
   */ async completeWorkflow(phoneNumber, session, workflowData) {
    console.log('✅ [CompositeWorkflow] Workflow terminé, récapitulatif');
    // Construire le récapitulatif
    let recap = `📝 *RÉCAPITULATIF ${workflowData.productName.toUpperCase()}*\n\n`;
    // Si c'est un produit avec steps_config (CHICKEN BOX, etc.)
    if (workflowData.originalStepsConfig && workflowData.originalStepsConfig.final_format) {
      // Utiliser le format final défini dans steps_config
      let finalDescription = workflowData.originalStepsConfig.final_format;
      // Remplacer les placeholders par les sélections
      for (const [groupName, selections] of Object.entries(workflowData.selections)){
        const selectedValue = selections[0]?.name || '';
        finalDescription = finalDescription.replace(`{${groupName}}`, selectedValue);
      }
      recap += `🍟 ${finalDescription}\n`;
    } else {
      // Format standard pour les autres produits
      for (const [groupName, selections] of Object.entries(workflowData.selections)){
        const items = selections.map((s)=>s.option_name || s.name).join(', ');
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
    console.log('🔍 DEBUG_COMPOSITE_WORKFLOW_CART_ADD: Ajout produit composite au panier');
    console.log('🔍 DEBUG_COMPOSITE_BEFORE_ADD:', JSON.stringify(cart));
    console.log('🔍 DEBUG_COMPOSITE_PRODUCT:', JSON.stringify(selectedProduct));
    console.log('🔍 DEBUG_COMPOSITE_CATEGORY_NAME:', session.sessionData?.currentCategoryName);

    const cartItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      categoryName: session.sessionData?.currentCategoryName || 'Produit',
      categoryId: session.sessionData?.currentCategoryId || null,
      icon: selectedProduct.icon || null,
      quantity: 1,
      unitPrice: selectedProduct.price,
      totalPrice: selectedProduct.price,
      configuration: selectedProduct.configuration
    };

    console.log('🔍 DEBUG_COMPOSITE_CART_ITEM:', JSON.stringify(cartItem));
    cart.push(cartItem);

    console.log('🔍 DEBUG_COMPOSITE_CART_AFTER_ADD:', JSON.stringify(cart));

    const updatedData = {
      ...session.sessionData,
      cart: cart,
      selectedProduct: null,
      compositeWorkflow: null
    };

    console.log('🔍 DEBUG_COMPOSITE_UPDATED_DATA_CART:', JSON.stringify(updatedData.cart));

    await supabase.from('france_user_sessions').update({
      bot_state: 'SELECTING_PRODUCTS',
      session_data: updatedData
    }).eq('id', session.id);
  }
  /**
   * Grouper les options par étape
   */ groupOptionsByStep(options) {
    const groups = {};
    options.forEach((option)=>{
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
      groups[groupOrder].options.push({
        ...option,
        next_group_order: option.next_group_order,
        conditional_next_group: option.conditional_next_group
      });
    });
    return Object.values(groups).sort((a, b)=>a.groupOrder - b.groupOrder);
  }
  /**
   * Construire le message pour une étape
   */ buildStepMessage(workflowData, optionGroup) {
    const stepNumber = workflowData.currentStep + 1;
    const totalSteps = workflowData.totalSteps;
    let message = `📋 *${workflowData.productName.toUpperCase()}* - Étape ${stepNumber}/${totalSteps}\n\n`;
    const emoji = this.getGroupEmoji(optionGroup.groupName);
    message += `${emoji} *${optionGroup.displayName.toUpperCase()}*`;
    if (optionGroup.maxSelections > 1) {
      message += ` (${optionGroup.maxSelections} maximum)`;
    }
    message += '\n\n';
    // Ajouter option "x" pour les étapes facultatives
    // Fallback compatible avec anciens ET nouveaux workflows
    const isStepRequired = optionGroup.required !== undefined
        ? optionGroup.required
        : optionGroup.isRequired;
    console.log(`🔍 [DEBUG_REQUIRED] Groupe: ${optionGroup.groupName}, isRequired: ${optionGroup.isRequired}, required: ${optionGroup.required}, final: ${isStepRequired}`);
    if (!isStepRequired) {
      // Extraire le nom simple du groupe (garniture, boisson, etc.)
      const groupName = optionGroup.groupName || 'option';
      console.log(`✅ [DEBUG_REQUIRED] Ajout "x. Aucun" pour groupe optionnel: ${groupName}`);
      message += `x. Aucun(e) ${groupName}\n`;
    } else {
      console.log(`❌ [DEBUG_REQUIRED] PAS d'ajout "x. Aucun" pour groupe obligatoire: ${optionGroup.groupName}`);
    }
    // Utiliser les noms d'options tels qu'ils sont dans la base (ils contiennent déjà ⿡⿢⿣)
    optionGroup.options.forEach((option, index)=>{
      // Ne pas nettoyer les caractères ⿡⿢⿣ - ils sont les vrais numéros !
      // PHASE 2: Support icônes pour options (si disponible dans option.icon)
      const optionIcon = (option.icon && option.icon !== 'undefined') ? `${option.icon} ` : '';
      message += `${index + 1}. ${optionIcon}${option.option_name}`;
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
   */ parseUserSelection(message, optionGroup) {
    const trimmed = message.trim();
    // Si une seule sélection attendue
    if (optionGroup.maxSelections === 1) {
      const num = parseInt(trimmed);
      if (!isNaN(num) && num >= 1 && num <= optionGroup.options.length) {
        return [
          num
        ];
      }
      return null;
    }
    // Sélections multiples (format: "1,3,5" ou "1 3 5")
    const parts = trimmed.split(/[,\s]+/);
    const selections = [];
    for (const part of parts){
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
   */ validateSelections(selections, optionGroup) {
    if (optionGroup.isRequired && selections.length === 0) {
      return {
        valid: false,
        error: 'Cette sélection est obligatoire'
      };
    }
    if (selections.length > optionGroup.maxSelections) {
      return {
        valid: false,
        error: `Maximum ${optionGroup.maxSelections} sélection(s) autorisée(s)`
      };
    }
    return {
      valid: true
    };
  }
  /**
   * Obtenir l'aide pour la sélection
   */ getSelectionHelp(optionGroup) {
    if (optionGroup.maxSelections === 1) {
      return '💡 Tapez le numéro de votre choix';
    } else {
      return `💡 Tapez ${optionGroup.maxSelections} numéros séparés par une virgule\nExemple: 1,3 pour les choix 1 et 3`;
    }
  }
  /**
   * Obtenir l'emoji pour un groupe
   */ getGroupEmoji(groupName) {
    const emojis = {
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
   */ async getOptionsByGroup(productId, optionGroup, filterVariant) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    let query = supabase.from('france_product_options').select('*').eq('product_id', productId).eq('option_group', optionGroup).eq('is_active', true).order('display_order');
    if (filterVariant) {
      query = query.ilike('option_name', `%${filterVariant}%`);
    }
    const { data, error } = await query;
    if (error) {
      console.error('❌ [getOptionsByGroup] Erreur requête:', error);
      return [];
    }
    return (data || []).map((option, index)=>({
        id: option.id,
        name: option.option_name,
        option_name: option.option_name,
        price_modifier: option.price_modifier || 0,
        is_available: true,
        icon: option.icon  // AJOUT: Récupération de l'icône depuis la BDD
      }));
  }
  /**
   * Nettoyer le nom d'une option (enlever SEULEMENT la numérotation)
   * Garde les emojis pour un affichage moderne
   * Exemples:
   * "🍝 4. PÂTES" → "🍝 PÂTES"
   * "🥤 10. COCA ZERO" → "🥤 COCA ZERO"
   * "PÂTES" → "PÂTES" (pas de changement)
   */ cleanOptionName(name) {
    if (!name) return name;
    // Regex : enlever SEULEMENT "numéro." mais garder emoji
    // Pattern: cherche "1. " ou "10. " etc et l'enlève
    const cleaned = name.replace(/\s*\d+\.\s*/g, ' ') // Enlever tous les "1. ", "10. ", etc.
    .replace(/\s+/g, ' ') // Normaliser les espaces multiples
    .trim();
    return cleaned || name; // Fallback au nom original si vide
  }
  /**
   * Obtenir le nom d'affichage pour un groupe
   */ getGroupDisplayName(groupName) {
    const displayNames = {
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
   * Calculer le prix total pour Workflow Universal V2 avec price_modifier
   */ calculateUniversalWorkflowPrice(workflowData) {
    let totalPrice = workflowData.productPrice; // Prix de base
    let totalModifiers = 0;
    // Additionner tous les price_modifier des options sélectionnées
    for (const [groupName, selections] of Object.entries(workflowData.selections)){
      selections.forEach((option, index)=>{
        const modifier = option.price_modifier ? parseFloat(option.price_modifier) : 0;
        if (option.price_modifier) {
          totalPrice += modifier;
          totalModifiers += modifier;
        } else {
        }
      });
    }
    return totalPrice;
  }
  /**
   * PRIORITÉ 3: Gérer les produits avec steps_config (CHICKEN BOX)
   */ async handleStepsConfigWorkflow(phoneNumber, session, product) {
    console.log('🔥 [DEBUG_WORKFLOW_V2] ENTRÉE handleStepsConfigWorkflow:', {
      productName: product.name,
      workflowType: product.workflow_type,
      hasStepsConfig: !!product.steps_config,
      stepsConfigType: typeof product.steps_config
    });
    try {
      // 🔥 Vérifier la structure de steps_config
      if (!product.steps_config) {
        console.error('🔥 [DEBUG_WORKFLOW_V2] ERREUR: steps_config est undefined/null');
        throw new Error('Configuration steps_config manquante');
      }
      console.log('🔥 [DEBUG_WORKFLOW_V2] steps_config brut:', product.steps_config);
      // 🔥 Parser steps_config si c'est une string JSON
      let stepsConfig = product.steps_config;
      if (typeof stepsConfig === 'string') {
        try {
          stepsConfig = JSON.parse(stepsConfig);
          console.log('🔥 [DEBUG_WORKFLOW_V2] steps_config parsé:', stepsConfig);
        } catch (parseError) {
          console.error('🔥 [DEBUG_WORKFLOW_V2] ERREUR parsing JSON:', parseError);
          throw new Error('Configuration JSON invalide');
        }
      }
      // 🔥 Vérifier la structure steps
      if (!stepsConfig.steps || !Array.isArray(stepsConfig.steps)) {
        console.error('🔥 [DEBUG_WORKFLOW_V2] ERREUR: steps manquant ou invalide:', {
          hasSteps: !!stepsConfig.steps,
          stepsType: typeof stepsConfig.steps,
          isArray: Array.isArray(stepsConfig.steps)
        });
        throw new Error('Configuration steps invalide');
      }
      const steps = stepsConfig.steps;
      console.log('🔥 [DEBUG_WORKFLOW_V2] Steps extraits:', {
        nbSteps: steps.length,
        steps: steps.map((s)=>({
            type: s.type,
            prompt: s.prompt,
            option_groups: s.option_groups
          }))
      });
      // 🔥 Transformer steps_config en optionGroups compatible avec le système existant
      console.log('🔥 [DEBUG_WORKFLOW_V2] Début transformation steps -> optionGroups');
      const optionGroups = await Promise.all(steps.map(async (step, stepIndex)=>{
        console.log(`🔥 [DEBUG_WORKFLOW_V2] Processing step ${stepIndex + 1}:`, {
          step: step.step,
          type: step.type,
          prompt: step.prompt,
          option_groups: step.option_groups,
          required: step.required,
          max_selections: step.max_selections
        });
        // 🔥 Pour Workflow Universal V2, utiliser prompt au lieu de title
        const stepTitle = step.prompt || step.title || `Étape ${stepIndex + 1}`;
        // Extraire le nom du groupe depuis les option_groups (format Workflow V2)
        let groupName = step.option_groups && step.option_groups.length > 0 ? step.option_groups[0] : `step_${stepIndex + 1}`;
        console.log(`🔥 [DEBUG_WORKFLOW_V2] Step ${stepIndex + 1} - groupName: ${groupName}, title: ${stepTitle}`);
        // 🔥 Pour Workflow Universal V2, charger les options depuis la base via option_groups
        let options = [];
        if (step.option_groups && step.option_groups.length > 0) {
          console.log(`🔥 [DEBUG_WORKFLOW_V2] Chargement options pour groupe: ${step.option_groups[0]}`);
          // Charger les options depuis france_product_options
          const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
          const supabase = createClient(this.supabaseUrl, this.supabaseKey);
          const { data: productOptions, error } = await supabase.from('france_product_options').select('*').eq('product_id', product.id).eq('option_group', step.option_groups[0]).eq('is_active', true).order('display_order', {
            ascending: true
          });
          if (error) {
            console.error(`🔥 [DEBUG_WORKFLOW_V2] ERREUR chargement options pour ${step.option_groups[0]}:`, error);
            throw new Error(`Erreur chargement options: ${error.message}`);
          }
          if (!productOptions || productOptions.length === 0) {
            console.error(`🔥 [DEBUG_WORKFLOW_V2] AUCUNE OPTION trouvée pour groupe: ${step.option_groups[0]}`);
            throw new Error(`Aucune option trouvée pour ${step.option_groups[0]}`);
          }
          console.log(`🔥 [DEBUG_WORKFLOW_V2] ${productOptions.length} options chargées pour ${step.option_groups[0]}`);

          // DEBUG ICONS FROM DATABASE
          console.log(`🎯 [ICON_DB] Options from database for ${step.option_groups[0]}:`);
          productOptions.forEach((opt) => {
            console.log(`🎯 [ICON_DB] - ${opt.option_name}: icon="${opt.icon}" (type: ${typeof opt.icon})`);
          });

          options = productOptions.map((opt, index)=>({
              id: opt.id,
              name: opt.option_name,
              option_name: opt.option_name,
              price_modifier: opt.price_modifier || 0,
              is_available: true,
              display_order: opt.display_order,
              icon: opt.icon  // AJOUT: Support icônes pour workflow universal V2
            }));
        } else {
          console.error(`🔥 [DEBUG_WORKFLOW_V2] ERREUR: Pas d'option_groups défini pour step ${stepIndex + 1}`);
          throw new Error(`Configuration invalide: option_groups manquant pour étape ${stepIndex + 1}`);
        }
        const optionGroup = {
          groupName: groupName,
          displayName: stepTitle,
          type: step.type || 'options_selection',
          required: step.required !== false,
          minSelections: 1,
          maxSelections: step.max_selections || 1,
          options: options
        };
        console.log(`🔥 [DEBUG_WORKFLOW_V2] Option group créé:`, {
          groupName: optionGroup.groupName,
          displayName: optionGroup.displayName,
          nbOptions: optionGroup.options.length,
          required: optionGroup.required,
          maxSelections: optionGroup.maxSelections
        });
        return optionGroup;
      }));
      console.log(`🔥 [DEBUG_WORKFLOW_V2] Transformation terminée - ${optionGroups.length} groupes créés`);
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
        groups: optionGroups.map((g)=>g.groupName)
      });
      console.log(`🔥 [DEBUG_WORKFLOW_V2] workflowData créé:`, {
        productId: workflowData.productId,
        productName: workflowData.productName,
        totalSteps: workflowData.totalSteps,
        nbOptionGroups: workflowData.optionGroups.length
      });
      // Utiliser showUniversalWorkflowStep pour afficher la première étape
      console.log(`🔥 [DEBUG_WORKFLOW_V2] Appel showUniversalWorkflowStep...`);
      await this.showUniversalWorkflowStep(phoneNumber, session, workflowData, 0);
      console.log(`🔥 [DEBUG_WORKFLOW_V2] showUniversalWorkflowStep terminé avec succès`);
    } catch (error) {
      console.error('🔥 [DEBUG_WORKFLOW_V2] ERREUR dans handleStepsConfigWorkflow:', error);
      console.error('🔥 [DEBUG_WORKFLOW_V2] Stack trace:', error.stack);
      console.error('🔥 [DEBUG_WORKFLOW_V2] Product qui a causé l\'erreur:', {
        name: product.name,
        id: product.id,
        workflow_type: product.workflow_type
      });
      await this.messageSender.sendMessage(phoneNumber, `❌ Erreur configuration ${product.name}.\nVeuillez réessayer.`);
    }
  }
  // ============================================
  // MÉTHODES POUR LE WORKFLOW MENU PIZZA
  // ============================================
  /**
   * Initialiser le workflow menu pizza dans la session
   */ async initializeMenuWorkflow(phoneNumber, session, product, menuConfig) {
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
    const { data: updateResult, error: updateError } = await supabase.from('france_user_sessions').update({
      bot_state: 'MENU_PIZZA_WORKFLOW',
      session_data: {
        ...session.sessionData,
        menuPizzaWorkflow: workflowData
      }
    }).eq('id', session.id);
    if (updateError) {
      console.error(`🔍 DEBUG_MENU: ERREUR mise à jour session:`, updateError);
      throw updateError;
    }
    console.log(`🔍 DEBUG_MENU: Session mise à jour avec succès:`, updateResult);
    console.log(`✅ [MenuPizza] Workflow initialisé pour ${product.name}`);
  }
  /**
   * Traiter le composant suivant du menu
   */ async processNextMenuComponent(phoneNumber, session, componentIndex) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    // Récupérer les données de session actualisées
    const { data: sessionData } = await supabase.from('france_user_sessions').select('*').eq('phone_number', phoneNumber).single();
    const menuConfig = sessionData.session_data.menuPizzaWorkflow.menuConfig;
    const components = menuConfig.components;
    if (componentIndex >= components.length) {
      // Tous les composants traités - finaliser
      await this.finalizeMenuOrder(phoneNumber, sessionData);
      return;
    }
    const component = components[componentIndex];
    switch(component.type){
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
   */ async showPizzaSelection(phoneNumber, session, component, componentIndex) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    const restaurantId = session.session_data.selectedRestaurantId || session.restaurant_id;
    // Résoudre dynamiquement l'ID de la catégorie Pizzas
    const { data: pizzaCategory } = await supabase.from('france_menu_categories').select('id').eq('restaurant_id', restaurantId).eq('slug', 'pizzas').single();
    if (!pizzaCategory) {
      console.error('🔍 DEBUG_MENU: ERREUR - Catégorie pizzas introuvable');
      throw new Error('Catégorie pizzas introuvable');
    }
    console.log(`🔍 DEBUG_MENU: Catégorie pizzas trouvée - ID: ${pizzaCategory.id}`);
    // Récupérer les pizzas disponibles
    const { data: pizzas } = await supabase.from('france_products').select('*').eq('restaurant_id', restaurantId).eq('category_id', pizzaCategory.id).eq('is_active', true).order('display_order');
    // Normaliser la taille (minuscules → majuscules)
    const size = component.size; // junior/senior/mega
    const normalizedSize = size.toUpperCase(); // JUNIOR/SENIOR/MEGA
    // Récupérer les prix selon la taille
    const { data: variants } = await supabase.from('france_product_variants').select('*').in('product_id', pizzas?.map((p)=>p.id) || []).eq('variant_name', normalizedSize);
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
    pizzas?.forEach((pizza, index)=>{
      const variant = variants?.find((v)=>v.product_id === pizza.id);
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
      selectionMode: component.selection_mode,
      currentSize: normalizedSize
    });
    await this.messageSender.sendMessage(phoneNumber, message);
  }
  /**
   * Mettre à jour la session du menu
   */ async updateMenuSession(phoneNumber, session, updates, currentSelections) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(this.supabaseUrl, this.supabaseKey);
    // Détecter la structure de session (sessionData vs session_data)
    const sessionData = session.sessionData || session.session_data;
    // Préserver les sélections : priorité aux sélections locales, puis existantes en DB
    const existingWorkflow = sessionData?.menuPizzaWorkflow || {};
    const preservedSelections = currentSelections || existingWorkflow.selections || {};
    // Construire le nouvel état workflow en préservant les sélections
    const newWorkflowState = {
      ...existingWorkflow,
      ...updates
    };
    // Préserver les sélections (priorité : updates.selections > currentSelections > existingWorkflow.selections)
    if (!updates.selections) {
      newWorkflowState.selections = preservedSelections;
    }
    const updatedSessionData = {
      ...sessionData,
      menuPizzaWorkflow: newWorkflowState
    };
    await supabase.from('france_user_sessions').update({
      session_data: updatedSessionData
    }).eq('id', session.id);
  }
  /**
   * Finaliser la commande du menu
   */ async finalizeMenuOrder(phoneNumber, session) {
    const workflow = session.session_data.menuPizzaWorkflow;
    const selections = workflow.selections;
    // Construire le récapitulatif
    let recap = `✅ ${workflow.product.name} - Confirmation\n\n`;
    recap += `Votre menu:\n`;
    // Pizzas
    if (selections.pizzas) {
      selections.pizzas.forEach((pizza, i)=>{
        recap += `• Pizza ${i + 1}: ${pizza.name} (${pizza.size})\n`;
      });
    }
    // Boissons
    if (selections.beverages) {
      selections.beverages.forEach((bev)=>{
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
   */ async handleMenuPizzaResponse(phoneNumber, session, message) {
    const workflow = session.sessionData.menuPizzaWorkflow;
    const waitingFor = workflow.waitingFor;
    switch(waitingFor){
      case 'pizza_selection':
        await this.processPizzaSelectionResponse(phoneNumber, session, message);
        break;
      case 'beverage_selection':
        await this.processBeverageSelectionResponse(phoneNumber, session, message);
        break;
      case 'side_selection':
        await this.processSideSelectionResponse(phoneNumber, session, message);
        break;
      case 'confirmation':
        await this.processMenuConfirmation(phoneNumber, session, message);
        break;
    }
  }
  /**
   * Traiter la sélection de pizzas
   */ async processPizzaSelectionResponse(phoneNumber, session, message) {
    const workflow = session.sessionData.menuPizzaWorkflow;
    const expectedQuantity = workflow.expectedQuantity;
    const selectionMode = workflow.selectionMode;
    let selections = [];
    if (selectionMode === 'multiple') {
      // Parser "1,3,5" en tableau [1, 3, 5]
      selections = message.split(',').map((s)=>parseInt(s.trim()));
      // Valider le nombre
      if (selections.length !== expectedQuantity) {
        await this.messageSender.sendMessage(phoneNumber, `❌ Vous devez choisir exactement ${expectedQuantity} pizzas.\n` + `Exemple: ${Array.from({
          length: expectedQuantity
        }, (_, i)=>i + 1).join(',')}`);
        return;
      }
    } else {
      // Sélection simple
      selections = [
        parseInt(message.trim())
      ];
    }
    // Valider les numéros
    const availablePizzas = workflow.availablePizzas;
    for (const selection of selections){
      if (isNaN(selection) || selection < 1 || selection > availablePizzas.length) {
        await this.messageSender.sendMessage(phoneNumber, `❌ Choix invalide: ${selection}. Choisissez entre 1 et ${availablePizzas.length}.`);
        return;
      }
    }
    // Stocker les sélections
    const selectedPizzas = selections.map((index)=>{
      const pizza = availablePizzas[index - 1];
      const variant = workflow.pizzaVariants.find((v)=>v.product_id === pizza.id);
      return {
        id: pizza.id,
        name: pizza.name,
        size: workflow.currentSize || workflow.menuConfig.components[workflow.currentComponent]?.size?.toUpperCase() || 'MEDIUM',
        price: variant?.price_on_site || 0
      };
    });
    // Ajouter au workflow
    if (!workflow.selections) workflow.selections = {};
    workflow.selections.pizzas = selectedPizzas;
    // Sauvegarder les sélections avant de passer au composant suivant
    await this.updateMenuSession(phoneNumber, session, {
      currentComponent: workflow.currentComponent + 1
    }, workflow.selections);
    // Passer au composant suivant
    await this.processNextMenuComponent(phoneNumber, session, workflow.currentComponent + 1);
  }
  /**
   * Afficher sélection de boissons
   */ async showBeverageSelection(phoneNumber, session, component, componentIndex) {
    let message = `🥤 ${component.title}\n\n`;
    component.options.forEach((option, index)=>{
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
   */ async showSideSelection(phoneNumber, session, component, componentIndex) {
    let message = `🍗 ${component.title}\n\n`;
    component.options.forEach((option, index)=>{
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
   */ async processBeverageSelectionResponse(phoneNumber, session, message) {
    const workflow = session.sessionData.menuPizzaWorkflow;
    const choice = parseInt(message.trim());
    const availableOptions = workflow.availableOptions;
    if (isNaN(choice) || choice < 1 || choice > availableOptions.length) {
      await this.messageSender.sendMessage(phoneNumber, `❌ Choix invalide. Tapez un numéro entre 1 et ${availableOptions.length}.`);
      return;
    }
    const selectedOption = availableOptions[choice - 1];
    // Ajouter aux sélections
    if (!workflow.selections) workflow.selections = {};
    if (!workflow.selections.beverages) workflow.selections.beverages = [];
    workflow.selections.beverages.push(selectedOption);
    // Sauvegarder les sélections avant de passer au composant suivant
    await this.updateMenuSession(phoneNumber, session, {
      currentComponent: workflow.currentComponent + 1
    }, workflow.selections);
    // Passer au composant suivant
    await this.processNextMenuComponent(phoneNumber, session, workflow.currentComponent + 1);
  }
  /**
   * Traiter sélection d'accompagnements
   */ async processSideSelectionResponse(phoneNumber, session, message) {
    const workflow = session.sessionData.menuPizzaWorkflow;
    const choice = parseInt(message.trim());
    const availableOptions = workflow.availableOptions;
    if (isNaN(choice) || choice < 1 || choice > availableOptions.length) {
      await this.messageSender.sendMessage(phoneNumber, `❌ Choix invalide. Tapez un numéro entre 1 et ${availableOptions.length}.`);
      return;
    }
    const selectedOption = availableOptions[choice - 1];
    // Ajouter aux sélections
    if (!workflow.selections) workflow.selections = {};
    workflow.selections.sides = selectedOption;
    // Sauvegarder les sélections avant de passer au composant suivant
    await this.updateMenuSession(phoneNumber, session, {
      currentComponent: workflow.currentComponent + 1
    }, workflow.selections);
    // Passer au composant suivant
    await this.processNextMenuComponent(phoneNumber, session, workflow.currentComponent + 1);
  }
  /**
   * Confirmer et ajouter au panier
   */ async processMenuConfirmation(phoneNumber, session, message) {
    const choice = message.trim();
    if (choice === '1') {
      // Ajouter au panier
      const workflow = session.sessionData.menuPizzaWorkflow;
      const cartItem = {
        id: workflow.product.id,
        name: workflow.product.name,
        price: workflow.menuConfig.price,
        quantity: 1,
        type: 'menu_pizza',
        details: workflow.selections,
        deliveryMode: session.sessionData.deliveryMode
      };
      // Ajouter au panier existant
      const cart = session.sessionData.cart || {};
      const itemKey = `menu_${workflow.product.id}_${getCurrentTime().getTime()}`;
      cart[itemKey] = cartItem;
      // Calculer le total
      const totalPrice = Object.values(cart).reduce((sum, item)=>sum + item.price * item.quantity, 0);
      // Sauvegarder
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      await supabase.from('france_user_sessions').update({
        bot_state: 'SELECTING_PRODUCTS',
        session_data: {
          ...session.sessionData,
          cart: cart,
          totalPrice: totalPrice,
          menuPizzaWorkflow: null // Nettoyer le workflow
        }
      }).eq('id', session.id);
      // Créer message de confirmation spécifique aux menus pizza
      let pizzaConfirmMessage = `✅ ${workflow.product.name} ajouté !\n\n`;
      // Détail des pizzas sélectionnées
      if (workflow.selections && workflow.selections.pizzas) {
        workflow.selections.pizzas.forEach((pizza, index)=>{
          pizzaConfirmMessage += `• Pizza ${index + 1}: ${pizza.emoji || '🍕'} ${pizza.name} (${workflow.currentSize || 'JUNIOR'})\n`;
        });
      }
      pizzaConfirmMessage += '\n━━━━━━━━━━━━━━━━━━━━\n';
      pizzaConfirmMessage += '🛒 MON PANIER\n\n';
      // Afficher tous les items du panier
      Object.values(cart).forEach((item, index)=>{
        if (item.type === 'menu_pizza') {
          pizzaConfirmMessage += `${index + 1}. ${item.name} - ${item.price}€\n`;
          if (item.details && item.details.pizzas) {
            item.details.pizzas.forEach((pizza, pIndex)=>{
              pizzaConfirmMessage += `   • Pizza ${pIndex + 1}: ${pizza.name}\n`;
            });
          }
        } else {
          pizzaConfirmMessage += `${index + 1}. ${item.name} - ${item.price}€\n`;
        }
      });
      pizzaConfirmMessage += '\n━━━━━━━━━━━━━━━━━━━━\n';
      pizzaConfirmMessage += `💎 TOTAL: ${totalPrice}€\n`;
      pizzaConfirmMessage += `📦 ${Object.keys(cart).length} produit${Object.keys(cart).length > 1 ? 's' : ''}\n\n`;
      pizzaConfirmMessage += 'ACTIONS RAPIDES:\n';
      pizzaConfirmMessage += '⚡ 99 = Passer commande\n';
      pizzaConfirmMessage += '🗑️ 00 = Vider panier\n';
      pizzaConfirmMessage += '🍕 0  = Ajouter d\'autres produits';
      await this.messageSender.sendMessage(phoneNumber, pizzaConfirmMessage);
    } else if (choice === '2') {
      // Recommencer
      const workflow = session.sessionData.menuPizzaWorkflow;
      await this.startMenuPizzaWorkflow(phoneNumber, workflow.product, session);
    } else {
      await this.messageSender.sendMessage(phoneNumber, `❌ Choix invalide. Tapez 1 pour confirmer ou 2 pour recommencer.`);
    }
  }
}
