import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseFranceService } from './supabase-france.service';
import { WhatsAppNotificationFranceService, OrderDataFrance } from './whatsapp-notification-france.service';
import { DeliveryNotificationService } from './delivery-notification.service';
import { UniversalOrderDisplayService } from './universal-order-display.service';
import { AutoRefreshService } from './auto-refresh.service';
import { FuseauHoraireService } from './fuseau-horaire.service';
import { AudioNotificationService } from './audio-notification.service';
import { PaymentLinkService } from './payment-link.service';
import { CurrencyService } from './currency.service';
import { RestaurantConfigService } from '../../features/restaurant-france/services/restaurant-config.service';
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
  delivery_latitude?: number; // NOUVEAU: Coordonnée GPS
  delivery_longitude?: number; // NOUVEAU: Coordonnée GPS
  delivery_address_type?: 'text' | 'geolocation'; // NOUVEAU: Type d'adresse
  payment_mode: string;
  payment_method?: string;
  status: string;
  notes?: string;
  additional_notes?: string;
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
  delivery_driver?: {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  // NOUVEAU : État des assignations pending
  hasPendingAssignment?: boolean;
  hasAnyAssignment?: boolean; // N'importe quelle assignation pending (même expirée)
  pendingDriversCount?: number;
  pendingDriverNames?: string;
  // NOUVEAU : Paiement en ligne
  online_payment_status?: 'not_sent' | 'link_sent' | 'paid' | 'failed';
  payment_date?: string;  // Date de paiement
  payment_link_url?: string;  // URL du lien de paiement
  payment_link_sent_at?: string;  // Date d'envoi du lien
  payment_link_status?: string;  // Statut du lien (pending, sent, paid, etc.)
}

export interface OrderAction {
  key: string;
  label: string;
  color: string;
  nextStatus: string;
  deliveryMode?: string;
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

