/**
 * 🍽️ Bot Restaurant Simple - Version simplifiée
 * Architecture plate sans complexité inutile
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const SEARCH_RADIUS_KM = 5;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const greenApiInstanceId = Deno.env.get('GREEN_API_INSTANCE_ID')!;
const greenApiToken = Deno.env.get('GREEN_API_TOKEN')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Interface simple pour les webhooks
interface WebhookData {
  typeWebhook: string;
  senderData?: {
    chatId: string;
    sender: string;
    senderName: string;
  };
  messageData?: {
    typeMessage: string;
    textMessageData?: {
      textMessage: string;
    };
    locationMessageData?: {
      latitude: number;
      longitude: number;
    };
  };
  instanceData: {
    idInstance: string;
    wid: string;
    typeInstance: string;
  };
  timestamp: number;
  idMessage?: string;
}

// Service WhatsApp simplifié
class SimpleWhatsApp {
  private baseUrl = `https://api.green-api.com/waInstance${greenApiInstanceId}`;

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage/${greenApiToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: `${phoneNumber}@c.us`,
          message: message
        })
      });

      const result = await response.json();
      console.log('📤 Message envoyé:', response.ok);
      return response.ok && result.idMessage;
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      return false;
    }
  }
}

// Gestion des sessions simplifiée
class SimpleSession {
  static async get(phoneNumber: string) {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('phone_whatsapp', phoneNumber)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  static async create(phoneNumber: string, state = 'INITIAL') {
    const { data } = await supabase
      .from('sessions')
      .insert({
        id: crypto.randomUUID(),
        phone_whatsapp: phoneNumber,
        state: state,
        context: {},
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    return data;
  }

  static async update(sessionId: string, updates: any) {
    const { data } = await supabase
      .from('sessions')
      .update({
        ...updates,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    return data;
  }

  static async deleteAllForPhone(phoneNumber: string) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('phone_whatsapp', phoneNumber);

    if (error) {
      console.error('Erreur suppression sessions:', error);
    } else {
      console.log('🗑️ Anciennes sessions supprimées pour:', phoneNumber);
    }
  }
}

// Gestion des clients simplifiée
class SimpleClient {
  static async findOrCreate(phoneNumber: string) {
    try {
      // Chercher client existant
      let { data: client, error: findError } = await supabase
        .from('clients')
        .select('*')
        .eq('phone_whatsapp', phoneNumber)
        .single();

      // Si client trouvé
      if (client && !findError) {
        console.log('👤 Client existant:', client.id);
        return client;
      }

      // Créer nouveau client
      console.log('👤 Création nouveau client pour:', phoneNumber);
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          id: crypto.randomUUID(),
          phone_whatsapp: phoneNumber,
          nom: `Client ${phoneNumber}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erreur création client:', createError);
        return null;
      }

      console.log('✅ Nouveau client créé:', newClient.id);
      return newClient;

    } catch (error) {
      console.error('❌ Erreur dans findOrCreate:', error);
      return null;
    }
  }
}

// Gestion des restaurants simplifiée
class SimpleRestaurant {
  static async getOpenRestaurants() {
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('*')
      .eq('statut', 'ouvert')
      .order('nom');

    return restaurants || [];
  }

  static async getById(id: string) {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    return data;
  }
}

// Handlers simplifiés
const whatsapp = new SimpleWhatsApp();

async function handleAccueil(phoneNumber: string, session: any) {
  console.log('🏠 Gestion accueil pour:', phoneNumber);

  // Créer ou récupérer le client
  const client = await SimpleClient.findOrCreate(phoneNumber);
  if (!client) {
    console.error('❌ Impossible de créer/trouver le client');
    await whatsapp.sendMessage(phoneNumber, 
      '❌ Erreur de connexion à la base de données. Veuillez réessayer avec "resto".');
    return;
  }

  // Message d'accueil
  const welcomeMessage = `🍽️ Bienvenue chez Bot Resto Conakry!

Comment souhaitez-vous trouver votre restaurant?

1️⃣ Restos près de vous 📍
2️⃣ Tous les restos 🍴

Répondez avec le numéro de votre choix.

💡 Tapez "annuler" à tout moment pour arrêter votre commande.`;

  await whatsapp.sendMessage(phoneNumber, welcomeMessage);
  
  // Mettre à jour la session
  await SimpleSession.update(session.id, {
    state: 'CHOOSING_RESTAURANT',
    context: { clientId: client.id }
  });

  console.log('✅ Menu d\'accueil envoyé');
}

// Fonction pour calculer la distance entre deux points GPS (formule Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
}

async function handleLocationMessage(phoneNumber: string, session: any, message: string) {
  if (message === '2') {
    await handleAllRestaurants(phoneNumber, session);
  } else {
    // Extraire les coordonnées GPS si disponibles
    if (message && message.startsWith('GPS:')) {
      const coords = message.replace('GPS:', '').split(',');
      if (coords.length === 2) {
        const latitude = parseFloat(coords[0]);
        const longitude = parseFloat(coords[1]);
        
        // Sauvegarder les coordonnées dans la session
        await SimpleSession.update(session.id, {
          context: {
            ...session.context,
            userLatitude: latitude,
            userLongitude: longitude
          }
        });
        
        // Afficher les restaurants dans un rayon de 5km
        await handleNearbyRestaurants(phoneNumber, session, latitude, longitude);
        return;
      }
    }
    
    // Si pas de coordonnées valides, afficher tous les restaurants
    await handleAllRestaurants(phoneNumber, session);
  }
}

async function handleRestaurantChoice(phoneNumber: string, session: any, choice: string) {
  console.log('🍴 Choix restaurant:', choice);

  switch (choice.trim()) {
    case '1':
      await whatsapp.sendMessage(phoneNumber, 
        `📍 Envoyez votre localisation actuelle pour voir les restaurants proches.

⚠️ IMPORTANT: Attendez AU MOINS 10 SECONDES avant d'envoyer
🎯 Précision souhaitée: < 50m (plus c'est bas, mieux c'est !)
📍 Plus vous patientez → Plus c'est précis → Meilleurs résultats

📱 Étapes: 📎→ Localisation→ ⏱️ Patientez 10s → Envoyer

❌ N'utilisez pas "localisation en direct"

Ou "2" pour tous les restaurants.`);
      
      await SimpleSession.update(session.id, { state: 'WAITING_LOCATION' });
      break;

    case '2':
      await handleAllRestaurants(phoneNumber, session);
      break;

    default:
      await whatsapp.sendMessage(phoneNumber,
        `❓ Choix non reconnu. Répondez avec:
• 1️⃣ pour les restaurants proches
• 2️⃣ pour tous les restaurants`);
  }
}

async function handleNearbyRestaurants(phoneNumber: string, session: any, userLat: number, userLon: number) {
  console.log(`📍 Recherche restaurants dans un rayon de ${SEARCH_RADIUS_KM}km`);

  const restaurants = await SimpleRestaurant.getOpenRestaurants();

  if (restaurants.length === 0) {
    await whatsapp.sendMessage(phoneNumber, 
      '❌ Aucun restaurant ouvert actuellement. Veuillez réessayer plus tard.');
    return;
  }

  // Calculer la distance pour chaque restaurant et filtrer dans un rayon de 5km
  const nearbyRestaurants = restaurants
    .map(resto => ({
      ...resto,
      distance: calculateDistance(userLat, userLon, resto.latitude, resto.longitude)
    }))
    .filter(resto => resto.distance <= SEARCH_RADIUS_KM)
    .sort((a, b) => a.distance - b.distance); // Trier par distance

  if (nearbyRestaurants.length === 0) {
    await whatsapp.sendMessage(phoneNumber, 
      `❌ Aucun restaurant trouvé dans un rayon de ${SEARCH_RADIUS_KM}km.\n\nTapez "2" pour voir tous les restaurants.`);
    return;
  }

  // Afficher les premiers 5 restaurants proches
  const pageSize = 5;
  const firstPage = nearbyRestaurants.slice(0, pageSize);
  
  let message = `*Restaurants proches* (rayon ${SEARCH_RADIUS_KM}km):\n\n`;
  
  firstPage.forEach((resto, index) => {
    const openStatus = isRestaurantOpen(resto);
    let statusText = '';
    let icon = '✅';
    
    if (!resto.horaires) {
      statusText = 'Horaires non disponibles';
      icon = '❓';
    } else {
      const now = new Date();
      const currentDay = now.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
      const dayHours = resto.horaires[currentDay];
      
      if (!dayHours) {
        statusText = 'Horaires non disponibles';
        icon = '❓';
      } else if (openStatus.isOpen) {
        statusText = `Ouvert jusqu'à ${dayHours.fermeture}`;
        icon = '✅';
      } else {
        statusText = `Fermé - Ouvre à ${dayHours.ouverture}`;
        icon = '🔴';
      }
    }
    
    message += `${index + 1}️⃣ **${resto.nom}** ${icon}\n📍 ${resto.distance}km • ${statusText}\n\n`;
  });

  message += '💡 Tapez le numéro pour voir le menu';
  message += '\n📋 Tapez "2" pour voir tous les restaurants';
  
  if (nearbyRestaurants.length > pageSize) {
    message += '\nTapez "suivant" pour plus de restaurants.';
  }

  await whatsapp.sendMessage(phoneNumber, message);
  
  // Sauvegarder dans la session avec les coordonnées GPS explicites
  await SimpleSession.update(session.id, {
    state: 'VIEWING_ALL_RESTOS',
    context: {
      ...session.context,
      restaurants: firstPage.map((r, i) => ({ index: i + 1, id: r.id, nom: r.nom })),
      allRestaurants: nearbyRestaurants,
      currentPage: 1,
      totalPages: Math.ceil(nearbyRestaurants.length / pageSize),
      // S'assurer que les coordonnées GPS sont sauvées
      userLatitude: userLat,
      userLongitude: userLon
    }
  });

  console.log(`✅ ${nearbyRestaurants.length} restaurants proches envoyés`);
}

async function handleAllRestaurants(phoneNumber: string, session: any) {
  console.log('📋 Affichage de tous les restaurants');

  const restaurants = await SimpleRestaurant.getOpenRestaurants();

  // Filtrer les restaurants réellement ouverts (statut + horaires)
  const openRestaurants = restaurants.filter(resto => isRestaurantOpen(resto).isOpen);

  if (openRestaurants.length === 0) {
    await whatsapp.sendMessage(phoneNumber, 
      '❌ Aucun restaurant ouvert actuellement. Veuillez réessayer plus tard.');
    return;
  }

  // Afficher les premiers 5 restaurants
  const pageSize = 5;
  const firstPage = openRestaurants.slice(0, pageSize);
  
  let message = `🍴 Nos restaurants partenaires:\n\n`;
  
  firstPage.forEach((resto, index) => {
    message += `${index + 1}️⃣ ${resto.nom} ✅\n`;
  });

  message += '\nTapez le numéro du restaurant souhaité.';
  
  if (restaurants.length > pageSize) {
    message += '\nTapez "suivant" pour voir plus de restaurants.';
  }

  await whatsapp.sendMessage(phoneNumber, message);
  
  // Sauvegarder dans la session
  await SimpleSession.update(session.id, {
    state: 'VIEWING_ALL_RESTOS',
    context: {
      ...session.context,
      restaurants: firstPage.map((r, i) => ({ index: i + 1, id: r.id, nom: r.nom })),
      allRestaurants: openRestaurants,
      currentPage: 1,
      totalPages: Math.ceil(openRestaurants.length / pageSize)
    }
  });

  console.log('✅ Liste restaurants envoyée');
}

async function handleRestaurantSelection(phoneNumber: string, session: any, selection: string) {
  console.log('🎯 Sélection restaurant:', selection);

  const choice = parseInt(selection.trim());
  const restaurants = session.context.restaurants || [];
  
  if (choice >= 1 && choice <= restaurants.length) {
    const selectedRestaurant = restaurants[choice - 1];
    
    // Récupérer les détails complets du restaurant pour vérifier son statut
    const { data: fullRestaurant } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', selectedRestaurant.id)
      .single();

    if (!fullRestaurant) {
      await whatsapp.sendMessage(phoneNumber, 
        '❌ Erreur: restaurant non trouvé. Tapez "resto" pour recommencer.');
      return;
    }

    // Vérifier si le restaurant est ouvert
    const openStatus = isRestaurantOpen(fullRestaurant);
    if (!openStatus.isOpen) {
      let errorMessage = '';
      
      if (openStatus.reason === 'status_closed') {
        errorMessage = `❌ Désolé, ${fullRestaurant.nom} est actuellement fermé.

🕐 Horaires d'ouverture:`;
        
        // Afficher les horaires
        const horaires = fullRestaurant.horaires;
        for (const [jour, heures] of Object.entries(horaires)) {
          errorMessage += `\n${jour.charAt(0).toUpperCase() + jour.slice(1)}: ${heures.ouverture}-${heures.fermeture}`;
        }
        
        errorMessage += '\n\nTapez "resto" pour voir d\'autres restaurants ouverts.';
      } else {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('fr-FR', { hour12: false, hour: '2-digit', minute: '2-digit' });
        
        errorMessage = `❌ ${fullRestaurant.nom} est fermé en ce moment.

⏰ Il est actuellement: ${currentTime}`;
        
        if (openStatus.nextOpenTime) {
          errorMessage += `\n🕐 Réouverture: ${openStatus.nextOpenTime}`;
        }
        
        errorMessage += '\n\nTapez "resto" pour voir d\'autres restaurants ouverts.';
      }
      
      await whatsapp.sendMessage(phoneNumber, errorMessage);
      return;
    }
    
    await whatsapp.sendMessage(phoneNumber,
      `✅ Restaurant sélectionné: ${selectedRestaurant.nom}
      
🔄 Chargement du menu...`);

    // Mettre à jour la session
    const updatedSession = await SimpleSession.update(session.id, {
      state: 'VIEWING_MENU',
      context: {
        ...session.context,
        selectedRestaurantId: selectedRestaurant.id,
        selectedRestaurantName: selectedRestaurant.nom
      }
    });
    
    console.log('✅ Session mise à jour avec restaurant ID:', selectedRestaurant.id);

    // Afficher le menu directement avec la session mise à jour
    await showSimpleMenu(phoneNumber, fullRestaurant, updatedSession);

  } else {
    await whatsapp.sendMessage(phoneNumber, 
      `❓ Numéro invalide. Choisissez entre 1 et ${restaurants.length}.`);
  }
}

async function showSimpleMenu(phoneNumber: string, restaurant: any, session: any) {
  // Récupérer le vrai menu depuis la base de données avec un ordre déterministe
  const { data: menuItems } = await supabase
    .from('menus')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('disponible', true)
    .order('categorie')
    .order('ordre_affichage')
    .order('id'); // Ajout d'un tri par ID pour garantir l'ordre déterministe

  let menuMessage = `📋 Menu du jour - ${restaurant.nom}\n\n`;
  let orderedMenu = [];
  
  if (menuItems && menuItems.length > 0) {
    const categories = ['entree', 'plat', 'dessert', 'boisson', 'accompagnement'];
    const categoryEmojis: Record<string, string> = {
      'entree': '🥗 ENTRÉES',
      'plat': '🍖 PLATS PRINCIPAUX',
      'dessert': '🍰 DESSERTS',
      'boisson': '🥤 BOISSONS',
      'accompagnement': '🍟 ACCOMPAGNEMENTS'
    };

    let itemIndex = 1;
    
    for (const category of categories) {
      const categoryItems = menuItems.filter(item => item.categorie === category);
      
      if (categoryItems.length > 0) {
        menuMessage += `${categoryEmojis[category]}\n`;
        
        for (const item of categoryItems) {
          const formattedPrice = new Intl.NumberFormat('fr-GN').format(item.prix);
          const displayNumber = itemIndex <= 9 ? `${itemIndex}️⃣` : `(${itemIndex})`;
          menuMessage += `${displayNumber} ${item.nom_plat} - ${formattedPrice} GNF\n`;
          
          // Stocker l'ordre exact pour la commande
          orderedMenu.push({
            index: itemIndex,
            item: item
          });
          
          itemIndex++;
        }
        menuMessage += '\n';
      }
    }
  } else {
    // Menu de fallback si pas de données en BDD
    menuMessage += `🥗 ENTRÉES
1️⃣ Salade César - 35,000 GNF
2️⃣ Avocat aux crevettes - 45,000 GNF

🍖 PLATS PRINCIPAUX  
3️⃣ Poulet Yassa - 65,000 GNF
4️⃣ Poisson Braisé - 75,000 GNF
5️⃣ Riz Gras - 55,000 GNF

`;
  }

  menuMessage += `💡 Pour commander: envoyez les numéros
Ex: 1,3,3 = 1× article n°1 + 2× article n°3

Ou tapez "retour" pour changer de restaurant.
❌ Tapez "annuler" pour arrêter votre commande.`;

  // IMPORTANT: Sauvegarder l'ordre du menu AVANT d'envoyer le message
  // pour éviter que le client réponde avant que le menu soit sauvegardé
  await SimpleSession.update(session.id, {
    state: 'VIEWING_MENU',
    context: {
      ...session.context,
      menuOrder: orderedMenu,
      selectedRestaurantId: restaurant.id,  // S'assurer que l'ID reste présent
      selectedRestaurantName: restaurant.nom
    }
  });
  
  console.log('📋 Menu ordre sauvegardé:', orderedMenu.length, 'items');
  
  // Envoyer le message APRÈS avoir sauvegardé le menu
  await whatsapp.sendMessage(phoneNumber, menuMessage);
  
  console.log('✅ Menu affiché et session mise à jour');
}

// Fonction pour analyser une commande au format "1,2,3,3"
function parseOrderCommand(command: string): number[] {
  const numbers = command.split(',')
    .map(n => parseInt(n.trim()))
    .filter(n => !isNaN(n) && n > 0);
  
  return numbers;
}

// Fonction pour traiter une commande
async function handleOrderCommand(phoneNumber: string, session: any, command: string) {
  console.log('🛒 Traitement commande:', command);

  const orderNumbers = parseOrderCommand(command);
  
  if (orderNumbers.length === 0) {
    await whatsapp.sendMessage(phoneNumber, 
      '❓ Format de commande invalide. Utilisez des numéros séparés par des virgules.\nEx: 1,2,3');
    return;
  }

  // Utiliser l'ordre du menu sauvegardé dans la session
  const menuOrder = session.context.menuOrder || [];
  
  if (menuOrder.length === 0) {
    await whatsapp.sendMessage(phoneNumber, 
      '❌ Erreur: menu non disponible. Tapez "resto" pour recommencer.');
    return;
  }

  // Créer un objet pour compter les quantités
  const cart: Record<string, { item: any; quantity: number; displayNumber: number }> = {};

  // Traiter chaque numéro de la commande en utilisant l'ordre sauvegardé
  for (const itemNumber of orderNumbers) {
    if (itemNumber <= menuOrder.length) {
      const menuEntry = menuOrder.find((entry: any) => entry.index === itemNumber);
      
      if (menuEntry) {
        const menuItem = menuEntry.item;
        
        // Utiliser l'ID de l'item comme clé pour éviter les conflits
        const itemKey = `${itemNumber}_${menuItem.id}`;
        
        if (cart[itemKey]) {
          cart[itemKey].quantity++;
        } else {
          cart[itemKey] = {
            item: menuItem,
            quantity: 1,
            displayNumber: itemNumber
          };
        }
      }
    }
  }

  // Vérifier si tous les numéros sont valides
  const invalidNumbers = orderNumbers.filter(num => num > menuOrder.length);
  if (invalidNumbers.length > 0) {
    await whatsapp.sendMessage(phoneNumber, 
      `❌ Numéro(s) invalide(s): ${invalidNumbers.join(', ')}\nLe menu contient ${menuOrder.length} articles.`);
    return;
  }

  // Calculer le total
  let subtotal = 0;
  let cartMessage = '🛒 Votre panier:\n\n';

  for (const [itemKey, cartItem] of Object.entries(cart)) {
    const itemTotal = cartItem.item.prix * cartItem.quantity;
    subtotal += itemTotal;
    
    const formattedPrice = new Intl.NumberFormat('fr-GN').format(itemTotal);
    cartMessage += `• ${cartItem.quantity}× ${cartItem.item.nom_plat} - ${formattedPrice} GNF\n`;
  }

  const formattedSubtotal = new Intl.NumberFormat('fr-GN').format(subtotal);
  cartMessage += `\n────────────────────\n💰 Sous-total: ${formattedSubtotal} GNF\n\n✅ Confirmer cette commande? (OUI/NON)`;

  await whatsapp.sendMessage(phoneNumber, cartMessage);

  // Mettre à jour la session avec le panier
  await SimpleSession.update(session.id, {
    state: 'CONFIRMING_ORDER',
    context: {
      ...session.context,
      cart: cart,
      subtotal: subtotal
    }
  });

  console.log('✅ Récapitulatif panier envoyé');
}

// Fonction pour confirmer ou refuser la commande
async function handleOrderConfirmation(phoneNumber: string, session: any, response: string) {
  console.log('✅ Confirmation commande:', response);

  const normalizedResponse = response.toLowerCase().trim();

  if (normalizedResponse === 'oui' || normalizedResponse === 'o' || normalizedResponse === 'yes') {
    // Commande confirmée, passer au choix du mode
    await handleModeSelection(phoneNumber, session);
  } else if (normalizedResponse === 'non' || normalizedResponse === 'n' || normalizedResponse === 'no') {
    // Proposer les options de modification
    const modifyMessage = `Que souhaitez-vous faire?\n\n1️⃣ Supprimer un article\n2️⃣ Ajouter d'autres articles\n3️⃣ Tout annuler et recommencer\n\nRépondez avec votre choix.`;
    
    await whatsapp.sendMessage(phoneNumber, modifyMessage);
    
    await SimpleSession.update(session.id, {
      state: 'MODIFYING_ORDER',
      context: session.context
    });
  } else {
    await whatsapp.sendMessage(phoneNumber, 
      '❓ Répondez par OUI pour confirmer ou NON pour modifier votre commande.');
  }
}

// Fonction pour gérer les modifications de commande
async function handleOrderModification(phoneNumber: string, session: any, choice: string) {
  console.log('🔧 Modification commande:', choice);

  switch (choice.trim()) {
    case '1':
      // Supprimer un article
      await showCartItemsForRemoval(phoneNumber, session);
      break;
    
    case '2':
      // Ajouter d'autres articles - revenir au menu
      const restaurant = await SimpleRestaurant.getById(session.context.selectedRestaurantId);
      await showSimpleMenu(phoneNumber, restaurant, session);
      break;
    
    case '3':
      // Tout annuler
      await SimpleSession.deleteAllForPhone(phoneNumber);
      const newSession = await SimpleSession.create(phoneNumber, 'INITIAL');
      await handleAccueil(phoneNumber, newSession);
      break;
    
    default:
      await whatsapp.sendMessage(phoneNumber,
        '❓ Choix non reconnu. Répondez avec:\n1️⃣ Supprimer\n2️⃣ Ajouter\n3️⃣ Annuler');
  }
}

// Fonction pour afficher les articles du panier pour suppression
async function showCartItemsForRemoval(phoneNumber: string, session: any) {
  let message = 'Quel article supprimer?\n\n';
  
  const cart = session.context.cart || {};
  const cartEntries = Object.entries(cart);
  
  cartEntries.forEach(([itemKey, cartItem]: [string, any], index) => {
    message += `${index + 1}️⃣ ${cartItem.item.nom_plat} (${cartItem.quantity}×)\n`;
  });
  
  message += '\nTapez le numéro de l\'article à retirer.';
  
  await whatsapp.sendMessage(phoneNumber, message);
  
  await SimpleSession.update(session.id, {
    state: 'REMOVING_ITEM',
    context: session.context
  });
}

// Fonction pour gérer la sélection du mode
async function handleModeSelection(phoneNumber: string, session: any) {
  console.log('📦 Sélection du mode');

  const modeMessage = `📦 Comment souhaitez-vous récupérer votre commande?\n\n1️⃣ Sur place 🍽️ (manger au restaurant)\n2️⃣ À emporter 📦 (récupérer et partir)\n3️⃣ Livraison 🏠 (nous vous livrons)\n\nRépondez avec le numéro de votre choix.`;

  await whatsapp.sendMessage(phoneNumber, modeMessage);

  await SimpleSession.update(session.id, {
    state: 'CHOOSING_MODE',
    context: session.context
  });

  console.log('✅ Options de mode envoyées');
}

// Fonction pour traiter le choix du mode
async function handleModeChoice(phoneNumber: string, session: any, choice: string) {
  console.log('📦 Choix du mode:', choice);

  switch (choice.trim()) {
    case '1':
      // Sur place
      await handleSurPlaceMode(phoneNumber, session);
      break;
    
    case '2':
      // À emporter
      await handleEmporterMode(phoneNumber, session);
      break;
    
    case '3':
      // Livraison
      await handleLivraisonMode(phoneNumber, session);
      break;
    
    default:
      await whatsapp.sendMessage(phoneNumber,
        '❓ Choix non reconnu. Répondez avec:\n1️⃣ Sur place\n2️⃣ À emporter\n3️⃣ Livraison');
  }
}

// Fonction pour le mode sur place
async function handleSurPlaceMode(phoneNumber: string, session: any) {
  const message = `🍽️ Mode: SUR PLACE

Votre commande sera préparée pour être consommée au restaurant.

💰 Récapitulatif final:
${await formatFinalSummary(session, 'sur_place')}

Quand souhaitez-vous payer?

1️⃣ Maintenant (paiement mobile)
2️⃣ À la fin du repas (au restaurant)

Répondez avec votre choix.`;

  await whatsapp.sendMessage(phoneNumber, message);

  await SimpleSession.update(session.id, {
    state: 'CHOOSING_PAYMENT_TIMING',
    context: {
      ...session.context,
      mode: 'sur_place',
      frais_livraison: 0
    }
  });
}

// Fonction pour le mode à emporter
async function handleEmporterMode(phoneNumber: string, session: any) {
  const message = `📦 Mode: À EMPORTER

Votre commande sera préparée pour récupération.
⏱️ Temps de préparation estimé: 15-25 minutes

💰 Récapitulatif final:
${await formatFinalSummary(session, 'emporter')}

Quand souhaitez-vous payer?

1️⃣ Maintenant (paiement mobile)
2️⃣ À la récupération (au restaurant)

Répondez avec votre choix.`;

  await whatsapp.sendMessage(phoneNumber, message);

  await SimpleSession.update(session.id, {
    state: 'CHOOSING_PAYMENT_TIMING',
    context: {
      ...session.context,
      mode: 'emporter',
      frais_livraison: 0
    }
  });
}

// Fonction pour le mode livraison
async function handleLivraisonMode(phoneNumber: string, session: any) {
  // Debug: Vérifier le contenu de la session
  console.log('🔍 Debug session context:', JSON.stringify(session.context, null, 2));
  console.log('🔍 userLatitude:', session.context?.userLatitude);
  console.log('🔍 userLongitude:', session.context?.userLongitude);
  
  // Vérifier si les coordonnées GPS sont déjà en session
  if (session.context?.userLatitude && session.context?.userLongitude) {
    console.log('📍 Coordonnées GPS déjà disponibles, calcul direct des frais');
    // Utiliser les coordonnées existantes pour calculer les frais
    await calculateDeliveryFeeWithCoords(phoneNumber, session, 
      session.context.userLatitude, session.context.userLongitude);
  } else {
    console.log('❌ Coordonnées GPS manquantes, demande de géolocalisation');
    // Demander la position seulement si pas déjà stockée
    const message = `🏠 Mode: LIVRAISON

Pour calculer les frais de livraison, nous avons besoin de votre adresse.

📍 Partagez votre position WhatsApp ou tapez votre adresse complète.

Cliquez sur 📎 → Position → Position actuelle`;

    await whatsapp.sendMessage(phoneNumber, message);

    await SimpleSession.update(session.id, {
      state: 'WAITING_DELIVERY_ADDRESS',
      context: {
        ...session.context,
        mode: 'livraison'
      }
    });
  }
}

// Fonction pour calculer les frais de livraison avec coordonnées existantes
async function calculateDeliveryFeeWithCoords(phoneNumber: string, session: any, latitude: number, longitude: number) {
  const restaurantId = session.context.selectedRestaurantId;
  
  // Récupérer les détails du restaurant
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();

  if (!restaurant) {
    await whatsapp.sendMessage(phoneNumber, '❌ Erreur: restaurant non trouvé.');
    return;
  }

  // Calculer la distance
  const distance = calculateDistance(latitude, longitude, restaurant.latitude, restaurant.longitude);
  
  // Calculer les frais de livraison
  let fraisLivraison = 0;
  const subtotal = session.context.subtotal || 0;
  
  if (distance <= restaurant.rayon_livraison_km) {
    if (subtotal >= restaurant.seuil_gratuite) {
      fraisLivraison = 0; // Livraison gratuite
    } else {
      fraisLivraison = Math.ceil(distance) * restaurant.tarif_km;
    }
  } else {
    await whatsapp.sendMessage(phoneNumber, 
      `❌ Désolé, nous ne livrons pas à ${distance.toFixed(1)}km de distance.\n\n` +
      `Notre zone de livraison maximale est de ${restaurant.rayon_livraison_km}km.\n\n` +
      'Tapez "2" pour choisir le mode "À emporter".');
    return;
  }

  const total = subtotal + fraisLivraison;
  
  // Sauvegarder les données de livraison
  await SimpleSession.update(session.id, {
    state: 'CHOOSING_PAYMENT_TIMING',
    context: {
      ...session.context,
      mode: 'livraison',
      deliveryFee: fraisLivraison,
      frais_livraison: fraisLivraison,
      total: total,
      distance: distance,
      deliveryAddress: `GPS: ${latitude}, ${longitude}`
    }
  });

  // Afficher le récapitulatif avec frais de livraison
  let message = `🏠 Mode: LIVRAISON
📍 Distance: ${distance.toFixed(1)}km

💰 Récapitulatif final:
${await formatFinalSummary({ context: { ...session.context, frais_livraison: fraisLivraison, total: total } }, 'livraison')}

Quand souhaitez-vous payer?

1️⃣ Maintenant (paiement mobile)
2️⃣ À la livraison (cash)

Répondez avec votre choix.`;

  await whatsapp.sendMessage(phoneNumber, message);
}

// Fonction pour gérer l'adresse de livraison
async function handleDeliveryAddress(phoneNumber: string, session: any, message: string) {
  // Vérifier si c'est des coordonnées GPS
  if (message.startsWith('GPS:')) {
    const coords = message.replace('GPS:', '').split(',');
    if (coords.length === 2) {
      const latitude = parseFloat(coords[0]);
      const longitude = parseFloat(coords[1]);
      await calculateDeliveryFeeWithCoords(phoneNumber, session, latitude, longitude);
    } else {
      await whatsapp.sendMessage(phoneNumber, 
        '❌ Coordonnées GPS non valides.\n\nVeuillez partager votre position ou tapez votre adresse.');
    }
  } else {
    // Adresse textuelle - pour l'instant on demande la position GPS
    await whatsapp.sendMessage(phoneNumber, 
      '📍 Pour un calcul précis des frais de livraison, veuillez partager votre position GPS.\n\n' +
      'Cliquez sur 📎 → Position → Position actuelle');
  }
}

// Fonction utilitaire pour formater le récapitulatif final
async function formatFinalSummary(session: any, mode: string): Promise<string> {
  const cart = session.context.cart || {};
  let summary = '';
  
  for (const [itemKey, cartItem] of Object.entries(cart) as [string, any][]) {
    const itemTotal = cartItem.item.prix * cartItem.quantity;
    const formattedPrice = new Intl.NumberFormat('fr-GN').format(itemTotal);
    summary += `• ${cartItem.quantity}× ${cartItem.item.nom_plat} - ${formattedPrice} GNF\n`;
  }
  
  const subtotal = session.context.subtotal || 0;
  const fraisLivraison = session.context.frais_livraison || 0;
  const total = subtotal + fraisLivraison;
  
  const formattedSubtotal = new Intl.NumberFormat('fr-GN').format(subtotal);
  const formattedTotal = new Intl.NumberFormat('fr-GN').format(total);
  
  summary += `\n────────────────────`;
  summary += `\n💰 Sous-total: ${formattedSubtotal} GNF`;
  
  if (fraisLivraison > 0) {
    const formattedFrais = new Intl.NumberFormat('fr-GN').format(fraisLivraison);
    summary += `\n🚛 Frais livraison: ${formattedFrais} GNF`;
  }
  
  summary += `\n💳 TOTAL: ${formattedTotal} GNF`;
  
  return summary;
}

// Fonction utilitaire pour vérifier si un restaurant est ouvert
function isRestaurantOpen(restaurant: any): {
  isOpen: boolean,
  reason: 'status_closed' | 'outside_hours' | 'open',
  nextOpenTime?: string
} {
  // Vérifier le statut du restaurant
  if (restaurant.statut !== 'ouvert') {
    return {
      isOpen: false,
      reason: 'status_closed'
    };
  }

  // Vérifier les horaires d'ouverture
  const now = new Date();
  const currentDay = now.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toLocaleTimeString('fr-FR', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
  const horaires = restaurant.horaires;
  if (!horaires || !horaires[currentDay]) {
    return {
      isOpen: false,
      reason: 'outside_hours'
    };
  }

  const dayHours = horaires[currentDay];
  const openTime = dayHours.ouverture;
  const closeTime = dayHours.fermeture;

  // Comparer les heures
  if (currentTime >= openTime && currentTime <= closeTime) {
    return {
      isOpen: true,
      reason: 'open'
    };
  } else {
    // Calculer la prochaine heure d'ouverture
    let nextOpenTime = openTime;
    if (currentTime > closeTime) {
      // Restaurant fermé pour aujourd'hui, chercher demain
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDay = tomorrow.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
      if (horaires[tomorrowDay]) {
        nextOpenTime = `Demain ${horaires[tomorrowDay].ouverture}`;
      }
    } else {
      nextOpenTime = `Aujourd'hui ${openTime}`;
    }

    return {
      isOpen: false,
      reason: 'outside_hours',
      nextOpenTime
    };
  }
}

// Fonction pour gérer le timing de paiement
async function handlePaymentTiming(phoneNumber: string, session: any, choice: string) {
  console.log('💰 Timing de paiement:', choice);

  switch (choice.trim()) {
    case '1':
      // Paiement maintenant
      await handlePaymentNow(phoneNumber, session);
      break;
    
    case '2':
      // Paiement plus tard
      await handlePaymentLater(phoneNumber, session);
      break;
    
    default:
      await whatsapp.sendMessage(phoneNumber,
        '❓ Choix non reconnu. Répondez avec:\n1️⃣ Maintenant\n2️⃣ Plus tard');
  }
}

// Fonction pour le paiement immédiat
async function handlePaymentNow(phoneNumber: string, session: any) {
  const message = `💳 PAIEMENT MOBILE

Choisissez votre méthode de paiement:

1️⃣ Orange Money 🟠
2️⃣ Wave (Moya) 🌊

Répondez avec votre choix.`;

  await whatsapp.sendMessage(phoneNumber, message);

  await SimpleSession.update(session.id, {
    state: 'CHOOSING_PAYMENT_METHOD',
    context: {
      ...session.context,
      paiement_timing: 'maintenant'
    }
  });
}

// Fonction pour le paiement différé
async function handlePaymentLater(phoneNumber: string, session: any) {
  // Mapper le mode de livraison vers le bon paiement_mode
  const mode = session.context.mode;
  let paiementMode: string;
  
  switch (mode) {
    case 'sur_place':
      paiementMode = 'fin_repas';
      break;
    case 'a_emporter':
      paiementMode = 'recuperation';
      break;
    case 'livraison':
      paiementMode = 'livraison';
      break;
    default:
      paiementMode = 'fin_repas'; // Par défaut
  }
  
  // Créer la commande en base de données
  const commandeId = await createOrder(phoneNumber, session, paiementMode);
  
  if (commandeId) {
    // Sauvegarder l'ID de commande dans la session pour pouvoir l'annuler si besoin
    await SimpleSession.update(session.id, {
      state: 'ORDER_CONFIRMED',
      context: {
        ...session.context,
        orderId: commandeId
      }
    });
    
    const mode = session.context.mode;
    const modeText = mode === 'sur_place' ? '🍽️ au restaurant' : 
                     mode === 'emporter' ? '📦 à la récupération' : 
                     '🏠 à la livraison';

    const message = `🎊 Parfait ! Votre commande est confirmée !

📝 Commande N°: ${commandeId}
🏪 Restaurant: ${session.context.selectedRestaurantName}
💵 Règlement: ${modeText}

👨‍🍳 NOS CHEFS SE METTENT AU TRAVAIL !

📱 Nous vous appelons très bientôt pour confirmer
⏱️ Temps de préparation estimé: 15-25 minutes
🍽️ Préparez-vous à vous régaler !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🙏 Merci de votre confiance, Bot Resto Conakry !

🔄 Pour recommander, tapez simplement "resto"
❌ Pour annuler cette commande, tapez "annuler"`;

    await whatsapp.sendMessage(phoneNumber, message);

    // NE PAS nettoyer la session ! Garder l'état ORDER_CONFIRMED 
    // pour permettre l'annulation de la commande créée
    console.log('✅ Commande créée avec paiement différé, session conservée avec orderId:', commandeId);
  } else {
    await whatsapp.sendMessage(phoneNumber, 
      '❌ Erreur lors de la création de la commande. Veuillez réessayer avec "resto".');
  }
}

// Fonction utilitaire pour créer une commande en base de données
async function createOrder(phoneNumber: string, session: any, paymentTiming: string): Promise<string | null> {
  try {
    console.log('🔍 Debug createOrder - session.context:', JSON.stringify(session.context, null, 2));
    
    const cart = session.context.cart || {};
    const items = Object.entries(cart).map(([itemKey, cartItem]: [string, any]) => ({
      menu_id: cartItem.item.id,
      nom_plat: cartItem.item.nom_plat,
      prix_unitaire: cartItem.item.prix,
      quantite: cartItem.quantity,
      sous_total: cartItem.item.prix * cartItem.quantity
    }));

    const subtotal = session.context.subtotal || 0;
    const fraisLivraison = session.context.frais_livraison || 0;
    const total = subtotal + fraisLivraison;
    const restaurantId = session.context.selectedRestaurantId;

    console.log('🔍 Debug - Restaurant ID:', restaurantId);

    if (!restaurantId) {
      console.error('❌ Restaurant ID manquant dans la session');
      return null;
    }

    // Récupérer le client
    const client = await SimpleClient.findOrCreate(phoneNumber);
    if (!client) {
      console.error('❌ Client introuvable pour créer la commande');
      return null;
    }

    console.log('🔍 Debug - Données commande:', {
      client_id: client.id,
      restaurant_id: restaurantId,
      items_count: items.length,
      total: total,
      mode: session.context.mode,
      adresse_livraison: session.context.deliveryAddress,
      latitude_livraison: session.context.userLatitude,
      longitude_livraison: session.context.userLongitude,
      distance_km: session.context.distance
    });

    const { data: commande, error } = await supabase
      .from('commandes')
      .insert({
        id: crypto.randomUUID(),
        client_id: client.id,
        restaurant_id: restaurantId,
        items: items,
        sous_total: subtotal,
        frais_livraison: fraisLivraison,
        total: total,
        mode: session.context.mode,
        adresse_livraison: session.context.deliveryAddress || null,
        latitude_livraison: session.context.userLatitude || null,
        longitude_livraison: session.context.userLongitude || null,
        distance_km: session.context.distance || null,
        paiement_mode: paymentTiming,
        statut: 'en_attente',
        paiement_statut: paymentTiming === 'maintenant' ? 'en_attente' : 'en_attente',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création commande:', error);
      return null;
    }

    console.log('✅ Commande créée avec succès:', commande.numero_commande);
    return commande.numero_commande;

  } catch (error) {
    console.error('❌ Erreur dans createOrder:', error);
    return null;
  }
}

// Fonction principale de traitement
async function processMessage(phoneNumber: string, message: string) {
  console.log(`📨 Message de ${phoneNumber}: "${message}"`);

  try {
    // Récupérer ou créer une session
    let session = await SimpleSession.get(phoneNumber);
    if (!session) {
      session = await SimpleSession.create(phoneNumber);
    }

    console.log(`📊 État session: ${session.state}`);

    // Gestion de l'annulation à tout moment (sauf si déjà en confirmation d'annulation)
    if ((message.toLowerCase() === 'annuler' || message.toLowerCase() === 'stop') && 
        session.state !== 'CONFIRM_CANCEL') {
      // Ne pas permettre l'annulation si on est au début
      if (session.state === 'INITIAL') {
        await whatsapp.sendMessage(phoneNumber, 
          '❌ Aucune commande en cours à annuler.\n\nTapez "resto" pour commencer une commande.');
        return;
      }
      
      // Passer en mode confirmation d'annulation
      await SimpleSession.update(session.id, {
        state: 'CONFIRM_CANCEL',
        context: { ...session.context, previousState: session.state }
      });
      
      // Message personnalisé selon l'état de la commande
      let confirmMessage = '⚠️ ';
      if (session.context.orderId) {
        confirmMessage += `Voulez-vous vraiment annuler la commande N°${session.context.orderId} ?\n\n`;
      } else if (session.context.cart && Object.keys(session.context.cart).length > 0) {
        confirmMessage += `Voulez-vous vraiment annuler votre panier en cours ?\n\n`;
      } else {
        confirmMessage += `Voulez-vous vraiment annuler votre sélection en cours ?\n\n`;
      }
      confirmMessage += '✅ Tapez "oui" pour confirmer l\'annulation\n' +
                       '❌ Tapez "non" pour continuer';
      
      await whatsapp.sendMessage(phoneNumber, confirmMessage);
      return;
    }

    // Gérer la confirmation d'annulation
    if (session.state === 'CONFIRM_CANCEL') {
      const response = message.toLowerCase();
      
      if (response === 'oui' || response === 'o' || response === 'yes') {
        // Vérifier si une commande existe et la mettre à jour
        const orderId = session.context.orderId;
        let cancelMessage = '';
        
        if (orderId) {
          // Mettre à jour le statut de la commande en base de données
          const { error } = await supabase
            .from('commandes')
            .update({
              statut: 'annulee',
              cancelled_at: new Date().toISOString()
            })
            .eq('numero_commande', orderId);
          
          if (!error) {
            cancelMessage = `❌ Commande N°${orderId} annulée avec succès.\n\n`;
            console.log(`✅ Commande ${orderId} marquée comme annulée en base`);
          } else {
            console.error('⚠️ Erreur lors de la mise à jour du statut:', error);
            cancelMessage = '❌ Commande annulée.\n\n';
          }
        } else {
          // Pas de commande créée, juste annulation du processus
          cancelMessage = '❌ Processus de commande annulé.\n\n';
        }
        
        // Annuler définitivement et nettoyer la session
        await SimpleSession.deleteAllForPhone(phoneNumber);
        await whatsapp.sendMessage(phoneNumber, 
          cancelMessage + '🔄 Tapez "resto" pour commencer une nouvelle commande.');
        return;
      } else if (response === 'non' || response === 'n' || response === 'no') {
        // Reprendre là où on était
        const previousState = session.context.previousState;
        await SimpleSession.update(session.id, {
          state: previousState,
          context: { ...session.context, previousState: undefined }
        });
        
        await whatsapp.sendMessage(phoneNumber, 
          '✅ Parfait ! Continuons votre commande.\n\n' +
          '💡 Où en étions-nous ? Veuillez reprendre votre sélection.');
        
        // Réafficher le contexte approprié selon l'état
        session.state = previousState;
        // Le flow continuera normalement ci-dessous
      } else {
        await whatsapp.sendMessage(phoneNumber, 
          '❓ Réponse non reconnue.\n\n' +
          'Tapez "oui" pour annuler ou "non" pour continuer.');
        return;
      }
    }

    // Vérifier si l'utilisateur veut redémarrer depuis n'importe quel état
    const restartKeywords = ['resto', 'restaurant', 'menu', 'accueil', 'start', 'restart', 'retour'];
    if (restartKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      console.log('🔄 Redémarrage demandé, réinitialisation complète de la session');
      
      // Supprimer toutes les anciennes sessions et créer une nouvelle
      await SimpleSession.deleteAllForPhone(phoneNumber);
      session = await SimpleSession.create(phoneNumber, 'INITIAL');
      console.log('✅ Nouvelle session créée:', session.id);
      
      await handleAccueil(phoneNumber, session);
      return;
    }

    // Router selon l'état
    switch (session.state) {
      case 'INITIAL':
        const initKeywords = ['commander', 'bonjour', 'salut', 'hi'];
        if (initKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
          await handleAccueil(phoneNumber, session);
        } else {
          await whatsapp.sendMessage(phoneNumber, 
            '👋 Salut! Tapez "resto" pour voir nos restaurants.');
        }
        break;

      case 'CHOOSING_RESTAURANT':
        await handleRestaurantChoice(phoneNumber, session, message);
        break;

      case 'WAITING_LOCATION':
        await handleLocationMessage(phoneNumber, session, message);
        break;

      case 'VIEWING_ALL_RESTOS':
        if (message.toLowerCase() === 'suivant') {
          await whatsapp.sendMessage(phoneNumber, '🔄 Fonctionnalité "suivant" en cours de développement...');
        } else {
          await handleRestaurantSelection(phoneNumber, session, message);
        }
        break;

      case 'VIEWING_MENU':
        // Vérifier si c'est une commande au format "1,2,3"
        if (message.includes(',') || /^\d+$/.test(message.trim())) {
          await handleOrderCommand(phoneNumber, session, message);
        } else {
          await whatsapp.sendMessage(phoneNumber, 
            '❓ Pour commander, utilisez le format: 1,2,3 (numéros séparés par des virgules)\nOu tapez "retour" pour changer de restaurant.');
        }
        break;

      case 'CONFIRMING_ORDER':
        await handleOrderConfirmation(phoneNumber, session, message);
        break;

      case 'MODIFYING_ORDER':
        await handleOrderModification(phoneNumber, session, message);
        break;

      case 'CHOOSING_MODE':
        await handleModeChoice(phoneNumber, session, message);
        break;

      case 'CHOOSING_PAYMENT_TIMING':
        await handlePaymentTiming(phoneNumber, session, message);
        break;

      case 'WAITING_DELIVERY_ADDRESS':
        await handleDeliveryAddress(phoneNumber, session, message);
        break;

      case 'ORDER_CONFIRMED':
        // La commande est confirmée, le client peut seulement annuler ou recommencer
        await whatsapp.sendMessage(phoneNumber, 
          `✅ Votre commande N°${session.context.orderId} est déjà confirmée.\n\n` +
          '🔄 Tapez "resto" pour une nouvelle commande\n' +
          '❌ Tapez "annuler" pour annuler cette commande');
        break;

      default:
        await whatsapp.sendMessage(phoneNumber, 
          '❓ Session expirée. Tapez "resto" pour recommencer.');
        await SimpleSession.create(phoneNumber);
    }

  } catch (error) {
    console.error('❌ Erreur traitement message:', error);
    await whatsapp.sendMessage(phoneNumber, 
      '❌ Erreur technique. Veuillez réessayer avec "resto".');
  }
}

// Serveur principal
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Health check
    if (req.method === 'GET' && url.pathname.includes('/health')) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: 'simple-1.0.0'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Webhook principal
    if (req.method === 'POST') {
      const webhook: WebhookData = await req.json();
      console.log('📱 Webhook reçu:', webhook.typeWebhook);

      // Traiter les messages entrants
      if (webhook.typeWebhook === 'incomingMessageReceived') {
        const phoneNumber = webhook.senderData?.sender.replace(/@.*/, '') || '';
        
        // Messages texte
        if (webhook.messageData?.typeMessage === 'textMessage') {
          const message = webhook.messageData.textMessageData?.textMessage || '';
          if (phoneNumber && message) {
            await processMessage(phoneNumber, message);
          }
        }
        // Messages de géolocalisation
        else if (webhook.messageData?.typeMessage === 'locationMessage') {
          const locationData = webhook.messageData.locationMessageData;
          
          if (phoneNumber && locationData) {
            // Traiter comme géolocalisation avec coordonnées
            const geoMessage = `GPS:${locationData.latitude},${locationData.longitude}`;
            await processMessage(phoneNumber, geoMessage);
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

console.log('🚀 Bot Restaurant SIMPLE démarré!');
console.log('📊 Version: simple-1.0.0');
console.log('🔗 Green API Instance:', greenApiInstanceId);