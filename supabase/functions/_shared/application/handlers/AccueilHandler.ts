/**
 * Handler pour l'Accueil - Application Layer
 * Gère le choix du restaurant et l'accès aux favoris
 */

import { Session } from '../../domain/entities/Session.ts';
import { IIncomingMessage, IMessageService } from '../../core/interfaces/IMessageService.ts';
import { IConversationHandler } from '../orchestrators/ConversationOrchestrator.ts';
import { RestaurantRepository } from '../../infrastructure/repositories/RestaurantRepository.ts';
import { ClientRepository } from '../../infrastructure/repositories/ClientRepository.ts';

export class AccueilHandler implements IConversationHandler {
  constructor(
    private messageService: IMessageService,
    private restaurantRepository: RestaurantRepository,
    private clientRepository: ClientRepository
  ) {
    console.log('🏗️ AccueilHandler constructor called');
    console.log('🔍 messageService:', !!this.messageService);
    console.log('🔍 restaurantRepository:', !!this.restaurantRepository);
    console.log('🔍 clientRepository in constructor:', !!this.clientRepository);
    console.log('🔍 clientRepository.findOrCreateByPhone in constructor:', typeof this.clientRepository?.findOrCreateByPhone);
  }

  canHandle(session: Session, message: IIncomingMessage): boolean {
    // Messages d'initialisation
    const initKeywords = ['resto', 'restaurant', 'menu', 'commander', 'bonjour', 'salut'];
    const isInitMessage = initKeywords.some(keyword => 
      message.content.toLowerCase().includes(keyword)
    );

    // États où ce handler intervient
    const validStates = ['INITIAL', 'CHOOSING_RESTAURANT'];

    return (session.state === 'INITIAL' && isInitMessage) || 
           (validStates.includes(session.state) && this.isValidChoice(message.content));
  }

  async handle(session: Session, message: IIncomingMessage): Promise<void> {
    const phoneNumber = message.from.replace(/@.*/, '');

    if (session.state === 'INITIAL') {
      await this.showWelcomeMenu(phoneNumber, session);
    } else if (session.state === 'CHOOSING_RESTAURANT') {
      await this.handleRestaurantChoice(phoneNumber, session, message);
    }
  }

  private async showWelcomeMenu(phoneNumber: string, session: Session): Promise<void> {
    try {
      console.log('🔍 showWelcomeMenu called, checking clientRepository...');
      console.log('🔍 this.clientRepository:', !!this.clientRepository);
      console.log('🔍 this.clientRepository type:', typeof this.clientRepository);
      console.log('🔍 this object keys:', Object.keys(this));
      
      // Vérification explicite du repository
      if (!this.clientRepository || typeof this.clientRepository.findOrCreateByPhone !== 'function') {
        console.error('❌ ClientRepository not properly initialized:', this.clientRepository);
        console.error('❌ AccueilHandler context issue. This object:', this);
        
        // Solution de contournement: créer un repository temporaire
        console.log('🚑 Emergency fix: creating temporary ClientRepository');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const tempSupabase = createClient(supabaseUrl, supabaseKey);
        const { ClientRepository } = await import('../../infrastructure/repositories/ClientRepository.ts');
        this.clientRepository = new ClientRepository(tempSupabase);
        console.log('✅ Temporary ClientRepository created');
      }
      
      // Récupérer ou créer le client
      console.log('🔍 Finding/creating client for:', phoneNumber);
      const client = await this.clientRepository.findOrCreateByPhone(phoneNumber);
      console.log('✅ Client found/created:', client.id);
      
      // Vérifier et corriger restaurantRepository si nécessaire
      if (!this.restaurantRepository) {
        console.log('🚑 Emergency fix: creating temporary RestaurantRepository');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const tempSupabase = createClient(supabaseUrl, supabaseKey);
        const { RestaurantRepository } = await import('../../infrastructure/repositories/RestaurantRepository.ts');
        this.restaurantRepository = new RestaurantRepository(tempSupabase);
        console.log('✅ Temporary RestaurantRepository created');
      }

      // Récupérer le restaurant favori s'il existe
      let favoriteRestaurant = null;
      if (client.restaurantFavoriId) {
        favoriteRestaurant = await this.restaurantRepository.findById(client.restaurantFavoriId);
      }

      let welcomeMessage = `🍽️ Bienvenue chez Bot Resto Conakry!

Comment souhaitez-vous trouver votre restaurant?

1️⃣ Restos près de vous 📍
2️⃣ Tous les restos 🍴`;

      if (favoriteRestaurant) {
        welcomeMessage += `\n⭐ ${favoriteRestaurant.nom} (Favori)`;
        session.updateContext({ favoriteRestaurant: { id: favoriteRestaurant.id, nom: favoriteRestaurant.nom } });
      }

      welcomeMessage += '\n\nRépondez avec le numéro de votre choix.';

      await this.messageService.sendTextMessage(phoneNumber, welcomeMessage);
      session.updateState('CHOOSING_RESTAURANT');
      
    } catch (error) {
      console.error('Error showing welcome menu:', error);
      await this.messageService.sendTextMessage(
        phoneNumber,
        '❌ Erreur lors du chargement du menu. Veuillez réessayer avec "resto".'
      );
    }
  }

