import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthFranceService, FranceUser } from '../../auth-france/services/auth-france.service';
import { DeliveryOrdersService, DeliveryOrder } from '../../../../core/services/delivery-orders.service';
import { SupabaseFranceService } from '../../../../core/services/supabase-france.service';
import { LoadingController } from '@ionic/angular';
import { DriverOnlineStatusService } from '../../../../core/services/driver-online-status.service';
import { DeliveryCountersService, DeliveryCounters } from '../../../../core/services/delivery-counters.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: false
})
export class HistoryPage implements OnInit, OnDestroy {
  currentDriver: FranceUser | null = null;
  historyOrders: DeliveryOrder[] = [];
  isLoading = false;
  
  // Compteurs partagés pour les badges
  currentCounters: DeliveryCounters = {
    myOrdersCount: 0,
    availableOrdersCount: 0,
    historyOrdersCount: 0
  };

  // Statut en ligne/hors ligne
  isOnline = false;
  isToggling = false;

  private userSubscription?: Subscription;
  private historyOrdersSubscription?: Subscription;
  private onlineStatusSubscription?: Subscription;
  private countersSubscription?: Subscription;

  constructor(
    private authFranceService: AuthFranceService,
    private deliveryOrdersService: DeliveryOrdersService,
    private supabaseFranceService: SupabaseFranceService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private driverOnlineStatusService: DriverOnlineStatusService,
    private deliveryCountersService: DeliveryCountersService
  ) {}

  ngOnInit() {
    this.initializeData();
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.historyOrdersSubscription?.unsubscribe();
    this.onlineStatusSubscription?.unsubscribe();
    this.countersSubscription?.unsubscribe();
  }

  /**
   * Initialiser les données
   */
  private async initializeData() {
    // S'abonner aux compteurs partagés pour les badges
    this.countersSubscription = this.deliveryCountersService.counters$.subscribe(counters => {
      this.currentCounters = counters;
      console.log(`🔢 [History] Compteurs reçus:`, counters);
    });
    
    // S'abonner aux données utilisateur
    this.userSubscription = this.authFranceService.currentUser$.subscribe(user => {
      // Ignorer undefined (en cours de vérification)
      if (user !== undefined) {
        this.currentDriver = user;
        if (user && user.type === 'driver') {
          this.loadHistoryOrders();
          this.initializeOnlineStatus();
        }
      }
    });
  }

