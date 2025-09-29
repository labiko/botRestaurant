import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FRANCE_CONFIG } from '../../config/environment-config';

export interface AppEnvironmentConfig {
  production: boolean;
  baseUrl: string;
  apiUrl: string;
  webAppUrl: string;
  tokenAcceptanceUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  private config: AppEnvironmentConfig;

  constructor() {
    this.config = this.initializeConfig();
  }

  /**
   * Initialiser la configuration selon l'environnement
   */
  private initializeConfig(): AppEnvironmentConfig {
    const isDevelopment = this.isDevelopmentEnvironment();
    const baseUrl = this.detectBaseUrl();

    console.log('🔧 [AppConfig] Environnement:', FRANCE_CONFIG.environmentName);
    console.log('🔧 [AppConfig] Base URL:', baseUrl);
    console.log('🔧 [AppConfig] Supabase:', FRANCE_CONFIG.supabaseFranceUrl);

    return {
      production: !isDevelopment,
      baseUrl: baseUrl,
      apiUrl: baseUrl + '/api',
      webAppUrl: baseUrl,
      tokenAcceptanceUrl: baseUrl + '/restaurant-france/delivery-france/accept',
      supabaseUrl: FRANCE_CONFIG.supabaseFranceUrl,
      supabaseAnonKey: FRANCE_CONFIG.supabaseFranceAnonKey
    };
  }

  /**
   * Détecter si on est en environnement de développement
   */
  private isDevelopmentEnvironment(): boolean {
    // Vérifier les indicateurs de développement
    if (!environment.production) return true;
    
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || 
             hostname === '127.0.0.1' || 
             hostname.includes('dev') ||
             hostname.includes('staging');
    }
    
    return false;
  }

  /**
   * Détecter l'URL de base (utilise la configuration selon l'environnement)
   */
  private detectBaseUrl(): string {
    // Utiliser l'URL selon l'environnement configuré
    return FRANCE_CONFIG.vercelUrl;
  }

  /**
   * Obtenir la configuration complète
   */
  getConfig(): AppEnvironmentConfig {
    return { ...this.config };
  }

  /**
   * Obtenir l'URL de base
   */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Obtenir l'URL d'acceptation des tokens
   */
  getTokenAcceptanceUrl(): string {
    return this.config.tokenAcceptanceUrl;
  }

  /**
   * Obtenir l'URL de l'API
   */
  getApiUrl(): string {
    return this.config.apiUrl;
  }

  /**
   * Vérifier si on est en production
   */
  isProduction(): boolean {
    return this.config.production;
  }

  /**
   * Obtenir les paramètres Supabase
   */
  getSupabaseConfig() {
    return {
      url: this.config.supabaseUrl,
      anonKey: this.config.supabaseAnonKey
    };
  }

  /**
   * Générer une URL complète pour les tokens d'acceptation
   */
  generateTokenUrl(token: string): string {
    return `${this.config.tokenAcceptanceUrl}?token=${token}`;
  }

  /**
   * Logger la configuration actuelle (pour debug)
   */
  logCurrentConfig(): void {
    console.group('🔧 Configuration de l\'application');
    console.groupEnd();
  }

  /**
   * Mettre à jour la configuration (utile pour les tests ou changements runtime)
   */
  updateConfig(updates: Partial<AppEnvironmentConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}