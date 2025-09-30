// 📤 SERVICE ENVOI MESSAGES - COMMUNICATION WHATSAPP
// SOLID - Single Responsibility : Gère uniquement l'envoi de messages
// Template-driven : Messages personnalisables par restaurant

import { 
  IMessageSender,
  MessageTemplate
} from '../types.ts';
import { PerformanceLogger } from './PerformanceLogger.ts';

/**
 * Service d'envoi de messages WhatsApp
 * SOLID - Single Responsibility : Gère uniquement l'envoi via Green API
 */
export class MessageSender implements IMessageSender {
  
  private apiToken: string;
  private instanceId: string;
  private baseUrl: string;
  private readonly MAX_MESSAGE_LENGTH = 4000; // WhatsApp limit

  constructor(apiToken: string, instanceId: string) {
    this.apiToken = apiToken;
    this.instanceId = instanceId;
    this.baseUrl = Deno.env.get('GREEN_API_URL')!;
  }

  /**
   * Envoyer un message simple
   * SOLID - Interface Segregation : Interface claire et simple
   */
  async sendMessage(phoneNumber: string, content: string): Promise<void> {
    console.log(`📤 [MessageSender] Envoi vers ${phoneNumber}`);
    console.log(`📝 [MessageSender] Contenu: ${content.substring(0, 100)}...`);
    
    try {
      // Valider le contenu
      const validatedContent = this.validateAndTruncateMessage(content);
      
      // Envoi direct sans queue
      await this.sendDirectMessage(phoneNumber, validatedContent);
      
    } catch (error) {
      console.error('❌ [MessageSender] Erreur sendMessage:', error);
      throw error;
    }
  }

  /**
   * Envoyer un message avec template
   * SOLID - Template Method Pattern : Structure commune, détails variables
   */
  async sendFormattedMessage(
    phoneNumber: string, 
    template: MessageTemplate, 
    variables: Record<string, any>
  ): Promise<void> {
    
    console.log(`📤 [MessageSender] Envoi template "${template.templateKey}" vers ${phoneNumber}`);
    console.log(`📝 [MessageSender] Variables:`, Object.keys(variables));
    
    try {
      // Remplacer les variables dans le template
      const content = this.processTemplate(template.content, variables);
      
      // Envoyer le message
      await this.sendMessage(phoneNumber, content);
      
    } catch (error) {
      console.error('❌ [MessageSender] Erreur sendFormattedMessage:', error);
      throw error;
    }
  }

  /**
   * Envoyer message avec accusé de réception
   * SOLID - Command Pattern : Action spécifique avec suivi
   */
  async sendMessageWithDeliveryReceipt(
    phoneNumber: string, 
    content: string
  ): Promise<{ messageId: string; success: boolean }> {
    
    console.log(`📤 [MessageSender] Envoi avec accusé vers ${phoneNumber}`);
    
    try {
      const messageId = await this.sendDirectMessage(phoneNumber, content);
      
      return {
        messageId,
        success: !!messageId
      };
      
    } catch (error) {
      console.error('❌ [MessageSender] Erreur avec accusé:', error);
      return {
        messageId: '',
        success: false
      };
    }
  }

  /**
   * Envoyer message multimédia (futur)
   * SOLID - Open/Closed : Extensible pour nouveaux types de messages
   */
  async sendMediaMessage(
    phoneNumber: string,
    mediaUrl: string,
    mediaType: 'image' | 'document' | 'audio',
    caption?: string
  ): Promise<void> {
    
    console.log(`📤 [MessageSender] Envoi média ${mediaType} vers ${phoneNumber}`);
    
    // TODO: Implémenter envoi de média
    console.warn('⚠️ [MessageSender] Envoi média non encore implémenté');
  }

  // ================================================
  // MÉTHODES PRIVÉES - ENVOI DIRECT
  // ================================================

