import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { WhatsAppNotificationService } from './whatsapp-notification.service';

export interface Order {
  id: string;
  numero_commande: string;
  client_id: string;
  restaurant_id: string;
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

export interface DeliveryUser {
  id: number;
  telephone: string;
  nom: string;
  is_online: boolean;
  rating: number;
  total_deliveries: number;
}

export interface Restaurant {
  id: string;
  nom: string;
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantOrdersService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  private availableDeliveryUsersSubject = new BehaviorSubject<DeliveryUser[]>([]);
  public availableDeliveryUsers$ = this.availableDeliveryUsersSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private whatsAppService: WhatsAppNotificationService
  ) {}

  // Load orders for specific restaurant
  async loadRestaurantOrders(restaurantId: string): Promise<Order[]> {
    try {
      // Get orders for this restaurant
      const { data: orders, error: ordersError } = await this.supabase
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

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
        return [];
      }

      console.log('Raw orders data from database:', orders);

      if (!orders || orders.length === 0) {
        this.ordersSubject.next([]);
        return [];
      }

      // Get client information separately
      const clientIds = [...new Set(orders.map(o => o.client_id).filter(Boolean))];
      const { data: clients } = await this.supabase
        .from('clients')
        .select('id, nom, phone_whatsapp')
        .in('id', clientIds);

      const clientMap = new Map(clients?.map(c => [c.id, { nom: c.nom, phone: c.phone_whatsapp }]) || []);

      // Map orders with client information
      const mappedOrders: Order[] = orders.map(order => {
        const client = clientMap.get(order.client_id) || { nom: 'Client', phone: '' };
        
        console.log(`📋 Order ${order.numero_commande} - Client: ${client.nom}, Phone: ${client.phone}`);
        
        return {
          id: order.id,
          numero_commande: order.numero_commande,
          client_id: order.client_id,
          restaurant_id: order.restaurant_id,
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

      this.ordersSubject.next(mappedOrders);
      return mappedOrders;
    } catch (error) {
      console.error('Error loading restaurant orders:', error);
      return [];
    }
  }

  // Load available delivery users for specific restaurant
  async loadAvailableDeliveryUsers(restaurantId?: string): Promise<DeliveryUser[]> {
    try {
      console.log('🔍 Loading delivery users for restaurant:', restaurantId);
      
      let query = this.supabase
        .from('delivery_users')
        .select('id, telephone, nom, is_online, rating, total_deliveries, restaurant_id')
        .eq('status', 'actif')
        .eq('is_online', true)
        .eq('is_blocked', false);  // Ajout du filtre is_blocked

      // Filter by restaurant if provided
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
        console.log('📍 Filtering by restaurant_id:', restaurantId);
      }

      const { data: deliveryUsers, error } = await query.order('rating', { ascending: false });
      
      console.log('👥 Delivery users found:', deliveryUsers?.length || 0);
      console.log('📋 Delivery users details:', deliveryUsers);

      if (error) {
        console.error('Error loading delivery users:', error);
        return [];
      }

      const mappedUsers: DeliveryUser[] = (deliveryUsers || []).map(user => ({
        id: user.id,
        telephone: user.telephone,
        nom: user.nom,
        is_online: user.is_online,
        rating: user.rating || 0,
        total_deliveries: user.total_deliveries || 0
      }));

      this.availableDeliveryUsersSubject.next(mappedUsers);
      return mappedUsers;
    } catch (error) {
      console.error('Error loading delivery users:', error);
      return [];
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, newStatus: Order['statut'], note?: string): Promise<boolean> {
    try {
      const updateData: any = { statut: newStatus };

      // Add timestamp based on status
      if (newStatus === 'confirmee') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (newStatus === 'preparation') {
        updateData.prepared_at = new Date().toISOString();
      } else if (newStatus === 'livree') {
        updateData.delivered_at = new Date().toISOString();
      } else if (newStatus === 'terminee') {
        // Quand commande terminée, marquer le paiement comme payé
        updateData.paiement_statut = 'paye';
      }

      if (note) {
        updateData.note_restaurant = note;
      }

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
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              statut: newStatus, 
              note_restaurant: note || order.note_restaurant,
              ...(newStatus === 'terminee' && { paiement_statut: 'paye' as Order['paiement_statut'] })
            }
          : order
      );
      this.ordersSubject.next(updatedOrders);

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Update order status and send WhatsApp notification
  async updateOrderStatusWithNotification(
    orderId: string, 
    newStatus: Order['statut'], 
    restaurantName: string,
    note?: string
  ): Promise<boolean> {
    try {
      // 1. Update order status in database
      const success = await this.updateOrderStatus(orderId, newStatus, note);
      if (!success) {
        return false;
      }

      // 2. Get updated order details for notification
      const order = this.ordersSubject.value.find(o => o.id === orderId);
      if (!order) {
        console.error('Order not found for notification:', orderId);
        return true; // Status updated but no notification
      }

      // 3. Get restaurant phone for notification
      let restaurantPhone = '';
      if (order.restaurant_id) {
        const { data: restaurant } = await this.supabase
          .from('restaurants')
          .select('telephone')
          .eq('id', order.restaurant_id)
          .single();
        restaurantPhone = restaurant?.telephone || '';
      }

      // 4. Send WhatsApp notification based on status
      await this.sendStatusNotification(order, newStatus, restaurantName, restaurantPhone);

      return true;
    } catch (error) {
      console.error('Error updating order status with notification:', error);
      return false;
    }
  }

  // Send WhatsApp notification for order status change
  private async sendStatusNotification(
    order: Order, 
    status: Order['statut'], 
    restaurantName: string,
    restaurantPhone?: string
  ): Promise<void> {
    try {
      // Don't send notifications for certain statuses
      const skipNotification = ['en_attente', 'terminee'];
      if (skipNotification.includes(status)) {
        console.log(`⏭️ Skipping notification for status: ${status}`);
        return;
      }

      // Format order items for message
      const orderItemsText = order.items
        .map(item => `• ${item.quantite}× ${item.nom_plat} - ${this.formatPrice(item.prix_total)}`)
        .join('\n');

      // Get delivery mode text
      const deliveryModeText = order.mode === 'sur_place' ? 'SUR PLACE' :
                              order.mode === 'emporter' ? 'À EMPORTER' : 'LIVRAISON';

      // Get payment method text  
      const paymentMethodText = this.getPaymentMethodText(order.paiement_mode, order.paiement_statut);

      const orderData = {
        orderNumber: order.numero_commande,
        restaurantName: restaurantName,
        restaurantPhone: restaurantPhone || '',
        total: this.formatPrice(order.total),
        subtotal: this.formatPrice(order.sous_total),
        deliveryFee: this.formatPrice(order.frais_livraison),
        deliveryMode: deliveryModeText,
        paymentMethod: paymentMethodText,
        distance: order.distance_km ? `${order.distance_km}km` : '',
        orderItems: orderItemsText,
        livreurNom: order.livreur_nom,
        livreurPhone: order.livreur_phone,
        validationCode: order.validation_code,
        tempsEstime: this.getEstimatedTime(status),
        deliveryAddress: order.adresse_livraison || '',
        reason: '' // Can be filled for cancellation reasons
      };

      console.log(`📬 Sending WhatsApp for order ${order.numero_commande}:`);
      console.log(`   Client phone: ${order.client_phone}`);
      console.log(`   Status: ${status}`);
      console.log(`   Order data:`, orderData);

      const sent = await this.whatsAppService.sendStatusMessage(
        order.client_phone,
        status as keyof import('./whatsapp-notification.service').MessageTemplate,
        orderData
      );

      if (sent) {
        console.log(`✅ WhatsApp notification sent for order ${order.numero_commande} - Status: ${status}`);
      } else {
        console.error(`❌ Failed to send WhatsApp notification for order ${order.numero_commande}`);
      }
    } catch (error) {
      console.error('Error sending status notification:', error);
    }
  }

  // Get estimated time based on status
  private getEstimatedTime(status: Order['statut']): string {
    switch (status) {
      case 'confirmee':
        return '15-25 minutes';
      case 'preparation':
        return '10-15 minutes';
      case 'prete':
        return 'Immédiat';
      case 'en_livraison':
        return '10-20 minutes';
      default:
        return '';
    }
  }

  // Format price for messages
  private formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-GN', {
      minimumFractionDigits: 0
    }).format(amount) + ' GNF';
  }

  // Get payment method text
  private getPaymentMethodText(paymentMode: string, paymentStatus: string): string {
    if (paymentStatus === 'paye') {
      return '✅ PAYÉ';
    }
    
    switch (paymentMode) {
      case 'maintenant':
        return 'PAIEMENT MOBILE';
      case 'fin_repas':
        return 'À LA FIN DU REPAS (cash)';
      case 'recuperation':
        return 'À LA RÉCUPÉRATION (cash)';
      case 'livraison':
        return 'À LA LIVRAISON (cash,o-money)';
      default:
        return 'CASH';
    }
  }

  // Assign delivery person to order
  async assignDeliveryPerson(orderId: string, deliveryUserId: number): Promise<boolean> {
    try {
      // Get delivery user info
      const { data: deliveryUser } = await this.supabase
        .from('delivery_users')
        .select('nom, telephone')
        .eq('id', deliveryUserId)
        .single();

      if (!deliveryUser) {
        console.error('Delivery user not found');
        return false;
      }

      // Update order with delivery person (keep existing validation_code)
      const assignedAt = new Date().toISOString();
      const { error } = await this.supabase
        .from('commandes')
        .update({
          livreur_nom: deliveryUser.nom,
          livreur_phone: deliveryUser.telephone,
          statut: 'en_livraison' as Order['statut'],
          assigned_at: assignedAt
          // Note: validation_code is kept unchanged from when order was marked "prete"
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error assigning delivery person:', error);
        return false;
      }

      // Update local state (keep existing validation_code)
      const currentOrders = this.ordersSubject.value;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              livreur_nom: deliveryUser.nom,
              livreur_phone: deliveryUser.telephone,
              statut: 'en_livraison' as Order['statut'],
              assigned_at: assignedAt
              // validation_code remains unchanged from existing order
            }
          : order
      );
      this.ordersSubject.next(updatedOrders);

      return true;
    } catch (error) {
      console.error('Error assigning delivery person:', error);
      return false;
    }
  }

  // Parse order items from JSONB
  private parseOrderItems(items: any): OrderItem[] {
    if (!items) return [];
    
    try {
      const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
      
      if (Array.isArray(parsedItems)) {
        return parsedItems.map(item => ({
          nom_plat: item.nom_plat || item.name || 'Plat',
          quantite: item.quantite || item.quantity || 1,
          prix_unitaire: item.prix_unitaire || item.prix || 0,
          prix_total: (item.quantite || item.quantity || 1) * (item.prix_unitaire || item.prix || 0)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing order items:', error);
      return [];
    }
  }

  // Get current orders observable
  getCurrentOrders(): Observable<Order[]> {
    return this.orders$;
  }

  // Get available delivery users observable
  getAvailableDeliveryUsers(): Observable<DeliveryUser[]> {
    return this.availableDeliveryUsers$;
  }

  // Get restaurant coordinates
  async getRestaurantCoordinates(restaurantId: string): Promise<Restaurant | null> {
    try {
      const { data: restaurant, error } = await this.supabase
        .from('restaurants')
        .select('id, nom, latitude, longitude')
        .eq('id', restaurantId)
        .single();

      if (error || !restaurant) {
        console.error('Error loading restaurant coordinates:', error);
        return null;
      }

      return {
        id: restaurant.id,
        nom: restaurant.nom,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      };
    } catch (error) {
      console.error('Error loading restaurant coordinates:', error);
      return null;
    }
  }

  // Réassigner une commande à un nouveau livreur
  async reassignDeliveryDriver(orderId: string, newDriverId: number): Promise<boolean> {
    try {
      console.log('🔄 Reassigning order:', { orderId, newDriverId });
      
      // Récupérer les détails de la commande actuelle (avec coordonnées GPS et infos paiement)
      const { data: orderData, error: orderError } = await this.supabase
        .from('commandes')
        .select('numero_commande, livreur_phone, livreur_nom, adresse_livraison, latitude_livraison, longitude_livraison, total, paiement_mode, paiement_statut')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error('❌ Error fetching order details:', {
          error: orderError,
          orderId: orderId,
          message: orderError?.message || 'Unknown error'
        });
        return false;
      }

      console.log('✅ Order data fetched:', orderData);
      
      // Récupérer les infos du nouveau livreur (incluant sa position)
      const { data: newDriver, error: driverError } = await this.supabase
        .from('delivery_users')
        .select('nom, telephone, latitude, longitude')
        .eq('id', newDriverId)
        .single();

      if (driverError || !newDriver) {
        console.error('❌ Error fetching new driver details:', {
          error: driverError,
          newDriverId: newDriverId,
          message: driverError?.message || 'Unknown error'
        });
        return false;
      }
      
      console.log('✅ New driver data fetched:', newDriver);

      // Sauvegarder l'ancien livreur pour la notification
      const oldDriverPhone = orderData.livreur_phone;
      const oldDriverName = orderData.livreur_nom;

      // Mettre à jour la commande avec le nouveau livreur
      const { error: updateError } = await this.supabase
        .from('commandes')
        .update({
          livreur_nom: newDriver.nom,
          livreur_phone: newDriver.telephone,
          assigned_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order with new driver:', updateError);
        return false;
      }

      // Envoyer les notifications WhatsApp
      await this.sendReassignmentNotifications(
        orderData.numero_commande,
        oldDriverPhone,
        oldDriverName,
        newDriver.telephone,
        newDriver.nom,
        orderData.adresse_livraison,
        orderData.latitude_livraison,
        orderData.longitude_livraison,
        newDriver.latitude,
        newDriver.longitude,
        orderData.total,
        orderData.paiement_mode,
        orderData.paiement_statut
      );

      // Mettre à jour le state local
      const currentOrders = this.ordersSubject.value;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId 
          ? { ...order, livreur_nom: newDriver.nom, livreur_phone: newDriver.telephone }
          : order
      );
      this.ordersSubject.next(updatedOrders);

      return true;
    } catch (error) {
      console.error('Error reassigning delivery driver:', error);
      return false;
    }
  }

  // Envoyer les notifications de réassignation aux deux livreurs
  private async sendReassignmentNotifications(
    orderNumber: string,
    oldDriverPhone: string | null,
    oldDriverName: string | null,
    newDriverPhone: string,
    newDriverName: string,
    deliveryAddress: string | null,
    clientLatitude: number | null,
    clientLongitude: number | null,
    driverLatitude: number | null,
    driverLongitude: number | null,
    total: number,
    paymentMode: string,
    paymentStatus: string
  ): Promise<void> {
    try {
      // Message pour l'ancien livreur (si existant)
      if (oldDriverPhone) {
        const oldDriverMessage = `⚠️ *CHANGEMENT DE LIVREUR*

📦 *Commande N°${orderNumber}*

❌ Cette commande a été réassignée à un autre livreur.

⚠️ *Ne vous déplacez pas pour cette livraison*

Si vous étiez déjà en route, veuillez retourner au restaurant.

Merci de votre compréhension.`;

        await this.whatsAppService.sendMessage(oldDriverPhone, oldDriverMessage, orderNumber);
        console.log(`✅ Notification envoyée à l'ancien livreur ${oldDriverName}`);
      }

      // Extraire les coordonnées depuis l'adresse si les colonnes lat/lng sont NULL
      let finalClientLatitude = clientLatitude;
      let finalClientLongitude = clientLongitude;
      
      if (!finalClientLatitude && !finalClientLongitude && deliveryAddress) {
        const coords = this.extractCoordinatesFromAddress(deliveryAddress);
        if (coords) {
          finalClientLatitude = coords.latitude;
          finalClientLongitude = coords.longitude;
        }
      }

      // Debug des coordonnées
      console.log('🧭 Coordonnées pour calcul temps:', {
        originalClientLatitude: clientLatitude,
        originalClientLongitude: clientLongitude,
        finalClientLatitude,
        finalClientLongitude,
        driverLatitude,
        driverLongitude,
        deliveryAddress
      });

      // Calculer le temps de livraison estimé
      let estimatedTime = '30-40 min'; // Valeur par défaut
      
      if (driverLatitude && driverLongitude && finalClientLatitude && finalClientLongitude) {
        const timeMinutes = this.calculateDeliveryTime(
          driverLatitude,
          driverLongitude,
          finalClientLatitude,
          finalClientLongitude
        );
        
        // Ajouter une marge de 5-10 minutes pour le temps au restaurant
        const minTime = timeMinutes + 5;
        const maxTime = timeMinutes + 10;
        estimatedTime = `${minTime}-${maxTime} min`;
      }

      // Message pour le nouveau livreur
      let newDriverMessage = `🎯 *NOUVELLE COMMANDE ASSIGNÉE*

📦 *Commande N°${orderNumber}*
💰 Montant: ${new Intl.NumberFormat('fr-GN').format(total)} GNF
💳 Mode: ${this.formatPaymentMode(paymentMode)}
📊 Statut: ${this.formatPaymentStatus(paymentStatus)}

✅ Cette commande vous a été assignée.`;

      // Ajouter le lien Google Maps si les coordonnées sont disponibles
      if (finalClientLatitude && finalClientLongitude) {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${finalClientLatitude},${finalClientLongitude}&travelmode=driving`;
        newDriverMessage += `

📍 *Itinéraire vers le client:*
${mapsUrl}`;
      } else if (deliveryAddress) {
        newDriverMessage += `

📍 Adresse: ${deliveryAddress}`;
      }

      newDriverMessage += `

🚀 *Veuillez vous rendre au restaurant pour récupérer la commande*

⏰ Délai de livraison estimé: ${estimatedTime}

Bonne livraison !`;

      await this.whatsAppService.sendMessage(newDriverPhone, newDriverMessage, orderNumber);
      console.log(`✅ Notification envoyée au nouveau livreur ${newDriverName}`);
      
    } catch (error) {
      console.error('Error sending reassignment notifications:', error);
    }
  }

  // Calculer le temps de livraison estimé basé sur la distance
  private calculateDeliveryTime(
    driverLat: number,
    driverLng: number,
    clientLat: number,
    clientLng: number
  ): number {
    try {
      // Formule de Haversine pour calculer la distance
      const R = 6371; // Rayon de la Terre en km
      const dLat = this.toRadians(clientLat - driverLat);
      const dLng = this.toRadians(clientLng - driverLng);
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(driverLat)) * Math.cos(this.toRadians(clientLat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;
      
      // Estimer le temps basé sur la distance
      // Vitesse moyenne de 20 km/h dans le trafic de Conakry
      const averageSpeedKmh = 20;
      const timeHours = distanceKm / averageSpeedKmh;
      const timeMinutes = Math.round(timeHours * 60);
      
      // Ajouter 5 minutes de buffer avec un minimum de 10 minutes
      const estimatedTime = Math.max(timeMinutes + 5, 10);
      
      console.log(`📍 Distance: ${distanceKm.toFixed(2)}km, Temps estimé: ${estimatedTime} minutes`);
      
      return estimatedTime;
    } catch (error) {
      console.error('Error calculating delivery time:', error);
      return 25; // Valeur par défaut
    }
  }

  // Convertir les degrés en radians
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Extraire les coordonnées depuis une adresse au format "GPS: lat, lng"
  private extractCoordinatesFromAddress(address: string): { latitude: number, longitude: number } | null {
    try {
      // Pattern pour extraire "GPS: 48.6280292, 2.589282"
      const gpsMatch = address.match(/GPS:\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
      
      if (gpsMatch) {
        const latitude = parseFloat(gpsMatch[1]);
        const longitude = parseFloat(gpsMatch[2]);
        
        if (!isNaN(latitude) && !isNaN(longitude)) {
          console.log(`📍 Coordonnées extraites de l'adresse: ${latitude}, ${longitude}`);
          return { latitude, longitude };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting coordinates from address:', error);
      return null;
    }
  }

  // Formater le mode de paiement
  private formatPaymentMode(mode: string): string {
    switch (mode) {
      case 'maintenant': return 'Immédiat';
      case 'fin_repas': return 'Fin de repas';
      case 'recuperation': return 'À la récupération';
      case 'livraison': return 'À la livraison (cash)';
      default: return mode;
    }
  }

  // Formater le statut de paiement
  private formatPaymentStatus(status: string): string {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'paye': return 'Payé';
      case 'echoue': return 'Échec';
      case 'rembourse': return 'Remboursé';
      default: return status;
    }
  }
}