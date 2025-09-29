// 🔧 CONFIGURATION ENVIRONNEMENT - VARIABLES VERCEL
// =========================================================
// Configuration automatique via variables d'environnement Vercel
// =========================================================

// Détection automatique environnement via variables Vercel
const isProduction = process.env['VERCEL_ENV'] === 'production';
const environmentName = isProduction ? 'PROD' : 'DEV';

// Configuration unifiée avec variables d'environnement
export const FRANCE_CONFIG = {
  supabaseFranceUrl: process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
  supabaseFranceAnonKey: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '',

  // Green API (identique pour DEV et PROD)
  greenApi: {
    instanceId: process.env['NEXT_PUBLIC_GREEN_API_INSTANCE_ID'] || '7105313693',
    apiToken: process.env['NEXT_PUBLIC_GREEN_API_TOKEN'] || '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693',
    baseUrl: process.env['NEXT_PUBLIC_GREEN_API_BASE_URL'] || 'https://7105.api.greenapi.com'
  },

  environmentName,
  debugMode: !isProduction
};

// Configuration exportée sans logs de debug