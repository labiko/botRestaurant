import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { WhatsAppNotificationService } from './whatsapp-notification.service';
import { AuthService } from './auth.service';
import { GeolocationService } from './geolocation.service';

export interface DeliveryOrder {
  id: number;
  orderNumber: string;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: string;
  totalAmount: number;
  deliveryFee: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  estimatedTime: string;
  distance: number;
  createdAt: string;
  pickupTime?: string;
  deliveredTime?: string;
  clientId: string;
  latitudeLivraison: number | null;
  longitudeLivraison: number | null;
  orderStatus: string;
  paymentMode: string | null;
  paymentStatus: string;
  paymentMethod: string | null;
}

export interface DeliveryStats {
  todayDeliveries: number;
  todayEarnings: number;
  weeklyDeliveries: number;
  weeklyEarnings: number;
  avgDeliveryTime: number;
  rating: number;
  completionRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private ordersSubject = new BehaviorSubject<DeliveryOrder[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  private statsSubject = new BehaviorSubject<DeliveryStats>({
    todayDeliveries: 0,
    todayEarnings: 0,
    weeklyDeliveries: 0,
    weeklyEarnings: 0,
    avgDeliveryTime: 0,
    rating: 0,
    completionRate: 0
  });
  public stats$ = this.statsSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private whatsAppService: WhatsAppNotificationService,
    private authService: AuthService,
    private geolocationService: GeolocationService
  ) {}

  async loadDeliveryOrders(deliveryUserPhone: string): Promise<DeliveryOrder[]> {
    try {
      console.log(`🚚 Loading delivery orders for phone: ${deliveryUserPhone}`);
      
      // Query orders assigned to this delivery person
      const { data: orders, error } = await this.supabase
        .from('commandes')
        .select(`
          id,
          numero_commande,
          restaurant_id,
          client_id,
          items,
          total,
          frais_livraison,
          statut,
          mode,
          adresse_livraison,
          latitude_livraison,
          longitude_livraison,
          distance_km,
          livreur_nom,
          livreur_phone,
          assigned_at,
          accepted_by_delivery_at,
          validation_code,
          created_at,
          delivered_at,
          confirmed_at,
          paiement_mode,
          paiement_statut,
          paiement_methode
        `)
        .eq('livreur_phone', deliveryUserPhone)
        .eq('mode', 'livraison')
        .not('assigned_at', 'is', null)
        .is('delivered_at', null)
        .in('statut', ['prete', 'en_livraison'])
        .order('assigned_at', { ascending: false })
        .limit(10);

      console.log(`📋 Found ${orders?.length || 0} orders for delivery user`);

      if (error) {
        console.error('❌ Error loading delivery orders:', error);
        return [];
      }

      if (!orders || orders.length === 0) {
        console.log('📭 No orders found for delivery user');
        return [];
      }

      console.log('📋 Raw orders from database:', orders);

      // Get restaurant names separately to avoid join issues
      const restaurantIds = [...new Set(orders?.map(o => o.restaurant_id).filter(Boolean))];
      const { data: restaurants } = await this.supabase
        .from('restaurants')
        .select('id, nom')
        .in('id', restaurantIds);

      // Get client names separately  
      const clientIds = [...new Set(orders?.map(o => o.client_id).filter(Boolean))];
      const { data: clients } = await this.supabase
        .from('clients')
        .select('id, nom, phone_whatsapp')
        .in('id', clientIds);

      // Create maps for quick lookup
      const restaurantMap = new Map(restaurants?.map(r => [r.id, r.nom]) || []);
      const clientMap = new Map(clients?.map(c => [c.id, { nom: c.nom, phone: c.phone_whatsapp }]) || []);

      if (error) {
        console.error('Error loading delivery orders:', error);
        return [];
      }

      // Récupérer les coordonnées du livreur pour les calculs de distance
      const deliveryPersonCoords = await this.getDeliveryPersonCoordinates(deliveryUserPhone);
      
      const mappedOrders: DeliveryOrder[] = (orders || []).map(order => {
        const client = clientMap.get(order.client_id) || { nom: 'Client', phone: '' };
        
        // Calculer la distance réelle entre le livreur et le client
        const realDistance = this.calculateRealDistance(
          deliveryPersonCoords?.latitude || null,
          deliveryPersonCoords?.longitude || null,
          order.latitude_livraison,
          order.longitude_livraison
        );
        
        const realEstimatedTime = this.calculateRealEstimatedTime(
          deliveryPersonCoords?.latitude || null,
          deliveryPersonCoords?.longitude || null,
          order.latitude_livraison,
          order.longitude_livraison
        );
        
        const mappedOrder = {
          id: order.id,
          orderNumber: order.numero_commande,
          restaurantName: restaurantMap.get(order.restaurant_id) || 'Restaurant',
          customerName: client.nom || 'Client',
          customerPhone: client.phone || '',
          customerAddress: order.adresse_livraison || 'Adresse non spécifiée',
          items: this.formatItems(order.items),
          totalAmount: order.total || 0,
          deliveryFee: order.frais_livraison || 0,
          status: this.mapOrderStatus(order.statut, order.accepted_by_delivery_at),
          estimatedTime: realEstimatedTime,
          distance: realDistance,
          createdAt: order.created_at,
          pickupTime: order.confirmed_at,
          deliveredTime: order.delivered_at,
          clientId: order.client_id,
          latitudeLivraison: order.latitude_livraison,
          longitudeLivraison: order.longitude_livraison,
          orderStatus: order.statut || 'inconnu',
          paymentMode: order.paiement_mode,
          paymentStatus: order.paiement_statut || 'en_attente',
          paymentMethod: order.paiement_methode
        };
        
        console.log(`🔄 Mapped order ${order.numero_commande}:`, {
          id: order.id,
          statut: order.statut,
          mapped_status: mappedOrder.status,
          livreur_phone: order.livreur_phone,
          assigned_at: order.assigned_at
        });
        
        return mappedOrder;
      });

      console.log(`✅ Returning ${mappedOrders.length} mapped orders to component`);
      this.ordersSubject.next(mappedOrders);
      return mappedOrders;
    } catch (error) {
      console.error('Error loading delivery orders:', error);
      return [];
    }
  }

