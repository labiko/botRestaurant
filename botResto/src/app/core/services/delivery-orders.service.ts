import { Injectable } from '@angular/core';
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

  constructor(private supabaseFranceService: SupabaseFranceService) { }

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
   */
  async loadAvailableOrders(restaurantId: number): Promise<void> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          *,
          france_restaurants!inner(name)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'prete')
        .eq('delivery_mode', 'livraison')
        .is('driver_id', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur chargement commandes disponibles:', error);
        this.availableOrdersSubject.next([]);
        return;
      }

      const processedOrders = data?.map((order: any) => this.processDeliveryOrder(order)) || [];
      this.availableOrdersSubject.next(processedOrders);
      console.log(`✅ [DeliveryOrders] ${processedOrders.length} commandes disponibles`);
    } catch (error) {
      console.error('Erreur service commandes disponibles:', error);
      this.availableOrdersSubject.next([]);
    }
  }

  private processDeliveryOrder(order: any): DeliveryOrder {
    return {
      ...order,
      availableActions: this.getDeliveryActions(order.status, !!order.driver_id)
    };
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
          updated_at: new Date().toISOString()
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
        updated_at: new Date().toISOString()
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