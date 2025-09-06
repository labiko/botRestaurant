import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseFranceService } from './supabase-france.service';
import { WhatsAppNotificationFranceService, OrderDataFrance } from './whatsapp-notification-france.service';
import { DeliveryNotificationService } from './delivery-notification.service';
import { UniversalOrderDisplayService } from './universal-order-display.service';
import { AutoRefreshService } from './auto-refresh.service';
import { FuseauHoraireService } from './fuseau-horaire.service';
import { REFRESH_CONFIG } from '../config/refresh.config';

// Interface pour les paramètres de notification WhatsApp
export interface NotificationSettings {
  sendOnConfirmed: boolean;    // Toujours recommandé
  sendOnPreparation: boolean;  // Optionnel
  sendOnReady: boolean;        // Toujours recommandé  
  sendOnDelivery: boolean;     // Si livraison active
  sendOnDelivered: boolean;    // Toujours recommandé
  sendOnCancelled: boolean;    // Obligatoire
}

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
  // NOUVEAU : Champs système de livraison automatique
  driver_id?: number;
  driver_assignment_status?: 'none' | 'searching' | 'assigned' | 'delivered';
  delivery_started_at?: string;
  assignment_timeout_at?: string;
  estimated_delivery_time?: string;
  assigned_driver_id?: number; // Alias pour compatibilité UI
  assignment_started_at?: string; // Timestamp de la première notification ou du dernier rappel
  // CORRECTION BOUTON ITINÉRAIRE : Coordonnées GPS
  delivery_address_coordinates?: {
    latitude: number;
    longitude: number;
    address_label: string;
  };
  // NOUVEAU : Nom WhatsApp du client
  customer_whatsapp_name?: string;
  // NOUVEAU : Métadonnées de notification
  notification_metadata?: {
    drivers_notified?: number;
    notification_sent_at?: string;
    last_reminder_at?: string;
  };
  drivers_notified_count?: number;
  // NOUVEAU : Données du livreur assigné
  assigned_driver?: {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
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
  
  // Auto-refresh
  private autoRefreshSubscription?: Subscription;
  private currentRestaurantId?: number;

  // NOUVEAU : Paramètres de notification par défaut - PAS DE RÉGRESSION
  private readonly defaultNotificationSettings: NotificationSettings = {
    sendOnConfirmed: true,    // Toujours envoyer pour confirmation
    sendOnPreparation: false, // Éviter le spam - optionnel
    sendOnReady: true,        // Important pour action client
    sendOnDelivery: true,     // Important pour suivi livreur
    sendOnDelivered: true,    // Confirmation finale + fidélisation
    sendOnCancelled: true     // Obligatoire pour informer l'annulation
  };

  constructor(
    private supabaseFranceService: SupabaseFranceService,
    private whatsAppFranceService: WhatsAppNotificationFranceService,
    private deliveryNotificationService: DeliveryNotificationService,
    private universalOrderDisplayService: UniversalOrderDisplayService,
    private autoRefreshService: AutoRefreshService,
    private fuseauHoraireService: FuseauHoraireService
  ) { }

  async loadOrders(restaurantId: number): Promise<void> {
    try {
      const { data, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          *,
          delivery_address_coordinates:france_customer_addresses(
            latitude,
            longitude,
            address_label
          ),
          assigned_driver:france_delivery_drivers!france_orders_driver_fkey(
            id,
            first_name,
            last_name,
            phone_number
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement commandes France:', error);
        // Initialiser avec tableau vide en cas d'erreur
        this.ordersSubject.next([]);
        return;
      }

      const processedOrders = data?.map((order: any) => this.processOrder(order)) || [];
      
      // 🔍 LOGS DIAGNOSTICS: Analyser le total_amount des commandes
      if (processedOrders.length > 0) {
        const firstOrder = processedOrders[0];
      }
      
      this.ordersSubject.next(processedOrders);
    } catch (error) {
      console.error('Erreur service commandes France:', error);
      // Initialiser avec tableau vide en cas d'exception
      this.ordersSubject.next([]);
    }
  }

  private processOrder(order: any): FranceOrder {
    // 🔍 LOGS DIAGNOSTICS: Analyser l'order brut de la BDD
    console.log('🔍 [processOrder] Order brut reçu de la BDD:', JSON.stringify(order, null, 2));
    
    // Extraire les items du format complexe du bot
    let processedItems: any[] = [];
    
    try {
      const rawItems = order.items;
      
      if (Array.isArray(rawItems)) {
        // NOUVEAU FORMAT: Tableau direct du bot universel - PRIORITÉ
        processedItems = rawItems;
      } else if (typeof rawItems === 'string') {
        // Format JSON string simple
        try {
          const parsed = JSON.parse(rawItems);
          if (Array.isArray(parsed)) {
            processedItems = parsed;
          }
        } catch (error) {
          console.error('Erreur parsing items JSON string:', error);
        }
      } else if (typeof rawItems === 'object' && rawItems !== null) {
        // ANCIEN FORMAT: Format complexe du bot avec clés item_X_...
        for (const [key, value] of Object.entries(rawItems)) {
          if (value && typeof value === 'object' && (value as any).item) {
            const item = (value as any).item;
            const quantity = (value as any).quantity || 1;
            
            // Extraire les détails des options depuis la clé
            let optionsDetails: any = {};
            try {
              // La clé contient les options au format: item_2_{"sauce":[...],"viande":{...}}
              const optionsMatch = key.match(/item_\d+_(.+)/);
              if (optionsMatch) {
                optionsDetails = JSON.parse(optionsMatch[1]);
              }
            } catch (e) {
              // Si parsing échoue, utiliser les options depuis l'item
              optionsDetails = item.selected_options || {};
            }
            
            processedItems.push({
              // DONNÉES DYNAMIQUES UNIQUEMENT - PAS DE VALEURS PAR DÉFAUT EN DUR
              name: item.name,
              display_name: item.display_name || item.name,
              quantity: quantity,
              price: item.final_price || item.base_price,
              total_price: (item.final_price || item.base_price || 0) * quantity,
              
              // Extraire TOUS les champs dynamiquement depuis la BDD
              size_name: item.size_name,
              includes_drink: item.includes_drink,
              composition: item.composition,
              description: item.description,
              configuration_details: item.configuration_details,
              selected_options: optionsDetails,
              selected_drink: item.selected_drink, // 🥤 AJOUT: Récupérer la boisson sélectionnée
              product_type: item.product_type,
              
              // Champs additionnels pour affichage détaillé
              base_price: item.base_price,
              price_on_site_base: item.price_on_site_base,
              price_delivery_base: item.price_delivery_base,
              category_id: item.category_id,
              restaurant_id: item.restaurant_id,
              is_active: item.is_active,
              display_order: item.display_order,
              
              // Toutes autres propriétés dynamiques
              ...item
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Erreur traitement items:', error);
      processedItems = [];
    }

    return {
      ...order,
      items: processedItems,
      total_amount: order.total_amount, // 🧪 TEST: Afficher le vrai total_amount de la base sans recalcul
      availableActions: this.getAvailableActions(order.status),
      // Alias pour compatibilité UI avec le système de livraison
      assigned_driver_id: order.driver_id
    };
  }

  getAvailableActions(status: string): OrderAction[] {
    const actions: { [key: string]: OrderAction[] } = {
      'pending': [
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
      ],
      'livree': [
      ],
      'annulee': [
        // { key: 'restore', label: 'Restaurer', color: 'primary', nextStatus: 'pending' } // BOUTON SUPPRIMÉ - Inutile
      ]
    };

    return actions[status] || [];
  }

  async updateOrderStatus(orderId: number, newStatus: string): Promise<boolean> {
    try {
      // Étape 0: Récupérer le statut actuel pour vérifier le changement
      const { data: currentOrder, error: fetchError } = await this.supabaseFranceService.client
        .from('france_orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error('❌ [FranceOrders] Erreur récupération statut actuel:', fetchError);
        return false;
      }

      const currentStatus = currentOrder?.status;
      const statusChanged = currentStatus !== newStatus;

      console.log(`🔄 [FranceOrders] Changement statut pour commande ${orderId}: "${currentStatus}" → "${newStatus}" (changé: ${statusChanged})`);

      // Étape 1: Mise à jour du statut en base de données
      const updateData: any = {
        status: newStatus,
        updated_at: this.fuseauHoraireService.getCurrentTimeForDatabase()
      };

      if (newStatus === 'en_livraison') {
        updateData.delivery_started_at = this.fuseauHoraireService.getCurrentTimeForDatabase();
      }


      const { error } = await this.supabaseFranceService.client
        .from('france_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('❌ [FranceOrders] Erreur mise à jour statut:', error);
        return false;
      }

      console.log(`✅ [FranceOrders] Statut mis à jour: ${orderId} → ${newStatus}`);

      // Étape 2: Envoyer notification WhatsApp SEULEMENT si le statut a vraiment changé
      if (statusChanged) {
        try {
          await this.sendWhatsAppNotification(orderId, newStatus);
          
          // Étape 3: NOUVEAU - Déclencher le système de notification des livreurs si commande prête pour livraison
          await this.handleDeliveryNotifications(orderId, newStatus);
        } catch (whatsappError) {
          // Ne pas faire échouer la mise à jour du statut si WhatsApp échoue
          console.error('⚠️ [FranceOrders] Erreur notification WhatsApp (non bloquant):', whatsappError);
        }
      } else {
        console.log(`ℹ️ [FranceOrders] Statut inchangé pour commande ${orderId}, aucune notification envoyée`);
      }

      return true;
    } catch (error) {
      console.error('❌ [FranceOrders] Erreur service mise à jour statut:', error);
      return false;
    }
  }

  /**
   * NOUVEAU : Vérifie si la notification doit être envoyée selon les paramètres
   */
  private shouldSendNotification(status: string, settings: NotificationSettings = this.defaultNotificationSettings): boolean {
    const statusMapping: Record<string, keyof NotificationSettings> = {
      'confirmee': 'sendOnConfirmed',
      'preparation': 'sendOnPreparation', 
      'prete': 'sendOnReady',
      'en_livraison': 'sendOnDelivery',
      'livree': 'sendOnDelivered',
      'annulee': 'sendOnCancelled'
    };

    const settingKey = statusMapping[status];
    if (!settingKey) {
      console.log(`ℹ️ [FranceOrders] Statut non mappé pour notifications: ${status}`);
      return false;
    }

    const shouldSend = settings[settingKey];
    console.log(`🔔 [FranceOrders] Notification pour statut '${status}': ${shouldSend ? 'OUI' : 'NON'}`);
    return shouldSend;
  }

  /**
   * Envoie une notification WhatsApp pour le changement de statut
   * NOUVELLE MÉTHODE - Pas de régression sur l'existant
   */
  private async sendWhatsAppNotification(orderId: number, newStatus: string): Promise<void> {
    try {
      console.log(`📱 [FranceOrders] Envoi notification WhatsApp pour commande ${orderId}, statut: ${newStatus}`);

      // NOUVEAU : Vérifier si notification doit être envoyée - PAS DE RÉGRESSION
      if (!this.shouldSendNotification(newStatus)) {
        console.log(`⏭️ [FranceOrders] Notification désactivée pour le statut: ${newStatus}`);
        return;
      }

      // Récupérer les données complètes de la commande
      const orderData = await this.getOrderCompleteData(orderId);
      
      if (!orderData) {
        console.error(`❌ [FranceOrders] Impossible de récupérer les données de la commande ${orderId}`);
        return;
      }

      // Mapper le statut vers le format WhatsApp
      const whatsappStatus = this.mapStatusToWhatsApp(newStatus);
      
      if (!whatsappStatus) {
        console.log(`ℹ️ [FranceOrders] Pas de notification WhatsApp pour le statut: ${newStatus}`);
        return;
      }

      // Envoyer la notification
      const success = await this.whatsAppFranceService.sendOrderStatusNotification(
        orderData.phone_number,
        whatsappStatus,
        this.formatOrderDataForWhatsApp(orderData)
      );

      if (success) {
        console.log(`✅ [FranceOrders] Notification WhatsApp envoyée avec succès pour commande ${orderId}`);
      } else {
        console.error(`❌ [FranceOrders] Échec envoi notification WhatsApp pour commande ${orderId}`);
      }

    } catch (error) {
      console.error(`❌ [FranceOrders] Erreur lors de l'envoi notification WhatsApp:`, error);
      throw error; // Re-throw pour gestion dans updateOrderStatus
    }
  }

  /**
   * Récupère les données complètes d'une commande avec restaurant
   */
  private async getOrderCompleteData(orderId: number): Promise<any | null> {
    try {
      console.log(`🔍 [FranceOrders] Récupération données commande ID: ${orderId}`);
      
      const { data, error } = await this.supabaseFranceService.client
        .from('france_orders')
        .select(`
          *,
          france_restaurants!inner (
            id,
            name,
            phone,
            whatsapp_number
          ),
          france_delivery_drivers (
            id,
            first_name,
            last_name,
            phone_number
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('❌ [FranceOrders] Erreur récupération données commande:', {
          orderId,
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ [FranceOrders] Erreur service récupération données:', {
        orderId,
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return null;
    }
  }

  /**
   * Mappe les statuts de la base vers les statuts WhatsApp
   */
  private mapStatusToWhatsApp(status: string): 'confirmee' | 'en_preparation' | 'prete' | 'en_livraison' | 'livree' | 'annulee' | null {
    const statusMapping: Record<string, string> = {
      'confirmee': 'confirmee',
      'preparation': 'en_preparation',
      'prete': 'prete',
      'en_livraison': 'en_livraison',
      'livree': 'livree',
      'annulee': 'annulee'
    };

    return statusMapping[status] as any || null;
  }

  /**
   * Formate les données de commande pour le service WhatsApp
   */
  private formatOrderDataForWhatsApp(orderData: any): OrderDataFrance {
    console.log('🔍 [FranceOrders] formatOrderDataForWhatsApp - orderData.items:', orderData.items);
    console.log('🔍 [FranceOrders] formatOrderDataForWhatsApp - delivery_mode:', orderData.delivery_mode);
    console.log('🔍 [FranceOrders] formatOrderDataForWhatsApp - payment_mode:', orderData.payment_mode);
    
    // Les articles sont dans un format complexe du bot, utilisons processOrder pour les extraire
    const processedOrder = this.processOrder(orderData);
    
    // Formater les articles depuis les données traitées
    const itemsText = this.formatItemsForWhatsApp(processedOrder.items || []);
    
    // Formater le mode de paiement
    const paymentModeText = this.formatPaymentModeForWhatsApp(orderData.payment_mode);
    
    // Formater le mode de livraison
    const deliveryModeText = this.formatDeliveryModeForWhatsApp(orderData.delivery_mode);

    return {
      orderNumber: orderData.order_number || `${orderData.id}`,
      restaurantName: orderData.france_restaurants?.name || 'Restaurant',
      restaurantPhone: orderData.france_restaurants?.phone || orderData.france_restaurants?.whatsapp_number || '',
      total: this.formatPrice(orderData.total_amount || 0),
      deliveryMode: deliveryModeText,
      paymentMode: paymentModeText,
      orderItems: itemsText,
      deliveryAddress: orderData.delivery_address || '',
      validationCode: orderData.delivery_validation_code || '',
      customerName: orderData.customer_name || '',
      estimatedTime: '10-15 min', // Valeur par défaut
      reason: '', // Pour les annulations
      // NOUVEAU : Données du livreur
      driverName: orderData.france_delivery_drivers?.name || 'Livreur en cours',
      driverPhone: orderData.france_delivery_drivers?.phone_number || 'Non disponible'
    };
  }

  /**
   * Formate les articles pour l'affichage WhatsApp - FORMAT UNIVERSEL
   */
  private formatItemsForWhatsApp(items: any[]): string {
    console.log('🔍 [FranceOrders] formatItemsForWhatsApp - items:', items);
    
    if (!Array.isArray(items) || items.length === 0) {
      console.log('❌ [FranceOrders] Items array vide ou invalide');
      return '• Aucun article détaillé disponible';
    }

    // Utiliser le service universel pour formater les items de façon cohérente
    const formattedItems = this.universalOrderDisplayService.formatOrderItems(items);
    
    return formattedItems.map(formattedItem => {
      let itemText = `• ${formattedItem.quantity}x ${formattedItem.productName}`;
      
      // Ajouter la taille si présente
      if (formattedItem.sizeInfo) {
        itemText += ` ${formattedItem.sizeInfo}`;
      }
      
      // Ajouter le prix
      itemText += ` - ${this.formatPrice(formattedItem.totalPrice)}`;
      
      // Ajouter les configurations en lignes séparées avec emojis
      const configDetails: string[] = [];
      
      // Configuration inline (viande, sauces) avec emojis
      if (formattedItem.inlineConfiguration && formattedItem.inlineConfiguration.length > 0) {
        const viande = formattedItem.inlineConfiguration.find(config => 
          ['merguez', 'poulet', 'boeuf', 'agneau', 'kebab', 'cheval'].some(meat => 
            config.toLowerCase().includes(meat)
          )
        );
        if (viande) configDetails.push(`  🥩 ${viande}`);
        
        const sauces = formattedItem.inlineConfiguration.filter(config => 
          !['merguez', 'poulet', 'boeuf', 'agneau', 'kebab', 'cheval'].some(meat => 
            config.toLowerCase().includes(meat)
          )
        );
        if (sauces.length > 0) configDetails.push(`  🍯 ${sauces.join(', ')}`);
      }
      
      // Items additionnels (boissons, etc.)
      if (formattedItem.additionalItems && formattedItem.additionalItems.length > 0) {
        formattedItem.additionalItems.forEach(additional => {
          if (additional.includes('🧊')) {
            configDetails.push(`  🥤 ${additional.replace('🧊 ', '')}`);
          } else {
            configDetails.push(`  ${additional}`);
          }
        });
      }
      
      console.log(`✅ [FranceOrders] Item formaté: ${formattedItem.quantity}x ${formattedItem.productName} - ${this.formatPrice(formattedItem.totalPrice)}`);
      
      return itemText + (configDetails.length > 0 ? '\n' + configDetails.join('\n') : '');
    }).join('\n');
  }

  /**
   * Formate le mode de paiement pour WhatsApp
   */
  private formatPaymentModeForWhatsApp(paymentMode: string): string {
    const modes: Record<string, string> = {
      'maintenant': 'Carte bancaire',
      'fin_repas': 'Cash sur place',
      'recuperation': 'Cash à emporter',
      'livraison': 'Cash livraison'
    };
    
    return modes[paymentMode] || paymentMode || 'Non spécifié';
  }

  /**
   * Formate le mode de livraison pour WhatsApp
   */
  private formatDeliveryModeForWhatsApp(deliveryMode: string): string {
    const modes: Record<string, string> = {
      'sur_place': 'Sur place',
      'a_emporter': 'À emporter',
      'livraison': 'Livraison'
    };
    
    return modes[deliveryMode] || deliveryMode || 'Non spécifié';
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': 'warning',
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
      'pending': 'En attente',
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

  getDeliveryStartedMinutesAgo(deliveryStartedAt: string): number {
    const startTime = new Date(deliveryStartedAt);
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    return Math.floor(diffMs / (1000 * 60)); // Convertir en minutes
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  }

  /**
   * NOUVEAU - Gérer les notifications de livraison selon le système de tokens sécurisés
   */
  private async handleDeliveryNotifications(orderId: number, newStatus: string): Promise<void> {
    try {
      // Déclencher le système de notification des livreurs SEULEMENT si:
      // 1. Le statut devient "prete" 
      // 2. ET la commande est en mode livraison
      if (newStatus === 'prete') {
        console.log(`🚚 [FranceOrders] Vérification mode livraison pour commande ${orderId}...`);

        // Récupérer les détails de la commande pour vérifier le mode de livraison
        const { data: order, error } = await this.supabaseFranceService.client
          .from('france_orders')
          .select('delivery_mode, restaurant_id')
          .eq('id', orderId)
          .single();

        if (error) {
          console.error('❌ [FranceOrders] Erreur récupération détails commande:', error);
          return;
        }

        if (order && order.delivery_mode === 'livraison') {
          console.log(`📱 [FranceOrders] Déclenchement notifications livreurs pour commande ${orderId}...`);
          
          // Déclencher le système de notification des livreurs avec tokens sécurisés
          const notificationResult = await this.deliveryNotificationService.notifyAvailableDrivers(orderId);
          
          if (notificationResult.success) {
            console.log(`✅ [FranceOrders] ${notificationResult.sentCount} livreurs notifiés pour commande ${orderId}`);
          } else {
            console.warn(`⚠️ [FranceOrders] Échec notifications livreurs: ${notificationResult.message}`);
          }
        } else {
          console.log(`ℹ️ [FranceOrders] Commande ${orderId} n'est pas en mode livraison (mode: ${order?.delivery_mode}), pas de notification livreurs`);
        }
      }
    } catch (error) {
      console.error('❌ [FranceOrders] Erreur handleDeliveryNotifications:', error);
      // Ne pas faire échouer le processus principal
    }
  }

  /**
   * Démarre le refresh automatique pour un restaurant
   */
  startAutoRefresh(restaurantId: number): Subscription {
    this.currentRestaurantId = restaurantId;
    
    // Arrêter le précédent s'il existe
    this.stopAutoRefresh();
    
    // Démarrer le nouveau refresh
    this.autoRefreshSubscription = this.autoRefreshService.startAutoRefresh(
      'restaurant-orders', 
      REFRESH_CONFIG.COMPONENTS.RESTAURANT_ORDERS
    ).subscribe(shouldRefresh => {
      if (shouldRefresh && this.currentRestaurantId) {
        this.performSilentRefresh(this.currentRestaurantId);
      }
    });
    
    console.log('🔄 [DEBUG] Auto-refresh démarré (30s)');
    return this.autoRefreshSubscription;
  }

  /**
   * Arrête le refresh automatique
   */
  stopAutoRefresh(): void {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
      this.autoRefreshSubscription = undefined;
    }
    this.autoRefreshService.stopAutoRefresh('restaurant-orders');
    console.log('⏹️ [DEBUG] Auto-refresh arrêté');
  }

  /**
   * Effectue un refresh silencieux (sans spinner)
   */
  private async performSilentRefresh(restaurantId: number): Promise<void> {
    try {
      console.log(`🔄 [DEBUG] Refresh des commandes restaurant ${restaurantId}`);
      await this.loadOrders(restaurantId);
    } catch (error) {
      console.error('❌ [FranceOrders] Erreur refresh automatique:', error);
    }
  }
}