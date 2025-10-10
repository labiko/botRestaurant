import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FranceOrdersService, FranceOrder, OrderAction } from '../../../core/services/france-orders.service';
import { AuthFranceService } from '../auth-france/services/auth-france.service';
import { DeliveryAssignmentService } from '../../../core/services/delivery-assignment.service';
import { DriversFranceService } from '../../../core/services/drivers-france.service';
import { UniversalOrderDisplayService, FormattedItem } from '../../../core/services/universal-order-display.service';
import { AddressWhatsAppService } from '../../../core/services/address-whatsapp.service';
import { SupabaseFranceService } from '../../../core/services/supabase-france.service';
import { FuseauHoraireService } from '../../../core/services/fuseau-horaire.service';
import { DeliveryTrackingService } from '../../../core/services/delivery-tracking.service';
import { AudioNotificationService } from '../../../core/services/audio-notification.service';
import { PaymentLinkService } from '../../../core/services/payment-link.service';
import { PrintService } from '../../../core/services/print.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { RestaurantConfigService } from '../services/restaurant-config.service';

@Component({
  selector: 'app-orders-france',
  templateUrl: './orders-france.page.html',
  styleUrls: ['./orders-france.page.scss'],
  standalone: false
})
export class OrdersFrancePage implements OnInit, OnDestroy {
  orders: FranceOrder[] = [];
  selectedFilter: string = 'all';
  isLoading: boolean = false;
  private ordersSubscription?: Subscription;
  private autoRefreshSubscription?: Subscription;
  
  // NOUVEAU : Propriétés pour le système de filtre moderne
  searchText: string = '';
  filteredOrders: FranceOrder[] = [];
  filteredOrdersCount: number = 0;
  totalOrdersCount: number = 0;

  // Propriété pour détecter LengoPay
  isLengoPay: boolean = false;

  // Propriété pour le mode envoi automatique
  autoSendEnabled: boolean = false;

  // Propriété pour vérifier si paiement en ligne activé
  paymentConfigActive: boolean = false;

  private restaurantId: number;

  // NOUVEAU : Infos abonnement
  subscriptionInfo: {
    status: string;
    endDate: string;
    plan: string;
    daysRemaining: number;
  } | null = null;

  constructor(
    public franceOrdersService: FranceOrdersService,
    public authService: AuthFranceService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private deliveryAssignmentService: DeliveryAssignmentService,
    private driversFranceService: DriversFranceService,
    private fuseauHoraireService: FuseauHoraireService,
    private universalOrderDisplayService: UniversalOrderDisplayService,
    private addressWhatsAppService: AddressWhatsAppService,
    private supabaseFranceService: SupabaseFranceService,
    private deliveryTrackingService: DeliveryTrackingService,
    private audioNotificationService: AudioNotificationService,
    private paymentLinkService: PaymentLinkService,
    private printService: PrintService,
    private currencyService: CurrencyService,
    private restaurantConfigService: RestaurantConfigService
  ) {
    // Récupérer l'ID du restaurant depuis la session
    const id = this.authService.getCurrentRestaurantId();
    if (id === null) {
      console.error('❌ [OrdersFrance] Impossible de récupérer restaurant ID - utilisateur non connecté');
      throw new Error('Restaurant ID requis - utilisateur non connecté');
    }
    this.restaurantId = id;
  }

  async ngOnInit() {
    this.initializeOrders();
    this.startAutoRefresh();
    this.checkPaymentConfig();
    this.loadRestaurantCurrency();

    // Configurer le restaurant pour les notifications audio
    this.audioNotificationService.setCurrentRestaurant(this.restaurantId);

    // ✅ NOUVEAU : Écouter désactivation restaurant
    this.ordersSubscription?.add(
      this.franceOrdersService.restaurantDeactivated$.subscribe(deactivated => {
        if (deactivated) {
          this.handleRestaurantDeactivated();
        }
      })
    );

    // Debug pour analyser les conditions d'affichage livreur - sera appelé après loadOrders
    this.debugDriverDisplay();
  }

  // Debug pour analyser les conditions d'affichage livreur
  debugDriverDisplay() {
    setTimeout(() => {
      this.orders.forEach((order: FranceOrder) => {
        if (order.status === 'prete' || order.status === 'assignee' || order.status === 'en_livraison') {
          // Debug logic preserved without console output
        }

      });
    }, 2000); // Attendre 2s que les commandes se chargent
  }


  // DEBUG TEMPORAIRE - Appelé automatiquement
  debugAllOrders() {
    const order1209 = this.orders.find((o: any) => o.order_number === '1209-0013');
    // Debug logic preserved without console output
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
    this.franceOrdersService.stopAutoRefresh();
  }

