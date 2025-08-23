/**
 * Handler pour le Panier - Application Layer
 * Gère la construction et validation du panier
 */

import { Session } from '../../domain/entities/Session.ts';
import { IOrderItem } from '../../domain/entities/Order.ts';
import { IIncomingMessage, IMessageService } from '../../core/interfaces/IMessageService.ts';
import { IConversationHandler } from '../orchestrators/ConversationOrchestrator.ts';
import { MenuRepository } from '../../infrastructure/repositories/MenuRepository.ts';

export class PanierHandler implements IConversationHandler {
  constructor(
    private messageService: IMessageService,
    private menuRepository: MenuRepository
  ) {}

  canHandle(session: Session, message: IIncomingMessage): boolean {
    const validStates = ['VIEWING_MENU', 'BUILDING_CART', 'CART_CONFIRMATION', 'CART_MODIFICATION'];
    
    if (!validStates.includes(session.state)) return false;

    // Si c'est un message de sélection numérotée
    if (this.isNumberSelection(message.content)) return true;

    // Si c'est une réponse de confirmation
    if (session.state === 'CART_CONFIRMATION' && this.isConfirmationResponse(message.content)) return true;

    // Si c'est dans la modification du panier
    if (session.state === 'CART_MODIFICATION' && this.isModificationChoice(message.content)) return true;

    return false;
  }

  async handle(session: Session, message: IIncomingMessage): Promise<void> {
    const phoneNumber = message.from.replace(/@.*/, '');

    switch (session.state) {
      case 'VIEWING_MENU':
      case 'BUILDING_CART':
        await this.handleMenuSelection(phoneNumber, session, message);
        break;
      case 'CART_CONFIRMATION':
        await this.handleCartConfirmation(phoneNumber, session, message);
        break;
      case 'CART_MODIFICATION':
        await this.handleCartModification(phoneNumber, session, message);
        break;
    }
  }

  private async handleMenuSelection(
    phoneNumber: string,
    session: Session,
    message: IIncomingMessage
  ): Promise<void> {
    const selection = this.parseNumberSelection(message.content);
    
    if (selection.length === 0) {
      await this.sendInvalidSelectionMessage(phoneNumber);
      return;
    }

    try {
      // Récupérer le menu complet depuis la base de données
      const menu = session.context.menu || [];
      const validItems: IOrderItem[] = [];
      
      // Vérifier chaque sélection
      for (const itemNumber of selection) {
        const menuItem = menu.find((item: any) => {
          const itemIndex = menu.findIndex((m: any) => m.id === item.id) + 1;
          return itemIndex === itemNumber;
        });
        
        if (menuItem) {
          // Vérifier que l'article est toujours disponible
          const fullMenuItem = await this.menuRepository.findById(menuItem.id);
          if (fullMenuItem && fullMenuItem.disponible) {
            const orderItem: IOrderItem = {
              menuId: fullMenuItem.id,
              nom: fullMenuItem.nomPlat,
              quantite: 1,
              prixUnitaire: fullMenuItem.prix,
              sousTotal: fullMenuItem.prix
            };
            validItems.push(orderItem);
            session.addToCart(orderItem);
          }
        }
      }
      
      if (validItems.length === 0) {
        await this.messageService.sendTextMessage(
          phoneNumber,
          "❌ Aucun article valide sélectionné. Vérifiez vos numéros."
        );
        return;
      }
      
      // Passer à la confirmation du panier
      await this.showCartSummary(phoneNumber, session);
      
    } catch (error) {
      console.error('Error processing menu selection:', error);
      await this.messageService.sendTextMessage(
        phoneNumber,
        "❌ Erreur lors de l'ajout au panier. Veuillez réessayer."
      );
    }
  }

  private async showCartSummary(phoneNumber: string, session: Session): Promise<void> {
    if (!session.canProceedToCheckout()) {
      await this.messageService.sendTextMessage(
        phoneNumber,
        "🛒 Votre panier est vide. Sélectionnez des plats en tapant leurs numéros."
      );
      return;
    }

    const cartMessage = this.formatCartSummary(session);
    const confirmationMessage = `${cartMessage}

✅ Confirmer cette commande? (OUI/NON)`;

    await this.messageService.sendTextMessage(phoneNumber, confirmationMessage);
    session.updateState('CART_CONFIRMATION');
  }

  private async handleCartConfirmation(
    phoneNumber: string,
    session: Session,
    message: IIncomingMessage
  ): Promise<void> {
    const response = message.content.trim().toLowerCase();

    if (response === 'oui' || response === 'o' || response === 'yes') {
      // Panier confirmé, passer au choix du mode
      const confirmationMessage = `✅ Panier confirmé!

📦 Comment souhaitez-vous récupérer votre commande?

1️⃣ Sur place 🍽️ (manger au restaurant)
2️⃣ À emporter 📦 (récupérer et partir)
3️⃣ Livraison 🛵 (recevoir chez vous)

Répondez avec votre choix.`;

      await this.messageService.sendTextMessage(phoneNumber, confirmationMessage);
      session.updateState('MODE_SELECTION');
      
    } else if (response === 'non' || response === 'n' || response === 'no') {
      // Proposer les options de modification
      const modificationMessage = `Que souhaitez-vous faire?

1️⃣ Supprimer un article
2️⃣ Ajouter d'autres articles
3️⃣ Tout annuler et recommencer

Répondez avec votre choix.`;

      await this.messageService.sendTextMessage(phoneNumber, modificationMessage);
      session.updateState('CART_MODIFICATION');
      
    } else {
      // Réponse non reconnue
      await this.messageService.sendTextMessage(
        phoneNumber,
        "❓ Répondez par OUI pour confirmer ou NON pour modifier votre panier."
      );
    }
  }

