/**
 * Repository pour les Restaurants
 * Infrastructure Layer - Implémentation Supabase
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Restaurant } from '../../domain/entities/Restaurant.ts';
import { IPaginatedRepository, IPaginatedResult } from '../../core/interfaces/IRepository.ts';
import { LocationService, ICoordinates } from '../../application/services/LocationService.ts';

interface RestaurantRecord {
  id: string;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  phone_whatsapp: string;
  tarif_km: number;
  seuil_gratuite: number;
  minimum_livraison: number;
  rayon_livraison_km: number;
  horaires: any;
  statut: 'ouvert' | 'ferme' | 'pause';
  created_at?: string;
  updated_at?: string;
}

export class RestaurantRepository implements IPaginatedRepository<Restaurant> {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Restaurant | null> {
    const { data, error } = await this.supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Restaurant[]> {
    const { data, error } = await this.supabase
      .from('restaurants')
      .select('*')
      .order('nom', { ascending: true });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findByFilter(filter: Record<string, any>): Promise<Restaurant[]> {
    let query = this.supabase.from('restaurants').select('*');

    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.order('nom', { ascending: true });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findOne(filter: Record<string, any>): Promise<Restaurant | null> {
    const results = await this.findByFilter(filter);
    return results.length > 0 ? results[0] : null;
  }

  async findPaginated(
    page: number, 
    pageSize: number, 
    filter?: Record<string, any>
  ): Promise<IPaginatedResult<Restaurant>> {
    const offset = (page - 1) * pageSize;
    let query = this.supabase.from('restaurants').select('*', { count: 'exact' });

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error, count } = await query
      .order('nom', { ascending: true })
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

    const restaurants = data.map(record => this.mapToEntity(record));
    const total = count || 0;

    return {
      data: restaurants,
      total,
      page,
      pageSize,
      hasNext: offset + pageSize < total,
      hasPrevious: page > 1
    };
  }

  async create(restaurant: Restaurant): Promise<Restaurant> {
    const record = this.mapToRecord(restaurant);

    const { data, error } = await this.supabase
      .from('restaurants')
      .insert(record)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create restaurant: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, updates: Partial<Restaurant>): Promise<Restaurant | null> {
    const record = this.mapToRecord(updates as Restaurant, true);

    const { data, error } = await this.supabase
      .from('restaurants')
      .update(record)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to update restaurant:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    return !error;
  }

  /**
   * Méthodes spécifiques aux restaurants
   */

  async findOpenRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await this.supabase
      .from('restaurants')
      .select('*')
      .eq('statut', 'ouvert')
      .order('nom', { ascending: true });

    if (error || !data) return [];

    // Filtrer par horaires d'ouverture
    const restaurants = data.map(record => this.mapToEntity(record));
    return restaurants.filter(restaurant => restaurant.isOpen());
  }

  async findNearbyRestaurants(
    location: ICoordinates, 
    radiusKm: number = 20,
    limit: number = 10
  ): Promise<Array<Restaurant & { distance: number }>> {
    // Récupérer tous les restaurants ouverts
    const restaurants = await this.findOpenRestaurants();

    // Calculer les distances et filtrer
    const restaurantsWithDistance = restaurants
      .map(restaurant => ({
        ...restaurant,
        distance: LocationService.calculateDistance(location, {
          latitude: restaurant.latitude,
          longitude: restaurant.longitude
        })
      }))
      .filter(restaurant => restaurant.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return restaurantsWithDistance;
  }

  async searchRestaurants(searchTerm: string, limit: number = 10): Promise<Restaurant[]> {
    const { data, error } = await this.supabase
      .from('restaurants')
      .select('*')
      .or(`nom.ilike.%${searchTerm}%,adresse.ilike.%${searchTerm}%`)
      .eq('statut', 'ouvert')
      .limit(limit)
      .order('nom', { ascending: true });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async getRestaurantStats(restaurantId: string): Promise<{
    totalOrders: number;
    todayOrders: number;
    averageOrderValue: number;
    rating: number;
  }> {
    const { data, error } = await this.supabase
      .rpc('get_restaurant_stats', { restaurant_id: restaurantId });

    if (error || !data) {
      return {
        totalOrders: 0,
        todayOrders: 0,
        averageOrderValue: 0,
        rating: 0
      };
    }

    return data;
  }

  async updateRestaurantStatus(id: string, statut: 'ouvert' | 'ferme' | 'pause'): Promise<boolean> {
    const { error } = await this.supabase
      .from('restaurants')
      .update({ statut, updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }

  private mapToEntity(record: RestaurantRecord): Restaurant {
    return new Restaurant(
      record.id,
      record.nom,
      record.adresse,
      record.latitude,
      record.longitude,
      record.phone_whatsapp,
      record.tarif_km,
      record.seuil_gratuite,
      record.minimum_livraison,
      record.rayon_livraison_km,
      record.horaires,
      record.statut,
      record.created_at ? new Date(record.created_at) : undefined,
      record.updated_at ? new Date(record.updated_at) : undefined
    );
  }

  private mapToRecord(restaurant: Restaurant, isUpdate: boolean = false): Partial<RestaurantRecord> {
    const record: Partial<RestaurantRecord> = {
      nom: restaurant.nom,
      adresse: restaurant.adresse,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      phone_whatsapp: restaurant.phoneWhatsapp,
      tarif_km: restaurant.tarifKm,
      seuil_gratuite: restaurant.seuilGratuite,
      minimum_livraison: restaurant.minimumLivraison,
      rayon_livraison_km: restaurant.rayonLivraisonKm,
      horaires: restaurant.horaires,
      statut: restaurant.statut
    };

    if (!isUpdate) {
      record.id = restaurant.id;
    }

    return record;
  }
}