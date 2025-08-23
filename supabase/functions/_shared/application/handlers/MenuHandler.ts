/**
 * Handler pour le Menu - Application Layer
 * Gère l'affichage des menus et la navigation
 */

import { Session } from '../../domain/entities/Session.ts';
import { IIncomingMessage, IMessageService } from '../../core/interfaces/IMessageService.ts';
import { IConversationHandler } from '../orchestrators/ConversationOrchestrator.ts';
import { RestaurantRepository } from '../../infrastructure/repositories/RestaurantRepository.ts';
import { MenuRepository } from '../../infrastructure/repositories/MenuRepository.ts';

export class MenuHandler implements IConversationHandler {
  constructor(
    private messageService: IMessageService,
    private restaurantRepository: RestaurantRepository,
    private menuRepository: MenuRepository
  ) {}

  canHandle(session: Session, message: IIncomingMessage): boolean {
    const validStates = ['VIEWING_ALL_RESTOS', 'WAITING_LOCATION'];
    
    if (!validStates.includes(session.state)) return false;

    // Choix de restaurant par numéro ou navigation
    const isNumberChoice = /^[1-5]$/.test(message.content.trim());
    const isNavigation = ['suivant', 'precedent', 'retour'].includes(message.content.toLowerCase());
    const isLocationMessage = message.type === 'location';

    return isNumberChoice || isNavigation || isLocationMessage;
  }

  async handle(session: Session, message: IIncomingMessage): Promise<void> {
    const phoneNumber = message.from.replace(/@.*/, '');

    if (session.state === 'VIEWING_ALL_RESTOS') {
      await this.handleRestaurantSelection(phoneNumber, session, message);
    } else if (session.state === 'WAITING_LOCATION') {
      await this.handleLocationReceived(phoneNumber, session, message);
    }
  }

  private async handleRestaurantSelection(
    phoneNumber: string,
    session: Session,
    message: IIncomingMessage
  ): Promise<void> {
    const choice = parseInt(message.content.trim());
    const restaurants = session.context.restaurantsList || [];

    if (choice >= 1 && choice <= restaurants.length) {
      const selectedRestaurant = restaurants[choice - 1];
      
      const confirmationMessage = `✅ Vous avez choisi: ${selectedRestaurant.nom}

📍 ${selectedRestaurant.adresse || 'Conakry'}
🕒 ${selectedRestaurant.statut === 'ouvert' ? 'Ouvert ✅' : 'Fermé 🔴'}

Chargement du menu...`;

      await this.messageService.sendTextMessage(phoneNumber, confirmationMessage);
      
      // Sauvegarder le restaurant choisi
      session.updateContext({
        restaurantId: selectedRestaurant.id,
        restaurantNom: selectedRestaurant.nom
      });
      session.updateState('VIEWING_MENU');

      // Afficher le menu après un court délai
      setTimeout(async () => {
        await this.showRestaurantMenu(phoneNumber, session, selectedRestaurant);
      }, 1000);
    } else {
      await this.messageService.sendTextMessage(
        phoneNumber,
        "❓ Numéro de restaurant invalide. Choisissez un numéro entre 1 et 5."
      );
    }
  }