  private async handleRestaurantChoice(
    phoneNumber: string, 
    session: Session, 
    message: IIncomingMessage
  ): Promise<void> {
    const choice = message.content.trim();

    switch (choice) {
      case '1':
        await this.handleNearbyRestaurants(phoneNumber, session);
        break;
      case '2':
        await this.handleAllRestaurants(phoneNumber, session);
        break;
      case '⭐':
      case 'favori':
        await this.handleFavoriteRestaurant(phoneNumber, session);
        break;
      default:
        await this.handleInvalidChoice(phoneNumber);
        break;
    }
  }

  private async handleNearbyRestaurants(phoneNumber: string, session: Session): Promise<void> {
    const requestMessage = `📍 Pour voir les restaurants proches, partagez votre position WhatsApp.

Cliquez sur 📎 → Position → Position actuelle

Ou tapez "2" pour voir tous les restaurants.`;

    await this.messageService.sendTextMessage(phoneNumber, requestMessage);
    session.updateState('WAITING_LOCATION');
  }

  private async handleAllRestaurants(phoneNumber: string, session: Session): Promise<void> {
    try {
      // Récupérer les restaurants ouverts depuis la base de données
      const restaurants = await this.restaurantRepository.findOpenRestaurants();

      if (restaurants.length === 0) {
        await this.messageService.sendTextMessage(
          phoneNumber,
          '❌ Aucun restaurant n\'est ouvert actuellement. Veuillez réessayer plus tard.'
        );
        return;
      }

      const pageSize = 5;
      const totalPages = Math.ceil(restaurants.length / pageSize);
      const firstPage = restaurants.slice(0, pageSize);

      let message = `🍴 Nos restaurants partenaires (Page 1/${totalPages}):\n\n`;

      firstPage.forEach((resto, index) => {
        const statusIcon = resto.isOpen() ? '✅' : '🔴';
        message += `${index + 1}️⃣ ${resto.nom} ${statusIcon}\n`;
      });

      message += '\nTapez le numéro du restaurant souhaité.';
      
      if (restaurants.length > pageSize) {
        message += '\nTapez "suivant" pour voir plus de restaurants.';
      }

      await this.messageService.sendTextMessage(phoneNumber, message);
      
      // Sauvegarder la liste dans le contexte
      session.updateContext({
        restaurantsList: firstPage.map(r => ({ id: r.id, nom: r.nom, statut: r.isOpen() ? 'ouvert' : 'ferme' })),
        allRestaurants: restaurants.map(r => ({ id: r.id, nom: r.nom, statut: r.isOpen() ? 'ouvert' : 'ferme' })),
        currentPage: 1,
        totalPages: totalPages
      });
      session.updateState('VIEWING_ALL_RESTOS');
      
    } catch (error) {
      console.error('Error loading restaurants:', error);
      await this.messageService.sendTextMessage(
        phoneNumber,
        '❌ Erreur lors du chargement des restaurants. Veuillez réessayer.'
      );
    }
  }

