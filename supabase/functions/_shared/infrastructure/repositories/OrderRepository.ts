/**
 * Repository pour les Commandes
 * Infrastructure Layer - Implémentation Supabase
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Order, IOrderItem, OrderMode, OrderStatus, PaymentMode, PaymentStatus, PaymentMethod } from '../../domain/entities/Order.ts';
import { IRepositoryWithFilter, IPaginatedResult } from '../../core/interfaces/IRepository.ts';

interface OrderRecord {
  id: string;
  numero_commande: string;
  client_id: string;
  restaurant_id: string;
  items: any[];
  sous_total: number;
  frais_livraison: number;
  total: number;
  mode: OrderMode;
  adresse_livraison?: string;
  latitude_livraison?: number;
  longitude_livraison?: number;
  distance_km?: number;
  statut: OrderStatus;
  paiement_mode?: PaymentMode;
  paiement_statut: PaymentStatus;
  paiement_methode?: PaymentMethod;
  livreur_nom?: string;
  livreur_phone?: string;
  note_client?: string;
  note_restaurant?: string;
  created_at?: string;
  confirmed_at?: string;
  prepared_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  estimated_time?: string;
}

export class OrderRepository implements IRepositoryWithFilter<Order> {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('commandes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('commandes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findByFilter(filter: Record<string, any>): Promise<Order[]> {
    let query = this.supabase.from('commandes').select('*');

    Object.entries(filter).forEach(([key, value]) => {
      const dbKey = this.mapFieldToDb(key);
      if (Array.isArray(value)) {
        query = query.in(dbKey, value);
      } else {
        query = query.eq(dbKey, value);
      }
    });

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findOne(filter: Record<string, any>): Promise<Order | null> {
    const results = await this.findByFilter(filter);
    return results.length > 0 ? results[0] : null;
  }

  async create(order: Order): Promise<Order> {
    const record = this.mapToRecord(order);

    const { data, error } = await this.supabase
      .from('commandes')
      .insert(record)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create order: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    const record = this.mapToRecord(updates as Order, true);

    const { data, error } = await this.supabase
      .from('commandes')
      .update(record)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to update order:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('commandes')
      .delete()
      .eq('id', id);

    return !error;
  }

  /**
   * Méthodes spécifiques aux commandes
   */

  async findByOrderNumber(numeroCommande: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('commandes')
      .select('*')
      .eq('numero_commande', numeroCommande)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByClient(clientId: string, limit: number = 20): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('commandes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findByClientPhone(phoneWhatsapp: string, limit: number = 10): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('commandes')
      .select(`
        *,
        clients!inner(phone_whatsapp)
      `)
      .eq('clients.phone_whatsapp', phoneWhatsapp)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findByRestaurant(
    restaurantId: string,
    status?: OrderStatus[],
    limit: number = 50
  ): Promise<Order[]> {
    let query = this.supabase
      .from('commandes')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (status && status.length > 0) {
      query = query.in('statut', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findActiveOrders(restaurantId?: string): Promise<Order[]> {
    const activeStatuses: OrderStatus[] = ['en_attente', 'confirmee', 'preparation', 'prete', 'en_livraison'];
    
    let query = this.supabase
      .from('commandes')
      .select('*')
      .in('statut', activeStatuses);

    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findOrdersPaginated(
    page: number,
    pageSize: number,
    filters?: {
      restaurantId?: string;
      clientId?: string;
      status?: OrderStatus[];
      mode?: OrderMode;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<IPaginatedResult<Order>> {
    const offset = (page - 1) * pageSize;
    let query = this.supabase.from('commandes').select('*', { count: 'exact' });

    if (filters) {
      if (filters.restaurantId) {
        query = query.eq('restaurant_id', filters.restaurantId);
      }
      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters.status && filters.status.length > 0) {
        query = query.in('statut', filters.status);
      }
      if (filters.mode) {
        query = query.eq('mode', filters.mode);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error || !data) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        hasNext: false,
        hasPrevious: false
      };
    }

    const orders = data.map(record => this.mapToEntity(record));
    const total = count || 0;

    return {
      data: orders,
      total,
      page,
      pageSize,
      hasNext: offset + pageSize < total,
      hasPrevious: page > 1
    };
  }

  async updateStatus(id: string, status: OrderStatus, timestamp?: Date): Promise<boolean> {
    const updates: any = {
      statut: status,
      updated_at: new Date().toISOString()
    };

    // Mettre à jour les timestamps selon le statut
    const now = timestamp || new Date();
    switch (status) {
      case 'confirmee':
        updates.confirmed_at = now.toISOString();
        break;
      case 'preparation':
        updates.prepared_at = now.toISOString();
        break;
      case 'livree':
      case 'terminee':
        updates.delivered_at = now.toISOString();
        break;
      case 'annulee':
        updates.cancelled_at = now.toISOString();
        break;
    }

    const { error } = await this.supabase
      .from('commandes')
      .update(updates)
      .eq('id', id);

    return !error;
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    paymentMethod?: PaymentMethod
  ): Promise<boolean> {
    const updates: any = {
      paiement_statut: paymentStatus,
      updated_at: new Date().toISOString()
    };

    if (paymentMethod) {
      updates.paiement_methode = paymentMethod;
    }

    const { error } = await this.supabase
      .from('commandes')
      .update(updates)
      .eq('id', id);

    return !error;
  }

  async assignDeliveryPerson(id: string, livreurNom: string, livreurPhone: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('commandes')
      .update({
        livreur_nom: livreurNom,
        livreur_phone: livreurPhone,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return !error;
  }

  async addNote(id: string, note: string, isClientNote: boolean = true): Promise<boolean> {
    const field = isClientNote ? 'note_client' : 'note_restaurant';
    
    const { error } = await this.supabase
      .from('commandes')
      .update({
        [field]: note,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return !error;
  }

  async getOrdersStats(restaurantId?: string, dateFrom?: Date, dateTo?: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    ordersByMode: Record<OrderMode, number>;
  }> {
    const { data, error } = await this.supabase
      .rpc('get_orders_stats', {
        restaurant_id: restaurantId,
        date_from: dateFrom?.toISOString(),
        date_to: dateTo?.toISOString()
      });

    if (error || !data) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {} as Record<OrderStatus, number>,
        ordersByMode: {} as Record<OrderMode, number>
      };
    }

    return data;
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('commandes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  private mapFieldToDb(field: string): string {
    const mapping: Record<string, string> = {
      numeroCommande: 'numero_commande',
      clientId: 'client_id',
      restaurantId: 'restaurant_id',
      sousTotal: 'sous_total',
      fraisLivraison: 'frais_livraison',
      adresseLivraison: 'adresse_livraison',
      latitudeLivraison: 'latitude_livraison',
      longitudeLivraison: 'longitude_livraison',
      distanceKm: 'distance_km',
      paiementMode: 'paiement_mode',
      paiementStatut: 'paiement_statut',
      paiementMethode: 'paiement_methode',
      livreurNom: 'livreur_nom',
      livreurPhone: 'livreur_phone',
      noteClient: 'note_client',
      noteRestaurant: 'note_restaurant',
      createdAt: 'created_at',
      confirmedAt: 'confirmed_at',
      preparedAt: 'prepared_at',
      deliveredAt: 'delivered_at',
      cancelledAt: 'cancelled_at',
      estimatedTime: 'estimated_time'
    };
    
    return mapping[field] || field;
  }

  private mapToEntity(record: OrderRecord): Order {
    return new Order(
      record.id,
      record.numero_commande,
      record.client_id,
      record.restaurant_id,
      record.items || [],
      record.sous_total,
      record.frais_livraison,
      record.total,
      record.mode,
      record.statut,
      record.paiement_mode,
      record.paiement_statut,
      record.paiement_methode,
      record.adresse_livraison,
      record.latitude_livraison,
      record.longitude_livraison,
      record.distance_km,
      record.livreur_nom,
      record.livreur_phone,
      record.note_client,
      record.note_restaurant,
      record.created_at ? new Date(record.created_at) : undefined,
      record.confirmed_at ? new Date(record.confirmed_at) : undefined,
      record.prepared_at ? new Date(record.prepared_at) : undefined,
      record.delivered_at ? new Date(record.delivered_at) : undefined,
      record.cancelled_at ? new Date(record.cancelled_at) : undefined,
      record.estimated_time ? new Date(record.estimated_time) : undefined
    );
  }

  private mapToRecord(order: Order, isUpdate: boolean = false): Partial<OrderRecord> {
    const record: Partial<OrderRecord> = {
      numero_commande: order.numeroCommande,
      client_id: order.clientId,
      restaurant_id: order.restaurantId,
      items: order.items,
      sous_total: order.sousTotal,
      frais_livraison: order.fraisLivraison,
      total: order.total,
      mode: order.mode,
      adresse_livraison: order.adresseLivraison,
      latitude_livraison: order.latitudeLivraison,
      longitude_livraison: order.longitudeLivraison,
      distance_km: order.distanceKm,
      statut: order.statut,
      paiement_mode: order.paiementMode,
      paiement_statut: order.paiementStatut,
      paiement_methode: order.paiementMethode,
      livreur_nom: order.livreurNom,
      livreur_phone: order.livreurPhone,
      note_client: order.noteClient,
      note_restaurant: order.noteRestaurant,
      estimated_time: order.estimatedTime?.toISOString()
    };

    if (!isUpdate) {
      record.id = order.id;
    }

    return record;
  }
}