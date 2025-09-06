/**
 * 👶 FONCTION : handleMenuEnfantSelection
 * Démarrer la configuration interactive du MENU ENFANT
 */
async function handleMenuEnfantSelection(phoneNumber: string, session: any, selectedItem: any) {
  console.log('👶 [MENU ENFANT] Début de la configuration');
  
  // Initialiser la configuration du menu enfant
  const menuEnfantConfig = {
    originalItem: selectedItem,
    currentStep: 1,
    totalSteps: 2,
    selectedMain: null,
    selectedDrink: null
  };
  
  // Changer l'état de la session
  await SimpleSession.update(session.id, {
    state: 'CONFIGURING_MENU_ENFANT',
    context: {
      ...session.context,
      menuEnfantConfig
    }
  });
  
  // Afficher le choix du plat principal
  let message = `👶 **MENU ENFANT** - 7€ (8€ livraison)\n\n`;
  message += `🍽 **Étape 1/2 : Choisissez votre plat principal**\n\n`;
  message += `1️⃣ Cheeseburger\n`;
  message += `2️⃣ Nuggets\n\n`;
  message += `📝 Tapez le numéro de votre choix\n`;
  message += `❌ Tapez "annuler" pour annuler`;
  
  await whatsapp.sendMessage(phoneNumber, message);
}

/**
 * 👶 FONCTION : handleMenuEnfantConfigurationResponse
 * Gérer les réponses de configuration du MENU ENFANT
 */
async function handleMenuEnfantConfigurationResponse(phoneNumber: string, session: any, response: string) {
  const menuConfig = session.context.menuEnfantConfig;
  
  if (!menuConfig) {
    console.error('❌ [MENU ENFANT] Configuration manquante');
    return;
  }
  
  console.log('👶 [MENU ENFANT] Étape:', menuConfig.currentStep, 'Réponse:', response);
  
  if (menuConfig.currentStep === 1) {
    // Étape 1 : Choix du plat principal
    let selectedMain = null;
    
    if (response === '1') {
      selectedMain = 'Cheeseburger';
    } else if (response === '2') {
      selectedMain = 'Nuggets';
    } else {
      await whatsapp.sendMessage(phoneNumber, '❌ Choix invalide. Tapez 1 pour Cheeseburger ou 2 pour Nuggets.');
      return;
    }
    
    // Sauvegarder le choix et passer à l'étape 2
    const updatedConfig = {
      ...menuConfig,
      selectedMain,
      currentStep: 2
    };
    
    await SimpleSession.update(session.id, {
      state: 'CONFIGURING_MENU_ENFANT',
      context: {
        ...session.context,
        menuEnfantConfig: updatedConfig
      }
    });
    
    // Afficher le choix de boisson
    let message = `👶 **MENU ENFANT** avec **${selectedMain}**\n\n`;
    message += `🥤 **Étape 2/2 : Choisissez votre boisson**\n\n`;
    message += `1️⃣ Compote\n`;
    message += `2️⃣ Caprisun\n\n`;
    message += `📝 Tapez le numéro de votre choix\n`;
    message += `❌ Tapez "annuler" pour annuler`;
    
    await whatsapp.sendMessage(phoneNumber, message);
    
  } else if (menuConfig.currentStep === 2) {
    // Étape 2 : Choix de la boisson
    let selectedDrink = null;
    
    if (response === '1') {
      selectedDrink = 'Compote';
    } else if (response === '2') {
      selectedDrink = 'Caprisun';
    } else {
      await whatsapp.sendMessage(phoneNumber, '❌ Choix invalide. Tapez 1 pour Compote ou 2 pour Caprisun.');
      return;
    }
    
    // Configuration terminée - créer l'item final
    const finalMenuItem = {
      id: menuConfig.originalItem.id,
      name: menuConfig.originalItem.name,
      display_name: `MENU ENFANT (${menuConfig.selectedMain} + ${selectedDrink})`,
      price_on_site: menuConfig.originalItem.price_on_site,
      price_delivery: menuConfig.originalItem.price_delivery,
      composition: `${menuConfig.selectedMain} + Frites + Kinder Surprise + ${selectedDrink}`,
      product_type: 'composite',
      is_configured_menu: true,
      menu_components: {
        main: menuConfig.selectedMain,
        drink: selectedDrink,
        extras: ['Frites', 'Kinder Surprise']
      }
    };
    
    // Ajouter au panier
    await addItemToCart(phoneNumber, session, finalMenuItem, 1, false);
    
    // Retourner à l'état ORDERING
    await SimpleSession.update(session.id, {
      state: 'ORDERING',
      context: {
        ...session.context,
        menuEnfantConfig: null
      }
    });
    
    // Message de confirmation
    let confirmMessage = `✅ **MENU ENFANT ajouté au panier !**\n\n`;
    confirmMessage += `🍽 ${menuConfig.selectedMain}\n`;
    confirmMessage += `🍟 Frites\n`;
    confirmMessage += `🎁 Kinder Surprise\n`;
    confirmMessage += `🥤 ${selectedDrink}\n\n`;
    confirmMessage += `💰 Prix : ${finalMenuItem.price_on_site}€\n\n`;
    confirmMessage += `🛒 Tapez "00" pour voir votre panier`;
    
    await whatsapp.sendMessage(phoneNumber, confirmMessage);
  }
}