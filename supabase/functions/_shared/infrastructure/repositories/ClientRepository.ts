/**
 * Repository pour les Clients
 * Infrastructure Layer - Implémentation Supabase
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { IRepositoryWithFilter } from '../../core/interfaces/IRepository.ts';

export interface Client {
  id: string;
  phoneWhatsapp: string;
  nom?: string;
  restaurantFavoriId?: string;
  adresseDefault?: string;
  latitudeDefault?: number;
  longitudeDefault?: number;
  nombreCommandes: number;
  createdAt?: Date;
  updatedAt?: Date;
  lastOrderAt?: Date;
}

interface ClientRecord {
  id: string;
  phone_whatsapp: string;
  nom?: string;
  restaurant_favori_id?: string;
  adresse_default?: string;
  latitude_default?: number;
  longitude_default?: number;
  nombre_commandes: number;
  created_at?: string;
  updated_at?: string;
  last_order_at?: string;
}

export class ClientRepository implements IRepositoryWithFilter<Client> {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findByFilter(filter: Record<string, any>): Promise<Client[]> {
    let query = this.supabase.from('clients').select('*');

    Object.entries(filter).forEach(([key, value]) => {
      const dbKey = this.mapFieldToDb(key);
      query = query.eq(dbKey, value);
    });

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findOne(filter: Record<string, any>): Promise<Client | null> {
    const results = await this.findByFilter(filter);
    return results.length > 0 ? results[0] : null;
  }

  async create(client: Client): Promise<Client> {
    const record = this.mapToRecord(client);

    const { data, error } = await this.supabase
      .from('clients')
      .insert(record)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create client: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, updates: Partial<Client>): Promise<Client | null> {
    const record = this.mapToRecord(updates as Client, true);

    const { data, error } = await this.supabase
      .from('clients')
      .update(record)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to update client:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('clients')
      .delete()
      .eq('id', id);

    return !error;
  }

  /**
   * Méthodes spécifiques aux clients
   */

  async findByPhoneWhatsapp(phoneWhatsapp: string): Promise<Client | null> {
    return await this.findOne({ phoneWhatsapp });
  }

  async findOrCreateByPhone(phoneWhatsapp: string): Promise<Client> {
    let client = await this.findByPhoneWhatsapp(phoneWhatsapp);
    
    if (!client) {
      client = await this.create({
        id: crypto.randomUUID(),
        phoneWhatsapp,
        nombreCommandes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return client;
  }

  async updateFavoriteRestaurant(phoneWhatsapp: string, restaurantId: string): Promise<boolean> {
    const client = await this.findByPhoneWhatsapp(phoneWhatsapp);
    if (!client) return false;

    const updated = await this.update(client.id, {
      restaurantFavoriId: restaurantId,
      updatedAt: new Date()
    });

    return updated !== null;
  }

  async removeFavoriteRestaurant(phoneWhatsapp: string): Promise<boolean> {
    const client = await this.findByPhoneWhatsapp(phoneWhatsapp);
    if (!client) return false;

    const updated = await this.update(client.id, {
      restaurantFavoriId: undefined,
      updatedAt: new Date()
    });

    return updated !== null;
  }

  async updateDefaultAddress(
    phoneWhatsapp: string,
    adresse: string,
    latitude?: number,
    longitude?: number
  ): Promise<boolean> {
    const client = await this.findByPhoneWhatsapp(phoneWhatsapp);
    if (!client) return false;

    const updated = await this.update(client.id, {
      adresseDefault: adresse,
      latitudeDefault: latitude,
      longitudeDefault: longitude,
      updatedAt: new Date()
    });

    return updated !== null;
  }

  async incrementOrderCount(clientId: string): Promise<boolean> {
    const { error } = await this.supabase
      .rpc('increment_client_orders', {
        client_id: clientId
      });

    return !error;
  }

  async getClientStats(phoneWhatsapp: string): Promise<{
    totalOrders: number;
    lastOrderDate: Date | null;
    favoriteRestaurant: string | null;
    averageOrderValue: number;
  }> {
    const { data, error } = await this.supabase
      .rpc('get_client_stats', {
        phone_number: phoneWhatsapp
      });

    if (error || !data) {
      return {
        totalOrders: 0,
        lastOrderDate: null,
        favoriteRestaurant: null,
        averageOrderValue: 0
      };
    }

    return {
      totalOrders: data.total_orders || 0,
      lastOrderDate: data.last_order_date ? new Date(data.last_order_date) : null,
      favoriteRestaurant: data.favorite_restaurant || null,
      averageOrderValue: data.average_order_value || 0
    };
  }

  async getActiveClients(days: number = 30): Promise<Client[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .gte('last_order_at', dateThreshold.toISOString())
      .order('last_order_at', { ascending: false });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async searchClients(searchTerm: string, limit: number = 20): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .or(`nom.ilike.%${searchTerm}%,phone_whatsapp.ilike.%${searchTerm}%`)
      .limit(limit)
      .order('last_order_at', { ascending: false });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async getClientsByFavoriteRestaurant(restaurantId: string): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('restaurant_favori_id', restaurantId)
      .order('last_order_at', { ascending: false });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async updateLastActivity(phoneWhatsapp: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('clients')
      .update({ 
        last_order_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('phone_whatsapp', phoneWhatsapp);

    return !error;
  }

  private mapFieldToDb(field: string): string {
    const mapping: Record<string, string> = {
      phoneWhatsapp: 'phone_whatsapp',
      restaurantFavoriId: 'restaurant_favori_id',
      adresseDefault: 'adresse_default',
      latitudeDefault: 'latitude_default',
      longitudeDefault: 'longitude_default',
      nombreCommandes: 'nombre_commandes',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      lastOrderAt: 'last_order_at'
    };
    
    return mapping[field] || field;
  }

  private mapToEntity(record: ClientRecord): Client {
    return {
      id: record.id,
      phoneWhatsapp: record.phone_whatsapp,
      nom: record.nom,
      restaurantFavoriId: record.restaurant_favori_id,
      adresseDefault: record.adresse_default,
      latitudeDefault: record.latitude_default,
      longitudeDefault: record.longitude_default,
      nombreCommandes: record.nombre_commandes,
      createdAt: record.created_at ? new Date(record.created_at) : undefined,
      updatedAt: record.updated_at ? new Date(record.updated_at) : undefined,
      lastOrderAt: record.last_order_at ? new Date(record.last_order_at) : undefined
    };
  }

  private mapToRecord(client: Client, isUpdate: boolean = false): Partial<ClientRecord> {
    const record: Partial<ClientRecord> = {
      phone_whatsapp: client.phoneWhatsapp,
      nom: client.nom,
      restaurant_favori_id: client.restaurantFavoriId,
      adresse_default: client.adresseDefault,
      latitude_default: client.latitudeDefault,
      longitude_default: client.longitudeDefault,
      nombre_commandes: client.nombreCommandes
    };

    if (!isUpdate) {
      record.id = client.id;
    }

    return record;
  }
}