  private async initializeOrders() {
    this.isLoading = true;

    // S'abonner aux changements de commandes avec enrichissement WhatsApp
    this.ordersSubscription = this.franceOrdersService.orders$.subscribe(async (orders) => {

      // Enrichir les commandes avec les noms WhatsApp
      this.orders = await this.addressWhatsAppService.enrichOrdersWithWhatsAppNames(orders);

      // NOUVEAU : Capturer infos abonnement depuis la première commande
      if (this.orders.length > 0 && (this.orders[0] as any).subscription_status) {
        this.subscriptionInfo = {
          status: (this.orders[0] as any).subscription_status,
          endDate: (this.orders[0] as any).subscription_end_date,
          plan: (this.orders[0] as any).subscription_plan,
          daysRemaining: (this.orders[0] as any).days_remaining
        };

        // Bloquer l'accès si expiré
        if (this.subscriptionInfo.status === 'expired') {
          await this.showSubscriptionExpiredAlert();
        }
      }

      // 🔍 DEBUG: Vérifier le online_payment_status de la commande 171
      const order171 = orders.find(o => o.id === 171);
      if (order171) {
        console.log('🔍 [DEBUG] Commande 171 - online_payment_status:', order171.online_payment_status);
        console.log('🔍 [DEBUG] Commande 171 - payment_date:', order171.payment_date);
      }

      // Vérifier et jouer le son pour les nouvelles commandes
      this.audioNotificationService.checkAndPlayForNewOrders(this.restaurantId).subscribe({
        next: (playedCount) => {
          if (playedCount > 0) {
          }
        },
        error: (error) => {
          console.error('❌ [AudioNotification] Erreur lors de la vérification audio:', error);
        }
      });

      // DEBUG TEMPORAIRE - Chercher 1209-0013
      this.debugAllOrders();
      this.isLoading = false;
    });

    try {
      // ✅ OPTIMISATION : loadOrders() inclut maintenant l'état des assignations
      await this.franceOrdersService.loadOrders(this.restaurantId);
    } catch (error) {
      console.error('Erreur initialisation commandes:', error);
      this.isLoading = false;
    }
  }

  private startAutoRefresh(): void {
    this.autoRefreshSubscription = this.franceOrdersService.startAutoRefresh(this.restaurantId);
  }

  async manualRefresh(event?: any) {
    try {
      // Vérifier que nous avons un restaurant_id
      if (!this.restaurantId) {
        console.error('❌ [OrdersFrance] Aucun restaurant_id disponible pour le refresh');
        this.presentToast('Erreur: Restaurant non identifié', 'danger');
        return;
      }

      // Recharger les commandes
      await this.franceOrdersService.loadOrders(this.restaurantId);
      
      // CORRECTION: Redémarrer l'auto-refresh après le refresh manuel
      this.startAutoRefresh();
      
      this.presentToast('Commandes actualisées', 'success');
      
    } catch (error) {
      console.error('❌ [OrdersFrance] Erreur lors de l\'actualisation:', error);
      this.presentToast('Erreur lors de l\'actualisation', 'danger');
    } finally {
      // Terminer l'animation de refresh si elle existe
      if (event) {
        event.target.complete();
      }
    }
  }

  /**
   * Afficher un toast informatif
   */
  private async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  getFilteredOrders(): FranceOrder[] {
    // Appliquer d'abord le filtre par statut
    let statusFilteredOrders: FranceOrder[] = [];
    if (this.selectedFilter === 'all') {
      statusFilteredOrders = this.orders.filter(order => 
        order.status !== 'livree' && order.status !== 'annulee' && order.status !== 'servie' && order.status !== 'recuperee'
      );
    } else if (this.selectedFilter === 'historique') {
      statusFilteredOrders = this.orders.filter(order => 
        order.status === 'livree' || order.status === 'annulee' || order.status === 'servie' || order.status === 'recuperee'
      );
    } else if (this.selectedFilter === 'prete') {
      // Inclure aussi les commandes assignées dans l'onglet PRÊTES
      statusFilteredOrders = this.orders.filter(order => 
        order.status === 'prete' || order.status === 'assignee'
      );
    } else {
      statusFilteredOrders = this.orders.filter(order => order.status === this.selectedFilter);
    }
    
    // Appliquer ensuite le filtre de recherche
    const searchFilteredOrders = this.applySearchFilter(statusFilteredOrders);
    
    // Mettre à jour les compteurs
    this.filteredOrdersCount = searchFilteredOrders.length;
    this.totalOrdersCount = statusFilteredOrders.length;
    
    return searchFilteredOrders;
  }

  /**
   * Appliquer le filtre de recherche sur les commandes
   */
  private applySearchFilter(orders: FranceOrder[]): FranceOrder[] {
    if (!this.searchText || this.searchText.trim() === '') {
      return orders;
    }
    
    const searchTerm = this.searchText.toLowerCase().trim();
    
    return orders.filter(order => {
      // Recherche par numéro de commande
      const orderNumberMatch = order.order_number?.toLowerCase().includes(searchTerm);
      
      // Recherche par téléphone (nettoyer les formats)
      const phoneClean = order.phone_number?.replace(/[\s\-\(\)\+]/g, '');
      const termClean = searchTerm.replace(/[\s\-\(\)\+]/g, '');
      const phoneMatch = phoneClean?.toLowerCase().includes(termClean);
      
      // Recherche par nom client
      const nameMatch = order.customer_name?.toLowerCase().includes(searchTerm);
      
      return orderNumberMatch || phoneMatch || nameMatch;
    });
  }

