/**
 * Point d'entrée principal pour le webhook WhatsApp
 * Version complète avec base de données et architecture SOLID
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Services et Repositories
import { GreenAPIService } from '../_shared/infrastructure/external/GreenAPIService.ts';
import { SessionService } from '../_shared/application/services/SessionService.ts';
import { SessionRepository } from '../_shared/infrastructure/repositories/SessionRepository.ts';
import { RestaurantRepository } from '../_shared/infrastructure/repositories/RestaurantRepository.ts';
import { MenuRepository } from '../_shared/infrastructure/repositories/MenuRepository.ts';
import { ClientRepository } from '../_shared/infrastructure/repositories/ClientRepository.ts';
import { OrderRepository } from '../_shared/infrastructure/repositories/OrderRepository.ts';

// Handlers
import { AccueilHandler } from '../_shared/application/handlers/AccueilHandler.ts';
import { MenuHandler } from '../_shared/application/handlers/MenuHandler.ts';
import { PanierHandler } from '../_shared/application/handlers/PanierHandler.ts';
import { ModeHandler } from '../_shared/application/handlers/ModeHandler.ts';
import { LivraisonHandler } from '../_shared/application/handlers/LivraisonHandler.ts';
import { PaiementHandler } from '../_shared/application/handlers/PaiementHandler.ts';

// Orchestrateur
import { ConversationOrchestrator } from '../_shared/application/orchestrators/ConversationOrchestrator.ts';

interface GreenAPIWebhook {
  typeWebhook: string;
  instanceData: {
    idInstance: string;
    wid: string;
    typeInstance: string;
  };
  timestamp: number;
  idMessage?: string;
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
}

// Services disponibles
let servicesInitialized = false;
let globalServices: any = {};

function initializeServices() {
  // Disable caching temporarily to debug the issue
  console.log('🔄 Force re-initialization (caching disabled for debugging)');
  servicesInitialized = false;
  globalServices = {};

  try {
    // Client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    console.log('🔧 Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Repositories - Initialisation explicite
    console.log('🏗️ Creating repositories...');
    const sessionRepository = new SessionRepository(supabase);
    const restaurantRepository = new RestaurantRepository(supabase);
    const menuRepository = new MenuRepository(supabase);
    const clientRepository = new ClientRepository(supabase);
    const orderRepository = new OrderRepository(supabase);
    
    // Vérifier que les repositories sont créés
    console.log('🔍 Repositories created:');
    console.log('  - sessionRepository:', !!sessionRepository);
    console.log('  - restaurantRepository:', !!restaurantRepository);
    console.log('  - menuRepository:', !!menuRepository);
    console.log('  - clientRepository:', !!clientRepository, typeof clientRepository.findOrCreateByPhone);
    console.log('  - orderRepository:', !!orderRepository);
    
    if (!clientRepository || !restaurantRepository || !menuRepository || !orderRepository) {
      throw new Error('Failed to initialize repositories');
    }
    
    // Services
    console.log('⚡ Creating services...');
    const messageService = new GreenAPIService();
    const sessionService = new SessionService(sessionRepository);
    
    // Handlers avec injection de dépendances - Vérification explicite
    console.log('🎯 Creating handlers...');
    console.log('🔍 Debug: clientRepository before AccueilHandler creation:', !!clientRepository);
    console.log('🔍 Debug: clientRepository type:', typeof clientRepository);
    console.log('🔍 Debug: clientRepository.findOrCreateByPhone exists:', typeof clientRepository.findOrCreateByPhone);
    
    // Force validation before handler creation
    if (!clientRepository || typeof clientRepository.findOrCreateByPhone !== 'function') {
      throw new Error('ClientRepository is not properly initialized before AccueilHandler creation');
    }
    
    const accueilHandler = new AccueilHandler(messageService, restaurantRepository, clientRepository);
    console.log('✅ AccueilHandler created successfully');
    const menuHandler = new MenuHandler(messageService, restaurantRepository, menuRepository);
    const panierHandler = new PanierHandler(messageService, menuRepository);
    const modeHandler = new ModeHandler(messageService);
    const livraisonHandler = new LivraisonHandler(messageService, restaurantRepository);
    const paiementHandler = new PaiementHandler(messageService, orderRepository, clientRepository);
    
    // Orchestrateur principal
    console.log('🎭 Creating orchestrator...');
    const orchestrator = new ConversationOrchestrator(
      messageService, 
      sessionService,
      [accueilHandler, menuHandler, panierHandler, modeHandler, livraisonHandler, paiementHandler]
    );
    
    // Vérifier que l'orchestrateur est créé
    if (!orchestrator) {
      throw new Error('Failed to initialize orchestrator');
    }
    
    console.log('✅ All services initialized successfully');
    
    globalServices = { 
      orchestrator, 
      messageService,
      supabase,
      repositories: {
        session: sessionRepository,
        restaurant: restaurantRepository,
        menu: menuRepository,
        client: clientRepository,
        order: orderRepository
      }
    };
    
    servicesInitialized = true;
    return globalServices;
    
  } catch (error) {
    console.error('❌ Error initializing services:', error);
    throw error;
  }
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Endpoint de santé
    if (req.method === 'GET' && url.pathname.includes('/health')) {
      const { messageService, supabase } = initializeServices();
      const greenAPI = messageService as GreenAPIService;
      
      // Tester la connexion à la base de données
      const { data: dbTest } = await supabase.from('restaurants').select('count').single();
      const instanceState = await greenAPI.getInstanceState();
      
      return new Response(
        JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          whatsapp_instance_state: instanceState,
          database_connected: !!dbTest,
          environment: Deno.env.get('DENO_ENV') || 'development',
          version: '2.0.0-complete'
        }),
        {
          status: instanceState === 'authorized' ? 200 : 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // API Endpoints pour le dashboard (optionnel)
    if (req.method === 'GET' && url.pathname.includes('/api/stats')) {
      const { repositories } = initializeServices();
      const stats = await getSystemStats(repositories);
      
      return new Response(
        JSON.stringify(stats),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Webhook POST principal
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const webhook: GreenAPIWebhook = await req.json();
    console.log('📱 Received webhook:', webhook.typeWebhook, webhook.senderData?.chatId);

    const { orchestrator } = initializeServices();

    // Router selon le type de webhook
    switch (webhook.typeWebhook) {
      case 'incomingMessageReceived':
        await handleIncomingMessage(webhook, orchestrator);
        break;
        
      case 'outgoingMessageStatus':
        console.log('📤 Outgoing message status:', webhook);
        break;
        
      case 'stateInstanceChanged':
        console.log('🔄 Instance state changed:', webhook);
        await orchestrator.handleInstanceStateChange(webhook);
        break;
        
      default:
        console.log('❓ Unknown webhook type:', webhook.typeWebhook);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: Deno.env.get('DEBUG') === 'true' ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleIncomingMessage(
  webhook: GreenAPIWebhook, 
  orchestrator: ConversationOrchestrator
): Promise<void> {
  if (!webhook.senderData || !webhook.messageData) {
    console.log('❓ Invalid message data');
    return;
  }

  const { senderData, messageData, timestamp, idMessage } = webhook;
  
  let messageContent = '';
  let messageType: 'text' | 'location' | 'image' = 'text';
  let location: { latitude: number; longitude: number } | undefined;

  if (messageData.textMessageData) {
    messageContent = messageData.textMessageData.textMessage;
    messageType = 'text';
  } else if (messageData.locationMessageData) {
    location = {
      latitude: messageData.locationMessageData.latitude,
      longitude: messageData.locationMessageData.longitude
    };
    messageContent = '[Position partagée]';
    messageType = 'location';
  } else {
    console.log('📍 Unsupported message type:', messageData.typeMessage);
    return;
  }

  const incomingMessage = {
    from: senderData.chatId,
    content: messageContent,
    type: messageType,
    location: location,
    timestamp: new Date(timestamp * 1000),
    messageId: idMessage || `msg_${timestamp}`
  };

  console.log(`📨 Processing message from ${senderData.chatId}: ${messageContent}`);
  
  await orchestrator.handleIncomingMessage(incomingMessage);
}

async function getSystemStats(repositories: any): Promise<any> {
  try {
    const [restaurantCount, activeOrders, todayOrders] = await Promise.all([
      repositories.restaurant.findAll().then((r: any[]) => r.length),
      repositories.order.findActiveOrders().then((o: any[]) => o.length),
      repositories.order.findByFilter({
        createdAt: { gte: new Date().toDateString() }
      }).then((o: any[]) => o.length)
    ]);

    return {
      restaurants: restaurantCount,
      activeOrders: activeOrders,
      todayOrders: todayOrders,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      restaurants: 0,
      activeOrders: 0,
      todayOrders: 0,
      error: error.message
    };
  }
}

// Fonction pour nettoyer les sessions expirées (appelée périodiquement)
async function cleanupExpiredSessions(): Promise<void> {
  try {
    const { repositories } = initializeServices();
    const { session } = repositories;
    
    // Cette fonction pourrait être appelée par un cron job
    const expiredSessions = await session.findByFilter({
      expires_at: { lt: new Date().toISOString() }
    });
    
    let cleaned = 0;
    for (const session of expiredSessions) {
      if (await session.delete(session.id)) {
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired sessions`);
    }
  } catch (error) {
    console.error('Error cleaning sessions:', error);
  }
}

// Nettoyer les sessions au démarrage et toutes les heures
cleanupExpiredSessions();
setInterval(cleanupExpiredSessions, 60 * 60 * 1000); // 1 heure

console.log('🚀 Bot Restaurant WhatsApp (Complete) webhook started!');
console.log('🔗 Green API Instance ID:', Deno.env.get('GREEN_API_INSTANCE_ID'));
console.log('🗄️ Database URL:', Deno.env.get('SUPABASE_URL'));
console.log('📊 Environment:', Deno.env.get('DENO_ENV') || 'development');
console.log('🎯 Features: Full database integration, session management, order processing');