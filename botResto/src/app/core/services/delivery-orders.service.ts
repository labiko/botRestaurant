import { Injectable } from '@angular/core';
import { FuseauHoraireService } from './fuseau-horaire.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseFranceService } from './supabase-france.service';
import { FranceOrder, OrderAction } from './france-orders.service';

export interface DeliveryOrder extends FranceOrder {
  driver_id?: number;
  driver_name?: string;
  estimated_delivery_time?: string;
  delivery_instructions?: string;
  france_restaurants?: {
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryOrdersService {

  private driverOrdersSubject = new BehaviorSubject<DeliveryOrder[]>([]);
  private availableOrdersSubject = new BehaviorSubject<DeliveryOrder[]>([]);
  
  public driverOrders$ = this.driverOrdersSubject.asObservable();
  public availableOrders$ = this.availableOrdersSubject.asObservable();

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private fuseauHoraireService: FuseauHoraireService
  ) { }

  /**
   * Charger les commandes assignées à un livreur spécifique
   */
  async loadDriverOrders(driverId: number): Promise<void> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          *,
          france_restaurants!inner(name)
        `)
        .eq('driver_id', driverId)
        .in('status', ['prete', 'en_livraison'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement commandes livreur:', error);
        this.driverOrdersSubject.next([]);
        return;
      }

      const processedOrders = data?.map((order: any) => this.processDeliveryOrder(order)) || [];
      this.driverOrdersSubject.next(processedOrders);
      console.log(`✅ [DeliveryOrders] ${processedOrders.length} commandes chargées pour livreur ${driverId}`);
    } catch (error) {
      console.error('Erreur service commandes livreur:', error);
      this.driverOrdersSubject.next([]);
    }
  }

  /**
   * Charger toutes les commandes prêtes pour livraison (non assignées)
   * @param restaurantId - ID du restaurant
   * @param includeAssigned - Inclure aussi les commandes assignées (pour mode token)
   */
  async loadAvailableOrders(restaurantId: number, includeAssigned: boolean = false): Promise<void> {
    console.log('🔍 [DeliveryOrders] loadAvailableOrders - Restaurant ID:', restaurantId);
    console.log('🔍 [DeliveryOrders] Include Assigned:', includeAssigned);
    
    try {
      // Construction de la requête de base
      let query = this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          *,
          france_restaurants!inner(name)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('delivery_mode', 'livraison');
      
      // Si includeAssigned est true, inclure les commandes assignées
      if (includeAssigned) {
        console.log('🔍 [DeliveryOrders] Mode token - Inclusion des commandes assignées');
        query = query.in('status', ['prete', 'assignee']);
        // Pas de filtre sur driver_id pour inclure toutes les commandes
      } else {
        console.log('🔍 [DeliveryOrders] Mode normal - Uniquement commandes prêtes non assignées');
        query = query
          .eq('status', 'prete')
          .is('driver_id', null);
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur chargement commandes disponibles:', error);
        this.availableOrdersSubject.next([]);
        return;
      }

      console.log('🔍 [DeliveryOrders] loadAvailableOrders - Raw data from DB:', data);
      console.log('🔍 [DeliveryOrders] loadAvailableOrders - Orders count:', data?.length || 0);
      
      // Log détaillé pour chaque commande
      data?.forEach((order: any, index: number) => {
        console.log(`🔍 [DeliveryOrders] Order ${index + 1} - Number: ${order.order_number}`);
        console.log(`🔍 [DeliveryOrders] Order ${index + 1} - Items:`, order.items);
        console.log(`🔍 [DeliveryOrders] Order ${index + 1} - Items type:`, typeof order.items);
      });

      const processedOrders = data?.map((order: any) => this.processDeliveryOrder(order)) || [];
      console.log('✅ [DeliveryOrders] loadAvailableOrders - Processed orders:', processedOrders.length);
      this.availableOrdersSubject.next(processedOrders);
      console.log(`✅ [DeliveryOrders] ${processedOrders.length} commandes disponibles`);
    } catch (error) {
      console.error('Erreur service commandes disponibles:', error);
      this.availableOrdersSubject.next([]);
    }
  }

  private processDeliveryOrder(order: any): DeliveryOrder {
    // Ajouter seulement le calcul des prix aux items sans changer le format existant
    const enhancedItems = this.enhanceItemsWithPrices(order.items);
    
    return {
      ...order,
      items: enhancedItems,
      availableActions: this.getDeliveryActions(order.status, !!order.driver_id)
    };
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

  getDeliveryActions(status: string, hasDriver: boolean): OrderAction[] {
    const actions: { [key: string]: OrderAction[] } = {
      'prete': hasDriver ? [
        { key: 'start_delivery', label: 'Commencer livraison', color: 'primary', nextStatus: 'en_livraison' }
      ] : [
        { key: 'accept', label: 'Accepter', color: 'success', nextStatus: 'prete' }
      ],
      'en_livraison': [
        { key: 'delivered', label: 'Marquer livrée', color: 'success', nextStatus: 'livree' }
      ]
    };

    return actions[status] || [];
  }

  /**
   * Accepter une commande (l'assigner au livreur)
   */
  async acceptOrder(orderId: number, driverId: number): Promise<boolean> {
    try {
      const { error } = await this.supabaseFranceService.client
        .from('france_orders')
        .update({
          driver_id: driverId,
          updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Erreur acceptation commande:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur service acceptation commande:', error);
      return false;
    }
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateDeliveryStatus(orderId: number, newStatus: string): Promise<boolean> {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
      };

      // Si on commence la livraison, ajouter l'heure estimée
      if (newStatus === 'en_livraison') {
        const estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + 30); // 30 min par défaut
        updateData.estimated_delivery_time = estimatedTime.toISOString();
      }

      const { error } = await this.supabaseFranceService.client
        .from('france_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Erreur mise à jour statut livraison:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur service mise à jour statut livraison:', error);
      return false;
    }
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'prete': 'success',
      'en_livraison': 'tertiary',
      'livree': 'success',
      'probleme': 'warning'
    };

    return statusColors[status] || 'medium';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'prete': 'Prête pour livraison',
      'en_livraison': 'En cours de livraison',
      'livree': 'Livrée',
      'probleme': 'Problème'
    };

    return statusTexts[status] || status;
  }

  formatPrice(amount: number): string {
    return `${amount.toFixed(2)}€`;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getDeliveryModeText(mode: string): string {
    const modes: { [key: string]: string } = {
      'sur_place': 'Sur place',
      'a_emporter': 'À emporter',
      'livraison': 'Livraison'
    };
    return modes[mode] || mode;
  }
}