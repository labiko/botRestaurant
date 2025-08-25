import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

// Use same Order interface as the main orders service
export interface Order {
  id: string;
  numero_commande: string;
  client_nom: string;
  client_phone: string;
  items: OrderItem[];
  sous_total: number;
  frais_livraison: number;
  total: number;
  mode: 'sur_place' | 'emporter' | 'livraison';
  adresse_livraison?: string;
  latitude_livraison?: number;
  longitude_livraison?: number;
  distance_km?: number;
  statut: 'en_attente' | 'confirmee' | 'preparation' | 'prete' | 'en_livraison' | 'livree' | 'terminee' | 'annulee';
  paiement_mode: 'maintenant' | 'fin_repas' | 'recuperation' | 'livraison';
  paiement_statut: 'en_attente' | 'paye' | 'echoue' | 'rembourse';
  livreur_nom?: string;
  livreur_phone?: string;
  note_client?: string;
  note_restaurant?: string;
  created_at: string;
  estimated_time?: string;
  confirmed_at?: string;
  prepared_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  assigned_at?: string;
  accepted_by_delivery_at?: string;
  validation_code?: string;
}

export interface OrderItem {
  nom_plat: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantHistoryService {
  private historySubject = new BehaviorSubject<Order[]>([]);

  constructor(private supabase: SupabaseService) {}

  // Load restaurant history (closed orders only)
  async loadRestaurantHistory(restaurantId: string): Promise<Order[]> {
    try {
      // Get closed orders for this restaurant
      const { data: orders, error: ordersError } = await this.supabase
        .from('commandes')
        .select(`
          id,
          numero_commande,
          client_id,
          items,
          sous_total,
          frais_livraison,
          total,
          mode,
          adresse_livraison,
          latitude_livraison,
          longitude_livraison,
          distance_km,
          statut,
          paiement_mode,
          paiement_statut,
          livreur_nom,
          livreur_phone,
          note_client,
          note_restaurant,
          created_at,
          estimated_time,
          confirmed_at,
          prepared_at,
          delivered_at,
          cancelled_at,
          assigned_at,
          accepted_by_delivery_at,
          validation_code
        `)
        .eq('restaurant_id', restaurantId)
        .in('statut', ['livree', 'terminee', 'annulee'])
        .order('created_at', { ascending: false })
        .limit(100); // Limit to last 100 closed orders

      if (ordersError) {
        console.error('Error loading history:', ordersError);
        return [];
      }

      console.log('Raw history data from database:', orders);

      if (!orders || orders.length === 0) {
        this.historySubject.next([]);
        return [];
      }

      // Get unique client IDs
      const clientIds = [...new Set(orders.map(order => order.client_id))];

      // Get client information
      const { data: clients, error: clientsError } = await this.supabase
        .from('clients')
        .select('id, nom, phone')
        .in('id', clientIds);

      if (clientsError) {
        console.error('Error loading clients:', clientsError);
      }

      // Create client map
      const clientMap = new Map();
      clients?.forEach(client => {
        clientMap.set(client.id, client);
      });

      // Map orders with client information
      const mappedOrders: Order[] = orders.map(order => {
        const client = clientMap.get(order.client_id) || { nom: 'Client', phone: '' };
        
        return {
          id: order.id,
          numero_commande: order.numero_commande,
          client_nom: client.nom || 'Client',
          client_phone: client.phone || '',
          items: this.parseOrderItems(order.items),
          sous_total: order.sous_total || 0,
          frais_livraison: order.frais_livraison || 0,
          total: order.total || 0,
          mode: order.mode,
          adresse_livraison: order.adresse_livraison,
          latitude_livraison: order.latitude_livraison,
          longitude_livraison: order.longitude_livraison,
          distance_km: order.distance_km,
          statut: order.statut,
          paiement_mode: order.paiement_mode,
          paiement_statut: order.paiement_statut,
          livreur_nom: order.livreur_nom,
          livreur_phone: order.livreur_phone,
          note_client: order.note_client,
          note_restaurant: order.note_restaurant,
          created_at: order.created_at,
          estimated_time: order.estimated_time,
          confirmed_at: order.confirmed_at,
          prepared_at: order.prepared_at,
          delivered_at: order.delivered_at,
          cancelled_at: order.cancelled_at,
          assigned_at: order.assigned_at,
          accepted_by_delivery_at: order.accepted_by_delivery_at,
          validation_code: order.validation_code
        };
      });

      this.historySubject.next(mappedOrders);
      return mappedOrders;
    } catch (error) {
      console.error('Error loading restaurant history:', error);
      this.historySubject.next([]);
      return [];
    }
  }

  // Parse order items from JSON
  private parseOrderItems(items: any): OrderItem[] {
    try {
      let parsedItems: any[] = [];
      
      if (typeof items === 'string') {
        parsedItems = JSON.parse(items);
      } else if (Array.isArray(items)) {
        parsedItems = items;
      } else {
        return [];
      }
      
      // Map and validate each item
      return parsedItems.map(item => {
        // Handle different possible field names from database
        const nom_plat = item.nom_plat || item.name || 'Article';
        const quantite = Number(item.quantite || item.quantity || 1);
        const prix_unitaire = Number(item.prix_unitaire || item.price || item.sous_total / quantite || 0);
        const prix_total = Number(item.prix_total || item.sous_total || (prix_unitaire * quantite) || 0);
        
        console.log(`Item parsed: ${nom_plat}, qty: ${quantite}, unit: ${prix_unitaire}, total: ${prix_total}`);
        
        return {
          nom_plat,
          quantite,
          prix_unitaire,
          prix_total
        };
      });
    } catch (error) {
      console.error('Error parsing order items:', error, items);
      return [];
    }
  }

  // Get current history orders
  getHistoryOrders(): Observable<Order[]> {
    return this.historySubject.asObservable();
  }
}