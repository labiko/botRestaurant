import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

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
    console.log(`🔧 [AppConfig] Configuration initialisée pour ${this.config.production ? 'PRODUCTION' : 'DÉVELOPPEMENT'}`);
    console.log(`📍 [AppConfig] Base URL: ${this.config.baseUrl}`);
  }

  /**
   * Initialiser la configuration selon l'environnement
   */
  private initializeConfig(): AppEnvironmentConfig {
    const isDevelopment = this.isDevelopmentEnvironment();
    const baseUrl = this.detectBaseUrl();

    return {
      production: !isDevelopment,
      baseUrl: baseUrl,
      apiUrl: baseUrl + '/api',
      webAppUrl: baseUrl,
      tokenAcceptanceUrl: baseUrl + '/restaurant-france/delivery-france/accept',
      supabaseUrl: environment.supabase?.url || '',
      supabaseAnonKey: environment.supabase?.anonKey || ''
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
   * Détecter l'URL de base (utilise toujours la constante de production)
   */
  private detectBaseUrl(): string {
    // Utiliser toujours l'URL de production pour éviter les problèmes localhost
    return environment.productionUrl;
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
    console.log('Environment:', this.config.production ? 'PRODUCTION' : 'DÉVELOPPEMENT');
    console.log('Base URL:', this.config.baseUrl);
    console.log('API URL:', this.config.apiUrl);
    console.log('Token Acceptance URL:', this.config.tokenAcceptanceUrl);
    console.log('Supabase URL:', this.config.supabaseUrl ? '✓ Configuré' : '❌ Manquant');
    console.groupEnd();
  }

  /**
   * Mettre à jour la configuration (utile pour les tests ou changements runtime)
   */
  updateConfig(updates: Partial<AppEnvironmentConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('🔄 [AppConfig] Configuration mise à jour:', updates);
  }
}