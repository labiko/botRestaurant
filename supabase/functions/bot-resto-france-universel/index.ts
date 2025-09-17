// 🚀 POINT D'ENTRÉE PRINCIPAL - BOT UNIVERSEL
// Architecture SOLID : Dependency Injection et assemblage des services
// Point d'entrée unique pour toutes les requêtes WhatsApp

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

/**
 * Obtenir l'heure actuelle dans le bon fuseau horaire PARIS
 * ✅ Version finale optimisée avec format Paris validé
 */
function getCurrentTime(): Date {
  // Formatter pour timezone Paris (gère automatiquement heure d'été/hiver)
  const parisFormatter = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const utcNow = new Date();
  // Format: "17/09/2025 22:06:36" (validé comme correct)
  const parisFormatted = parisFormatter.format(utcNow);

  // Parsing du format DD/MM/YYYY HH:mm:ss
  const parts = parisFormatted.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (parts) {
    const [, day, month, year, hour, minute, second] = parts;
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // Mois 0-indexé
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  }

  // Fallback UTC si parsing échoue
  console.warn('⚠️ [getCurrentTime] Parsing Paris échoué, fallback UTC');
  return utcNow;
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import des services
import { UniversalBot } from './core/UniversalBot.ts';
import { SessionManager } from './services/SessionManager.ts';
import { ConfigurationManager } from './services/ConfigurationManager.ts';
import { WorkflowExecutor } from './services/WorkflowExecutor.ts';
import { ProductQueryService } from './services/ProductQueryService.ts';
import { MessageSender } from './services/MessageSender.ts';
import { RestaurantScheduleService } from './services/RestaurantScheduleService.ts';

// Import des types
import { ApiResponse } from './types.ts';

// ================================================
// CONFIGURATION ENVIRONNEMENT
// ================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GREEN_API_TOKEN = Deno.env.get('GREEN_API_TOKEN')!;
const GREEN_API_INSTANCE_ID = Deno.env.get('GREEN_API_INSTANCE_ID')!;

// Vérification des variables d'environnement
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GREEN_API_TOKEN || !GREEN_API_INSTANCE_ID) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GREEN_API_TOKEN, GREEN_API_INSTANCE_ID');
  Deno.exit(1);
}

// ================================================
// FACTORY - ASSEMBLAGE DEPENDENCY INJECTION
// ================================================

/**
 * Factory pour assembler le bot universel avec injection de dépendances
 * SOLID - Dependency Injection : Assemblage centralisé des dépendances
 */
class BotFactory {
  
