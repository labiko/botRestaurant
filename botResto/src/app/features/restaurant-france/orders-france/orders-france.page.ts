import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastController, AlertController } from '@ionic/angular';
import { FranceOrdersService, FranceOrder, OrderAction } from '../../../core/services/france-orders.service';
import { AuthFranceService } from '../auth-france/services/auth-france.service';
import { DeliveryAssignmentService } from '../../../core/services/delivery-assignment.service';
import { DriversFranceService } from '../../../core/services/drivers-france.service';

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

  // Restaurant ID fixe pour l'instant (à récupérer depuis l'auth plus tard)
  private restaurantId = 1;

  constructor(
    private franceOrdersService: FranceOrdersService,
    public authService: AuthFranceService,
    private toastController: ToastController,
    private alertController: AlertController,
    private deliveryAssignmentService: DeliveryAssignmentService,
    private driversFranceService: DriversFranceService
  ) { }

  ngOnInit() {
    this.initializeOrders();
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  private async initializeOrders() {
    this.isLoading = true;
    
    // S'abonner aux changements de commandes
    this.ordersSubscription = this.franceOrdersService.orders$.subscribe(orders => {
      this.orders = orders;
      this.isLoading = false;
    });

    try {
      // Charger les commandes initiales
      await this.franceOrdersService.loadOrders(this.restaurantId);
    } catch (error) {
      console.error('Erreur initialisation commandes:', error);
      this.isLoading = false;
    }
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
    if (this.selectedFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.selectedFilter);
  }

  getOrderCountByStatus(status: string): number {
    if (status === 'all') {
      return this.orders.length;
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
      'en_attente': 'en_attente',
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

        // Optionnel : Démarrer un monitoring de l'assignation
        this.monitorAssignmentProgress(order.id);

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
   * Surveiller le progrès de l'assignation
   */
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

  /**
   * Vérifier si une commande peut être assignée automatiquement
   */
  canStartDeliveryAssignment(order: FranceOrder): boolean {
    return order.status === 'prete' && 
           order.delivery_mode === 'livraison' && 
           !order.driver_id && // CORRIGÉ : utiliser driver_id au lieu de assigned_driver_id
           (!order.driver_assignment_status || order.driver_assignment_status === 'none');
  }

  /**
   * Obtenir le statut d'assignation pour affichage
   */
  getAssignmentStatusText(order: FranceOrder): string {
    if (!order.assigned_driver_id) {
      return 'Non assignée';
    }
    
    // TODO: Récupérer le nom du livreur assigné
    return `Assignée (ID: ${order.assigned_driver_id})`;
  }

  /**
   * Obtenir la couleur du statut d'assignation
   */
  getAssignmentStatusColor(order: FranceOrder): string {
    if (!order.assigned_driver_id) {
      return 'warning';
    }
    return 'success';
  }

}