  async loadDeliveryStats(deliveryPhone: string): Promise<DeliveryStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      console.log(`📊 Loading stats for delivery phone: ${deliveryPhone}`);

      // Get delivery user info
      const { data: deliveryUser } = await this.supabase
        .from('delivery_users')
        .select('telephone, rating, total_deliveries')
        .eq('telephone', deliveryPhone)
        .single();

      if (!deliveryUser) {
        console.log('Delivery user not found, using default stats');
      }

      // Get today's deliveries
      const { data: todayOrders } = await this.supabase
        .from('commandes')
        .select('frais_livraison')
        .eq('livreur_phone', deliveryPhone)
        .eq('statut', 'livree')
        .gte('created_at', today);

      // Get week's deliveries
      const { data: weekOrders } = await this.supabase
        .from('commandes')
        .select('frais_livraison')
        .eq('livreur_phone', deliveryPhone)
        .eq('statut', 'livree')
        .gte('created_at', weekAgo);

      // Calculate stats
      const todayDeliveries = todayOrders?.length || 0;
      const todayEarnings = todayOrders?.reduce((sum, order) => sum + (order.frais_livraison || 0), 0) || 0;
      const weeklyDeliveries = weekOrders?.length || 0;
      const weeklyEarnings = weekOrders?.reduce((sum, order) => sum + (order.frais_livraison || 0), 0) || 0;

      const stats: DeliveryStats = {
        todayDeliveries,
        todayEarnings,
        weeklyDeliveries,
        weeklyEarnings,
        avgDeliveryTime: 25, // TODO: Calculate from actual delivery times
        rating: deliveryUser?.rating || 0,
        completionRate: 95 // TODO: Calculate from actual data
      };