  private async sendDirectMessage(phoneNumber: string, content: string): Promise<string | null> {
    console.log(`📤 [DirectSend] Envoi immédiat vers ${phoneNumber}`);
    
    const perfLogger = PerformanceLogger.getInstance();
    const operationId = PerformanceLogger.generateOperationId('greenapi_send');
    
    try {
      // Nettoyer le numéro de téléphone
      const cleanPhoneNumber = this.cleanPhoneNumber(phoneNumber);
      
      // Payload Green API
      const payload = {
        chatId: cleanPhoneNumber,
        message: content
      };

      console.log(`📦 [DirectSend] Payload:`, JSON.stringify(payload));

      // Démarrer le suivi de performance
      perfLogger.startOperation(operationId, `Green API sendMessage to ${cleanPhoneNumber}`, 'green_api', {
        messageLength: content.length,
        phoneNumber: cleanPhoneNumber
      });

      // Appel API Green API
      const response = await fetch(`${this.baseUrl}/waInstance${this.instanceId}/sendMessage/${this.apiToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log(`📡 [DirectSend] Statut HTTP: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [DirectSend] Erreur HTTP ${response.status}: ${errorText}`);
        throw new Error(`Erreur API Green: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`📨 [DirectSend] Réponse API:`, result);

      if (result.idMessage) {
        console.log(`✅ [DirectSend] Message envoyé, ID: ${result.idMessage}`);
        perfLogger.endOperation(operationId); // Succès
        return result.idMessage;
      } else {
        console.error('❌ [DirectSend] Pas d\'ID message dans la réponse');
        perfLogger.endOperation(operationId, 'Réponse API invalide');
        throw new Error('Réponse API invalide');
      }
      
    } catch (error) {
      console.error('❌ [DirectSend] Erreur sendDirectMessage:', error);
      perfLogger.endOperation(operationId, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // ================================================
  // UTILITAIRES
  // ================================================

  private validateAndTruncateMessage(content: string): string {
    if (!content || content.trim().length === 0) {
      throw new Error('Contenu du message vide');
    }
    
    let validatedContent = content.trim();
    
    // Tronquer si trop long
    if (validatedContent.length > this.MAX_MESSAGE_LENGTH) {
      console.warn(`⚠️ [MessageSender] Message tronqué: ${validatedContent.length} -> ${this.MAX_MESSAGE_LENGTH} caractères`);
      validatedContent = validatedContent.substring(0, this.MAX_MESSAGE_LENGTH - 10) + '\n...(suite)';
    }
    
    return validatedContent;
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    let processedTemplate = template;
    
    // Remplacer les variables {{variable}}
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      const stringValue = value?.toString() || '';
      processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), stringValue);
    }
    
    // Vérifier s'il reste des placeholders non remplacés
    const remainingPlaceholders = processedTemplate.match(/\{\{[^}]+\}\}/g);
    if (remainingPlaceholders) {
      console.warn('⚠️ [MessageSender] Placeholders non remplacés:', remainingPlaceholders);
      
      // Supprimer les placeholders non remplacés
      remainingPlaceholders.forEach(placeholder => {
        processedTemplate = processedTemplate.replace(placeholder, '[non défini]');
      });
    }
    
    return processedTemplate;
  }

  private cleanPhoneNumber(phoneNumber: string): string {
    // Nettoyer et formater pour Green API
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Ajouter @c.us pour Green API si pas déjà présent
    if (!cleaned.includes('@')) {
      cleaned = cleaned + '@c.us';
    }
    
    return cleaned;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ================================================
  // MÉTHODES PUBLIQUES - MONITORING
  // ================================================


  /**
   * Tester la connexion Green API
   */
  async testConnection(): Promise<boolean> {
    console.log('🔗 [MessageSender] Test connexion Green API...');
    
    try {
      const response = await fetch(`${this.baseUrl}/getStateInstance/${this.apiToken}`, {
        method: 'GET'
      });

      if (response.ok) {
        const state = await response.json();
        console.log(`✅ [MessageSender] Connexion OK, état: ${state.stateInstance}`);
        return state.stateInstance === 'authorized';
      } else {
        console.error(`❌ [MessageSender] Test échec: ${response.status}`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ [MessageSender] Erreur test connexion:', error);
      return false;
    }
  }

  /**
   * Obtenir informations sur l'instance
   */
  async getInstanceInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/getSettings/${this.apiToken}`, {
        method: 'GET'
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ [MessageSender] Erreur getInstanceInfo:', error);
      return null;
    }
  }
}

