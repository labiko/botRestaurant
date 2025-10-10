'use client';

import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useEnvironment } from '@/contexts/EnvironmentContext';

/**
 * Hook personnalisé pour obtenir le client Supabase avec environnement automatique
 */
export function useSupabase() {
  const { environment } = useEnvironment();

  const supabase = useMemo(() => {
    const supabaseUrl = environment === 'PROD'
      ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = environment === 'PROD'
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return createClient(supabaseUrl!, supabaseKey!);
  }, [environment]);

  return { supabase, environment };
}
