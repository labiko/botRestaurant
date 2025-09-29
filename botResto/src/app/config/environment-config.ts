// 🔧 CONFIGURATION ENVIRONNEMENT - HYBRIDE LOCAL/VERCEL
// =========================================================
// MODIFIER CETTE VARIABLE POUR BASCULER EN LOCAL !
// =========================================================

export const CURRENT_ENVIRONMENT: 'DEV' | 'PROD' = 'DEV';

// =========================================================
// CONFIGURATIONS HYBRIDES
// =========================================================

const ENVIRONMENTS = {
  DEV: {
    supabaseFranceUrl: 'https://lphvdoyhwaelmwdfkfuh.supabase.co',
    supabaseFranceAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwaHZkb3lod2FlbG13ZGZrZnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDM5MjYsImV4cCI6MjA3Mzc3OTkyNn0.vzB1my0OcAGdZ5qA37cbNnzs2D8K0Kox_L54M4GdydU',
    environmentName: 'DEV',
    debugMode: true
  },
  PROD: {
    supabaseFranceUrl: 'https://vywbhlnzvfqtiurwmrac.supabase.co',
    supabaseFranceAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5d2JobG56dmZxdGl1cndtcmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzE3NzcsImV4cCI6MjA3MjMwNzc3N30.cZHFxzk2FNtxfTaDupsUcSJ6d5KCiVW3Dym9CElkeq0',
    environmentName: 'PROD',
    debugMode: false
  }
};

// Vérification sécurisée de l'environnement pour Angular
const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

// Configuration finale : Variables Vercel OU config locale
export const FRANCE_CONFIG = {
  supabaseFranceUrl: getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || ENVIRONMENTS[CURRENT_ENVIRONMENT].supabaseFranceUrl,
  supabaseFranceAnonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || ENVIRONMENTS[CURRENT_ENVIRONMENT].supabaseFranceAnonKey,

  // Green API (identique pour DEV et PROD)
  greenApi: {
    instanceId: getEnvVar('NEXT_PUBLIC_GREEN_API_INSTANCE_ID') || '7105313693',
    apiToken: getEnvVar('NEXT_PUBLIC_GREEN_API_TOKEN') || '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693',
    baseUrl: getEnvVar('NEXT_PUBLIC_GREEN_API_BASE_URL') || 'https://7105.api.greenapi.com'
  },

  environmentName: ENVIRONMENTS[CURRENT_ENVIRONMENT].environmentName,
  debugMode: ENVIRONMENTS[CURRENT_ENVIRONMENT].debugMode
};

// Configuration exportée sans logs de debug