  getOrderCountByStatus(status: string): number {
    if (status === 'all') {
      return this.orders.filter(order => 
        order.status !== 'livree' && order.status !== 'annulee' && order.status !== 'servie' && order.status !== 'recuperee'
      ).length;
    }
    if (status === 'historique') {
      return this.orders.filter(order => 
        order.status === 'livree' || order.status === 'annulee' || order.status === 'servie' || order.status === 'recuperee'
      ).length;
    }
    return this.orders.filter(order => order.status === status).length;
  }

  async onActionButtonClick(order: FranceOrder, action: OrderAction) {
    // NOUVEAU : Traitement spécial pour les commandes de livraison marquées "prête"
    if (action.nextStatus === 'prete' && order.delivery_mode === 'livraison') {
      await this.handleDeliveryOrderReady(order, action);
      return;
    }

    // Traitement normal pour les autres cas
    const success = await this.franceOrdersService.updateOrderStatus(order.id, action.nextStatus);

    if (success) {
      // Recharger les commandes pour voir les changements
      await this.franceOrdersService.loadOrders(this.restaurantId);

      // NOUVEAU : Impression automatique si confirmation de commande
      if (action.nextStatus === 'confirmee') {
        // Préparer les données pour l'impression
        const orderData = {
          id: order.id,
          order_number: order.order_number,
          restaurant_name: 'Restaurant', // Utiliser un nom par défaut ou récupérer depuis authService
          customer_name: order.customer_name || 'Client',
          customer_phone: order.phone_number, // Utiliser phone_number qui est la propriété correcte
          items: order.items || [],
          total_amount: order.total_amount,
          total: order.total_amount,
          delivery_mode: order.delivery_mode,
          delivery_address: order.delivery_address,
          delivery_latitude: order.delivery_latitude,
          delivery_longitude: order.delivery_longitude,
          notes: order.notes,
          additional_notes: order.additional_notes,
          created_at: order.created_at
        };

        // Déclencher l'impression asynchrone (ne bloque pas l'UI)
        this.printService.printOrderAsync(orderData);
      }

      // NOUVEAU : Passage automatique vers l'onglet correspondant au nouveau statut
      this.switchToStatusTab(action.nextStatus);
    } else {
      // Gérer l'erreur (toast, alert, etc.)
      console.error('Erreur mise à jour statut commande');
      this.presentToast('Erreur lors de la mise à jour du statut', 'danger');
    }
  }

  /**
   * NOUVEAU : Change automatiquement vers l'onglet du statut
   */
  private switchToStatusTab(status: string): void {
    // Mapping des statuts vers les onglets
    const statusToTab: Record<string, string> = {
      'pending': 'pending',
      'confirmee': 'confirmee', 
      'preparation': 'preparation',
      'prete': 'prete',
      'en_livraison': 'en_livraison',
      'livree': 'all', // Les commandes livrées restent visibles dans "Toutes"
      'annulee': 'all'  // Les commandes annulées restent visibles dans "Toutes"
    };

    const targetTab = statusToTab[status];
    if (targetTab) {
      this.selectedFilter = targetTab;
    }
  }

  getStatusColor(status: string): string {
    return this.franceOrdersService.getStatusColor(status);
  }

  getStatusText(status: string): string {
    return this.franceOrdersService.getStatusText(status);
  }


  formatTime(dateString: string): string {
    return this.franceOrdersService.formatTime(dateString);
  }

  formatDateTime(dateString: string): string {
    return this.franceOrdersService.formatDateTime(dateString);
  }

  getDeliveryModeText(mode: string): string {
    const modes: { [key: string]: string } = {
      'sur_place': 'Sur place',
      'a_emporter': 'À emporter',
      'livraison': 'Livraison'
    };
    return modes[mode] || mode;
  }

  getPaymentModeText(mode: string): string {
    const modes: { [key: string]: string } = {
      'maintenant': 'Carte bancaire',
      'fin_repas': 'Cash sur place',
      'recuperation': 'Cash à emporter',
      'livraison': 'Cash livraison'
    };
    return modes[mode] || mode;
  }

  /**
   * Formater les items avec le service universel
   */
  getFormattedItems(order: FranceOrder): FormattedItem[] {
    return this.universalOrderDisplayService.formatOrderItems(order.items || []);
  }

  // Nouvelles méthodes pour l'affichage détaillé des items
  
