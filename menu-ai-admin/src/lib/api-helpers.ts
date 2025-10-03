import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseDataLoader } from './supabase-data-loader';

/**
 * Extrait l'environnement depuis la requête
 * Par défaut: DEV
 */
export function getEnvironmentFromRequest(request: NextRequest): 'DEV' | 'PROD' {
  const url = new URL(request.url);
  const env = url.searchParams.get('environment');
  return (env === 'PROD' || env === 'DEV') ? env : 'DEV';
}

/**
 * Crée une instance SupabaseDataLoader avec l'environnement de la requête
 */
export function getSupabaseForRequest(request: NextRequest) {
  const environment = getEnvironmentFromRequest(request);
  return new SupabaseDataLoader(environment);
}

/**
 * Crée un client Supabase direct selon l'environnement de la requête
 */
export function getSupabaseClientForRequest(request: NextRequest) {
  const environment = getEnvironmentFromRequest(request);
  const supabaseUrl = environment === 'PROD'
    ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD
    : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = environment === 'PROD'
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient(supabaseUrl!, supabaseKey!);
}
