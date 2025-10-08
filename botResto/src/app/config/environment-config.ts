// 🔧 CONFIGURATION ENVIRONNEMENT - DÉTECTION AUTOMATIQUE
// =========================================================
// Utilise environment.production pour détecter DEV/PROD
// =========================================================

import { environment } from '../../environments/environment';

// Détection automatique via Angular environment
export const CURRENT_ENVIRONMENT: 'DEV' | 'PROD' = environment.production ? 'PROD' : 'DEV';

// =========================================================
// CONFIGURATIONS HYBRIDES
// =========================================================

const ENVIRONMENTS = {
  DEV: {
    supabaseFranceUrl: 'https://lphvdoyhwaelmwdfkfuh.supabase.co',
    supabaseFranceAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwaHZkb3lod2FlbG13ZGZrZnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDM5MjYsImV4cCI6MjA3Mzc3OTkyNn0.vzB1my0OcAGdZ5qA37cbNnzs2D8K0Kox_L54M4GdydU',
    vercelUrl: 'https://botrestodev.vercel.app',
    environmentName: 'DEV',
    debugMode: true
  },
  PROD: {
    supabaseFranceUrl: 'https://vywbhlnzvfqtiurwmrac.supabase.co',
    supabaseFranceAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5d2JobG56dmZxdGl1cndtcmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzE3NzcsImV4cCI6MjA3MjMwNzc3N30.cZHFxzk2FNtxfTaDupsUcSJ6d5KCiVW3Dym9CElkeq0',
    vercelUrl: 'https://botresto.vercel.app',
    environmentName: 'PROD',
    debugMode: false
  }
};

// Configuration utilisée (logs discrets pour debug)
console.log('🔧 [CONFIG] Environnement détecté:', CURRENT_ENVIRONMENT);

// Sélection automatique de l'environnement
const SELECTED_ENV = ENVIRONMENTS[CURRENT_ENVIRONMENT];

// Configuration finale - Automatique selon build
export const FRANCE_CONFIG = {
  supabaseFranceUrl: SELECTED_ENV.supabaseFranceUrl,
  supabaseFranceAnonKey: SELECTED_ENV.supabaseFranceAnonKey,
  vercelUrl: SELECTED_ENV.vercelUrl,

  // Green API (identique pour DEV et PROD)
  greenApi: {
    instanceId: '7105313693',
    apiToken: '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693',
    baseUrl: 'https://7105.api.greenapi.com'
  },

  // URLs de callback paiement (fichiers HTML statiques dans /public)
  payment: {
    successUrl: `https://menu-ai-admin.vercel.app/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `https://menu-ai-admin.vercel.app/payment-cancel.html?session_id={CHECKOUT_SESSION_ID}`,
    webhookUrl: `${SELECTED_ENV.supabaseFranceUrl}/functions/v1/payment-webhook-handler`
  },

  environmentName: SELECTED_ENV.environmentName,
  debugMode: SELECTED_ENV.debugMode
};

// Configuration exportée sans logs de debug