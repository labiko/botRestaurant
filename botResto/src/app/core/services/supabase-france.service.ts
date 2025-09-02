import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseFranceService {
  private supabase: SupabaseClient;

  constructor() {
    // Configuration spécifique à la France
    const supabaseUrl = environment.supabaseFranceUrl || 'https://votre-project-france.supabase.co';
    const supabaseKey = environment.supabaseFranceAnonKey || 'votre-anon-key-france';

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    
    console.log('🇫🇷 [SupabaseFrance] Service initialisé:', {
      url: supabaseUrl,
      keyPrefix: supabaseKey.substring(0, 20) + '...'
    });

    // Test de connexion automatique
    this.testConnection().then(result => {
      console.log('🧪 [SupabaseFrance] Test connexion:', result.message);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Tester la connexion à la base France
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await this.supabase
        .from('france_restaurants')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ [SupabaseFrance] Erreur connexion:', error);
        return { 
          success: false, 
          message: `Erreur connexion: ${error.message}` 
        };
      }

      console.log('✅ [SupabaseFrance] Connexion réussie');
      return { 
        success: true, 
        message: 'Connexion à la base France réussie' 
      };
    } catch (error) {
      console.error('❌ [SupabaseFrance] Erreur test:', error);
      return { 
        success: false, 
        message: `Erreur test: ${error}` 
      };
    }
  }
}