// 🤖 BOT UNIVERSEL - ORCHESTRATEUR PRINCIPAL
// Architecture SOLID : Single Responsibility + Dependency Injection

import { 
  IMessageHandler, 
  ISessionManager, 
  IRestaurantConfigManager, 
  IWorkflowExecutor,
  IMessageSender,
  BotSession,
  RestaurantConfig,
  WorkflowDefinition,
  ApiResponse 
} from '../types.ts';

import { CompositeWorkflowExecutor } from '../services/CompositeWorkflowExecutor.ts';
import { OrderService } from '../services/OrderService.ts';
import { AddressManagementService } from '../services/AddressManagementService.ts';
import { GooglePlacesService } from '../services/GooglePlacesService.ts';
import { WhatsAppContactService } from '../services/WhatsAppContactService.ts';

/**
 * Orchestrateur principal du bot universel
 * SOLID - Single Responsibility : Coordonne les services, ne fait pas le travail
 */
export class UniversalBot implements IMessageHandler {
  private compositeWorkflowExecutor: CompositeWorkflowExecutor;
  private orderService: OrderService;
  private addressService: AddressManagementService;
  private googlePlacesService: GooglePlacesService;
  private whatsappContactService: WhatsAppContactService;
  private supabaseUrl: string;
  private supabaseKey: string;
  
  constructor(
    private sessionManager: ISessionManager,
    private configManager: IRestaurantConfigManager,
    private workflowExecutor: IWorkflowExecutor,
    private messageSender: IMessageSender
  ) {
    this.supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    this.supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Initialiser le service de workflow composite
    this.compositeWorkflowExecutor = new CompositeWorkflowExecutor(
      messageSender,
      this.supabaseUrl,
      this.supabaseKey
    );
    
    // Initialiser le service WhatsApp Contact
    const greenApiUrl = Deno.env.get('GREEN_API_URL') || 'https://api.green-api.com';
    const instanceId = Deno.env.get('GREEN_API_INSTANCE_ID')!;
    const apiToken = Deno.env.get('GREEN_API_TOKEN')!;
    this.whatsappContactService = new WhatsAppContactService(greenApiUrl, instanceId, apiToken);
    
    // Initialiser les services de commande et adresse
    this.orderService = new OrderService(this.supabaseUrl, this.supabaseKey);
    this.addressService = new AddressManagementService(
      this.supabaseUrl, 
      this.supabaseKey, 
      this.whatsappContactService
    );
    this.googlePlacesService = new GooglePlacesService();
  }

  /**
   * Point d'entrée principal - traite tous les messages WhatsApp
   * COPIE EXACTE DE LA LOGIQUE ORIGINALE pour maintenir la compatibilité
   */
  async handleMessage(phoneNumber: string, message: string): Promise<void> {
    try {
      console.log(`🤖 [UniversalBot] Message reçu de ${phoneNumber}: "${message}"`);
      
      // PRIORITÉ 1: Détection numéro téléphone restaurant (accès QR code)
      if (this.isPhoneNumberFormat(message)) {
        console.log('📱 Format téléphone détecté:', message);
        const restaurant = await this.findRestaurantByPhone(message);
        
        if (restaurant) {
          console.log(`✅ Restaurant trouvé: ${restaurant.name}`);
          await this.handleDirectRestaurantAccess(phoneNumber, restaurant);
          return;
        } else {
          console.log('❌ Restaurant non trouvé pour ce numéro');
          await this.messageSender.sendMessage(phoneNumber, 
            `❌ Aucun restaurant trouvé avec le numéro ${message}.\n💡 Vérifiez le numéro ou contactez le restaurant directement.`);
          return;
        }
      }
      
      // PRIORITÉ 2: Messages classiques (salut/bonjour) - Menu générique  
      if (message.toLowerCase().includes('salut') || message.toLowerCase().includes('bonjour')) {
        await this.handleGenericGreeting(phoneNumber);
        return;
      }
      
      // PRIORITÉ 3: Gestion complète des messages selon l'état de session
      const session = await this.sessionManager.getSession(phoneNumber);
      
      console.log('🔄 [SESSION_GET] Session récupérée:', {
        sessionExists: !!session,
        botState: session?.botState,
        restaurantId: session?.restaurantId
      });
      
      if (session && session.restaurantId) {
        // L'utilisateur a une session active avec restaurant sélectionné
        await this.handleSessionMessage(phoneNumber, session, message);
        return;
      }
      
      // Pas de session active - sélection par numéro = erreur
      const menuNumber = parseInt(message.trim());
      if (menuNumber >= 1 && menuNumber <= 9) {
        await this.messageSender.sendMessage(phoneNumber, 
          `🔍 Sélection catégorie ${menuNumber}\n❌ **Session expirée ou restaurant non sélectionné**\n💡 **Comment commander :**\n📱 Scannez le QR code du restaurant souhaité\n🍽️ Le menu apparaîtra automatiquement\n🎯 Puis tapez le numéro de votre choix\n**Scannez le QR code pour commencer !**`);
        return;
      }
      
      // PRIORITÉ 4: Réponse par défaut
      await this.messageSender.sendMessage(phoneNumber, 
        `🤖 Message reçu : "${message}"\n🚧 Bot universel opérationnel.\n💡 **Comment commander :**\n• Scannez le QR code du restaurant\n• Ou tapez "salut" pour voir les infos\nStatus : Bot universel ✅`);
      
    } catch (error) {
      console.error('❌ [UniversalBot] Erreur traitement message:', error);
      await this.handleError(phoneNumber, error as Error);
    }
  }

  /**
   * Routage intelligent des messages selon l'état
   * SOLID - Strategy Pattern : Différentes stratégies selon l'état
   */
  private async routeMessage(
    session: BotSession, 
    config: RestaurantConfig, 
    message: string
  ): Promise<void> {
    
    switch (session.botState.mode) {
      case 'workflow_active':
        console.log(`🔄 [Route] Workflow actif: ${session.currentWorkflowId}`);
        await this.handleWorkflowMessage(session, config, message);
        break;
        
      case 'cart_management':
        console.log('🛒 [Route] Gestion panier');
        await this.handleCartMessage(session, config, message);
        break;
        
      case 'menu_browsing':
      default:
        console.log('📋 [Route] Navigation menu');
        await this.handleMenuBrowsing(session, config, message);
        break;
    }
  }

  /**
   * Gestion des messages pendant un workflow actif
   * SOLID - Delegation : Délègue à WorkflowExecutor
   */
  private async handleWorkflowMessage(
    session: BotSession,
    config: RestaurantConfig,
    message: string
  ): Promise<void> {
    
    if (!session.currentWorkflowId || !session.workflowStepId) {
      console.error('❌ [Workflow] Session corrompue - workflow_id ou step_id manquant');
      await this.resetToMenuBrowsing(session);
      return;
    }

    // Récupérer la définition du workflow
    const workflows = await this.configManager.getWorkflows(session.restaurantId);
    const workflow = workflows.find(w => w.workflowId === session.currentWorkflowId);
    
    if (!workflow) {
      console.error(`❌ [Workflow] Workflow non trouvé: ${session.currentWorkflowId}`);
      await this.resetToMenuBrowsing(session);
      return;
    }

    // Récupérer les étapes du workflow
    const steps = await this.configManager.getWorkflowSteps(workflow.id);
    const currentStep = steps.find(s => s.stepId === session.workflowStepId);
    
    if (!currentStep) {
      console.error(`❌ [Workflow] Étape non trouvée: ${session.workflowStepId}`);
      await this.resetToMenuBrowsing(session);
      return;
    }

    console.log(`⚡ [Workflow] Exécution étape: ${currentStep.title}`);

    // Déléguer l'exécution au WorkflowExecutor
    const context = {
      session,
      currentStep,
      userInput: message,
      previousResults: [] // TODO: Implémenter historique
    };

    const result = await this.workflowExecutor.executeStep(currentStep, context);
    
    if (result.success) {
      console.log('✅ [Workflow] Étape réussie');
      
      // Mettre à jour la session si nécessaire
      if (result.shouldUpdateSession) {
        await this.updateSessionFromResult(session, result);
      }
      
      // Envoyer message de réponse si nécessaire
      if (result.message) {
        await this.messageSender.sendMessage(session.phoneNumber, result.message);
      }
      
    } else {
      console.log('❌ [Workflow] Étape échouée:', result.errors);
      await this.handleWorkflowError(session, result);
    }
  }

