import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface WhatsAppMessageFrance {
  clientPhone: string;
  message: string;
  orderNumber?: string;
  restaurantName?: string;
}

export interface MessageTemplateFrance {
  confirmee: string;
  en_preparation: string;
  prete: string;
  en_livraison: string;
  livree: string;
  annulee: string;
}

export interface OrderDataFrance {
  orderNumber: string;
  restaurantName: string;
  restaurantPhone?: string;
  total?: string;
  deliveryMode?: string;
  paymentMode?: string;
  orderItems?: string;
  deliveryAddress?: string;
  validationCode?: string;
  customerName?: string;
  estimatedTime?: string;
  reason?: string;
  driverName?: string;
  driverPhone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppNotificationFranceService {
  // Configuration Green API France (utilise la même instance que Guinée)
  private readonly GREEN_API_INSTANCE_ID_FRANCE = '7105313693';
  private readonly GREEN_API_TOKEN_FRANCE = '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693';
  private readonly baseUrl = 'https://api.green-api.com';

  // Templates de messages modernes pour la France - PROGRESSIFS selon statut
  private readonly MESSAGE_TEMPLATES_FRANCE: MessageTemplateFrance = {
    // CONFIRMÉE : Détails complets pour vérification
    confirmee: `✅ **COMMANDE CONFIRMÉE**
📋 N°{orderNumber} • {restaurantName}

🍕 **Votre commande :**
{orderItems}

💳 **Total : {total}**
⏰ **Prêt dans : 15-20 min**
📍 {deliveryMode}
{conditionalInfo}`,

    // EN PRÉPARATION : Message court, simple notification
    en_preparation: `👨‍🍳 **EN PRÉPARATION**
📋 Commande N°{orderNumber}

⏰ Plus que 10-15 min
🔥 Nos chefs s'activent !`,

    // PRÊTE : Info pratique pour action
    prete: `🍽️ **COMMANDE PRÊTE !**
📋 N°{orderNumber}

💳 **Total à régler : {total}**
{conditionalReadyInfo}`,

    // EN LIVRAISON : Info livreur et suivi
    en_livraison: `🚚 **EN ROUTE !**
📋 N°{orderNumber}
🏍️ Livreur : {driverName} • 📞 {driverPhone}
⏰ Arrivée : ~{estimatedTime}
{conditionalValidationCode}`,

    // LIVRÉE : Remerciement simple
    livree: `✅ **LIVRÉE !**
Merci pour votre commande !

⭐ Notez votre expérience
🔄 Commander à nouveau`,

    // ANNULÉE : Message court avec raison
    annulee: `❌ **COMMANDE ANNULÉE**
📋 N°{orderNumber}

{reason}
🔄 N'hésitez pas à recommander`
  };

  constructor(private http: HttpClient) {}

  /**
   * Envoie un message WhatsApp à un client français
   */
  async sendMessage(clientPhone: string, message: string, orderNumber?: string): Promise<boolean> {
    try {
      const cleanPhone = this.cleanFrenchPhoneNumber(clientPhone);
      const chatId = `${cleanPhone}@c.us`;
      const url = `${this.baseUrl}/waInstance${this.GREEN_API_INSTANCE_ID_FRANCE}/sendMessage/${this.GREEN_API_TOKEN_FRANCE}`;
      
      console.log(`🇫🇷 [WhatsAppFrance] Sending message:`);
      console.log(`   URL: ${url}`);
      console.log(`   ChatId: ${chatId}`);
      console.log(`   Order: ${orderNumber || 'N/A'}`);
      console.log(`   Message preview: ${message.substring(0, 100)}...`);
      
      const payload = {
        chatId: chatId,
        message: message
      };
      
      const response = await this.http.post<any>(
        url,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ).toPromise();

      console.log(`📨 [WhatsAppFrance] API response:`, response);

      if (response?.idMessage) {
        console.log(`✅ [WhatsAppFrance] Message sent successfully. ID: ${response.idMessage}`);
        return true;
      } else {
        console.error('❌ [WhatsAppFrance] Invalid API response:', response);
        return false;
      }
    } catch (error: any) {
      console.error('❌ [WhatsAppFrance] Error sending message:', error);
      return false;
    }
  }

  /**
   * Envoie une notification de changement de statut
   */
  async sendOrderStatusNotification(
    clientPhone: string, 
    status: keyof MessageTemplateFrance, 
    orderData: OrderDataFrance
  ): Promise<boolean> {
    try {
      console.log(`🔍 [WhatsAppFrance] SendStatusNotification called with status: "${status}"`);
      console.log(`📞 [WhatsAppFrance] Client phone: "${clientPhone}"`);
      console.log(`📋 [WhatsAppFrance] Order data:`, orderData);
      
      const template = this.MESSAGE_TEMPLATES_FRANCE[status];
      
      if (!template) {
        console.error(`❌ [WhatsAppFrance] No template found for status: ${status}`);
        return false;
      }

      console.log(`📝 [WhatsAppFrance] Template found for ${status}`);

      const message = this.fillTemplateFrance(template, orderData);
      
      console.log(`📄 [WhatsAppFrance] Final message:`, message.substring(0, 200) + '...');
      
      const result = await this.sendMessage(clientPhone, message, orderData.orderNumber);
      console.log(`📤 [WhatsAppFrance] SendMessage result:`, result);
      
      return result;
      
    } catch (error) {
      console.error(`❌ [WhatsAppFrance] Error sending status message for ${status}:`, error);
      return false;
    }
  }

  /**
   * Nettoie et formate les numéros français
   */
  private cleanFrenchPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    console.log(`🇫🇷 [WhatsAppFrance] Original phone: ${phone}, Cleaned: ${cleaned}`);
    
    // Enlever le + si présent
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // Si commence par 00, enlever
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }
    
