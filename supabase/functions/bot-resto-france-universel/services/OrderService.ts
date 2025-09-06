/**
 * Service de gestion des commandes
 * SOLID - Single Responsibility : Gestion uniquement des commandes
 * 100% UNIVERSEL - Fonctionne pour tous les restaurants
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface OrderData {
  restaurant_id: number;
  phone_number: string;
  items: any;
  total_amount: number;
  delivery_mode: string;
  delivery_address?: string;
  delivery_address_id?: number;
  status: string;
  order_number: string;
  delivery_validation_code?: string;
}

export class OrderService {
  private supabase: SupabaseClient;

  constructor(
    private supabaseUrl: string,
    private supabaseKey: string
  ) {
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
      const today = new Date();
      const dayMonth = `${String(today.getDate()).padStart(2, '0')}${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      // Compter les commandes du jour pour ce restaurant
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const { count } = await this.supabase
        .from('france_orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString());
      
      const orderNumber = `${dayMonth}-${String((count || 0) + 1).padStart(4, '0')}`;
      
      console.log(`📋 [OrderService] Numéro généré: ${orderNumber}`);
      return orderNumber;
      
    } catch (error) {
      console.error('❌ [OrderService] Erreur génération numéro:', error);
      // Fallback avec timestamp
      return `ORD-${Date.now()}`;
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
      cart.forEach(item => {
        const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);
        total += itemTotal;
      });
    }
    
    console.log(`💰 [OrderService] Total calculé: ${total}€`);
    return total;
  }

  /**
   * Construire le message de confirmation de commande
   * FORMAT UNIVERSEL - Même structure pour tous les restaurants
   */
  buildOrderConfirmationMessage(
    order: any,
    restaurantName: string,
    deliveryMode: string,
    deliveryAddress?: any
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
    
    message += `\n💎 *Total: ${order.total_amount} EUR*\n`;
    
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
    const quantity = item.quantity || 1;
    
    itemText += `• ${quantity > 1 ? `${quantity}x ` : ''}${name}\n`;
    
    // Ajouter la configuration si elle existe
    if (item.configuration || item.selected_options) {
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
    try {
      console.log(`📦 [OrderWorkflow] Début pour: ${phoneNumber}`);
      
      if (!cart || cart.length === 0) {
        throw new Error('Panier vide');
      }
      
      const cleanPhone = phoneNumber.replace('@c.us', '');
      
      // Calculer le total
      const totalAmount = this.calculateCartTotal(cart);
      
      // Générer le numéro de commande
      const orderNumber = await this.generateOrderNumber(restaurantId);
      
      // Générer code de validation pour livraison
      const deliveryCode = deliveryMode === 'livraison' ? 
        this.generateDeliveryCode() : undefined;
      
      // Préparer les données de commande
      const orderData: OrderData = {
        restaurant_id: restaurantId,
        phone_number: cleanPhone,
        items: cart,
        total_amount: totalAmount,
        delivery_mode: deliveryMode,
        status: 'pending',
        order_number: orderNumber,
        delivery_validation_code: deliveryCode
      };
      
      // Ajouter l'adresse de livraison si fournie
      if (deliveryAddress) {
        orderData.delivery_address = deliveryAddress.full_address || deliveryAddress;
        orderData.delivery_address_id = deliveryAddress.id;
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
    const { error } = await this.supabase
      .from('france_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    
    if (error) {
      console.error('❌ [OrderService] Erreur mise à jour statut:', error);
      return false;
    }
    
    console.log(`✅ [OrderService] Statut mis à jour: ${status}`);
    return true;
  }
}