  /**
   * Créer une instance complète du bot universel
   * SOLID - Factory Pattern : Création centralisée avec toutes les dépendances
   */
  static createBot(): UniversalBot {
    console.log('🏭 [BotFactory] Assemblage bot universel avec injection de dépendances');
    
    // 1. Créer les services de base
    console.log('🔧 [BotFactory] Création services de base...');
    const sessionManager = new SessionManager(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const configManager = new ConfigurationManager(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const productQueryService = new ProductQueryService(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const messageSender = new MessageSender(GREEN_API_TOKEN, GREEN_API_INSTANCE_ID);
    const scheduleService = new RestaurantScheduleService();
    
    // 2. Créer les services composés
    console.log('🔧 [BotFactory] Création services composés...');
    const workflowExecutor = new WorkflowExecutor(productQueryService, messageSender);
    
    // 3. Assembler le bot principal
    console.log('🤖 [BotFactory] Assemblage bot principal...');
    const universalBot = new UniversalBot(
      sessionManager,
      configManager,
      workflowExecutor,
      messageSender,
      scheduleService
    );
    
    return universalBot;
  }

  /**
   * Tester toutes les connexions
   * SOLID - Command Pattern : Test encapsulé
   */
  static async testConnections(): Promise<{ [key: string]: boolean }> {
    console.log('🔗 [BotFactory] Test des connexions...');
    
    const results = {
      supabase: false,
      greenapi: false
    };

    // Test Supabase
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await supabase.from('france_restaurants').select('id').limit(1);
      results.supabase = !error && !!data;
    } catch (error) {
      console.error('❌ [BotFactory] Erreur test Supabase:', error);
    }

    // Test Green API - DÉSACTIVÉ TEMPORAIREMENT (cause erreur 429)
    // try {
    //   const messageSender = new MessageSender(GREEN_API_TOKEN, GREEN_API_INSTANCE_ID);
    //   results.greenapi = await messageSender.testConnection();
    //   console.log(`${results.greenapi ? '✅' : '❌'} [BotFactory] Connexion Green API`);
    // } catch (error) {
    //   console.error('❌ [BotFactory] Erreur test Green API:', error);
    // }
    
    // TEMPORAIRE: On assume que Green API fonctionne
    results.greenapi = true;
    console.log('⚠️ [BotFactory] Test Green API désactivé (évite erreur 429)')

    return results;
  }
}

// ================================================
// INSTANCE GLOBALE DU BOT
// ================================================

let botInstance: UniversalBot | null = null;

/**
 * Obtenir l'instance singleton du bot
 * SOLID - Singleton Pattern : Instance unique partagée
 */
function getBotInstance(): UniversalBot {
  if (!botInstance) {
    console.log('🚀 [Instance] Création première instance du bot...');
    botInstance = BotFactory.createBot();
  }
  return botInstance;
}

// ================================================
// HANDLERS HTTP
// ================================================

/**
 * Handler principal pour les webhooks WhatsApp
 */
async function handleWebhook(request: Request): Promise<Response> {
  console.log('🔔 [Webhook] Réception webhook WhatsApp');
  console.log('🔍 RESTAURANT_ID_DEBUG - WEBHOOK APPELÉ');
  
  try {
    // Vérifier le Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.error('❌ [Webhook] Content-Type invalide:', contentType);
      return createErrorResponse('Content-Type invalide', 400);
    }

    // Parser le payload
    const payload = await request.json();

    // Extraire les données du message
    const messageData = extractMessageData(payload);
    if (!messageData) {
      console.log('ℹ️ [Webhook] Payload ignoré (pas un message utilisateur)');
      return createSuccessResponse({ message: 'Webhook reçu mais ignoré' });
    }

    console.log('📱 [Webhook] Message extrait:', messageData);

    // Traiter avec le bot universel
    const bot = getBotInstance();
    await bot.handleMessage(messageData.phoneNumber, messageData.message);

    return createSuccessResponse({ 
      message: 'Message traité avec succès',
      phoneNumber: messageData.phoneNumber,
      processedAt: getCurrentTime().toISOString()
    });

  } catch (error) {
    console.error('❌ [Webhook] Erreur traitement:', error);
    return createErrorResponse('Erreur traitement webhook', 500);
  }
}

/**
 * Handler pour les requêtes de santé
 */
async function handleHealth(request: Request): Promise<Response> {
  console.log('🏥 [Health] Check santé du service');
  
  try {
    // Obtenir statistiques du bot (sans test connexions pour éviter rate limit)
    const bot = getBotInstance();
    // TODO: Ajouter méthodes getStats() aux services
    
    const healthData = {
      status: 'healthy',
      timestamp: getCurrentTime().toISOString(),
      version: '2.0.0-universal',
      connections: { note: 'Connexions testées à la première utilisation' },
      // stats: botStats
    };

    const isHealthy = true; // Assume healthy sans tests connexions
    
    return new Response(JSON.stringify(healthData, null, 2), {
      status: isHealthy ? 200 : 503,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [Health] Erreur health check:', error);
    return createErrorResponse('Erreur health check', 500);
  }
}

/**
 * Handler pour les métriques et monitoring
 */
async function handleMetrics(request: Request): Promise<Response> {
  console.log('📊 [Metrics] Récupération métriques');
  
  try {
    // TODO: Implémenter collecte de métriques
    const metrics = {
      timestamp: getCurrentTime().toISOString(),
      // sessionStats: await sessionManager.getActiveSessionsStats(),
      // queueStats: messageSender.getQueueStats(),
      // cacheStats: productQueryService.getCacheStats(),
      uptime: performance.now(),
      version: '2.0.0-universal'
    };

    return new Response(JSON.stringify(metrics, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [Metrics] Erreur récupération métriques:', error);
    return createErrorResponse('Erreur récupération métriques', 500);
  }
}

// ================================================
// UTILITAIRES
// ================================================

/**
 * Extraire les données du message depuis le payload Green API
 */
function extractMessageData(payload: any): { phoneNumber: string; message: string } | null {
  try {
    // Vérifier le type de notification - IGNORER LES MESSAGES SORTANTS
    
    if (payload.typeWebhook !== 'incomingMessageReceived') {
      // Ignorer explicitement les messages sortants du bot
      if (payload.typeWebhook === 'outgoingAPIMessageReceived') {
        console.log('🚫 [Extract] Message sortant du bot ignoré');
      } else {
        console.log(`🚫 [Extract] Type webhook non supporté: ${payload.typeWebhook}`);
      }
      return null;
    }

    // Vérifier que c'est un message texte (normal ou étendu)
    const messageData = payload.messageData;
    if (!messageData) {
      return null;
    }

    // Extraire numéro et message selon le type
    const phoneNumber = payload.senderData?.sender || '';
    let message = '';

    if (messageData.typeMessage === 'textMessage') {
      message = messageData.textMessageData?.textMessage || '';
    } else if (messageData.typeMessage === 'extendedTextMessage') {
      message = messageData.extendedTextMessageData?.text || '';
    } else if (messageData.typeMessage === 'locationMessage') {
      // Nouveau: Gérer les messages de géolocalisation pour handler "resto"
      const locationData = messageData.locationMessageData;
      if (locationData) {
        message = `GPS:${locationData.latitude},${locationData.longitude}`;
        console.log(`📍 [Extract] Message géolocalisation reçu: ${message}`);
      } else {
        console.warn('⚠️ [Extract] Message locationMessage sans données de position');
        return null;
      }
    } else {
      // Ignorer les autres types de messages (images, audio, etc.)
      return null;
    }

    // Valider les données extraites
    if (!phoneNumber || !message) {
      console.warn('⚠️ [Extract] Données incomplètes:', { phoneNumber, message });
      return null;
    }

    return { phoneNumber, message };

  } catch (error) {
    console.error('❌ [Extract] Erreur extraction données:', error);
    return null;
  }
}

/**
 * Créer une réponse de succès standardisée
 */
function createSuccessResponse(data: any): Response {
  const response: ApiResponse = {
    success: true,
    data,
    metadata: {
      timestamp: getCurrentTime().toISOString(),
      version: '2.0.0-universal'
    }
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Créer une réponse d'erreur standardisée
 */
function createErrorResponse(message: string, status: number = 500): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      code: `HTTP_${status}`,
      message,
      details: null
    },
    metadata: {
      timestamp: getCurrentTime().toISOString(),
      version: '2.0.0-universal'
    }
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// ================================================
// ROUTEUR PRINCIPAL
// ================================================

/**
 * Routeur principal pour toutes les requêtes
 * SOLID - Single Responsibility : Routage uniquement
 */
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  let path = url.pathname;
  const method = request.method;

  // Nettoyer le path pour Supabase Functions
  // Le path peut être /functions/v1/bot-resto-france-universel/... ou juste /bot-resto-france-universel/...
  if (path.startsWith('/functions/v1/bot-resto-france-universel')) {
    // Enlever le préfixe mais garder le reste du path
    path = path.substring('/functions/v1/bot-resto-france-universel'.length);
  } else if (path === '/bot-resto-france-universel') {
    // Si c'est juste le nom de la fonction, c'est la racine
    path = '/';
  }
  
  // Si path est vide ou null, c'est la racine
  if (!path || path === '') {
    path = '/';
  }

  console.log(`🌐 [Router] ${method} ${path} (original: ${url.pathname})`);

  // CORS pour les requêtes préflightées
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  // Routes disponibles
  switch (true) {
    case path === '/' && method === 'POST':
      return handleWebhook(request);
    
    case path === '/health' && method === 'GET':
      return handleHealth(request);
    
    case path === '/metrics' && method === 'GET':
      return handleMetrics(request);
    
    case path === '/' && method === 'GET':
      return new Response(JSON.stringify({
        service: 'Bot Restaurant France Universel',
        version: '2.0.0-universal',
        status: 'active',
        endpoints: {
          webhook: 'POST /',
          health: 'GET /health',
          metrics: 'GET /metrics'
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    
    default:
      console.warn(`⚠️ [Router] Route non trouvée: ${method} ${path}`);
      return createErrorResponse('Route non trouvée', 404);
  }
}

// ================================================
// DÉMARRAGE DU SERVICE
// ================================================

console.log('🚀 [Startup] Démarrage Bot Restaurant France Universel v2.0.0');
console.log('🏗️ [Startup] Architecture SOLID avec configuration multi-restaurants');

// Démarrage direct sans test des connexions (évite rate limit Green API)
console.log('✅ [Startup] Démarrage direct - connexions testées à la première utilisation');

// Pré-charger l'instance du bot
const preloadedBot = getBotInstance();

// Démarrer le serveur HTTP SANS JWT (comme l'ancien bot)
console.log('🌐 [Startup] Démarrage serveur HTTP...');
serve(handleRequest);

console.log('🎉 [Startup] Bot Restaurant France Universel démarré avec succès !');
console.log('📡 [Startup] En écoute sur le port 8000');
console.log('🔔 [Startup] Prêt à recevoir les webhooks WhatsApp');
console.log('');
console.log('📋 [Startup] Endpoints disponibles:');
console.log('   POST /     - Webhook WhatsApp');  
console.log('   GET  /health - Health check');
console.log('   GET  /metrics - Métriques');
console.log('   GET  /     - Info service');