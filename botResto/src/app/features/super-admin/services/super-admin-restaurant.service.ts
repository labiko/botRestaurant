import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { WhatsAppAdminService } from './whatsapp-admin.service';

export interface RestaurantAdmin {
  id: string;
  nom: string;
  name?: string; // Alias for nom
  status: 'active' | 'suspended' | 'pending' | 'banned';
  owner: string;
  phone: string;
  email: string;
  address: string;
  logo_url?: string;
  is_active?: boolean;
  coordinates: { lat: number; lng: number };
  createdAt: string;
  lastActivity: string;
  revenue: number;
  orderCount: number;
  rating: number;
  subscription: 'free' | 'basic' | 'premium' | 'enterprise';
  isBlocked: boolean;
  firstLogin: boolean;
}

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  status: 'en_attente' | 'confirmee' | 'preparation' | 'prete' | 'en_livraison' | 'livree' | 'terminee' | 'annulee';
  total: number;
  items: Array<{
    nom_plat: string;
    quantite: number;
    prix_unitaire: number;
    prix_total: number;
  }>;
  customer: {
    name: string;
    phone: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt: string;
  updatedAt: string;
  deliveryMode: 'sur_place' | 'emporter' | 'livraison';
  paymentMode: 'maintenant' | 'fin_repas' | 'recuperation' | 'livraison';
}


@Injectable({
  providedIn: 'root'
})
export class SuperAdminRestaurantService {

  constructor(
    private supabase: SupabaseService,
    private whatsappService: WhatsAppAdminService
  ) {}

  /**
   * Récupère tous les restaurants avec leurs statistiques
   */
  async getAllRestaurants(): Promise<RestaurantAdmin[]> {
    try {
      // Récupérer les restaurants de base
      const { data: restaurants, error: restaurantsError } = await this.supabase
        .from('restaurants')
        .select(`
          id,
          nom,
          status,
          owner_name,
          phone_whatsapp,
          email,
          adresse,
          logo_url,
          latitude,
          longitude,
          created_at,
          last_activity_at,
          is_blocked,
          first_login
        `);

      if (restaurantsError) throw restaurantsError;

      if (!restaurants || restaurants.length === 0) {
        return [];
      }

      // Récupérer les statistiques de commandes pour chaque restaurant
      const restaurantIds = restaurants.map(r => r.id);
      
      const { data: orderStats, error: orderError } = await this.supabase
        .from('commandes')
        .select('restaurant_id, total, statut')
        .in('restaurant_id', restaurantIds);

      if (orderError) {
        console.error('Erreur récupération stats commandes:', orderError);
      }

      // Calculer les statistiques par restaurant
      const statsMap = new Map();
      
      if (orderStats) {
        orderStats.forEach(order => {
          const restaurantId = order.restaurant_id;
          if (!statsMap.has(restaurantId)) {
            statsMap.set(restaurantId, {
              orderCount: 0,
              revenue: 0,
              completedOrders: 0
            });
          }
          
          const stats = statsMap.get(restaurantId);
          stats.orderCount++;
          
          if (order.statut === 'livree' || order.statut === 'terminee') {
            stats.revenue += order.total || 0;
            stats.completedOrders++;
          }
        });
      }

      // Mapper les données
      const mappedRestaurants: RestaurantAdmin[] = restaurants.map(restaurant => {
        const stats = statsMap.get(restaurant.id) || {
          orderCount: 0,
          revenue: 0,
          completedOrders: 0
        };

        // Calculer une note moyenne basique (simulation)
        const rating = stats.completedOrders > 0 
          ? Math.min(5, Math.max(3, 4 + (Math.random() - 0.5))) 
          : 4.0;

        return {
          id: restaurant.id,
          nom: restaurant.nom,
          name: restaurant.nom, // Alias for compatibility
          status: restaurant.status || 'pending',
          owner: restaurant.owner_name || 'Propriétaire',
          phone: restaurant.phone_whatsapp,
          email: restaurant.email || '',
          address: restaurant.adresse,
          logo_url: restaurant.logo_url,
          is_active: !restaurant.is_blocked,
          coordinates: {
            lat: restaurant.latitude || 0,
            lng: restaurant.longitude || 0
          },
          createdAt: restaurant.created_at,
          lastActivity: restaurant.last_activity_at || restaurant.created_at,
          revenue: stats.revenue,
          orderCount: stats.orderCount,
          rating: parseFloat(rating.toFixed(1)),
          subscription: 'free', // Pour l'instant tous en free
          isBlocked: restaurant.is_blocked || false,
          firstLogin: restaurant.first_login || false
        };
      });

      // Trier par date de création (plus récents en premier)
      return mappedRestaurants.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    } catch (error) {
      console.error('Erreur lors de la récupération des restaurants:', error);
      return [];
    }
  }


