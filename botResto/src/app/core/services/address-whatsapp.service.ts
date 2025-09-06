/**
 * Service pour récupérer les informations d'adresse
 * Utilise les vraies colonnes de france_customer_addresses
 */

import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface CustomerAddress {
  id: number;
  phone_number: string;
  address_label: string;
  full_address: string;
  google_place_id?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressWhatsAppService {

  constructor(private supabase: SupabaseService) { }

  /**
   * Récupérer une adresse par son ID
   */
  async getAddressById(addressId: number): Promise<CustomerAddress | null> {
    if (!addressId) return null;

    try {
      const { data, error } = await this.supabase
        .client
        .from('france_customer_addresses')
        .select('*')
        .eq('id', addressId)
        .single();

      if (error) {
        return null;
      }
      return data;
      
    } catch (error) {
      return null;
    }
  }

  /**
   * Enrichir une commande avec les informations d'adresse
   * Note: pas de whatsapp_name dans la DB, on utilise customer_name de la commande
   */
  async enrichOrderWithWhatsAppName(order: any): Promise<any> {
    return {
      ...order,
      customer_whatsapp_name: order.customer_name || null
    };
  }

  /**
   * Enrichir plusieurs commandes avec les noms des clients
   */
  async enrichOrdersWithWhatsAppNames(orders: any[]): Promise<any[]> {
    if (!orders || orders.length === 0) return orders;

    return orders.map(order => ({
      ...order,
      customer_whatsapp_name: order.customer_name || null
    }));
  }
}