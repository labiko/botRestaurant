// Configuration des URLs de l'application selon l'environnement
const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'DEV'

// URLs de base selon l'environnement
const APP_URLS = {
  DEV: 'https://menu-ai-admin-git-dev.vercel.app',
  PROD: 'https://menu-ai-admin.vercel.app'
}

// URL actuelle selon l'environnement
export const APP_URL = isDev ? APP_URLS.DEV : APP_URLS.PROD

// URLs de callback paiement
export const PAYMENT_CALLBACK_URLS = {
  success: `${APP_URL}/payment-success.html`,
  cancel: `${APP_URL}/payment-cancel.html`
}

// Log pour debug
console.log('🔧 [App Config] Environnement:', isDev ? 'DEV' : 'PROD')
console.log('🔧 [App Config] URL:', APP_URL)
