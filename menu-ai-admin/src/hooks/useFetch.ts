'use client';

import { useEnvironment } from '@/contexts/EnvironmentContext';

/**
 * Hook personnalisé pour fetch avec environnement automatique
 */
export function useFetch() {
  const { environment } = useEnvironment();

  const fetchWithEnv = (url: string, options?: RequestInit) => {
    const separator = url.includes('?') ? '&' : '?';
    const urlWithEnv = `${url}${separator}environment=${environment}`;
    return fetch(urlWithEnv, options);
  };

  return { fetch: fetchWithEnv };
}
