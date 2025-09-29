// 🔧 CONFIGURATION ENVIRONNEMENT - BASCULE UNIQUE
// =========================================================
// MODIFIER SEULEMENT CETTE VARIABLE POUR BASCULER !
// =========================================================

export const CURRENT_ENVIRONMENT: 'DEV' | 'PROD' = 'DEV';

// =========================================================
// CONFIGURATIONS AUTOMATIQUES
// =========================================================

const ENVIRONMENTS = {
  DEV: {
    supabaseFranceUrl: 'https://lphvdoyhwaelmwdfkfuh.supabase.co',
    supabaseFranceAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwaHZkb3lod2FlbG13ZGZrZnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDM5MjYsImV4cCI6MjA3Mzc3OTkyNn0.vzB1my0OcAGdZ5qA37cbNnzs2D8K0Kox_L54M4GdydU',
    // Green API (identique pour DEV et PROD)
    greenApi: {
      instanceId: '7105313693',
      apiToken: '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693',
      baseUrl: 'https://7105.api.greenapi.com'
    },
    environmentName: 'DEV',
    debugMode: true
  },
  PROD: {
    supabaseFranceUrl: 'https://vywbhlnzvfqtiurwmrac.supabase.co',
    supabaseFranceAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5d2JobG56dmZxdGl1cndtcmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzE3NzcsImV4cCI6MjA3MjMwNzc3N30.cZHFxzk2FNtxfTaDupsUcSJ6d5KCiVW3Dym9CElkeq0',
    // Green API (identique pour DEV et PROD)
    greenApi: {
      instanceId: '7105313693',
      apiToken: '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693',
      baseUrl: 'https://7105.api.greenapi.com'
    },
    environmentName: 'PROD',
    debugMode: false
  }
};

// Configuration active basée sur CURRENT_ENVIRONMENT
export const FRANCE_CONFIG = ENVIRONMENTS[CURRENT_ENVIRONMENT];

// Configuration exportée sans logs de debug