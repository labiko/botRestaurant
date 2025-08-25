/**
 * Configuration centralisée pour le rafraîchissement automatique
 * Ces constantes peuvent être facilement modifiées depuis ce fichier
 */
export const REFRESH_CONFIG = {
  // Intervalle de rafraîchissement principal (en millisecondes)
  DEFAULT_INTERVAL_MS: 2 * 60 * 1000, // 2 minutes - MODIFIABLE ICI

  // Timeout d'inactivité utilisateur (en millisecondes)
  INACTIVITY_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes - MODIFIABLE ICI

  // Intervalle de vérification d'inactivité (en millisecondes)
  INACTIVITY_CHECK_INTERVAL_MS: 30 * 1000, // 30 secondes

  // Configuration par défaut pour différents composants
  COMPONENTS: {
    RESTAURANT_ORDERS: {
      intervalMs: 2 * 60 * 1000, // 2 minutes - MODIFIABLE ICI
      pauseOnHidden: true,
      pauseOnInactive: true,
      inactivityTimeoutMs: 5 * 60 * 1000
    },
    
    PAYMENTS: {
      intervalMs: 3 * 60 * 1000, // 3 minutes pour les paiements
      pauseOnHidden: true,
      pauseOnInactive: true,
      inactivityTimeoutMs: 5 * 60 * 1000
    },
    
    HISTORY: {
      intervalMs: 5 * 60 * 1000, // 5 minutes pour l'historique (moins critique)
      pauseOnHidden: true,
      pauseOnInactive: true,
      inactivityTimeoutMs: 10 * 60 * 1000 // 10 minutes pour l'historique
    }
  },

  // Événements d'activité utilisateur à surveiller
  USER_ACTIVITY_EVENTS: [
    'mousedown', 
    'mousemove', 
    'keypress', 
    'scroll', 
    'touchstart', 
    'click'
  ] as const
} as const;

/**
 * Fonction utilitaire pour convertir minutes en millisecondes
 */
export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

/**
 * Fonction utilitaire pour convertir secondes en millisecondes
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Fonction pour formater le temps en texte lisible
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}min`;
  } else if (minutes > 0) {
    return `${minutes}min ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}