  /**
   * Vérifier si l'item a des options sélectionnées
   */
  hasSelectedOptions(selectedOptions: any): boolean {
    if (!selectedOptions || typeof selectedOptions !== 'object') {
      return false;
    }
    return Object.keys(selectedOptions).length > 0;
  }

  /**
   * Obtenir les groupes d'options formatés pour l'affichage
   */
  getSelectedOptionsGroups(selectedOptions: any): any[] {
    if (!selectedOptions || typeof selectedOptions !== 'object') {
      return [];
    }

    const groups: any[] = [];
    
    for (const [groupName, options] of Object.entries(selectedOptions)) {
      if (options) {
        let formattedOptions: any[] = [];
        
        if (Array.isArray(options)) {
          // Groupe avec plusieurs options (ex: sauces)
          formattedOptions = options;
        } else if (typeof options === 'object') {
          // Groupe avec une seule option (ex: viande)
          formattedOptions = [options];
        }
        
        if (formattedOptions.length > 0) {
          groups.push({
            groupName: groupName,
            options: formattedOptions
          });
        }
      }
    }
    
    return groups;
  }

  /**
   * Formater le nom du groupe d'options - DYNAMIQUE (pas de données en dur)
   */
  formatOptionGroupName(groupName: string): string {
    // Formatage simple dynamique : première lettre en majuscule
    if (!groupName) return '';
    return groupName.charAt(0).toUpperCase() + groupName.slice(1);
  }

