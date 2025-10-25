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
import { DeliveryOrderItemsService } from '../../../../core/services/delivery-order-items.service';
import { UniversalOrderDisplayService, FormattedItem } from '../../../../core/services/universal-order-display.service';
import { FranceOrdersService } from '../../../../core/services/france-orders.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { RestaurantConfigService } from '../../services/restaurant-config.service';

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
  restaurantCurrency: string = 'EUR';

  // Compteurs partagés pour les badges
  currentCounters: DeliveryCounters = {
    myOrdersCount: 0,
    availableOrdersCount: 0,
    historyOrdersCount: 0
  };

  // Statut en ligne/hors ligne
  isOnline = false;
  isToggling = false;

  // Variables calculées pour éviter les recalculs constants
  public orderItemsCounts: { [orderId: number]: number } = {};
  public orderHasItems: { [orderId: number]: boolean } = {};
  public orderFormattedItems: { [orderId: number]: any[] } = {};

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
    private deliveryCountersService: DeliveryCountersService,
    private deliveryOrderItemsService: DeliveryOrderItemsService,
    private universalOrderDisplayService: UniversalOrderDisplayService,
    private franceOrdersService: FranceOrdersService,
    private currencyService: CurrencyService,
    private restaurantConfigService: RestaurantConfigService
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
          // Charger la configuration du restaurant pour récupérer la devise
          this.restaurantConfigService.getRestaurantConfig(user.restaurantId).subscribe(config => {
            this.restaurantCurrency = config.currency || 'EUR';
          });

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

      // Traiter les commandes pour l'affichage avec items enrichis en prix
      const processedOrders = historyOrders?.map((order: any) => ({
        ...order,
        items: this.enhanceItemsWithPrices(order.items),
        availableActions: []
      })) || [];
      
      this.historyOrders = processedOrders;
      this.isLoading = false;
      
      // Recalculer les données des commandes
      this.computeOrderData();
      
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
   * Recalculer les données des commandes pour éviter les recalculs constants
   */
  private computeOrderData(): void {
    this.historyOrders.forEach(order => {
      const formattedItems = this.getFormattedItems(order);
      this.orderItemsCounts[order.id] = formattedItems.reduce((total, item) => total + (item.quantity || 1), 0);
      this.orderHasItems[order.id] = formattedItems.length > 0;
      this.orderFormattedItems[order.id] = formattedItems;
    });
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
    return this.deliveryOrderItemsService.getOrderItems(order).length;
  }

  getDeliveryZone(address?: string): string {
    return address || 'Adresse non spécifiée';
  }

  formatPrice(amount: number): string {
    return this.restaurantConfigService.formatPrice(amount, this.restaurantCurrency);
  }

  formatTime(dateString: string): string {
    return this.franceOrdersService.formatTime(dateString);
  }

  formatDate(dateString: string): string {
    return this.franceOrdersService.formatDateTime(dateString).split(' ')[0];
  }

  formatDateTime(dateString: string): string {
    return this.franceOrdersService.formatDateTime(dateString);
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
    return this.deliveryOrderItemsService.hasOrderItems(order);
  }

  getOrderItems(order: DeliveryOrder): any[] {
    return this.deliveryOrderItemsService.getOrderItems(order);
  }

  /**
   * NOUVEAU - Formater les items avec le service universel (même format que restaurant)
   * CORRECTION : Convertir object → array pour cohérence avec UniversalOrderDisplayService
   */
  getFormattedItems(order: DeliveryOrder): FormattedItem[] {
    console.log('🍕 [History DEBUG] order.items:', order.items);
    console.log('🍕 [History DEBUG] order.items type:', typeof order.items);

    // CORRECTION : Convertir object → array si nécessaire (même fix que available-orders)
    let itemsArray: any[] = [];
    if (order.items && typeof order.items === 'object') {
      if (Array.isArray(order.items)) {
        itemsArray = order.items;
      } else {
        // Conversion object {0: {...}, 1: {...}} → array [{...}, {...}]
        itemsArray = Object.values(order.items);
      }
    }

    console.log('🍕 [History DEBUG] itemsArray après conversion:', itemsArray);

    // Utiliser UniversalOrderDisplayService directement comme côté restaurant
    const formattedItems = this.universalOrderDisplayService.formatOrderItems(itemsArray || []);
    console.log('🍕 [History DEBUG] formattedItems result:', formattedItems);

    return formattedItems;
  }

  hasSelectedOptions(selectedOptions: any): boolean {
    return this.deliveryOrderItemsService.hasSelectedOptions(selectedOptions);
  }

  getSelectedOptionsGroups(selectedOptions: any): any[] {
    return this.deliveryOrderItemsService.getSelectedOptionsGroups(selectedOptions);
  }

  formatOptionGroupName(groupName: string): string {
    return this.deliveryOrderItemsService.formatOptionGroupName(groupName);
  }

  shouldShowUpdateTime(order: DeliveryOrder): boolean {
    return this.deliveryOrderItemsService.shouldShowUpdateTime(order);
  }

  getUpdateTimeText(order: DeliveryOrder): string {
    return this.deliveryOrderItemsService.getUpdateTimeText(order);
  }

  // Actions
  callCustomer(phoneNumber: string) {
    window.open(`tel:${phoneNumber}`);
  }

  openDirections(address: string) {
    // Nettoyer le préfixe "Position GPS: " si présent
    const cleanAddress = address.replace(/^Position GPS:\s*/i, '');
    const encodedAddress = encodeURIComponent(cleanAddress);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
    window.open(url, '_blank');
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
   * Ajouter les propriétés price et total_price aux items existants
   * SANS changer le format de parsing qui fonctionne déjà
   */
  private enhanceItemsWithPrices(rawItems: any): any {
    if (!rawItems) return rawItems;

    // Si c'est un objet (format bot complexe), enrichir chaque item
    if (typeof rawItems === 'object' && rawItems !== null) {
      const enhanced: any = {};
      for (const [key, value] of Object.entries(rawItems)) {
        if (value && typeof value === 'object' && (value as any).item) {
          const item = (value as any).item;
          const quantity = (value as any).quantity || 1;
          
          enhanced[key] = {
            ...value,
            item: {
              ...item,
              // Ajouter les propriétés de prix manquantes
              price: item.final_price || item.base_price || 0,
              total_price: (item.final_price || item.base_price || 0) * quantity
            }
          };
        } else {
          enhanced[key] = value;
        }
      }
      return enhanced;
    }

    // Garder le format original pour les autres cas
    return rawItems;
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
