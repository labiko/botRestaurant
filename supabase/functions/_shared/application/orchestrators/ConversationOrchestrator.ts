/**
 * Orchestrateur de Conversation - Application Layer
 * Gère le flux principal des conversations WhatsApp
 * Principe SOLID: Single Responsibility + Dependency Inversion
 */

import { Session, ConversationState } from '../../domain/entities/Session.ts';
import { IIncomingMessage, IMessageService } from '../../core/interfaces/IMessageService.ts';
import { SessionService } from '../services/SessionService.ts';
import { AccueilHandler } from '../handlers/AccueilHandler.ts';
import { MenuHandler } from '../handlers/MenuHandler.ts';
import { PanierHandler } from '../handlers/PanierHandler.ts';
import { ModeHandler } from '../handlers/ModeHandler.ts';
import { LivraisonHandler } from '../handlers/LivraisonHandler.ts';
import { PaiementHandler } from '../handlers/PaiementHandler.ts';

export interface IConversationHandler {
  canHandle(session: Session, message: IIncomingMessage): boolean;
  handle(session: Session, message: IIncomingMessage): Promise<void>;
}

export class ConversationOrchestrator {
  private handlers: IConversationHandler[] = [];

  constructor(
    private messageService: IMessageService,
    private sessionService: SessionService
  ) {
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    // Ordre important : du plus spécifique au plus général
    this.handlers = [
      new AccueilHandler(this.messageService),
      new MenuHandler(this.messageService),
      new PanierHandler(this.messageService),
      new ModeHandler(this.messageService),
      new LivraisonHandler(this.messageService),
      new PaiementHandler(this.messageService)
    ];
  }

  async handleIncomingMessage(incomingMessage: IIncomingMessage): Promise<void> {
    const phoneNumber = this.extractPhoneNumber(incomingMessage.from);
    
    try {
      // Vérifier d'abord si c'est une commande d'annulation globale
      if (this.isCancelCommand(incomingMessage.content)) {
        await this.handleCancelCommand(phoneNumber);
        return;
      }

      // Récupérer ou créer la session
      let session = await this.sessionService.getSession(phoneNumber);
      if (!session || session.isExpired()) {
        session = await this.sessionService.createSession(phoneNumber);
      }

      // Logger le message entrant
      await this.logWebhook(phoneNumber, incomingMessage.content, session.state, null);

      // Envoyer indicateur de frappe
      await this.messageService.sendTyping?.(phoneNumber);

      // Trouver et exécuter le handler approprié
      const handler = this.findHandler(session, incomingMessage);
      if (handler) {
        const previousState = session.state;
        await handler.handle(session, incomingMessage);
        
        // Sauvegarder la session mise à jour
        await this.sessionService.updateSession(session);
        
        // Logger la réponse
        await this.logWebhook(
          phoneNumber, 
          incomingMessage.content, 
          previousState, 
          session.state
        );
      } else {
        // Aucun handler trouvé, message par défaut
        await this.handleUnknownCommand(session, incomingMessage);
      }

    } catch (error) {
      console.error('Error in conversation orchestrator:', error);
      await this.handleError(phoneNumber, error);
      
      // Logger l'erreur
      await this.logWebhook(
        phoneNumber,
        incomingMessage.content,
        'ERROR',
        null,
        error.message
      );
    }
  }

  private findHandler(session: Session, message: IIncomingMessage): IConversationHandler | null {
    return this.handlers.find(handler => handler.canHandle(session, message)) || null;
  }

  private extractPhoneNumber(from: string): string {
    // Supprime le suffixe WhatsApp (@c.us, @g.us)
    return from.replace(/@.*/, '');
  }

  private isCancelCommand(message: string): boolean {
    const cancelKeywords = ['annuler', 'cancel', 'stop', 'arreter', 'arrêter'];
    return cancelKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private async handleCancelCommand(phoneNumber: string): Promise<void> {
    // Réinitialiser la session
    await this.sessionService.resetSession(phoneNumber);
    
    const cancelMessage = `❌ Commande annulée.

Que souhaitez-vous faire?

1️⃣ Recommencer avec un autre restaurant
2️⃣ Quitter

Répondez avec votre choix.`;

    await this.messageService.sendTextMessage(phoneNumber, cancelMessage);
  }

  private async handleUnknownCommand(session: Session, message: IIncomingMessage): Promise<void> {
    let response = '';

    // Messages d'aide selon l'état
    switch (session.state) {
      case 'INITIAL':
        response = `👋 Bonjour! Pour commencer, tapez "resto" pour voir nos restaurants.`;
        break;
        
      case 'CHOOSING_RESTAURANT':
        response = `🍽️ Pour choisir un restaurant, répondez avec:
• 1️⃣ pour les restaurants proches
• 2️⃣ pour tous les restaurants
• ⭐ pour votre favori (si configuré)

Ou tapez "annuler" pour quitter.`;
        break;
        
      case 'BUILDING_CART':
        response = `🛒 Pour commander, envoyez les numéros des plats.
Exemple: 1,3,3 = 1× plat n°1 + 2× plat n°3

Tapez "annuler" pour recommencer.`;
        break;
        
      default:
        response = `❓ Je n'ai pas compris votre message.

Répondez avec un numéro ou tapez "annuler" pour recommencer.

Besoin d'aide? Tapez "aide" pour plus d'informations.`;
    }

    await this.messageService.sendTextMessage(message.from.replace(/@.*/, ''), response);
  }

  private async handleError(phoneNumber: string, error: any): Promise<void> {
    const errorMessage = `😕 Désolé, une erreur s'est produite.

Tapez "resto" pour recommencer ou "aide" pour obtenir de l'aide.

Si le problème persiste, contactez le support.`;

    try {
      await this.messageService.sendTextMessage(phoneNumber, errorMessage);
    } catch (sendError) {
      console.error('Failed to send error message:', sendError);
    }
  }

  private async logWebhook(
    phone: string,
    messageIn: string,
    stateBefore: string | null,
    stateAfter: string | null,
    error: string | null = null
  ): Promise<void> {
    try {
      const startTime = Date.now();
      // Ici, vous pouvez implémenter le logging vers votre table logs_webhook
      // Pour l'instant, on log juste en console
      console.log({
        phone,
        messageIn,
        stateBefore,
        stateAfter,
        error,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log webhook:', logError);
    }
  }

  /**
   * Gère les webhooks de statut des messages (optionnel)
   */
  async handleMessageStatus(status: any): Promise<void> {
    // Implémenter le tracking des statuts si nécessaire
    console.log('Message status received:', status);
  }

  /**
   * Gère les changements d'état de l'instance WhatsApp
   */
  async handleInstanceStateChange(state: any): Promise<void> {
    console.log('Instance state changed:', state);
    
    // Notifier les administrateurs si l'instance est déconnectée
    if (state.stateInstance === 'notAuthorized') {
      console.error('WhatsApp instance is not authorized!');
      // Envoyer notification aux administrateurs
    }
  }

  /**
   * Nettoyage des sessions expirées (à appeler périodiquement)
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      await this.sessionService.cleanupExpiredSessions();
      console.log('Expired sessions cleaned up');
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
    }
  }
}