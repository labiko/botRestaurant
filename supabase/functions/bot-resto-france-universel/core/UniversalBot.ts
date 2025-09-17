// 🤖 BOT UNIVERSEL - ORCHESTRATEUR PRINCIPAL
// Architecture SOLID : Single Responsibility + Dependency Injection

// ⏱️ Configuration durée de session
const SESSION_DURATION_MINUTES = 120; // 2 heures - Durée raisonnable pour commandes livraison

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
import { PerformanceLogger } from '../services/PerformanceLogger.ts';
import { DeliveryRadiusService } from '../services/DeliveryRadiusService.ts';
import { AddressManagementService } from '../services/AddressManagementService.ts';
import { GooglePlacesService } from '../services/GooglePlacesService.ts';
import { WhatsAppContactService } from '../services/WhatsAppContactService.ts';
import { CancellationService } from '../services/CancellationService.ts';
import { RestaurantScheduleService } from '../services/RestaurantScheduleService.ts';
import { TimezoneService, RestaurantContext } from '../services/TimezoneService.ts';
import { DeliveryModesService, ServiceMode } from '../services/DeliveryModesService.ts';
import { PizzaDisplayService } from '../services/PizzaDisplayService.ts';
import { RestaurantDiscoveryService } from '../services/RestaurantDiscoveryService.ts';
import { LocationService, ICoordinates } from '../../_shared/application/services/LocationService.ts';

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
  private cancellationService: CancellationService;
  private timezoneService: TimezoneService;
  private deliveryModesService: DeliveryModesService;
  private deliveryRadiusService: DeliveryRadiusService;
  private pizzaDisplayService: PizzaDisplayService;
  private restaurantDiscoveryService: RestaurantDiscoveryService;
  private currentRestaurantContext: RestaurantContext | null = null;
  private supabaseUrl: string;
  private supabaseKey: string;

  // 🔧 OPTIMISATION: Client Supabase unique réutilisé
  private supabaseClient: any = null;
  
  constructor(
    private sessionManager: ISessionManager,
    private configManager: IRestaurantConfigManager,
    private workflowExecutor: IWorkflowExecutor,
    private messageSender: IMessageSender,
    private scheduleService: RestaurantScheduleService
  ) {
    this.supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    this.supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Initialiser le service de timezone
    this.timezoneService = new TimezoneService();
    
    // Configurer SessionManager pour utiliser la même instance TimezoneService
    if (this.sessionManager && typeof this.sessionManager.setTimezoneService === 'function') {
      this.sessionManager.setTimezoneService(this.timezoneService);
    }
    
    // Initialiser le service de modes de livraison
    this.deliveryModesService = new DeliveryModesService(this.supabaseUrl, this.supabaseKey);
    
    // Initialiser le service de validation du rayon de livraison
    this.deliveryRadiusService = new DeliveryRadiusService(this.supabaseUrl, this.supabaseKey);
    
    // Initialiser le service d'affichage unifié des pizzas
    this.pizzaDisplayService = new PizzaDisplayService(
      messageSender,
      this.supabaseUrl,
      this.supabaseKey
    );
    
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
    
    // Initialiser le service d'annulation
    this.cancellationService = new CancellationService(
      this.supabaseUrl, 
      this.supabaseKey, 
      this.messageSender as any // WhatsAppNotificationFranceService compatible
    );
    
    // Initialiser le service de découverte des restaurants
    this.restaurantDiscoveryService = new RestaurantDiscoveryService(
      this.supabaseUrl,
      this.supabaseKey
    );
  }

  /**
   * 🔧 OPTIMISATION: Méthode pour obtenir le client Supabase unique
   * Évite la création de multiples clients et imports répétés
   */
  private async getSupabaseClient() {
    try {
      if (!this.supabaseClient) {
        console.log('🔧 [UniversalBot] Création client Supabase unique...');
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        this.supabaseClient = createClient(this.supabaseUrl, this.supabaseKey);
        console.log('✅ [UniversalBot] Client Supabase unique créé avec succès');
      }
      return this.supabaseClient;
    } catch (error) {
      console.error('❌ [UniversalBot] Erreur création client principal, fallback temporaire:', error);
      // Fallback: créer un client temporaire en cas d'erreur
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      return createClient(this.supabaseUrl, this.supabaseKey);
    }
  }

  /**
   * Récupérer le nom de catégorie depuis la base de données
   */
  private async getCategoryNameFromProduct(productId: number): Promise<string | null> {
    try {
      // 🔧 OPTIMISATION: Utilisation du client unique
      const supabase = await this.getSupabaseClient();
      
      const { data } = await supabase
        .from('france_products')
        .select('france_menu_categories(name)')
        .eq('id', productId)
        .single();
      
      return data?.france_menu_categories?.name || null;
    } catch (error) {
      console.error('Erreur récupération nom catégorie:', error);
      return null;
    }
  }

  /**
   * Point d'entrée principal - traite tous les messages WhatsApp
   * COPIE EXACTE DE LA LOGIQUE ORIGINALE pour maintenir la compatibilité
   */
  async handleMessage(phoneNumber: string, message: string): Promise<void> {
    try {
      console.log(`🤖 [MESSAGE_DEBUG] === MESSAGE REÇU ===`);
      console.log(`🤖 [MESSAGE_DEBUG] De: ${phoneNumber}`);
      console.log(`🤖 [MESSAGE_DEBUG] Message: "${message}"`);
      console.log(`🤖 [MESSAGE_DEBUG] Type: ${typeof message}`);
      console.log(`🤖 [MESSAGE_DEBUG] Longueur: ${message.length}`);
      
      // PRIORITÉ 1: Détection numéro téléphone restaurant (accès QR code)
      const isPhone = this.isPhoneNumberFormat(message);
      console.log(`🤖 [MESSAGE_DEBUG] Est un téléphone: ${isPhone}`);
      
      if (isPhone) {
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
      
      // PRIORITÉ 2: Détection commande annulation
      if (message.toLowerCase().trim() === 'annuler') {
        const result = await this.cancellationService.handleCancellationRequest(phoneNumber);
        await this.messageSender.sendMessage(phoneNumber, result.message);
        return;
      }
      
      // PRIORITÉ 3: Messages classiques (salut/bonjour) - Menu générique  
      if (message.toLowerCase().includes('salut') || message.toLowerCase().includes('bonjour')) {
        await this.handleGenericGreeting(phoneNumber);
        return;
      }
      
      // PRIORITÉ 4: Gestion complète des messages selon l'état de session
      const session = await this.sessionManager.getSession(phoneNumber);
      
      console.log('🔄 [SESSION_GET] Session récupérée:', {
        sessionExists: !!session,
        sessionId: session?.id,
        botState: session?.botState,
        botStateType: typeof session?.botState,
        restaurantId: session?.restaurantId,
        currentStep: (session as any)?.currentStep,
        message: message,
        phoneNumber: phoneNumber
      });
      
      if (session && session.restaurantId) {
        // L'utilisateur a une session active avec restaurant sélectionné
        // Charger le contexte restaurant pour cette session
        await this.loadAndSetRestaurantContext(session.restaurantId);
        
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
      
      // PRIORITÉ 5: Réponse par défaut
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
      
      // 🔧 [CATBUG_FIX] Gestion des actions spéciales
      if (result.outputData?.action === 'RETURN_MENU') {
        console.log('🔄 [CATBUG_FIX] Action RETURN_MENU détectée - transition vers VIEWING_MENU');
        
        // Transition d'état directe vers VIEWING_MENU
        console.log('📝 [UPDATE_SESSION_01] UniversalBot ligne 283');
        await this.sessionManager.updateSession(session.id, {
          bot_state: 'VIEWING_MENU'
        });
        
        // Appeler la logique de retour aux catégories via CompositeWorkflowExecutor
        if (this.compositeWorkflowExecutor) {
          await this.compositeWorkflowExecutor.returnToCategories(session.phoneNumber, { ...session, bot_state: 'VIEWING_MENU' });
        }
        
        console.log('✅ [CATBUG_FIX] Transition RETURN_MENU complétée');
        return; // Sortir immédiatement, pas de traitement supplémentaire
      }
      
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
    console.log('📝 [UPDATE_SESSION_02] UniversalBot ligne 373');
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
      console.log('📝 [UPDATE_SESSION_03] UniversalBot ligne 477');
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
      console.log('🔍 [PHONE_DEBUG] === RECHERCHE RESTAURANT ===');
      console.log('🔍 [PHONE_DEBUG] Numéro reçu:', phoneNumber);
      console.log('🔍 [PHONE_DEBUG] Type:', typeof phoneNumber);
      console.log('🔍 [PHONE_DEBUG] Longueur:', phoneNumber.length);
      
      // Essayer différents formats de normalisation
      const formats = [
        phoneNumber, // Format original (ex: 0177123456)
        `+33${phoneNumber.substring(1)}`, // Format international (ex: +330177123456)
        `33${phoneNumber.substring(1)}` // Format sans + (ex: 330177123456)
      ];
      
      console.log('🔍 [PHONE_DEBUG] Formats à tester:', formats);
      
      const supabase = await this.getSupabaseClient();

      for (const format of formats) {
        console.log('🔍 [PHONE_DEBUG] Test format:', format);
        const { data: restaurant, error } = await supabase
          .from('france_restaurants')
          .select('*')
          .or(`phone.eq.${format},whatsapp_number.eq.${format}`)
          .single();
        
        console.log('🔍 [PHONE_DEBUG] Résultat requête pour', format, ':', { restaurant: restaurant?.name || 'null', error: error?.message || 'none' });
        
        if (restaurant) {
          console.log('✅ [PHONE_DEBUG] Restaurant trouvé:', restaurant.name);
          console.log('✅ [PHONE_DEBUG] Restaurant data:', JSON.stringify(restaurant, null, 2));
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
   * Définir le contexte restaurant pour tous les services
   */
  private setRestaurantContext(restaurant: any): void {
    if (restaurant) {
      this.currentRestaurantContext = this.timezoneService.createContext(restaurant);
      this.timezoneService.setCurrentContext(restaurant);
      console.log(`🌍 [Context] Restaurant context défini: ${restaurant.name} - Timezone: ${this.currentRestaurantContext.timezone}`);
    }
  }
  
  /**
   * Charger et définir le contexte restaurant depuis un ID
   */
  private async loadAndSetRestaurantContext(restaurantId: number): Promise<void> {
    try {
      // 🔧 OPTIMISATION: Utilisation du client unique
      const supabase = await this.getSupabaseClient();
      
      const { data: restaurant } = await supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
      
      if (restaurant) {
        this.setRestaurantContext(restaurant);
      }
    } catch (error) {
      console.error(`❌ [Context] Erreur chargement restaurant ${restaurantId}:`, error);
    }
  }
  
  /**
   * Obtenir le contexte restaurant actuel
   */
  private getRestaurantContext(): RestaurantContext | null {
    return this.currentRestaurantContext;
  }
  
  /**
   * Gérer l'accès direct à un restaurant
   */
  private async handleDirectRestaurantAccess(phoneNumber: string, restaurant: any): Promise<void> {
    try {
      console.log(`🎯 [DirectAccess] === DÉBUT ACCÈS DIRECT RESTAURANT ===`);
      console.log(`🎯 [DirectAccess] Restaurant: ${restaurant.name}`);
      
      // AFFICHER L'HEURE ACTUELLE POUR DIAGNOSTIC
      const now = new Date();
      console.log(`⏰ [HEURE_DEBUG] === DIAGNOSTIC FUSEAU HORAIRE ===`);
      console.log(`⏰ [HEURE_DEBUG] Date système brute: ${now.toString()}`);
      console.log(`⏰ [HEURE_DEBUG] Date ISO: ${now.toISOString()}`);
      console.log(`⏰ [HEURE_DEBUG] Heure locale système: ${now.toLocaleString('fr-FR')}`);
      console.log(`⏰ [HEURE_DEBUG] Heure Paris: ${now.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`);
      console.log(`⏰ [HEURE_DEBUG] Timezone offset: ${now.getTimezoneOffset()} minutes`);
      console.log(`⏰ [HEURE_DEBUG] Jour de la semaine: ${now.getDay()} (0=dimanche)`);
      
      console.log(`🎯 [DirectAccess] Données restaurant:`, JSON.stringify(restaurant, null, 2));
      
      // 🚨 VÉRIFICATION DES HORAIRES avec le service dédié
      console.log(`🚨 [DirectAccess] APPEL du service des horaires...`);
      console.log(`🚨 [DirectAccess] Service disponible: ${!!this.scheduleService}`);
      
      const scheduleResult = this.scheduleService.checkRestaurantSchedule(restaurant);
      
      console.log(`🚨 [DirectAccess] RÉSULTAT service horaires:`, JSON.stringify(scheduleResult, null, 2));
      console.log(`🚨 [DirectAccess] Restaurant ouvert: ${scheduleResult.isOpen}`);
      console.log(`🚨 [DirectAccess] Statut: ${scheduleResult.status}`);
      
      if (!scheduleResult.isOpen) {
        console.log(`🚫 [DirectAccess] Restaurant fermé - Envoi message de fermeture`);
        // Restaurant fermé - Utiliser le service pour générer le message
        const closedMessage = this.scheduleService.getScheduleMessage(scheduleResult, restaurant.name);
        console.log(`🚫 [DirectAccess] Message de fermeture: ${closedMessage}`);
        
        await this.messageSender.sendMessage(phoneNumber, closedMessage);
        return;
      }
      
      console.log(`✅ [DirectAccess] Restaurant ouvert - Procédure d'accueil`)
      
      // Premier message : Bienvenue personnalisé
      const welcomeMessage = `🇫🇷 Bonjour ! Bienvenue chez ${restaurant.name} !\n🍕 ${restaurant.description || 'Découvrez notre délicieux menu'}\n📍 ${restaurant.address || 'Restaurant disponible'}`;
      await this.messageSender.sendMessage(phoneNumber, welcomeMessage);
      
      // Charger les modes de livraison disponibles depuis la base de données
      console.log('🚚 [DirectAccess] Chargement des modes de livraison...');
      const availableModes = await this.deliveryModesService.getAvailableModes(restaurant.id);
      console.log(`🚚 [DirectAccess] Modes disponibles: ${availableModes.map(m => m.mode).join(', ')}`);
      
      // Deuxième message : Choix du mode de livraison (dynamique)
      const deliveryModeMessage = this.deliveryModesService.formatModesMessage(availableModes);
      await this.messageSender.sendMessage(phoneNumber, deliveryModeMessage);
      
      // ⚡ DÉFINIR LE CONTEXTE RESTAURANT AVANT TOUTE OPÉRATION DE SESSION
      console.log('⚡ [CONTEXT_SETUP] Définition contexte restaurant...');
      this.setRestaurantContext(restaurant);
      console.log('✅ [CONTEXT_SETUP] Contexte restaurant défini');
      
      // 🎯 [STEP1] Suppression des sessions existantes
      console.log('🔍 [DEBUG_RESTAURANT_ACCESS] === STEP1 DÉBUT ===');
      console.log('🎯 [STEP1] Suppression sessions utilisateur existantes...');
      try {
        await this.sessionManager.deleteSessionsByPhone(phoneNumber);
        console.log('✅ [STEP1] Sessions supprimées avec succès');
        console.log('🔍 [DEBUG_RESTAURANT_ACCESS] === STEP1 SUCCÈS ===');
      } catch (deleteError) {
        console.error('🚨 [DEBUG_RESTAURANT_ACCESS] === STEP1 ÉCHEC ===');
        console.error('❌ [STEP1] Erreur suppression sessions:', deleteError);
        console.error('🚨 [DEBUG_RESTAURANT_ACCESS] deleteError.message:', deleteError?.message);
        console.error('🚨 [DEBUG_RESTAURANT_ACCESS] deleteError.stack:', deleteError?.stack);
        throw deleteError;
      }
      
      // 🎯 [STEP2] Création nouvelle session restaurant
      console.log('🔍 [DEBUG_RESTAURANT_ACCESS] === STEP2 DÉBUT ===');
      console.log('🎯 [STEP2] Création nouvelle session restaurant...');
      console.log('🔍 [DEBUG_RESTAURANT_ACCESS] Restaurant data:', JSON.stringify({
        id: restaurant.id,
        name: restaurant.name,
        timezone: restaurant.timezone
      }));
      let session;
      try {
        session = await this.sessionManager.createSessionForRestaurant(
          phoneNumber,
          restaurant,
          'CHOOSING_DELIVERY_MODE',
          {
            selectedRestaurantId: restaurant.id,
            selectedRestaurantName: restaurant.name,
            availableModes: availableModes.map(m => m.mode)
          }
        );
        console.log('✅ [STEP2] Session restaurant créée:', session.id);
        console.log('🔍 [DEBUG_RESTAURANT_ACCESS] === STEP2 SUCCÈS ===');
      } catch (createError) {
        console.error('🚨 [DEBUG_RESTAURANT_ACCESS] === STEP2 ÉCHEC ===');
        console.error('❌ [STEP2] Erreur création session:', createError);
        console.error('🚨 [DEBUG_RESTAURANT_ACCESS] createError.message:', createError?.message);
        console.error('🚨 [DEBUG_RESTAURANT_ACCESS] createError.stack:', createError?.stack);
        console.error('🚨 [DEBUG_RESTAURANT_ACCESS] createError.name:', createError?.name);
        throw createError;
      }
      
      console.log('✅ [STEP3] Session créée pour choix mode livraison avec modes disponibles');
      
    } catch (error) {
      console.error('🚨 [DEBUG_RESTAURANT_ACCESS] === ERREUR GLOBALE ===');
      console.error('❌ [DirectAccess] Erreur détaillée:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      console.error('🚨 [DEBUG_RESTAURANT_ACCESS] error.name:', error?.name);
      console.error('🚨 [DEBUG_RESTAURANT_ACCESS] error.cause:', error?.cause);
      console.error('🚨 [DEBUG_RESTAURANT_ACCESS] typeof error:', typeof error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de l\'accès au restaurant.');
    }
  }
  
  /**
   * Créer une session pour un restaurant (équivalent de SimpleSession.create)
   */
  private async createSessionForRestaurant(phoneNumber: string, restaurant: any): Promise<any> {
    console.log('🔥 [DEBUT_CREATE_SESSION] Début createSessionForRestaurant pour:', phoneNumber, 'restaurant:', restaurant.name);
    console.log('🚀 [VERSION_2024_12_20] Nouvelle version avec debug détaillé');
    console.log('🔥 [STEP0] Juste avant le try');
    try {
      console.log('🔥 [STEP1] Dans le try, avant import supabase...');
      console.log('🔥 [STEP2] Utilisation client unique...');
      const supabase = await this.getSupabaseClient();
      console.log('🔥 [STEP3] Client récupéré avec succès');
      
      // Supprimer les sessions existantes
      console.log('🔧 [DeleteSession] Tentative suppression pour phoneNumber:', phoneNumber);
      
      // D'abord vérifier si des sessions existent
      const { data: existingSessions, error: selectError } = await supabase
        .from('france_user_sessions')
        .select('*')
        .eq('phone_number', phoneNumber);
        
      console.log('🔧 [DeleteSession] Sessions existantes trouvées:', existingSessions?.length || 0);
      if (existingSessions && existingSessions.length > 0) {
        console.log('🔧 [DeleteSession] Détail sessions:', existingSessions);
      }
      
      const deleteResult = await supabase
        .from('france_user_sessions')
        .delete()
        .eq('phone_number', phoneNumber);
      
      console.log('🔧 [DeleteSession] Résultat suppression:', deleteResult);
      
      if (deleteResult.error) {
        console.error('❌ [CreateSession] Erreur suppression:', deleteResult.error);
      } else {
        console.log('✅ [DeleteSession] Suppression réussie');
        
        // Vérifier si suppression effective
        const { data: remainingSessions } = await supabase
          .from('france_user_sessions')
          .select('*')
          .eq('phone_number', phoneNumber);
        console.log('🔧 [DeleteSession] Sessions restantes après suppression:', remainingSessions?.length || 0);
      }
      
      // Créer nouvelle session avec l'état CHOOSING_DELIVERY_MODE
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_DURATION_MINUTES); // 2 heures d'expiration
      
      const { data: newSession, error } = await supabase
        .from('france_user_sessions')
        .insert({
          phone_number: phoneNumber,
          chat_id: phoneNumber,
          restaurant_id: restaurant.id,
          current_step: 'CHOOSING_DELIVERY_MODE',
          session_data: JSON.stringify({
            selectedRestaurantId: restaurant.id,
            selectedRestaurantName: restaurant.name
          }),
          cart_items: JSON.stringify([]),
          total_amount: 0,
          expires_at: expiresAt,
          workflow_data: JSON.stringify({}),
          workflow_step_id: null
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ [CreateSession] Erreur création session:', error);
        throw error;
      }
      
      return newSession;
      
    } catch (error) {
      console.error('❌ [CreateSession] Erreur création session:', error);
      throw error;
    }
  }

  /**
   * Gérer les salutations génériques
   */
  private async handleGenericGreeting(phoneNumber: string): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();
      
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
    console.log(`🔍 DEBUG_MENU: === DÉBUT handleSessionMessage ===`);
    console.log(`🔍 DEBUG_MENU: Message reçu: "${message}"`);
    console.log(`🔍 DEBUG_MENU: Session ID: ${session.id}`);
    console.log(`🔍 DEBUG_MENU: Session currentState: ${session.currentState}`);
    console.log(`🔍 DEBUG_MENU: Session sessionData:`, session.sessionData ? JSON.stringify(session.sessionData, null, 2) : 'null');
    
    const normalizedMessage = message.toLowerCase().trim();
    
    // Commandes globales
    if (normalizedMessage === 'annuler') {
      await this.deleteSession(phoneNumber);
      await this.messageSender.sendMessage(phoneNumber, '❌ Session annulée. Tapez le numéro du restaurant pour recommencer.');
      return;
    }

    // Nouveau handler global "resto"
    if (normalizedMessage === 'resto') {
      await this.handleRestoCommand(phoneNumber);
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

    // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer TOUS les passages par le routeur principal
    console.log('🔍 CATEGORY_WORKFLOW_DEBUG - UniversalBot.handleMessage ROUTER:', {
      phoneNumber,
      message,
      botState: session.botState,
      currentCategoryName: session.sessionData?.currentCategoryName,
      selectedProduct: session.sessionData?.selectedProduct?.name || null,
      hasCart: !!session.sessionData?.cart
    });

    switch (session.botState) {
      case 'CHOOSING_DELIVERY_MODE':
        await this.handleDeliveryModeChoice(phoneNumber, session, message);
        break;
        
      case 'VIEWING_MENU':
        console.log(`🔄 [STATE_DEBUG] Routage vers handleMenuNavigation - État: VIEWING_MENU`);
        await this.handleMenuNavigation(phoneNumber, session, message);
        break;
        
      case 'VIEWING_CATEGORY':
        console.log(`🔄 [STATE_DEBUG] Routage vers handleCategoryNavigation - État: VIEWING_CATEGORY`);
        await this.handleCategoryNavigation(phoneNumber, session, message);
        break;
        
      case 'SELECTING_PRODUCTS':
        console.log(`🔄 [STATE_DEBUG] Routage vers ProductSelection - État: SELECTING_PRODUCTS`);
        await this.handleProductSelection(phoneNumber, session, message);
        break;
        
      case 'COMPOSITE_WORKFLOW_STEP':
        await this.compositeWorkflowExecutor.handleWorkflowStepResponse(phoneNumber, session, message);
        break;
        
      case 'MENU_PIZZA_WORKFLOW':
        console.log(`🔍 DEBUG_MENU: Traitement MENU_PIZZA_WORKFLOW avec message: "${message}"`);
        await this.compositeWorkflowExecutor.handleMenuPizzaResponse(phoneNumber, session, message);
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
        
      case 'AWAITING_CANCELLATION_CONFIRMATION':
        await this.handleCancellationConfirmationFlow(phoneNumber, session, message);
        break;
        
      case 'AWAITING_QUANTITY':
        // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer le passage par AWAITING_QUANTITY  
        console.log('🔍 CATEGORY_WORKFLOW_DEBUG - UniversalBot.handleMessage AWAITING_QUANTITY:', {
          phoneNumber,
          message,
          selectedProduct: session.sessionData?.selectedProduct?.name || null,
          currentCategoryName: session.sessionData?.currentCategoryName,
          productType: session.sessionData?.selectedProduct?.product_type
        });
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
        
      case 'AWAITING_OUT_OF_ZONE_CHOICE':
        await this.handleOutOfZoneChoice(phoneNumber, session, message);
        break;
        
      // =================================
      // NOUVEAU: CAS HANDLER GLOBAL "RESTO"
      // =================================
      
      case 'CHOOSING_RESTAURANT_MODE':
        console.log(`🔄 [STATE_DEBUG] Routage vers handleRestaurantModeSelection - État: CHOOSING_RESTAURANT_MODE`);
        await this.handleRestaurantModeSelection(phoneNumber, session, message);
        break;

      case 'AWAITING_USER_LOCATION':
        console.log(`🔄 [STATE_DEBUG] Routage vers handleLocationMessage - État: AWAITING_USER_LOCATION`);
        await this.handleLocationMessage(phoneNumber, session, message);
        break;
        
      case 'SELECTING_FROM_LIST':
        console.log(`🔄 [STATE_DEBUG] Routage vers handleRestaurantSelection - État: SELECTING_FROM_LIST`);
        await this.handleRestaurantSelection(phoneNumber, session, message);
        break;
        
      default:
        console.log(`🔍 DEBUG_MENU: ERREUR - État session non géré: "${session.botState}"`);
        console.log(`🔍 DEBUG_MENU: ERREUR - currentState: "${session.currentState}"`);
        console.log(`🔍 DEBUG_MENU: ERREUR - Message: "${message}"`);
        console.log(`🔍 DEBUG_MENU: ERREUR - sessionData:`, session.sessionData);
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
    
    // Récupérer les modes disponibles depuis la session
    const availableModes = session.sessionData?.availableModes || ['sur_place', 'a_emporter', 'livraison'];
    console.log(`🚚 [DeliveryMode] Modes disponibles: ${availableModes.join(', ')}`);
    
    // Valider que le choix est dans la plage valide
    if (modeChoice < 1 || modeChoice > availableModes.length || isNaN(modeChoice)) {
      // Recharger les modes pour afficher le bon message d'erreur
      const modesForError = await this.deliveryModesService.getAvailableModes(session.restaurantId);
      const errorMessage = `❌ Choix invalide. ${this.deliveryModesService.formatModesMessage(modesForError)}`;
      await this.messageSender.sendMessage(phoneNumber, errorMessage);
      return;
    }
    
    // Mapper le choix au mode correspondant (index - 1)
    const deliveryMode = availableModes[modeChoice - 1];
    console.log(`✅ [DeliveryMode] Mode sélectionné: ${deliveryMode}`);
    
    // Récupérer les infos restaurant
    const supabase = await this.getSupabaseClient();
    
    const restaurant = await supabase
      .from('france_restaurants')
      .select('*')
      .eq('id', session.restaurantId)
      .single();
    
    if (restaurant.data) {
      await this.showMenuAfterDeliveryModeChoice(phoneNumber, restaurant.data, deliveryMode, session);
      
      // ✅ MAINTENANT on peut mettre à jour bot_state vers VIEWING_MENU
      await this.sessionManager.updateSession(session.id, {
        botState: 'VIEWING_MENU'
      });
      console.log('✅ [DeliveryMode] Session mise à jour vers VIEWING_MENU après affichage du menu');
    }
  }
  
  /**
   * Afficher le menu après choix du mode de livraison
   */
  private async showMenuAfterDeliveryModeChoice(phoneNumber: string, restaurant: any, deliveryMode: string, existingSession?: any): Promise<void> {
    const supabase = await this.getSupabaseClient();
    
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
    // Utiliser la session existante si fournie, sinon la récupérer
    const session = existingSession || await this.sessionManager.getSession(phoneNumber);
    if (session) {
      console.log('📦 [showMenuAfterDeliveryModeChoice] Mise à jour session vers VIEWING_MENU');
      console.log(`🔍 [SESSION] Mode sélectionné: ${deliveryMode}`);
      
      console.log('🔍 [CORRUPTION_DEBUG] SOURCE session.sessionData - Type:', typeof session.sessionData);
      console.log('🔍 [CORRUPTION_DEBUG] SOURCE session.sessionData - Data:', JSON.stringify(session.sessionData).substring(0, 100) + '...');
      
      // ✅ CORRUPTION FIX: Parser le JSON si c'est un string avant le spread
      const sessionData = typeof session.sessionData === 'string' ? JSON.parse(session.sessionData) : session.sessionData;
      console.log('🔍 [CORRUPTION_DEBUG] APRÈS JSON.parse ligne 1125 - Type:', typeof sessionData);
      console.log('🔍 [CORRUPTION_DEBUG] APRÈS JSON.parse ligne 1125 - Data:', JSON.stringify(sessionData).substring(0, 100) + '...');
      
      const updatedData = {
        ...sessionData,
        categories: categories,
        deliveryMode: deliveryMode,
        selectedServiceMode: deliveryMode, // NOUVEAU: Ajout pour validation rayon
        cart: sessionData?.cart || {},
        totalPrice: sessionData?.totalPrice || 0
      };
      
      console.log('🔍 [CORRUPTION_DEBUG] APRÈS spread ligne 1128 - Type:', typeof updatedData);
      console.log('🔍 [CORRUPTION_DEBUG] APRÈS spread ligne 1128 - Data:', JSON.stringify(updatedData).substring(0, 100) + '...');
      
      console.log(`✅ [SESSION] Données session mises à jour:`, {
        deliveryMode: updatedData.deliveryMode,
        selectedServiceMode: updatedData.selectedServiceMode,
        hasCategories: !!updatedData.categories,
        cartItems: Object.keys(updatedData.cart || {}).length
      });
      
      // ✅ CORRECTION: Ne pas changer bot_state ici car c'est après handleDeliveryModeChoice
      // bot_state sera mis à jour vers VIEWING_MENU une fois que l'utilisateur aura fait son choix
      console.log('🔍 [CORRUPTION_DEBUG] AVANT update UniversalBot ligne 1141 - Type:', typeof updatedData);
      console.log('🔍 [CORRUPTION_DEBUG] AVANT update UniversalBot ligne 1141 - Data:', JSON.stringify(updatedData).substring(0, 100) + '...');
      
      console.log('📝 [UPDATE_SESSION_04] UniversalBot ligne 1153 - CRITIQUE');
      await this.sessionManager.updateSession(session.id, {
        // botState: 'VIEWING_MENU', // ← SUPPRIMÉ: on garde CHOOSING_DELIVERY_MODE
        sessionData: updatedData  // ✅ CORRECTION FINALE: Passer l'objet directement, SessionManager gère JSON.stringify
      });
      
      console.log('✅ [CORRUPTION_DEBUG] APRÈS update UniversalBot ligne 1141 - Terminé');
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
    
    // DIAGNOSTIC: Vérifier incohérence d'état
    console.log(`🔄 [STATE_DEBUG] État de session actuel: ${session.botState}`);
    console.log(`🔄 [STATE_DEBUG] État attendu pour handleMenuNavigation: VIEWING_MENU`);
    if (session.botState !== 'VIEWING_MENU') {
      console.error(`❌ [STATE_DEBUG] INCOHÉRENCE DÉTECTÉE ! handleMenuNavigation appelé mais état = ${session.botState}`);
      console.error(`❌ [STATE_DEBUG] Ceci pourrait expliquer les problèmes de validation`);
    }
    
    if (isNaN(categoryNumber)) {
      console.log(`❌ [handleMenuNavigation] Message n'est pas un nombre valide: "${message}"`);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Veuillez entrer un numéro valide entre 1 et ${categories.length}.`);
      return;
    }
    
    if (categoryNumber >= 1 && categoryNumber <= categories.length) {
      const selectedCategory = categories[categoryNumber - 1];
      console.log(`✅ [handleMenuNavigation] Catégorie sélectionnée: ${selectedCategory.name} (ID: ${selectedCategory.id})`);
      
      const supabase = await this.getSupabaseClient();

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
      console.error(`❌ [CATBUG_DEBUG] ÉCHEC - Numéro invalide: ${categoryNumber}. Categories en session: ${categories.length}`);
      console.error(`❌ [CATBUG_DEBUG] PROBLÈME IDENTIFIÉ - Menu affiche plus de categories que la session n'en contient !`);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Choix invalide. Choisissez entre 1 et ${categories.length}.\n↩ Tapez 0 pour revenir au menu.`);
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
    
    // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer currentCategoryName au moment de la sélection produit
    console.log('🔍 CATEGORY_WORKFLOW_DEBUG - UniversalBot.handleProductSelection:', {
      phoneNumber,
      message,
      currentCategoryName: session.sessionData?.currentCategoryName,
      currentCategoryId: session.sessionData?.currentCategoryId,
      hasProducts: !!session.sessionData?.products,
      productCount: session.sessionData?.products?.length || 0
    });
    
    // RÉUTILISATION: Vérifier les actions rapides 99, 00 avant parseInt
    const choice = message.trim();
    if (choice === '99' || choice === '00') {
      console.log(`⚡ [ProductSelection] Action rapide détectée: ${choice} - Délégation à handleCartActions`);
      await this.handleCartActions(phoneNumber, session, message);
      return;
    }
    
    const productNumber = parseInt(message.trim());
    const products = session.sessionData?.products || [];
    
    console.log(`🛒 [ProductSelection] Numéro sélectionné: ${productNumber}`);
    console.log(`🛒 [ProductSelection] ${products.length} produits disponibles`);
    
    // Option 0 : Retour au menu principal
    if (productNumber === 0) {
      console.log('↩️ [ProductSelection] Retour au menu principal');
      
      // Récupérer les catégories et réafficher le menu
      const supabase = await this.getSupabaseClient();

      const { data: restaurant } = await supabase
        .from('france_restaurants')
        .select('*')
        .eq('id', session.restaurantId)
        .single();
      
      if (restaurant) {
        const deliveryMode = session.sessionData?.deliveryMode || 'sur_place';
        await this.showMenuAfterDeliveryModeChoice(phoneNumber, restaurant, deliveryMode);
        
        // ✅ APRÈS affichage menu, mettre à jour état vers VIEWING_MENU pour permettre navigation
        await this.sessionManager.updateSession(session.id, {
          botState: 'VIEWING_MENU'
        });
        console.log('✅ [ProductSelection] État mis à jour vers VIEWING_MENU après retour menu "0"');
      }
      return;
    }
    
    // Vérifier la validité du choix - Support affichage unifié des pizzas
    let maxValidChoice = products.length;
    
    // Si c'est un affichage unifié de pizzas, accepter les choix étendus
    const hasPizzaMap = session.sessionData?.pizzaOptionsMap || session.workflowData?.pizzaOptionsMap;
    if (hasPizzaMap) {
      maxValidChoice = session.sessionData?.totalPizzaOptions || session.workflowData?.totalPizzaOptions || products.length;
      console.log(`🍕 [ProductSelection] Mode pizza unifié - Accepte jusqu'à ${maxValidChoice}`);
    }
    
    if (isNaN(productNumber) || productNumber < 1 || productNumber > maxValidChoice) {
      console.log(`❌ [ProductSelection] Choix invalide: ${productNumber} (max: ${maxValidChoice})`);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Choix invalide. Choisissez entre 1 et ${maxValidChoice}.\n↩️ Tapez 0 pour revenir au menu.`);
      return;
    }
    
    // DEBUG: Vérifier les données de session pour pizza unifié
    console.log(`🔍 [ProductSelection] DEBUG Session:`, {
      hasPizzaMap: !!session.sessionData?.pizzaOptionsMap,
      mapLength: session.sessionData?.pizzaOptionsMap?.length || 0,
      totalOptions: session.sessionData?.totalPizzaOptions,
      productNumber: productNumber,
      sessionKeys: Object.keys(session.sessionData || {}),
      sessionId: session.id
    });

    // Gérer la sélection en mode pizza unifié - Vérifier sessionData ET workflowData
    const pizzaOptionsMap = session.sessionData?.pizzaOptionsMap || session.workflowData?.pizzaOptionsMap;
    const totalPizzaOptions = session.sessionData?.totalPizzaOptions || session.workflowData?.totalPizzaOptions;
    
    // 🔧 SOLUTION 1 : Détection spéciale Menu Pizza avec discriminant universel
    if (pizzaOptionsMap) {
      // Vérifier les actions spéciales AVANT le mapping
      if (productNumber === 0 || productNumber === 99) {
        console.log(`⚡ [ProductSelection] Action spéciale détectée: ${productNumber}`);
        // Laisser passer au code normal
      } else {
        const selectedOption = pizzaOptionsMap.find(opt => opt.optionNumber === productNumber);
        
        if (selectedOption) {
          console.log(`✅ [ProductSelection] Option trouvée: ${selectedOption.pizzaName} (type: ${selectedOption.type})`);
          
          // DÉTECTION SPÉCIALE MENU PIZZA
          if (selectedOption.type === 'menu_pizza') {
            console.log(`📋 [ProductSelection] Menu Pizza détecté: ${selectedOption.pizzaName}`);
            
            // Récupérer le produit complet depuis la base
            // 🔧 OPTIMISATION: Utilisation du client unique
            const supabase = await this.getSupabaseClient();
            
            const { data: fullProduct } = await supabase
              .from('france_products')
              .select('*')
              .eq('id', selectedOption.pizzaId)
              .single();
            
            if (fullProduct) {
              // Démarrer le workflow Menu Pizza
              await this.compositeWorkflowExecutor.startMenuPizzaWorkflow(
                phoneNumber,
                fullProduct,
                session
              );
              return;
            }
          } else if (selectedOption.type === 'individual_pizza') {
            console.log(`🍕 [ProductSelection] Pizza individuelle: ${selectedOption.pizzaName} ${selectedOption.sizeName}`);
            // Pizza individuelle (comportement existant)
            await this.addPizzaDirectToCart(phoneNumber, session, selectedOption);
            return;
          }
        } else {
          console.log(`❌ [ProductSelection] Option ${productNumber} non trouvée dans mapping`);
        }
      }
    } else {
      console.log(`🛒 [ProductSelection] Utilisation système classique pour produits standards`);
    }
    
    const selectedProduct = products[productNumber - 1];
    console.log(`✅ [ProductSelection] Produit sélectionné: ${selectedProduct.name} (ID: ${selectedProduct.id})`);
    
    // CORRECTION: Re-requête le produit complet avec steps_config
    // 🔧 OPTIMISATION: Utilisation du client unique
    const supabase = await this.getSupabaseClient();
    
    const { data: fullProduct } = await supabase
      .from('france_products')
      .select('*')
      .eq('id', selectedProduct.id)
      .single();
    
    if (fullProduct) {
      // Utiliser le produit complet avec steps_config
      Object.assign(selectedProduct, fullProduct);
      console.log(`✅ [ProductSelection] Produit complet rechargé avec steps_config:`, !!fullProduct.steps_config);
    }
    
    // DÉBOGAGE : Afficher toutes les propriétés du produit
    console.log(`🔍 [ProductSelection] Propriétés du produit:`, {
      name: selectedProduct.name,
      requires_steps: selectedProduct.requires_steps,
      workflow_type: selectedProduct.workflow_type,
      type: selectedProduct.type,
      product_type: selectedProduct.product_type,
      has_steps_config: !!selectedProduct.steps_config
    });
    
    // Vérifier si le produit nécessite des étapes (workflow composite)
    let isComposite = selectedProduct.requires_steps || selectedProduct.workflow_type || selectedProduct.type === 'composite';
    
    // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer la détection composite initiale
    console.log('🔍 CATEGORY_WORKFLOW_DEBUG - UniversalBot.handleProductSelection composite detection:', {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      isComposite,
      requires_steps: selectedProduct.requires_steps,
      workflow_type: selectedProduct.workflow_type,
      type: selectedProduct.type,
      currentCategoryName: session.sessionData?.currentCategoryName
    });
    
    // NOUVELLE LOGIQUE : Vérifier aussi si le produit a des variantes de taille configurées
    if (!isComposite) {
      console.log(`🔍 [ProductSelection] Vérification des variantes pour ${selectedProduct.name}...`);
      
      const supabase = await this.getSupabaseClient();

      // Vérifier dans france_product_sizes
      const { data: sizes } = await supabase
        .from('france_product_sizes')
        .select('id')
        .eq('product_id', selectedProduct.id)
        .eq('is_active', true);
      
      console.log(`🔍 [ProductSelection] ${sizes?.length || 0} tailles trouvées pour ${selectedProduct.name}`);
      
      if (sizes && sizes.length > 0) {
        isComposite = true;
        console.log(`✅ [ProductSelection] ${selectedProduct.name} détecté comme ayant des variantes de taille`);
        
        // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer la conversion modular vers composite
        console.log('🔍 CATEGORY_WORKFLOW_DEBUG - UniversalBot.handleProductSelection modular->composite:', {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          product_type: selectedProduct.product_type,
          sizesFound: sizes.length,
          convertedToComposite: true,
          currentCategoryName: session.sessionData?.currentCategoryName,
          reason: 'HAS_SIZES'
        });
      }
    }
    
    // AVANT la vérification des pizzas - Vérifier workflow menu pizza
    // Détection UNIVERSELLE des Menu Pizza par catégorie ou workflow_type
    const isMenuPizzaCategory = session.sessionData?.currentCategoryName === 'Menu Pizza' ||
                               session.sessionData?.currentCategorySlug === 'menu-pizza' ||
                               session.sessionData?.currentCategorySlug === 'menu_pizza';
    
    const isMenuPizzaWorkflow = selectedProduct.workflow_type === 'menu_pizza_selection';
    
    if (isMenuPizzaCategory || isMenuPizzaWorkflow) {
        console.log('🍕 [MenuPizza] Démarrage workflow menu pizza pour produit:', selectedProduct.name);
        
        // Démarrer le workflow menu pizza
        await this.compositeWorkflowExecutor.startMenuPizzaWorkflow(
            phoneNumber,
            selectedProduct,
            session
        );
        return;
    }

    if (isComposite) {
      console.log(`🔄 [ProductSelection] Produit composite détecté: ${selectedProduct.workflow_type || selectedProduct.type || 'variants'}`);
      
      try {
        // Lancer le workflow composite universel
        console.log(`🚀 [ProductSelection] Tentative de démarrage workflow composite pour: ${selectedProduct.name}`);
        
        // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer le démarrage du workflow composite
        console.log('🔍 CATEGORY_WORKFLOW_DEBUG - UniversalBot.handleProductSelection startCompositeWorkflow:', {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          currentCategoryName: session.sessionData?.currentCategoryName,
          workflowPath: 'COMPOSITE_WORKFLOW',
          phoneNumber
        });
        
        await this.compositeWorkflowExecutor.startCompositeWorkflow(phoneNumber, selectedProduct, session);
        console.log(`✅ [ProductSelection] Workflow composite démarré avec succès pour: ${selectedProduct.name}`);
        return;
      } catch (error) {
        console.error(`❌ [ProductSelection] ERREUR lors du démarrage workflow composite pour ${selectedProduct.name}:`, error);
        console.error(`📋 [ProductSelection] Stack trace:`, error.stack);
        console.error(`📋 [ProductSelection] Détails produit:`, {
          id: selectedProduct.id,
          name: selectedProduct.name,
          product_type: selectedProduct.product_type,
          workflow_type: selectedProduct.workflow_type,
          requires_steps: selectedProduct.requires_steps
        });
        throw error; // Re-lancer l'erreur pour qu'elle remonte
      }
    }
    
    // Produit simple - Stocker et traiter avec quantité 1
    console.log('📦 [ProductSelection] Produit simple - Traitement direct avec quantité 1');
    
    // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer le workflow simple (non-composite)
    console.log('🔍 CATEGORY_WORKFLOW_DEBUG - UniversalBot.handleProductSelection simple workflow:', {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      product_type: selectedProduct.product_type,
      workflowPath: 'SIMPLE_WORKFLOW',
      currentCategoryName: session.sessionData?.currentCategoryName,
      phoneNumber
    });
    
    // Créer session temporaire avec selectedProduct
    const tempSession = {
      ...session,
      sessionData: (() => {
        console.log('🚨 [SPREAD_DEBUG_001] UniversalBot ligne 1480');
        return {
          ...session.sessionData,
          selectedProduct: selectedProduct
        };
      })()
    };
    
    await this.handleQuantityInput(phoneNumber, tempSession, '1');
  }
  
  /**
   * Afficher les produits d'une catégorie - ARCHITECTURE UNIVERSELLE
   * SOLID : Single Responsibility - Une seule responsabilité : afficher les produits
   */
  private async showProductsInCategory(phoneNumber: string, restaurant: any, session: any, categoryId: string): Promise<void> {
    console.log(`📦 [ShowProducts] Chargement produits catégorie ID: ${categoryId}`);
    
    try {
      const supabase = await this.getSupabaseClient();

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
      
      // 3. NOUVEAU : Vérifier si cette catégorie doit utiliser l'affichage unifié
      // Charger la config du restaurant si nécessaire
      await this.pizzaDisplayService.loadRestaurantConfig(restaurant.id);
      
      if (this.pizzaDisplayService.shouldUseUnifiedDisplay(category.slug)) {
        console.log(`🍕 [ShowProducts] Catégorie ${category.slug} utilise l'affichage unifié`);
        
        // Déterminer le type de contexte
        const isMenuCategory = category.slug.includes('menu') || category.name.toLowerCase().includes('menu');
        const context = isMenuCategory ? 'menu_list' : 'category_list';
        
        // Utiliser le service spécialisé pour l'affichage
        await this.pizzaDisplayService.displayPizzas(
          phoneNumber,
          session,
          context,
          {
            pizzas: isMenuCategory ? undefined : products,
            menus: isMenuCategory ? products : undefined,
            restaurantName: restaurant.name,
            deliveryMode: session.sessionData?.deliveryMode || 'sur_place'
          }
        );
        
        // Mettre à jour la session pour gérer la sélection
        console.log('🚨 [SPREAD_DEBUG_002] UniversalBot ligne 1564');
        
        // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer quand currentCategoryName est défini (ligne 1608)
        console.log('🔍 CATEGORY_WORKFLOW_DEBUG - UniversalBot.showProductsInCategory ligne 1608:', {
          categoryId,
          categoryName: category.name,
          phoneNumber,
          action: 'SETTING currentCategoryName in session'
        });
        
        const updatedData = {
          ...session.sessionData,
          currentCategoryId: categoryId,
          currentCategoryName: category.name,
          products: products,
          deliveryMode: session.sessionData?.deliveryMode || 'sur_place'
        };
        
        await this.sessionManager.updateSession(session.id, {
          botState: 'SELECTING_PRODUCTS',
          sessionData: updatedData
        });
        
        return; // Sortir pour éviter l'affichage classique
      }
      
      // 3.2 LOGIQUE EXISTANTE PRÉSERVÉE : Si UN SEUL produit avec variantes, affichage direct
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
      
      // 4. Logique classique PRÉSERVÉE : Construire la liste des produits  
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
        
        // Utilisation du nouveau format avec séparateurs
        menuText += this.formatProductWithSeparators(product, index, category.icon, activePrice);
        
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
      menuText += '\n📝 Ex: 1 pour 1 produit, 1,1 pour 2 fois le même produit';
      menuText += '\n↩️ Tapez 0 pour revenir au menu principal';
      
      await this.messageSender.sendMessage(phoneNumber, menuText);
      
      // 4. Mettre à jour la session avec les produits et l'état
      console.log('📝 [ShowProducts] Mise à jour session avec produits');
      
      console.log('🚨 [SPREAD_DEBUG_003] UniversalBot ligne 1725');
      
      // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer quand currentCategoryName est défini (ligne 1770)
      console.log('🔍 CATEGORY_WORKFLOW_DEBUG - UniversalBot.showProductsInCategory ligne 1770:', {
        categoryId,
        categoryName: category.name,
        phoneNumber,
        productCount: productList.length,
        action: 'SETTING currentCategoryName in session'
      });
      
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
        // Vérifier si panier non vide
        if (!session.sessionData?.cart || Object.keys(session.sessionData.cart).length === 0) {
          await this.messageSender.sendMessage(phoneNumber, 
            '🛒 Votre panier est vide.\nAjoutez des produits avant de commander.');
          return;
        }
        await this.handleOrderCreation(phoneNumber, session);
        break;
        
      case '00': // Vider panier
        await this.sessionManager.updateSession(phoneNumber, {
          botState: session.botState,
          sessionData: (() => {
            console.log('🚨 [SPREAD_DEBUG_004] UniversalBot ligne 1767');
            return {
              ...session.sessionData,
              cart: [],
              totalPrice: 0
            };
          })()
        });
        await this.messageSender.sendMessage(phoneNumber,
          '🗑️ Panier vidé avec succès !'
        );
        
        // Afficher les catégories après vidage
        const supabase = await this.getSupabaseClient();

        const { data: restaurant } = await supabase
          .from('france_restaurants')
          .select('*')
          .eq('id', session.restaurantId)
          .single();
        
        if (restaurant) {
          const deliveryMode = session.sessionData?.deliveryMode || 'sur_place';
          await this.showMenuAfterDeliveryModeChoice(phoneNumber, restaurant, deliveryMode);
        }
        
        // ✅ APRÈS vidage et affichage menu, mettre à jour état vers VIEWING_MENU pour permettre navigation
        await this.sessionManager.updateSession(session.id, {
          botState: 'VIEWING_MENU'
        });
        console.log('✅ [CartActions] État mis à jour vers VIEWING_MENU après vidage panier "00"');
        break;
        
      case '0': // Ajouter d'autres produits
        const categoryId = session.sessionData?.selectedCategoryId;
        if (categoryId) {
          await this.showCategoryProducts(phoneNumber, session, categoryId);
        } else {
          // Récupérer les données restaurant
          const supabase = await this.getSupabaseClient();
          const { data: restaurant } = await supabase
            .from('france_restaurants')
            .select('*')
            .eq('id', session.restaurantId)
            .single();
          
          if (restaurant) {
            const deliveryMode = session.sessionData?.deliveryMode || 'sur_place';
            await this.showMenuAfterDeliveryModeChoice(phoneNumber, restaurant, deliveryMode);
          }
        }
        
        // ✅ APRÈS affichage, mettre à jour état vers VIEWING_MENU pour permettre navigation
        await this.sessionManager.updateSession(session.id, {
          botState: 'VIEWING_MENU'
        });
        console.log('✅ [CartActions] État mis à jour vers VIEWING_MENU après action "0"');
        break;
        
      default:
        await this.messageSender.sendMessage(phoneNumber,
          '❌ Choix invalide.\n\n*ACTIONS RAPIDES:*\n⚡ 99 = Passer commande\n🗑️ 00 = Vider panier\n🍕 0  = Ajouter d\'autres produits'
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
      console.log(`🚨 [DEBUG-OrderCreation] Session complète:`, JSON.stringify(session, null, 2));
      
      const cart = session.sessionData?.cart || [];
      const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;
      const deliveryMode = session.sessionData?.deliveryMode;
      
      console.log(`🚨 [DEBUG-OrderCreation] cart:`, JSON.stringify(cart, null, 2));
      console.log(`🚨 [DEBUG-OrderCreation] restaurantId:`, restaurantId);
      console.log(`🚨 [DEBUG-OrderCreation] deliveryMode:`, deliveryMode);
      console.log(`🚨 [DEBUG-OrderCreation] session.restaurant_id (table):`, session.restaurant_id);
      console.log(`🚨 [DEBUG-OrderCreation] Toutes les clés sessionData:`, Object.keys(session.sessionData || {}));
      
      if (!cart || cart.length === 0) {
        console.log(`❌ [DEBUG-OrderCreation] PANIER VIDE - cart.length: ${cart?.length}`);
        await this.messageSender.sendMessage(phoneNumber, '❌ Votre panier est vide. Ajoutez des produits avant de commander.');
        return;
      }
      
      if (!restaurantId) {
        console.log(`❌ [DEBUG-OrderCreation] RESTAURANT NON SÉLECTIONNÉ - restaurantId: ${restaurantId}`);
        console.log(`❌ [DEBUG-OrderCreation] Alternative session.restaurant_id: ${session.restaurant_id}`);
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
        sessionData: (() => {
          console.log('🚨 [SPREAD_DEBUG_005] UniversalBot ligne 1951');
          return {
            ...session.sessionData,
            existingAddresses
          };
        })()
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
      // CORRECTION: Même logique de fallback que pour les commandes
      const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;
      
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
      // CORRECTION: Même logique de fallback que pour les commandes
      const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;
      
      // NOUVEAU: Validation du rayon de livraison (uniquement pour le mode livraison)
      if (session.sessionData?.selectedServiceMode === 'livraison') {
        console.log('🔍 [SaveAddress] === DÉBUT VALIDATION RAYON LIVRAISON ===');
        console.log('🔍 [SaveAddress] Mode de service détecté: LIVRAISON');
        console.log(`🔍 [SaveAddress] Restaurant ID: ${restaurantId}`);
        console.log(`🔍 [SaveAddress] Session data:`, JSON.stringify(session.sessionData, null, 2));
        console.log(`🔍 [SaveAddress] Adresse geometry:`, JSON.stringify(address.geometry, null, 2));
        
        const radiusValidation = await this.deliveryRadiusService.validateAddressInRadius(
          restaurantId,
          address.geometry.location.lat,
          address.geometry.location.lng
        );
        
        console.log(`🔍 [SaveAddress] Résultat validation:`, JSON.stringify(radiusValidation, null, 2));
        
        if (!radiusValidation.isInRadius) {
          console.log('❌ [SaveAddress] ADRESSE HORS ZONE DÉTECTÉE');
          console.log(`❌ [SaveAddress] Distance: ${radiusValidation.distanceKm}km > ${radiusValidation.maxRadiusKm}km`);
          
          // Adresse hors zone - Informer le client et proposer alternatives
          const message = `❌ **Désolé, cette adresse est hors de notre zone de livraison**\n\n` +
                         `📍 Distance: ${radiusValidation.distanceKm}km\n` +
                         `🚚 Zone maximum: ${radiusValidation.maxRadiusKm}km\n\n` +
                         `*Que souhaitez-vous faire ?*\n` +
                         `1️⃣ Essayer une autre adresse\n` +
                         `2️⃣ Commander à emporter\n\n` +
                         `💡 *Tapez 1 ou 2*`;
          
          console.log(`📱 [SaveAddress] Envoi message hors zone:`, message);
          await this.messageSender.sendMessage(phoneNumber, message);
          
          // Mettre à jour la session pour gérer la réponse
          await this.sessionManager.updateSession(session.id, {
            botState: 'AWAITING_OUT_OF_ZONE_CHOICE',
            sessionData: {
              ...session.sessionData,
              outOfZoneAddress: address,
              radiusValidation: radiusValidation
            }
          });
          
          return; // Arrêter le processus jusqu'à la réponse du client
        }
        
        // Adresse dans la zone - Informer le client
        console.log('✅ [SaveAddress] ADRESSE DANS LA ZONE VALIDÉE');
        console.log(`✅ [SaveAddress] Distance: ${radiusValidation.distanceKm}km ≤ ${radiusValidation.maxRadiusKm}km`);
        
        if (radiusValidation.distanceKm > 0) {
          const successMessage = `✅ **Adresse validée !**\n📍 Distance: ${radiusValidation.distanceKm}km`;
          console.log(`📱 [SaveAddress] Envoi message succès:`, successMessage);
          await this.messageSender.sendMessage(phoneNumber, successMessage);
        }
        
        console.log('🔍 [SaveAddress] === FIN VALIDATION RAYON LIVRAISON ===');
      } else {
        console.log('ℹ️ [SaveAddress] Mode de service NON-LIVRAISON - Validation rayon ignorée');
        console.log(`ℹ️ [SaveAddress] Mode actuel: ${session.sessionData?.selectedServiceMode || 'UNDEFINED'}`);
      }
      
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
      // CORRECTION: Même logique de fallback que pour les commandes
      const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;
      
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
      // 🔧 OPTIMISATION: Utilisation du client unique
      const supabase = await this.getSupabaseClient();
      
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
    const startTime = Date.now();
    console.log(`⏱️ [PERF] handleWorkflowActions START - Message: "${message}", Time: ${new Date().toISOString()}`);
    
    const choice = message.trim();
    
    switch (choice) {
      case '1': // Ajouter au panier
        console.log(`⏱️ [PERF] Calling handleQuantityInput - ${Date.now() - startTime}ms elapsed`);
        await this.handleQuantityInput(phoneNumber, session, '1');
        console.log(`⏱️ [PERF] handleQuantityInput completed - ${Date.now() - startTime}ms total`);
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
          // Récupérer les données restaurant
          const supabase = await this.getSupabaseClient();
          const { data: restaurant } = await supabase
            .from('france_restaurants')
            .select('*')
            .eq('id', session.restaurantId)
            .single();
          
          if (restaurant) {
            const deliveryMode = session.sessionData?.deliveryMode || 'sur_place';
            await this.showMenuAfterDeliveryModeChoice(phoneNumber, restaurant, deliveryMode);
          }
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
    const startTime = Date.now();
    console.log(`⏱️ [PERF] handleQuantityInput START - Time: ${new Date().toISOString()}`);
    console.log(`📦 [QuantityInput] Message reçu: "${message}"`);
    
    const quantity = parseInt(message.trim());
    const selectedProduct = session.sessionData?.selectedProduct;
    
    // 🔍 CATEGORY_WORKFLOW_DEBUG - Tracer handleQuantityInput pour workflow simple
    console.log('🔍 CATEGORY_WORKFLOW_DEBUG - UniversalBot.handleQuantityInput:', {
      phoneNumber,
      message,
      productId: selectedProduct?.id,
      productName: selectedProduct?.name,
      product_type: selectedProduct?.product_type,
      currentCategoryName: session.sessionData?.currentCategoryName,
      workflowPath: 'QUANTITY_INPUT'
    });
    
    console.log(`⏱️ [PERF] Product check - ${Date.now() - startTime}ms elapsed`);
    
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
    console.log(`⏱️ [PERF] Building cart - ${Date.now() - startTime}ms elapsed`);
    const rawCart = session.sessionData?.cart || [];
    const cart = Array.isArray(rawCart) ? rawCart : [];
    cart.push({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      categoryName: await this.getCategoryNameFromProduct(selectedProduct.id) 
                 || session.sessionData?.currentCategoryName 
                 || 'ProduitTest',
      productDescription: productDescription,
      quantity: quantity,
      unitPrice: selectedProduct.price,
      totalPrice: totalPrice,
      configuration: selectedProduct.configuration || null
    });
    
    // Calculer le total du panier
    const cartTotal = cart.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    
    // Utiliser le formatter universel pour le message
    console.log(`⏱️ [PERF] Importing UniversalCartFormatter - ${Date.now() - startTime}ms elapsed`);
    const { UniversalCartFormatter } = await import('../services/UniversalCartFormatter.ts');
    const formatter = new UniversalCartFormatter();
    console.log(`⏱️ [PERF] UniversalCartFormatter imported - ${Date.now() - startTime}ms elapsed`);
    
    // Formater le message avec le nouveau standard universel
    const confirmMessage = formatter.formatAdditionMessage(
      selectedProduct,
      cart,
      quantity
    );
    console.log(`⏱️ [PERF] Message formatted - ${Date.now() - startTime}ms elapsed`);
    
    await this.messageSender.sendMessage(phoneNumber, confirmMessage);
    console.log(`⏱️ [PERF] WhatsApp message sent - ${Date.now() - startTime}ms elapsed`);
    
    // Mettre à jour la session
    console.log('🚨 [SPREAD_DEBUG_006] UniversalBot ligne 2454');
    const updatedData = {
      ...session.sessionData,
      cart: cart,
      cartTotal: cartTotal,
      selectedProduct: null,
      awaitingQuantity: false,
      awaitingCartActions: true
    };
    
    console.log(`⏱️ [PERF] Starting session update - ${Date.now() - startTime}ms elapsed`);
    await this.sessionManager.updateSession(session.id, {
      botState: 'AWAITING_CART_ACTIONS',
      sessionData: updatedData
    });
    console.log(`⏱️ [PERF] Session updated - ${Date.now() - startTime}ms elapsed`);
    
    console.log(`✅ [QuantityInput] Produit ajouté au panier, état -> CART_OPTIONS`);
    console.log(`⏱️ [PERF] handleQuantityInput COMPLETE - ${Date.now() - startTime}ms TOTAL`);
  }
  
  /**
   * Supprimer une session (équivalent de SimpleSession.deleteAllForPhone)
   */
  private async deleteSession(phoneNumber: string): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();

      await supabase
        .from('france_user_sessions')
        .delete()
        .eq('phone_number', phoneNumber);
        
      console.log(`🗑️ [DeleteSession:2506] Sessions supprimées pour: ${phoneNumber}`);
    } catch (error) {
      console.error('❌ [DeleteSession:2508] Erreur suppression session:', error);
    }
  }


  /**
   * Gérer le flux de confirmation d'annulation
   */
  private async handleCancellationConfirmationFlow(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      console.log(`🔍 [CancellationFlow] handleCancellationConfirmationFlow - phoneNumber: ${phoneNumber}`);
      console.log(`🔍 [CancellationFlow] message: "${message}"`);
      console.log(`🔍 [CancellationFlow] session data:`, JSON.stringify(session, null, 2));
      console.log(`🔍 [CancellationFlow] session.sessionData:`, JSON.stringify(session.sessionData, null, 2));
      console.log(`🔍 [CancellationFlow] session expires_at:`, session.expiresAt);
      console.log(`🔍 [CancellationFlow] current time:`, new Date());
      
      // Vérifier expiration
      const now = new Date();
      const expiresAt = new Date(session.expiresAt || session.expires_at);
      const isExpired = now > expiresAt;
      console.log(`🔍 [CancellationFlow] Session expired?:`, isExpired);
      
      const orderData = {
        orderId: session.sessionData?.pendingCancellationOrderId,
        orderNumber: session.sessionData?.pendingCancellationOrderNumber
      };
      
      console.log(`🔍 [CancellationFlow] extracted orderData:`, JSON.stringify(orderData, null, 2));
      
      if (!orderData.orderId) {
        console.log(`❌ [CancellationFlow] No orderId found - session expired or data missing`);
        await this.deleteSession(phoneNumber);
        await this.messageSender.sendMessage(phoneNumber, 
          '❌ Session expirée. Tapez "annuler" pour recommencer.'
        );
        return;
      }
      
      // Déléguer au service d'annulation
      const result = await this.cancellationService.handleCancellationConfirmation(orderData, message);
      
      // Envoyer message résultat
      await this.messageSender.sendMessage(phoneNumber, result.message);
      
      // Le service gère le nettoyage de session
      // Nettoyer seulement pour les réponses définitives ou invalides
      if (result.action === 'cancelled' || result.action === 'invalid_response') {
        console.log('🔄 [UniversalBot:2556] Calling cleanupCancellationSession from main logic');
        await this.cancellationService.cleanupCancellationSession(phoneNumber);
        console.log('🗑️ [CancellationFlow] Session d\'annulation nettoyée après réponse:', result.action);
      }
      
    } catch (error) {
      console.error('❌ [CancellationConfirmationFlow] Erreur:', error);
      console.log('🚨 [UniversalBot:2563] Calling cleanupCancellationSession from CATCH block');
      await this.cancellationService.cleanupCancellationSession(phoneNumber);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur lors de l\'annulation. Veuillez réessayer.'
      );
    }
  }

  /**
   * Gérer le choix du client quand son adresse est hors de la zone de livraison
   */
  private async handleOutOfZoneChoice(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      console.log('🔄 [OutOfZoneChoice] === DÉBUT GESTION CHOIX HORS ZONE ===');
      console.log(`🔄 [OutOfZoneChoice] Message reçu: "${message}"`);
      console.log(`🔄 [OutOfZoneChoice] Session data:`, JSON.stringify(session.sessionData, null, 2));
      
      const choice = parseInt(message.trim());
      console.log(`🔄 [OutOfZoneChoice] Choix parsé: ${choice} (type: ${typeof choice})`);
      
      if (choice === 1) {
        console.log('🔄 [OutOfZoneChoice] CHOIX 1: Essayer une autre adresse');
        // Essayer une autre adresse
        await this.messageSender.sendMessage(phoneNumber, 
          '📝 *Saisissez votre nouvelle adresse complète*\n\n💡 *Exemple : 15 rue de la Paix, 75001 Paris*'
        );
        
        await this.sessionManager.updateSession(session.id, {
          botState: 'AWAITING_NEW_ADDRESS',
          sessionData: {
            ...session.sessionData,
            outOfZoneAddress: undefined,
            radiusValidation: undefined
          }
        });
        
      } else if (choice === 2) {
        console.log('🔄 [OutOfZoneChoice] CHOIX 2: Commander à emporter');
        
        // Commander à emporter
        await this.messageSender.sendMessage(phoneNumber, 
          '🛍️ *Parfait ! Passons à l\'emporter*'
        );
        
        // Mettre à jour le mode de service en emporter
        await this.sessionManager.updateSession(session.id, {
          sessionData: {
            ...session.sessionData,
            selectedServiceMode: 'a_emporter',
            outOfZoneAddress: undefined,
            radiusValidation: undefined
          }
        });
        
        // Traiter directement la commande en emporter
        const cart = session.sessionData?.cart || [];
        // CORRECTION: Même logique de fallback que pour les commandes
        const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;
        
        const order = await this.orderService.createOrderWorkflow(
          phoneNumber,
          cart,
          restaurantId,
          'a_emporter',
          null // Pas d'adresse pour emporter
        );
        
        const restaurantName = await this.getRestaurantName(restaurantId);
        const confirmationMessage = this.orderService.buildOrderConfirmationMessage(
          order,
          restaurantName,
          'a_emporter',
          null
        );
        
        await this.messageSender.sendMessage(phoneNumber, confirmationMessage);
        await this.deleteSession(phoneNumber);
        
      } else {
        console.log(`🔄 [OutOfZoneChoice] CHOIX INVALIDE: ${choice}`);
        console.log(`🔄 [OutOfZoneChoice] Message original: "${message}"`);
        
        // Choix invalide
        await this.messageSender.sendMessage(phoneNumber, 
          '❌ Réponse invalide.\n\n*Tapez :*\n1️⃣ pour essayer une autre adresse\n2️⃣ pour commander à emporter'
        );
      }
      
      console.log('🔄 [OutOfZoneChoice] === FIN GESTION CHOIX HORS ZONE ===');
      
    } catch (error) {
      console.error('❌ [OutOfZoneChoice] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors du traitement. Veuillez réessayer.');
    }
  }
  /**
   * Ajouter une pizza directement au panier (format unifié)
   * Préserve la logique existante du panier
   */
  private async addPizzaDirectToCart(phoneNumber: string, session: any, pizzaOption: any): Promise<void> {
    try {
      console.log(`🛒 [PizzaDirectCart] Ajout pizza: ${pizzaOption.pizzaName} ${pizzaOption.sizeName}`);
      
      // Construire la description du produit
      const productDescription = `${pizzaOption.pizzaName} - Taille: ${pizzaOption.sizeName}`;
      
      // Ajouter au panier - même logique que le système existant
      const rawCart = session.sessionData?.cart || [];
      const cart = Array.isArray(rawCart) ? rawCart : [];
      
      cart.push({
        productId: pizzaOption.pizzaId,
        productName: pizzaOption.pizzaName,
        categoryName: 'Pizzas',
        productDescription: productDescription,
        sizeId: pizzaOption.sizeId,
        sizeName: pizzaOption.sizeName,
        unitPrice: pizzaOption.price,
        quantity: 1,
        totalPrice: pizzaOption.price,
        addedAt: new Date().toISOString()
      });
      
      // Calculer le nouveau total
      const currentTotal = session.sessionData?.totalPrice || 0;
      const newTotal = currentTotal + pizzaOption.price;
      
      // Mettre à jour la session
      const updatedSessionData = {
        ...session.sessionData,
        cart: cart,
        totalPrice: newTotal
      };
      
      await this.sessionManager.updateSession(session.id, {
        botState: 'SELECTING_PRODUCTS',
        sessionData: updatedSessionData
      });
      
      // Message de confirmation
      await this.messageSender.sendMessage(phoneNumber, 
        `✅ Ajouté au panier !\n🍕 ${pizzaOption.pizzaName} ${pizzaOption.sizeName}\n💰 ${pizzaOption.price} EUR\n\n` +
        `📊 Total panier: ${newTotal} EUR\n\n` +
        `*Que souhaitez-vous faire ?*\n` +
        `🗑️ 00 = Vider panier\n` +
        `⚡ 99 = Passer commande\n` +
        `🍕 0  = Continuer vos achats`
      );
      
    } catch (error) {
      console.error('❌ [PizzaDirectCart] Erreur ajout panier:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de l\'ajout au panier. Veuillez réessayer.');
    }
  }

  /**
   * Formate un produit avec le nouveau style de séparateurs et emojis
   */
  private formatProductWithSeparators(
    product: any, 
    index: number, 
    categoryIcon: string, 
    activePrice: number
  ): string {
    let productBlock = '';
    
    // Séparateur
    productBlock += `━━━━━━━━━━━━━━━━━━━━━\n`;
    
    // Nom avec icônes
    // ANCIEN CODE (commenté pour rollback si besoin) :
    // const cleanName = product.name.replace(/^[^\s]+\s/, ''); // Enlève emoji existant - PROBLEME: supprime le premier mot
    
    // CORRECTION: Garder le nom complet mais préserver le comportement existant (double categoryIcon)
    productBlock += `🎯 ${categoryIcon} ${categoryIcon} ${product.name.toUpperCase()}\n`;
    
    // Composition si disponible
    if (product.composition) {
      productBlock += `🧾 ${product.composition.toUpperCase()}\n`;
    }
    
    // Prix et action
    productBlock += `💰 ${activePrice} EUR - Tapez ${index + 1}\n\n`;
    
    return productBlock;
  }

  // =================================
  // NOUVEAU: HANDLER GLOBAL "RESTO"
  // =================================

  /**
   * Handler principal pour la commande "resto"
   * Nettoie session existante et propose menu découverte restaurants
   */
  async handleRestoCommand(phoneNumber: string): Promise<void> {
    try {
      console.log(`🏪 [RestaurantDiscovery] Commande "resto" reçue de: ${phoneNumber}`);
      
      // 1. Nettoyer session existante (même logique qu'annuler)
      await this.deleteSession(phoneNumber);
      
      // 2. Créer session pour sélection de restaurant  
      await this.createRestaurantDiscoverySession(phoneNumber);
      
      // 3. Envoyer menu de choix
      const message = `🏪 **CHOISIR UN RESTAURANT**

📋 **1** - Voir tous les restaurants
📍 **2** - Restaurants près de moi

💡 Tapez votre choix (**1** ou **2**)`;
      
      await this.messageSender.sendMessage(phoneNumber, message);
      
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur handleRestoCommand:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur lors de l\'accès aux restaurants. Veuillez réessayer.');
    }
  }

  /**
   * Créer session temporaire pour découverte restaurants
   * PATTERN CHOOSING_DELIVERY_MODE (accès direct comme ligne 843)
   */
  private async createRestaurantDiscoverySession(phoneNumber: string): Promise<void> {
    try {
      // 1. Supprimer session existante
      await this.sessionManager.deleteSessionsByPhone(phoneNumber);
      
      // 2. Créer nouvelle session avec l'état CHOOSING_RESTAURANT_MODE (pattern ligne 843)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes pour discovery
      
      const supabase = await this.getSupabaseClient();

      const { data: newSession, error } = await supabase
        .from('france_user_sessions')
        .insert({
          phone_number: phoneNumber,
          chat_id: phoneNumber,
          restaurant_id: null, // Pas de restaurant spécifique pour discovery
          current_step: 'CHOOSING_RESTAURANT_MODE',
          bot_state: 'CHOOSING_RESTAURANT_MODE',
          session_data: JSON.stringify({
            discoveryMode: true,
            step: 'choosing_mode'
          }),
          cart_items: JSON.stringify([]),
          total_amount: 0,
          expires_at: expiresAt,
          workflow_data: JSON.stringify({})
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
        
      console.log(`✅ [RestaurantDiscovery] Session discovery créée pour: ${phoneNumber}`);
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur création session:', error);
      throw error;
    }
  }

  /**
   * Gérer choix mode de sélection restaurant (1=liste, 2=géo)
   */
  async handleRestaurantModeSelection(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      const choice = message.trim();
      console.log(`🏪 [RestaurantDiscovery] Mode choisi: ${choice}`);
      
      if (choice === '1') {
        // Mode liste complète
        await this.showAllRestaurants(phoneNumber);
      } else if (choice === '2') {
        // Fonctionnalité temporairement indisponible
        await this.messageSender.sendMessage(phoneNumber, 
          `📍 **GÉOLOCALISATION - BIENTÔT DISPONIBLE**

🚧 Cette fonctionnalité arrive prochainement !

En attendant, consultez tous nos restaurants :

📋 **1** - Voir tous les restaurants

💡 Tapez **1** pour continuer`);
        
        // Garder l'utilisateur dans l'étape de sélection
        return;
      } else {
        // Choix invalide
        await this.messageSender.sendMessage(phoneNumber, 
          `❌ **Choix invalide**

Tapez :
📋 **1** pour tous les restaurants
📍 **2** pour ceux près de vous`);
      }
      
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur mode selection:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur. Tapez **1** ou **2** pour choisir.');
    }
  }

  /**
   * Afficher tous les restaurants disponibles
   */
  async showAllRestaurants(phoneNumber: string): Promise<void> {
    try {
      const restaurants = await this.restaurantDiscoveryService.getAvailableRestaurants();
      
      // Mettre à jour session avec liste
      await this.updateSessionWithRestaurants(phoneNumber, restaurants, 'all');
      
      const message = this.restaurantDiscoveryService.formatRestaurantList(restaurants);
      await this.messageSender.sendMessage(phoneNumber, message);
      
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur showAllRestaurants:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur lors de la récupération des restaurants. Veuillez réessayer.');
    }
  }

  /**
   * Demander partage de position utilisateur
   * UTILISE SessionManager existant
   */
  async requestLocation(phoneNumber: string): Promise<void> {
    try {
      // Récupérer session actuelle puis mettre à jour avec SessionManager
      const session = await this.sessionManager.getSession(phoneNumber);
      if (!session) {
        console.error('❌ [RestaurantDiscovery] Session introuvable pour requestLocation');
        return;
      }

      await this.sessionManager.updateSession(session.id, {
        botState: 'AWAITING_USER_LOCATION'
      });
      
      const message = this.restaurantDiscoveryService.formatLocationRequest();
      await this.messageSender.sendMessage(phoneNumber, message);
      
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur requestLocation:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur. Tapez **1** pour voir tous les restaurants.');
    }
  }

  /**
   * Traiter message de géolocalisation reçu
   */
  async handleLocationMessage(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      if (message.startsWith('GPS:')) {
        const coords = message.substring(4).split(',');
        const latitude = parseFloat(coords[0]);
        const longitude = parseFloat(coords[1]);
        
        console.log(`📍 [RestaurantDiscovery] Coordonnées reçues: ${latitude}, ${longitude}`);
        
        if (LocationService.isValidCoordinates({ latitude, longitude })) {
          await this.showNearbyRestaurants(phoneNumber, latitude, longitude);
        } else {
          await this.messageSender.sendMessage(phoneNumber, 
            `❌ **Coordonnées invalides**

💡 Veuillez partager votre position ou tapez **1** pour voir tous les restaurants.`);
        }
      } else {
        // Message non GPS en attente de localisation
        await this.messageSender.sendMessage(phoneNumber, 
          `📍 **En attente de votre position**

Partagez votre position ou tapez **1** pour voir tous les restaurants.`);
      }
      
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur handleLocationMessage:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur. Tapez **1** pour voir tous les restaurants.');
    }
  }

  /**
   * Afficher restaurants proches avec distances
   */
  async showNearbyRestaurants(phoneNumber: string, lat: number, lng: number): Promise<void> {
    try {
      const nearbyRestaurants = await this.restaurantDiscoveryService
        .getNearbyRestaurants(lat, lng);
        
      // Mettre à jour session
      await this.updateSessionWithRestaurants(phoneNumber, nearbyRestaurants, 'nearby', { lat, lng });
      
      const message = this.restaurantDiscoveryService.formatNearbyRestaurantList(nearbyRestaurants);
      await this.messageSender.sendMessage(phoneNumber, message);
      
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur showNearbyRestaurants:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur lors de la recherche. Tapez **1** pour voir tous les restaurants.');
    }
  }

  /**
   * Gérer sélection finale du restaurant par numéro
   */
  async handleRestaurantSelection(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      const choice = parseInt(message.trim());
      const restaurants = session.sessionData.availableRestaurants;
      
      console.log(`🏪 [RestaurantDiscovery] Sélection: ${choice} parmi ${restaurants?.length} restaurants`);
      
      if (restaurants && choice >= 1 && choice <= restaurants.length) {
        const selectedRestaurant = restaurants[choice - 1];
        console.log(`✅ [RestaurantDiscovery] Restaurant sélectionné: ${selectedRestaurant.name}`);
        
        // CONNEXION AVEC WORKFLOW EXISTANT
        await this.startExistingRestaurantWorkflow(phoneNumber, selectedRestaurant);
      } else {
        await this.messageSender.sendMessage(phoneNumber, 
          `❌ **Choix invalide**

Tapez un numéro entre **1** et **${restaurants?.length || 0}**.`);
      }
      
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur handleRestaurantSelection:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur de sélection. Veuillez réessayer.');
    }
  }

  /**
   * Démarrer workflow restaurant existant (connexion avec l'existant)
   */
  async startExistingRestaurantWorkflow(phoneNumber: string, restaurant: any): Promise<void> {
    try {
      console.log(`🔄 [RestaurantDiscovery] Démarrage workflow existant pour: ${restaurant.name}`);
      
      // Supprimer session discovery et créer session restaurant normale
      await this.deleteSession(phoneNumber);
      
      // UTILISE LA FONCTION EXISTANTE (pas de régression)
      await this.handleDirectRestaurantAccess(phoneNumber, restaurant);
      
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur startExistingRestaurantWorkflow:', error);
      await this.messageSender.sendMessage(phoneNumber, 
        '❌ Erreur lors du démarrage. Veuillez réessayer.');
    }
  }

  /**
   * Utilitaire pour mettre à jour session avec restaurants
   * UTILISE SessionManager existant
   */
  private async updateSessionWithRestaurants(
    phoneNumber: string, 
    restaurants: any[], 
    mode: string, 
    userLocation?: { lat: number, lng: number }
  ): Promise<void> {
    try {
      // Récupérer session actuelle puis mettre à jour avec SessionManager
      const session = await this.sessionManager.getSession(phoneNumber);
      if (!session) {
        console.error('❌ [RestaurantDiscovery] Session introuvable pour updateSessionWithRestaurants');
        throw new Error('Session introuvable');
      }

      await this.sessionManager.updateSession(session.id, {
        botState: 'SELECTING_FROM_LIST',
        sessionData: {
          ...session.sessionData, // Préserver données existantes
          availableRestaurants: restaurants,
          selectionMode: mode,
          userLocation: userLocation || null
        }
      });
        
    } catch (error) {
      console.error('❌ [RestaurantDiscovery] Erreur updateSessionWithRestaurants:', error);
      throw error;
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