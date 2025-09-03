import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface WhatsAppMessage {
  clientPhone: string;
  message: string;
  orderNumber?: string;
  restaurantName?: string;
}

export interface MessageTemplate {
  confirmee: string;
  preparation: string;
  prete: string;
  en_livraison: string;
  livree: string;
  annulee: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppNotificationService {
  private readonly GREEN_API_INSTANCE_ID = '7105313693';
  private readonly GREEN_API_TOKEN = '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693';
  private readonly baseUrl = 'https://api.green-api.com';

  // Templates de messages par statut
  private readonly MESSAGE_TEMPLATES: MessageTemplate = {
    confirmee: `✅ *COMMANDE CONFIRMÉE*
📋 N°{orderNumber} • {restaurantName}
📞 Restaurant: {restaurantPhone}

🏠 Mode: {deliveryMode}
{conditionalDeliveryInfo}
💳 Paiement: {paymentMethod}

💰 *Votre commande:*
{orderItems}

────────────────────
💰 Sous-total: {subtotal}
{conditionalDeliveryFee}
💳 *TOTAL À PAYER: {total}*

⏱️ Temps de préparation: 15-25 min
📱 Nous vous contactons sous peu

{restaurantName}`,

    preparation: `👨‍🍳 *EN PRÉPARATION*
📋 N°{orderNumber} • {restaurantName}
📞 Restaurant: {restaurantPhone}

🏠 Mode: {deliveryMode}
💳 Paiement: {paymentMethod}

💰 *Votre commande:*
{orderItems}

────────────────────
💳 *TOTAL À PAYER: {total}*

⏱️ Plus que 10-15 minutes
🔥 Nos chefs s'activent !

{restaurantName}`,

    prete: `🍽️ *COMMANDE PRÊTE !*
📋 N°{orderNumber} • {restaurantName}
📞 Restaurant: {restaurantPhone}

🏠 Mode: {deliveryMode}
💳 Paiement: {paymentMethod}

💰 *TOTAL À PAYER: {total}*
💡 Préparez l'appoint si possible

{conditionalReadyInfo}

{restaurantName}`,

    en_livraison: `🚚 *EN ROUTE VERS VOUS !*
📋 N°{orderNumber} • {restaurantName}

🏍️ Livreur: {livreurNom}
📞 Contact: {livreurPhone}
🔐 Code validation: *{validationCode}*

💰 *TOTAL À PAYER: {total}*
💡 Mode: {paymentMethod}

📍 Temps estimé: {tempsEstime}

{restaurantName}`,

    livree: `✅ *COMMANDE LIVRÉE !*
📋 N°{orderNumber}

Merci pour votre confiance !
Votre avis nous intéresse.

⭐ Notez votre expérience
🔄 Commander à nouveau

💡 Tapez *"resto"* pour une nouvelle commande ou le numéro du resto pour accéder directement.

{restaurantName}`,

    annulee: `❌ *COMMANDE ANNULÉE*
📋 N°{orderNumber} • {restaurantName}
📞 Restaurant: {restaurantPhone}

🙏 Nous sommes désolés
{reason}

🔄 Nouvelle commande : tapez *"resto"*

{restaurantName}`
  };

  constructor(private http: HttpClient) {}

  /**
   * Fonction générique pour envoyer un message WhatsApp
   * @param clientPhone Numéro de téléphone du client (format: 224XXXXXXXXX)
   * @param message Message à envoyer
   * @param orderNumber Numéro de commande (optionnel pour logs)
   * @returns Promise<boolean> - true si envoyé avec succès
   */
  async sendMessage(clientPhone: string, message: string, orderNumber?: string): Promise<boolean> {
    try {
      // Nettoyer le numéro de téléphone
      const cleanPhone = this.cleanPhoneNumber(clientPhone);
      
      const chatId = `${cleanPhone}@c.us`;
      const url = `${this.baseUrl}/waInstance${this.GREEN_API_INSTANCE_ID}/sendMessage/${this.GREEN_API_TOKEN}`;
      
      console.log(`📱 Sending WhatsApp message:`);
      console.log(`   URL: ${url}`);
      console.log(`   ChatId: ${chatId}`);
      console.log(`   Order: ${orderNumber || 'N/A'}`);
      console.log(`   Message preview: ${message.substring(0, 100)}...`);
      
      const payload = {
        chatId: chatId,
        message: message
      };
      
      console.log(`📦 Request payload:`, payload);
      
      const response = await this.http.post<any>(
        url,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ).toPromise();

      console.log(`📨 WhatsApp API response:`, response);

      if (response?.idMessage) {
        console.log(`✅ WhatsApp message sent successfully. Message ID: ${response.idMessage}`);
        return true;
      } else {
        console.error('❌ WhatsApp API response invalid:', response);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error sending WhatsApp message:', error);
      
      if (error.status) {
        console.error(`HTTP Status: ${error.status}`);
      }
      if (error.error) {
        console.error(`Error body:`, error.error);
      }
      if (error.message) {
        console.error(`Error message: ${error.message}`);
      }
      
      return false;
    }
  }

  /**
   * Envoie un message basé sur un template de statut
   * @param clientPhone Numéro du client
   * @param status Statut de la commande
   * @param orderData Données de la commande pour remplir le template
   * @returns Promise<boolean>
   */
  async sendStatusMessage(
    clientPhone: string, 
    status: keyof MessageTemplate, 
    orderData: {
      orderNumber: string;
      restaurantName: string;
      restaurantPhone?: string;
      total?: string;
      subtotal?: string;
      deliveryFee?: string;
      deliveryMode?: string;
      paymentMethod?: string;
      distance?: string;
      orderItems?: string;
      livreurNom?: string;
      livreurPhone?: string;
      validationCode?: string;
      tempsEstime?: string;
      deliveryAddress?: string;
      reason?: string;
    }
  ): Promise<boolean> {
    try {
      console.log(`🔍 SendStatusMessage called with status: "${status}"`);
      console.log(`📞 Client phone: "${clientPhone}"`);
      console.log(`📋 Order data:`, orderData);
      
      // Récupérer le template
      let template = this.MESSAGE_TEMPLATES[status];
      
      if (!template) {
        console.error(`❌ No template found for status: ${status}`);
        console.error(`Available templates:`, Object.keys(this.MESSAGE_TEMPLATES));
        return false;
      }

      console.log(`📝 Template found for ${status}:`, template.substring(0, 100) + '...');

      // Remplacer les variables dans le template
      const message = this.fillTemplate(template, orderData);
      
      console.log(`📄 Final message:`, message.substring(0, 200) + '...');
      
      // Envoyer le message
      const result = await this.sendMessage(clientPhone, message, orderData.orderNumber);
      console.log(`📤 SendMessage result:`, result);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error sending status message for ${status}:`, error);
      return false;
    }
  }

  /**
   * Envoie un message personnalisé (pour cas spéciaux)
   * @param clientPhone Numéro du client
   * @param customMessage Message personnalisé
   * @param orderNumber Numéro de commande (optionnel)
   * @returns Promise<boolean>
   */
  async sendCustomMessage(clientPhone: string, customMessage: string, orderNumber?: string): Promise<boolean> {
    return await this.sendMessage(clientPhone, customMessage, orderNumber);
  }

  /**
   * Nettoie et formate le numéro de téléphone
   * @param phone Numéro brut
   * @returns Numéro formaté pour WhatsApp
   */
  private cleanPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    console.log(`📱 Original phone: ${phone}, Cleaned: ${cleaned}`);
    
    // Si le numéro commence par +, enlever le + et garder le code pays
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
      console.log(`📱 Removed + prefix: ${cleaned}`);
      return cleaned;
    }
    
    // Si le numéro commence par 00, enlever les 00 
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
      console.log(`📱 Removed 00 prefix: ${cleaned}`);
      return cleaned;
    }
    
    // Si c'est un numéro français (commence par 33 ou 0033)
    if (cleaned.startsWith('33') && cleaned.length > 10) {
      console.log(`📱 French number detected: ${cleaned}`);
      return cleaned;
    }
    
    // Si c'est un numéro français local (commence par 06, 07, etc.)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      // Numéro français local, ajouter le code pays 33
      cleaned = '33' + cleaned.substring(1);
      console.log(`📱 French local number, added country code: ${cleaned}`);
      return cleaned;
    }
    
    // Si c'est un numéro guinéen avec code pays
    if (cleaned.startsWith('224')) {
      console.log(`📱 Guinean number with country code: ${cleaned}`);
      return cleaned;
    }
    
    // Si c'est un numéro guinéen local (8 ou 9 chiffres)
    if (cleaned.length === 8 || cleaned.length === 9) {
      // Ajouter le code pays guinéen
      const formatted = `224${cleaned}`;
      console.log(`📱 Guinean local number, added country code: ${formatted}`);
      return formatted;
    }
    
    // Par défaut, retourner le numéro nettoyé tel quel
    console.log(`📱 Returning cleaned number as-is: ${cleaned}`);
    return cleaned;
  }

  /**
   * Génère le contenu conditionnel selon le mode de livraison
   * @param deliveryMode Mode de livraison
   * @param validationCode Code de validation
   * @returns Objet avec les contenus conditionnels
   */
  private generateConditionalContent(deliveryMode?: string, validationCode?: string): {
    conditionalDeliveryInfo: string;
    conditionalDeliveryFee: string;
    conditionalReadyInfo: string;
  } {
    const isDelivery = deliveryMode?.toLowerCase() === 'livraison';
    const isPickup = deliveryMode?.toLowerCase() === 'à emporter';
    const isDineIn = deliveryMode?.toLowerCase() === 'sur place';
    
    return {
      conditionalDeliveryInfo: isDelivery ? '📍 Distance: {distance}' : '',
      conditionalDeliveryFee: isDelivery ? '🚛 Frais livraison: {deliveryFee}' : '',
      conditionalReadyInfo: isDelivery ? 
        `🏍️ Recherche de livreur en cours...
🔐 *Code validation: ${validationCode || '{validationCode}'}*
⏱️ Livraison estimée: 30-40 min` :
        isPickup ? 
        `🏃‍♂️ *Votre commande vous attend !*
🔐 *Code validation: ${validationCode || '{validationCode}'}*
📍 À récupérer au comptoir` :
        isDineIn ?
        `🍽️ *Votre table sera servie sous peu*
📍 Service à table` :
        `🔐 *Code validation: ${validationCode || '{validationCode}'}*`
    };
  }

  /**
   * Remplit un template avec les données fournies
   * @param template Template avec placeholders {variable}
   * @param data Données à injecter
   * @returns Template rempli
   */
  private fillTemplate(template: string, data: any): string {
    let filled = template;
    
    // Générer le contenu conditionnel
    const conditionalContent = this.generateConditionalContent(data.deliveryMode, data.validationCode);
    
    // Ajouter le contenu conditionnel aux données
    const enrichedData = {
      ...data,
      ...conditionalContent
    };
    
    Object.keys(enrichedData).forEach(key => {
      const value = enrichedData[key];
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`{${key}}`, 'g');
        filled = filled.replace(regex, value.toString());
      }
    });
    
    // Nettoyer les placeholders non remplis et les lignes vides
    filled = filled.replace(/{[^}]+}/g, '');
    filled = filled.replace(/\n\s*\n/g, '\n'); // Supprimer les lignes vides multiples
    
    return filled;
  }

  /**
   * Teste la connexion à l'API Green API
   * @returns Promise<boolean>
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.http.get<any>(
        `${this.baseUrl}/waInstance${this.GREEN_API_INSTANCE_ID}/getStateInstance/${this.GREEN_API_TOKEN}`
      ).toPromise();
      
      const isConnected = response?.stateInstance === 'authorized';
      console.log(`🔗 Green API Connection: ${isConnected ? 'OK' : 'FAILED'}`, response);
      
      return isConnected;
    } catch (error) {
      console.error('❌ Failed to test Green API connection:', error);
      return false;
    }
  }

  /**
   * Formate un prix avec currency dynamique
   * @param amount Montant numérique
   * @param currency Devise (EUR, GNF, etc.)
   * @returns Prix formaté
   */
  private formatPrice(amount: number, currency: string = 'GNF'): string {
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(amount);
    
    // Mapping des devises vers leurs symboles
    const currencySymbols: Record<string, string> = {
      'GNF': 'GNF',
      'EUR': '€',
      'USD': '$',
      'XOF': 'FCFA'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${formatted} ${symbol}`;
  }
}