  private async handleCartModification(
    phoneNumber: string,
    session: Session,
    message: IIncomingMessage
  ): Promise<void> {
    const choice = message.content.trim();

    switch (choice) {
      case '1':
        await this.handleRemoveItem(phoneNumber, session);
        break;
      case '2':
        await this.handleAddItems(phoneNumber, session);
        break;
      case '3':
        await this.handleClearCart(phoneNumber, session);
        break;
      default:
        await this.messageService.sendTextMessage(
          phoneNumber,
          "❓ Choisissez 1 (Supprimer), 2 (Ajouter) ou 3 (Tout annuler)."
        );
        break;
    }
  }

  private async handleRemoveItem(phoneNumber: string, session: Session): Promise<void> {
    if (!session.context.panier || session.context.panier.length === 0) {
      await this.messageService.sendTextMessage(phoneNumber, "🛒 Votre panier est déjà vide.");
      return;
    }

    let removeMessage = "Quel article supprimer?\n\n";
    
    session.context.panier.forEach((item: IOrderItem, index: number) => {
      removeMessage += `${index + 1}️⃣ ${item.nom} (${item.quantite}×)\n`;
    });
    
    removeMessage += "\nTapez le numéro de l'article à retirer.";

    await this.messageService.sendTextMessage(phoneNumber, removeMessage);
    session.updateContext({ awaitingRemoval: true });
  }

  private async handleAddItems(phoneNumber: string, session: Session): Promise<void> {
    try {
      // Réafficher le menu pour ajouter des articles
      const menu = session.context.menu || [];
      
      if (menu.length === 0) {
        await this.messageService.sendTextMessage(
          phoneNumber,
          "❌ Menu indisponible. Recommencez votre sélection de restaurant."
        );
        return;
      }
      
      let menuMessage = `📋 Menu - ${session.context.restaurantNom}\n\n`;
      
      menu.forEach((item: any, index: number) => {
        menuMessage += `${index + 1}️⃣ ${item.nom} - ${item.prix.toLocaleString('fr-FR')} GNF\n`;
      });
      
      menuMessage += "\n💡 Tapez les numéros des plats à ajouter (ex: 2,4)";

      await this.messageService.sendTextMessage(phoneNumber, menuMessage);
      session.updateState('BUILDING_CART');
      
    } catch (error) {
      console.error('Error showing add items menu:', error);
      await this.messageService.sendTextMessage(
        phoneNumber,
        "❌ Erreur lors de l'affichage du menu. Veuillez réessayer."
      );
    }
  }

  private async handleClearCart(phoneNumber: string, session: Session): Promise<void> {
    session.clearCart();
    
    const clearMessage = `🗑️ Panier vidé.

🍽️ Que souhaitez-vous faire?

1️⃣ Recommencer avec un autre restaurant
2️⃣ Quitter

Répondez avec votre choix.`;

    await this.messageService.sendTextMessage(phoneNumber, clearMessage);
    session.updateState('INITIAL');
  }

  private formatCartSummary(session: Session): string {
    if (!session.context.panier || session.context.panier.length === 0) {
      return "🛒 Votre panier est vide";
    }

    let summary = "🛒 Votre panier:\n\n";
    
    session.context.panier.forEach((item: IOrderItem) => {
      summary += `• ${item.quantite}× ${item.nom} - ${item.sousTotal.toLocaleString('fr-FR')} GNF\n`;
    });
    
    summary += "\n────────────────────\n";
    summary += `💰 Sous-total: ${session.context.sousTotal?.toLocaleString('fr-FR')} GNF`;
    
    return summary;
  }

  private isNumberSelection(content: string): boolean {
    // Vérifie si c'est une sélection numérotée (ex: 1,2,3 ou 1 2 3)
    const pattern = /^[\d,\s]+$/;
    return pattern.test(content.trim());
  }

  private parseNumberSelection(content: string): number[] {
    // Parse une sélection comme "1,2,2,3" ou "1 2 2 3"
    const numbers = content
      .replace(/\s+/g, ',')
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n > 0);
    
    return numbers;
  }

  private isConfirmationResponse(content: string): boolean {
    const confirmations = ['oui', 'non', 'o', 'n', 'yes', 'no'];
    return confirmations.includes(content.trim().toLowerCase());
  }

  private isModificationChoice(content: string): boolean {
    return ['1', '2', '3'].includes(content.trim());
  }

  private async sendInvalidSelectionMessage(phoneNumber: string): Promise<void> {
    const message = `❓ Format non reconnu.

🛒 Pour commander, tapez les numéros des plats:
• Ex: 1,3,3 = 1× plat n°1 + 2× plats n°3
• Ex: 1 2 4 = 1× plat n°1 + 1× plat n°2 + 1× plat n°4

Ou tapez "annuler" pour recommencer.`;

    await this.messageService.sendTextMessage(phoneNumber, message);
  }

}