  /**
   * Gestion des messages pour navigation dans les menus
   * SOLID - Strategy : Stratégie différente pour chaque mode
   */
  private async handleMenuBrowsing(
    session: BotSession,
    config: RestaurantConfig,
    message: string
  ): Promise<void> {
    
    console.log('📋 [MenuBrowsing] Analyse du message pour déclenchement workflow');
    
    // Analyser si le message déclenche un workflow
    const workflows = await this.configManager.getWorkflows(session.restaurantId);
    
    for (const workflow of workflows) {
      if (await this.shouldTriggerWorkflow(workflow, message, session)) {
        console.log(`🚀 [MenuBrowsing] Déclenchement workflow: ${workflow.name}`);
        await this.startWorkflow(session, workflow);
        return;
      }
    }
    
    // Aucun workflow déclenché - traitement menu standard
    await this.handleStandardMenuNavigation(session, config, message);
  }

  /**
   * Gestion du panier
   */
  private async handleCartMessage(
    session: BotSession,
    config: RestaurantConfig,
    message: string
  ): Promise<void> {
    
    console.log('🛒 [Cart] Gestion panier - TODO: Implémenter');
    // TODO: Implémenter gestion panier
  }

  /**
   * Démarrage d'un workflow
   * SOLID - Command Pattern : Encapsule l'action de démarrer un workflow
   */
  private async startWorkflow(
    session: BotSession,
    workflow: WorkflowDefinition
  ): Promise<void> {
    
    console.log(`🎬 [StartWorkflow] Démarrage: ${workflow.name}`);
    
    // Récupérer la première étape
    const steps = await this.configManager.getWorkflowSteps(workflow.id);
    const firstStep = steps.find(s => s.stepOrder === 1);
    
    if (!firstStep) {
      console.error(`❌ [StartWorkflow] Aucune première étape trouvée pour workflow ${workflow.workflowId}`);
      return;
    }

    // Mettre à jour la session
    await this.sessionManager.updateSession(session.id, {
      botState: { ...session.botState, mode: 'workflow_active' },
      currentWorkflowId: workflow.workflowId,
      workflowStepId: firstStep.stepId,
      workflowData: {
        workflowId: workflow.workflowId,
        currentStepId: firstStep.stepId,
        stepHistory: [],
        selectedItems: {},
        validationErrors: []
      }
    });

    // Exécuter la première étape
    const updatedSession = await this.sessionManager.getSession(session.phoneNumber);
    const context = {
      session: updatedSession,
      currentStep: firstStep,
      userInput: '', // Pas d'input utilisateur pour la première étape
      previousResults: []
    };

    const result = await this.workflowExecutor.executeStep(firstStep, context);
    
    if (result.message) {
      await this.messageSender.sendMessage(session.phoneNumber, result.message);
    }
  }

  /**
   * Vérifier si un workflow doit être déclenché
   */
  private async shouldTriggerWorkflow(
    workflow: WorkflowDefinition,
    message: string,
    session: BotSession
  ): Promise<boolean> {
    
    // TODO: Implémenter logique de déclenchement basée sur workflow.triggerConditions
    // Pour l'instant, déclenchement simple basé sur des patterns
    
    if (workflow.workflowId === 'MENU_1_WORKFLOW' && message === '1') return true;
    if (workflow.workflowId === 'MENU_2_WORKFLOW' && message === '2') return true;
    if (workflow.workflowId === 'MENU_3_WORKFLOW' && message === '3') return true;
    if (workflow.workflowId === 'MENU_4_WORKFLOW' && message === '4') return true;
    
    return false;
  }

  /**
   * Navigation menu standard (quand aucun workflow n'est actif)
   */
  private async handleStandardMenuNavigation(
    session: BotSession,
    config: RestaurantConfig,
    message: string
  ): Promise<void> {
    
    // TODO: Implémenter navigation standard
    console.log('📋 [StandardNav] Navigation standard - TODO: Implémenter');
    
    // Réponse temporaire
    await this.messageSender.sendMessage(
      session.phoneNumber, 
      `Message reçu: "${message}"\nWorkflows disponibles:\n${config.availableWorkflows.map((w, i) => `${i+1}. ${w}`).join('\n')}`
    );
  }

  /**
   * Mise à jour session depuis résultat d'étape
   */
  private async updateSessionFromResult(
    session: BotSession,
    result: StepResult
  ): Promise<void> {
    
    const updates: Partial<BotSession> = {};
    
    // Mettre à jour l'étape suivante si spécifiée
    if (result.nextStepId) {
      updates.workflowStepId = result.nextStepId;
      
      // Mettre à jour workflowData
      if (session.workflowData) {
        updates.workflowData = {
          ...session.workflowData,
          currentStepId: result.nextStepId,
          stepHistory: [...session.workflowData.stepHistory, session.workflowStepId || '']
        };
      }
    }
    
    // Ajouter données du résultat
    if (result.data && session.workflowData) {
      updates.workflowData = {
        ...session.workflowData,
        selectedItems: {
          ...session.workflowData.selectedItems,
          [session.workflowStepId || 'unknown']: result.data
        }
      };
    }

    if (Object.keys(updates).length > 0) {
      await this.sessionManager.updateSession(session.id, updates);
    }
  }

  /**
   * Gestion des erreurs de workflow
   */
  private async handleWorkflowError(
    session: BotSession,
    result: StepResult
  ): Promise<void> {
    
    console.log('❌ [WorkflowError] Gestion erreur workflow');
    
    const errorMessages = result.errors?.map(e => e.message).join('\n') || 'Erreur inconnue';
    await this.messageSender.sendMessage(
      session.phoneNumber, 
      `❌ ${errorMessages}\n\n✨ Retapez votre choix`
    );
  }

  /**
   * Reset vers navigation menu
   */
  private async resetToMenuBrowsing(session: BotSession): Promise<void> {
    
    console.log('🔄 [Reset] Retour navigation menu');
    
    await this.sessionManager.updateSession(session.id, {
      botState: { ...session.botState, mode: 'menu_browsing' },
      currentWorkflowId: undefined,
      workflowStepId: undefined,
      workflowData: {
        workflowId: '',
        currentStepId: '',
        stepHistory: [],
        selectedItems: {},
        validationErrors: []
      }
    });
    
    await this.messageSender.sendMessage(
      session.phoneNumber,
      '🔄 Retour au menu principal\nTapez un numéro pour commencer'
    );
  }

  /**
   * Gestion des erreurs globales
   */
  private async handleError(phoneNumber: string, error: Error): Promise<void> {
    
    console.error('💥 [UniversalBot] Erreur globale:', error);
    
    await this.messageSender.sendMessage(
      phoneNumber,
      '❌ Une erreur est survenue. Tapez "resto" pour recommencer.'
    );
  }

  // ==========================================
  // MÉTHODES UTILITAIRES COPIÉES DE L'ANCIEN BOT
  // ==========================================

  /**
   * Vérifier si le message est un numéro de téléphone
   */
  private isPhoneNumberFormat(message: string): boolean {
    const cleanMessage = message.trim();
    const phoneRegex = /^\d{7,}$/; // Au moins 7 chiffres, que des chiffres
    return phoneRegex.test(cleanMessage);
  }

