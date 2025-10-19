// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // URL de production Vercel
  productionUrl: 'https://botresto.vercel.app',
  // Configuration Guinée (existante)
  supabase: {
    url: 'https://ymlzjvposzzdgpksgvsn.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbHpqdnBvc3p6ZGdwa3NndnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjIyMTksImV4cCI6MjA3MTQzODIxOX0.vMq49kBoK-uXBr2mDhs0dakwUnZts-BBqVSympdDjgY'
  },
  // 🔧 Configuration France DEV (par défaut en développement)
  supabaseFranceUrl: 'https://lphvdoyhwaelmwdfkfuh.supabase.co',
  supabaseFranceAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwaHZkb3lod2FlbG13ZGZrZnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDM5MjYsImV4cCI6MjA3Mzc3OTkyNn0.JhO4gqZ2qFc2DmLe-ssyWf3GGOiRVopxBVJtyI8DbkY',
  // Configuration Green API (développement)
  greenApi: {
    instanceId: '7105313693',
    apiToken: '994e56511a43455693d2c4c1e4be86384a27eb921c394d5693',
    baseUrl: 'https://7105.api.greenapi.com'
  },

  // 🤖 Numéro WhatsApp du Bot Universel
  botWhatsAppNumber: '33753058254',

  // 🔍 INDICATEUR D'ENVIRONNEMENT
  environmentName: 'DEV',
  debugMode: true,

  // 💳 Configuration URLs de callback paiement
  payment: {
    successUrl: 'https://botresto.vercel.app/payment/success',
    cancelUrl: 'https://botresto.vercel.app/payment/cancel'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