      this.statsSubject.next(stats);
      return stats;
    } catch (error) {
      console.error('Error loading delivery stats:', error);
      const fallbackStats: DeliveryStats = {
        todayDeliveries: 0,
        todayEarnings: 0,
        weeklyDeliveries: 0,
        weeklyEarnings: 0,
        avgDeliveryTime: 0,
        rating: 0,
        completionRate: 0
      };
      this.statsSubject.next(fallbackStats);
      return fallbackStats;
    }
  }

  async acceptOrder(orderId: number): Promise<boolean> {
    try {
      console.log(`✅ Accepting order ${orderId}`);
      
      // Get current user info (delivery person)
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser || currentUser.type !== 'delivery') {
        console.error('No delivery user logged in');
        return false;
      }
      
      const deliveryUserPhone = currentUser.deliveryPhone!;
      const deliveryUserName = currentUser.name;

      // Mettre à jour les coordonnées du livreur avant d'accepter la commande
      console.log('🔄 Mise à jour des coordonnées du livreur...');
      const coordinatesUpdated = await this.geolocationService.updateDeliveryPersonCoordinates(deliveryUserPhone);
      if (!coordinatesUpdated) {
        console.warn('⚠️ Impossible de mettre à jour les coordonnées, mais acceptation de la commande continue');
      }
      
      // Update order with delivery person info and accepted timestamp
      const { error } = await this.supabase
        .from('commandes')
        .update({ 
          livreur_nom: deliveryUserName,
          livreur_phone: deliveryUserPhone,
          assigned_at: new Date().toISOString(),
          accepted_by_delivery_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error accepting order:', error);
        return false;
      }

      // Get order details for notification
      const { data: orderData, error: orderError } = await this.supabase
        .from('commandes')
        .select(`
          numero_commande,
          total,
          statut,
          latitude_livraison,
          longitude_livraison,
          client_id,
          validation_code
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error fetching order data:', orderError);
        return false;
      }

      // Get client phone separately
      const { data: clientData } = await this.supabase
        .from('clients')
        .select('phone_whatsapp')
        .eq('id', orderData.client_id)
        .single();

      // Get delivery person coordinates
      const { data: deliveryUserData } = await this.supabase
        .from('delivery_users')
        .select('latitude, longitude')
        .eq('telephone', deliveryUserPhone)
        .single();
      
      console.log(`👤 Delivery user phone: ${deliveryUserPhone}`);
      console.log(`📋 Order data retrieved:`, orderData);
      console.log(`📞 Client data:`, clientData);
      console.log(`📍 Delivery user coordinates:`, deliveryUserData);

      // Extract client phone
      const clientPhone = clientData?.phone_whatsapp;
      console.log(`📞 Extracted client phone: ${clientPhone}`);

      if (orderData && clientPhone) {
        // Calculate delivery time based on distance
        let estimatedDeliveryTime = '20-30 minutes';
        
        // Calculate delivery time based on distance
        if (deliveryUserData?.latitude && deliveryUserData?.longitude && 
            orderData.latitude_livraison && orderData.longitude_livraison) {
          
          const deliveryTimeMinutes = this.calculateDeliveryTime(
            deliveryUserData.latitude,
            deliveryUserData.longitude,
            orderData.latitude_livraison,
            orderData.longitude_livraison
          );
          
          estimatedDeliveryTime = `${deliveryTimeMinutes} minutes`;
          console.log(`🕐 Calculated delivery time: ${deliveryTimeMinutes} minutes`);
        } else {
          console.log('⚠️ Missing coordinates for delivery time calculation - using default');
          console.log(`   Delivery coords: lat=${deliveryUserData?.latitude}, lng=${deliveryUserData?.longitude}`);
          console.log(`   Order coords: lat=${orderData.latitude_livraison}, lng=${orderData.longitude_livraison}`);
          estimatedDeliveryTime = '25 minutes';
        }

        // Send WhatsApp notification to client
        try {
          console.log(`📱 Sending WhatsApp notification to client ${clientPhone} for accepted order`);
          console.log(`📞 Client phone format: "${clientPhone}"`);
          console.log(`👤 Delivery user: ${deliveryUserName} (${deliveryUserPhone})`);
          console.log(`⏰ Estimated delivery time: ${estimatedDeliveryTime}`);
          
          const orderDataForNotification = {
            orderNumber: orderData.numero_commande,
            restaurantName: 'Restaurant', // TODO: Get actual restaurant name
            restaurantPhone: '623 456 789', // TODO: Get actual restaurant phone
            total: this.formatPrice(orderData.total || 0),
            subtotal: this.formatPrice(orderData.total || 0),
            deliveryFee: '5000 GNF',
            deliveryMode: 'LIVRAISON',
            paymentMethod: 'À LA LIVRAISON (cash)',
            distance: '2km',
            orderItems: 'Articles de commande',
            livreurNom: deliveryUserName,
            livreurPhone: deliveryUserPhone,
            validationCode: orderData.validation_code || 'N/A', // Utiliser le vrai code de validation de la base
            tempsEstime: estimatedDeliveryTime,
            deliveryAddress: 'Adresse client',
            reason: ''
          };
          
          console.log('📋 Order data for notification:', orderDataForNotification);
          
          const sent = await this.whatsAppService.sendStatusMessage(
            clientPhone,
            'en_livraison',
            orderDataForNotification
          );
          
          if (sent) {
            console.log(`✅ WhatsApp notification sent successfully to ${clientPhone}`);
          } else {
            console.error(`❌ Failed to send WhatsApp notification to ${clientPhone}`);
          }
          
        } catch (notificationError) {
          console.error('Error sending WhatsApp notification:', notificationError);
          // Don't fail the acceptance if notification fails
        }
      }

      // Update local state
      const currentOrders = this.ordersSubject.value;
      const updatedOrders = currentOrders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: 'picked_up' as const };
        }
        return order;
      });

      this.ordersSubject.next(updatedOrders);
      console.log(`✅ Order ${orderId} accepted successfully`);
      return true;
    } catch (error) {
      console.error('Error accepting order:', error);
      return false;
    }
  }

  async updateOrderStatus(orderId: number, status: DeliveryOrder['status']): Promise<boolean> {
    try {
      // Map delivery status to database status
      const dbStatus = this.mapToDbStatus(status);
      const updateData: any = { statut: dbStatus };

      if (status === 'picked_up') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      // Update in database
      const { error } = await this.supabase
        .from('commandes')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      // Update local state
      const currentOrders = this.ordersSubject.value;
      const updatedOrders = currentOrders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status };
          
          if (status === 'picked_up') {
            updatedOrder.pickupTime = updateData.confirmed_at;
          } else if (status === 'delivered') {
            updatedOrder.deliveredTime = updateData.delivered_at;
          }
          
          return updatedOrder;
        }
        return order;
      });

      this.ordersSubject.next(updatedOrders);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  async validateDeliveryOTP(orderId: number, enteredOTP: string): Promise<boolean> {
    try {
      console.log(`🔐 Validating OTP for order ${orderId}`);
      console.log(`📝 Entered OTP: ${enteredOTP}`);

      // Get order validation code from database
      const { data: orderData, error: fetchError } = await this.supabase
        .from('commandes')
        .select(`
          validation_code,
          numero_commande,
          client_id,
          total,
          paiement_mode
        `)
        .eq('id', orderId)
        .single();

      if (fetchError || !orderData) {
        console.error('❌ Error fetching order for OTP validation:', fetchError);
        return false;
      }

      console.log(`🔍 Order validation code from DB: ${orderData.validation_code}`);

      // Compare OTP codes
      if (orderData.validation_code !== enteredOTP) {
        console.error(`❌ OTP mismatch: entered ${enteredOTP}, expected ${orderData.validation_code}`);
        return false;
      }

      console.log('✅ OTP validated successfully');

      // Update order status to delivered
      const updateData: any = {
        statut: 'livree',
        delivered_at: new Date().toISOString()
      };

      // Update payment status if it was cash on delivery
      if (orderData.paiement_mode === 'livraison') {
        updateData.paiement_statut = 'paye';
        console.log('💰 Updating payment status to paid (cash on delivery)');
      }

      const { error: updateError } = await this.supabase
        .from('commandes')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) {
        console.error('❌ Error updating order after OTP validation:', updateError);
        return false;
      }

      // Get client phone for WhatsApp notification
      const { data: clientData } = await this.supabase
        .from('clients')
        .select('phone_whatsapp')
        .eq('id', orderData.client_id)
        .single();

      if (clientData?.phone_whatsapp) {
        // Send delivery confirmation WhatsApp message
        console.log(`📱 Sending delivery confirmation to ${clientData.phone_whatsapp}`);
        
        const notificationData = {
          orderNumber: orderData.numero_commande,
          restaurantName: '',
          restaurantPhone: '',
          total: this.formatPrice(orderData.total || 0),
          subtotal: '',
          deliveryFee: '',
          deliveryMode: '',
          paymentMethod: '',
          distance: '',
          orderItems: '',
          livreurNom: '',
          livreurPhone: '',
          validationCode: '',
          tempsEstime: '',
          deliveryAddress: '',
          reason: ''
        };

        await this.whatsAppService.sendStatusMessage(
          clientData.phone_whatsapp,
          'livree',
          notificationData
        );
      }

      // Update local state
      const currentOrders = this.ordersSubject.value;
      const updatedOrders = currentOrders.map(order => {
        if (order.id === orderId) {
          return { 
            ...order, 
            status: 'delivered' as const,
            deliveredTime: updateData.delivered_at
          };
        }
        return order;
      });

      this.ordersSubject.next(updatedOrders);

      console.log(`✅ Order ${orderId} marked as delivered successfully`);
      return true;
    } catch (error) {
      console.error('❌ Error in validateDeliveryOTP:', error);
      return false;
    }
  }

  async startNavigation(latitude: number | null, longitude: number | null): Promise<void> {
    if (latitude && longitude) {
      // Utiliser les coordonnées GPS pour une navigation précise
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
      window.open(mapsUrl, '_system');
    } else {
      console.warn('Coordonnées GPS non disponibles pour la navigation');
    }
  }

  async callCustomer(phoneNumber: string): Promise<void> {
    const telUrl = `tel:${phoneNumber.replace(/\s/g, '')}`;
    window.open(telUrl, '_system');
  }

  // Utility methods for mapping data
  private mapOrderStatus(dbStatus: string, acceptedAt?: string | null): DeliveryOrder['status'] {
    // Si la commande a un livreur assigné mais pas encore accepté → 'assigned'
    if (!acceptedAt) {
      return 'assigned';
    }
    
    // Si accepté, suivre le statut de la base
    switch (dbStatus) {
      case 'prete': 
        return 'picked_up';
      case 'en_livraison': 
        return 'in_transit';
      case 'livree': 
        return 'delivered';
      default: 
        return 'picked_up';
    }
  }

  private mapToDbStatus(deliveryStatus: DeliveryOrder['status']): string {
    switch (deliveryStatus) {
      case 'assigned': 
        return 'confirmee';
      case 'picked_up': 
        return 'prete';
      case 'in_transit': 
        return 'en_livraison';
      case 'delivered': 
        return 'livree';
      default: 
        return 'confirmee';
    }
  }

  private calculateEstimatedTime(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    
    if (diffMinutes < 30) {
      return `${30 - diffMinutes} min`;
    }
    return 'En retard';
  }

  private calculateDistance(address: string | null): number {
    // TODO: Implement real distance calculation using Google Maps API
    // For now, return a random distance between 1-10 km
    return Math.round((Math.random() * 9 + 1) * 10) / 10;
  }

  private formatItems(items: any): string {
    if (!items) return 'Articles de commande';
    
    try {
      if (typeof items === 'string') {
        items = JSON.parse(items);
      }
      
      if (Array.isArray(items)) {
        return items.map((item: any) => 
          `${item.quantity || 1}x ${item.nom_plat || item.name || 'Article'}`
        ).join(', ');
      }
      
      return 'Articles de commande';
    } catch (error) {
      console.error('Error formatting items:', error);
      return 'Articles de commande';
    }
  }

  private formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-GN', {
      minimumFractionDigits: 0
    }).format(amount) + ' GNF';
  }

  private calculateDeliveryTime(
    deliveryLat: number, 
    deliveryLng: number, 
    clientLat: number, 
    clientLng: number
  ): number {
    try {
      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = this.toRadians(clientLat - deliveryLat);
      const dLng = this.toRadians(clientLng - deliveryLng);
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(deliveryLat)) * Math.cos(this.toRadians(clientLat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;
      
      // Estimate delivery time based on distance
      // Assume average speed of 20 km/h for delivery in Conakry traffic
      const averageSpeedKmh = 20;
      const timeHours = distanceKm / averageSpeedKmh;
      const timeMinutes = Math.round(timeHours * 60);
      
      // Add 5 minutes buffer and minimum of 10 minutes
      const estimatedTime = Math.max(timeMinutes + 5, 10);
      
      console.log(`📍 Distance: ${distanceKm.toFixed(2)}km, Estimated time: ${estimatedTime} minutes`);
      
      return estimatedTime;
    } catch (error) {
      console.error('Error calculating delivery time:', error);
      return 25; // Default fallback
    }
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }


  private async getDeliveryPersonCoordinates(deliveryPhone: string): Promise<{latitude: number, longitude: number} | null> {
    try {
      const { data: deliveryUser } = await this.supabase
        .from('delivery_users')
        .select('latitude, longitude')
        .eq('telephone', deliveryPhone)
        .single();

      if (deliveryUser?.latitude && deliveryUser?.longitude) {
        return {
          latitude: deliveryUser.latitude,
          longitude: deliveryUser.longitude
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting delivery person coordinates:', error);
      return null;
    }
  }

  private calculateRealDistance(
    deliveryLat: number | null,
    deliveryLng: number | null,
    clientLat: number | null,
    clientLng: number | null
  ): number {
    if (!deliveryLat || !deliveryLng || !clientLat || !clientLng) {
      // Fallback à la distance par défaut si coordonnées manquantes
      return Math.round((Math.random() * 9 + 1) * 10) / 10;
    }

    try {
      // Utiliser la formule de Haversine existante
      const R = 6371; // Rayon de la Terre en km
      const dLat = this.toRadians(clientLat - deliveryLat);
      const dLng = this.toRadians(clientLng - deliveryLng);
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(deliveryLat)) * Math.cos(this.toRadians(clientLat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;
      
      return Math.round(distanceKm * 10) / 10; // Arrondir à 1 décimale
    } catch (error) {
      console.error('Error calculating real distance:', error);
      return Math.round((Math.random() * 9 + 1) * 10) / 10;
    }
  }

  private calculateRealEstimatedTime(
    deliveryLat: number | null,
    deliveryLng: number | null,
    clientLat: number | null,
    clientLng: number | null
  ): string {
    if (!deliveryLat || !deliveryLng || !clientLat || !clientLng) {
      return '25 min'; // Fallback par défaut
    }

    try {
      const distance = this.calculateRealDistance(deliveryLat, deliveryLng, clientLat, clientLng);
      
      // Estimer le temps de livraison basé sur la distance
      // Vitesse moyenne de 20 km/h pour livraison dans le trafic de Conakry
      const averageSpeedKmh = 20;
      const timeHours = distance / averageSpeedKmh;
      const timeMinutes = Math.round(timeHours * 60);
      
      // Ajouter 5 minutes de buffer et minimum de 10 minutes
      const estimatedTime = Math.max(timeMinutes + 5, 10);
      
      return `${estimatedTime} min`;
    } catch (error) {
      console.error('Error calculating real estimated time:', error);
      return '25 min';
    }
  }
}