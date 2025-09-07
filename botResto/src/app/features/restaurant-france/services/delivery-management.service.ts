import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseFranceService } from '../../../core/services/supabase-france.service';

export interface DeliveryDriver {
  id: number;
  restaurant_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  is_active: boolean;
  is_online: boolean;
  current_latitude?: number;
  current_longitude?: number;
  last_location_update: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: number;
  phone_number: string;
  address_label: string;
  full_address: string;
  google_place_id?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  is_active: boolean;
  whatsapp_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryAssignment {
  id: number;
  order_id: number;
  driver_id: number;
  assignment_status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  responded_at?: string;
  expires_at?: string;
  response_time_seconds?: number;
}

export interface DeliveryNotification {
  id: number;
  assignment_id: number;
  notification_type: 'assignment_offer' | 'assignment_accepted' | 'assignment_rejected' | 'delivery_started' | 'delivery_completed';
  recipient_type: 'driver' | 'restaurant' | 'customer';
  recipient_id: string;
  notification_data: any;
  sent_at: string;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed';
  error_message?: string;
}

export interface FranceOrder {
  id: number;
  restaurant_id: number;
  phone_number: string;
  customer_name?: string;
  items: any;
  total_amount: number;
  delivery_mode?: string;
  delivery_address?: string;
  payment_mode?: string;
  payment_method?: string;
  status: string;
  notes?: string;
  order_number?: string;
  delivery_address_id?: number;
  delivery_validation_code?: string;
  date_validation_code?: string;
  driver_id?: number;
  estimated_delivery_time?: string;
  driver_assignment_status: 'none' | 'searching' | 'assigned' | 'delivered';
  delivery_started_at?: string;
  assignment_timeout_at?: string;
  assignment_started_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  id?: number;
  restaurant_id: number;
  zone_name: string;
  delivery_fee: number;
  min_order_amount: number;
  max_delivery_time_minutes: number;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryManagementService {
  private supabase: SupabaseClient;

  constructor(private supabaseFranceService: SupabaseFranceService) {
    this.supabase = this.supabaseFranceService.client;
  }

  /**
   * Récupère tous les livreurs d'un restaurant
   */
  getDeliveryDrivers(restaurantId: number): Observable<DeliveryDriver[]> {
    return from(
      this.supabase
        .from('france_delivery_drivers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as DeliveryDriver[];
      })
    );
  }

  /**
   * Récupère les livreurs actifs et en ligne
   */
  getAvailableDrivers(restaurantId: number): Observable<DeliveryDriver[]> {
    return from(
      this.supabase
        .from('france_delivery_drivers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .eq('is_online', true)
        .order('last_location_update', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as DeliveryDriver[];
      })
    );
  }