  /**
   * Charger l'historique des commandes livrées et validées
   */
  private async loadHistoryOrders() {
    if (!this.currentDriver) {
      console.log('❌ [History] Pas de driver connecté');
      return;
    }

    console.log(`🔍 [History] Recherche historique pour driver ID: ${this.currentDriver.id}`);
    this.isLoading = true;
    
    try {
      // D'abord, chercher toutes les commandes du driver (pour diagnostiquer)
      const { data: allDriverOrders, error: allError } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('id, status, driver_id, date_validation_code, delivery_validation_code, created_at, updated_at')
        .eq('driver_id', this.currentDriver.id);

      console.log(`📊 [History] Toutes les commandes du driver:`, allDriverOrders);

      if (allDriverOrders) {
        console.log(`📊 [History] Répartition par statut:`);
        const statusCount: any = {};
        const validationCount = { with: 0, without: 0 };
        
        allDriverOrders.forEach(order => {
          statusCount[order.status] = (statusCount[order.status] || 0) + 1;
          if (order.date_validation_code) {
            validationCount.with++;
          } else {
            validationCount.without++;
          }
        });
        
        console.log(`📊 [History] Statuts:`, statusCount);
        console.log(`📊 [History] Validation:`, validationCount);
      }

      // Maintenant chercher spécifiquement l'historique
      const { data: historyOrders, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          *,
          france_restaurants!inner(name)
        `)
        .eq('driver_id', this.currentDriver.id)
        .eq('status', 'livree')
        .not('date_validation_code', 'is', null)
        .order('updated_at', { ascending: false });

      console.log(`🔍 [History] Requête historique - résultat:`, historyOrders);
      console.log(`🔍 [History] Erreur éventuelle:`, error);

      if (error) {
        console.error('❌ [History] Erreur chargement historique:', error);
        this.historyOrders = [];
        this.isLoading = false;
        return;
      }

      // Traiter les commandes pour l'affichage
      const processedOrders = historyOrders?.map((order: any) => ({
        ...order,
        availableActions: []
      })) || [];
      
      this.historyOrders = processedOrders;
      this.isLoading = false;
      
      // Mettre à jour le compteur dans le service partagé
      this.deliveryCountersService.updateHistoryOrdersCount(processedOrders.length);
      
      console.log(`✅ [History] ${processedOrders.length} commandes dans l'historique (validées)`);
      
      if (processedOrders.length === 0) {
        console.log(`💡 [History] Aucune commande trouvée. Critères:
        - driver_id: ${this.currentDriver.id}
        - status: 'livree'
        - date_validation_code: not null`);
      }
    } catch (error) {
      console.error('❌ [History] Erreur exception:', error);
      this.historyOrders = [];
      this.isLoading = false;
    }
  }

  /**
   * FONCTIONS UTILITAIRES - IDENTIQUES À MY-ORDERS
   */

  getOrderStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'assignee': 'warning',
      'en_livraison': 'primary', 
      'livree': 'success',
      'annulee': 'danger'
    };
    return colors[status] || 'medium';
  }

  getOrderStatusText(status: string): string {
    const texts: Record<string, string> = {
      'assignee': 'Assignée',
      'en_livraison': 'En livraison',
      'livree': 'Livrée',
      'annulee': 'Annulée'
    };
    return texts[status] || status;
  }

  getCustomerName(order: DeliveryOrder): string {
    return order.customer_name || 'Client';
  }

  getItemsCount(order: DeliveryOrder): number {
    if (!order.items) return 0;
    
    try {
      let itemsData = order.items;
      
      // Parser si c'est une string JSON
      if (typeof order.items === 'string') {
        itemsData = JSON.parse(order.items);
      }
      
      // Compter les clés dans l'objet items (chaque clé = un item)
      if (itemsData && typeof itemsData === 'object') {
        return Object.keys(itemsData).length;
      }
      
      return 0;
    } catch (error) {
      console.error(`❌ [History] Erreur comptage items:`, error);
      return 0;
    }
  }

  getDeliveryZone(address?: string): string {
    return address || 'Adresse non spécifiée';
  }

  formatPrice(amount: number): string {
    return `${amount.toFixed(2)}€`;
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Gestion accordéon détails
  private expandedOrders = new Set<number>();

  toggleOrderDetail(order: DeliveryOrder) {
    if (this.expandedOrders.has(order.id)) {
      this.expandedOrders.delete(order.id);
    } else {
      this.expandedOrders.add(order.id);
    }
  }

  isOrderExpanded(order: DeliveryOrder): boolean {
    return this.expandedOrders.has(order.id);
  }

  // Fonctions détails articles
  hasOrderItems(order: DeliveryOrder): boolean {
    if (!order.items) {
      return false;
    }
    
    // Les items peuvent être une string JSON ou un objet
    if (typeof order.items === 'string') {
      try {
        const parsedItems = JSON.parse(order.items);
        const hasItems = parsedItems && Object.keys(parsedItems).length > 0;
        return hasItems;
      } catch (error) {
        console.error(`❌ [History] Erreur parsing items string:`, error);
        return false;
      }
    }
    
    // Si c'est déjà un objet
    const hasItems = order.items && Object.keys(order.items).length > 0;
    return hasItems;
  }

  getOrderItems(order: DeliveryOrder): any[] {
    if (!order.items) {
      return [];
    }
    
    try {
      let itemsData = order.items;
      
      // Parser si c'est une string JSON
      if (typeof order.items === 'string') {
        itemsData = JSON.parse(order.items);
      }
      
      // Les items sont dans un format objet avec des clés comme "item_2_..."
      const itemsArray: any[] = [];
      
      if (itemsData && typeof itemsData === 'object') {
        Object.entries(itemsData).forEach(([key, value]: [string, any]) => {
          // Extraire les données de l'item
          if (value && value.item) {
            const processedItem = {
              ...value.item,
              quantity: value.quantity || 1,
              key: key
            };
            itemsArray.push(processedItem);
          }
        });
      }
      
      return itemsArray;
    } catch (error) {
      console.error(`❌ [History] Erreur parsing items:`, error);
      return [];
    }
  }

  hasSelectedOptions(selectedOptions: any): boolean {
    if (!selectedOptions) return false;
    if (typeof selectedOptions === 'string') {
      try {
        selectedOptions = JSON.parse(selectedOptions);
      } catch {
        return false;
      }
    }
    return selectedOptions && Object.keys(selectedOptions).length > 0;
  }

  getSelectedOptionsGroups(selectedOptions: any): any[] {
    if (!this.hasSelectedOptions(selectedOptions)) return [];
    
    if (typeof selectedOptions === 'string') {
      try {
        selectedOptions = JSON.parse(selectedOptions);
      } catch {
        return [];
      }
    }

    return Object.entries(selectedOptions).map(([groupName, options]) => ({
      groupName,
      options: Array.isArray(options) ? options : [options]
    }));
  }

  formatOptionGroupName(groupName: string): string {
    const mapping: Record<string, string> = {
      'sauces': 'Sauces',
      'viandes': 'Viandes',
      'legumes': 'Légumes',
      'fromages': 'Fromages',
      'boissons': 'Boissons'
    };
    return mapping[groupName] || groupName;
  }

  shouldShowUpdateTime(order: DeliveryOrder): boolean {
    if (!order.updated_at) return false;
    const updatedTime = new Date(order.updated_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - updatedTime.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }

  getUpdateTimeText(order: DeliveryOrder): string {
    if (!order.updated_at) return '';
    const updatedTime = new Date(order.updated_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - updatedTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes === 1) return 'Il y a 1 minute';
    return `Il y a ${diffMinutes} minutes`;
  }

  // Actions
  callCustomer(phoneNumber: string) {
    window.open(`tel:${phoneNumber}`);
  }

  openDirections(address: string) {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps?q=${encodedAddress}`, '_blank');
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Déconnexion
   */
  async logout() {
    const alert = await this.alertController.create({
      header: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Se déconnecter',
          handler: async () => {
            await this.authFranceService.logout();
            this.router.navigate(['/restaurant-france/auth-france/login-france']);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * SYSTÈME DE STATUT EN LIGNE/HORS LIGNE
   */

  /**
   * Initialiser le statut en ligne du livreur
   */
  private async initializeOnlineStatus() {
    if (!this.currentDriver) return;

    try {
      // Charger le statut initial depuis la base de données
      await this.driverOnlineStatusService.loadInitialStatus(this.currentDriver.id);

      // S'abonner aux changements de statut
      this.onlineStatusSubscription = this.driverOnlineStatusService.onlineStatus$.subscribe(isOnline => {
        this.isOnline = isOnline;
        console.log(`📱 [History] Statut mis à jour: ${isOnline ? 'En ligne' : 'Hors ligne'}`);
      });

    } catch (error) {
      console.error('❌ [History] Erreur initialisation statut en ligne:', error);
    }
  }

  /**
   * Basculer le statut en ligne/hors ligne
   */
  async toggleOnlineStatus() {
    if (!this.currentDriver || this.isToggling) return;

    this.isToggling = true;

    try {
      const result = await this.driverOnlineStatusService.toggleOnlineStatus(this.currentDriver.id);
      
      if (result.success) {
        this.presentToast(result.message);
        
        // Si on vient de se mettre en ligne, recharger les données disponibles
        if (result.newStatus) {
          console.log('✅ [History] Livreur en ligne - données actualisées');
        } else {
          console.log('⏸️ [History] Livreur hors ligne');
        }
      } else {
        this.presentToast(result.message);
      }
    } catch (error) {
      console.error('❌ [History] Erreur toggle statut:', error);
      this.presentToast('Erreur lors de la mise à jour du statut');
    } finally {
      this.isToggling = false;
    }
  }

  /**
   * Obtenir le texte de statut pour l'affichage
   */
  getStatusText(): string {
    return this.driverOnlineStatusService.getStatusText();
  }

  /**
   * Obtenir la couleur de statut pour l'affichage  
   */
  getStatusColor(): string {
    return this.driverOnlineStatusService.getStatusColor();
  }

  /**
   * Obtenir l'icône de statut pour l'affichage
   */
  getStatusIcon(): string {
    return this.driverOnlineStatusService.getStatusIcon();
  }

  /**
   * Rafraîchir les données lors du clic sur le tab
   */
  refreshHistory() {
    console.log('🔄 [History] Rafraîchissement des données...');
    if (this.currentDriver) {
      this.loadHistoryOrders();
    }
  }

  /**
   * Pull to refresh - Rafraîchir les données en tirant vers le bas
   */
  async doRefresh(event: any) {
    console.log('🔄 [History] Pull to refresh déclenché');
    
    try {
      if (this.currentDriver) {
        await this.loadHistoryOrders();
      }
    } catch (error) {
      console.error('❌ [History] Erreur lors du rafraîchissement:', error);
    } finally {
      // Terminer l'animation de refresh après un court délai
      setTimeout(() => {
        event.target.complete();
      }, 500);
    }
  }
}
