export const environment = {
  production: true,
  // URL de production Vercel
  productionUrl: 'https://botresto.vercel.app',
  // Configuration Guinée (existante)
  supabase: {
    url: 'https://ymlzjvposzzdgpksgvsn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbHpqdnBvc3p6ZGdwa3NndnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjIyMTksImV4cCI6MjA3MTQzODIxOX0.vMq49kBoK-uXBr2mDhs0dakwUnZts-BBqVSympdDjgY'
  },
  // 🏭 Configuration France PRODUCTION
  supabaseFranceUrl: 'https://vywbhlnzvfqtiurwmrac.supabase.co',
  supabaseFranceAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5d2JobG56dmZxdGl1cndtcmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzE3NzcsImV4cCI6MjA3MjMwNzc3N30.cZHFxzk2FNtxfTaDupsUcSJ6d5KCiVW3Dym9CElkeq0',
  // Configuration Green API (production)
  greenApi: {
    instanceId: '7105313693',
    apiToken: '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693',
    baseUrl: 'https://7105.api.greenapi.com'
  },

  // 🤖 Numéro WhatsApp du Bot Universel (PROD)
  botWhatsAppNumber: '33753058254',

  // 🔍 INDICATEUR D'ENVIRONNEMENT
  environmentName: 'PROD',
  debugMode: false,

  // 💳 Configuration URLs de callback paiement
  payment: {
    successUrl: 'https://botresto.vercel.app/payment/success',
    cancelUrl: 'https://botresto.vercel.app/payment/cancel'
  }
};