  /**
   * Crée un nouveau livreur
   */
  createDeliveryDriver(driver: Omit<DeliveryDriver, 'id' | 'created_at' | 'updated_at'>): Observable<DeliveryDriver> {
    return from(
      this.supabase
        .from('france_delivery_drivers')
        .insert(driver)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as DeliveryDriver;
      })
    );
  }

  /**
   * Met à jour un livreur
   */
  updateDeliveryDriver(driverId: number, updates: Partial<DeliveryDriver>): Observable<void> {
    return from(
      this.supabase
        .from('france_delivery_drivers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour le statut en ligne d'un livreur
   */
  updateDriverOnlineStatus(driverId: number, isOnline: boolean): Observable<void> {
    return from(
      this.supabase
        .from('france_delivery_drivers')
        .update({ 
          is_online: isOnline,
          last_location_update: new Date().toISOString()
        })
        .eq('id', driverId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour la position d'un livreur
   */
  updateDriverLocation(driverId: number, latitude: number, longitude: number): Observable<void> {
    return from(
      this.supabase
        .from('france_delivery_drivers')
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
          last_location_update: new Date().toISOString()
        })
        .eq('id', driverId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Récupère les adresses de livraison pour un numéro de téléphone
   */
  getCustomerAddresses(phoneNumber: string): Observable<CustomerAddress[]> {
    return from(
      this.supabase
        .from('france_customer_addresses')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as CustomerAddress[];
      })
    );
  }

  /**
   * Crée une nouvelle adresse de livraison
   */
  createCustomerAddress(address: Omit<CustomerAddress, 'id' | 'created_at' | 'updated_at'>): Observable<CustomerAddress> {
    return from(
      this.supabase
        .from('france_customer_addresses')
        .insert(address)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as CustomerAddress;
      })
    );
  }

  /**
   * Met à jour une adresse de livraison
   */
  updateCustomerAddress(addressId: number, updates: Partial<CustomerAddress>): Observable<void> {
    return from(
      this.supabase
        .from('france_customer_addresses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Récupère les commandes de livraison en attente
   */
  getPendingDeliveryOrders(restaurantId: number): Observable<FranceOrder[]> {
    return from(
      this.supabase
        .from('france_orders')
        .select(`
          *,
          france_customer_addresses(*)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('delivery_mode', 'livraison')
        .in('status', ['confirmee', 'en_preparation'])
        .order('created_at', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as FranceOrder[];
      })
    );
  }

  /**
   * Récupère les commandes assignées à un livreur
   */
  getDriverOrders(driverId: number): Observable<FranceOrder[]> {
    return from(
      this.supabase
        .from('france_orders')
        .select(`
          *,
          france_customer_addresses(*)
        `)
        .eq('driver_id', driverId)
        .in('driver_assignment_status', ['assigned'])
        .order('created_at', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as FranceOrder[];
      })
    );
  }

  /**
   * Assigne une commande à un livreur
   */
  assignOrderToDriver(orderId: number, driverId: number): Observable<void> {
    return from(
      this.supabase
        .from('france_orders')
        .update({
          driver_id: driverId,
          driver_assignment_status: 'assigned',
          assignment_started_at: new Date().toISOString()
        })
        .eq('id', orderId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Met à jour le statut d'une commande de livraison
   */
  updateDeliveryStatus(orderId: number, status: string, deliveryStartedAt?: string): Observable<void> {
    const updates: any = { status };
    
    if (deliveryStartedAt) {
      updates.delivery_started_at = deliveryStartedAt;
    }

    return from(
      this.supabase
        .from('france_orders')
        .update(updates)
        .eq('id', orderId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Récupère les assignations de livraison
   */
  getDeliveryAssignments(restaurantId: number): Observable<DeliveryAssignment[]> {
    return from(
      this.supabase
        .from('france_delivery_assignments')
        .select(`
          *,
          france_orders!inner(restaurant_id),
          france_delivery_drivers(first_name, last_name, phone_number)
        `)
        .eq('france_orders.restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as DeliveryAssignment[];
      })
    );
  }

  /**
   * Crée une nouvelle assignation de livraison
   */
  createDeliveryAssignment(assignment: Omit<DeliveryAssignment, 'id' | 'created_at'>): Observable<DeliveryAssignment> {
    return from(
      this.supabase
        .from('france_delivery_assignments')
        .insert(assignment)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as DeliveryAssignment;
      })
    );
  }

  /**
   * Met à jour une assignation de livraison
   */
  updateDeliveryAssignment(assignmentId: number, updates: Partial<DeliveryAssignment>): Observable<void> {
    return from(
      this.supabase
        .from('france_delivery_assignments')
        .update(updates)
        .eq('id', assignmentId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Calcule la distance entre deux points géographiques (formule de Haversine)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  /**
   * Récupère les statistiques de livraison pour un restaurant
   */
  getDeliveryStats(restaurantId: number, dateFrom: string, dateTo: string): Observable<any> {
    return from(
      this.supabase.rpc('get_delivery_stats', {
        restaurant_id: restaurantId,
        date_from: dateFrom,
        date_to: dateTo
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      })
    );
  }

  /**
   * Récupère l'historique des positions d'un livreur
   */
  getDriverLocationHistory(driverId: number, dateFrom: string, dateTo: string): Observable<any[]> {
    return from(
      this.supabase
        .from('france_driver_locations')
        .select('*')
        .eq('driver_id', driverId)
        .gte('recorded_at', dateFrom)
        .lte('recorded_at', dateTo)
        .order('recorded_at', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as any[];
      })
    );
  }
}