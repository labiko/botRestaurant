import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastController, AlertController } from '@ionic/angular';
import { FranceOrdersService, FranceOrder, OrderAction } from '../../../core/services/france-orders.service';
import { AuthFranceService } from '../auth-france/services/auth-france.service';
import { DeliveryAssignmentService } from '../../../core/services/delivery-assignment.service';
import { DriversFranceService } from '../../../core/services/drivers-france.service';
import { UniversalOrderDisplayService, FormattedItem } from '../../../core/services/universal-order-display.service';
import { AddressWhatsAppService } from '../../../core/services/address-whatsapp.service';
import { SupabaseFranceService } from '../../../core/services/supabase-france.service';
import { FuseauHoraireService } from '../../../core/services/fuseau-horaire.service';
import { DeliveryTrackingService } from '../../../core/services/delivery-tracking.service';

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

  // Restaurant ID fixe pour l'instant (à récupérer depuis l'auth plus tard)
  private restaurantId = 1;

  constructor(
    public franceOrdersService: FranceOrdersService,
    public authService: AuthFranceService,
    private toastController: ToastController,
    private alertController: AlertController,
    private deliveryAssignmentService: DeliveryAssignmentService,
    private driversFranceService: DriversFranceService,
    private fuseauHoraireService: FuseauHoraireService,
    private universalOrderDisplayService: UniversalOrderDisplayService,
    private addressWhatsAppService: AddressWhatsAppService,
    private supabaseFranceService: SupabaseFranceService,
    private deliveryTrackingService: DeliveryTrackingService
  ) { }

  ngOnInit() {
    this.initializeOrders();
    this.startAutoRefresh();
    
    // Debug pour analyser les conditions d'affichage livreur - sera appelé après loadOrders
    this.debugDriverDisplay();
  }

  // Debug pour analyser les conditions d'affichage livreur
  debugDriverDisplay() {
    setTimeout(() => {
      this.orders.forEach((order: FranceOrder) => {
        if (order.status === 'prete' || order.status === 'assignee' || order.status === 'en_livraison') {
          console.log('🔍 DEBUG_ASSIGNEE - Order ' + order.id + ':', {
            status: order.status,
            driver_assignment_status: order.driver_assignment_status,
            driver_id: order.driver_id,
            condition_result: !!(order.driver_id && order.driver_assignment_status === 'assigned'),
            has_delivery_driver: !!order.delivery_driver,
            delivery_driver_data: order.delivery_driver
          });
        }
      });
    }, 2000); // Attendre 2s que les commandes se chargent
  }

  // DEBUG TEMPORAIRE - Appelé automatiquement
  debugAllOrders() {
    const order1209 = this.orders.find((o: any) => o.order_number === '1209-0013');
    
    console.log('🎯 SEARCH_1209_DEBUG - Total commandes:', this.orders.length);
    console.log('🎯 SEARCH_1209_DEBUG - Commande 1209-0013 trouvée:', !!order1209);
    if (order1209) {
      console.log('🎯 SEARCH_1209_DEBUG - Détails 1209:', order1209);
    } else {
      // Afficher toutes les commandes pour voir ce qu'on a
      console.log('🎯 SEARCH_1209_DEBUG - Liste des commandes:', this.orders.map((o: any) => o.order_number));
    }
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
      console.log('🔄 [OrdersPage] Réception commandes:', orders.length);
      
      // Enrichir les commandes avec les noms WhatsApp
      this.orders = await this.addressWhatsAppService.enrichOrdersWithWhatsAppNames(orders);
      
      console.log('✅ [OrdersPage] Commandes enrichies:', this.orders.length);
      
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
      console.log('🔄 [OrdersFrance] Actualisation manuelle des commandes...');
      
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
      
      console.log('✅ [OrdersFrance] Commandes actualisées avec succès');
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
        order.status !== 'livree' && order.status !== 'annulee'
      );
    } else if (this.selectedFilter === 'historique') {
      statusFilteredOrders = this.orders.filter(order => 
        order.status === 'livree' || order.status === 'annulee'
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
        order.status !== 'livree' && order.status !== 'annulee'
      ).length;
    }
    if (status === 'historique') {
      return this.orders.filter(order => 
        order.status === 'livree' || order.status === 'annulee'
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
      console.log(`📋 [OrdersFrance] Passage automatique vers l'onglet: ${targetTab}`);
      this.selectedFilter = targetTab;
    }
  }

  getStatusColor(status: string): string {
    return this.franceOrdersService.getStatusColor(status);
  }

  getStatusText(status: string): string {
    return this.franceOrdersService.getStatusText(status);
  }

  formatPrice(amount: number): string {
    return this.franceOrdersService.formatPrice(amount);
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

  /**
   * Récupérer le nom du livreur assigné
   */
  getDriverName(order: FranceOrder): string {
    if (order.delivery_driver) {
      const firstName = order.delivery_driver.first_name || '';
      const lastName = order.delivery_driver.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Livreur';
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
      console.log(`🚚 [OrdersFrance] Gestion commande livraison prête: ${order.id}`);

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
            // Marquer seulement comme "prête" sans assignation
            this.updateOrderStatusOnly(order, 'prete');
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
      console.log(`🚀 [OrdersFrance] Démarrage assignation automatique pour commande ${order.id}`);

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
        console.log('⚠️ [OrdersFrance] Aucun livreur disponible - commande reste en préparation');
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
            console.log('Navigation vers page livreurs');
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
          console.log(`🔍 [DEBUG] Commande ${order.id}:`, {
            hasPendingAssignment: order.hasPendingAssignment,
            hasAnyAssignment: order.hasAnyAssignment,
            anyAssignmentState
          });
          order.pendingDriversCount = assignmentState.pendingDrivers.length;
          
          // Construire la liste des noms des livreurs
          if (assignmentState.pendingDrivers.length > 0) {
            order.pendingDriverNames = assignmentState.pendingDrivers
              .map(a => {
                const driver = a.france_delivery_drivers;
                if (driver) {
                  return `${driver.first_name || ''} ${driver.last_name || ''}`.trim();
                }
                return 'Livreur inconnu';
              })
              .join(', ');
          }
        }
      }
      
      console.log('✅ [OrdersFrance] État des assignations pending chargé');
    } catch (error) {
      console.error('❌ [OrdersFrance] Erreur chargement assignations pending:', error);
    }
  }

  /**
   * Envoyer des rappels pour une commande avec assignation pending
   */
  async sendRemindersForOrder(order: FranceOrder): Promise<void> {
    try {
      console.log(`📨 [OrdersFrance] VRAIE LOGIQUE RAPPEL - Commande ${order.order_number}`);
      console.log(`📨 [DEBUG] hasAnyAssignment: ${order.hasAnyAssignment}`);
      console.log(`📨 [DEBUG] hasPendingAssignment: ${order.hasPendingAssignment}`);
      
      // ✅ UTILISER la vraie logique de rappel du tracking
      console.log(`✅ [DEBUG] Appel deliveryTrackingService.sendReminderNotifications (réactive tokens)`);
      
      const result = await this.deliveryTrackingService.sendReminderNotifications(order.id);
      
      if (result.success) {
        console.log('✅ [OrdersFrance] Rappels envoyés avec succès');
        this.presentToast(result.message, 'success');
        // ✅ OPTIMISATION : loadOrders() inclut maintenant l'état des assignations
        await this.franceOrdersService.loadOrders(this.restaurantId);
      } else {
        console.log('❌ [OrdersFrance] Échec envoi rappels:', result.message);
        this.presentToast(result.message, 'danger');
      }
      
    } catch (error) {
      console.error('❌ [OrdersFrance] Erreur envoi rappels:', error);
      this.presentToast('Erreur lors de l\'envoi des rappels', 'danger');
    }
  }

}