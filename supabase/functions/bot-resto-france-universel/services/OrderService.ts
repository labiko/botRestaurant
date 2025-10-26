/**
 * Service de gestion des commandes
 * SOLID - Single Responsibility : Gestion uniquement des commandes
 * 100% UNIVERSEL - Fonctionne pour tous les restaurants
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { QueryPerformanceMonitor } from './QueryPerformanceMonitor.ts';
import { PhoneNumberUtils } from '../utils/PhoneNumberUtils.ts';

/**
 * Obtenir l'heure actuelle dans le bon fuseau horaire PARIS
 * ✅ Version finale optimisée avec format Paris validé
 */
function getCurrentTime(timezone: string = 'Europe/Paris'): Date {
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const utcNow = new Date();
  const formatted = formatter.format(utcNow);

  const parts = formatted.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (parts) {
    const [, day, month, year, hour, minute, second] = parts;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  }

  return utcNow;
}

export interface OrderData {
  restaurant_id: number;
  phone_number: string;
  customer_country_code?: string | null;
  items: any;
  total_amount: number;
  delivery_mode: string;
  delivery_address?: string;
  delivery_address_id?: number;
  delivery_latitude?: number; // NOUVEAU
  delivery_longitude?: number; // NOUVEAU
  delivery_address_type?: 'text' | 'geolocation'; // NOUVEAU
  status: string;
  order_number: string;
  delivery_validation_code?: string;
  delivery_fee?: number; // NOUVEAU: Frais de livraison
}

export class OrderService {
  private supabase: SupabaseClient;
  private getTimeFunc?: () => Date;

  constructor(
    private supabaseUrl: string,
    private supabaseKey: string,
    getTimeFunc?: () => Date
  ) {
    this.getTimeFunc = getTimeFunc;
    this.initSupabase();
  }

