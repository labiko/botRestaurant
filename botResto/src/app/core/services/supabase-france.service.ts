import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { FRANCE_CONFIG, CURRENT_ENVIRONMENT } from '../../config/environment-config';

@Injectable({
  providedIn: 'root'
})
export class SupabaseFranceService {
  private supabase: SupabaseClient;

  constructor() {
    // 🔧 UTILISATION CONFIGURATION CENTRALISÉE
    const supabaseUrl = FRANCE_CONFIG.supabaseFranceUrl;
    const supabaseKey = FRANCE_CONFIG.supabaseFranceAnonKey;

    // 🔍 LOGS DEBUG ENVIRONNEMENT
    console.log('🔍 [BACKOFFICE_DEBUG] ==========================================');
    console.log('🔍 [BACKOFFICE_DEBUG] ENVIRONNEMENT CONFIGURÉ:', CURRENT_ENVIRONMENT);
    console.log('🔍 [BACKOFFICE_DEBUG] Supabase URL:', supabaseUrl);
    console.log('🔍 [BACKOFFICE_DEBUG] Supabase KEY (20 premiers chars):', supabaseKey.substring(0, 20) + '...');
    console.log('🔍 [BACKOFFICE_DEBUG] Green API Instance ID:', FRANCE_CONFIG.greenApi.instanceId);
    console.log('🔍 [BACKOFFICE_DEBUG] Green API URL:', FRANCE_CONFIG.greenApi.baseUrl);
    console.log('🔍 [BACKOFFICE_DEBUG] Debug mode:', FRANCE_CONFIG.debugMode);
    console.log('🔍 [BACKOFFICE_DEBUG] ==========================================');

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    // Test de connexion automatique avec logs
    this.testConnection().then(result => {
      if (result.success) {
        console.log(`✅ [BACKOFFICE_DEBUG] Connexion ${CURRENT_ENVIRONMENT} réussie`);
      } else {
        console.error(`❌ [BACKOFFICE_DEBUG] Échec connexion ${CURRENT_ENVIRONMENT}:`, result.message);
      }
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