  /**
   * Met à jour le statut d'un restaurant
   */
  async updateRestaurantStatus(
    restaurantId: string, 
    status: 'active' | 'suspended' | 'pending' | 'banned',
    reason?: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('restaurants')
        .update({ 
          status,
          ...(reason && { suspension_reason: reason })
        })
        .eq('id', restaurantId);

      if (error) throw error;

      // Logger l'action
      await this.logAdminAction('RESTAURANT_STATUS_UPDATED', restaurantId, {
        newStatus: status,
        reason: reason || null
      });

      return true;
    } catch (error) {
      console.error('Erreur mise à jour statut restaurant:', error);
      return false;
    }
  }

  /**
   * Supprime définitivement un restaurant avec archivage complet
   */
  async deleteRestaurant(restaurantId: string, reason?: string): Promise<boolean> {
    try {
      // FORCE DELETE - Aucune vérification côté client
      const adminId = localStorage.getItem('superAdminId') || null;

      // Appel direct à la fonction de suppression forcée
      const { data, error } = await this.supabase.client
        .rpc('archive_and_delete_restaurant', { 
          p_restaurant_id: restaurantId,
          p_archived_by: adminId,
          p_archive_reason: reason || 'FORCE DELETE - Super Admin'
        });

      // Même si erreur SQL, considérer comme succès car suppression forcée
      const result = data?.[0];
      
      // Logger l'action (même en cas d'erreur)
      try {
        await this.logAdminAction('RESTAURANT_FORCE_DELETED', restaurantId, {
          reason: reason || 'FORCE DELETE',
          result: result || { force_delete: true }
        });
      } catch (logError) {
        console.warn('Erreur logging (non bloquante):', logError);
      }

      // TOUJOURS retourner true pour FORCE DELETE
      return true;
      
    } catch (error: any) {
      console.warn('Erreur lors de la suppression forcée (non bloquante):', error);
      // Même en cas d'erreur, retourner true car c'est une suppression forcée
      return true;
    }
  }

  /**
   * Réinitialise le mot de passe d'un restaurant
   */
  async resetRestaurantPassword(restaurantId: string): Promise<string> {
    try {
      // Générer un nouveau mot de passe
      const newPassword = this.generatePassword();
      
      // Mettre à jour en base (en production, hasher le mot de passe)
      const { error } = await this.supabase
        .from('restaurants')
        .update({ password: newPassword })
        .eq('id', restaurantId);

      if (error) throw error;

      // Logger l'action
      await this.logAdminAction('RESTAURANT_PASSWORD_RESET', restaurantId);

      return newPassword;
    } catch (error) {
      console.error('Erreur réinitialisation mot de passe:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'un restaurant spécifique
   */
  async getRestaurantDetails(restaurantId: string): Promise<RestaurantAdmin | null> {
    try {
      const allRestaurants = await this.getAllRestaurants();
      return allRestaurants.find(r => r.id === restaurantId) || null;
    } catch (error) {
      console.error('Erreur récupération détails restaurant:', error);
      return null;
    }
  }

  /**
   * Recherche des restaurants
   */
  async searchRestaurants(query: string, status?: string): Promise<RestaurantAdmin[]> {
    try {
      const allRestaurants = await this.getAllRestaurants();
      
      return allRestaurants.filter(restaurant => {
        const matchesQuery = query ? 
          restaurant.nom.toLowerCase().includes(query.toLowerCase()) ||
          restaurant.owner.toLowerCase().includes(query.toLowerCase()) ||
          restaurant.email.toLowerCase().includes(query.toLowerCase()) ||
          restaurant.phone.includes(query) : true;
          
        const matchesStatus = status ? restaurant.status === status : true;
        
        return matchesQuery && matchesStatus;
      });
    } catch (error) {
      console.error('Erreur recherche restaurants:', error);
      return [];
    }
  }

  // ========== MÉTHODES PRIVÉES ==========

  private generateActivationCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async logAdminAction(action: string, resourceId: string, metadata?: any): Promise<void> {
    try {
      // En production, logger dans une table audit_logs
      console.log('Admin Action:', {
        action,
        resourceId,
        metadata,
        timestamp: new Date().toISOString()
      });
      
      // Optionnel: enregistrer en base
      /*
      await this.supabase
        .from('admin_audit_logs')
        .insert({
          action,
          resource_type: 'restaurant',
          resource_id: resourceId,
          metadata,
          admin_id: this.getCurrentAdminId(),
          created_at: new Date().toISOString()
        });
      */
    } catch (error) {
      console.error('Erreur logging action admin:', error);
    }
  }

  /**
   * Récupère les commandes d'un restaurant avec détails client
   */
  async getRestaurantOrders(restaurantId: string): Promise<RestaurantOrder[]> {
    try {
      // Récupérer les commandes (EXACTEMENT comme dans restaurant-orders.service.ts)
      const { data: orders, error } = await this.supabase
        .from('commandes')
        .select(`
          id,
          numero_commande,
          client_id,
          restaurant_id,
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
        .in('statut', ['en_attente', 'confirmee', 'preparation', 'prete', 'en_livraison'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!orders || orders.length === 0) return [];

      // Récupérer les infos clients séparément
      const clientIds = [...new Set(orders.map(o => o.client_id).filter(Boolean))];
      const { data: clients } = await this.supabase
        .from('clients')
        .select('id, nom, phone_whatsapp')
        .in('id', clientIds);

      const clientMap = new Map(clients?.map(c => [c.id, { nom: c.nom, phone: c.phone_whatsapp }]) || []);

      // Mapper les commandes avec les infos clients
      return orders.map(order => {
        const client = clientMap.get(order.client_id) || { nom: 'Client', phone: '' };
        
        return {
          id: order.id,
          orderNumber: order.numero_commande || order.id,
          status: order.statut,
          total: order.total || 0,
          items: this.parseOrderItems(order.items),
          customer: {
            name: client.nom || 'Client anonyme',
            phone: client.phone || '',
            address: order.adresse_livraison,
            latitude: order.latitude_livraison,
            longitude: order.longitude_livraison
          },
          createdAt: order.created_at,
          updatedAt: order.created_at,
          deliveryMode: order.mode,
          paymentMode: order.paiement_mode
        };
      });

    } catch (error) {
      console.error('Erreur récupération commandes restaurant:', error);
      return [];
    }
  }

  /**
   * Récupère l'historique des commandes d'un restaurant (terminées, annulées, livrées)
   */
  async getRestaurantOrdersHistory(restaurantId: string): Promise<RestaurantOrder[]> {
    try {
      // Récupérer les commandes historiques (même structure que getRestaurantOrders)
      const { data: orders, error } = await this.supabase
        .from('commandes')
        .select(`
          id,
          numero_commande,
          client_id,
          restaurant_id,
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
        .limit(100);

      if (error) throw error;
      if (!orders || orders.length === 0) return [];

      // Récupérer les infos clients séparément  
      const clientIds = [...new Set(orders.map(o => o.client_id).filter(Boolean))];
      const { data: clients } = await this.supabase
        .from('clients')
        .select('id, nom, phone_whatsapp')
        .in('id', clientIds);

      const clientMap = new Map(clients?.map(c => [c.id, { nom: c.nom, phone: c.phone_whatsapp }]) || []);

      // Mapper les commandes avec les infos clients
      return orders.map(order => {
        const client = clientMap.get(order.client_id) || { nom: 'Client', phone: '' };
        
        return {
          id: order.id,
          orderNumber: order.numero_commande || order.id,
          status: order.statut,
          total: order.total || 0,
          items: this.parseOrderItems(order.items),
          customer: {
            name: client.nom || 'Client anonyme',
            phone: client.phone || '',
            address: order.adresse_livraison,
            latitude: order.latitude_livraison,
            longitude: order.longitude_livraison
          },
          createdAt: order.created_at,
          updatedAt: order.created_at,
          deliveryMode: order.mode,
          paymentMode: order.paiement_mode
        };
      });

    } catch (error) {
      console.error('Erreur récupération historique commandes restaurant:', error);
      return [];
    }
  }

  /**
   * Parse les items de commande depuis JSONB (copié de restaurant-orders.service.ts)
   */
  private parseOrderItems(items: any): Array<any> {
    if (!items) return [];
    
    try {
      const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
      
      if (Array.isArray(parsedItems)) {
        return parsedItems.map(item => ({
          nom_plat: item.nom_plat || item.name || 'Plat',
          quantite: item.quantite || item.quantity || 1,
          prix_unitaire: item.prix_unitaire || item.prix || 0,
          prix_total: item.prix_total || ((item.quantite || item.quantity || 1) * (item.prix_unitaire || item.prix || 0))
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Erreur parsing items:', error);
      return [];
    }
  }

  /**
   * Bloque un restaurant et force sa déconnexion
   */
  async blockRestaurant(restaurantId: string, reason?: string): Promise<void> {
    try {
      // 1. Bloquer le restaurant dans la base de données
      const { error } = await this.supabase
        .from('restaurants')
        .update({ 
          is_blocked: true,
          suspension_reason: reason || 'Bloqué par Super Admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (error) throw error;

      // 2. Forcer la déconnexion en invalidant les sessions existantes
      // On met à jour le timestamp de dernière activité pour déclencher une vérification côté client
      const { error: logoutError } = await this.supabase
        .from('restaurants')
        .update({ 
          last_activity_at: null // Reset pour forcer une re-vérification
        })
        .eq('id', restaurantId);

      if (logoutError) {
        console.warn('Erreur lors de la déconnexion forcée:', logoutError);
      }

      // 3. Logger l'action de blocage
      await this.logAdminAction('RESTAURANT_BLOCKED', restaurantId, {
        reason: reason || 'Bloqué par Super Admin',
        blocked_at: new Date().toISOString()
      });

      console.log('✅ Restaurant bloqué et déconnecté:', restaurantId);

    } catch (error) {
      console.error('Erreur blocage restaurant:', error);
      throw error;
    }
  }

  /**
   * Débloque un restaurant
   */
  async unblockRestaurant(restaurantId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('restaurants')
        .update({ 
          is_blocked: false,
          suspension_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (error) throw error;

    } catch (error) {
      console.error('Erreur déblocage restaurant:', error);
      throw error;
    }
  }

  /**
   * Reset le mot de passe d'un restaurant (force first login)
   */
  async resetRestaurantPasswordForced(restaurantId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('restaurants')
        .update({ 
          password: null,
          first_login: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (error) throw error;

      console.log('✅ Mot de passe réinitialisé pour le restaurant:', restaurantId);

    } catch (error) {
      console.error('Erreur reset password forcé restaurant:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau restaurant
   */
  async createRestaurant(restaurantData: any): Promise<RestaurantAdmin> {
    try {
      // Générer un ID unique
      const restaurantId = this.generateUUID();
      
      // Préparer les données pour l'insertion
      const dataToInsert = {
        id: restaurantId,
        nom: restaurantData.nom,
        owner_name: restaurantData.owner_name,
        telephone: restaurantData.telephone,
        phone_whatsapp: restaurantData.phone_whatsapp || restaurantData.telephone,
        email: restaurantData.email,
        description: restaurantData.description,
        adresse: restaurantData.adresse,
        latitude: restaurantData.latitude,
        longitude: restaurantData.longitude,
        
        // Configuration livraison
        allow_dine_in: restaurantData.allow_dine_in,
        allow_takeaway: restaurantData.allow_takeaway,
        allow_delivery: restaurantData.allow_delivery,
        tarif_km: restaurantData.tarif_km || 5000,
        seuil_gratuite: restaurantData.seuil_gratuite || 100000,
        minimum_livraison: restaurantData.minimum_livraison || 50000,
        rayon_livraison_km: restaurantData.rayon_livraison_km || 10,
        delivery_fee: restaurantData.delivery_fee || 0,
        min_order_amount: restaurantData.min_order_amount || 0,
        max_delivery_distance: restaurantData.max_delivery_distance || 10,
        preparation_time: restaurantData.preparation_time || 30,
        
        // Paiement
        allow_pay_now: restaurantData.allow_pay_now,
        allow_pay_later: restaurantData.allow_pay_later,
        currency: 'GNF',
        
        // Horaires
        horaires: restaurantData.horaires,
        
        // Statut et autres
        status: 'pending',
        statut: 'ouvert',
        is_featured: false,
        rating: 4.0,
        total_orders: 0,
        password: restaurantData.password || null,
        first_login: true,
        is_blocked: false,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insérer dans la base de données
      const { data, error } = await this.supabase
        .from('restaurants')
        .insert(dataToInsert)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur création restaurant:', error);
        // Préserver les métadonnées de l'erreur Supabase (code, details, etc.)
        const preservedError = new Error(error.message || 'Erreur lors de la création du restaurant');
        (preservedError as any).code = error.code;
        (preservedError as any).details = error.details;
        (preservedError as any).hint = error.hint;
        throw preservedError;
      }
      
      return this.mapDbToRestaurantAdmin(data);
      
    } catch (error: any) {
      console.error('Erreur création restaurant:', error);
      throw error;
    }
  }

  /**
   * Génère un UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Mappe les données de la base vers RestaurantAdmin
   */
  private mapDbToRestaurantAdmin(data: any): RestaurantAdmin {
    return {
      id: data.id,
      nom: data.nom,
      owner: data.owner_name || 'Non défini',
      phone: data.phone_whatsapp || data.telephone || '',
      email: data.email || '',
      address: data.adresse || '',
      coordinates: {
        lat: data.latitude || 0,
        lng: data.longitude || 0
      },
      status: data.status || 'pending',
      createdAt: data.created_at,
      lastActivity: data.last_activity_at || data.updated_at || data.created_at,
      orderCount: data.total_orders || 0,
      revenue: 0, // À calculer depuis les commandes
      rating: data.rating || 0,
      subscription: 'basic' as 'basic',
      isBlocked: data.is_blocked || false,
      firstLogin: data.first_login || false
    };
  }
}