  /**
   * Initialiser le client Supabase
   */
  private async initSupabase() {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  /**
   * Générer un numéro de commande unique
   * Format: DDMM-XXXX (jour/mois-numéro séquentiel)
   */
  async generateOrderNumber(restaurantId: number): Promise<string> {
    try {
      const today = getCurrentTime();
      const dayMonth = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      // Compter les commandes du jour pour ce restaurant
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const { count } = await QueryPerformanceMonitor.measureQuery(
        'COUNT_ORDERS_TODAY',
        this.supabase
          .from('france_orders')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurantId)
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString())
      );
      
      const orderNumber = `${dayMonth}-${String((count || 0) + 1).padStart(4, '0')}`;
      
      console.log(`📋 [OrderService] Numéro généré: ${orderNumber}`);
      return orderNumber;
      
    } catch (error) {
      console.error('❌ [OrderService] Erreur génération numéro:', error);
      // Fallback avec timestamp
      return `ORD-${getCurrentTime().getTime()}`;
    }
  }

  /**
   * Générer un code de validation pour la livraison
   * Code à 4 chiffres unique
   */
  generateDeliveryCode(): string {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`🔒 [OrderService] Code validation généré: ${code}`);
    return code;
  }

  /**
   * Créer une commande en base de données
   */
  async createOrder(orderData: OrderData): Promise<any> {
    const startTime = getCurrentTime().getTime();
    try {
      console.log(`📦 [OrderService] Création commande...`);
      console.log(`💰 [OrderService] Total: ${orderData.total_amount}€`);
      
      // Insérer la commande
      const { data: order, error } = await this.supabase
        .from('france_orders')
        .insert(orderData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ [OrderService] Erreur insertion:', error);
        throw error;
      }
      
      console.log(`✅ [OrderService] Commande créée: #${order.order_number}`);
      return order;
      
    } catch (error) {
      console.error('❌ [OrderService] Exception création commande:', error);
      throw error;
    }
  }

  /**
   * Calculer le total du panier
   */
  calculateCartTotal(cart: any[]): number {
    let total = 0;

    if (Array.isArray(cart)) {
      cart.forEach((item, index) => {
        // Chercher price OU unitPrice (menus pizza ont price, autres ont unitPrice)
        const price = item.price || item.unitPrice || 0;
        const quantity = item.quantity || 1;
        const itemTotal = price * quantity;
        total += itemTotal;
      });
    }

    console.log(`💰 [OrderService] Total calculé: ${total}€`);
    return total;
  }

  /**
   * Formate un prix selon la devise du restaurant
   */
  private formatPrice(amount: number, currency: string = 'EUR'): string {
    switch (currency) {
      case 'EUR':
        return `${amount}€`;
      case 'GNF':
        return `${amount.toLocaleString('fr-FR')} GNF`;
      case 'XOF':
        return `${amount.toLocaleString('fr-FR')} FCFA`;
      default:
        return `${amount}€`;
    }
  }

  /**
   * Construire le message de confirmation de commande
   * FORMAT UNIVERSEL - Même structure pour tous les restaurants
   */
  buildOrderConfirmationMessage(
    order: any,
    restaurantName: string,
    deliveryMode: string,
    deliveryAddress?: any,
    currency: string = 'EUR'
  ): string {
    let message = `✅ *Votre commande est confirmée !*\n\n`;
    message += `🍕 *${restaurantName}*\n`;
    message += `🎫 *Commande #${order.order_number}*\n\n`;
    
    // Détail de la commande
    message += `📋 *Récapitulatif :*\n`;
    
    if (order.items) {
      // Si items est un objet (ancien format)
      if (typeof order.items === 'object' && !Array.isArray(order.items)) {
        Object.values(order.items).forEach((item: any) => {
          message += this.formatOrderItem(item);
        });
      } 
      // Si items est un array (nouveau format)
      else if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          message += this.formatOrderItem(item);
        });
      }
    }

    // Afficher breakdown si frais de livraison
    if (order.delivery_fee && order.delivery_fee > 0) {
      const subtotal = order.total_amount - order.delivery_fee;
      message += `\n💰 *Sous-total:* ${this.formatPrice(subtotal, currency)}\n`;
      message += `🚚 *Livraison:* ${this.formatPrice(order.delivery_fee, currency)}\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `💎 *TOTAL: ${this.formatPrice(order.total_amount, currency)}*\n`;
    } else {
      message += `\n💎 *Total: ${this.formatPrice(order.total_amount, currency)}*\n`;
    }
    
    // Informations selon le mode de livraison
    message += this.formatDeliveryInfo(deliveryMode, order, deliveryAddress);
    
    // Footer universel
    message += `\n\n📱 *Gardez ce message comme preuve de commande*`;
    message += `\n🙏 *Merci pour votre confiance !*`;
    
    return message;
  }

  /**
   * Formater un item de commande
   */
  private formatOrderItem(item: any): string {
    let itemText = '';
    
    // Gérer différents formats d'items
    const name = item.productName || item.name || 'Produit';
    const categoryName = item.categoryName || '';
    const quantity = item.quantity || 1;
    
    // Afficher avec catégorie si disponible
    const displayName = categoryName ? `${name} (${categoryName})` : name;
    itemText += `• ${quantity > 1 ? `${quantity}x ` : ''}${displayName}\n`;

    // Traitement SPÉCIFIQUE pour menu pizza (ajout isolé sans toucher au reste)
    if (item.type === 'menu_pizza' && item.details) {
      console.log('🍕 [formatOrderItem] Menu pizza détecté, traitement spécial');
      itemText += this.formatMenuPizzaDetails(item.details);
    }
    // Code EXISTANT inchangé pour tous les autres produits
    else if (item.configuration || item.selected_options) {
      const config = item.configuration || item.selected_options;
      console.log('🔍 [formatOrderItem] Item config:', JSON.stringify(config, null, 2));
      
      if (typeof config === 'object') {
        Object.entries(config).forEach(([key, value]: [string, any]) => {
          console.log(`🔍 [formatOrderItem] Processing key: "${key}", value:`, JSON.stringify(value));
          
          if (value && !this.shouldSkipValue(value)) {
            console.log(`✅ [formatOrderItem] Adding config line for key: "${key}"`);
            itemText += `  → ${this.formatConfigValue(value)}\n`;
          } else {
            console.log(`❌ [formatOrderItem] Skipping key: "${key}", shouldSkip:`, this.shouldSkipValue(value));
          }
        });
      }
    }
    
    return itemText;
  }

  /**
   * Formater les détails spécifiques des menus pizza
   * Méthode dédiée pour éviter tout impact sur les autres catégories
   */
  private formatMenuPizzaDetails(details: any): string {
    let text = '';

    // Traiter les pizzas si elles existent
    if (details.pizzas && Array.isArray(details.pizzas)) {
      details.pizzas.forEach((pizza: any, index: number) => {
        const pizzaName = pizza.name || `Pizza ${index + 1}`;
        const pizzaEmoji = pizza.emoji || '🍕';
        text += `  → Pizza ${index + 1}: ${pizzaEmoji} ${pizzaName}\n`;
      });
    }

    // Ajouter d'autres détails si nécessaires (boissons, etc.)
    if (details.beverages && Array.isArray(details.beverages)) {
      details.beverages.forEach((bev: any) => {
        text += `  → Boisson: ${bev.name || 'Boisson'}\n`;
      });
    }

    if (details.sides && details.sides.name) {
      text += `  → Accompagnement: ${details.sides.name}\n`;
    }

    return text;
  }

  /**
   * Vérifier si une valeur doit être ignorée
   */
  private shouldSkipValue(value: any): boolean {
    const skipPatterns = ['pas de', 'sans', 'aucun'];
    const valueStr = String(value).toLowerCase();
    return skipPatterns.some(pattern => valueStr.includes(pattern));
  }

  /**
   * Formater une valeur de configuration
   */
  private formatConfigValue(value: any): string {
    console.log('🔍 [formatConfigValue] Input value:', JSON.stringify(value));
    console.log('🔍 [formatConfigValue] Value type:', typeof value);
    console.log('🔍 [formatConfigValue] Is array:', Array.isArray(value));
    
    if (Array.isArray(value)) {
      const result = value.map(v => {
        // Gérer spécifiquement les objets size (avec size_name, variant_name)
        if (v.size_name || v.variant_name) {
          return v.size_name || v.variant_name;
        }
        // Gérer les options normales avec option_name
        return v.option_name || v;
      }).join(', ');
      console.log('✅ [formatConfigValue] Array result:', result);
      return result;
    }
    if (typeof value === 'object' && value !== null) {
      // Priorité aux propriétés spécifiques selon le type d'objet
      const result = value.size_name || value.variant_name || value.option_name || value.label || value.name || value.text || value.title || value.value;
      console.log('✅ [formatConfigValue] Object result:', result);
      console.log('🔍 [formatConfigValue] Object keys:', Object.keys(value));
      
      // Si aucune propriété lisible trouvée, essayer de reconstituer depuis les propriétés
      if (!result || result === value) {
        const keys = Object.keys(value);
        // Si c'est un objet simple avec une seule propriété utile
        if (keys.length === 1) {
          return String(value[keys[0]]);
        }
        // Si pas de propriété lisible, retourner une représentation plus propre
        return '[Configuration]';
      }
      
      return result;
    }
    const result = String(value);
    console.log('✅ [formatConfigValue] String result:', result);
    return result;
  }

  /**
   * Formater les informations de livraison
   */
  private formatDeliveryInfo(
    deliveryMode: string,
    order: any,
    deliveryAddress?: any
  ): string {
    let info = '\n';
    
    switch (deliveryMode) {
      case 'livraison':
        info += `🚚 *Mode: Livraison*\n`;
        if (deliveryAddress) {
          info += `📍 *Adresse:* ${deliveryAddress.full_address || deliveryAddress}\n`;
        }
        if (order.delivery_validation_code) {
          info += `🔒 *Code validation: ${order.delivery_validation_code}*\n`;
          info += `📱 *Communiquez ce code au livreur*\n`;
        }
        info += `⏱️ *Temps estimé: 30-45 minutes*`;
        break;
        
      case 'a_emporter':
        info += `📦 *Mode: À emporter*\n`;
        info += `⏱️ *Prêt dans: 20-30 minutes*\n`;
        info += `📍 *Présentez ce numéro: #${order.order_number}*`;
        break;
        
      case 'sur_place':
        info += `🍽️ *Mode: Sur place*\n`;
        info += `🪑 *Installez-vous, nous vous servons*\n`;
        info += `📍 *Commande: #${order.order_number}*`;
        break;
        
      default:
        info += `📦 *Commande: #${order.order_number}*`;
    }
    
    return info;
  }

  /**
   * Workflow complet de création de commande
   * SOLID - Single Responsibility : Gère toute la logique de création
   */
  async createOrderWorkflow(
    phoneNumber: string, 
    cart: any[], 
    restaurantId: number, 
    deliveryMode: string,
    deliveryAddress?: any
  ): Promise<any> {
    const startTime = getCurrentTime().getTime();
    try {
      console.log(`📦 [OrderWorkflow] Début pour: ${phoneNumber}`);
      
      if (!cart || cart.length === 0) {
        throw new Error('Panier vide');
      }
      
      const cleanPhone = phoneNumber.replace('@c.us', '');

      // Extraire le code pays du numéro
      const customerCountryCode = PhoneNumberUtils.extractCountryCode(cleanPhone);

      console.log(`📱 [OrderService] Numéro: ${cleanPhone}, Code pays: ${customerCountryCode}`);

      // Calculer le total du panier
      const totalAmount = this.calculateCartTotal(cart);

      // NOUVEAU: Calculer frais de livraison pour mode geolocation
      let deliveryFee = 0;
      if (deliveryMode === 'livraison') {
        console.log(`🚚 [OrderService] Mode livraison geolocation détecté, récupération frais...`);
        const { data: restaurant } = await this.supabase
          .from('france_restaurants')
          .select('delivery_fee_geolocation')
          .eq('id', restaurantId)
          .single();

        deliveryFee = restaurant?.delivery_fee_geolocation || 0;
        console.log(`🚚 [OrderService] Frais de livraison geolocation: ${deliveryFee}`);
      }

      // Calculer total final (panier + frais livraison)
      const finalTotal = totalAmount + deliveryFee;
      console.log(`💰 [OrderService] Sous-total panier: ${totalAmount}, Frais livraison: ${deliveryFee}, Total final: ${finalTotal}`);

      // Générer le numéro de commande
      const orderNumber = await this.generateOrderNumber(restaurantId);
      
      // Générer code de validation pour livraison
      const deliveryCode = deliveryMode === 'livraison' ?
        this.generateDeliveryCode() : undefined;

      // Calculer created_at avec le fuseau restaurant
      const { data: currentTime, error: timeError } = await this.supabase
        .rpc('get_restaurant_current_time', {
          p_restaurant_id: restaurantId
        });

      // Préparer les données de commande
      const orderData: OrderData = {
        restaurant_id: restaurantId,
        phone_number: cleanPhone,
        customer_country_code: customerCountryCode,
        items: cart,
        total_amount: finalTotal,
        delivery_mode: deliveryMode,
        status: 'pending',
        order_number: orderNumber,
        delivery_validation_code: deliveryCode,
        delivery_fee: deliveryFee,
        created_at: currentTime || new Date().toISOString()
      };
      
      // Ajouter l'adresse de livraison si fournie
      if (deliveryAddress) {
        orderData.delivery_address = deliveryAddress.full_address || deliveryAddress;
        orderData.delivery_address_id = deliveryAddress.id;

        // NOUVEAU: Si géolocalisation, ajouter les coordonnées
        if (deliveryAddress.address_type === 'geolocation') {
          orderData.delivery_latitude = deliveryAddress.latitude;
          orderData.delivery_longitude = deliveryAddress.longitude;
          orderData.delivery_address_type = 'geolocation';
        } else {
          orderData.delivery_address_type = 'text';
        }
      }
      
      // Créer la commande
      const order = await this.createOrder(orderData);
      
      if (!order) {
        throw new Error('Échec création commande');
      }
      
      console.log(`✅ [OrderWorkflow] Commande ${orderNumber} créée avec succès`);
      return order;
      
    } catch (error) {
      console.error('❌ [OrderWorkflow] Erreur:', error);
      throw error;
    }
  }

  /**
   * Récupérer une commande par son ID
   */
  async getOrderById(orderId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from('france_orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('❌ [OrderService] Erreur récupération commande:', error);
      return null;
    }
    
    return data;
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateOrderStatus(orderId: number, status: string): Promise<boolean> {
    const updatedAt = this.getTimeFunc ? this.getTimeFunc().toISOString() : 'NOW()';
    const { error} = await this.supabase
      .from('france_orders')
      .update({ status, updated_at: updatedAt })
      .eq('id', orderId);
    
    if (error) {
      console.error('❌ [OrderService] Erreur mise à jour statut:', error);
      return false;
    }
    
    console.log(`✅ [OrderService] Statut mis à jour: ${status}`);
    return true;
  }

  /**
   * Construire le message de notification pour le restaurant
   */
  buildRestaurantNotificationMessage(
    order: any,
    customerPhone: string,
    currency: string = 'EUR'
  ): string {
    let message = `🔔 *NOUVELLE COMMANDE* 🔔\n\n`;
    message += `🎫 *Commande #${order.order_number}*\n`;
    message += `💰 *Montant:* ${this.formatPrice(order.total_amount, currency)}\n`;

    // Mode de livraison
    const modeEmoji: Record<string, string> = {
      'livraison': '🚚',
      'a_emporter': '📦',
      'sur_place': '🍽️'
    };
    message += `${modeEmoji[order.delivery_mode] || '📦'} *Mode:* ${order.delivery_mode}\n`;

    // Adresse si livraison (limitée à 30 caractères)
    if (order.delivery_mode === 'livraison' && order.delivery_address) {
      const shortAddress = order.delivery_address.length > 30
        ? order.delivery_address.substring(0, 30) + '...'
        : order.delivery_address;
      message += `📍 *Adresse:* ${shortAddress}\n`;
    }

    message += `\n👉 *Ouvrir l'app pour voir les détails*`;

    return message;
  }
}