  /**
   * Trouver un restaurant par son numéro de téléphone
   */
  private async findRestaurantByPhone(phoneNumber: string): Promise<any> {
    try {
      console.log('🔍 Recherche restaurant avec numéro:', phoneNumber);
      
      // Essayer différents formats de normalisation
      const formats = [
        phoneNumber, // Format original (ex: 0177123456)
        `+33${phoneNumber.substring(1)}`, // Format international (ex: +330177123456)
        `33${phoneNumber.substring(1)}` // Format sans + (ex: 330177123456)
      ];
      
      // Import temporaire de supabase
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      for (const format of formats) {
        console.log('🔍 Test format:', format);
        const { data: restaurant } = await supabase
          .from('france_restaurants')
          .select('*')
          .or(`phone.eq.${format},whatsapp_number.eq.${format}`)
          .eq('is_active', true)
          .single();
        
        if (restaurant) {
          console.log('✅ Restaurant trouvé:', restaurant.name);
          return restaurant;
        }
      }
      
      console.log('❌ Aucun restaurant trouvé avec ce numéro');
      return null;
    } catch (error) {
      console.error('❌ Erreur recherche restaurant:', error);
      return null;
    }
  }

  /**
   * Gérer l'accès direct à un restaurant
   */
  private async handleDirectRestaurantAccess(phoneNumber: string, restaurant: any): Promise<void> {
    try {
      console.log(`🎯 Accès direct restaurant: ${restaurant.name}`);
      
      // Premier message : Bienvenue personnalisé
      const welcomeMessage = `🇫🇷 Bonjour ! Bienvenue chez ${restaurant.name} !\n🍕 ${restaurant.description || 'Découvrez notre délicieux menu'}\n📍 ${restaurant.address || 'Restaurant disponible'}`;
      await this.messageSender.sendMessage(phoneNumber, welcomeMessage);
      
      // Deuxième message : Choix du mode de livraison
      const deliveryModeMessage = `🚚 **Choisissez votre mode :**\n📍 1 - Sur place\n📦 2 - À emporter\n🚚 3 - Livraison\nTapez le numéro de votre choix.`;
      await this.messageSender.sendMessage(phoneNumber, deliveryModeMessage);
      
      // Créer session avec état CHOOSING_DELIVERY_MODE
      await this.createSessionForRestaurant(phoneNumber, restaurant);
      console.log('✅ [DirectAccess] Session créée pour choix mode livraison');
      
    } catch (error) {
      console.error('❌ [DirectAccess] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de l\'accès au restaurant.');
    }
  }
  
  /**
   * Créer une session pour un restaurant (équivalent de SimpleSession.create)
   */
  private async createSessionForRestaurant(phoneNumber: string, restaurant: any): Promise<void> {
    try {
      // Import temporaire de supabase
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      // Supprimer les sessions existantes
      await supabase
        .from('france_user_sessions')
        .delete()
        .eq('phone_number', phoneNumber);
      
      // Créer nouvelle session avec l'état CHOOSING_DELIVERY_MODE
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes d'expiration
      
      await supabase
        .from('france_user_sessions')
        .insert({
          phone_number: phoneNumber,
          chat_id: phoneNumber,
          restaurant_id: restaurant.id,
          current_step: 'CHOOSING_DELIVERY_MODE',
          bot_state: 'CHOOSING_DELIVERY_MODE',
          session_data: {
            selectedRestaurantId: restaurant.id,
            selectedRestaurantName: restaurant.name
          },
          cart_items: [],
          total_amount: 0,
          expires_at: expiresAt.toISOString()
        });
        
      console.log(`✅ [CreateSession] Session créée pour restaurant ${restaurant.name}`);
    } catch (error) {
      console.error('❌ [CreateSession] Erreur création session:', error);
    }
  }

  /**
   * Gérer les salutations génériques
   */
  private async handleGenericGreeting(phoneNumber: string): Promise<void> {
    try {
      // Import temporaire de supabase
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      // Test connexion BDD
      const { data: restaurants, error } = await supabase
        .from('france_restaurants')
        .select('*')
        .eq('is_active', true)
        .limit(1);
        
      if (error) {
        console.error('❌ Erreur BDD:', error);
        await this.messageSender.sendMessage(phoneNumber, '❌ Erreur de connexion à la base de données.');
        return;
      }
      
      // Premier message : Bienvenue générique
      await this.messageSender.sendMessage(phoneNumber, 
        `🇫🇷 Bonjour ! Bienvenue sur notre système de commande !\n🍕 ${restaurants?.length || 0} restaurant(s) disponible(s)\n${restaurants?.[0] ? `✅ ${restaurants[0].name}` : '❌ Aucun restaurant'}\n💡 Scannez le QR code du restaurant pour accéder directement à son menu !`);
      
      // Deuxième message : Exemple de menu
      let menuText = '🍽️ *SYSTEME DE COMMANDE*\n\n';
      menuText += '📱 **Comment commander :**\n';
      menuText += '1. Scannez le QR code du restaurant\n';
      menuText += '2. Le menu apparaîtra automatiquement\n';
      menuText += '3. Tapez le numéro de votre choix\n\n';
      menuText += '💡 **Chaque restaurant a son menu personnalisé !**\n';
      menuText += '🔍 Exemple de catégories : Tacos, Burgers, Pizzas, etc.\n\n';
      menuText += '📱 **Scannez le QR code pour commencer !**';
      
      await this.messageSender.sendMessage(phoneNumber, menuText);
      
    } catch (error) {
      console.error('❌ [GenericGreeting] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de l\'affichage du menu générique.');
    }
  }

  /**
   * Gérer les messages de session active - COPIÉ DE L'ANCIEN BOT
   * Maintient la compatibilité exacte avec le workflow existant
   */
  private async handleSessionMessage(phoneNumber: string, session: any, message: string): Promise<void> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Commandes globales
    if (normalizedMessage === 'annuler') {
      await this.deleteSession(phoneNumber);
      await this.messageSender.sendMessage(phoneNumber, '❌ Commande annulée. Tapez le numéro du restaurant pour recommencer.');
      return;
    }

    console.log('🔍 [DEBUG] État session AVANT traitement:', {
      phoneNumber,
      message,
      normalizedMessage,
      sessionState: session.botState,
      sessionId: session.id,
      hasContext: !!session.sessionData,
      contextKeys: session.sessionData ? Object.keys(session.sessionData) : []
    });

