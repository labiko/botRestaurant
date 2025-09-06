// ============================================
// LOGIQUE GÉNÉRALISÉE - APPROCHE HYBRIDE
// ============================================

/**
 * 🏗️ NOUVELLE ARCHITECTURE : Détection universelle des workflows
 */
async function handleProductSelectionUniversal(phoneNumber: string, session: any, selectedItem: any) {
  console.log('🏗️ [UNIVERSAL] Traitement universel du produit:', selectedItem.name);
  
  // 1. Récupérer les capacités du restaurant
  const restaurantFeatures = await getRestaurantFeatures(session.context.selectedRestaurantId);
  
  // 2. Analyser le type de workflow du produit
  if (selectedItem.workflow_type && selectedItem.requires_steps) {
    console.log('🔄 [WORKFLOW] Produit nécessitant un workflow:', selectedItem.workflow_type);
    
    // Vérifier si le restaurant supporte ce type de workflow
    if (restaurantSupportsWorkflow(restaurantFeatures, selectedItem.workflow_type)) {
      await handleUniversalWorkflow(phoneNumber, session, selectedItem);
      return;
    } else {
      console.log('⚠️ [WORKFLOW] Restaurant ne supporte pas ce workflow');
      await whatsapp.sendMessage(phoneNumber, '❌ Ce produit n\'est pas disponible pour ce restaurant.');
      return;
    }
  }
  
  // 3. Traitement selon le type de workflow
  switch (selectedItem.workflow_type) {
    case 'pizza_config':
      if (restaurantFeatures.has('pizzas')) {
        await handlePizzaWorkflow(phoneNumber, session, selectedItem);
      } else {
        await addItemToCart(phoneNumber, session, selectedItem); // Fallback
      }
      break;
      
    case 'composite_selection':
      if (restaurantFeatures.has('composite_menus')) {
        await handleCompositeWorkflow(phoneNumber, session, selectedItem);
      } else {
        await addItemToCart(phoneNumber, session, selectedItem); // Fallback
      }
      break;
      
    case 'pizza_menu_config':
      if (restaurantFeatures.has('interactive_workflows')) {
        await handlePizzaMenuSelection(phoneNumber, session, selectedItem);
      } else {
        await addItemToCart(phoneNumber, session, selectedItem); // Fallback
      }
      break;
      
    default:
      // Produit simple - ajout direct au panier
      console.log('📦 [SIMPLE] Produit simple - ajout direct');
      await addItemToCart(phoneNumber, session, selectedItem);
  }
}

/**
 * 🔍 FONCTION : Récupérer les capacités d'un restaurant
 */
async function getRestaurantFeatures(restaurantId: number): Promise<Map<string, any>> {
  console.log('🔍 [FEATURES] Récupération des capacités restaurant:', restaurantId);
  
  const { data: features, error } = await supabase
    .from('france_restaurant_features')
    .select('feature_type, is_enabled, config')
    .eq('restaurant_id', restaurantId)
    .eq('is_enabled', true);
    
  if (error) {
    console.error('❌ [FEATURES] Erreur récupération capacités:', error);
    return new Map(); // Fallback vide
  }
  
  const featuresMap = new Map();
  features?.forEach(feature => {
    featuresMap.set(feature.feature_type, feature.config || {});
  });
  
  console.log('✅ [FEATURES] Capacités récupérées:', Array.from(featuresMap.keys()));
  return featuresMap;
}

/**
 * ✅ FONCTION : Vérifier si un restaurant supporte un workflow
 */
function restaurantSupportsWorkflow(features: Map<string, any>, workflowType: string): boolean {
  switch (workflowType) {
    case 'pizza_config':
    case 'pizza_menu_config':
      return features.has('pizzas') || features.has('interactive_workflows');
      
    case 'composite_selection':
      return features.has('composite_menus') || features.has('interactive_workflows');
      
    default:
      return false;
  }
}

/**
 * 🔄 FONCTION : Workflow universel basé sur la configuration
 */
async function handleUniversalWorkflow(phoneNumber: string, session: any, selectedItem: any) {
  console.log('🔄 [UNIVERSAL WORKFLOW] Démarrage workflow pour:', selectedItem.name);
  
  try {
    const stepsConfig = JSON.parse(selectedItem.steps_config || '{}');
    
    if (!stepsConfig.steps || stepsConfig.steps.length === 0) {
      console.error('❌ [WORKFLOW] Configuration des étapes manquante');
      await addItemToCart(phoneNumber, session, selectedItem); // Fallback
      return;
    }
    
    // Initialiser la configuration du workflow
    const workflowConfig = {
      originalItem: selectedItem,
      currentStep: 1,
      totalSteps: stepsConfig.steps.length,
      selections: {},
      stepsConfig: stepsConfig
    };
    
    // Changer l'état de la session
    await SimpleSession.update(session.id, {
      state: 'CONFIGURING_UNIVERSAL_WORKFLOW',
      context: {
        ...session.context,
        workflowConfig
      }
    });
    
    // Afficher la première étape
    await showWorkflowStep(phoneNumber, workflowConfig, 1);
    
  } catch (error) {
    console.error('❌ [WORKFLOW] Erreur parsing configuration:', error);
    await addItemToCart(phoneNumber, session, selectedItem); // Fallback
  }
}

