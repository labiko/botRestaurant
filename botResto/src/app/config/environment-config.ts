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

console.log('🔧 [CONFIG] ==========================================');
console.log('🔧 [CONFIG] CURRENT_ENVIRONMENT (local):', CURRENT_ENVIRONMENT);
console.log('🔧 [CONFIG] NEXT_PUBLIC_ENVIRONMENT (Vercel):',
  (typeof process !== 'undefined' && process.env?.['NEXT_PUBLIC_ENVIRONMENT']) || 'NON DÉFINI'
);
console.log('🔧 [CONFIG] FINAL_ENVIRONMENT:', FINAL_ENVIRONMENT);
console.log('🔧 [CONFIG] ==========================================');

// Configuration finale simplifiée
export const FRANCE_CONFIG = {
  supabaseFranceUrl: ENVIRONMENTS[FINAL_ENVIRONMENT].supabaseFranceUrl,
  supabaseFranceAnonKey: ENVIRONMENTS[FINAL_ENVIRONMENT].supabaseFranceAnonKey,

  // Green API (identique pour DEV et PROD)
  greenApi: {
    instanceId: '7105313693',
    apiToken: '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693',
    baseUrl: 'https://7105.api.greenapi.com'
  },

  environmentName: ENVIRONMENTS[FINAL_ENVIRONMENT].environmentName,
  debugMode: ENVIRONMENTS[FINAL_ENVIRONMENT].debugMode
};

// Configuration exportée sans logs de debug