    switch (session.botState) {
      case 'CHOOSING_DELIVERY_MODE':
        await this.handleDeliveryModeChoice(phoneNumber, session, message);
        break;
        
      case 'VIEWING_MENU':
        await this.handleMenuNavigation(phoneNumber, session, message);
        break;
        
      case 'VIEWING_CATEGORY':
        await this.handleCategoryNavigation(phoneNumber, session, message);
        break;
        
      case 'SELECTING_PRODUCTS':
        await this.handleProductSelection(phoneNumber, session, message);
        break;
        
      case 'COMPOSITE_WORKFLOW_STEP':
        await this.compositeWorkflowExecutor.handleWorkflowStepResponse(phoneNumber, session, message);
        break;
        
      case 'AWAITING_SIZE_SELECTION':
        await this.compositeWorkflowExecutor.handleSizeSelection(phoneNumber, session, message);
        break;
        
      case 'AWAITING_UNIVERSAL_WORKFLOW':
        await this.compositeWorkflowExecutor.handleUniversalWorkflowResponse(phoneNumber, session, message);
        break;
        
      case 'AWAITING_WORKFLOW_ACTIONS':
        await this.handleWorkflowActions(phoneNumber, session, message);
        break;
        
      case 'AWAITING_CART_ACTIONS':
        await this.handleCartActions(phoneNumber, session, message);
        break;
        
      case 'AWAITING_QUANTITY':
        await this.handleQuantityInput(phoneNumber, session, message);
        break;
        
      case 'AWAITING_DELIVERY_MODE_CHOICE':
        await this.handleDeliveryModeSelection(phoneNumber, session, message);
        break;
        
      case 'AWAITING_ADDRESS_CHOICE':
        await this.handleAddressChoice(phoneNumber, session, message);
        break;
        
      case 'AWAITING_NEW_ADDRESS':
        await this.handleNewAddressInput(phoneNumber, session, message);
        break;
        
      case 'AWAITING_ADDRESS_CONFIRMATION':
        await this.handleAddressConfirmation(phoneNumber, session, message);
        break;
        
      default:
        console.log(`⚠️ [SessionMessage] État non géré: ${session.botState}`);
        await this.messageSender.sendMessage(phoneNumber, 
          `❌ État de session non reconnu.\nTapez le numéro du restaurant pour recommencer.`);
        break;
    }
  }
  
  /**
   * Gérer le choix du mode de livraison
   */
  private async handleDeliveryModeChoice(phoneNumber: string, session: any, message: string): Promise<void> {
    const modeChoice = parseInt(message.trim());
    let deliveryMode = '';
    
    switch (modeChoice) {
      case 1:
        deliveryMode = 'sur_place';
        break;
      case 2:
        deliveryMode = 'a_emporter';
        break;
      case 3:
        deliveryMode = 'livraison';
        break;
      default:
        await this.messageSender.sendMessage(phoneNumber, 
          `❌ Choix invalide. Tapez 1, 2 ou 3 :\n📍 1 - Sur place\n📦 2 - À emporter\n🚚 3 - Livraison`);
        return;
    }
    
    // Récupérer les infos restaurant
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const restaurant = await supabase
      .from('france_restaurants')
      .select('*')
      .eq('id', session.restaurantId)
      .single();
    
    if (restaurant.data) {
      await this.showMenuAfterDeliveryModeChoice(phoneNumber, restaurant.data, deliveryMode);
    }
  }
  
  /**
   * Afficher le menu après choix du mode de livraison
   */
  private async showMenuAfterDeliveryModeChoice(phoneNumber: string, restaurant: any, deliveryMode: string): Promise<void> {
    // Import temporaire de supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Chargement dynamique des catégories depuis la BDD
    const { data: categories, error: catError } = await supabase
      .from('france_menu_categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('display_order');

    if (catError || !categories || categories.length === 0) {
      console.error('❌ Erreur catégories:', catError);
      await this.messageSender.sendMessage(phoneNumber, `❌ Menu temporairement indisponible pour ${restaurant.name}.\n\n💡 Contactez le restaurant directement ou réessayez plus tard.`);
      return;
    }

    // Construction dynamique du menu
    let menuText = `🍽️ *MENU ${restaurant.name.toUpperCase()}*\n`;
    
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
    
    // Mettre à jour la session vers VIEWING_MENU avec le mode de livraison
    const session = await this.sessionManager.getSession(phoneNumber);
    if (session) {
      console.log('📦 [showMenuAfterDeliveryModeChoice] Mise à jour session vers VIEWING_MENU');
      
      const updatedData = {
        ...session.sessionData,
        categories: categories,
        deliveryMode: deliveryMode,
        cart: session.sessionData?.cart || {},
        totalPrice: session.sessionData?.totalPrice || 0
      };
      
      await this.sessionManager.updateSession(session.id, {
        botState: 'VIEWING_MENU',
        sessionData: updatedData
      });
    }
  }
  
  /**
   * Gérer la navigation dans les menus
   */
  private async handleMenuNavigation(phoneNumber: string, session: any, message: string): Promise<void> {
    console.log(`🔍 [handleMenuNavigation] Message reçu: "${message}"`);
    console.log(`🔍 [handleMenuNavigation] Message trimmed: "${message.trim()}"`);
    
    // Sélection de catégorie par numéro
    const categoryNumber = parseInt(message.trim());
    const categories = session.sessionData?.categories || [];
    
    console.log(`🔍 [handleMenuNavigation] Numéro parsé: ${categoryNumber}`);
    console.log(`🔍 [handleMenuNavigation] Nombre de catégories: ${categories.length}`);
    console.log(`🔍 [handleMenuNavigation] Categories disponibles:`, categories.map((cat: any, index: number) => `${index + 1}: ${cat.name}`));
    console.log(`🔍 [handleMenuNavigation] État de session: ${session.botState}`);
    console.log(`🔍 [handleMenuNavigation] Session data keys:`, Object.keys(session.sessionData || {}));
    
    if (isNaN(categoryNumber)) {
      console.log(`❌ [handleMenuNavigation] Message n'est pas un nombre valide: "${message}"`);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Veuillez entrer un numéro valide entre 1 et ${categories.length}.`);
      return;
    }
    
    if (categoryNumber >= 1 && categoryNumber <= categories.length) {
      const selectedCategory = categories[categoryNumber - 1];
      console.log(`✅ [handleMenuNavigation] Catégorie sélectionnée: ${selectedCategory.name} (ID: ${selectedCategory.id})`);
      
      // Import temporaire de supabase
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      const restaurant = await supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', session.restaurantId)
        .single();
      
      if (restaurant.data) {
        console.log(`✅ [handleMenuNavigation] Restaurant trouvé: ${restaurant.data.name}`);
        await this.showProductsInCategory(phoneNumber, restaurant.data, session, selectedCategory.id);
      } else {
        console.error(`❌ [handleMenuNavigation] Restaurant non trouvé pour ID: ${session.restaurantId}`);
      }
    } else {
      console.log(`❌ [handleMenuNavigation] Choix invalide: ${categoryNumber}, doit être entre 1 et ${categories.length}`);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Choix invalide. Choisissez entre 1 et ${categories.length}.`);
    }
  }
  
  /**
   * Gérer la navigation dans une catégorie
   */
  private async handleCategoryNavigation(phoneNumber: string, session: any, message: string): Promise<void> {
    // TODO: Implémenter la navigation dans les catégories
    console.log('🔄 [CategoryNavigation] Navigation catégorie - TODO: Implémenter');
    await this.messageSender.sendMessage(phoneNumber, 
      `🔄 Navigation catégorie en cours d'implémentation...\nMessage: ${message}`);
  }
  
  /**
   * Gérer la sélection d'un produit - ARCHITECTURE UNIVERSELLE
   * SOLID : Command Pattern - Chaque sélection est une commande
   */
  private async handleProductSelection(phoneNumber: string, session: any, message: string): Promise<void> {
    console.log(`🛒 [ProductSelection] Message reçu: "${message}"`);
    console.log(`🛒 [ProductSelection] État session actuel:`, session.currentState);
    console.log(`🛒 [ProductSelection] Session complète:`, JSON.stringify(session.sessionData, null, 2));
    
    const productNumber = parseInt(message.trim());
    const products = session.sessionData?.products || [];
    
    console.log(`🛒 [ProductSelection] Numéro sélectionné: ${productNumber}`);
    console.log(`🛒 [ProductSelection] ${products.length} produits disponibles`);
    
    // Option 0 : Retour au menu principal
    if (productNumber === 0) {
      console.log('↩️ [ProductSelection] Retour au menu principal');
      
      // Récupérer les catégories et réafficher le menu
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      const { data: restaurant } = await supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', session.restaurantId)
        .single();
      
      if (restaurant) {
        const deliveryMode = session.sessionData?.deliveryMode || 'sur_place';
        await this.showMenuAfterDeliveryModeChoice(phoneNumber, restaurant, deliveryMode);
      }
      return;
    }
    
    // Vérifier la validité du choix
    if (isNaN(productNumber) || productNumber < 1 || productNumber > products.length) {
      console.log(`❌ [ProductSelection] Choix invalide: ${productNumber}`);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Choix invalide. Choisissez entre 1 et ${products.length}.\n↩️ Tapez 0 pour revenir au menu.`);
      return;
    }
    
    const selectedProduct = products[productNumber - 1];
    console.log(`✅ [ProductSelection] Produit sélectionné: ${selectedProduct.name} (ID: ${selectedProduct.id})`);
    
    // DÉBOGAGE : Afficher toutes les propriétés du produit
    console.log(`🔍 [ProductSelection] Propriétés du produit:`, {
      name: selectedProduct.name,
      requires_steps: selectedProduct.requires_steps,
      workflow_type: selectedProduct.workflow_type,
      type: selectedProduct.type,
      product_type: selectedProduct.product_type
    });
    
    // Vérifier si le produit nécessite des étapes (workflow composite)
    let isComposite = selectedProduct.requires_steps || selectedProduct.workflow_type || selectedProduct.type === 'composite';
    
    // NOUVELLE LOGIQUE : Vérifier aussi si le produit a des variantes de taille configurées
    if (!isComposite) {
      console.log(`🔍 [ProductSelection] Vérification des variantes pour ${selectedProduct.name}...`);
      
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      // Vérifier dans france_product_sizes
      const { data: sizes } = await supabase
        .from('france_product_sizes')
        .select('id')
        .eq('product_id', selectedProduct.id);
      
      console.log(`🔍 [ProductSelection] ${sizes?.length || 0} tailles trouvées pour ${selectedProduct.name}`);
      
      if (sizes && sizes.length > 0) {
        isComposite = true;
        console.log(`✅ [ProductSelection] ${selectedProduct.name} détecté comme ayant des variantes de taille`);
      }
    }
    
    if (isComposite) {
      console.log(`🔄 [ProductSelection] Produit composite détecté: ${selectedProduct.workflow_type || selectedProduct.type || 'variants'}`);
      
      // Lancer le workflow composite universel
      await this.compositeWorkflowExecutor.startCompositeWorkflow(phoneNumber, selectedProduct, session);
      return;
    }
    
    // Produit simple - Demander la quantité
    console.log('📦 [ProductSelection] Produit simple - Demande de quantité');
    
    // Stocker le produit sélectionné dans la session
    const updatedData = {
      ...session.sessionData,
      selectedProduct: selectedProduct,
      awaitingQuantity: true
    };
    
    await this.sessionManager.updateSession(session.id, {
      botState: 'AWAITING_QUANTITY',
      sessionData: updatedData
    });
    
    await this.messageSender.sendMessage(phoneNumber, 
      `📦 *${selectedProduct.name}*\n💰 Prix unitaire: ${selectedProduct.price}€\n\n📝 Combien en voulez-vous ?\nTapez le nombre souhaité (1-99)`);
  }
  
  /**
   * Afficher les produits d'une catégorie - ARCHITECTURE UNIVERSELLE
   * SOLID : Single Responsibility - Une seule responsabilité : afficher les produits
   */
  private async showProductsInCategory(phoneNumber: string, restaurant: any, session: any, categoryId: string): Promise<void> {
    console.log(`📦 [ShowProducts] Chargement produits catégorie ID: ${categoryId}`);
    
    try {
      // Import temporaire de supabase
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      // 1. Récupérer la catégorie pour son nom et icône
      const { data: category } = await supabase
        .from('france_menu_categories')
        .select('*')
        .eq('id', categoryId)
        .single();
      
      if (!category) {
        console.error(`❌ [ShowProducts] Catégorie ${categoryId} non trouvée`);
        await this.messageSender.sendMessage(phoneNumber, '❌ Catégorie non trouvée.');
        return;
      }
      
      // 2. Récupérer les produits actifs de la catégorie
      const { data: products, error } = await supabase
        .from('france_products')
        .select(`
          *,
          france_product_sizes (*),
          france_product_variants (*)
        `)
        .eq('category_id', categoryId)
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .order('display_order');
      
      if (error || !products || products.length === 0) {
        console.error('❌ [ShowProducts] Erreur ou aucun produit:', error);
        await this.messageSender.sendMessage(phoneNumber, 
          `❌ Aucun produit disponible dans la catégorie ${category.name}.\n\nTapez un numéro pour choisir une autre catégorie.`);
        return;
      }
      
      console.log(`✅ [ShowProducts] ${products.length} produits trouvés`);
      
      // 3. NOUVELLE LOGIQUE UNIVERSELLE : Si UN SEUL produit avec variantes, affichage direct
      if (products.length === 1) {
        const product = products[0];
        const hasVariants = (product.france_product_sizes && product.france_product_sizes.length > 0) ||
                          (product.france_product_variants && product.france_product_variants.length > 0);
        
        if (hasVariants) {
          console.log(`🎯 [ShowProducts] Produit unique avec variantes détecté: ${product.name} - Affichage direct des options`);
          
          // Utiliser le CompositeWorkflowExecutor pour affichage direct
          await this.compositeWorkflowExecutor.showSizeVariantSelection(phoneNumber, session, product, supabase);
          return;
        }
      }
      
      // 4. Logique classique : Construire la liste des produits  
      const deliveryMode = session.sessionData?.deliveryMode || 'sur_place';
      console.log(`📍 [ShowProducts] Mode de livraison: ${deliveryMode}`);
      console.log(`📍 [ShowProducts] Session complète:`, JSON.stringify(session.sessionData, null, 2));
      
      let menuText = `${category.icon || '🍽️'} *${category.name.toUpperCase()}*\n`;
      menuText += `${deliveryMode === 'livraison' ? '🚚 Prix livraison' : '📍 Prix sur place'}\n\n`;
      
      const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
      const productList: any[] = [];
      
      products.forEach((product: any, index: number) => {
        const displayNumber = index < 9 ? numberEmojis[index] : index === 9 ? '🔟' : `${index + 1}`;
        
        console.log(`🔍 [ShowProducts] Traitement produit ${index + 1}: ${product.name}`);
        console.log(`🔍 [ShowProducts] Produit a ${product.france_product_sizes?.length || 0} tailles et ${product.france_product_variants?.length || 0} variantes`);
        
        // Déterminer les prix selon le mode de livraison choisi
        let priceOnSite = 0;
        let priceDelivery = 0;
        let priceText = '';
        let activePrice = 0;
        
        if (product.france_product_sizes && product.france_product_sizes.length > 0) {
          // Produit avec tailles - GROUPER ET FILTRER par mode de livraison comme dans CompositeWorkflowExecutor
          console.log(`✅ [ShowProducts] ${product.name} a des tailles configurées - traitement avec nouvelle logique`);
          console.log(`📊 [ShowProducts] Détail tailles:`, JSON.stringify(product.france_product_sizes, null, 2));
          const sizeGroups = new Map();
          
          // Grouper par taille
          product.france_product_sizes.forEach(size => {
            const key = size.size_name;
            if (!sizeGroups.has(key)) {
              sizeGroups.set(key, []);
            }
            sizeGroups.get(key).push(size);
          });
          
          // Extraire les prix selon le mode choisi
          const filteredPrices = [];
          sizeGroups.forEach(sizeList => {
            sizeList.sort((a, b) => a.price_on_site - b.price_on_site);
            
            let selectedSize;
            if (deliveryMode === 'livraison') {
              selectedSize = sizeList.find(s => s.price_delivery > s.price_on_site) || sizeList[sizeList.length - 1];
              filteredPrices.push(selectedSize.price_delivery || selectedSize.price_on_site + 1);
            } else {
              selectedSize = sizeList[0];
              filteredPrices.push(selectedSize.price_on_site);
            }
          });
          
          // Calculer min/max sur les prix filtrés
          const minPrice = Math.min(...filteredPrices);
          const maxPrice = Math.max(...filteredPrices);
          
          console.log(`💰 [ShowProducts] Prix calculés pour ${product.name}:`, { minPrice, maxPrice, deliveryMode, filteredPrices });
          
          priceText = minPrice === maxPrice ? `${minPrice}€` : `${minPrice}€ - ${maxPrice}€`;
          activePrice = minPrice;
          priceOnSite = minPrice; // Approximation pour le stockage
          priceDelivery = minPrice;
        } else if (product.france_product_variants && product.france_product_variants.length > 0) {
          // Produit avec variantes - extraire les prix selon le mode choisi
          const variants = product.france_product_variants.filter((v: any) => v.is_active);
          if (variants.length > 0) {
            const prices = variants.map(variant => {
              if (deliveryMode === 'livraison') {
                return variant.price_delivery || variant.price_on_site + 1;
              } else {
                return variant.price_on_site;
              }
            });
            
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            priceText = minPrice === maxPrice ? `${minPrice}€` : `${minPrice}€ - ${maxPrice}€`;
            activePrice = minPrice;
            priceOnSite = minPrice; // Approximation pour le stockage
            priceDelivery = minPrice;
          }
        } else if (product.base_price) {
          // Produit simple avec prix de base - AFFICHER UNIQUEMENT le prix du mode
          console.log(`📦 [ShowProducts] ${product.name} utilise base_price: ${product.base_price}€`);
          priceOnSite = product.base_price;
          priceDelivery = product.base_price + 1;
          activePrice = deliveryMode === 'livraison' ? priceDelivery : priceOnSite;
          priceText = `${activePrice}€`;
        } else if (product.price_on_site_base) {
          // Produit avec prix sur place/livraison séparés - AFFICHER UNIQUEMENT le prix du mode
          console.log(`📦 [ShowProducts] ${product.name} utilise price_on_site_base: ${product.price_on_site_base}€ / delivery: ${product.price_delivery_base}€`);
          priceOnSite = product.price_on_site_base;
          priceDelivery = product.price_delivery_base || product.price_on_site_base + 1;
          activePrice = deliveryMode === 'livraison' ? priceDelivery : priceOnSite;
          priceText = `${activePrice}€`;
        } else {
          console.log(`❌ [ShowProducts] ${product.name} n'a AUCUN prix configuré! Données produit:`, JSON.stringify(product, null, 2));
        }
        
        console.log(`💰 [ShowProducts] ${product.name}: sur place ${priceOnSite}€, livraison ${priceDelivery}€, mode ${deliveryMode}, prix actif ${activePrice}€`);
        
        // Ajouter la description si disponible
        let productLine = `${displayNumber} *${product.name}*`;
        if (product.description) {
          productLine += ` - ${product.description}`;
        }
        if (priceText) {
          productLine += ` - ${priceText}`;
        }
        
        menuText += `${productLine}\n`;
        
        // Stocker le produit pour la session
        productList.push({
          id: product.id,
          name: product.name,
          price: activePrice, // Prix actif selon le mode de livraison
          priceOnSite: priceOnSite,
          priceDelivery: priceDelivery,
          type: product.product_type,
          workflow_type: product.workflow_type,
          requires_steps: product.requires_steps,
          sizes: product.france_product_sizes || [],
          variants: product.france_product_variants || []
        });
      });
      
      menuText += '\n💡 Tapez le numéro du produit souhaité';
      menuText += '\n↩️ Tapez 0 pour revenir au menu principal';
      
      await this.messageSender.sendMessage(phoneNumber, menuText);
      
      // 4. Mettre à jour la session avec les produits et l'état
      console.log('📝 [ShowProducts] Mise à jour session avec produits');
      
      const updatedData = {
        ...session.sessionData,
        currentCategoryId: categoryId,
        currentCategoryName: category.name,
        products: productList,
        deliveryMode: deliveryMode
      };
      
      await this.sessionManager.updateSession(session.id, {
        botState: 'SELECTING_PRODUCTS',
        sessionData: updatedData
      });
      
      console.log('✅ [ShowProducts] Produits affichés et session mise à jour');
      
    } catch (error) {
      console.error('❌ [ShowProducts] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur lors du chargement des produits. Veuillez réessayer.');
    }
  }
  
  /**
   * Gérer les actions après ajout au panier (99=Commander, 00=Panier, 0=Continuer)
   */
  private async handleCartActions(phoneNumber: string, session: any, message: string): Promise<void> {
    const choice = message.trim();
    
    switch (choice) {
      case '99': // Passer commande
        await this.handleOrderCreation(phoneNumber, session);
        break;
        
      case '00': // Voir panier complet
        // TODO: Implémenter l'affichage détaillé du panier
        await this.messageSender.sendMessage(phoneNumber,
          '🛒 Affichage du panier détaillé...\n(Fonctionnalité en cours de développement)'
        );
        break;
        
      case '0': // Ajouter d'autres produits
        const categoryId = session.sessionData?.selectedCategoryId;
        if (categoryId) {
          await this.showCategoryProducts(phoneNumber, session, categoryId);
        } else {
          await this.showRestaurantMenu(phoneNumber, session);
        }
        break;
        
      default:
        await this.messageSender.sendMessage(phoneNumber,
          '❌ Choix invalide.\n\n*ACTIONS RAPIDES:*\n⚡ 99 = Passer commande\n🛒 00 = Voir panier complet\n🍕 0  = Ajouter d\'autres produits'
        );
        // Garder le même état pour réessayer
        break;
    }
  }

  /**
   * Gérer la création de commande - Workflow complet
   * Suit l'architecture de l'ancien bot avec les principes universels
   */
  private async handleOrderCreation(phoneNumber: string, session: any): Promise<void> {
    try {
      console.log(`📦 [OrderCreation] Début création commande pour: ${phoneNumber}`);
      
      const cart = session.sessionData?.cart || [];
      const restaurantId = session.sessionData?.selectedRestaurantId;
      const deliveryMode = session.sessionData?.deliveryMode;
      
      if (!cart || cart.length === 0) {
        await this.messageSender.sendMessage(phoneNumber, '❌ Votre panier est vide. Ajoutez des produits avant de commander.');
        return;
      }
      
      if (!restaurantId) {
        await this.messageSender.sendMessage(phoneNumber, '❌ Restaurant non sélectionné. Recommencez votre commande.');
        await this.deleteSession(phoneNumber);
        return;
      }

      if (!deliveryMode) {
        await this.messageSender.sendMessage(phoneNumber, '❌ Mode de livraison non sélectionné. Recommencez votre commande.');
        await this.deleteSession(phoneNumber);
        return;
      }

      // Diriger vers le workflow approprié selon le mode déjà sélectionné
      if (deliveryMode === 'livraison') {
        await this.handleDeliveryAddressWorkflow(phoneNumber, session);
      } else {
        // Sur place ou à emporter - directement vers création commande
        await this.processOrderWithMode(phoneNumber, session, deliveryMode);
      }
      
    } catch (error) {
      console.error('❌ [OrderCreation] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de la création de commande. Veuillez réessayer.');
    }
  }

  /**
   * Demander le mode de livraison
   */
  private async askForDeliveryMode(phoneNumber: string, session: any): Promise<void> {
    const message = `🚚 *CHOISISSEZ LE MODE DE SERVICE :*\n\n` +
                   `📍 *1* - Sur place\n` +
                   `📦 *2* - À emporter\n` +
                   `🚚 *3* - Livraison\n\n` +
                   `*Tapez votre choix (1, 2 ou 3)*`;

    await this.messageSender.sendMessage(phoneNumber, message);
    await this.sessionManager.updateSession(session.id, { 
      botState: 'AWAITING_DELIVERY_MODE_CHOICE',
      sessionData: session.sessionData
    });
  }

  /**
   * Gérer le choix du mode de livraison
   */
  private async handleDeliveryModeSelection(phoneNumber: string, session: any, message: string): Promise<void> {
    const choice = parseInt(message.trim());
    let deliveryMode = '';
    
    switch (choice) {
      case 1:
        deliveryMode = 'sur_place';
        await this.processOrderWithMode(phoneNumber, session, deliveryMode);
        break;
      case 2:
        deliveryMode = 'a_emporter';
        await this.processOrderWithMode(phoneNumber, session, deliveryMode);
        break;
      case 3:
        deliveryMode = 'livraison';
        await this.handleDeliveryAddressWorkflow(phoneNumber, session);
        break;
      default:
        await this.messageSender.sendMessage(phoneNumber, '❌ Choix invalide. Tapez 1, 2 ou 3.');
        return;
    }
  }

  /**
   * Gérer le workflow d'adresse pour la livraison
   */
  private async handleDeliveryAddressWorkflow(phoneNumber: string, session: any): Promise<void> {
    console.log(`📍 [AddressWorkflow] Début pour: ${phoneNumber}`);
    
    // Récupérer les adresses existantes
    const cleanPhone = phoneNumber.replace('@c.us', '');
    const existingAddresses = await this.addressService.getCustomerAddresses(cleanPhone);
    
    if (existingAddresses.length > 0) {
      // Afficher les adresses existantes
      const addressMessage = this.addressService.formatAddressSelectionMessage(existingAddresses);
      await this.messageSender.sendMessage(phoneNumber, addressMessage);
      
      await this.sessionManager.updateSession(session.id, {
        botState: 'AWAITING_ADDRESS_CHOICE',
        sessionData: {
          ...session.sessionData,
          existingAddresses
        }
      });
    } else {
      // Première adresse
      await this.messageSender.sendMessage(phoneNumber, 
        '📍 *Première livraison !*\n\n📝 *Saisissez votre adresse complète*\n\n💡 *Exemple : 15 rue de la Paix, 75001 Paris*'
      );
      
      await this.sessionManager.updateSession(session.id, {
        botState: 'AWAITING_NEW_ADDRESS',
        sessionData: session.sessionData
      });
    }
  }

  /**
   * Traiter la commande avec le mode sélectionné
   * SOLID - Délégue la logique métier au service dédié
   */
  private async processOrderWithMode(phoneNumber: string, session: any, deliveryMode: string): Promise<void> {
    try {
      const cart = session.sessionData?.cart || [];
      const restaurantId = session.sessionData?.selectedRestaurantId;
      
      // Déléguer la création au service dédié
      const order = await this.orderService.createOrderWorkflow(
        phoneNumber,
        cart,
        restaurantId,
        deliveryMode
      );
      
      // Récupérer le nom du restaurant pour le message
      const restaurantName = await this.getRestaurantName(restaurantId);
      
      // Envoyer la confirmation
      const confirmationMessage = this.orderService.buildOrderConfirmationMessage(
        order,
        restaurantName,
        deliveryMode
      );
      
      await this.messageSender.sendMessage(phoneNumber, confirmationMessage);
      await this.deleteSession(phoneNumber);
      
    } catch (error) {
      console.error('❌ [ProcessOrder] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de la création de commande. Veuillez réessayer.');
    }
  }

  /**
   * Gérer le choix d'adresse existante
   */
  private async handleAddressChoice(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      const choice = parseInt(message.trim());
      const existingAddresses = session.sessionData?.existingAddresses || [];
      
      if (choice === existingAddresses.length + 1) {
        // Nouvelle adresse
        await this.messageSender.sendMessage(phoneNumber, 
          '📝 *Saisissez votre nouvelle adresse complète*\n\n💡 *Exemple : 15 rue de la Paix, 75001 Paris*'
        );
        
        await this.sessionManager.updateSession(session.id, {
          botState: 'AWAITING_NEW_ADDRESS',
          sessionData: session.sessionData
        });
        return;
      }
      
      if (choice >= 1 && choice <= existingAddresses.length) {
        // Adresse existante sélectionnée
        const selectedAddress = existingAddresses[choice - 1];
        console.log(`📍 [AddressChoice] Adresse sélectionnée: ${selectedAddress.address_label}`);
        
        // Traiter la commande avec cette adresse
        await this.processOrderWithAddress(phoneNumber, session, selectedAddress);
        return;
      }
      
      // Choix invalide
      await this.messageSender.sendMessage(phoneNumber, '❌ Choix invalide. Veuillez sélectionner un numéro valide.');
      
    } catch (error) {
      console.error('❌ [AddressChoice] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors du choix d\'adresse. Veuillez réessayer.');
    }
  }

  /**
   * Gérer la saisie d'une nouvelle adresse
   */
  private async handleNewAddressInput(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      const addressText = message.trim();
      
      if (addressText.length < 10) {
        await this.messageSender.sendMessage(phoneNumber, '❌ Adresse trop courte. Veuillez saisir une adresse complète.');
        return;
      }
      
      console.log(`🔍 [NewAddress] Validation adresse: "${addressText}"`);
      
      // Valider avec Google Places
      const validation = await this.googlePlacesService.validateAddress(addressText);
      
      if (!validation.isValid || validation.suggestions.length === 0) {
        await this.messageSender.sendMessage(phoneNumber, 
          '❌ Adresse non trouvée. Vérifiez l\'orthographe et réessayez.\n\n💡 Incluez le code postal et la ville.'
        );
        return;
      }
      
      // Proposer les suggestions
      if (validation.suggestions.length === 1) {
        // Une seule suggestion, proposer directement
        const suggestion = validation.suggestions[0];
        const message = `📍 *Adresse trouvée :*\n\n` +
                       `${this.googlePlacesService.formatAddressForWhatsApp(suggestion)}\n\n` +
                       `✅ *1* - Confirmer cette adresse\n` +
                       `📝 *2* - Saisir une autre adresse`;
        
        await this.messageSender.sendMessage(phoneNumber, message);
        
        await this.sessionManager.updateSession(session.id, {
          botState: 'AWAITING_ADDRESS_CONFIRMATION',
          sessionData: {
            ...session.sessionData,
            pendingAddress: suggestion
          }
        });
      } else {
        // Plusieurs suggestions
        const message = this.googlePlacesService.formatAddressSuggestionsMessage(validation.suggestions);
        await this.messageSender.sendMessage(phoneNumber, message);
        
        await this.sessionManager.updateSession(session.id, {
          botState: 'AWAITING_ADDRESS_CONFIRMATION',
          sessionData: {
            ...session.sessionData,
            addressSuggestions: validation.suggestions
          }
        });
      }
      
    } catch (error) {
      console.error('❌ [NewAddress] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de la validation de l\'adresse. Veuillez réessayer.');
    }
  }

  /**
   * Gérer la confirmation d'adresse
   */
  private async handleAddressConfirmation(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      const choice = parseInt(message.trim());
      
      // Si une seule adresse en attente
      if (session.sessionData?.pendingAddress) {
        if (choice === 1) {
          // Confirmer l'adresse
          const address = session.sessionData.pendingAddress;
          await this.saveNewAddressAndProcess(phoneNumber, session, address);
        } else if (choice === 2) {
          // Saisir une autre adresse
          await this.messageSender.sendMessage(phoneNumber, 
            '📝 *Saisissez votre adresse complète*'
          );
          
          await this.sessionManager.updateSession(session.id, {
            botState: 'AWAITING_NEW_ADDRESS',
            sessionData: {
              ...session.sessionData,
              pendingAddress: undefined
            }
          });
        } else {
          await this.messageSender.sendMessage(phoneNumber, '❌ Tapez 1 pour confirmer ou 2 pour saisir une autre adresse.');
        }
        return;
      }
      
      // Plusieurs suggestions
      const suggestions = session.sessionData?.addressSuggestions || [];
      if (choice >= 1 && choice <= suggestions.length) {
        const selectedAddress = suggestions[choice - 1];
        await this.saveNewAddressAndProcess(phoneNumber, session, selectedAddress);
      } else {
        await this.messageSender.sendMessage(phoneNumber, `❌ Choix invalide. Tapez un numéro entre 1 et ${suggestions.length}.`);
      }
      
    } catch (error) {
      console.error('❌ [AddressConfirmation] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de la confirmation. Veuillez réessayer.');
    }
  }

  /**
   * Sauvegarder une nouvelle adresse et traiter la commande
   */
  private async saveNewAddressAndProcess(phoneNumber: string, session: any, address: any): Promise<void> {
    try {
      const cleanPhone = phoneNumber.replace('@c.us', '');
      
      // Générer un label automatique
      const existingAddresses = await this.addressService.getCustomerAddresses(cleanPhone);
      const label = this.addressService.generateAddressLabel(existingAddresses);
      
      // Sauvegarder l'adresse
      const savedAddress = await this.addressService.saveAddress({
        phone_number: cleanPhone,
        address_label: label,
        full_address: address.formatted_address,
        google_place_id: address.place_id,
        latitude: address.geometry.location.lat,
        longitude: address.geometry.location.lng,
        is_default: existingAddresses.length === 0
      });
      
      if (savedAddress) {
        console.log(`✅ [SaveAddress] Adresse sauvegardée: ${label}`);
        await this.processOrderWithAddress(phoneNumber, session, savedAddress);
      } else {
        throw new Error('Échec sauvegarde adresse');
      }
      
    } catch (error) {
      console.error('❌ [SaveAddress] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  }

  /**
   * Traiter la commande avec une adresse spécifique
   * SOLID - Délégue la logique métier au service dédié
   */
  private async processOrderWithAddress(phoneNumber: string, session: any, address: any): Promise<void> {
    try {
      const cart = session.sessionData?.cart || [];
      const restaurantId = session.sessionData?.selectedRestaurantId;
      
      // Déléguer la création au service dédié
      const order = await this.orderService.createOrderWorkflow(
        phoneNumber,
        cart,
        restaurantId,
        'livraison',
        address
      );
      
      // Récupérer le nom du restaurant pour le message
      const restaurantName = await this.getRestaurantName(restaurantId);
      
      // Envoyer la confirmation
      const confirmationMessage = this.orderService.buildOrderConfirmationMessage(
        order,
        restaurantName,
        'livraison',
        address
      );
      
      await this.messageSender.sendMessage(phoneNumber, confirmationMessage);
      await this.deleteSession(phoneNumber);
      
    } catch (error) {
      console.error('❌ [OrderWithAddress] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de la création de commande. Veuillez réessayer.');
    }
  }

  /**
   * Utilitaire : Récupérer le nom d'un restaurant
   * SOLID - Single Responsibility : Méthode utilitaire simple
   */
  private async getRestaurantName(restaurantId: number): Promise<string> {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      
      const { data: restaurant } = await supabase
        .from('france_restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
      
      return restaurant?.name || 'Restaurant';
    } catch (error) {
      console.error('❌ [getRestaurantName] Erreur:', error);
      return 'Restaurant';
    }
  }

  /**
   * Gérer les actions après configuration produit (1=Ajouter, 2=Recommencer, 0=Retour)
   */
  private async handleWorkflowActions(phoneNumber: string, session: any, message: string): Promise<void> {
    const choice = message.trim();
    
    switch (choice) {
      case '1': // Ajouter au panier
        await this.handleQuantityInput(phoneNumber, session, '1');
        break;
        
      case '2': // Recommencer
        const selectedProduct = session.sessionData?.selectedProduct;
        if (selectedProduct) {
          // Relancer le workflow pour le même produit
          await this.compositeWorkflowExecutor.startCompositeWorkflow(
            phoneNumber, 
            session, 
            selectedProduct.id, 
            this.supabaseUrl, 
            this.supabaseKey
          );
        }
        break;
        
      case '0': // Retour menu
        const categoryId = session.sessionData?.selectedCategoryId;
        if (categoryId) {
          await this.showCategoryProducts(phoneNumber, session, categoryId);
        } else {
          await this.showRestaurantMenu(phoneNumber, session);
        }
        break;
        
      default:
        await this.messageSender.sendMessage(phoneNumber,
          '❌ Choix invalide.\n\n*Que souhaitez-vous faire ?*\n1 Ajouter au panier\n2 Recommencer\n0 Retour menu'
        );
        break;
    }
  }

  /**
   * Gérer la saisie de quantité - ARCHITECTURE UNIVERSELLE
   * SOLID : Single Responsibility - Gestion quantité uniquement
   */
  private async handleQuantityInput(phoneNumber: string, session: any, message: string): Promise<void> {
    console.log(`📦 [QuantityInput] Message reçu: "${message}"`);
    
    const quantity = parseInt(message.trim());
    const selectedProduct = session.sessionData?.selectedProduct;
    
    if (!selectedProduct) {
      console.error('❌ [QuantityInput] Pas de produit sélectionné');
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur de session. Veuillez recommencer votre sélection.');
      return;
    }
    
    // Valider la quantité
    if (isNaN(quantity) || quantity < 1 || quantity > 99) {
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Quantité invalide. Tapez un nombre entre 1 et 99.');
      return;
    }
    
    console.log(`✅ [QuantityInput] Quantité valide: ${quantity}`);
    
    // Calculer le prix total
    const totalPrice = selectedProduct.price * quantity;
    
    // Construire la description du produit pour le panier
    let productDescription = selectedProduct.name;
    
    // Si produit composite, ajouter la configuration
    if (selectedProduct.configuration) {
      const configDetails: string[] = [];
      for (const [group, items] of Object.entries(selectedProduct.configuration)) {
        const itemNames = (items as any[]).map(i => i.option_name).join(', ');
        configDetails.push(itemNames);
      }
      productDescription += ` (${configDetails.join(' - ')})`;
    }
    
    // Ajouter au panier
    const rawCart = session.sessionData?.cart || [];
    const cart = Array.isArray(rawCart) ? rawCart : [];
    cart.push({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productDescription: productDescription,
      quantity: quantity,
      unitPrice: selectedProduct.price,
      totalPrice: totalPrice,
      configuration: selectedProduct.configuration || null
    });
    
    // Calculer le total du panier
    const cartTotal = cart.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    
    // Utiliser le formatter universel pour le message
    const { UniversalCartFormatter } = await import('../services/UniversalCartFormatter.ts');
    const formatter = new UniversalCartFormatter();
    
    // Formater le message avec le nouveau standard universel
    const confirmMessage = formatter.formatAdditionMessage(
      selectedProduct,
      cart,
      quantity
    );
    
    await this.messageSender.sendMessage(phoneNumber, confirmMessage);
    
    // Mettre à jour la session
    const updatedData = {
      ...session.sessionData,
      cart: cart,
      cartTotal: cartTotal,
      selectedProduct: null,
      awaitingQuantity: false,
      awaitingCartActions: true
    };
    
    await this.sessionManager.updateSession(session.id, {
      botState: 'AWAITING_CART_ACTIONS',
      sessionData: updatedData
    });
    
    console.log(`✅ [QuantityInput] Produit ajouté au panier, état -> CART_OPTIONS`);
  }
  
  /**
   * Supprimer une session (équivalent de SimpleSession.deleteAllForPhone)
   */
  private async deleteSession(phoneNumber: string): Promise<void> {
    try {
      // Import temporaire de supabase
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await supabase
        .from('france_user_sessions')
        .delete()
        .eq('phone_number', phoneNumber);
        
      console.log(`🗑️ [DeleteSession] Sessions supprimées pour: ${phoneNumber}`);
    } catch (error) {
      console.error('❌ [DeleteSession] Erreur suppression session:', error);
    }
  }
}

/**
 * Factory pour créer une instance du bot universel
 * SOLID - Dependency Injection : Injection des dépendances
 */
export class UniversalBotFactory {
  
  static create(
    sessionManager: ISessionManager,
    configManager: IRestaurantConfigManager,
    workflowExecutor: IWorkflowExecutor,
    messageSender: IMessageSender
  ): UniversalBot {
    
    return new UniversalBot(
      sessionManager,
      configManager,
      workflowExecutor,
      messageSender
    );
  }
}