  openDrivingDirections(latitude: number, longitude: number, address: string) {
    if (latitude && longitude) {
      // Ouvrir Google Maps avec l'itinéraire
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  }

  // Nouvelle méthode unifiée pour gestion GPS/Adresse
  openDrivingDirectionsForOrder(order: FranceOrder) {
    console.log('🗺️ [DEBUG] openDrivingDirectionsForOrder - Order:', order);
    console.log('🗺️ [DEBUG] Type adresse:', order.delivery_address_type);
    console.log('🗺️ [DEBUG] Latitude:', order.delivery_latitude);
    console.log('🗺️ [DEBUG] Adresse brute:', order.delivery_address);

    if (order.delivery_address_type === 'geolocation' && order.delivery_latitude) {
      // GPS : Ouvrir avec itinéraire en voiture
      const url = `https://www.google.com/maps/dir/?api=1&destination=${order.delivery_latitude},${order.delivery_longitude}&travelmode=driving`;
      console.log('🗺️ [DEBUG] URL GPS:', url);
      window.open(url, '_blank');
    } else if (order.delivery_address) {
      // Adresse textuelle : Nettoyer le préfixe "Position GPS: " si présent, puis encoder
      const cleanAddress = order.delivery_address.replace(/^Position GPS:\s*/i, '');
      console.log('🗺️ [DEBUG] Adresse nettoyée:', cleanAddress);

      const encodedAddress = encodeURIComponent(cleanAddress);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
      console.log('🗺️ [DEBUG] URL adresse:', url);

      window.open(url, '_blank');
    }
  }

  // Méthode legacy conservée pour compatibilité
  openDrivingDirectionsFromAddress(address: string) {
    if (address && address.trim()) {
      const encodedAddress = encodeURIComponent(address.trim());

      // Détecter le type d'appareil pour optimiser l'expérience
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // Sur mobile : ouvrir l'app Google Maps avec navigation directe
        const mobileUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving&dir_action=navigate`;
        window.open(mobileUrl, '_blank');
      } else {
        // Sur desktop : ouvrir Google Maps web avec itinéraire
        const desktopUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
        window.open(desktopUrl, '_blank');
      }
    }
  }

  /**
   * Récupérer le nom du livreur assigné (prénom uniquement)
   */
  getDriverName(order: FranceOrder): string {
    if (order.delivery_driver) {
      return order.delivery_driver.first_name || 'Livreur';
    }

    return 'Livreur assigné';
  }

  /**
   * Récupérer le téléphone du livreur assigné
   */
  getDriverPhone(order: FranceOrder): string {
    if (order.delivery_driver?.phone_number) {
      return order.delivery_driver.phone_number;
    }
    
    return '';
  }

  // ========== NOUVELLES MÉTHODES POUR SYSTÈME DE LIVRAISON AUTOMATIQUE ==========

  /**
   * Gérer une commande de livraison marquée "prête"
   */
  async handleDeliveryOrderReady(order: FranceOrder, action: OrderAction): Promise<void> {
    try {

      // 1. Vérifier le nombre de livreurs disponibles
      const activeDriversCount = await this.driversFranceService.getActiveDriversCount(this.restaurantId);
      
      if (activeDriversCount === 0) {
        // Aucun livreur actif - proposer des options
        await this.showNoDriversAlert(order);
        return;
      }

      // 2. Proposer le lancement de l'assignation automatique
      await this.showDeliveryAssignmentPrompt(order, activeDriversCount);

    } catch (error) {
      console.error('❌ [OrdersFrance] Erreur gestion commande livraison:', error);
      this.presentToast('Erreur lors de la préparation de la livraison', 'danger');
    }
  }

  /**
   * Afficher l'alerte de confirmation pour l'assignation automatique
   */
  private async showDeliveryAssignmentPrompt(order: FranceOrder, driversCount: number): Promise<void> {
    const alert = await this.alertController.create({
      header: '🚚 Commande prête pour livraison',
      message: `
        La commande ${order.order_number} est prête.
        
        📊 ${driversCount} livreur(s) actif(s) disponible(s)
        
        Souhaitez-vous lancer l'assignation automatique ?
      `,
      buttons: [
        {
          text: 'Plus tard',
          role: 'cancel',
          handler: () => {
            // NE RIEN FAIRE - Juste fermer la modal
            // La commande reste dans son état actuel
          }
        },
        {
          text: 'Assigner maintenant',
          handler: () => {
            this.startAutomaticAssignment(order);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Afficher l'alerte quand aucun livreur n'est disponible
   */
  private async showNoDriversAlert(order: FranceOrder): Promise<void> {
    const alert = await this.alertController.create({
      header: '⚠️ Aucun livreur disponible',
      message: `
        Aucun livreur n'est actuellement connecté pour la commande ${order.order_number}.
        
        Que souhaitez-vous faire ?
      `,
      buttons: [
        {
          text: 'Marquer prête (sans livraison)',
          handler: () => {
            this.updateOrderStatusOnly(order, 'prete');
            this.presentToast('Commande marquée prête - Client sera informé pour récupération', 'warning');
          }
        },
        {
          text: 'Garder en préparation',
          role: 'cancel',
          handler: () => {
            this.presentToast('Commande reste en préparation', 'primary');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Démarrer l'assignation automatique
   */
  private async startAutomaticAssignment(order: FranceOrder): Promise<void> {
    try {

      // NOUVEAU : Vérifier d'abord si l'assignation est possible AVANT de changer le statut
      // 1. Tenter d'abord l'assignation automatique SANS changer le statut
      const assignmentStarted = await this.deliveryAssignmentService.startOrderAssignment(order.id);

      if (assignmentStarted) {
        // 2. SEULEMENT si l'assignation a réussi, marquer comme prête
        const statusUpdated = await this.franceOrdersService.updateOrderStatus(order.id, 'prete');
        if (!statusUpdated) {
          console.error('⚠️ [OrdersFrance] Assignation OK mais impossible de marquer prête');
          this.presentToast('Erreur lors de la mise à jour du statut', 'danger');
          return;
        }

        // Succès - informer l'utilisateur
        this.presentToast('🔍 Recherche de livreur en cours...', 'primary');
        
        // Recharger les commandes
        await this.franceOrdersService.loadOrders(this.restaurantId);
        this.switchToStatusTab('prete');

        // SUPPRIMÉ : Monitoring inutile qui causait des fausses alertes
        // this.monitorAssignmentProgress(order.id);

      } else {
        // Échec d'assignation - NE PAS marquer comme prête, proposer des alternatives
        this.presentToast('Aucun livreur disponible actuellement', 'warning');
        await this.showAssignmentFailedAlert(order);
      }

    } catch (error) {
      console.error('❌ [OrdersFrance] Erreur assignation automatique:', error);
      this.presentToast('Erreur lors du lancement de l\'assignation', 'danger');
    }
  }

  /**
   * Mise à jour simple du statut de commande (sans logique de livraison)
   */
  private async updateOrderStatusOnly(order: FranceOrder, newStatus: string): Promise<void> {
    const success = await this.franceOrdersService.updateOrderStatus(order.id, newStatus);
    
    if (success) {
      // ✅ OPTIMISATION : loadOrders() inclut maintenant l'état des assignations
      await this.franceOrdersService.loadOrders(this.restaurantId);
      this.switchToStatusTab(newStatus);
    } else {
      this.presentToast('Erreur lors de la mise à jour du statut', 'danger');
    }
  }

  /**
   * Proposer à emporter au client
   */
  private async suggestTakeawayToCustomer(order: FranceOrder): Promise<void> {
    // Marquer d'abord la commande comme prête
    await this.updateOrderStatusOnly(order, 'prete');
    
    // TODO: Intégrer avec le service de notification WhatsApp
    // pour envoyer un message au client proposant de venir récupérer
    
    this.presentToast('Message envoyé au client pour proposition à emporter', 'success');
  }

  /**
   * Afficher l'alerte d'échec d'assignation
   */
  private async showAssignmentFailedAlert(order: FranceOrder): Promise<void> {
    const alert = await this.alertController.create({
      header: '❌ Échec de l\'assignation',
      message: `Impossible d'assigner la commande ${order.order_number} automatiquement.`,
      buttons: [
        {
          text: 'Réessayer plus tard',
          role: 'cancel'
        },
        {
          text: 'Voir les livreurs',
          handler: () => {
            // Navigation vers la page des livreurs
            // TODO: Implémenter la navigation
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * SUPPRIMÉ : Surveillance du progrès de l'assignation
   * Cette fonction causait des fausses alertes "Aucun livreur trouvé"
   * après une assignation réussie car elle vérifiait le statut 10 secondes
   * après l'assignation, moment où le statut peut avoir changé.
   */
  /*
  private async monitorAssignmentProgress(orderId: number): Promise<void> {
    // Surveillance simple avec timeout
    setTimeout(async () => {
      try {
        const status = await this.deliveryAssignmentService.getOrderAssignmentStatus(orderId);
        
        if (status === 'assigned') {
          this.presentToast('✅ Livreur assigné avec succès !', 'success');
          await this.franceOrdersService.loadOrders(this.restaurantId);
        } else if (status === 'searching') {
          this.presentToast('🔍 Recherche en cours...', 'warning');
        } else {
          this.presentToast('⚠️ Aucun livreur trouvé', 'warning');
        }
      } catch (error) {
        console.error('❌ [OrdersFrance] Erreur monitoring assignation:', error);
      }
    }, 10000); // Vérifier après 10 secondes
  }
  */

  /**
   * Vérifier si une commande peut être assignée automatiquement
   */
  canStartDeliveryAssignment(order: FranceOrder): boolean {
    return (order.status === 'prete' || order.status === 'assignee') && 
           order.delivery_mode === 'livraison' && 
           !order.driver_id && // CORRIGÉ : utiliser driver_id au lieu de assigned_driver_id
           (!order.driver_assignment_status || order.driver_assignment_status === 'none');
  }

  /**
   * Obtenir le statut d'assignation pour affichage
   */
  getAssignmentStatusText(order: FranceOrder): string {
    // Utiliser les champs qui existent vraiment en base
    if (!order.driver_id || order.driver_assignment_status !== 'assigned') {
      return 'Non assignée';
    }
    
    // Commande assignée - utiliser les données du livreur
    if (order.delivery_driver) {
      const firstName = order.delivery_driver.first_name || 'Livreur';
      let statusText = `${firstName} • 📞 ${order.delivery_driver.phone_number}`;
      
      // Ajouter le temps écoulé si la livraison a commencé
      if (order.delivery_started_at && order.status === 'en_livraison') {
        const minutesAgo = this.franceOrdersService.getDeliveryStartedMinutesAgo(order.delivery_started_at);
        statusText += ` • En route depuis ${minutesAgo} min`;
      }
      
      return statusText;
    }
    
    // Fallback si pas de données livreur
    return `Livreur #${order.driver_id} • 📞 En cours...`;
  }

  /**
   * Obtenir la couleur du statut d'assignation
   */
  getAssignmentStatusColor(order: FranceOrder): string {
    if (!order.driver_id) {
      return 'warning';
    }
    return 'success';
  }

  /**
   * NOUVEAU : Gestionnaires d'événements pour le système de filtre
   */
  onSearchChange(event: any) {
    this.searchText = event.target.value || '';
    // Le filtrage se fait automatiquement via getFilteredOrders()
  }

  onSearchClear() {
    this.searchText = '';
  }

  /**
   * Détecter si le texte de recherche ressemble à un numéro de téléphone
   */
  isPhoneNumber(text: string): boolean {
    if (!text) return false;
    
    // Nettoyer le texte des espaces et caractères spéciaux
    const cleaned = text.replace(/[\s\-\(\)\+]/g, '');
    
    // Vérifier si c'est principalement numérique et de longueur appropriée
    return /^\d{8,15}$/.test(cleaned);
  }

  /**
   * Détecter si le texte de recherche ressemble à un numéro de commande
   */
  isOrderNumber(text: string): boolean {
    if (!text) return false;
    
    // Format typique : MMDD-XXXX ou similaire
    return /^\d{4}\-?\d{4}$/.test(text) || text.startsWith('#') || /^[A-Z0-9\-]{4,}$/i.test(text);
  }

  /**
   * NOUVEAU : Vérifier si un bouton d'action doit être masqué
   * Cache le bouton "EN LIVRAISON" pour les commandes non assignées
   */
  shouldHideActionButton(order: FranceOrder, action: OrderAction): boolean {
    // Masquer le bouton "EN LIVRAISON" si la commande n'est pas assignée
    if (action.nextStatus === 'en_livraison' && !order.assigned_driver_id) {
      return true;
    }
    return false;
  }

  /**
   * NOUVEAU : Obtenir le nombre de livreurs notifiés
   */
  getNotifiedDriversCount(order: FranceOrder): number {
    // Récupérer depuis les métadonnées de la commande si disponibles
    if (order.notification_metadata?.drivers_notified) {
      return order.notification_metadata.drivers_notified;
    }
    // Fallback: compter les actions de notification dans delivery_driver_actions
    if (order.drivers_notified_count !== undefined) {
      return order.drivers_notified_count;
    }
    
    // TEMPORAIREMENT DÉSACTIVÉ - causait une fuite mémoire
    // this.loadDriversNotifiedCount(order.id);
    return 1; // Valeur par défaut temporaire
  }

  /**
   * Charger le nombre réel de livreurs notifiés depuis la base de données
   * COMMENTÉ - causait une fuite mémoire car appelé depuis le template
   */
  /*
  private async loadDriversNotifiedCount(orderId: number): Promise<void> {
    try {
      const { count, error } = await this.supabaseFranceService.client
        .from('delivery_tokens')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', orderId);

      if (!error && count !== null) {
        // Mettre à jour l'ordre dans la liste
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          this.orders[orderIndex].drivers_notified_count = count;
        }
      }
    } catch (error) {
      console.error('Erreur chargement drivers_notified_count:', error);
    }
  }
  */

  /**
   * NOUVEAU : Obtenir le temps écoulé depuis la notification
   */
  getNotificationTime(order: FranceOrder): string {
    // Utilise assignment_started_at si disponible (mis à jour lors des notifications/rappels)
    // Sinon utilise updated_at comme fallback
    const timestamp = order.assignment_started_at || order.updated_at;
    
    if (!timestamp) {
      return 'il y a quelques instants';
    }
    
    // Utilise le service FuseauHoraire pour un calcul précis
    return this.fuseauHoraireService.getTimeAgo(timestamp);
  }

  /**
   * Charger l'état des assignations pending pour les commandes prêtes
   */
  private async loadPendingAssignmentsState(): Promise<void> {
    try {
      // Nettoyer d'abord les assignations expirées
      await this.deliveryAssignmentService.cleanExpiredAssignments();
      
      // Vérifier pour chaque commande prête sans livreur
      for (const order of this.orders) {
        if ((order.status === 'prete' || order.status === 'assignee') && !order.driver_id) {
          const assignmentState = await this.deliveryAssignmentService.checkPendingAssignment(order.id);
          
          // Vérifier s'il existe ANY assignation pending (même expirée)
          const anyAssignmentState = await this.deliveryAssignmentService.checkAnyPendingAssignment(order.id);
          
          // Mettre à jour l'état de la commande
          order.hasPendingAssignment = assignmentState.hasPending; // Assignations actives seulement
          order.hasAnyAssignment = anyAssignmentState.hasAny; // N'importe quelle assignation
          
          // DEBUG: Log pour vérifier les valeurs
          order.pendingDriversCount = assignmentState.pendingDrivers.length;
          
          // Construire la liste des noms des livreurs (prénoms uniquement)
          if (assignmentState.pendingDrivers.length > 0) {
            order.pendingDriverNames = assignmentState.pendingDrivers
              .map(a => {
                const driver = a.france_delivery_drivers;
                if (driver) {
                  return driver.first_name || 'Livreur inconnu';
                }
                return 'Livreur inconnu';
              })
              .join(', ');
          }
        }
      }
      
    } catch (error) {
      console.error('❌ [OrdersFrance] Erreur chargement assignations pending:', error);
    }
  }

  /**
   * Envoyer des rappels pour une commande avec assignation pending
   */
  async sendRemindersForOrder(order: FranceOrder): Promise<void> {
    try {

      // ✅ UTILISER la vraie logique de rappel du tracking

      const result = await this.deliveryTrackingService.sendReminderNotifications(order.id);

      if (result.success) {
        this.presentToast(result.message, 'success');
        // ✅ OPTIMISATION : loadOrders() inclut maintenant l'état des assignations
        await this.franceOrdersService.loadOrders(this.restaurantId);
      } else {
        this.presentToast(result.message, 'danger');
      }

    } catch (error) {
      console.error('❌ [OrdersFrance] Erreur envoi rappels:', error);
      this.presentToast('Erreur lors de l\'envoi des rappels', 'danger');
    }
  }

  /**
   * ✅ NOUVEAU : Gérer la désactivation du restaurant
   */
  private async handleRestaurantDeactivated(): Promise<void> {
    try {
      // 1. Arrêter l'auto-refresh
      this.franceOrdersService.stopAutoRefresh();
      if (this.autoRefreshSubscription) {
        this.autoRefreshSubscription.unsubscribe();
        this.autoRefreshSubscription = undefined;
      }

      // 2. Afficher une alerte informative
      const alert = await this.alertController.create({
        header: '⚠️ Restaurant désactivé',
        message: 'Votre restaurant a été désactivé par un administrateur. Vous allez être déconnecté.',
        buttons: ['Compris'],
        backdropDismiss: false
      });
      await alert.present();
      await alert.onDidDismiss();

      // 3. Effectuer la déconnexion et redirection
      await this.authService.logout();
      this.router.navigate(['/restaurant-france/auth-france/login-france']);

    } catch (error) {
      console.error('❌ [OrdersFrance] Erreur gestion désactivation restaurant:', error);
      // En cas d'erreur, forcer quand même la déconnexion
      this.router.navigate(['/restaurant-france/auth-france/login-france']);
    }
  }

  // ========================================================================
  // PAYMENT LINK METHODS (NEW)
  // ========================================================================

  /**
   * Récupérer les informations de paiement d'une commande
   */
  async getPaymentInfo(orderId: number) {
    const { data } = await this.supabaseFranceService.client
      .from('payment_links')
      .select('status, paid_at')
      .eq('order_id', orderId)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  /**
   * Envoyer un lien de paiement à un client
   */
  // Méthode pour vérifier la configuration de paiement
  async checkPaymentConfig() {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('restaurant_payment_configs')
        .select('provider, is_active, auto_send_on_order')
        .eq('restaurant_id', this.restaurantId)
        .maybeSingle();

      if (!error && data) {
        // Vérifier l'état de la configuration
        this.paymentConfigActive = data.is_active === true;
        this.isLengoPay = data.provider === 'lengopay';
        this.autoSendEnabled = this.paymentConfigActive && (data.auto_send_on_order || false);

        console.log('💳 [OrdersFrance] Config:', {
          provider: data.provider,
          isActive: this.paymentConfigActive,
          isLengoPay: this.isLengoPay,
          autoSend: this.autoSendEnabled
        });
      } else {
        // Pas de config = tout désactivé
        this.paymentConfigActive = false;
        this.isLengoPay = false;
        this.autoSendEnabled = false;
      }
    } catch (error) {
      console.error('❌ [OrdersFrance] Erreur vérification config paiement:', error);
      // En cas d'erreur = tout désactivé par sécurité
      this.paymentConfigActive = false;
      this.isLengoPay = false;
      this.autoSendEnabled = false;
    }
  }

  async sendPaymentLink(order: FranceOrder) {
    console.log('💳 [OrdersFrance] Envoi lien paiement pour commande:', order.id);

    const loading = await this.toastController.create({
      message: 'Envoi du lien de paiement...',
      duration: 0
    });
    await loading.present();

    try {
      const result = await this.paymentLinkService.sendFromRestaurant(order.id);

      await loading.dismiss();

      if (result.success && result.messageSent) {
        const toast = await this.toastController.create({
          message: '✅ Lien de paiement envoyé avec succès !',
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
      } else {
        const toast = await this.toastController.create({
          message: '⚠️ Lien créé mais envoi WhatsApp échoué',
          duration: 4000,
          color: 'warning',
          position: 'top'
        });
        await toast.present();
      }

    } catch (error: any) {
      await loading.dismiss();

      console.error('❌ [OrdersFrance] Erreur envoi lien paiement:', error);

      const alert = await this.alertController.create({
        header: 'Erreur',
        message: error.message || 'Impossible d\'envoyer le lien de paiement',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async copyPaymentLink(order: FranceOrder) {
    if (!order.payment_link_url) {
      const toast = await this.toastController.create({
        message: '⚠️ Aucun lien de paiement disponible',
        duration: 2000,
        color: 'warning',
        position: 'top'
      });
      await toast.present();
      return;
    }

    try {
      await navigator.clipboard.writeText(order.payment_link_url);

      const toast = await this.toastController.create({
        message: '✅ Lien copié dans le presse-papier !',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    } catch (error) {
      console.error('❌ [OrdersFrance] Erreur copie lien:', error);

      const toast = await this.toastController.create({
        message: '❌ Impossible de copier le lien',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  // Propriété pour stocker la devise du restaurant
  private restaurantCurrency: string = 'EUR';

  /**
   * Charge la devise du restaurant depuis la base de données
   */
  private loadRestaurantCurrency(): void {
    this.restaurantConfigService.getRestaurantConfig(this.restaurantId)
      .subscribe({
        next: (config) => {
          this.restaurantCurrency = config.currency || 'EUR';
          console.log(`💱 [OrdersFrance] Devise restaurant chargée: ${this.restaurantCurrency}`);
        },
        error: (error) => {
          console.error('❌ [OrdersFrance] Erreur chargement devise:', error);
          this.restaurantCurrency = 'EUR'; // Fallback
        }
      });
  }

  /**
   * Formate un prix selon la devise du restaurant
   */
  formatPrice(amount: number): string {
    return this.restaurantConfigService.formatPrice(amount, this.restaurantCurrency);
  }

  /**
   * NOUVEAU : Afficher alerte expiration abonnement
   */
  async showSubscriptionExpiredAlert() {
    const alert = await this.alertController.create({
      header: '⚠️ Abonnement Expiré',
      message: 'Votre abonnement a expiré. Veuillez renouveler pour continuer à utiliser le service.',
      buttons: [
        {
          text: 'Renouveler',
          handler: () => {
            this.router.navigate(['/dashboard-france']);
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

}