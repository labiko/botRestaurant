/**
 * Handler pour les Modes - Application Layer
 * Gère le choix du mode de récupération (sur place, emporter, livraison)
 */

import { Session } from '../../domain/entities/Session.ts';
import { IIncomingMessage, IMessageService } from '../../core/interfaces/IMessageService.ts';
import { IConversationHandler } from '../orchestrators/ConversationOrchestrator.ts';

export class ModeHandler implements IConversationHandler {
  constructor(private messageService: IMessageService) {}

  canHandle(session: Session, message: IIncomingMessage): boolean {
    return session.state === 'MODE_SELECTION' && /^[1-3]$/.test(message.content.trim());
  }

  async handle(session: Session, message: IIncomingMessage): Promise<void> {
    const phoneNumber = message.from.replace(/@.*/, '');
    const choice = message.content.trim();

    switch (choice) {
      case '1':
        await this.handleSurPlace(phoneNumber, session);
        break;
      case '2':
        await this.handleEmporter(phoneNumber, session);
        break;
      case '3':
        await this.handleLivraison(phoneNumber, session);
        break;
      default:
        await this.handleInvalidChoice(phoneNumber);
        break;
    }
  }

  private async handleSurPlace(phoneNumber: string, session: Session): Promise<void> {
    const modeMessage = `🍽️ Commande sur place confirmée!

💳 Quand souhaitez-vous payer?

1️⃣ Maintenant (Orange Money/Wave)
2️⃣ À la fin du repas (sur place)

Répondez avec votre choix.`;

    await this.messageService.sendTextMessage(phoneNumber, modeMessage);
    
    session.updateContext({ mode: 'sur_place' });
    session.updateState('PAYMENT_SELECTION');
  }

  private async handleEmporter(phoneNumber: string, session: Session): Promise<void> {
    const modeMessage = `📦 Commande à emporter confirmée!

💳 Quand souhaitez-vous payer?

1️⃣ Maintenant (Orange Money/Wave)
2️⃣ À la récupération (au restaurant)

Répondez avec votre choix.`;

    await this.messageService.sendTextMessage(phoneNumber, modeMessage);
    
    session.updateContext({ mode: 'emporter' });
    session.updateState('PAYMENT_SELECTION');
  }

  private async handleLivraison(phoneNumber: string, session: Session): Promise<void> {
    const locationMessage = `🛵 Pour calculer les frais de livraison, partagez votre position.

Cliquez sur 📎 → Position → Position actuelle

Ou tapez votre adresse complète.`;

    await this.messageService.sendTextMessage(phoneNumber, locationMessage);
    
    session.updateContext({ mode: 'livraison' });
    session.updateState('LIVRAISON_LOCATION');
  }

  private async handleInvalidChoice(phoneNumber: string): Promise<void> {
    const errorMessage = `❓ Choix non reconnu.

Choisissez votre mode de récupération:

1️⃣ Sur place 🍽️
2️⃣ À emporter 📦
3️⃣ Livraison 🛵

Répondez avec le numéro de votre choix.`;

    await this.messageService.sendTextMessage(phoneNumber, errorMessage);
  }
}