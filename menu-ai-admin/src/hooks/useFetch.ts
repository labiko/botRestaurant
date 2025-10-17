'use client';

import { useEnvironment } from '@/contexts/EnvironmentContext';

/**
 * Hook personnalisé pour fetch avec environnement automatique
 *
 * STRATÉGIE DOUBLE INJECTION pour compatibilité maximale :
 * - Injecte TOUJOURS dans l'URL (pour getSupabaseForRequest)
 * - Injecte AUSSI dans le body JSON si présent (pour APIs qui lisent le body)
 */
export function useFetch() {
  const { environment } = useEnvironment();

  const fetchWithEnv = (url: string, options?: RequestInit) => {
    // 1. TOUJOURS ajouter dans l'URL (rétro-compatibilité)
    const separator = url.includes('?') ? '&' : '?';
    const urlWithEnv = `${url}${separator}environment=${environment}`;

    // 2. Si la requête a un body JSON, ajouter l'environnement dedans aussi
    if (options?.body) {
      try {
        const bodyData = JSON.parse(options.body as string);
        bodyData.environment = environment;

        return fetch(urlWithEnv, {
          ...options,
          body: JSON.stringify(bodyData)
        });
      } catch (error) {
        // Si le body n'est pas JSON, utiliser juste l'URL
        return fetch(urlWithEnv, options);
      }
    }

    // 3. Pas de body : juste l'URL (cas GET classique)
    return fetch(urlWithEnv, options);
  };

  return { fetch: fetchWithEnv };
}
