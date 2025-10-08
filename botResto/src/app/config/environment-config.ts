// 🔧 CONFIGURATION ENVIRONNEMENT - HYBRIDE LOCAL/VERCEL
// =========================================================
// MODIFIER CETTE VARIABLE POUR BASCULER EN LOCAL !
// =========================================================

// Détection automatique pour builds (Vercel), manuel pour local
import { environment } from '../../environments/environment';

// ✅ MODIFIER CETTE LIGNE EN LOCAL pour basculer DEV/PROD
const LOCAL_ENVIRONMENT: 'DEV' | 'PROD' = 'PROD';

// Auto-détection pour Vercel, sinon utilise LOCAL_ENVIRONMENT
export const CURRENT_ENVIRONMENT: 'DEV' | 'PROD' =
  typeof environment !== 'undefined' && 'production' in environment
    ? (environment.production ? 'PROD' : 'DEV')
    : LOCAL_ENVIRONMENT;

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

// Récupération simple de l'environnement Vercel
const getVercelEnvironment = (): 'DEV' | 'PROD' => {
  // Vérification sécurisée pour Angular/Vercel
  if (typeof process !== 'undefined' && process.env && process.env['NEXT_PUBLIC_ENVIRONMENT']) {
    const env = process.env['NEXT_PUBLIC_ENVIRONMENT'];
    return env === 'PROD' ? 'PROD' : 'DEV';
  }

  // Fallback local
  return CURRENT_ENVIRONMENT;
};

// Environnement final
const FINAL_ENVIRONMENT = getVercelEnvironment();

// Configuration utilisée (logs discrets pour debug si nécessaire)
console.log('🔧 [CONFIG] Environnement final:', FINAL_ENVIRONMENT);

// Configuration finale simplifiée
export const FRANCE_CONFIG = {
  supabaseFranceUrl: ENVIRONMENTS[FINAL_ENVIRONMENT].supabaseFranceUrl,
  supabaseFranceAnonKey: ENVIRONMENTS[FINAL_ENVIRONMENT].supabaseFranceAnonKey,
  vercelUrl: ENVIRONMENTS[FINAL_ENVIRONMENT].vercelUrl,

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
    webhookUrl: `${ENVIRONMENTS[FINAL_ENVIRONMENT].supabaseFranceUrl}/functions/v1/payment-webhook-handler`
  },

  environmentName: ENVIRONMENTS[FINAL_ENVIRONMENT].environmentName,
  debugMode: ENVIRONMENTS[FINAL_ENVIRONMENT].debugMode
};

// Configuration exportée sans logs de debug