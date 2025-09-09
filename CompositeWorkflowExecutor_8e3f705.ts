// 🏗️ SERVICE DE WORKFLOW COMPOSITE - ARCHITECTURE UNIVERSELLE
// SOLID : Single Responsibility - Gestion des workflows composites uniquement

import { IMessageSender } from '../types.ts';

/**
 * Exécuteur de workflows composites (TACOS, PIZZAS avec suppléments, etc.)
 * SOLID : Strategy Pattern - Différentes stratégies selon le type de produit
 */
export class CompositeWorkflowExecutor {
  constructor(
    private messageSender: IMessageSender,
    private supabaseUrl: string,
    private supabaseKey: string
  ) {}

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
        if (product.steps_config && product.steps_config.steps && product.steps_config.steps.length > 0) {
          console.log(`✅ [CompositeWorkflow] Utilisation steps_config pour ${product.name}`);
          await this.handleStepsConfigWorkflow(phoneNumber, session, product);
          return;
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
    const updatedData = {
      ...session.sessionData,
      variantSelection: true,
      selectedProduct: product,
      availableVariants: finalVariants,
      displayConfig: displayConfig,
      workflowTemplate: workflowTemplate,
      awaitingVariantSelection: true
    };
    
    await supabase
      .from('france_user_sessions')
      .update({
        bot_state: 'AWAITING_SIZE_SELECTION',
        session_data: updatedData
      })
      .eq('id', session.id);
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
    const { data: productOptions, error } = await supabase
      .from('france_product_options')
      .select('*')
      .eq('product_id', product.id)
      .order('group_order', { ascending: true })
      .order('display_order', { ascending: true });
    
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
   * Traitement universel sélection de variante
   * 100% UNIVERSEL - Utilise les nouvelles tables de configuration
   */
  async handleSizeSelection(
    phoneNumber: string,
    session: any,
    message: string
  ): Promise<void> {
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
    
    const workflowData = session.sessionData?.universalWorkflow;
    
    if (!workflowData) {
      console.error('❌ [UniversalWorkflow] Pas de workflow en cours - workflowData est undefined/null');
      console.error('❌ [UniversalWorkflow] Session.sessionData disponible:', Object.keys(session.sessionData || {}));
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur de session. Veuillez recommencer.');
      return;
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
    await new Promise(resolve => setTimeout(resolve, 500));
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
    
    // Passer à l'étape suivante (avec délai pour éviter spam)
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.showWorkflowStep(phoneNumber, session, workflowData, workflowData.currentStep);
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
    
    for (const [groupName, selections] of Object.entries(workflowData.selections)) {
      const items = (selections as any[]).map(s => s.option_name).join(', ');
      const emoji = this.getGroupEmoji(groupName);
      recap += `${emoji} ${this.getGroupDisplayName(groupName)}: ${items}\n`;
    }
    
    recap += `\n💰 Prix unitaire: ${workflowData.productPrice}€\n`;
    recap += `\n📦 Combien en voulez-vous ?\nTapez le nombre souhaité (1-99)`;
    
    await this.messageSender.sendMessage(phoneNumber, recap);
    
    // Mettre à jour la session
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
      compositeWorkflow: null,
      awaitingQuantity: true
    };
    
    await supabase
      .from('france_user_sessions')
      .update({
        bot_state: 'AWAITING_QUANTITY',
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
      const firstStep = steps[0];
      
      if (firstStep.type === 'single_choice') {
        let message = `🔧 **${product.name}**\n\n`;
        message += `${firstStep.title}:\n\n`;
        
        firstStep.options.forEach((option: string, index: number) => {
          message += `${index + 1}. ${option}\n`;
        });
        
        message += `\n💡 Tapez le numéro de votre choix`;
        
        await this.messageSender.sendMessage(phoneNumber, message);
        
        // Mettre à jour la session pour le workflow steps_config
        // TODO: Implémenter la gestion des réponses
        console.log(`✅ [StepsConfig] Workflow affiché pour ${product.name}`);
      }
      
    } catch (error) {
      console.error('❌ [StepsConfig] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Erreur configuration ${product.name}.\nVeuillez réessayer.`);
    }
  }
}