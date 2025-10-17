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

  /**
   * Obtenir l'heure actuelle dans le bon fuseau horaire du restaurant
   * ✅ Version finale avec support multi-timezone
   */
  private getCurrentTime(): Date {
    // Utiliser le contexte restaurant si disponible
    if (this.currentRestaurantContext) {
      return this.currentRestaurantContext.getCurrentTime();
    }

    // Fallback sur Europe/Paris si pas de contexte
    const timezone = 'Europe/Paris';
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

    // Parsing du format DD/MM/YYYY HH:mm:ss
    const parts = formatted.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (parts) {
      const [, day, month, year, hour, minute, second] = parts;
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );
    }

    // Fallback UTC si parsing échoue
    return utcNow;
  }
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
  private restaurantConfig: RestaurantConfig | null = null;
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
    this.orderService = new OrderService(
      this.supabaseUrl,
      this.supabaseKey,
      this.getCurrentTime.bind(this)
    );
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
      this.messageSender as any, // WhatsAppNotificationFranceService compatible
      this.getCurrentTime.bind(this)
    );
    
    // Initialiser le service de découverte des restaurants
    this.restaurantDiscoveryService = new RestaurantDiscoveryService(
      this.supabaseUrl,
      this.supabaseKey
    );
  }

  /**
   * 💰 Formate un prix selon la devise du restaurant configuré avec séparateurs
   */
  private formatPrice(amount: number): string {
    console.log(`💰 [FormatPrice] Montant: ${amount}, Config: ${this.restaurantConfig?.currency || 'undefined'}`);

    if (!this.restaurantConfig?.currency) return `${amount}€`;

    switch (this.restaurantConfig.currency) {
      case 'EUR':
        return `${amount}€`;
      case 'GNF':
        return `${amount.toLocaleString('fr-FR')} GNF`;
      case 'XOF':
        return `${amount.toLocaleString('fr-FR')} FCFA`;
      default:
        return `${amount}€`;
    }
  }

  /**
   * 💰 Récupère le symbole de devise du restaurant configuré (pour compatibilité)
   */
  private getCurrencySymbol(): string {
    if (!this.restaurantConfig?.currency) return '€';

    switch (this.restaurantConfig.currency) {
      case 'EUR': return '€';
      case 'GNF': return ' GNF';
      case 'XOF': return ' FCFA';
      default: return '€';
    }
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
      // NOUVEAU: Détection partage position GPS
      if (message.startsWith('GPS:')) {
        await this.handleGpsLocationReceived(phoneNumber, message);
        return;
      }

      // PRIORITÉ 1: Détection numéro téléphone restaurant (accès QR code)
      const isPhone = this.isPhoneNumberFormat(message);
      
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

      // PRIORITÉ 2.5: Détection mot-clé "resto" (AVANT vérification session)
      if (message.toLowerCase().trim() === 'resto') {
        await this.handleRestoCommand(phoneNumber);
        return;
      }

      // TEST HORAIRE - Commande temporaire pour vérifier timezone
      // COMMENTÉ - Test validé le 2025-10-08
      // if (message.toLowerCase().trim() === 'testhoraire') {
      //   await this.handleTestHoraireCommand(phoneNumber);
      //   return;
      // }

      // PRIORITÉ 3: Messages classiques (salut/bonjour) - Menu générique
      if (message.toLowerCase().includes('salut') || message.toLowerCase().includes('bonjour')) {
        await this.handleGenericGreeting(phoneNumber);
        return;
      }

      // PRIORITÉ 3.5: Gestion des réponses RGPD (OK/NON)
      if (message.toLowerCase().trim() === 'ok' || message.toLowerCase().trim() === 'non') {
        // Vérifier si un workflow est en attente de consentement
        const supabase = await this.getSupabaseClient();
        const { data: pendingWorkflow } = await supabase
          .from('france_gdpr_consents')
          .select('pending_workflow')
          .eq('phone_number', phoneNumber)
          .maybeSingle();

        if (pendingWorkflow && pendingWorkflow.pending_workflow) {
          // Workflow en attente → Traiter comme réponse à l'écran RGPD
          await this.handleGDPRConsent(phoneNumber, message);
          return;
        }
      }

      // PRIORITÉ 4: Gestion complète des messages selon l'état de session

      // ANTI-SESSION PARASITE : Vérifier existence session AVANT getSession()
      const sessionExists = await this.sessionManager.checkSessionExists(phoneNumber);


      if (!sessionExists &&
          message.toLowerCase() !== 'resto' &&
          !this.isPhoneNumber(message)) {


        await this.messageSender.sendMessage(phoneNumber,
          `⏰ *SESSION EXPIRÉE !*

📝 Votre temps pour ajouter une note est terminé
🕐 Les notes doivent être envoyées dans les 5 minutes

🎯 *Que faire maintenant ?*
🍕 Tapez *"resto"* → Voir tous les restaurants
🔢 Tapez *le numéro du resto* → Accéder directement
📞 Besoin d'aide ? Contactez le restaurant`
        );

        return; // Arrêter le traitement - PAS de session créée
      }

      // Maintenant on peut récupérer la session en sécurité
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


      if (session && (session.restaurantId || session.botState === 'CHOOSING_RESTAURANT_MODE')) {
        // L'utilisateur a une session active avec restaurant sélectionné
        // Charger le contexte restaurant seulement si ID restaurant valide
        if (session.restaurantId) {
          await this.loadAndSetRestaurantContext(session.restaurantId);
        }
        
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
   * Vérifie si un workflow peut se déclencher dans la catégorie actuelle
   * SÉCURITÉ : Empêche les workflows pizza hors contexte pizza
   */
  private isWorkflowAllowedInCurrentContext(
    workflowId: string,
    session: BotSession
  ): boolean {
    // Récupérer la catégorie actuelle
    const currentCategoryId = session.sessionData?.currentCategoryId ||
                             session.sessionData?.selectedCategoryId;

    // Si pas de catégorie, on est dans le menu principal = OK
    if (!currentCategoryId) {
      return true; // Permettre dans menu principal
    }

    // Trouver le slug de la catégorie
    const categories = session.sessionData?.categories || [];
    const currentCategory = categories.find((c: any) => c.id === currentCategoryId);
    const categorySlug = currentCategory?.slug || '';

    // RÈGLE SIMPLE : Workflows MENU_X uniquement dans pizza/menu
    const isPizzaWorkflow = workflowId.startsWith('MENU_');
    const isPizzaCategory = categorySlug.includes('pizza') ||
                            categorySlug.includes('menu');

    // Si workflow pizza, doit être dans catégorie pizza
    if (isPizzaWorkflow && !isPizzaCategory) {
      console.log(`🚫 [SÉCURITÉ] ${workflowId} bloqué dans catégorie "${categorySlug}"`);
      return false;
    }

    return true;
  }

  /**
   * Vérifier si un workflow doit être déclenché
   */
  private async shouldTriggerWorkflow(
    workflow: WorkflowDefinition,
    message: string,
    session: BotSession
  ): Promise<boolean> {

    console.log(`🔍 [WORKFLOW] Vérification ${workflow.workflowId} pour message "${message}"`);

    // NOUVELLE SÉCURITÉ : Vérifier le contexte AVANT tout
    if (!this.isWorkflowAllowedInCurrentContext(workflow.workflowId, session)) {
      return false;
    }

    // Garder la logique existante mais simplifiée
    if (workflow.workflowId === 'MENU_1_WORKFLOW' && message === '1') {
      console.log(`✅ [WORKFLOW] MENU_1_WORKFLOW activé`);
      return true;
    }
    if (workflow.workflowId === 'MENU_2_WORKFLOW' && message === '2') {
      console.log(`✅ [WORKFLOW] MENU_2_WORKFLOW activé`);
      return true;
    }
    if (workflow.workflowId === 'MENU_3_WORKFLOW' && message === '3') {
      console.log(`✅ [WORKFLOW] MENU_3_WORKFLOW activé`);
      return true;
    }
    if (workflow.workflowId === 'MENU_4_WORKFLOW' && message === '4') {
      console.log(`✅ [WORKFLOW] MENU_4_WORKFLOW activé`);
      return true;
    }

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
      // Essayer différents formats de normalisation
      const formats = [
        phoneNumber, // Format original (ex: 0177123456)
        `+33${phoneNumber.substring(1)}`, // Format international (ex: +330177123456)
        `33${phoneNumber.substring(1)}` // Format sans + (ex: 330177123456)
      ];
      
      const supabase = await this.getSupabaseClient();

      for (const format of formats) {
        const { data: restaurant, error } = await supabase
          .from('france_restaurants')
          .select('*')
          .or(`phone.eq.${format},whatsapp_number.eq.${format}`)
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

        // 💰 Charger la configuration restaurant pour la devise
        console.log(`💰 [Currency] Chargement config restaurant ${restaurantId} pour devise...`);
        try {
          this.restaurantConfig = await this.configManager.getConfig(restaurantId);
          console.log(`✅ [Currency] Config chargée - Devise: ${this.restaurantConfig.currency}`);
        } catch (configError) {
          console.error(`❌ [Currency] Erreur chargement config:`, configError);
          this.restaurantConfig = null;
        }
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
      // ✅ RGPD : Vérifier le consentement AVANT toute action
      const hasGdprConsent = await this.checkGdprConsent(phoneNumber);

      if (!hasGdprConsent) {
        // Pas de consentement → Stocker le contexte en base avec le restaurant et afficher l'écran
        await this.savePendingWorkflow(phoneNumber, { type: 'direct_access', restaurant });
        await this.showGdprConsentScreen(phoneNumber);
        return; // Arrêter le traitement
      }

      // ✅ Consentement validé → Continuer le workflow normal
      // VÉRIFICATION DES HORAIRES avec le service dédié
      const scheduleResult = this.scheduleService.checkRestaurantSchedule(restaurant);
      
      if (!scheduleResult.isOpen) {
        // Restaurant fermé - Utiliser le service pour générer le message
        const closedMessage = this.scheduleService.getScheduleMessage(scheduleResult, restaurant.name);
        await this.messageSender.sendMessage(phoneNumber, closedMessage);
        return;
      }
      
      // Premier message : Bienvenue personnalisé
      const welcomeMessage = `🇫🇷 Bonjour ! Bienvenue chez ${restaurant.name} !\n🍕 ${restaurant.description || 'Découvrez notre délicieux menu'}\n📍 ${restaurant.address || 'Restaurant disponible'}`;
      await this.messageSender.sendMessage(phoneNumber, welcomeMessage);
      
      // Charger les modes de livraison disponibles depuis la base de données
      const availableModes = await this.deliveryModesService.getAvailableModes(restaurant.id);

      // Deuxième message : Choix du mode de livraison (dynamique)
      const deliveryModeMessage = this.deliveryModesService.formatModesMessage(availableModes);
      await this.messageSender.sendMessage(phoneNumber, deliveryModeMessage);

      // ⚡ DÉFINIR LE CONTEXTE RESTAURANT AVANT TOUTE OPÉRATION DE SESSION
      this.setRestaurantContext(restaurant);

      // 🎯 [STEP1] Suppression des sessions existantes
      console.log('🎯 [STEP1] Suppression sessions utilisateur existantes...');
      try {
        await this.sessionManager.deleteSessionsByPhone(phoneNumber);
        console.log('✅ [STEP1] Sessions supprimées avec succès');
      } catch (deleteError) {
        console.error('🚨 [DEBUG_RESTAURANT_ACCESS] === STEP1 ÉCHEC ===');
        console.error('❌ [STEP1] Erreur suppression sessions:', deleteError);
        console.error('🚨 [DEBUG_RESTAURANT_ACCESS] deleteError.message:', deleteError?.message);
        console.error('🚨 [DEBUG_RESTAURANT_ACCESS] deleteError.stack:', deleteError?.stack);
        throw deleteError;
      }
      
      // 🎯 [STEP2] Création nouvelle session restaurant
      console.log('🎯 [STEP2] Création nouvelle session restaurant...');
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
      } catch (createError) {
        console.error('❌ [STEP2] Erreur création session:', createError);
        throw createError;
      }

    } catch (error) {
      console.error('❌ [DirectAccess] Erreur détaillée:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
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
      const expiresAt = new Date(this.getCurrentTime().getTime() + SESSION_DURATION_MINUTES * 60 * 1000); // 4 heures depuis heure Paris
      
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


    switch (session.botState) {
      case 'AWAITING_GEOLOCATION':
        // NOUVEAU: Gestion de la géolocalisation pour livraison (Guinée)
        await this.handleGeolocationSharing(phoneNumber, session, message);
        break;

      case 'POST_ORDER_NOTES':
        // Gestion des notes post-commande
        if (this.getCurrentTime().getTime() > session.sessionData?.expiresAt) {
          await this.deleteSession(phoneNumber);
          return;
        }

        if (message.toLowerCase().includes('annuler')) {
          await this.deleteSession(phoneNumber);
          return; // Laisse handler annulation traiter
        }

        if (message.toLowerCase() === 'resto') {
          await this.deleteSession(phoneNumber);
          return; // Continue workflow normal
        }

        await this.handlePostOrderNote(phoneNumber, session, message);
        return;

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
        
      case 'MENU_PIZZA_WORKFLOW':
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

      case 'AWAITING_GPS_LOCATION':
        await this.handleGpsLocationShare(phoneNumber, session, message);
        break;

      case 'AWAITING_GPS_LABEL':
        await this.handleGpsLabelChoice(phoneNumber, session, message);
        break;

      case 'AWAITING_GPS_CUSTOM_LABEL':
        await this.handleGpsCustomLabel(phoneNumber, session, message);
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
        await this.handleRestaurantModeSelection(phoneNumber, session, message);
        break;

      case 'AWAITING_USER_LOCATION':
        await this.handleLocationMessage(phoneNumber, session, message);
        break;
        
      case 'SELECTING_FROM_LIST':
        await this.handleRestaurantSelection(phoneNumber, session, message);
        break;
        
      default:
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
    console.log(`🚨 [TRACE_FONCTION_L1133] showMenuAfterDeliveryModeChoice APPELÉE - UniversalBot.ts:1133`);
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
      
      // ✅ CORRUPTION FIX: Parser le JSON si c'est un string avant le spread
      const sessionData = typeof session.sessionData === 'string' ? JSON.parse(session.sessionData) : session.sessionData;
      
      const updatedData = {
        ...sessionData,
        categories: categories,
        deliveryMode: deliveryMode,
        selectedServiceMode: deliveryMode, // NOUVEAU: Ajout pour validation rayon
        cart: sessionData?.cart || {},
        totalPrice: sessionData?.totalPrice || 0,
        // NETTOYAGE COMPLET DES DONNÉES PIZZA
        pizzaOptionsMap: undefined,
        totalPizzaOptions: undefined,
        menuPizzaWorkflow: undefined
      };

      // 🚨 LOG CRITIQUE - Confirmer le nettoyage
      console.log(`🚨 [TRACE_FONCTION_L1192] showMenuAfterDeliveryModeChoice NETTOIE les données pizza !`);
      console.log(`🚨 [TRACE_FONCTION_L1193] Avant nettoyage - pizzaOptionsMap: ${sessionData?.pizzaOptionsMap ? 'EXISTS' : 'UNDEFINED'}`);
      console.log(`🚨 [TRACE_FONCTION_L1194] Avant nettoyage - menuPizzaWorkflow: ${sessionData?.menuPizzaWorkflow ? 'EXISTS' : 'UNDEFINED'}`);
      console.log(`🚨 [TRACE_FONCTION_L1195] Après nettoyage - pizzaOptionsMap: ${updatedData.pizzaOptionsMap ? 'EXISTS' : 'UNDEFINED'}`);
      console.log(`🚨 [TRACE_FONCTION_L1196] Après nettoyage - menuPizzaWorkflow: ${updatedData.menuPizzaWorkflow ? 'EXISTS' : 'UNDEFINED'}`);
      
      console.log(`✅ [SESSION] Données session mises à jour:`, {
        deliveryMode: updatedData.deliveryMode,
        selectedServiceMode: updatedData.selectedServiceMode,
        hasCategories: !!updatedData.categories,
        cartItems: Object.keys(updatedData.cart || {}).length
      });
      
      // ✅ CORRECTION: Ne pas changer bot_state ici car c'est après handleDeliveryModeChoice
      // bot_state sera mis à jour vers VIEWING_MENU une fois que l'utilisateur aura fait son choix
      console.log('📝 [UPDATE_SESSION_04] UniversalBot ligne 1153 - CRITIQUE');
      await this.sessionManager.updateSession(session.id, {
        botState: 'VIEWING_MENU', // ✅ CORRECTION: Reset du bot_state pour sortir du workflow pizza
        currentStep: null, // ✅ CORRECTION: Reset du current_step
        sessionData: updatedData,  // ✅ CORRECTION FINALE: Passer l'objet directement, SessionManager gère JSON.stringify
        // 🚨 [TRACE_FONCTION_L1251] FIX PIZZA BUG: NETTOYER AUSSI workflowData !
        workflowData: {
          workflowId: '',
          currentStepId: '',
          stepHistory: [],
          selectedItems: {},
          validationErrors: [],
          // Nettoyer explicitement les données pizza de workflowData
          pizzaOptionsMap: undefined,
          totalPizzaOptions: undefined,
          menuPizzaWorkflow: undefined
        }
      });
    }
  }
  
  /**
   * Gérer la navigation dans les menus
   */
  private async handleMenuNavigation(phoneNumber: string, session: any, message: string): Promise<void> {
    console.log(`🔍 [handleMenuNavigation] Message reçu: "${message}"`);
    console.log(`🔍 [handleMenuNavigation] Message trimmed: "${message.trim()}"`);

    // 🔍 DEBUG_CART_NAVIGATION - Tracer l'état du panier lors de la navigation
    console.log('🔍 DEBUG_CART_NAVIGATION: session.sessionData.cart:', JSON.stringify(session.sessionData?.cart));
    console.log('🔍 DEBUG_CART_NAVIGATION: Type cart:', typeof session.sessionData?.cart);

    // Sélection de catégorie par numéro
    const categoryNumber = parseInt(message.trim());
    const categories = session.sessionData?.categories || [];
    
    console.log(`🔍 [handleMenuNavigation] Numéro parsé: ${categoryNumber}`);
    console.log(`🔍 [handleMenuNavigation] Nombre de catégories: ${categories.length}`);
    console.log(`🔍 [handleMenuNavigation] Categories disponibles:`, categories.map((cat: any, index: number) => `${index + 1}: ${cat.name}`));
    console.log(`🔍 [handleMenuNavigation] État de session: ${session.botState}`);
    console.log(`🔍 [handleMenuNavigation] Session data keys:`, Object.keys(session.sessionData || {}));
    
    // Vérifier incohérence d'état
    if (session.botState !== 'VIEWING_MENU') {
      console.error(`❌ [handleMenuNavigation] INCOHÉRENCE DÉTECTÉE ! handleMenuNavigation appelé mais état = ${session.botState}`);
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
    console.log(`🚨 [TRACE_FONCTION_L1265] handleCategoryNavigation APPELÉE - UniversalBot.ts:1265`);
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

    // 🚨 DEBUG CRITIQUE - Analyser l'état de la session quand on tape "2"
    console.log(`🚨 [TRACE_FONCTION_L1300] handleProductSelection - Message: "${message}"`);
    console.log(`🚨 [TRACE_FONCTION_L1301] handleProductSelection - bot_state: ${session.botState}`);
    console.log(`🚨 [TRACE_FONCTION_L1302] handleProductSelection - pizzaOptionsMap: ${session.sessionData?.pizzaOptionsMap ? 'EXISTS' : 'UNDEFINED'}`);
    console.log(`🚨 [TRACE_FONCTION_L1303] handleProductSelection - menuPizzaWorkflow: ${session.sessionData?.menuPizzaWorkflow ? 'EXISTS' : 'UNDEFINED'}`);
    console.log(`🚨 [TRACE_FONCTION_L1304] handleProductSelection - currentCategoryId: ${session.sessionData?.currentCategoryId}`);

    
    // RÉUTILISATION: Vérifier les actions rapides 99, 00 avant parseInt
    const choice = message.trim();
    if (choice === '99' || choice === '00') {
      console.log(`⚡ [ProductSelection] Action rapide détectée: ${choice} - Délégation à handleCartActions`);
      await this.handleCartActions(phoneNumber, session, message);
      return;
    }

    // Détection multisélection
    if (message.includes(',')) {
      await this.handleCategoryMultiSelection(phoneNumber, session, message);
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

    // 🚨 DEBUG CRITIQUE - Analyser le mode pizza
    console.log(`🔍 [DEBUG_PIZZA] hasPizzaMap: ${!!hasPizzaMap}`);
    if (hasPizzaMap) {
      console.log(`🔍 [DEBUG_PIZZA] pizzaOptionsMap content:`, JSON.stringify(hasPizzaMap, null, 2));
    }

    if (hasPizzaMap) {
      maxValidChoice = session.sessionData?.totalPizzaOptions || session.workflowData?.totalPizzaOptions || products.length;
      console.log(`🍕 [ProductSelection] Mode pizza unifié - Accepte jusqu'à ${maxValidChoice}`);
      console.log(`🚨 [DEBUG_PIZZA] ATTENTION: Mode pizza activé dans une catégorie qui pourrait ne pas être pizza !`);
    }
    
    if (isNaN(productNumber) || productNumber < 1 || productNumber > maxValidChoice) {
      console.log(`❌ [ProductSelection] Choix invalide: ${productNumber} (max: ${maxValidChoice})`);
      await this.messageSender.sendMessage(phoneNumber, 
        `❌ Choix invalide. Choisissez entre 1 et ${maxValidChoice}.\n↩️ Tapez 0 pour revenir au menu.`);
      return;
    }
    

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
        
        // Démarrage workflow composite
        
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
    
    // Workflow simple (non-composite)
    
    // Créer session temporaire avec selectedProduct
    const tempSession = {
      ...session,
      sessionData: (() => {
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
    console.log(`🚨 [TRACE_FONCTION_L1538] showProductsInCategory APPELÉE - UniversalBot.ts:1538`);
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

      // DEBUG: Vérifier les icônes récupérées de la base
      products.forEach(product => {
        if (product.name.includes('TACOS')) {
          console.log(`🔍 [DEBUG_SQL_TACOS] Produit récupéré de la base:`);
          console.log(`🔍 [DEBUG_SQL_TACOS] - ID: ${product.id}`);
          console.log(`🔍 [DEBUG_SQL_TACOS] - Name: ${product.name}`);
          console.log(`🔍 [DEBUG_SQL_TACOS] - Icon: "${product.icon}" (${typeof product.icon})`);
          console.log(`🔍 [DEBUG_SQL_TACOS] - All keys:`, Object.keys(product));
        }
      });
      
      // 3. NOUVEAU : Vérifier si cette catégorie doit utiliser l'affichage unifié
      // Charger la config du restaurant si nécessaire
      await this.pizzaDisplayService.loadRestaurantConfig(restaurant.id);

      // 🚨 DEBUG CRITIQUE - Analyser l'affichage unifié pizza
      console.log(`🔍 [DEBUG_PIZZA_CATEGORY] Catégorie analysée: "${category.slug}"`);
      console.log(`🔍 [DEBUG_PIZZA_CATEGORY] Nom catégorie: "${category.name}"`);
      const shouldUsePizza = this.pizzaDisplayService.shouldUseUnifiedDisplay(category.slug);
      console.log(`🚨 [TRACE_FONCTION_L1594] shouldUseUnifiedDisplay("${category.slug}") = ${shouldUsePizza}`);
      console.log(`🚨 [TRACE_FONCTION_L1595] Configuration pizza pour category: ${category.slug}`);
      console.log(`🔍 [DEBUG_PIZZA_CATEGORY] Session avant traitement pizza:`, JSON.stringify({
        pizzaOptionsMap: session.sessionData?.pizzaOptionsMap ? 'EXISTS' : 'UNDEFINED',
        totalPizzaOptions: session.sessionData?.totalPizzaOptions,
        selectedCategoryId: session.sessionData?.selectedCategoryId,
        currentCategoryId: session.sessionData?.currentCategoryId
      }));

      if (shouldUsePizza) {
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
      } else {
        // Nettoyer les données pizza de la session pour les catégories non-pizza
        console.log(`🧹 [CLEANUP] Nettoyage données pizza pour catégorie: ${category.slug}`);

        const cleanedSessionData = {
          ...session.sessionData,
          pizzaOptionsMap: undefined,
          totalPizzaOptions: undefined,
          menuPizzaWorkflow: undefined
        };

        await this.sessionManager.updateSession(session.id, {
          sessionData: cleanedSessionData
        });
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
      
      // Si un seul produit et que le produit a une icône, utiliser l'icône du produit
      let categoryDisplayIcon = category.icon || '🍽️';
      if (products.length === 1 && products[0].icon) {
        categoryDisplayIcon = products[0].icon;
        console.log(`🔍 [DEBUG_CATEGORY_ICON] Single product with icon detected: ${products[0].name} -> ${products[0].icon}`);
      }

      let menuText = `${categoryDisplayIcon} *${category.name.toUpperCase()}*\n`;
      if (category.description) {
        menuText += `${category.description}\n`;
      }
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
            
            let selectedSize = sizeList[0];
            if (deliveryMode === 'livraison') {
              filteredPrices.push(selectedSize.price_delivery);
            } else {
              filteredPrices.push(selectedSize.price_on_site);
            }
          });
          
          // Calculer min/max sur les prix filtrés
          const minPrice = Math.min(...filteredPrices);
          const maxPrice = Math.max(...filteredPrices);
          
          console.log(`💰 [ShowProducts] Prix calculés pour ${product.name}:`, { minPrice, maxPrice, deliveryMode, filteredPrices });

          priceText = minPrice === maxPrice ? this.formatPrice(minPrice) : `${this.formatPrice(minPrice)} - ${this.formatPrice(maxPrice)}`;
          activePrice = minPrice;

          // Récupérer les vrais prix depuis la première taille (pas les prix filtrés)
          const firstSize = product.france_product_sizes[0];
          priceOnSite = firstSize.price_on_site;
          priceDelivery = firstSize.price_delivery;
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

            priceText = minPrice === maxPrice ? this.formatPrice(minPrice) : `${this.formatPrice(minPrice)} - ${this.formatPrice(maxPrice)}`;
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
          priceText = this.formatPrice(activePrice);
        } else if (product.price_on_site_base) {
          // Produit avec prix sur place/livraison séparés - AFFICHER UNIQUEMENT le prix du mode
          console.log(`📦 [ShowProducts] ${product.name} utilise price_on_site_base: ${product.price_on_site_base}€ / delivery: ${product.price_delivery_base}€`);
          priceOnSite = product.price_on_site_base;
          priceDelivery = product.price_delivery_base || product.price_on_site_base + 1;
          activePrice = deliveryMode === 'livraison' ? priceDelivery : priceOnSite;
          priceText = this.formatPrice(activePrice);
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
      
      const cart = session.sessionData?.cart || {};
      // CONVERSION SÉCURISÉE : Si c'est un objet, convertir en array. Si déjà array, garder tel quel
      const cartArray = Array.isArray(cart) ? cart : Object.values(cart);
      const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;
      const deliveryMode = session.sessionData?.deliveryMode;


      if (!cartArray || cartArray.length === 0) {
        await this.messageSender.sendMessage(phoneNumber, '❌ Votre panier est vide. Ajoutez des produits avant de commander.');
        return;
      }
      
      if (!restaurantId) {
        console.error(`❌ RESTAURANT NON SÉLECTIONNÉ - restaurantId: ${restaurantId}`);
        console.error(`❌ Alternative session.restaurant_id: ${session.restaurant_id}`);
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

    const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;
    const cleanPhone = phoneNumber.replace('@c.us', '');

    // Récupérer config resto
    const deliveryAddressMode = await this.addressService.getDeliveryAddressMode(restaurantId);
    console.log(`🔧 [AddressWorkflow] Mode de collecte: ${deliveryAddressMode}`);

    // Récupérer adresses existantes (GPS OU Texte selon config)
    const existingAddresses = await this.addressService.getCustomerAddresses(cleanPhone);
    console.log(`📍 [AddressWorkflow] ${existingAddresses.length} adresses trouvées`);

    if (existingAddresses.length > 0) {
      // ✅ Client a des adresses → Afficher liste avec format moderne
      let message = `📍 Vos adresses enregistrées :\n\n`;

      existingAddresses.forEach((addr, index) => {
        // Séparateur visuel
        message += `━━━━━━━━━━━━━━━━━━━━━\n`;

        // Emoji numéroté
        const numberEmoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][index] || `${index + 1}️⃣`;

        // Emoji selon le type d'adresse
        let typeEmoji = '🏠';
        if (addr.address_label.toLowerCase().includes('bureau')) {
          typeEmoji = '🏢';
        }

        // Nom en majuscules avec badge favori
        const labelUpper = addr.address_label.toUpperCase();
        const favoriteTag = addr.is_default ? ' ⭐ FAVORI' : '';
        message += `${numberEmoji} ${typeEmoji} ${labelUpper}${favoriteTag}\n`;

        // Parser l'adresse pour séparer rue et ville/code postal
        const addressParts = addr.full_address.split(',');
        if (addressParts.length >= 2) {
          const street = addressParts[0].trim();
          const cityPostal = addressParts.slice(1).join(',').trim();
          message += `📍 ${street}\n`;
          message += `📮 ${cityPostal}\n\n`;
        } else {
          // Fallback si format non standard
          message += `📍 ${addr.full_address}\n\n`;
        }
      });

      const nextNum = existingAddresses.length + 1;
      const nextNumberEmoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][nextNum - 1] || `${nextNum}️⃣`;
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;

      // Option selon config resto
      if (deliveryAddressMode === 'geolocation') {
        message += `${nextNumberEmoji} 📍 Partager ma position\n\n`;
      } else {
        message += `${nextNumberEmoji} ➕ Nouvelle adresse\n\n`;
      }

      message += `💡 Tapez le numéro de votre choix`;

      await this.messageSender.sendMessage(phoneNumber, message);

      await this.sessionManager.updateSession(session.id, {
        botState: 'AWAITING_ADDRESS_CHOICE',
        sessionData: {
          ...session.sessionData,
          existingAddresses: existingAddresses,
          showGpsOption: deliveryAddressMode === 'geolocation'
        }
      });

    } else {
      // ✅ Première adresse
      if (deliveryAddressMode === 'geolocation') {
        await this.messageSender.sendMessage(phoneNumber,
          '📍 *Première livraison !*\n\n📍 *ENVOYEZ VOTRE POSITION GPS*\n\n🔹 Cliquez 📎 → Localisation\n🔹 Attendez 10s (stabilisation)\n🔹 Vérifiez précision ≤ 50m\n🔹 "Envoyer localisation actuelle"\n\n❌ Évitez: Position en direct / Lieux suggérés'
        );

        await this.sessionManager.updateSession(session.id, {
          botState: 'AWAITING_GPS_LOCATION',
          sessionData: session.sessionData
        });
      } else {
        await this.messageSender.sendMessage(phoneNumber,
          '📍 *Première livraison !*\n\n📝 *Saisissez votre adresse complète*\n\n💡 *Exemple : 15 rue de la Paix, 75001 Paris*'
        );

        await this.sessionManager.updateSession(session.id, {
          botState: 'AWAITING_NEW_ADDRESS',
          sessionData: session.sessionData
        });
      }
    }
  }

  /**
   * Traiter la commande avec le mode sélectionné
   * SOLID - Délégue la logique métier au service dédié
   */
  private async processOrderWithMode(phoneNumber: string, session: any, deliveryMode: string): Promise<void> {
    try {
      const cart = session.sessionData?.cart || {};
      // CONVERSION SÉCURISÉE : Si c'est un objet, convertir en array. Si déjà array, garder tel quel
      const cartArray = Array.isArray(cart) ? cart : Object.values(cart);
      // CORRECTION: Même logique de fallback que pour les commandes
      const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;

      // Déléguer la création au service dédié
      const order = await this.orderService.createOrderWorkflow(
        phoneNumber,
        cartArray,  // Passer l'array converti
        restaurantId,
        deliveryMode
      );
      
      // Récupérer le nom du restaurant pour le message
      const restaurantName = await this.getRestaurantName(restaurantId);
      
      // Envoyer la confirmation
      const confirmationMessage = this.orderService.buildOrderConfirmationMessage(
        order,
        restaurantName,
        deliveryMode,
        null,
        this.restaurantConfig?.currency || 'EUR'
      );

      await this.messageSender.sendMessage(phoneNumber, confirmationMessage);

      // Notification au restaurant
      await this.sendRestaurantNotification(order, session.restaurantId, phoneNumber);

      // Supprimer l'ancienne session AVANT de créer la nouvelle
      await this.deleteSession(phoneNumber);

      // Créer session pour notes post-commande
      await this.createPostOrderNotesSession(phoneNumber, order, session.restaurantId);
      
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
      const text = message.trim();
      const existingAddresses = session.sessionData?.existingAddresses || [];
      const showGpsOption = session.sessionData?.showGpsOption || false;

      // ✅ Choix adresse existante
      if (choice >= 1 && choice <= existingAddresses.length) {
        const selectedAddress = existingAddresses[choice - 1];
        console.log(`📍 [AddressChoice] Adresse sélectionnée: ${selectedAddress.address_label}`);

        // Mettre à jour dernière utilisée = défaut
        await this.updateDefaultAddress(phoneNumber, selectedAddress.id);

        // Traiter la commande avec cette adresse
        await this.processOrderWithAddress(phoneNumber, session, selectedAddress);
        return;
      }

      // ✅ Partage position (SI option disponible en mode geolocation)
      if (showGpsOption && choice === existingAddresses.length + 1) {
        await this.messageSender.sendMessage(phoneNumber,
          '📍 *ENVOYEZ VOTRE POSITION GPS*\n\n🔹 Cliquez 📎 → Localisation\n🔹 Attendez 10s (stabilisation)\n🔹 Vérifiez précision ≤ 50m\n🔹 "Envoyer localisation actuelle"\n\n❌ Évitez: Position en direct / Lieux suggérés'
        );

        await this.sessionManager.updateSession(session.id, {
          botState: 'AWAITING_GPS_LOCATION',
          sessionData: session.sessionData
        });
        return;
      }

      // ✅ Nouvelle adresse (SI option disponible en mode address)
      if (!showGpsOption && choice === existingAddresses.length + 1) {
        await this.messageSender.sendMessage(phoneNumber,
          '📝 *Saisissez votre nouvelle adresse complète*\n\n💡 *Exemple : 15 rue de la Paix, 75001 Paris*'
        );

        await this.sessionManager.updateSession(session.id, {
          botState: 'AWAITING_NEW_ADDRESS',
          sessionData: session.sessionData
        });
        return;
      }

      // ✅ Saisie directe adresse (texte libre - non numérique)
      if (isNaN(choice) && text.length >= 10) {
        // Réutiliser le workflow existant
        await this.handleNewAddressInput(phoneNumber, session, text);
        return;
      }

      // Choix invalide - Toujours +1 pour la dernière option (GPS ou Nouvelle adresse)
      const maxChoice = existingAddresses.length + 1;
      await this.messageSender.sendMessage(phoneNumber,
        `❌ Choix invalide. Tapez un numéro entre 1 et ${maxChoice}\nOu tapez votre adresse directement`
      );

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

      // NOUVEAU: Gestion code "99" pour voir les adresses enregistrées
      if (addressText === '99') {
        await this.handleAddressListRequest(phoneNumber, session);
        return;
      }

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
        is_default: existingAddresses.length === 0,
        address_type: address.place_id ? 'text' : 'geolocation' // NOUVEAU: Type selon source
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
      const cart = session.sessionData?.cart || {};
      // CONVERSION SÉCURISÉE : Si c'est un objet, convertir en array. Si déjà array, garder tel quel
      const cartArray = Array.isArray(cart) ? cart : Object.values(cart);
      // CORRECTION: Même logique de fallback que pour les commandes
      const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;

      // Déléguer la création au service dédié
      const order = await this.orderService.createOrderWorkflow(
        phoneNumber,
        cartArray,  // Passer l'array converti
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
        address,
        this.restaurantConfig?.currency || 'EUR'
      );

      await this.messageSender.sendMessage(phoneNumber, confirmationMessage);

      // Notification au restaurant
      await this.sendRestaurantNotification(order, restaurantId, phoneNumber);

      // Supprimer l'ancienne session AVANT de créer la nouvelle
      await this.deleteSession(phoneNumber);

      // Créer session pour notes post-commande
      await this.createPostOrderNotesSession(phoneNumber, order, restaurantId);

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
   * Envoyer notification WhatsApp au restaurant
   */
  private async sendRestaurantNotification(
    order: any,
    restaurantId: number,
    customerPhone: string
  ): Promise<void> {
    try {
      console.log(`🔔 [RestaurantNotif] Envoi notification resto ID: ${restaurantId}`);

      // Récupérer le whatsapp_number du restaurant
      const supabase = await this.getSupabaseClient();
      const { data: restaurant } = await supabase
        .from('france_restaurants')
        .select('whatsapp_number')
        .eq('id', restaurantId)
        .single();

      if (!restaurant?.whatsapp_number) {
        console.warn('⚠️ [RestaurantNotif] Pas de whatsapp_number pour le resto');
        return;
      }

      // Construire le message
      const message = this.orderService.buildRestaurantNotificationMessage(
        order,
        customerPhone,
        this.restaurantConfig?.currency || 'EUR'
      );

      // Envoyer la notification
      await this.messageSender.sendMessage(restaurant.whatsapp_number, message);
      console.log(`✅ [RestaurantNotif] Notification envoyée au resto`);

    } catch (error) {
      console.error('❌ [RestaurantNotif] Erreur:', error);
      // Ne pas bloquer la commande si la notification échoue
    }
  }

  /**
   * Gérer les actions après configuration produit (1=Ajouter, 2=Recommencer, 0=Retour)
   */
  private async handleWorkflowActions(phoneNumber: string, session: any, message: string): Promise<void> {
    const startTime = Date.now();
    
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
    console.log(`📦 [QuantityInput] Message reçu: "${message}"`);

    console.log('🔍 DEBUG_QUANTITY_INPUT_START: Entrée handleQuantityInput');
    console.log('🔍 DEBUG_QUANTITY_SESSION:', JSON.stringify(session.sessionData, null, 2));

    const quantity = parseInt(message.trim());
    const selectedProduct = session.sessionData?.selectedProduct;

    console.log('🔍 DEBUG_QUANTITY_PRODUCT:', JSON.stringify(selectedProduct, null, 2));
    console.log('🔍 DEBUG_QUANTITY_VALUE:', quantity);

    // Récupérer l'icône depuis les products en session si manquante
    if (selectedProduct && !selectedProduct.icon && session.sessionData?.products) {
      const fullProduct = session.sessionData.products.find(p => p.id === selectedProduct.id);
      if (fullProduct?.icon) {
        selectedProduct.icon = fullProduct.icon;
        console.log(`✅ [QuantityInput] Icône récupérée depuis session: ${fullProduct.icon} pour ${selectedProduct.name}`);
      }
    }

    // Traitement quantité pour workflow simple


    if (!selectedProduct) {
      console.error('❌ [QuantityInput] Pas de produit sélectionné');
      console.log('🔍 DEBUG_QUANTITY_NO_PRODUCT: selectedProduct est null/undefined');
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
    const basePrice = selectedProduct.price * quantity;


    // Les suppléments sont déjà inclus dans selectedProduct.price (calculés dans CompositeWorkflowExecutor)
    // Pas besoin de recalculer ici pour éviter le double comptage
    let supplementsPrice = 0;


    const totalPrice = basePrice + supplementsPrice;
    
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
    

    // 🔍 DEBUG_CART_CONVERSION - Tracer la conversion du panier
    console.log('🔍 DEBUG_CART_CONVERSION: Type rawCart:', typeof session.sessionData?.cart);
    console.log('🔍 DEBUG_CART_CONVERSION: rawCart contenu:', JSON.stringify(session.sessionData?.cart));
    console.log('🔍 DEBUG_CART_CONVERSION: Array.isArray(rawCart):', Array.isArray(session.sessionData?.cart));

    // Ajouter au panier
    const rawCart = session.sessionData?.cart || [];
    const cart = Array.isArray(rawCart)
      ? rawCart
      : (rawCart && typeof rawCart === 'object' ? Object.values(rawCart).map(item => {
          console.log('🔍 DEBUG_ITEM_MAPPING: item original:', JSON.stringify(item));
          const mapped = {
            ...item,
            productName: item.productName || item.name,
            unitPrice: item.unitPrice || item.price,
            categoryName: item.categoryName || 'Menu',
            configuration: item.configuration || item.details
          };
          console.log('🔍 DEBUG_ITEM_MAPPING: item mappé:', JSON.stringify(mapped));
          return mapped;
        }) : []);

    console.log('🔍 DEBUG_CART_CONVERSION: cart après conversion:', JSON.stringify(cart));

    const cartItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      categoryName: await this.getCategoryNameFromProduct(selectedProduct.id)
                 || session.sessionData?.currentCategoryName
                 || 'ProduitTest',
      productDescription: productDescription,
      quantity: quantity,
      unitPrice: selectedProduct.price,
      totalPrice: totalPrice,
      icon: selectedProduct.icon || null,
      configuration: selectedProduct.configuration || null
    };

    // Dans handleQuantityInput, détecter la multisélection
    const multiProducts = session.sessionData?.multiSelectedProducts;
    if (multiProducts && multiProducts.length > 1) {
      // Ajouter TOUS les produits au panier en une fois
      const allCartItems = multiProducts.map(product => ({
        productId: product.id,
        productName: product.name,
        categoryName: session.sessionData?.currentCategoryName,
        productDescription: product.name,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
        icon: product.icon || null,
        configuration: null
      }));

      cart.push(...allCartItems);
    } else {
      // Logique existante pour produit unique
      cart.push(cartItem);
    }

    // Nettoyer les données de multisélection après usage
    delete session.sessionData.multiSelectedProducts;

    // Calculer le total du panier
    const cartTotal = cart.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    
    // Utiliser le formatter universel pour le message
    const { UniversalCartFormatter } = await import('../services/UniversalCartFormatter.ts');
    const formatter = new UniversalCartFormatter();
    
    // Formater le message avec le nouveau standard universel
    const confirmMessage = formatter.formatAdditionMessage(
      selectedProduct,
      cart,
      quantity,
      this.restaurantConfig?.currency || 'EUR'
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
   * Créer session pour notes post-commande
   */
  private async createPostOrderNotesSession(phoneNumber: string, order: any, restaurantId: number): Promise<void> {
    try {
      console.log(`💬 [PostOrderNotes] Création session notes pour commande: ${order.order_number}`);

      await this.sessionManager.createSessionForRestaurant(
        phoneNumber,
        { id: restaurantId },
        'POST_ORDER_NOTES',
        {
          orderId: order.id,
          orderNumber: order.order_number,
          expiresAt: this.getCurrentTime().getTime() + 5*60*1000 // 5 minutes
        }
      );

      // Message pour informer le client
      await this.messageSender.sendMessage(phoneNumber,
        `💬 *Besoin d'une précision ?*
📝 Vous avez *5 minutes* pour envoyer *UN SEUL* message
💡 Exemples : "sans oignons", "bien cuit", "code porte 1234"`
      );

    } catch (error) {
      console.error('❌ [PostOrderNotes] Erreur création session:', error);
    }
  }

  /**
   * Gérer l'ajout d'une note post-commande
   */
  private async handlePostOrderNote(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      const orderId = session.sessionData?.orderId;

      if (!orderId) {
        console.error('❌ [PostOrderNote] Pas d\'orderId dans session');
        await this.deleteSession(phoneNumber);
        return;
      }

      // Timestamp avec timezone Paris
      const timestamp = this.getCurrentTime().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Sauvegarder note avec horodatage
      const supabase = await this.getSupabaseClient();
      await supabase
        .from('france_orders')
        .update({
          additional_notes: `[${timestamp}] ${message}`,
          updated_at: this.getCurrentTime().toISOString()
        })
        .eq('id', orderId);

      // Confirmer et terminer
      await this.messageSender.sendMessage(phoneNumber,
        `✅ Note ajoutée à votre commande #${session.sessionData.orderNumber}\n\n` +
        `📝 "${message}"\n\n` +
        `Merci ! Le restaurant a bien reçu votre précision.`
      );

      // Supprimer session = terminé
      await this.deleteSession(phoneNumber);

    } catch (error) {
      console.error('❌ [PostOrderNote] Erreur:', error);
      await this.deleteSession(phoneNumber);
    }
  }

  /**
   * Vérifier si le message est un numéro de téléphone (7+ chiffres)
   */
  private isPhoneNumber(message: string): boolean {
    const cleanMessage = message.replace(/[\s\-\(\)\+]/g, '');
    const isNumeric = /^\d+$/.test(cleanMessage);
    return isNumeric && cleanMessage.length >= 7;
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
      console.log(`🔍 [CancellationFlow] current time:`, this.getCurrentTime());
      
      // Vérifier expiration
      const now = this.getCurrentTime();
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
   * NOUVEAU: Gérer le partage de géolocalisation pour la livraison
   */
  private async handleGeolocationSharing(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      console.log('📍 [GeolocationSharing] === DÉBUT GESTION GÉOLOCALISATION ===');

      // DEBUG: Afficher le format exact du message reçu
      console.log('🔍 [GeolocationSharing] DEBUG MESSAGE TYPE:', typeof message);
      console.log('🔍 [GeolocationSharing] DEBUG MESSAGE CONTENT:', JSON.stringify(message));
      console.log('🔍 [GeolocationSharing] DEBUG MESSAGE STRING:', String(message));

      // Vérifier si le message contient des coordonnées
      // Format Green API: GPS:latitude,longitude
      const locationMatch = message.match(/GPS:([\d.-]+),([\d.-]+)/i);

      if (locationMatch) {
        const latitude = parseFloat(locationMatch[1]);
        const longitude = parseFloat(locationMatch[2]);

        console.log(`✅ [GeolocationSharing] Coordonnées reçues: ${latitude}, ${longitude}`);

        // Créer la structure d'adresse pour saveNewAddressAndProcess (pas de double sauvegarde)
        const gpsAddress = {
          formatted_address: `Position GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          place_id: null,
          geometry: {
            location: {
              lat: latitude,
              lng: longitude
            }
          }
        };

        // Mettre à jour la session avec les coordonnées
        await this.sessionManager.updateSession(session.id, {
          sessionData: {
            ...session.sessionData,
            deliveryCoordinates: { latitude, longitude }
          }
        });

        // Suivre le même workflow que la saisie d'adresse normale
        await this.saveNewAddressAndProcess(phoneNumber, session, gpsAddress);

      } else {
        await this.messageSender.sendMessage(phoneNumber,
          '❌ Position non reçue. Merci de partager votre position ou tapez "annuler".'
        );
      }
    } catch (error) {
      console.error('❌ [GeolocationSharing] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber,
        '❌ Une erreur est survenue. Veuillez réessayer ou contacter le support.'
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
        const cart = session.sessionData?.cart || {};
        // CONVERSION SÉCURISÉE : Si c'est un objet, convertir en array. Si déjà array, garder tel quel
        const cartArray = Array.isArray(cart) ? cart : Object.values(cart);
        // CORRECTION: Même logique de fallback que pour les commandes
        const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;

        const order = await this.orderService.createOrderWorkflow(
          phoneNumber,
          cartArray,  // Passer l'array converti
          restaurantId,
          'a_emporter',
          null // Pas d'adresse pour emporter
        );
        
        const restaurantName = await this.getRestaurantName(restaurantId);
        const confirmationMessage = this.orderService.buildOrderConfirmationMessage(
          order,
          restaurantName,
          'a_emporter',
          null,
          this.restaurantConfig?.currency || 'EUR'
        );

        await this.messageSender.sendMessage(phoneNumber, confirmationMessage);

        // Notification au restaurant
        await this.sendRestaurantNotification(order, restaurantId, phoneNumber);

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
        addedAt: this.getCurrentTime().toISOString()
      });
      
      // Calculer le nouveau total
      const currentTotal = session.sessionData?.totalPrice || 0;
      const newTotal = currentTotal + pizzaOption.price;
      
      // Mettre à jour la session
      const updatedSessionData = {
        ...session.sessionData,
        cart: cart,
        totalPrice: newTotal,
        selectedProduct: null,
        awaitingQuantity: false,
        awaitingCartActions: true
      };

      await this.sessionManager.updateSession(session.id, {
        botState: 'AWAITING_CART_ACTIONS',
        sessionData: updatedSessionData
      });
      
      // Message de confirmation
      await this.messageSender.sendMessage(phoneNumber, 
        `✅ Ajouté au panier !\n🍕 ${pizzaOption.pizzaName} ${pizzaOption.sizeName}\n💰 ${this.formatPrice(pizzaOption.price)}\n\n` +
        `📊 Total panier: ${this.formatPrice(newTotal)}\n\n` +
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

    // Nom avec icônes - PHASE 2: Support icône produit avec fallback
    // ANCIEN CODE (commenté pour rollback si besoin) :
    // const cleanName = product.name.replace(/^[^\s]+\s/, ''); // Enlève emoji existant - PROBLEME: supprime le premier mot

    // NOUVEAU: Logique hiérarchique - produit prioritaire, sinon catégorie (préserve comportement existant)
    const displayIcon = product.icon || categoryIcon; // Fallback automatique sur catégorie

    // DEBUG: Tracer les icônes pour TACOS (console uniquement)
    if (product.name.includes('TACOS')) {
      console.log(`🔍 [DEBUG_TACOS_ICON] Product: ${product.name}`);
      console.log(`🔍 [DEBUG_TACOS_ICON] product.icon: "${product.icon}" (${typeof product.icon})`);
      console.log(`🔍 [DEBUG_TACOS_ICON] categoryIcon: "${categoryIcon}" (${typeof categoryIcon})`);
      console.log(`🔍 [DEBUG_TACOS_ICON] displayIcon final: "${displayIcon}" (${typeof displayIcon})`);
      console.log(`🔍 [DEBUG_TACOS_ICON] Final display will be: 🎯 ${displayIcon} ${displayIcon} ${product.name.toUpperCase()}`);
    }

    productBlock += `${displayIcon} ${product.name.toUpperCase()}\n`;
    
    // Composition si disponible
    if (product.composition) {
      productBlock += `🧾 ${product.composition.toUpperCase()}\n`;
    }
    
    // Prix et action - Utiliser la devise du restaurant
    // Afficher "Prix selon choix" pour les produits workflow avec prix 0
    const priceDisplay = (activePrice === 0 && (product.workflow_type || product.requires_steps))
      ? 'Prix selon choix'
      : this.formatPrice(activePrice);
    productBlock += `💰 ${priceDisplay} - Tapez ${index + 1}\n\n`;

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

      // ✅ RGPD : Vérifier le consentement AVANT toute action
      const hasGdprConsent = await this.checkGdprConsent(phoneNumber);

      if (!hasGdprConsent) {
        // Pas de consentement → Stocker le contexte en base et afficher l'écran
        await this.savePendingWorkflow(phoneNumber, { type: 'resto' });
        await this.showGdprConsentScreen(phoneNumber);
        return; // Arrêter le traitement
      }

      // ✅ Consentement validé → Continuer le workflow normal
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
   * 🧪 TEST - Vérification timezone et horaires pour restaurant Guinée
   * COMMENTÉ - Test validé le 2025-10-08
   * Résultats : ✅ UTC correctement géré, conversions timezone OK pour Paris et Guinée
   */
  /* async handleTestHoraireCommand(phoneNumber: string): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();

      // Récupérer un restaurant PARIS
      const { data: restoParis, error: errorParis } = await supabase
        .from('france_restaurants')
        .select('*')
        .eq('timezone', 'Europe/Paris')
        .eq('is_active', true)
        .limit(1)
        .single();

      // Récupérer un restaurant GUINÉE
      const { data: restoGuinee, error: errorGuinee } = await supabase
        .from('france_restaurants')
        .select('*')
        .eq('timezone', 'Africa/Conakry')
        .eq('is_active', true)
        .limit(1)
        .single();

      if ((errorParis && errorGuinee) || (!restoParis && !restoGuinee)) {
        await this.messageSender.sendMessage(phoneNumber,
          '❌ Aucun restaurant trouvé pour le test');
        return;
      }

      const restaurant = restoParis || restoGuinee;

      // Heure UTC actuelle du serveur
      const nowUTC = new Date();
      const utcString = nowUTC.toISOString();

      // Heure convertie Paris
      const timeInParis = nowUTC.toLocaleString('fr-FR', {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      // Heure convertie Guinée
      const timeInGuinea = nowUTC.toLocaleString('fr-FR', {
        timeZone: 'Africa/Conakry',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      // Heure actuelle calculée par le service (comme pour vérification)
      const currentTime = nowUTC.toLocaleTimeString('fr-FR', {
        timeZone: restaurant.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // Jour actuel en français
      const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      const localeDateString = nowUTC.toLocaleDateString('en-US', {
        timeZone: restaurant.timezone,
        weekday: 'short'
      });
      const dayMap: { [key: string]: number } = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3,
        'Thu': 4, 'Fri': 5, 'Sat': 6
      };
      const dayIndex = dayMap[localeDateString.split(',')[0]] || 0;
      const currentDay = days[dayIndex];

      // Horaires du jour
      const businessHours = restaurant.business_hours || {};
      const todaySchedule = businessHours[currentDay];

      // Vérification avec le service
      const scheduleResult = this.scheduleService.checkRestaurantSchedule(restaurant);

      // Construction du message de test
      const message = `🧪 **TEST HORAIRE - ${restaurant.name}**

📍 **Timezone**: ${restaurant.timezone}

⏰ **Heure UTC serveur**:
${utcString}

🇫🇷 **Heure Paris** (Europe/Paris):
${timeInParis}

🇬🇳 **Heure Guinée** (Africa/Conakry):
${timeInGuinea}

🎯 **Restaurant testé**:
🕐 **Heure actuelle** (calculée): ${currentTime}
📅 **Jour actuel**: ${currentDay}

📋 **Horaires aujourd'hui**:
${todaySchedule ? `${todaySchedule.isOpen ? '✅ Ouvert' : '❌ Fermé'} ${todaySchedule.opening || ''} - ${todaySchedule.closing || ''}` : '❌ Pas d\'horaire configuré'}

🎯 **Résultat vérification**:
${scheduleResult.isOpen ? '✅ RESTAURANT OUVERT' : '🔴 RESTAURANT FERMÉ'}
Statut: ${scheduleResult.status}
${scheduleResult.message || ''}
${scheduleResult.nextOpenTime ? `Prochaine ouverture: ${scheduleResult.nextOpenTime}` : ''}`;

      await this.messageSender.sendMessage(phoneNumber, message);

    } catch (error) {
      console.error('❌ [TestHoraire] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber,
        '❌ Erreur lors du test horaire');
    }
  } */

  /**
   * Créer session temporaire pour découverte restaurants
   * PATTERN CHOOSING_DELIVERY_MODE (accès direct comme ligne 843)
   */
  private async createRestaurantDiscoverySession(phoneNumber: string): Promise<void> {
    try {
      // 1. Supprimer session existante
      await this.sessionManager.deleteSessionsByPhone(phoneNumber);
      
      // 2. Créer nouvelle session avec l'état CHOOSING_RESTAURANT_MODE (pattern ligne 843)
      const now = this.getCurrentTime();
      const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes pour discovery depuis heure Paris
      
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

  /**
   * Gérer la multisélection pour catégories simples (ex: PÂTES "4,5")
   */
  private async handleCategoryMultiSelection(phoneNumber: string, session: any, message: string): Promise<void> {
    const selections = message.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const products = session.sessionData?.products || [];

    // Validation
    for (const num of selections) {
      if (num < 1 || num > products.length) {
        await this.messageSender.sendMessage(phoneNumber,
          `❌ Choix invalide: ${num}. Choisissez entre 1 et ${products.length}.`);
        return;
      }
    }

    // Créer items panier
    const cartItems = selections.map(num => ({
      productId: products[num - 1].id,
      name: products[num - 1].name,
      price: products[num - 1].price,
      quantity: 1,
      selectedIndex: num,
      categoryName: session.sessionData?.currentCategoryName || 'Produit',
      categoryId: session.sessionData?.currentCategoryId || null,
      icon: products[num - 1].icon || null
    }));

    // Mettre à jour session avec panier
    const currentCart = session.sessionData?.cart || [];
    const cartArray = Array.isArray(currentCart) ? currentCart : Object.values(currentCart);

    console.log('🔍 DEBUG_CART_BEFORE_UPDATE:', JSON.stringify(currentCart));
    console.log('🔍 DEBUG_CART_ITEMS_TO_ADD:', JSON.stringify(cartItems));
    const finalCart = [...cartArray, ...cartItems];
    console.log('🔍 DEBUG_CART_FINAL:', JSON.stringify(finalCart));

    await this.sessionManager.updateSession(session.id, {
      sessionData: {
        ...session.sessionData,
        cart: finalCart
      }
    });

    // NOUVELLE VALIDATION : Vérifier si tous les produits sont simples
    const selectedProducts = selections.map(num => products[num - 1]);
    const hasCompositeProducts = selectedProducts.some(product =>
      product.requires_steps ||
      product.workflow_type === 'composite' ||
      product.type === 'composite' ||
      (product.france_product_sizes && product.france_product_sizes.length > 0)
    );

    if (hasCompositeProducts) {
      const categoryName = session.sessionData?.currentCategoryName || 'cette catégorie';
      await this.messageSender.sendMessage(phoneNumber,
        `❌ Multisélection non autorisée pour ${categoryName}.\n` +
        `🔧 Ces produits nécessitent une configuration individuelle.\n` +
        `📋 Sélectionnez un produit à la fois (ex: tapez "1")`);
      return;
    }

    // Si tous sont simples → Continuer avec la logique simplifiée
    await this.addMultipleSimpleProducts(phoneNumber, session, selectedProducts);
  }

  /**
   * Ajouter plusieurs produits simples
   */
  private async addMultipleSimpleProducts(phoneNumber: string, session: any, selectedProducts: any[]): Promise<void> {
    // Message de confirmation
    const productNames = selectedProducts.map(p => p.name).join(', ');
    await this.messageSender.sendMessage(phoneNumber,
      `✅ Ajouté: ${productNames}\n➡️ Étape suivante...`);

    // Appeler handleQuantityInput UNE SEULE FOIS avec le premier produit
    // (pour déclencher l'étape suivante comme boissons)
    const tempSession = {
      ...session,
      sessionData: {
        ...session.sessionData,
        selectedProduct: selectedProducts[0], // Premier produit pour workflow
        multiSelectedProducts: selectedProducts // Tous les produits pour le panier
      }
    };

    await this.handleQuantityInput(phoneNumber, tempSession, '1');
  }

  /**
   * NOUVEAU: Handler affichage liste adresses après "99"
   */
  private async handleAddressListRequest(phoneNumber: string, session: any): Promise<void> {
    try {
      // Récupérer config restaurant
      const restaurantId = session.sessionData?.selectedRestaurantId || session.restaurantId;
      const supabase = await this.getSupabaseClient();

      const { data: restaurant } = await supabase
        .from('france_restaurants')
        .select('delivery_address_mode')
        .eq('id', restaurantId)
        .single();

      // Récupérer adresses client
      const cleanPhone = phoneNumber.replace('@c.us', '');
      const existingAddresses = await this.addressService.getCustomerAddresses(cleanPhone);

      // Afficher liste avec format moderne
      let message = existingAddresses?.length > 0
        ? `📍 Vos adresses enregistrées :\n\n`
        : `Aucune adresse enregistrée.\n\n`;

      // Lister adresses existantes avec format moderne
      existingAddresses?.forEach((addr: any, index: number) => {
        // Séparateur visuel
        message += `━━━━━━━━━━━━━━━━━━━━━\n`;

        // Emoji numéroté
        const numberEmoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][index] || `${index + 1}️⃣`;

        // Emoji selon le type d'adresse
        let typeEmoji = '🏠';
        if (addr.address_label.toLowerCase().includes('bureau')) {
          typeEmoji = '🏢';
        }

        // Nom en majuscules avec badge favori
        const labelUpper = addr.address_label.toUpperCase();
        const favoriteTag = addr.is_default ? ' ⭐ FAVORI' : '';
        message += `${numberEmoji} ${typeEmoji} ${labelUpper}${favoriteTag}\n`;

        // Parser l'adresse pour séparer rue et ville/code postal
        const addressParts = addr.full_address.split(',');
        if (addressParts.length >= 2) {
          const street = addressParts[0].trim();
          const cityPostal = addressParts.slice(1).join(',').trim();
          message += `📍 ${street}\n`;
          message += `📮 ${cityPostal}\n\n`;
        } else {
          // Fallback si format non standard
          message += `📍 ${addr.full_address}\n\n`;
        }
      });

      const nextNum = (existingAddresses?.length || 0) + 1;
      const nextNumberEmoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][nextNum - 1] || `${nextNum}️⃣`;

      if (existingAddresses?.length > 0) {
        message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      }

      // Option partage position (SI resto en mode geolocation)
      const showGpsOption = restaurant?.delivery_address_mode === 'geolocation';
      if (showGpsOption) {
        message += `${nextNumberEmoji} 📍 Partager ma position\n\n`;
      } else if (existingAddresses?.length > 0) {
        message += `${nextNumberEmoji} ➕ Nouvelle adresse\n\n`;
      }

      if (existingAddresses?.length > 0) {
        message += `💡 Tapez le numéro de votre choix`;
      } else {
        message += `Tapez votre adresse directement`;
      }

      await this.messageSender.sendMessage(phoneNumber, message);

      await this.sessionManager.updateSession(session.id, {
        botState: 'AWAITING_ADDRESS_CHOICE',
        sessionData: {
          ...session.sessionData,
          existingAddresses: existingAddresses || [],
          showGpsOption: showGpsOption
        }
      });

    } catch (error) {
      console.error('❌ [AddressListRequest] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur lors de la récupération des adresses. Veuillez réessayer.');
    }
  }

  /**
   * NOUVEAU: Handler réception position GPS
   */
  private async handleGpsLocationShare(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      // La position GPS devrait venir via le type 'location' du message WhatsApp
      // Ce handler gère les messages texte pendant l'attente GPS
      await this.messageSender.sendMessage(phoneNumber,
        '⏳ En attente de votre position GPS...\n\n📍 Utilisez le bouton "📎 Pièce jointe" puis "Position" dans WhatsApp'
      );
    } catch (error) {
      console.error('❌ [GpsLocationShare] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur. Tapez "annuler" pour recommencer.');
    }
  }

  /**
   * NOUVEAU: Mettre à jour adresse par défaut
   */
  private async updateDefaultAddress(phoneNumber: string, addressId: number): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();
      const cleanPhone = phoneNumber.replace('@c.us', '');

      // Retirer is_default de toutes
      await supabase
        .from('france_customer_addresses')
        .update({ is_default: false })
        .eq('phone_number', `${cleanPhone}@c.us`);

      // Mettre celle-ci en défaut
      await supabase
        .from('france_customer_addresses')
        .update({
          is_default: true,
          updated_at: this.getCurrentTime().toISOString()
        })
        .eq('id', addressId);

      console.log(`✅ [updateDefaultAddress] Adresse ${addressId} définie par défaut`);
    } catch (error) {
      console.error('❌ [updateDefaultAddress] Erreur:', error);
    }
  }

  /**
   * NOUVEAU: Obtenir icône selon label adresse
   */
  private getAddressIcon(label: string): string {
    if (label.includes('Maison')) return '🏠';
    if (label.includes('Bureau')) return '💼';
    if (label.includes('Travail')) return '🏢';
    if (label.includes('GPS') || label.includes('Position')) return '📍';
    return '📍';
  }

  /**
   * NOUVEAU: Gérer réception position GPS réelle
   */
  private async handleGpsLocationReceived(phoneNumber: string, gpsMessage: string): Promise<void> {
    try {
      console.log('📍 [GPS] Réception position GPS:', gpsMessage);

      const session = await this.sessionManager.getSession(phoneNumber);

      if (!session || session.botState !== 'AWAITING_GPS_LOCATION') {
        console.log('⚠️ [GPS] Position GPS reçue mais état invalide:', session?.botState);
        return;
      }

      // Extraire coordonnées du format "GPS:lat,lng"
      const coords = gpsMessage.replace('GPS:', '').split(',');
      const latitude = parseFloat(coords[0]);
      const longitude = parseFloat(coords[1]);

      console.log('📍 [GPS] Coordonnées extraites:', { latitude, longitude });

      // NOUVEAU: Stocker coordonnées temporairement et demander label
      await this.sessionManager.updateSession(session.id, {
        botState: 'AWAITING_GPS_LABEL',
        sessionData: {
          ...session.sessionData,
          pendingGpsLocation: {
            latitude: latitude,
            longitude: longitude
          }
        }
      });

      // Demander label
      await this.messageSender.sendMessage(phoneNumber,
        '📍 *Position enregistrée !*\n\n' +
        'Comment voulez-vous nommer cette adresse ?\n\n' +
        '1. 🏠 Maison\n' +
        '2. 💼 Bureau\n' +
        '3. 🏢 Travail\n' +
        '4. ✏️ Autre (saisir nom)\n\n' +
        'Tapez le numéro de votre choix'
      );

    } catch (error) {
      console.error('❌ [GPS] Erreur traitement position:', error);
      await this.messageSender.sendMessage(phoneNumber,
        '❌ Erreur traitement position GPS. Réessayez.'
      );
    }
  }

  /**
   * NOUVEAU: Gérer choix du label pour adresse GPS
   */
  private async handleGpsLabelChoice(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      const choice = parseInt(message.trim());
      let label = '';

      switch (choice) {
        case 1:
          label = 'Maison';
          break;
        case 2:
          label = 'Bureau';
          break;
        case 3:
          label = 'Travail';
          break;
        case 4:
          // Demander saisie libre
          await this.messageSender.sendMessage(phoneNumber,
            '✏️ Quel nom voulez-vous donner à cette adresse ?\n\n' +
            '💡 Exemple : Chez Pierre, Salle de sport, Resto préféré...'
          );
          await this.sessionManager.updateSession(session.id, {
            botState: 'AWAITING_GPS_CUSTOM_LABEL',
            sessionData: session.sessionData
          });
          return;
        default:
          await this.messageSender.sendMessage(phoneNumber, '❌ Choix invalide. Tapez 1, 2, 3 ou 4');
          return;
      }

      // Sauvegarder avec label prédéfini
      await this.saveGpsAddressWithLabel(phoneNumber, session, label);

    } catch (error) {
      console.error('❌ [GpsLabelChoice] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur. Tapez "annuler" pour recommencer.');
    }
  }

  /**
   * NOUVEAU: Gérer label personnalisé pour adresse GPS
   */
  private async handleGpsCustomLabel(phoneNumber: string, session: any, message: string): Promise<void> {
    try {
      const customLabel = message.trim();

      if (customLabel.length < 2) {
        await this.messageSender.sendMessage(phoneNumber, '❌ Nom trop court. Minimum 2 caractères.');
        return;
      }

      if (customLabel.length > 50) {
        await this.messageSender.sendMessage(phoneNumber, '❌ Nom trop long. Maximum 50 caractères.');
        return;
      }

      // Sauvegarder avec label personnalisé
      await this.saveGpsAddressWithLabel(phoneNumber, session, customLabel);

    } catch (error) {
      console.error('❌ [GpsCustomLabel] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber, '❌ Erreur. Réessayez.');
    }
  }

  /**
   * NOUVEAU: Sauvegarder adresse GPS avec label et créer commande
   */
  private async saveGpsAddressWithLabel(phoneNumber: string, session: any, label: string): Promise<void> {
    try {
      const { latitude, longitude } = session.sessionData.pendingGpsLocation;
      const cleanPhone = phoneNumber.replace('@c.us', '');
      const supabase = await this.getSupabaseClient();

      console.log(`💾 [GPS] Sauvegarde adresse avec label: ${label}`);

      // Retirer is_default des autres adresses
      await supabase
        .from('france_customer_addresses')
        .update({ is_default: false })
        .eq('phone_number', `${cleanPhone}@c.us`);

      // Créer nouvelle adresse avec label personnalisé
      const { data: savedAddress, error } = await supabase
        .from('france_customer_addresses')
        .insert({
          phone_number: `${cleanPhone}@c.us`,
          address_label: label,
          full_address: `Position GPS: ${latitude}, ${longitude}`,
          address_type: 'geolocation',
          latitude: latitude,
          longitude: longitude,
          is_default: true,
          is_active: true
        })
        .select()
        .single();

      if (error || !savedAddress) {
        console.error('❌ [GPS] Erreur sauvegarde adresse:', error);
        await this.messageSender.sendMessage(phoneNumber,
          '❌ Erreur enregistrement adresse. Réessayez.'
        );
        return;
      }

      console.log(`✅ [GPS] Adresse GPS "${label}" sauvegardée avec ID: ${savedAddress.id}`);

      // Traiter commande avec cette adresse
      await this.processOrderWithAddress(phoneNumber, session, savedAddress);

    } catch (error) {
      console.error('❌ [saveGpsAddressWithLabel] Erreur:', error);
      await this.messageSender.sendMessage(phoneNumber,
        '❌ Erreur sauvegarde. Tapez "annuler" pour recommencer.'
      );
    }
  }

  // ========================================================================
  // MÉTHODES RGPD - CONSENTEMENT EXPLICITE (Article 6 RGPD)
  // ========================================================================

  /**
   * Vérifier si un client a déjà donné son consentement GDPR
   * Article 7 RGPD - Preuve du consentement
   */
  private async checkGdprConsent(phoneNumber: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabaseClient();
      const { data, error } = await supabase
        .from('france_gdpr_consents')
        .select('consent_given')
        .eq('phone_number', phoneNumber)
        .eq('consent_given', true)
        .maybeSingle();

      if (error) {
        console.error('❌ [GDPR] Erreur vérification consentement:', error);
        return false;
      }

      const hasConsent = !!data;
      console.log(`🔒 [GDPR] Consentement pour ${phoneNumber}: ${hasConsent}`);
      return hasConsent;

    } catch (error) {
      console.error('❌ [GDPR] Erreur checkGdprConsent:', error);
      return false;
    }
  }

  /**
   * Gérer le workflow de consentement GDPR - VERSION SIMPLIFIÉE
   * Article 6 RGPD - Consentement libre, spécifique, éclairé et univoque
   * ✅ NE TOUCHE PAS la session - utilise UNIQUEMENT france_gdpr_consents
   */
  private async handleGDPRConsent(phoneNumber: string, message: string): Promise<void> {
    try {
      const response = message.toLowerCase().trim();

      // Cas 1 : Client accepte le consentement
      if (response === 'ok') {
        await this.saveGdprConsent(phoneNumber, true);

        await this.messageSender.sendMessage(phoneNumber,
          `✅ Merci ! Votre consentement a été enregistré. 🍕`);

        // ✅ Récupérer le contexte stocké en base et continuer le bon workflow
        const context = await this.getPendingWorkflow(phoneNumber);

        if (context) {
          // Nettoyer le contexte en base après récupération
          await this.clearPendingWorkflow(phoneNumber);

          // Continuer selon le type de contexte
          if (context.type === 'resto') {
            // Workflow "resto" : afficher menu choix restaurants
            await this.handleRestoCommand(phoneNumber);
          } else if (context.type === 'direct_access' && context.restaurant) {
            // Workflow QR code : afficher menu du restaurant scanné
            await this.handleDirectRestaurantAccess(phoneNumber, context.restaurant);
          }
        } else {
          // Pas de contexte trouvé (ne devrait pas arriver)
          await this.messageSender.sendMessage(phoneNumber,
            `Tapez **resto** pour voir les restaurants disponibles.`);
        }

        return;
      }

      // Cas 2 : Client refuse le consentement
      if (response === 'non' || response === 'no' || response === 'refuse') {
        await this.saveGdprConsent(phoneNumber, false);

        // Nettoyer le contexte stocké en base
        await this.clearPendingWorkflow(phoneNumber);

        await this.messageSender.sendMessage(phoneNumber,
          `❌ **Consentement refusé**

Sans votre consentement, nous ne pouvons malheureusement pas traiter de commande.

Si vous changez d'avis, vous pouvez nous recontacter à tout moment.

Merci de votre compréhension ! 👋`);
        return;
      }

      // Cas 3 : Réponse invalide → Réafficher l'écran
      await this.showGdprConsentScreen(phoneNumber);

    } catch (error) {
      console.error('❌ [GDPR] Erreur handleGDPRConsent:', error);
      await this.messageSender.sendMessage(phoneNumber,
        `❌ Une erreur est survenue. Veuillez réessayer.`);
    }
  }

  /**
   * Afficher l'écran de consentement GDPR
   * Article 13 RGPD - Information des personnes
   */
  private async showGdprConsentScreen(phoneNumber: string): Promise<void> {
    // Récupérer le nom du restaurant si contexte disponible
    const restaurantName = this.restaurantConfig?.brandName || this.restaurantConfig?.name || 'notre restaurant';

    const message = `🔒 Bienvenue chez ${restaurantName} !

Pour commander, nous collectons :
• Nom, téléphone, adresse

Ces données servent uniquement pour votre commande.

📄 Infos complètes : https://botresto.vercel.app/legal/privacy-policy

Tapez OK pour accepter et commander.`;

    await this.messageSender.sendMessage(phoneNumber, message);
  }

  /**
   * Enregistrer le consentement GDPR en base de données
   * Article 7 RGPD - Conservation de la preuve du consentement
   */
  private async saveGdprConsent(phoneNumber: string, consentGiven: boolean): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();

      // Vérifier si un consentement existe déjà
      const { data: existing } = await supabase
        .from('france_gdpr_consents')
        .select('id')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      const consentData = {
        phone_number: phoneNumber,
        consent_given: consentGiven,
        consent_date: new Date().toISOString(),
        consent_method: 'whatsapp',
        ip_address: null, // WhatsApp ne fournit pas l'IP
        user_agent: 'WhatsApp Bot',
        updated_at: new Date().toISOString()
      };

      if (existing) {
        // Mettre à jour le consentement existant
        await supabase
          .from('france_gdpr_consents')
          .update(consentData)
          .eq('id', existing.id);

        console.log(`✅ [GDPR] Consentement mis à jour pour ${phoneNumber}: ${consentGiven}`);
      } else {
        // Créer un nouveau consentement
        await supabase
          .from('france_gdpr_consents')
          .insert(consentData);

        console.log(`✅ [GDPR] Consentement créé pour ${phoneNumber}: ${consentGiven}`);
      }

    } catch (error) {
      console.error('❌ [GDPR] Erreur saveGdprConsent:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder le workflow en attente en base de données
   * Article 7 RGPD - Persistance du contexte pour continuité après consentement
   */
  private async savePendingWorkflow(phoneNumber: string, workflow: { type: 'resto' | 'direct_access', restaurant?: any }): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();

      // Vérifier si un enregistrement existe déjà
      const { data: existing } = await supabase
        .from('france_gdpr_consents')
        .select('id')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (existing) {
        // Mettre à jour le pending_workflow
        await supabase
          .from('france_gdpr_consents')
          .update({ pending_workflow: workflow })
          .eq('id', existing.id);

        console.log(`🔒 [GDPR] Workflow sauvegardé pour ${phoneNumber}:`, workflow.type);
      } else {
        // Créer un nouvel enregistrement avec pending_workflow
        await supabase
          .from('france_gdpr_consents')
          .insert({
            phone_number: phoneNumber,
            consent_given: false,
            consent_date: new Date().toISOString(),
            consent_method: 'whatsapp',
            pending_workflow: workflow,
            ip_address: null,
            user_agent: 'WhatsApp Bot',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        console.log(`🔒 [GDPR] Enregistrement créé avec workflow pour ${phoneNumber}:`, workflow.type);
      }

    } catch (error) {
      console.error('❌ [GDPR] Erreur savePendingWorkflow:', error);
      throw error;
    }
  }

  /**
   * Récupérer le workflow en attente depuis la base de données
   */
  private async getPendingWorkflow(phoneNumber: string): Promise<{ type: 'resto' | 'direct_access', restaurant?: any } | null> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data } = await supabase
        .from('france_gdpr_consents')
        .select('pending_workflow')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (data && data.pending_workflow) {
        console.log(`🔒 [GDPR] Workflow récupéré pour ${phoneNumber}:`, data.pending_workflow);
        return data.pending_workflow;
      }

      console.log(`🔒 [GDPR] Aucun workflow en attente pour ${phoneNumber}`);
      return null;

    } catch (error) {
      console.error('❌ [GDPR] Erreur getPendingWorkflow:', error);
      return null;
    }
  }

  /**
   * Nettoyer le workflow en attente de la base de données
   */
  private async clearPendingWorkflow(phoneNumber: string): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();

      await supabase
        .from('france_gdpr_consents')
        .update({ pending_workflow: null })
        .eq('phone_number', phoneNumber);

      console.log(`🔒 [GDPR] Workflow nettoyé pour ${phoneNumber}`);

    } catch (error) {
      console.error('❌ [GDPR] Erreur clearPendingWorkflow:', error);
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