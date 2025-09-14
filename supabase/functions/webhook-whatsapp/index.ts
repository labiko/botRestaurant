/**
 * 🍽️ Bot Restaurant Simple - Version simplifiée
 * Architecture plate sans complexité inutile
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const SEARCH_RADIUS_KM = 5;
const PHONE_NUMBER_LENGTH_MIN = 11; // France, Guinée standard
const PHONE_NUMBER_LENGTH_MAX = 12; // Internationaux complets
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

// ÉTAPE 3 : Interface TypeScript pour les catégories de restaurant
interface RestaurantCategory {
  id?: string;
  restaurant_id: string;
  category_key: string;
  category_name: string;
  emoji: string;
  ordre: number;
  active: boolean;
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
    console.log('🔍 Requête restaurants ouverts...');
    
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('statut', 'ouvert')
      .order('nom');

    console.log('📊 Requête résultats:', { 
      count: restaurants?.length || 0, 
      error: error?.message,
      restaurants: restaurants?.map(r => ({ nom: r.nom, statut: r.statut })) 
    });

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

// ✅ NOUVEAU : Fonction de formatage prix avec currency dynamique
function formatPrice(amount: number, currency: string = 'GNF'): string {
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

// ÉTAPE 3 : Nouvelles fonctions (SANS toucher l'existant)

// NOUVELLE fonction - n'affecte pas l'ancien code
async function getRestaurantCategories(restaurantId: string): Promise<RestaurantCategory[]> {
  const { data, error } = await supabase
    .from('restaurant_categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('active', true)
    .order('ordre');
    
  if (error) {
    console.error('Erreur récupération catégories:', error);
    // FALLBACK : Retourner les catégories par défaut (0 régression)
    return getDefaultCategories();
  }
  
  return data || getDefaultCategories();
}

// NOUVELLE fonction de fallback
function getDefaultCategories(): RestaurantCategory[] {
  return [
    { restaurant_id: '', category_key: 'pizza', category_name: 'PIZZAS', emoji: '🍕', ordre: 1, active: true },
    { restaurant_id: '', category_key: 'burger', category_name: 'BURGERS', emoji: '🍔', ordre: 2, active: true },
    { restaurant_id: '', category_key: 'sandwich', category_name: 'SANDWICHS', emoji: '🥪', ordre: 3, active: true },
    { restaurant_id: '', category_key: 'taco', category_name: 'TACOS', emoji: '🌮', ordre: 4, active: true },
    { restaurant_id: '', category_key: 'pates', category_name: 'PÂTES', emoji: '🍝', ordre: 5, active: true },
    { restaurant_id: '', category_key: 'salade', category_name: 'SALADES', emoji: '🥗', ordre: 6, active: true },
    { restaurant_id: '', category_key: 'assiette', category_name: 'ASSIETTES', emoji: '🍽️', ordre: 7, active: true },
    { restaurant_id: '', category_key: 'naan', category_name: 'NAANS', emoji: '🫓', ordre: 8, active: true },
    { restaurant_id: '', category_key: 'accompagnement', category_name: 'ACCOMPAGNEMENTS', emoji: '🍟', ordre: 9, active: true },
    { restaurant_id: '', category_key: 'entree', category_name: 'ENTRÉES', emoji: '🥗', ordre: 10, active: true },
    { restaurant_id: '', category_key: 'dessert', category_name: 'DESSERTS', emoji: '🍰', ordre: 11, active: true },
    { restaurant_id: '', category_key: 'boisson', category_name: 'BOISSONS', emoji: '🥤', ordre: 12, active: true }
  ];
}

// NOUVELLE fonction centralisée pour les emojis (INCLUT les catégories inactives)
async function getCategoryEmojis(restaurantId: string): Promise<Record<string, string>> {
  try {
    // Récupérer TOUTES les catégories (actives ET inactives) pour les emojis
    const { data: allCategories, error } = await supabase
      .from('restaurant_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('ordre');
      
    if (error) throw error;
    
    const emojiMap: Record<string, string> = {};
    
    if (allCategories && allCategories.length > 0) {
      allCategories.forEach(cat => {
        emojiMap[cat.category_key] = `${cat.emoji} ${cat.category_name}`;
      });
      return emojiMap;
    }
    
    // Si pas de catégories personnalisées, fallback vers les défauts
    return getDefaultEmojiMap();
  } catch (error) {
    // FALLBACK AUTOMATIQUE - Pas de régression !
    console.warn('Fallback vers catégories par défaut');
    return getDefaultEmojiMap();
  }
}

// Fonction helper pour le fallback des emojis
function getDefaultEmojiMap(): Record<string, string> {
  return {
    'pizza': '🍕 PIZZAS',
    'burger': '🍔 BURGERS',
    'sandwich': '🥪 SANDWICHS',
    'taco': '🌮 TACOS',
    'pates': '🍝 PÂTES',
    'salade': '🥗 SALADES',
    'assiette': '🍽️ ASSIETTES',
    'naan': '🫓 NAANS',
    'accompagnement': '🍟 ACCOMPAGNEMENTS',
    'entree': '🥗 ENTRÉES',
    'dessert': '🍰 DESSERTS',
    'boisson': '🥤 BOISSONS'
  };
}


// ✅ NOUVEAU : Fonction de détection format téléphone restaurant
function isPhoneNumberFormat(message: string): boolean {
  // Détecte un numéro de téléphone avec plus de 6 chiffres
  const cleanMessage = message.trim();
  const phoneRegex = /^\d{7,}$/; // Au moins 7 chiffres, que des chiffres
  return phoneRegex.test(cleanMessage);
}

// ✅ NOUVEAU : Fonction pour générer le message des modes de livraison disponibles
async function getDeliveryModeMessage(restaurantId: string): Promise<string> {
  const restaurant = await SimpleRestaurant.getById(restaurantId);
  
  if (!restaurant) {
    return "❌ Erreur: restaurant non trouvé. Tapez 'resto' pour recommencer.";
  }
  
  // Vérifier qu'au moins un mode est activé
  if (!restaurant.allow_dine_in && !restaurant.allow_takeaway && !restaurant.allow_delivery) {
    return "❌ Désolé, ce restaurant n'accepte aucune commande pour le moment.\n\n🔄 Tapez 'resto' pour choisir un autre restaurant.";
  }
  
  let message = "📦 Comment souhaitez-vous récupérer votre commande?\n\n";
  let options: string[] = [];
  let optionNumber = 1;
  
  if (restaurant.allow_dine_in) {
    options.push(`${optionNumber}️⃣ Sur place 🍽️ (manger au restaurant)`);
    optionNumber++;
  }
  
  if (restaurant.allow_takeaway) {
    options.push(`${optionNumber}️⃣ À emporter 📦 (récupérer et partir)`);
    optionNumber++;
  }
  
  if (restaurant.allow_delivery) {
    options.push(`${optionNumber}️⃣ Livraison 🏠 (nous vous livrons)`);
    optionNumber++;
  }
  
  message += options.join('\n') + '\n\nRépondez avec le numéro de votre choix.';
  message += '\n❌ Tapez "annuler" pour recommencer';
  return message;
}

// ✅ NOUVEAU : Fonction pour générer le message des modes de paiement disponibles
async function getPaymentModeMessage(restaurantId: string, deliveryMode: string): Promise<string> {
  const restaurant = await SimpleRestaurant.getById(restaurantId);
  
  if (!restaurant) {
    return "❌ Erreur: restaurant non trouvé. Tapez 'resto' pour recommencer.";
  }
  
  // Vérifier qu'au moins un mode de paiement est activé
  if (!restaurant.allow_pay_now && !restaurant.allow_pay_later) {
    return "❌ Désolé, ce restaurant n'accepte aucun paiement pour le moment.\n\n🔄 Tapez 'resto' pour choisir un autre restaurant.";
  }
  
  let message = "💳 Quand souhaitez-vous payer?\n\n";
  let options: string[] = [];
  let optionNumber = 1;
  
  if (restaurant.allow_pay_now) {
    // Adapter le texte selon le pays/contexte du restaurant
    options.push(`${optionNumber}️⃣ Maintenant (en ligne)`);
    optionNumber++;
  }
  
  if (restaurant.allow_pay_later) {
    // Adapter le texte selon le mode de livraison et la currency
    const isEUR = restaurant.currency === 'EUR';
    const paymentMethods = isEUR ? 'cash, carte' : 'cash, o-money';
    
    let laterText = "";
    switch (deliveryMode) {
      case 'sur_place':
        laterText = `À la fin du repas (${paymentMethods})`;
        break;
      case 'a_emporter':
        laterText = `À la récupération (${paymentMethods})`;
        break;
      case 'livraison':
        laterText = `À la livraison (${paymentMethods})`;
        break;
      default:
        laterText = `Plus tard (${paymentMethods})`;
    }
    options.push(`${optionNumber}️⃣ ${laterText}`);
    optionNumber++;
  }
  
  message += options.join('\n') + '\n\nRépondez avec votre choix.';
  return message;
}

// ✅ NOUVEAU : Fonction pour mapper le choix utilisateur au mode de paiement réel
function mapUserChoiceToPaymentMode(choice: string, restaurant: any): string | null {
  const availableModes: string[] = [];
  
  if (restaurant.allow_pay_now) availableModes.push('maintenant');
  if (restaurant.allow_pay_later) availableModes.push('plus_tard');
  
  const choiceIndex = parseInt(choice) - 1;
  
  if (choiceIndex >= 0 && choiceIndex < availableModes.length) {
    return availableModes[choiceIndex];
  }
  
  return null;
}

// ✅ NOUVEAU : Fonction pour mapper le choix utilisateur au mode de livraison réel
function mapUserChoiceToDeliveryMode(choice: string, restaurant: any): string | null {
  const availableModes: string[] = [];
  
  if (restaurant.allow_dine_in) availableModes.push('sur_place');
  if (restaurant.allow_takeaway) availableModes.push('a_emporter');
  if (restaurant.allow_delivery) availableModes.push('livraison');
  
  const choiceIndex = parseInt(choice) - 1;
  
  if (choiceIndex >= 0 && choiceIndex < availableModes.length) {
    return availableModes[choiceIndex];
  }
  
  return null;
}

// ✅ NOUVEAU : Fonction de recherche restaurant par téléphone
async function findRestaurantByPhone(phoneNumber: string) {
  try {
    console.log('🔍 Recherche restaurant avec numéro:', phoneNumber);
    
    // Essayer différents formats de normalisation
    const formats = [
      phoneNumber, // Format original (ex: 622987654)
      `+224${phoneNumber}`, // Format international (ex: +224622987654)
      `224${phoneNumber}` // Format sans + (ex: 224622987654)
    ];
    
    for (const format of formats) {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('telephone', format)
        .single();
      
      if (!error && restaurant) {
        console.log('✅ Restaurant trouvé:', restaurant.nom, 'statut:', restaurant.statut);
        return restaurant;
      }
    }
    
    console.log('❌ Aucun restaurant trouvé avec ce numéro');
    return null;
  } catch (error) {
    console.error('❌ Erreur recherche restaurant:', error);
    return null;
  }
}

// ✅ NOUVEAU : Fonction d'accès direct restaurant (suit le workflow "resto")
async function handleDirectRestaurantAccess(phoneNumber: string, session: any, restaurant: any) {
  try {
    console.log(`🎯 Accès direct restaurant: ${restaurant.nom} - workflow comme "resto"`);
    
    // Créer ou récupérer le client (comme dans handleAccueil)
    const client = await SimpleClient.findOrCreate(phoneNumber);
    if (!client) {
      console.error('❌ Impossible de créer/trouver le client');
      await whatsapp.sendMessage(phoneNumber, 
        '❌ Erreur de connexion à la base de données. Veuillez réessayer avec "resto".');
      return;
    }
    
    // Message de bienvenue personnalisé avec le restaurant trouvé
    const welcomeMessage = `🍽️ Bienvenue chez ${restaurant.nom}!
    
Nous avons trouvé votre restaurant 📞 ${restaurant.telephone}

📋 Voici notre menu du jour :`;
    
    await whatsapp.sendMessage(phoneNumber, welcomeMessage);
    
    // Mettre à jour la session vers VIEWING_MENU (comme dans handleRestaurantSelection)
    const updatedSession = await SimpleSession.update(session.id, {
      state: 'VIEWING_MENU',
      context: {
        ...session.context,
        selectedRestaurantId: restaurant.id,
        selectedRestaurantName: restaurant.nom
      }
    });
    
    console.log('✅ Session mise à jour avec restaurant ID:', restaurant.id);
    
    // Afficher le menu directement (même logique que le workflow normal)
    await showSimpleMenu(phoneNumber, restaurant, updatedSession);
    
    console.log('✅ Menu affiché avec succès pour', restaurant.nom);
    
  } catch (error) {
    console.error('❌ Erreur accès direct restaurant:', error);
    await whatsapp.sendMessage(phoneNumber,
      '❌ Erreur lors de l\'accès au restaurant. Tapez "resto" pour recommencer.');
  }
}

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

  // Message d'accueil générique
  const welcomeMessage = `🍽️ Bienvenue!

Comment souhaitez-vous trouver votre restaurant?

1️⃣ Restos près de vous 📍
2️⃣ Tous les restos 🍴

Répondez avec le numéro de votre choix.

💡 Tapez "annuler" pour arrêter, "retour" pour changer ou le numéro du resto pour accéder directement.`;

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

// NOUVEAU: Gestion de l'annulation par numéro de commande
async function handleOrderCancellationByNumber(phoneNumber: string, orderNumber: string) {
  try {
    console.log(`🔍 Tentative d'annulation commande N°${orderNumber} pour ${phoneNumber}`);
    
    // Étape 1: Vérifier que la commande existe et appartient au client
    const { data: order, error } = await supabase
      .from('commandes')
      .select(`
        id, 
        statut, 
        paiement_statut, 
        restaurant_id,
        clients!inner(phone_whatsapp)
      `)
      .eq('numero_commande', orderNumber)
      .single();

    if (error || !order) {
      console.log(`❌ Commande N°${orderNumber} introuvable`);
      await whatsapp.sendMessage(phoneNumber, 
        `❌ Commande N°${orderNumber} introuvable.\n\n💡 Vérifiez le numéro de commande et réessayez.`);
      return;
    }

    // SÉCURITÉ: Vérifier que la commande appartient au client
    if (order.clients.phone_whatsapp !== phoneNumber) {
      console.log(`🚫 Tentative d'annulation non autorisée pour N°${orderNumber}`);
      console.log(`🔍 Debug - Téléphone commande: ${order.clients.phone_whatsapp}, Téléphone client: ${phoneNumber}`);
      await whatsapp.sendMessage(phoneNumber, 
        `❌ Vous n'êtes pas autorisé à annuler cette commande.\n\n💡 Vérifiez le numéro de commande.`);
      return;
    }

    console.log(`✅ Commande N°${orderNumber} trouvée, statut: ${order.statut}, paiement: ${order.paiement_statut}`);

    // Étape 2: Appliquer les protections existantes (payé/livré)
    if (order.paiement_statut === 'paye' || order.statut === 'livree') {
      // Récupérer infos restaurant pour contact
      const restaurant = await SimpleRestaurant.getById(order.restaurant_id);
      const restaurantName = restaurant?.nom || 'Restaurant';
      const restaurantPhone = restaurant?.telephone || '';
      
      let reason = '';
      if (order.paiement_statut === 'paye') {
        reason = '💳 Cette commande a déjà été payée.';
      } else if (order.statut === 'livree') {
        reason = '✅ Cette commande a déjà été livrée.';
      }
      
      const blockedMessage = `⚠️ Impossible d'annuler la commande N°${orderNumber}.

${reason}

📞 Pour toute modification, contactez directement le restaurant:
${restaurantName}
📱 ${restaurantPhone}

💡 Tapez "resto" pour faire une nouvelle commande.`;

      await whatsapp.sendMessage(phoneNumber, blockedMessage);
      return;
    }

    // Étape 3: Vérifier statuts non-annulables
    const finalStatuses = ['terminee', 'annulee'];
    if (finalStatuses.includes(order.statut)) {
      let statusMessage = '';
      if (order.statut === 'terminee') statusMessage = 'Cette commande est déjà terminée.';
      else if (order.statut === 'annulee') statusMessage = 'Cette commande est déjà annulée.';

      await whatsapp.sendMessage(phoneNumber, 
        `⚠️ Impossible d'annuler la commande N°${orderNumber}.\n${statusMessage}\n\n💡 Tapez "resto" pour faire une nouvelle commande.`);
      return;
    }

    // Étape 4: Demander confirmation d'annulation
    await requestOrderCancellationConfirmation(phoneNumber, orderNumber, order);

  } catch (error) {
    console.error('❌ Erreur annulation par numéro:', error);
    await whatsapp.sendMessage(phoneNumber, 
      '❌ Erreur lors de la vérification de la commande. Veuillez réessayer.');
  }
}

// NOUVEAU: Demander confirmation d'annulation pour commande spécifique
async function requestOrderCancellationConfirmation(phoneNumber: string, orderNumber: string, order: any) {
  try {
    // Créer une session temporaire pour la confirmation
    await SimpleSession.deleteAllForPhone(phoneNumber);
    const tempSession = await SimpleSession.create(phoneNumber, 'CONFIRM_CANCEL');
    await SimpleSession.update(tempSession.id, {
      context: {
        orderToCancel: orderNumber,
        orderIdToCancel: order.id,
        restaurantId: order.restaurant_id
      }
    });

    const confirmMessage = `⚠️ Voulez-vous vraiment annuler la commande N°${orderNumber} ?

✅ Tapez "oui" pour confirmer l'annulation
❌ Tapez "non" pour conserver votre commande`;

    await whatsapp.sendMessage(phoneNumber, confirmMessage);
    console.log(`✅ Demande de confirmation envoyée pour N°${orderNumber}`);

  } catch (error) {
    console.error('❌ Erreur demande confirmation:', error);
    await whatsapp.sendMessage(phoneNumber, 
      '❌ Erreur lors de la demande de confirmation. Veuillez réessayer.');
  }
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
  // Récupérer tous les menus puis filtrer par catégories actives
  const { data: allMenuItems } = await supabase
    .from('menus')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .eq('disponible', true)
    .order('categorie')
    .order('ordre_affichage');

  // Récupérer les catégories actives
  const activeCategories = await getRestaurantCategories(restaurant.id);
  const activeCategoryKeys = activeCategories.map(cat => cat.category_key);
  
  // Filtrer les menus par catégories actives
  const menuItems = (allMenuItems || []).filter(item => 
    activeCategoryKeys.includes(item.categorie)
  );

  // NOUVEAU: Tous les restaurants utilisent le système catégories
  await showCategoryMenu(phoneNumber, restaurant, session, menuItems || []);
  return;

  let menuMessage = `📋 Menu du jour - ${restaurant.nom}\n\n`;
  let orderedMenu = [];
  
  if (menuItems && menuItems.length > 0) {
    // ÉTAPE 4.1 - REMPLACER ligne 981 : Utiliser les nouvelles fonctions
    const restaurantCategories = await getRestaurantCategories(restaurant.id);
    const categoryEmojis = await getCategoryEmojis(restaurant.id);
    const categories = restaurantCategories.map(cat => cat.category_key);

    let itemIndex = 1;
    
    for (const category of categories) {
      const categoryItems = menuItems.filter(item => item.categorie === category);
      
      if (categoryItems.length > 0) {
        menuMessage += `${categoryEmojis[category]}\n`;
        
        for (const item of categoryItems) {
          const formattedPrice = formatPrice(item.prix, restaurant.currency);
          const displayNumber = itemIndex <= 9 ? `${itemIndex}️⃣` : `(${itemIndex})`;
          menuMessage += `${displayNumber} ${item.nom_plat} - ${formattedPrice}\n`;
          
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

// NOUVEAU: Fonction pour afficher le menu par catégories
async function showCategoryMenu(phoneNumber: string, restaurant: any, session: any, menuItems: any[]) {
  console.log('📂 Affichage menu par catégories pour:', restaurant.nom);
  
  // ÉTAPE 5.3 - REMPLACER ligne 1056 : Utiliser la nouvelle fonction
  const categoriesData: Record<string, any[]> = {};
  const restaurantCategories = await getRestaurantCategories(restaurant.id);
  const categoryEmojis = await getCategoryEmojis(restaurant.id);

  // Regrouper les produits par catégorie
  menuItems.forEach(item => {
    if (!categoriesData[item.categorie]) {
      categoriesData[item.categorie] = [];
    }
    categoriesData[item.categorie].push(item);
  });

  // Construire le message des catégories disponibles
  let categoryMessage = `📋 Menu ${restaurant.nom} - Choisissez une catégorie :\n\n`;
  const availableCategories: string[] = [];
  let categoryIndex = 1;

  Object.keys(categoriesData).forEach(categoryKey => {
    const items = categoriesData[categoryKey];
    if (items.length > 0) {
      const categoryName = categoryEmojis[categoryKey] || categoryKey.toUpperCase();
      categoryMessage += `${categoryIndex}️⃣ ${categoryName} (${items.length} produits)\n`;
      availableCategories.push(categoryKey);
      categoryIndex++;
    }
  });

  categoryMessage += `\n💡 Tapez le n° de catégorie (ex: 1 pour ${availableCategories[0] || 'première catégorie'})`;
  categoryMessage += `\n🔄 Tapez "menu" pour voir toutes les catégories`;
  categoryMessage += `\n❌ Tapez "annuler" pour arrêter`;
  categoryMessage += `\n💡 ou taper le numéro du resto pour accéder directement.`;

  // Sauvegarder les catégories disponibles dans la session
  await SimpleSession.update(session.id, {
    state: 'SELECTING_CATEGORY',
    context: {
      ...session.context,
      selectedRestaurantId: restaurant.id,
      selectedRestaurantName: restaurant.nom,
      availableCategories: availableCategories,
      categoriesData: categoriesData
    }
  });

  await whatsapp.sendMessage(phoneNumber, categoryMessage);
  console.log('✅ Menu catégories affiché');
}

// NOUVEAU: Fonction pour afficher les produits d'une catégorie
async function showProductsInCategory(phoneNumber: string, restaurant: any, session: any, categoryKey: string) {
  console.log('🍕 Affichage produits catégorie:', categoryKey);
  
  const categoriesData = session.context.categoriesData || {};
  const categoryItems = categoriesData[categoryKey] || [];
  
  if (categoryItems.length === 0) {
    await whatsapp.sendMessage(phoneNumber, '❌ Aucun produit disponible dans cette catégorie.');
    return;
  }

  // ÉTAPE 5.2 - REMPLACER ligne 1127 : Utiliser la nouvelle fonction
  const categoryEmojis = await getCategoryEmojis(restaurant.id);

  const categoryName = categoryEmojis[categoryKey] || categoryKey.toUpperCase();
  let productMessage = `${categoryName} - ${restaurant.nom} (${categoryItems.length} produits)\n\n`;
  
  // Créer un menu ordonné pour cette catégorie seulement
  let orderedMenu: any[] = [];
  
  categoryItems.forEach((item, index) => {
    const displayNumber = (index + 1) <= 9 ? `${index + 1}️⃣` : `(${index + 1})`;
    const formattedPrice = formatPrice(item.prix, restaurant.currency);
    productMessage += `${displayNumber} ${item.nom_plat} - ${formattedPrice}\n`;
    
    orderedMenu.push({
      index: index + 1,
      item: item
    });
  });

  productMessage += `\n💡 Pour commander: tapez les numéros`;
  productMessage += `\nEx: 1,2,2 = 1× ${categoryItems[0]?.nom_plat} + 2× ${categoryItems[1]?.nom_plat}`;
  productMessage += `\n\n🔙 Tapez "0" pour les catégories`;
  productMessage += `\n🛒 Tapez "00" pour voir votre commande`;
  productMessage += `\n💡 Tapez "annuler" pour arrêter, "retour" pour changer ou le numéro du resto pour accéder directement.`;

  // Mettre à jour la session avec l'état VIEWING_CATEGORY
  await SimpleSession.update(session.id, {
    state: 'VIEWING_CATEGORY',
    context: {
      ...session.context,
      currentCategory: categoryKey,
      currentCategoryProducts: categoryItems,
      menuOrder: orderedMenu  // Compatible avec le système existant
    }
  });

  await whatsapp.sendMessage(phoneNumber, productMessage);
  console.log('✅ Produits de catégorie affichés');
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

  // Récupérer le panier existant ou créer un nouveau
  const cart: Record<string, { item: any; quantity: number; displayNumber: number }> = session.context.cart || {};

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

  // Récupérer le restaurant pour la currency
  const restaurantId = session.context.selectedRestaurantId;
  const restaurant = await SimpleRestaurant.getById(restaurantId);
  
  // Calculer le total et détecter s'il y avait déjà des articles
  const previousCartSize = Object.keys(session.context.cart || {}).length;
  const hasExistingItems = previousCartSize > 0;
  
  let subtotal = 0;
  let cartMessage = hasExistingItems ? '🛒 Panier mis à jour:\n\n' : '🛒 Votre panier:\n\n';

  for (const [itemKey, cartItem] of Object.entries(cart)) {
    const itemTotal = cartItem.item.prix * cartItem.quantity;
    subtotal += itemTotal;
    
    const formattedPrice = formatPrice(itemTotal, restaurant?.currency);
    cartMessage += `• ${cartItem.quantity}× ${cartItem.item.nom_plat} - ${formattedPrice}\n`;
  }

  const formattedSubtotal = formatPrice(subtotal, restaurant?.currency);
  const totalItems = Object.values(cart).reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  cartMessage += `\n────────────────────`;
  cartMessage += `\n💰 Sous-total: ${formattedSubtotal}`;
  cartMessage += `\n📦 Total: ${totalItems} article${totalItems > 1 ? 's' : ''}`;
  cartMessage += `\n\nQue voulez-vous faire ?\n`;
  cartMessage += `\n1️⃣ Finaliser la commande`;
  cartMessage += `\n2️⃣ Continuer vos achats (garder le panier)`;
  cartMessage += `\n3️⃣ Recommencer (vider le panier)`;
  cartMessage += `\n\nTapez votre choix (1, 2 ou 3)`;

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

  if (normalizedResponse === '1') {
    // 1 = Finaliser la commande (aller aux modes de récupération)
    await handleModeSelection(phoneNumber, session);
  } else if (normalizedResponse === '2') {
    // 2 = Continuer vos achats (garder le panier)
    const restaurant = await SimpleRestaurant.getById(session.context.selectedRestaurantId);
    const { data: menuItems } = await supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('disponible', true)
      .order('categorie')
      .order('ordre_affichage')
      .order('id');
    await showCategoryMenu(phoneNumber, restaurant, session, menuItems);
  } else if (normalizedResponse === '3') {
    // 3 = Recommencer (vider le panier)
    const restaurant = await SimpleRestaurant.getById(session.context.selectedRestaurantId);
    
    // Vider le panier
    await SimpleSession.update(session.id, {
      state: 'SELECTING_CATEGORY',
      context: {
        ...session.context,
        cart: {} // Vider le panier
      }
    });
    
    const { data: menuItems } = await supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('disponible', true)
      .order('categorie')
      .order('ordre_affichage')
      .order('id');
    await showCategoryMenu(phoneNumber, restaurant, session, menuItems);
  } else if (normalizedResponse === 'retour') {
    // NOUVEAU: Retour aux catégories depuis le panier
    const restaurant = await SimpleRestaurant.getById(session.context.selectedRestaurantId);
    const { data: menuItems } = await supabase
      .from('menus')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('disponible', true)
      .order('categorie')
      .order('ordre_affichage')
      .order('id');
    await showCategoryMenu(phoneNumber, restaurant, session, menuItems);
  } else {
    await whatsapp.sendMessage(phoneNumber, 
      '❓ Tapez votre choix : 1 (Finaliser), 2 (Continuer) ou 3 (Recommencer)');
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

// Fonction pour afficher le panier (consultation seule)
async function showCartView(phoneNumber: string, session: any) {
  const cart = session.context.cart || {};
  
  if (Object.keys(cart).length === 0) {
    await whatsapp.sendMessage(phoneNumber, 
      '🛒 Votre panier est vide.\n\nContinuez vos achats en tapez les numéros des produits.');
    return;
  }
  
  // Récupérer le restaurant pour la currency
  const restaurantId = session.context.selectedRestaurantId;
  const restaurant = await SimpleRestaurant.getById(restaurantId);
  
  let subtotal = 0;
  let cartMessage = '🛒 Votre panier:\n\n';

  for (const [itemKey, cartItem] of Object.entries(cart) as [string, any][]) {
    const itemTotal = cartItem.item.prix * cartItem.quantity;
    subtotal += itemTotal;
    
    const formattedPrice = formatPrice(itemTotal, restaurant?.currency);
    cartMessage += `• ${cartItem.quantity}× ${cartItem.item.nom_plat} - ${formattedPrice}\n`;
  }

  const formattedSubtotal = formatPrice(subtotal, restaurant?.currency);
  const totalItems = Object.values(cart).reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  cartMessage += `\n────────────────────`;
  cartMessage += `\n💰 Sous-total: ${formattedSubtotal}`;
  cartMessage += `\n📦 Total: ${totalItems} article${totalItems > 1 ? 's' : ''}`;
  cartMessage += `\n\nQue voulez-vous faire ?\n`;
  cartMessage += `\n⿡ Finaliser la commande`;
  cartMessage += `\n⿢ Continuer vos achats (garder le panier)`;
  cartMessage += `\n⿣ Recommencer (vider le panier)`;
  cartMessage += `\n\nTapez votre choix (1, 2 ou 3)`;

  await whatsapp.sendMessage(phoneNumber, cartMessage);

  // Changer l'état pour gérer les réponses 1,2,3
  await SimpleSession.update(session.id, {
    state: 'CONFIRMING_ORDER',
    context: {
      ...session.context,
      cart: cart,
      subtotal: subtotal
    }
  });
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

  // Récupérer le message personnalisé selon les modes disponibles du restaurant
  const restaurantId = session.context.selectedRestaurantId;
  const modeMessage = await getDeliveryModeMessage(restaurantId);
  
  // Vérifier si le restaurant a des modes disponibles
  if (modeMessage.startsWith("❌")) {
    // Aucun mode disponible ou erreur
    await whatsapp.sendMessage(phoneNumber, modeMessage);
    return;
  }
  
  // Vérifier s'il n'y a qu'un seul mode disponible
  const restaurant = await SimpleRestaurant.getById(restaurantId);
  const activeModes = [restaurant?.allow_dine_in, restaurant?.allow_takeaway, restaurant?.allow_delivery]
    .filter(Boolean).length;
  
  if (activeModes === 1) {
    // Un seul mode disponible, passer automatiquement
    const mode = restaurant.allow_dine_in ? 'sur_place' : 
                 restaurant.allow_takeaway ? 'a_emporter' : 'livraison';
    
    console.log(`📦 Un seul mode disponible: ${mode}, passage automatique`);
    
    // Mettre à jour le contexte avec le mode
    session.context.mode = mode;
    
    // Appeler directement la fonction appropriée
    if (mode === 'sur_place') {
      await handleSurPlaceMode(phoneNumber, session);
    } else if (mode === 'a_emporter') {
      await handleEmporterMode(phoneNumber, session);
    } else {
      await handleLivraisonMode(phoneNumber, session);
    }
    return;
  }

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

  // Récupérer le restaurant pour mapper correctement le choix
  const restaurantId = session.context.selectedRestaurantId;
  const restaurant = await SimpleRestaurant.getById(restaurantId);
  
  if (!restaurant) {
    await whatsapp.sendMessage(phoneNumber,
      '❌ Erreur: restaurant non trouvé. Tapez "resto" pour recommencer.');
    return;
  }
  
  // Mapper le choix utilisateur au mode réel selon les modes disponibles
  const mode = mapUserChoiceToDeliveryMode(choice.trim(), restaurant);
  
  if (!mode) {
    // Choix invalide, renvoyer le message approprié
    const modeMessage = await getDeliveryModeMessage(restaurantId);
    await whatsapp.sendMessage(phoneNumber,
      `❓ Choix non reconnu.\n\n${modeMessage}`);
    return;
  }
  
  // Mettre à jour le contexte avec le mode
  session.context.mode = mode;
  
  // Appeler la fonction appropriée selon le mode mappé
  switch (mode) {
    case 'sur_place':
      await handleSurPlaceMode(phoneNumber, session);
      break;
    
    case 'a_emporter':
      await handleEmporterMode(phoneNumber, session);
      break;
    
    case 'livraison':
      await handleLivraisonMode(phoneNumber, session);
      break;
    
    default:
      await whatsapp.sendMessage(phoneNumber,
        '❓ Erreur de configuration. Veuillez réessayer.');
  }
}

// Fonction pour le mode sur place
async function handleSurPlaceMode(phoneNumber: string, session: any) {
  const restaurantId = session.context.selectedRestaurantId;
  const paymentMessage = await getPaymentModeMessage(restaurantId, 'sur_place');
  
  // Vérifier si le restaurant a des modes de paiement disponibles
  if (paymentMessage.startsWith("❌")) {
    await whatsapp.sendMessage(phoneNumber, paymentMessage);
    return;
  }

  const message = `🍽️ Mode: SUR PLACE

Votre commande sera préparée pour être consommée au restaurant.

💰 Récapitulatif final:
${await formatFinalSummary(session, 'sur_place')}

${paymentMessage}`;

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
  const restaurantId = session.context.selectedRestaurantId;
  const paymentMessage = await getPaymentModeMessage(restaurantId, 'a_emporter');
  
  // Vérifier si le restaurant a des modes de paiement disponibles
  if (paymentMessage.startsWith("❌")) {
    await whatsapp.sendMessage(phoneNumber, paymentMessage);
    return;
  }

  const message = `📦 Mode: À EMPORTER

Votre commande sera préparée pour récupération.
⏱️ Temps de préparation estimé: 15-25 minutes

💰 Récapitulatif final:
${await formatFinalSummary(session, 'emporter')}

${paymentMessage}`;

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
    const message = `📍 ENVOYEZ VOTRE POSITION GPS PRÉCISE :
• Cliquez sur l'icône 📎 (trombone)
• Sélectionnez "Localisation"
• Attendez que la précision soit ≤ 50 mètres
• ✅ Choisissez "Envoyer votre localisation actuelle" (position GPS exacte)
• ❌ NE PAS choisir "Partager position en direct" (ne fonctionne pas)
• ❌ NE PAS choisir les lieux suggérés (Police, Centre, etc.)
• ⚠ Si précision > 50m : cliquez ← en haut à gauche et réessayez`;

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

// NOUVEAU : Fonction pour calculer les frais avec le nouveau système flexible
async function calculateDeliveryFeeNew(restaurantId: string, distance: number, subtotal: number) {
  try {
    // Récupérer la config du restaurant
    const { data: config } = await supabase
      .from('restaurant_delivery_config')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .single();

    if (!config) {
      // Fallback vers l'ancien système si pas de config
      return { useOldSystem: true };
    }

    // Vérifier rayon maximum
    if (distance > config.max_delivery_radius_km) {
      return { 
        success: false, 
        message: `Désolé, nous ne livrons pas à ${distance.toFixed(1)}km de distance.\n\nNotre zone de livraison maximale est de ${config.max_delivery_radius_km}km.\n\nTapez "2" pour choisir le mode "À emporter".`
      };
    }

    // Vérifier seuil de gratuité
    if (subtotal >= config.free_delivery_threshold) {
      return { success: true, fee: 0, type: 'free' };
    }

    let deliveryFee = 0;

    if (config.delivery_type === 'fixed') {
      // Montant fixe pour toutes les commandes
      deliveryFee = config.fixed_amount;
    } else if (config.delivery_type === 'distance_based') {
      // Calcul basé sur la distance
      const distanceToUse = config.round_up_distance ? Math.ceil(distance) : distance;
      deliveryFee = distanceToUse * config.price_per_km;
    }

    return { success: true, fee: deliveryFee, type: config.delivery_type };
  } catch (error) {
    console.error('❌ Erreur calcul frais nouveau système:', error);
    // En cas d'erreur, utiliser l'ancien système
    return { useOldSystem: true };
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
  
  // Calculer les frais de livraison avec le nouveau système (avec fallback)
  const subtotal = session.context.subtotal || 0;
  const feeResult = await calculateDeliveryFeeNew(restaurantId, distance, subtotal);
  
  let fraisLivraison = 0;
  
  if (feeResult.useOldSystem) {
    // ANCIEN SYSTÈME (fallback) - Code original conservé
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
  } else if (!feeResult.success) {
    // NOUVEAU SYSTÈME - Hors zone
    await whatsapp.sendMessage(phoneNumber, feeResult.message);
    return;
  } else {
    // NOUVEAU SYSTÈME - Calcul réussi
    fraisLivraison = feeResult.fee;
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
  const paymentMessage = await getPaymentModeMessage(restaurantId, 'livraison');
  
  let message = `🏠 Mode: LIVRAISON
📍 Distance: ${distance.toFixed(1)}km

💰 Récapitulatif final:
${await formatFinalSummary({ context: { ...session.context, frais_livraison: fraisLivraison, total: total } }, 'livraison')}

${paymentMessage}`;

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
  
  // Récupérer le restaurant pour la currency
  const restaurantId = session.context.selectedRestaurantId;
  const restaurant = await SimpleRestaurant.getById(restaurantId);
  
  let summary = '';
  
  for (const [itemKey, cartItem] of Object.entries(cart) as [string, any][]) {
    const itemTotal = cartItem.item.prix * cartItem.quantity;
    const formattedPrice = formatPrice(itemTotal, restaurant?.currency);
    summary += `• ${cartItem.quantity}× ${cartItem.item.nom_plat} - ${formattedPrice}\n`;
  }
  
  const subtotal = session.context.subtotal || 0;
  const fraisLivraison = session.context.frais_livraison || 0;
  const total = subtotal + fraisLivraison;
  
  const formattedSubtotal = formatPrice(subtotal, restaurant?.currency);
  const formattedTotal = formatPrice(total, restaurant?.currency);
  
  summary += `\n────────────────────`;
  summary += `\n💰 Sous-total: ${formattedSubtotal}`;
  
  if (fraisLivraison > 0) {
    const formattedFrais = formatPrice(fraisLivraison, restaurant?.currency);
    summary += `\n🚛 Frais livraison: ${formattedFrais}`;
  }
  
  summary += `\n💳 TOTAL: ${formattedTotal}`;
  
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
  
  console.log(`🕒 Restaurant ${restaurant.nom} - Jour: ${currentDay}, Heure: ${currentTime}`);
  console.log(`🕒 Horaires disponibles:`, Object.keys(restaurant.horaires || {}));
  
  const horaires = restaurant.horaires;
  if (!horaires || !horaires[currentDay]) {
    console.log(`❌ Pas d'horaires pour ${currentDay}`);
    return {
      isOpen: false,
      reason: 'outside_hours'
    };
  }

  const dayHours = horaires[currentDay];
  
  console.log(`🕒 Horaires ${currentDay}:`, dayHours);
  
  // Vérifier si le restaurant est fermé ce jour-là
  if (dayHours.ferme === true) {
    console.log(`❌ Restaurant fermé le ${currentDay} (ferme: true)`);
    return {
      isOpen: false,
      reason: 'outside_hours'
    };
  }
  
  const openTime = dayHours.ouverture;
  const closeTime = dayHours.fermeture;
  
  console.log(`🕒 Comparaison: ${currentTime} entre ${openTime} et ${closeTime}`);

  // Comparer les heures
  const isNightSchedule = openTime > closeTime;
  const isOpen = isNightSchedule 
    ? (currentTime >= openTime || currentTime <= closeTime)
    : (currentTime >= openTime && currentTime <= closeTime);
  
  console.log(`🔍 Debug: isNightSchedule=${isNightSchedule}, isOpen=${isOpen}`);
  
  if (isOpen) {
    console.log(`✅ Restaurant ouvert !`);
    return {
      isOpen: true,
      reason: 'open'
    };
  } else {
    console.log(`❌ Restaurant fermé - hors horaires`);
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
  
  const restaurantId = session.context.selectedRestaurantId;
  const restaurant = await SimpleRestaurant.getById(restaurantId);
  
  if (!restaurant) {
    await whatsapp.sendMessage(phoneNumber, 
      "❌ Erreur: restaurant non trouvé. Tapez 'resto' pour recommencer.");
    return;
  }
  
  // Mapper le choix utilisateur au mode de paiement réel
  const paymentMode = mapUserChoiceToPaymentMode(choice.trim(), restaurant);
  
  if (!paymentMode) {
    // Choix invalide, renvoyer le message approprié
    const paymentMessage = await getPaymentModeMessage(restaurantId, session.context.mode);
    await whatsapp.sendMessage(phoneNumber,
      `❓ Choix non reconnu.\n\n${paymentMessage}`);
    return;
  }
  
  // Appeler la fonction appropriée selon le mode de paiement mappé
  switch (paymentMode) {
    case 'maintenant':
      await handlePaymentNow(phoneNumber, session);
      break;
    
    case 'plus_tard':
      await handlePaymentLater(phoneNumber, session);
      break;
    
    default:
      await whatsapp.sendMessage(phoneNumber,
        '❓ Mode de paiement non reconnu.');
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
🙏 Merci de votre confiance, ${session.context.selectedRestaurantName} !

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

// Fonction pour notifier le livreur de l'annulation d'une commande
async function notifyDeliveryDriverOfCancellation(orderId: string): Promise<void> {
  try {
    // Récupérer les détails de la commande pour obtenir les infos du livreur et du restaurant
    const { data: orderData, error } = await supabase
      .from('commandes')
      .select('livreur_phone, livreur_nom, client_id, total, adresse_livraison, restaurant_id')
      .eq('numero_commande', orderId)
      .single();
    
    if (error || !orderData) {
      console.error('❌ Erreur récupération commande pour notification livreur:', error);
      return;
    }
    
    // Vérifier si un livreur est assigné
    if (!orderData.livreur_phone) {
      console.log('ℹ️ Pas de livreur assigné pour la commande', orderId);
      return;
    }
    
    // Récupérer les infos du client
    const { data: clientData } = await supabase
      .from('clients')
      .select('nom')
      .eq('id', orderData.client_id)
      .single();
    
    const clientName = clientData?.nom || 'Client';
    
    // Récupérer le restaurant pour la currency
    const restaurant = await SimpleRestaurant.getById(orderData.restaurant_id);
    
    // Créer le message de notification moderne avec emojis
    const message = `🚨 *COMMANDE ANNULÉE*

📦 *Commande N°${orderId}*
👤 Client: ${clientName}
📍 Adresse: ${orderData.adresse_livraison || 'Non spécifiée'}
💰 Montant: ${formatPrice(orderData.total, restaurant?.currency)}

❌ Cette commande a été annulée par le client.

⚠️ *Ne vous déplacez pas pour cette livraison*

Si vous étiez déjà en route, veuillez retourner au restaurant ou attendre une nouvelle commande.

Merci de votre compréhension.`;
    
    // Envoyer la notification via WhatsApp
    const whatsapp = new SimpleWhatsApp();
    const sent = await whatsapp.sendMessage(orderData.livreur_phone, message);
    
    if (sent) {
      console.log(`✅ Notification d'annulation envoyée au livreur ${orderData.livreur_nom} (${orderData.livreur_phone})`);
    } else {
      console.error(`❌ Échec envoi notification au livreur ${orderData.livreur_nom}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la notification du livreur:', error);
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

    // NOUVEAU: Gestion de l'annulation par numéro de commande (ex: "annuler 2908-0002")
    if (message.match(/^annuler\s+(\d{4}-\d{4})$/i)) {
      const orderNumber = message.split(' ')[1];
      await handleOrderCancellationByNumber(phoneNumber, orderNumber);
      return;
    }

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
          // Vérifier d'abord le statut actuel de la commande
          const { data: orderCheck, error: checkError } = await supabase
            .from('commandes')
            .select('statut, paiement_statut')
            .eq('numero_commande', orderId)
            .single();
          
          if (orderCheck && !checkError) {
            // NOUVEAU: Vérifier si la commande est déjà payée ou livrée
            if (orderCheck.paiement_statut === 'paye' || orderCheck.statut === 'livree') {
              // Récupérer les informations du restaurant pour le contact
              const restaurantId = session.context.selectedRestaurantId;
              const restaurant = await SimpleRestaurant.getById(restaurantId);
              const restaurantName = restaurant?.nom || 'Restaurant';
              const restaurantPhone = restaurant?.telephone || '';
              
              let reason = '';
              if (orderCheck.paiement_statut === 'paye') {
                reason = '💳 Cette commande a déjà été payée.';
              } else if (orderCheck.statut === 'livree') {
                reason = '✅ Cette commande a déjà été livrée.';
              }
              
              const blockedOrderMessage = `⚠️ Impossible d'annuler la commande N°${orderId}.

${reason}

📞 Pour toute modification, contactez directement le restaurant:
${restaurantName}
📱 ${restaurantPhone}

💡 Tapez "resto" pour faire une nouvelle commande.`;

              await whatsapp.sendMessage(phoneNumber, blockedOrderMessage);
              
              // Nettoyer la session
              await SimpleSession.deleteAllForPhone(phoneNumber);
              return;
            }
            
            // Vérifier si la commande peut être annulée
            const nonCancellableStatuses = ['terminee', 'livree', 'annulee'];
            if (nonCancellableStatuses.includes(orderCheck.statut)) {
              cancelMessage = `⚠️ Impossible d'annuler la commande N°${orderId}.\n`;
              if (orderCheck.statut === 'livree') {
                cancelMessage += 'Cette commande a déjà été livrée.\n\n';
              } else if (orderCheck.statut === 'terminee') {
                cancelMessage += 'Cette commande est déjà terminée.\n\n';
              } else if (orderCheck.statut === 'annulee') {
                cancelMessage += 'Cette commande est déjà annulée.\n\n';
              }
              await whatsapp.sendMessage(phoneNumber, 
                cancelMessage + '💡 Tapez "annuler" pour arrêter, "retour" pour changer ou le numéro du resto pour accéder directement.');
              
              // Nettoyer la session même si on ne peut pas annuler
              await SimpleSession.deleteAllForPhone(phoneNumber);
              return;
            }
          }
          
          // Mettre à jour le statut de la commande en base de données
          const { error } = await supabase
            .from('commandes')
            .update({
              statut: 'annulee',
              cancelled_at: new Date().toISOString()
            })
            .eq('numero_commande', orderId)
            .not('statut', 'in', '(terminee,livree,annulee)'); // Protection supplémentaire
          
          if (!error) {
            // Récupérer les informations du restaurant pour le message
            const restaurantId = session.context.selectedRestaurantId;
            const restaurant = await SimpleRestaurant.getById(restaurantId);
            const restaurantName = restaurant?.nom || 'Restaurant';
            const restaurantPhone = restaurant?.telephone || '';
            
            cancelMessage = `❌ COMMANDE ANNULÉE
📋 N°${orderId} • ${restaurantName}
📞 Restaurant: ${restaurantPhone}

🙏 Nous sommes désolés


`;
            console.log(`✅ Commande ${orderId} marquée comme annulée en base`);
            
            // Notifier le livreur si assigné
            await notifyDeliveryDriverOfCancellation(orderId);
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
          cancelMessage + '💡 Tapez "annuler" pour arrêter, "retour" pour changer ou le numéro du resto pour accéder directement.');
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

    // ✅ NOUVEAU : Détection numéro téléphone restaurant (avant restartKeywords pour priorité)
    if (isPhoneNumberFormat(message)) {
      console.log('📱 Format téléphone détecté:', message);
      const restaurant = await findRestaurantByPhone(message);
      
      if (restaurant) {
        // Vérifier le statut et les horaires du restaurant trouvé
        console.log(`✅ Restaurant trouvé: ${restaurant.nom}, statut: ${restaurant.statut}`);
        
        // Si restaurant fermé définitivement
        if (restaurant.statut === 'ferme') {
          await whatsapp.sendMessage(phoneNumber,
            `😔 ${restaurant.nom} est actuellement fermé.\n\n` +
            '🔄 Tapez "resto" pour découvrir nos autres restaurants.');
          return;
        }
        
        // Si restaurant temporairement fermé
        if (restaurant.statut === 'temporairement_ferme') {
          await whatsapp.sendMessage(phoneNumber,
            `⏰ ${restaurant.nom} est temporairement fermé.\n\n` +
            'Nous rouvrirons bientôt !\n' +
            '🔄 Tapez "resto" pour voir d\'autres restaurants disponibles.');
          return;
        }
        
        // Si restaurant ouvert en statut, vérifier les horaires
        if (restaurant.statut === 'ouvert') {
          // Vérifier les horaires d'ouverture avec la fonction existante
          const openStatus = isRestaurantOpen(restaurant);
          
          if (!openStatus.isOpen) {
            // Restaurant fermé selon les horaires
            let message = `⏰ ${restaurant.nom} est fermé en ce moment.\n\n`;
            
            if (openStatus.nextOpenTime) {
              message += `🕐 Nous ouvrirons ${openStatus.nextOpenTime}\n\n`;
            }
            
            message += '🔄 Tapez "resto" pour voir les restaurants ouverts maintenant.';
            
            await whatsapp.sendMessage(phoneNumber, message);
            return;
          }
          
          // Restaurant ouvert : procéder normalement
          console.log(`✅ Restaurant ${restaurant.nom} ouvert, workflow comme "resto" mais direct au menu`);
          
          // Même démarrage que "resto" - créer session propre
          await SimpleSession.deleteAllForPhone(phoneNumber);
          session = await SimpleSession.create(phoneNumber, 'INITIAL');
          console.log('✅ Nouvelle session créée:', session.id);
          
          // Suivre le workflow "resto" mais aller directement au restaurant trouvé
          await handleDirectRestaurantAccess(phoneNumber, session, restaurant);
          return;
        }
      } else {
        // Numéro format téléphone mais restaurant vraiment non trouvé
        console.log('❌ Aucun restaurant trouvé pour ce numéro');
        await whatsapp.sendMessage(phoneNumber,
          `❌ Aucun restaurant trouvé avec le numéro ${message}.\n\n` +
          '🔄 Tapez "resto" pour voir tous nos restaurants disponibles.');
        return;
      }
    }

    // Vérifier si l'utilisateur veut redémarrer depuis n'importe quel état
    const restartKeywords = ['resto', 'restaurant', 'menu', 'accueil', 'start', 'restart'];
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

      case 'SELECTING_CATEGORY':
        // Gestion de la sélection de catégorie
        if (/^\d+$/.test(message.trim())) {
          const categoryIndex = parseInt(message.trim());
          const availableCategories = session.context.availableCategories || [];
          
          if (categoryIndex >= 1 && categoryIndex <= availableCategories.length) {
            const selectedCategory = availableCategories[categoryIndex - 1];
            const restaurant = await SimpleRestaurant.getById(session.context.selectedRestaurantId);
            await showProductsInCategory(phoneNumber, restaurant, session, selectedCategory);
          } else {
            await whatsapp.sendMessage(phoneNumber, 
              `❓ Numéro de catégorie invalide. Choisissez entre 1 et ${availableCategories.length}.`);
          }
        } else if (message.toLowerCase() === 'menu') {
          // Réafficher le menu des catégories
          const restaurant = await SimpleRestaurant.getById(session.context.selectedRestaurantId);
          const { data: menuItems } = await supabase
            .from('menus')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('disponible', true)
            .order('categorie')
            .order('ordre_affichage')
            .order('id');
          await showCategoryMenu(phoneNumber, restaurant, session, menuItems);
        } else {
          await whatsapp.sendMessage(phoneNumber, 
            '❓ Tapez le numéro de la catégorie souhaitée ou "menu" pour revoir les catégories.');
        }
        break;

      case 'VIEWING_CATEGORY':
        // Dans une catégorie - gestion des commandes ou navigation
        if (message.trim() === '0') {
          // 0 = Retour au menu des catégories
          const restaurant = await SimpleRestaurant.getById(session.context.selectedRestaurantId);
          const { data: menuItems } = await supabase
            .from('menus')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('disponible', true)
            .order('categorie')
            .order('ordre_affichage')
            .order('id');
          await showCategoryMenu(phoneNumber, restaurant, session, menuItems);
        } else if (message.trim() === '00') {
          // 00 = Afficher le panier actuel
          await showCartView(phoneNumber, session);
        } else if (message.trim() === '000') {
          // 000 = Annuler
          await handleCancellation(phoneNumber, session, '000');
        } else if (message.includes(',') || /^\d+$/.test(message.trim())) {
          // Commande dans la catégorie - utilise le système existant
          await handleOrderCommand(phoneNumber, session, message);
        } else {
          await whatsapp.sendMessage(phoneNumber, 
            '💡 Pour commander: tapez les numéros (ex: 1,2,2)\n🔙 Tapez "0" pour les catégories\n🛒 Tapez "00" pour voir votre commande\n💡 Tapez "annuler" pour arrêter, "retour" pour changer ou le numéro du resto pour accéder directement.');
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

      case 'CONFIRM_CANCEL':
        // NOUVEAU: Gestion de la confirmation d'annulation par numéro
        const orderToCancel = session.context.orderToCancel;
        const orderIdToCancel = session.context.orderIdToCancel;
        const restaurantIdToCancel = session.context.restaurantId;
        const response = message.toLowerCase().trim();
        
        if (response === 'oui' || response === 'o' || response === 'yes') {
          // Exécuter l'annulation
          console.log(`✅ Confirmation reçue, annulation de N°${orderToCancel}`);
          
          const { error } = await supabase
            .from('france_orders')
            .update({
              status: 'annulee',
              updated_at: 'NOW()'
            })
            .eq('order_number', orderToCancel)
            .not('status', 'in', '("livree","servie","recuperee","annulee")');

          if (!error) {
            // Récupérer infos restaurant pour message
            const restaurant = await SimpleRestaurant.getById(restaurantIdToCancel);
            const restaurantName = restaurant?.nom || 'Restaurant';
            const restaurantPhone = restaurant?.telephone || '';
            
            const successMessage = `❌ COMMANDE ANNULÉE
📋 N°${orderToCancel} • ${restaurantName}
📞 Restaurant: ${restaurantPhone}

🙏 Nous sommes désolés

💡 Tapez "resto" pour faire une nouvelle commande.`;

            await whatsapp.sendMessage(phoneNumber, successMessage);
            console.log(`✅ Commande ${orderToCancel} marquée comme annulée en base`);
            
            // Notifier le livreur si assigné
            await notifyDeliveryDriverOfCancellation(orderToCancel);
          } else {
            console.error('⚠️ Erreur lors de l\'annulation:', error);
            await whatsapp.sendMessage(phoneNumber, 
              `❌ Erreur lors de l'annulation de N°${orderToCancel}. Veuillez contacter le restaurant directement.`);
          }
        } else if (response === 'non' || response === 'n' || response === 'no') {
          await whatsapp.sendMessage(phoneNumber, 
            `✅ Annulation annulée. Votre commande N°${orderToCancel} est conservée.\n\n💡 Tapez "resto" pour faire une nouvelle commande.`);
          console.log(`✅ Annulation annulée pour N°${orderToCancel}`);
        } else {
          await whatsapp.sendMessage(phoneNumber, 
            '❓ Réponse non reconnue.\n\nTapez "oui" pour annuler la commande ou "non" pour la conserver.');
          return; // Rester en CONFIRM_CANCEL
        }
        
        // Nettoyer la session temporaire
        await SimpleSession.deleteAllForPhone(phoneNumber);
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
        
        // Messages texte (textMessage et extendedTextMessage)
        if (webhook.messageData?.typeMessage === 'textMessage' || webhook.messageData?.typeMessage === 'extendedTextMessage') {
          const message = webhook.messageData.textMessageData?.textMessage || 
                         webhook.messageData.extendedTextMessageData?.text || '';
          
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
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Message:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

console.log('🚀 Bot Restaurant SIMPLE démarré!');
console.log('📊 Version: simple-1.0.0');
console.log('🔗 Green API Instance:', greenApiInstanceId);