  private async handleFavoriteRestaurant(phoneNumber: string, session: Session): Promise<void> {
    const favorite = session.context.favoriteRestaurant;
    
    if (!favorite) {
      await this.messageService.sendTextMessage(
        phoneNumber,
        "❌ Vous n'avez pas encore de restaurant favori.\n\nChoisissez 1 ou 2 pour explorer nos restaurants."
      );
      return;
    }

    const quickAccessMessage = `⭐ Accès rapide à votre restaurant favori!

📍 ${favorite.nom}
🕒 ${favorite.statut === 'ouvert' ? 'Ouvert' : 'Fermé'} ${favorite.horaires || ''}
⏱️ Temps d'attente actuel: ~15 min

Chargement du menu...`;

    await this.messageService.sendTextMessage(phoneNumber, quickAccessMessage);
    
    // Passer directement au menu du restaurant favori
    session.updateContext({
      restaurantId: favorite.id,
      restaurantNom: favorite.nom
    });
    session.updateState('VIEWING_MENU');

    // Simuler un petit délai puis afficher le menu
    setTimeout(async () => {
      await this.showRestaurantMenu(phoneNumber, session, favorite);
    }, 1000);
  }

  private async showRestaurantMenu(phoneNumber: string, session: Session, restaurant: any): Promise<void> {
    // Menu simulé - en réalité, viendrait de la base de données
    const menu = [
      { id: '1', nom: 'Salade César', prix: 35000, categorie: 'entree' },
      { id: '2', nom: 'Avocat aux crevettes', prix: 45000, categorie: 'entree' },
      { id: '3', nom: 'Poulet Yassa', prix: 65000, categorie: 'plat' },
      { id: '4', nom: 'Poisson Braisé', prix: 75000, categorie: 'plat' },
      { id: '5', nom: 'Riz Gras', prix: 55000, categorie: 'plat' }
    ];

    let menuMessage = `📋 Menu du jour - ${restaurant.nom}\n\n`;
    menuMessage += `🥗 ENTRÉES\n`;
    
    menu.filter(item => item.categorie === 'entree').forEach((item, index) => {
      menuMessage += `${item.id}️⃣ ${item.nom} - ${item.prix.toLocaleString('fr-FR')} GNF\n`;
    });
    
    menuMessage += `\n🍖 PLATS PRINCIPAUX\n`;
    menu.filter(item => item.categorie === 'plat').forEach((item, index) => {
      menuMessage += `${item.id}️⃣ ${item.nom} - ${item.prix.toLocaleString('fr-FR')} GNF\n`;
    });

    menuMessage += `\nTapez 'suivant' pour desserts et boissons\n`;
    menuMessage += `\n💡 Pour commander: envoyez les numéros\n`;
    menuMessage += `Ex: 1,3,3 = 1× entrée n°1 + 2× plats n°3`;

    await this.messageService.sendTextMessage(phoneNumber, menuMessage);
    
    session.updateContext({ 
      menu: menu.slice(0, 5),
      menuPage: 1 
    });
    session.updateState('VIEWING_MENU');
  }

  private async handleInvalidChoice(phoneNumber: string): Promise<void> {
    const errorMessage = `❓ Choix non reconnu.

🍽️ Répondez avec:
• 1️⃣ pour les restaurants proches
• 2️⃣ pour tous les restaurants
• ⭐ pour votre favori (si configuré)

Ou tapez "annuler" pour quitter.`;

    await this.messageService.sendTextMessage(phoneNumber, errorMessage);
  }

  private isValidChoice(content: string): boolean {
    const validChoices = ['1', '2', '⭐', 'favori', 'suivant'];
    return validChoices.includes(content.trim().toLowerCase());
  }
}