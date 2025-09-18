export const environment = {
  production: false,
  // URL de production Vercel
  productionUrl: 'https://botresto.vercel.app',

  // Configuration Guinée (existante)
  supabase: {
    url: 'https://ymlzjvposzzdgpksgvsn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbHpqdnBvc3p6ZGdwa3NndnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjIyMTksImV4cCI6MjA3MTQzODIxOX0.vMq49kBoK-uXBr2mDhs0dakwUnZts-BBqVSympdDjgY'
  },

  // 🔧 Configuration France DEV (projet séparé)
  supabaseFranceUrl: 'https://lphvdoyhwaelmwdfkfuh.supabase.co',
  supabaseFranceAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwaHZkb3lod2FlbG13ZGZrZnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDM5MjYsImV4cCI6MjA3Mzc3OTkyNn0.JhO4gqZ2qFc2DmLe-ssyWf3GGOiRVopxBVJtyI8DbkY',

  // Configuration Green API (développement)
  greenApi: {
    instanceId: '7105313693',
    apiToken: '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693',
    baseUrl: 'https://7105.api.greenapi.com'
  },

  // 🔍 INDICATEUR D'ENVIRONNEMENT
  environmentName: 'DEV',
  debugMode: true
};