/**
 * 📋 FONCTION : Afficher une étape du workflow
 */
async function showWorkflowStep(phoneNumber: string, config: any, stepNumber: number) {
  const step = config.stepsConfig.steps[stepNumber - 1];
  
  if (!step) {
    console.error('❌ [WORKFLOW] Étape introuvable:', stepNumber);
    return;
  }
  
  let message = `🔄 **${config.originalItem.name}**\n\n`;
  message += `📋 **Étape ${stepNumber}/${config.totalSteps} : ${step.title}**\n\n`;
  
  step.options.forEach((option: string, index: number) => {
    message += `${index + 1}️⃣ ${option}\n`;
  });
  
  message += `\n📝 Tapez le numéro de votre choix\n`;
  message += `❌ Tapez "annuler" pour annuler`;
  
  await whatsapp.sendMessage(phoneNumber, message);
}

/**
 * 🔄 FONCTION : Gérer les réponses du workflow universel
 */
async function handleUniversalWorkflowResponse(phoneNumber: string, session: any, response: string) {
  const config = session.context.workflowConfig;
  
  if (!config) {
    console.error('❌ [UNIVERSAL WORKFLOW] Configuration manquante');
    return;
  }
  
  const currentStep = config.stepsConfig.steps[config.currentStep - 1];
  const choiceIndex = parseInt(response) - 1;
  
  // Valider le choix
  if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= currentStep.options.length) {
    await whatsapp.sendMessage(phoneNumber, 
      `❌ Choix invalide. Tapez un numéro entre 1 et ${currentStep.options.length}.`);
    return;
  }
  
  // Enregistrer la sélection
  config.selections[`step_${config.currentStep}`] = currentStep.options[choiceIndex];
  
  if (config.currentStep < config.totalSteps) {
    // Passer à l'étape suivante
    config.currentStep++;
    
    await SimpleSession.update(session.id, {
      state: 'CONFIGURING_UNIVERSAL_WORKFLOW',
      context: {
        ...session.context,
        workflowConfig: config
      }
    });
    
    await showWorkflowStep(phoneNumber, config, config.currentStep);
    
  } else {
    // Workflow terminé - créer l'item final
    await finishUniversalWorkflow(phoneNumber, session, config);
  }
}

/**
 * ✅ FONCTION : Finaliser le workflow universel
 */
async function finishUniversalWorkflow(phoneNumber: string, session: any, config: any) {
  console.log('✅ [WORKFLOW] Finalisation workflow');
  
  // Créer la description finale
  let finalComposition = config.stepsConfig.final_format || config.originalItem.composition;
  
  // Remplacer les placeholders avec les sélections
  Object.keys(config.selections).forEach((key, index) => {
    const placeholder = `{${config.stepsConfig.steps[index]?.type === 'single_choice' ? 
      ['main', 'drink', 'option'][index] || `choice${index + 1}` : 
      `choice${index + 1}`}}`;
    finalComposition = finalComposition.replace(placeholder, config.selections[key]);
  });
  
  // Créer la description d'affichage
  const selectionsArray = Object.values(config.selections);
  const displayName = `${config.originalItem.name} (${selectionsArray.join(' + ')})`;
  
  // Créer l'item final
  const finalMenuItem = {
    id: config.originalItem.id,
    name: config.originalItem.name,
    display_name: displayName,
    price_on_site: config.originalItem.price_on_site,
    price_delivery: config.originalItem.price_delivery,
    composition: finalComposition,
    product_type: 'composite',
    is_configured_menu: true,
    workflow_selections: config.selections
  };
  
  // Ajouter au panier
  await addItemToCart(phoneNumber, session, finalMenuItem, 1, false);
  
  // Retourner à l'état ORDERING
  await SimpleSession.update(session.id, {
    state: 'ORDERING',
    context: {
      ...session.context,
      workflowConfig: null
    }
  });
  
  // Message de confirmation
  let confirmMessage = `✅ **${config.originalItem.name} ajouté au panier !**\n\n`;
  confirmMessage += `📋 **Configuration :**\n`;
  Object.values(config.selections).forEach((selection: any) => {
    confirmMessage += `• ${selection}\n`;
  });
  confirmMessage += `\n💰 **Prix :** ${finalMenuItem.price_on_site}€\n\n`;
  confirmMessage += `🛒 Tapez "00" pour voir votre panier`;
  
  await whatsapp.sendMessage(phoneNumber, confirmMessage);
}