  private async handleLocationReceived(
    phoneNumber: string,
    session: Session,
    message: IIncomingMessage
  ): Promise<void> {
    if (message.type !== 'location' || !message.location) {
      await this.messageService.sendTextMessage(
        phoneNumber,
        "📍 Veuillez partager votre position WhatsApp ou tapez '2' pour voir tous les restaurants."
      );
      return;
    }

    const { latitude, longitude } = message.location;
    
    try {
      // Récupérer les restaurants proches depuis la base de données
      const nearbyRestaurants = await this.restaurantRepository.findNearbyRestaurants(
        latitude, longitude, 10 // Rayon de 10 km
      );

      if (nearbyRestaurants.length === 0) {
        await this.messageService.sendTextMessage(
          phoneNumber,
          "❌ Aucun restaurant trouvé dans votre zone. Tapez '2' pour voir tous les restaurants."
        );
        return;
      }

      const restaurantsWithDistance = nearbyRestaurants.map(resto => ({
        id: resto.id,
        nom: resto.nom,
        adresse: resto.adresse,
        statut: resto.isOpen() ? 'ouvert' : 'ferme',
        distance: resto.distance || 0
      })).sort((a, b) => a.distance - b.distance);

    let message = `📍 Restaurants proches de vous:\n\n`;
    
    restaurantsWithDistance.slice(0, 5).forEach((resto, index) => {
      const statusIcon = resto.statut === 'ouvert' ? '✅' : '🔴';
      message += `${index + 1}️⃣ ${resto.nom} (${resto.distance.toFixed(1)} km) ${statusIcon}\n`;
    });

    message += '\nTapez le numéro du restaurant souhaité.';
    if (restaurantsWithDistance.length > 5) {
      message += '\nTapez "suivant" pour voir plus de restaurants.';
    }

    await this.messageService.sendTextMessage(phoneNumber, message);
    
      session.updateContext({
        restaurantsList: restaurantsWithDistance.slice(0, 5),
        positionClient: { lat: latitude, lng: longitude }
      });
      session.updateState('VIEWING_ALL_RESTOS');
      
    } catch (error) {
      console.error('Error finding nearby restaurants:', error);
      await this.messageService.sendTextMessage(
        phoneNumber,
        "❌ Erreur lors de la recherche de restaurants. Tapez '2' pour voir tous les restaurants."
      );
    }
  }

  private async showRestaurantMenu(phoneNumber: string, session: Session, restaurant: any): Promise<void> {
    try {
      // Récupérer le menu depuis la base de données
      const menu = await this.menuRepository.findByRestaurantPaginated(
        restaurant.id, 1, 5
      );

      if (menu.data.length === 0) {
        await this.messageService.sendTextMessage(
          phoneNumber,
          "❌ Ce restaurant n'a pas encore de menu disponible."
        );
        return;
      }

      let menuMessage = `📋 Menu du jour - ${restaurant.nom}\n\n`;
      
      // Grouper par catégorie
      const categories = ['entree', 'plat', 'dessert', 'boisson'];
      const categoryIcons = {
        entree: '🥗 ENTRÉES',
        plat: '🍖 PLATS PRINCIPAUX', 
        dessert: '🍰 DESSERTS',
        boisson: '🥤 BOISSONS'
      };

      for (const categorie of categories) {
        const items = menu.data.filter(item => item.categorie === categorie);
        if (items.length > 0) {
          menuMessage += `${categoryIcons[categorie as keyof typeof categoryIcons]}\n`;
          items.forEach((item, index) => {
            const displayIndex = menu.data.findIndex(m => m.id === item.id) + 1;
            menuMessage += `${displayIndex}️⃣ ${item.nomPlat} - ${item.prix.toLocaleString('fr-FR')} GNF\n`;
          });
          menuMessage += '\n';
        }
      }

      if (menu.hasNext) {
        menuMessage += `Tapez 'suivant' pour voir plus de plats\n`;
      }
      menuMessage += `\n💡 Pour commander: envoyez les numéros\n`;
      menuMessage += `Ex: 1,3,3 = 1× plat n°1 + 2× plats n°3`;

      await this.messageService.sendTextMessage(phoneNumber, menuMessage);
      
      session.updateContext({ 
        menu: menu.data.map(item => ({
          id: item.id,
          nom: item.nomPlat,
          prix: item.prix,
          categorie: item.categorie
        })),
        menuPage: menu.currentPage,
        hasNextPage: menu.hasNext
      });
      session.updateState('VIEWING_MENU');
      
    } catch (error) {
      console.error('Error loading menu:', error);
      await this.messageService.sendTextMessage(
        phoneNumber,
        "❌ Erreur lors du chargement du menu. Veuillez réessayer."
      );
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI/180);
  }
}