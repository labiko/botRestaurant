import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface FranceOrder {
  id: number;
  restaurant_id: number;
  phone_number: string;
  customer_name?: string;
  items: any[];
  total_amount: number;
  delivery_mode: string;
  delivery_address?: string;
  payment_mode: string;
  payment_method?: string;
  status: string;
  notes?: string;
  order_number: string;
  created_at: string;
  updated_at: string;
  delivery_address_id?: number;
  delivery_validation_code?: string;
  date_validation_code?: string;
  availableActions?: OrderAction[];
}

export interface OrderAction {
  key: string;
  label: string;
  color: string;
  nextStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class FranceOrdersService {
  private ordersSubject = new BehaviorSubject<FranceOrder[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private supabaseService: SupabaseService) { }

  async loadOrders(restaurantId: number): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('france_orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement commandes France:', error);
        // Initialiser avec tableau vide en cas d'erreur
        this.ordersSubject.next([]);
        return;
      }

      const processedOrders = data?.map((order: any) => this.processOrder(order)) || [];
      this.ordersSubject.next(processedOrders);
      console.log(`✅ [FranceOrders] ${processedOrders.length} commandes chargées`);
    } catch (error) {
      console.error('Erreur service commandes France:', error);
      // Initialiser avec tableau vide en cas d'exception
      this.ordersSubject.next([]);
    }
  }

  private processOrder(order: any): FranceOrder {
    return {
      ...order,
      availableActions: this.getAvailableActions(order.status)
    };
  }

  getAvailableActions(status: string): OrderAction[] {
    const actions: { [key: string]: OrderAction[] } = {
      'en_attente': [
        { key: 'confirm', label: 'Confirmer', color: 'success', nextStatus: 'confirmee' },
        { key: 'cancel', label: 'Annuler', color: 'danger', nextStatus: 'annulee' }
      ],
      'confirmee': [
        { key: 'prepare', label: 'Préparer', color: 'warning', nextStatus: 'preparation' },
        { key: 'cancel', label: 'Annuler', color: 'danger', nextStatus: 'annulee' }
      ],
      'preparation': [
        { key: 'ready', label: 'Marquer prête', color: 'primary', nextStatus: 'prete' }
      ],
      'prete': [
        { key: 'deliver', label: 'En livraison', color: 'secondary', nextStatus: 'en_livraison' }
      ],
      'en_livraison': [
        { key: 'delivered', label: 'Marquer livrée', color: 'success', nextStatus: 'livree' }
      ]
    };

    return actions[status] || [];
  }

  async updateOrderStatus(orderId: number, newStatus: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.client
        .from('france_orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Erreur mise à jour statut:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur service mise à jour statut:', error);
      return false;
    }
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'en_attente': 'warning',
      'confirmee': 'primary',
      'preparation': 'secondary',
      'prete': 'success',
      'en_livraison': 'tertiary',
      'livree': 'success',
      'annulee': 'danger'
    };

    return statusColors[status] || 'medium';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'preparation': 'En préparation',
      'prete': 'Prête',
      'en_livraison': 'En livraison',
      'livree': 'Livrée',
      'annulee': 'Annulée'
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

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  }
}