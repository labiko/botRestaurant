/**
 * 🇫🇷 Bot WhatsApp France - Version simplifiée Pizza Yolo
 * Test rapide avec les nouvelles tables france_*
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const greenApiInstanceId = Deno.env.get('GREEN_API_INSTANCE_ID')!;
const greenApiToken = Deno.env.get('GREEN_API_TOKEN')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Service WhatsApp
class WhatsAppService {
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
      return response.ok;
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      return false;
    }
  }
}

const whatsapp = new WhatsAppService();

// Gestionnaire principal
async function handleIncomingMessage(phoneNumber: string, message: string) {
  console.log(`📱 Message reçu de ${phoneNumber}: "${message}"`);

  // Test simple pour vérifier la connexion BDD
  const { data: restaurants, error } = await supabase
    .from('france_restaurants')
    .select('*')
    .eq('is_active', true)
    .limit(1);

  if (error) {
    console.error('❌ Erreur BDD:', error);
    await whatsapp.sendMessage(phoneNumber, '❌ Erreur de connexion à la base de données.');
    return;
  }

  // Réponse simple
  if (message.toLowerCase().includes('salut') || message.toLowerCase().includes('bonjour')) {
    await whatsapp.sendMessage(phoneNumber, `🇫🇷 Bonjour ! Bienvenue chez Pizza Yolo 77 !

🍕 Notre système est en cours de configuration.

Restaurants trouvés dans la base : ${restaurants?.length || 0}
${restaurants?.[0] ? `✅ ${restaurants[0].name}` : '❌ Aucun restaurant'}

Tapez "menu" pour voir nos catégories (en développement).`);
    return;
  }

  if (message.toLowerCase() === 'menu') {
    // Test récupération catégories
    const { data: categories, error: catError } = await supabase
      .from('france_menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (catError) {
      console.error('❌ Erreur catégories:', catError);
      await whatsapp.sendMessage(phoneNumber, '❌ Erreur récupération menu.');
      return;
    }

    let menuText = '🍽️ *MENU PIZZA YOLO 77*\\n\\n';
    categories?.forEach((cat, index) => {
      menuText += `${index + 1}️⃣ ${cat.icon} ${cat.name}\\n`;
    });
    menuText += '\\nTapez le numéro de votre choix (en développement).';

    await whatsapp.sendMessage(phoneNumber, menuText);
    return;
  }

  // Réponse par défaut
  await whatsapp.sendMessage(phoneNumber, `🤖 Message reçu : "${message}"

🚧 Bot en cours de développement.

Commandes disponibles :
• "salut" - Message de bienvenue
• "menu" - Voir les catégories

Status : Tables france_* opérationnelles ✅`);
}

// Handler principal
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    
    // Vérifier que c'est un message entrant
    if (body.typeWebhook === 'incomingMessageReceived') {
      const phoneNumber = body.senderData?.sender;
      const message = body.messageData?.textMessageData?.textMessage;
      
      if (phoneNumber && message) {
        await handleIncomingMessage(phoneNumber, message);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur handler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});