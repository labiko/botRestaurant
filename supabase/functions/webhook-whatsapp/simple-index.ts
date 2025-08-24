/**
 * 🍽️ Bot Restaurant Simple - Version simplifiée
 * Architecture plate sans complexité inutile
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
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
}

// Gestion des clients simplifiée
class SimpleClient {
  static async findOrCreate(phoneNumber: string) {
    // Chercher client existant
    let { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('telephone', phoneNumber)
      .single();

    // Créer si n'existe pas
    if (!client) {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({
          id: crypto.randomUUID(),
          telephone: phoneNumber,
          nom: `Client ${phoneNumber}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      client = newClient;
      console.log('👤 Nouveau client créé:', client?.id);
    } else {
      console.log('👤 Client existant:', client.id);
    }

    return client;
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
    await whatsapp.sendMessage(phoneNumber, '❌ Erreur technique. Veuillez réessayer plus tard.');
    return;
  }

  // Message d'accueil
  const welcomeMessage = `🍽️ Bienvenue chez Bot Resto Conakry!

Comment souhaitez-vous trouver votre restaurant?

1️⃣ Restos près de vous 📍
2️⃣ Tous les restos 🍴

Répondez avec le numéro de votre choix.`;

  await whatsapp.sendMessage(phoneNumber, welcomeMessage);
  
  // Mettre à jour la session
  await SimpleSession.update(session.id, {
    state: 'CHOOSING_RESTAURANT',
    context: { clientId: client.id }
  });

  console.log('✅ Menu d\'accueil envoyé');
}

async function handleRestaurantChoice(phoneNumber: string, session: any, choice: string) {
  console.log('🍴 Choix restaurant:', choice);

  switch (choice.trim()) {
    case '1':
      await whatsapp.sendMessage(phoneNumber, 
        `📍 Pour voir les restaurants proches, partagez votre position WhatsApp.

Cliquez sur 📎 → Position → Position actuelle

Ou tapez "2" pour voir tous les restaurants.`);
      
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

async function handleAllRestaurants(phoneNumber: string, session: any) {
  console.log('📋 Affichage de tous les restaurants');

  const restaurants = await SimpleRestaurant.getOpenRestaurants();

  if (restaurants.length === 0) {
    await whatsapp.sendMessage(phoneNumber, 
      '❌ Aucun restaurant ouvert actuellement. Veuillez réessayer plus tard.');
    return;
  }

  // Afficher les premiers 5 restaurants
  const pageSize = 5;
  const firstPage = restaurants.slice(0, pageSize);
  
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
      allRestaurants: restaurants,
      currentPage: 1,
      totalPages: Math.ceil(restaurants.length / pageSize)
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
    
    await whatsapp.sendMessage(phoneNumber,
      `✅ Restaurant sélectionné: ${selectedRestaurant.nom}
      
🔄 Chargement du menu...`);

    // Mettre à jour la session
    await SimpleSession.update(session.id, {
      state: 'VIEWING_MENU',
      context: {
        ...session.context,
        selectedRestaurantId: selectedRestaurant.id,
        selectedRestaurantName: selectedRestaurant.nom
      }
    });

    // Simuler un menu simple
    setTimeout(async () => {
      await showSimpleMenu(phoneNumber, selectedRestaurant);
    }, 1000);

  } else {
    await whatsapp.sendMessage(phoneNumber, 
      `❓ Numéro invalide. Choisissez entre 1 et ${restaurants.length}.`);
  }
}

async function showSimpleMenu(phoneNumber: string, restaurant: any) {
  const menuMessage = `📋 Menu - ${restaurant.nom}

🥗 ENTRÉES
1️⃣ Salade César - 35,000 GNF
2️⃣ Avocat aux crevettes - 45,000 GNF

🍖 PLATS PRINCIPAUX  
3️⃣ Poulet Yassa - 65,000 GNF
4️⃣ Poisson Braisé - 75,000 GNF
5️⃣ Riz Gras - 55,000 GNF

💡 Pour commander: envoyez les numéros
Ex: 1,3,3 = 1× entrée n°1 + 2× plats n°3

Ou tapez "retour" pour changer de restaurant.`;

  await whatsapp.sendMessage(phoneNumber, menuMessage);
  console.log('📋 Menu affiché');
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

    // Router selon l'état
    switch (session.state) {
      case 'INITIAL':
        const initKeywords = ['resto', 'restaurant', 'menu', 'commander', 'bonjour', 'salut', 'hi'];
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

      case 'VIEWING_ALL_RESTOS':
        if (message.toLowerCase() === 'suivant') {
          await whatsapp.sendMessage(phoneNumber, '🔄 Fonctionnalité "suivant" en cours de développement...');
        } else {
          await handleRestaurantSelection(phoneNumber, session, message);
        }
        break;

      case 'VIEWING_MENU':
        await whatsapp.sendMessage(phoneNumber, 
          '🔄 Fonction commande en cours de développement... Tapez "resto" pour recommencer.');
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

      // Traiter seulement les messages entrants
      if (webhook.typeWebhook === 'incomingMessageReceived' && 
          webhook.messageData?.typeMessage === 'textMessage') {
        
        const phoneNumber = webhook.senderData?.sender.replace(/@.*/, '') || '';
        const message = webhook.messageData.textMessageData?.textMessage || '';

        if (phoneNumber && message) {
          await processMessage(phoneNumber, message);
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