    // Si numéro français avec code pays 33
    if (cleaned.startsWith('33') && cleaned.length >= 11) {
      console.log(`🇫🇷 [WhatsAppFrance] French number with country code: ${cleaned}`);
      return cleaned;
    }
    
    // Si numéro français local (06, 07, etc.)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '33' + cleaned.substring(1);
      console.log(`🇫🇷 [WhatsAppFrance] French local number, added country code: ${cleaned}`);
      return cleaned;
    }
    
    // Si commence par 6 ou 7 (format mobile français sans le 0)
    if ((cleaned.startsWith('6') || cleaned.startsWith('7')) && cleaned.length === 9) {
      cleaned = '33' + cleaned;
      console.log(`🇫🇷 [WhatsAppFrance] French mobile without 0, added country code: ${cleaned}`);
      return cleaned;
    }
    
    console.log(`🇫🇷 [WhatsAppFrance] Returning cleaned number as-is: ${cleaned}`);
    return cleaned;
  }

  /**
   * Remplit un template avec les données de commande France
   */
  private fillTemplateFrance(template: string, data: OrderDataFrance): string {
    let filled = template;
    
    // Générer le contenu conditionnel France
    const conditionalContent = this.generateConditionalContentFrance(data);
    
    // Enrichir les données avec le contenu conditionnel et formater les champs
    const enrichedData = {
      ...data,
      ...conditionalContent,
      deliveryMode: this.formatDeliveryModeForWhatsApp(data.deliveryMode || '', data.deliveryAddress, data.validationCode),
      paymentMode: this.formatPaymentModeForWhatsApp(data.paymentMode || '')
    };
    
    // Remplacer toutes les variables
    Object.keys(enrichedData).forEach(key => {
      const value = enrichedData[key];
      if (value !== undefined && value !== null) {
        const regex = new RegExp(`{${key}}`, 'g');
        filled = filled.replace(regex, value.toString());
      }
    });
    
    // Nettoyer les placeholders non remplis et lignes vides
    filled = filled.replace(/{[^}]+}/g, '');
    filled = filled.replace(/\n\s*\n/g, '\n');
    
    return filled;
  }

  /**
   * Génère le contenu conditionnel selon le mode de livraison France
   */
  private generateConditionalContentFrance(data: OrderDataFrance): any {
    // Détection intelligente du mode de livraison
    let isDelivery = false;
    let isPickup = false;
    let isDineIn = false;
    
    // Si deliveryMode est explicite, l'utiliser
    if (data.deliveryMode) {
      const mode = data.deliveryMode.toLowerCase();
      isDelivery = mode === 'livraison';
      isPickup = mode === 'a_emporter' || mode === 'à emporter';
      isDineIn = mode === 'sur_place';
    } else {
      // Détection intelligente basée sur les données
      if (data.deliveryAddress && data.validationCode) {
        isDelivery = true; // Adresse + code = LIVRAISON
      } else if (data.validationCode && !data.deliveryAddress) {
        isPickup = true; // Code sans adresse = À EMPORTER
      } else {
        isDineIn = true; // Ni adresse ni code = SUR PLACE
      }
    }
    
    const isCard = data.paymentMode?.toLowerCase() === 'maintenant' || data.paymentMode?.toLowerCase() === 'carte bancaire';
    
    return {
      // CONDITIONALINFO : Info selon le mode pour confirmation seulement
      conditionalInfo: isDelivery && data.validationCode ? 
        `🔐 Code livraison : ${data.validationCode}` :
        isPickup && data.validationCode ? 
        `🔐 Code retrait : ${data.validationCode}` :
        '',
        
      conditionalPaymentInfo: isCard ? 
        `💡 Préparez votre carte bancaire` : 
        `💡 Préparez l'appoint si possible`,
        
      // CONDITIONALREADYINFO : Info pratique quand prête
      conditionalReadyInfo: isDelivery ?
        `🚚 Recherche de livreur...\n🔐 Code : ${data.validationCode || 'À suivre'}` :
        isPickup ?
        `🏃‍♂️ Venez la récupérer !\n🔐 Code : ${data.validationCode || 'À suivre'}` :
        `🍽️ Service à table`,
        
      // CONDITIONALVALIDATIONCODE : Pour livraison uniquement
      conditionalValidationCode: isDelivery && data.validationCode ? 
        `🔐 Code : ${data.validationCode}` : 
        ''
    };
  }

  /**
   * Teste la connexion à l'API Green API France
   */
  async testConnectionFrance(): Promise<boolean> {
    try {
      const response = await this.http.get<any>(
        `${this.baseUrl}/waInstance${this.GREEN_API_INSTANCE_ID_FRANCE}/getStateInstance/${this.GREEN_API_TOKEN_FRANCE}`
      ).toPromise();
      
      const isConnected = response?.stateInstance === 'authorized';
      console.log(`🇫🇷 [WhatsAppFrance] Connection: ${isConnected ? 'OK' : 'FAILED'}`, response);
      
      return isConnected;
    } catch (error) {
      console.error('❌ [WhatsAppFrance] Failed to test connection:', error);
      return false;
    }
  }

  /**
   * Formate le mode de livraison pour WhatsApp avec détection intelligente
   */
  private formatDeliveryModeForWhatsApp(deliveryMode: string, deliveryAddress?: string, validationCode?: string): string {
    const modes: Record<string, string> = {
      'sur_place': 'Sur place',
      'a_emporter': 'À emporter',
      'livraison': 'Livraison'
    };
    
    // Si le mode est explicite, l'utiliser
    if (deliveryMode && modes[deliveryMode]) {
      return modes[deliveryMode];
    }
    
    // Détection intelligente si pas de mode explicite
    if (deliveryAddress && validationCode) {
      return 'Livraison'; // Adresse + code = LIVRAISON
    } else if (validationCode && !deliveryAddress) {
      return 'À emporter'; // Code sans adresse = À EMPORTER
    } else {
      return 'Sur place'; // Ni adresse ni code = SUR PLACE
    }
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
   * Envoie un message de remerciement après validation OTP - Modèle 5
   */
  async sendOrderCompletionMessage(
    clientPhone: string, 
    orderNumber: string, 
    restaurantName: string
  ): Promise<boolean> {
    try {
      console.log(`🎉 [WhatsAppFrance] Sending completion message for order ${orderNumber}`);
      
      const completionMessage = `🌟 *Livraison réussie - Commande #${orderNumber}*

Votre expérience avec *${restaurantName}* se termine en beauté ! ✨

✅ Livraison confirmée
🍽️ Il ne reste plus qu'à déguster !

Tapez "resto" pour commander à nouveau ! 

Excellente dégustation ! 

${restaurantName} 💫`;

      const result = await this.sendMessage(clientPhone, completionMessage, orderNumber);
      
      if (result) {
        console.log(`✅ [WhatsAppFrance] Completion message sent successfully for order ${orderNumber}`);
      } else {
        console.error(`❌ [WhatsAppFrance] Failed to send completion message for order ${orderNumber}`);
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ [WhatsAppFrance] Error sending completion message:`, error);
      return false;
    }
  }

  /**
   * Envoie le code d'accès à un nouveau livreur (Template 2 - Chaleureux)
   */
  async sendDriverAccessCode(
    driverPhone: string, 
    driverName: string, 
    accessCode: string,
    restaurantName: string,
    restaurantPhone?: string
  ): Promise<boolean> {
    try {
      console.log(`🔐 [WhatsAppFrance] Sending access code to driver: ${driverName} (${driverPhone})`);
      
      // Séparer prénom du nom complet pour un message plus personnel
      const firstName = driverName.split(' ')[0];
      
      const message = `🌟 **BIENVENUE DANS L'ÉQUIPE ${restaurantName.toUpperCase()} !**

Salut ${firstName} ! 👋

🎊 C'est parti pour l'aventure livraison !

🔑 **Tes identifiants :**
📱 Ton numéro : ${driverPhone}
🔐 Ton code secret : ${accessCode}

🚀 **Tu es prêt à rouler :**
✅ Compte activé automatiquement
🟢 Statut en ligne
🔔 Notifications ON

📍 **Ton restaurant :**
📞 ${restaurantName}${restaurantPhone ? ' : ' + restaurantPhone : ''}

Prêt pour les premières commandes ? 🍕🏍️

Bonne route partenaire ! 💪`;

      const result = await this.sendMessage(driverPhone, message);
      
      if (result) {
        console.log(`✅ [WhatsAppFrance] Access code sent successfully to ${driverName}`);
      } else {
        console.error(`❌ [WhatsAppFrance] Failed to send access code to ${driverName}`);
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ [WhatsAppFrance] Error sending driver access code:`, error);
      return false;
    }
  }

  /**
   * Génère un code d'accès à 6 chiffres
   */
  generateAccessCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Formate un prix en euros
   */
  private formatPriceEuros(amount: number): string {
    return `${amount.toFixed(2)}€`;
  }
}