  // ✅ NOUVEAU : Subject pour signaler restaurant désactivé
  private restaurantDeactivated = new BehaviorSubject<boolean>(false);
  public restaurantDeactivated$ = this.restaurantDeactivated.asObservable();

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
    private fuseauHoraireService: FuseauHoraireService,
    private audioNotificationService: AudioNotificationService,
    private paymentLinkService: PaymentLinkService,
    private currencyService: CurrencyService,
    private restaurantConfigService: RestaurantConfigService
  ) { }

  async loadOrders(restaurantId: number): Promise<void> {
    try {
      // ✅ NOUVEAU : Vérification NON-BLOQUANTE du statut restaurant (parallèle)
      this.checkRestaurantStatus(restaurantId);

      // ✅ Code existant INCHANGÉ - garantit le fonctionnement normal
      const { data, error } = await this.supabaseFranceService.client
        .rpc('load_orders_with_assignment_state', {
          p_restaurant_id: restaurantId
        });

      if (error) {
        console.error('❌ [FranceOrders] Erreur détaillée RPC:', error);
        console.error('❌ [FranceOrders] Message:', error?.message);
        console.error('❌ [FranceOrders] Code:', error?.code);
        console.error('❌ [FranceOrders] Details:', error?.details);
        
        // FALLBACK : Utiliser l'ancienne méthode en cas d'erreur
        return this.loadOrdersFallback(restaurantId);
      }

      const processedOrders = data?.map((order: any) => this.processOrder(order)) || [];

      this.ordersSubject.next(processedOrders);
    } catch (error) {
      console.error('Erreur service commandes France:', error);
      // Initialiser avec tableau vide en cas d'exception
      this.ordersSubject.next([]);
    }
  }

  private processOrder(order: any): FranceOrder {
    // ========== DEBUG LOGS - Données SQL livreur ==========
    console.log('[DEBUG_DRIVER] processOrder() - Commande:', order.order_number);
    console.log('[DEBUG_DRIVER] processOrder() - order.driver_id depuis SQL:', order.driver_id);
    console.log('[DEBUG_DRIVER] processOrder() - order.delivery_driver depuis SQL:', order.delivery_driver);
    console.log('[DEBUG_DRIVER] processOrder() - Toutes les propriétés driver:', {
      driver_id: order.driver_id,
      delivery_driver: order.delivery_driver,
      assigned_driver_id: order.assigned_driver_id,
      driver_assignment_status: order.driver_assignment_status
    });
    // ====================================================

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

    // ✅ NOUVEAU : Construire l'objet delivery_driver depuis les colonnes SQL
    const delivery_driver = (order.driver_id && order.driver_first_name) ? {
      id: order.driver_id,
      first_name: order.driver_first_name,
      last_name: order.driver_last_name,
      phone_number: order.driver_phone_number
    } : undefined;

    console.log('[DEBUG_DRIVER] processOrder() - delivery_driver construit:', delivery_driver);

    return {
      ...order,
      items: processedItems,
      total_amount: order.total_amount, // 🧪 TEST: Afficher le vrai total_amount de la base sans recalcul
      availableActions: this.getAvailableActions(order.status, order.delivery_mode),
      // Alias pour compatibilité UI avec le système de livraison
      assigned_driver_id: order.driver_id,
      // ✅ NOUVEAU : Objet delivery_driver construit depuis les colonnes SQL
      delivery_driver: delivery_driver,
      // ✅ PLAN INITIAL : Propriétés d'assignation calculées par la fonction SQL
      hasAnyAssignment: (order.assignment_count > 0) || false,
      hasPendingAssignment: (order.pending_assignment_count > 0) || false,
      pendingDriversCount: order.pending_assignment_count || 0,
      pendingDriverNames: order.pending_driver_names || null
    };
  }

  /**
   * FALLBACK : Ancienne méthode en cas d'erreur avec la fonction SQL
   */
  private async loadOrdersFallback(restaurantId: number): Promise<void> {
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
          delivery_driver:france_delivery_drivers(
            id,
            first_name,
            last_name,
            phone_number
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [FranceOrders] Erreur fallback:', error);
        this.ordersSubject.next([]);
        return;
      }

      const processedOrders = data?.map((order: any) => this.processOrder(order)) || [];
      
      this.ordersSubject.next(processedOrders);
      
    } catch (error) {
      console.error('❌ [FranceOrders] Erreur fallback:', error);
      this.ordersSubject.next([]);
    }
  }

  getAvailableActions(status: string, deliveryMode?: string): OrderAction[] {
    const actions: { [key: string]: OrderAction[] } = {
      'pending': [
        { key: 'confirm', label: 'Confirmer', color: 'success', nextStatus: 'confirmee' },
        { key: 'cancel', label: 'Annuler', color: 'danger', nextStatus: 'annulee' }
      ],
      'confirmee': [
        { key: 'ready', label: 'Marquer prête', color: 'primary', nextStatus: 'prete' },
        { key: 'cancel', label: 'Annuler', color: 'danger', nextStatus: 'annulee' }
      ],
      'preparation': [
        { key: 'ready', label: 'Marquer prête', color: 'primary', nextStatus: 'prete' }
      ],
      'prete': [
        // { key: 'deliver', label: 'En livraison', color: 'secondary', nextStatus: 'en_livraison' } // BOUTON MASQUÉ - Géré par le système de livraison
        { key: 'serve', label: 'Marquer servie', color: 'success', nextStatus: 'servie', deliveryMode: 'sur_place' },
        { key: 'pickup', label: 'Marquer récupérée', color: 'success', nextStatus: 'recuperee', deliveryMode: 'a_emporter' }
      ],
      'en_livraison': [
        { key: 'delivered', label: 'Marquer livrée', color: 'success', nextStatus: 'livree' }
      ],
      'livree': [
      ],
      'servie': [
      ],
      'recuperee': [
      ],
      'annulee': [
        // { key: 'restore', label: 'Restaurer', color: 'primary', nextStatus: 'pending' } // BOUTON SUPPRIMÉ - Inutile
      ]
    };

    const availableActions = actions[status] || [];
    
    // Filtrer par delivery_mode pour 'prete' uniquement
    if (status === 'prete' && deliveryMode) {
      return availableActions.filter(action => 
        !action.deliveryMode || action.deliveryMode === deliveryMode
      );
    }
    
    return availableActions;
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


      // Étape 1: Mise à jour du statut en base de données
      const restaurantId = this.currentRestaurantId || 1; // Fallback sur 1
      const updateData: any = {
        status: newStatus,
        updated_at: await this.fuseauHoraireService.getRestaurantFutureTimeForDatabase(restaurantId, 0)
      };

      if (newStatus === 'en_livraison') {
        updateData.delivery_started_at = await this.fuseauHoraireService.getRestaurantFutureTimeForDatabase(restaurantId, 0);
      }


      const { error } = await this.supabaseFranceService.client
        .from('france_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('❌ [FranceOrders] Erreur mise à jour statut:', error);
        return false;
      }


      // Étape 2: Envoyer notification WhatsApp SEULEMENT si le statut a vraiment changé
      if (statusChanged) {
        try {
          await this.sendWhatsAppNotification(orderId, newStatus);

          // Étape 2.5: NOUVEAU - Envoi automatique lien de paiement selon configuration restaurant
          await this.handleAutomaticPaymentLink(orderId, newStatus);

          // Étape 3: NOUVEAU - Déclencher le système de notification des livreurs si commande prête pour livraison
          await this.handleDeliveryNotifications(orderId, newStatus);
        } catch (whatsappError) {
          // Ne pas faire échouer la mise à jour du statut si WhatsApp échoue
          console.error('⚠️ [FranceOrders] Erreur notification WhatsApp (non bloquant):', whatsappError);
        }
      } else {
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
      // ⚠️ DÉSACTIVÉ : 'livree' uniquement (géré via OTP livreur)
      // 'livree': 'sendOnDelivered',
      // ✅ RÉACTIVÉ : 'servie' et 'recuperee' (gérés via boutons back office)
      'servie': 'sendOnDelivered',
      'recuperee': 'sendOnDelivered',
      'annulee': 'sendOnCancelled'
    };

    const settingKey = statusMapping[status];
    if (!settingKey) {
      return false;
    }

    const shouldSend = settings[settingKey];
    return shouldSend;
  }

  /**
   * Envoie une notification WhatsApp pour le changement de statut
   * NOUVELLE MÉTHODE - Pas de régression sur l'existant
   */
  private async sendWhatsAppNotification(orderId: number, newStatus: string): Promise<void> {
    try {

      // NOUVEAU : Vérifier si notification doit être envoyée - PAS DE RÉGRESSION
      if (!this.shouldSendNotification(newStatus)) {
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
        return;
      }

      // Envoyer la notification
      const success = await this.whatsAppFranceService.sendOrderStatusNotification(
        orderData.phone_number,
        whatsappStatus,
        this.formatOrderDataForWhatsApp(orderData),
        orderData.customer_country_code
      );

      if (success) {
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
  private mapStatusToWhatsApp(status: string): 'confirmee' | 'en_preparation' | 'prete' | 'en_livraison' | 'livree' | 'servie' | 'recuperee' | 'annulee' | null {
    const statusMapping: Record<string, string> = {
      'confirmee': 'confirmee',
      'preparation': 'en_preparation',
      'prete': 'prete',
      'en_livraison': 'en_livraison',
      'livree': 'livree',
      'servie': 'servie',        // ✅ Template personnalisé "SERVIE !"
      'recuperee': 'recuperee',  // ✅ Template personnalisé "RÉCUPÉRÉE !"
      'annulee': 'annulee'
    };

    return statusMapping[status] as any || null;
  }

  /**
   * Formate les données de commande pour le service WhatsApp
   */
  private formatOrderDataForWhatsApp(orderData: any): OrderDataFrance {
    
    // Les articles sont dans un format complexe du bot, utilisons processOrder pour les extraire
    const processedOrder = this.processOrder(orderData);
    
    // Formater les articles depuis les données traitées
    const itemsText = this.formatItemsForWhatsApp(processedOrder.items || [], orderData.restaurant_id);
    
    // Formater le mode de paiement
    const paymentModeText = this.formatPaymentModeForWhatsApp(orderData.payment_mode);
    
    // Formater le mode de livraison
    const deliveryModeText = this.formatDeliveryModeForWhatsApp(orderData.delivery_mode);

    return {
      orderNumber: orderData.order_number || `${orderData.id}`,
      restaurantName: orderData.france_restaurants?.name || 'Restaurant',
      restaurantPhone: orderData.france_restaurants?.phone || orderData.france_restaurants?.whatsapp_number || '',
      total: this.formatPrice(orderData.total_amount || 0, orderData.restaurant_id),
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
  private formatItemsForWhatsApp(items: any[], restaurantId?: number): string {
    
    if (!Array.isArray(items) || items.length === 0) {
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
      itemText += ` - ${this.formatPrice(formattedItem.totalPrice, restaurantId)}`;

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
      'servie': 'success',
      'recuperee': 'success',
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
      'servie': 'Servie',
      'recuperee': 'Récupérée',
      'annulee': 'Annulée'
    };

    return statusTexts[status] || status;
  }

  formatPrice(amount: number, restaurantId?: number): string {
    // Si restaurantId est fourni, utiliser la devise du restaurant
    if (restaurantId) {
      return this.restaurantConfigService.formatPrice(amount);
    }
    // Sinon, utiliser la devise par défaut (EUR)
    return this.currencyService.formatPrice(amount);
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
          
          // Déclencher le système de notification des livreurs avec tokens sécurisés
          const notificationResult = await this.deliveryNotificationService.notifyAvailableDrivers(orderId);
          
          if (notificationResult.success) {
          } else {
            console.warn(`⚠️ [FranceOrders] Échec notifications livreurs: ${notificationResult.message}`);
          }
        } else {
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
  }

  /**
   * Effectue un refresh silencieux (sans spinner)
   */
  private async performSilentRefresh(restaurantId: number): Promise<void> {
    try {
      await this.loadOrders(restaurantId);
      
      // NOUVEAU : Vérifier et jouer le son pour nouvelles commandes
      this.audioNotificationService.checkAndPlayForNewOrders(restaurantId).subscribe({
        next: (playedCount) => {
          if (playedCount > 0) {
          }
        },
        error: (error) => {
          console.error('❌ [AudioNotification] Erreur vérification audio:', error);
        }
      });
    } catch (error) {
      console.error('❌ [FranceOrders] Erreur refresh automatique:', error);
    }
  }

  /**
   * ✅ Vérification asynchrone et non-bloquante du statut restaurant
   * Cette méthode s'exécute en parallèle sans affecter le chargement des commandes
   */
  private async checkRestaurantStatus(restaurantId: number): Promise<void> {
    try {
      const { data: restaurant, error } = await this.supabaseFranceService.client
        .from('france_restaurants')
        .select('is_active, updated_at')
        .eq('id', restaurantId)
        .single();

      // ✅ SEULEMENT si réponse claire ET restaurant désactivé
      if (!error && restaurant && restaurant.is_active === false) {
        console.warn('⚠️ Restaurant désactivé par l\'administrateur');
        this.restaurantDeactivated.next(true);
      }

      // ✅ En cas d'erreur réseau → on continue normalement (pas de déconnexion)
    } catch (error) {
      console.warn('⚠️ [FranceOrders] Impossible de vérifier statut restaurant:', error);
      // Pas de déconnexion en cas d'erreur réseau pour éviter les fausses déconnexions
    }
  }

  /**
   * NOUVEAU - Gère l'envoi automatique des liens de paiement selon la configuration du restaurant
   */
  private async handleAutomaticPaymentLink(orderId: number, newStatus: string): Promise<void> {
    try {
      // Récupérer la configuration de paiement du restaurant
      const { data: paymentConfig, error: configError } = await this.supabaseFranceService.client
        .from('restaurant_payment_configs')
        .select('auto_send_on_order, send_on_delivery, is_active')
        .eq('restaurant_id', this.currentRestaurantId)
        .eq('is_active', true)
        .maybeSingle();

      if (configError || !paymentConfig || !paymentConfig.is_active) {
        // Pas de configuration active = pas d'envoi automatique
        console.log('💳 [FranceOrders] Pas de config paiement active - envoi automatique désactivé');
        return;
      }

      let shouldSendPaymentLink = false;

      // Vérifier si on doit envoyer selon le statut
      if (newStatus === 'prete' && paymentConfig.auto_send_on_order) {
        // Commande prête + envoi automatique activé
        shouldSendPaymentLink = true;
        console.log('💳 [FranceOrders] Envoi automatique - Commande prête');
      } else if (newStatus === 'en_livraison' && paymentConfig.send_on_delivery) {
        // En livraison + envoi à la livraison activé
        shouldSendPaymentLink = true;
        console.log('💳 [FranceOrders] Envoi automatique - En livraison');
      }

      if (shouldSendPaymentLink) {
        // Envoyer le lien de paiement via le service existant
        const result = await this.paymentLinkService.sendPaymentLink({
          orderId: orderId,
          senderType: 'system'
        });

        if (result.success) {
          console.log('✅ [FranceOrders] Lien de paiement envoyé automatiquement pour commande', orderId);
        } else {
          console.error('❌ [FranceOrders] Échec envoi automatique lien paiement:', result.error);
        }
      }

    } catch (error) {
      console.error('❌ [FranceOrders] Erreur envoi automatique lien paiement (non bloquant):', error);
      // Ne pas faire échouer le changement de statut si l'envoi de paiement échoue
    }
  }
}