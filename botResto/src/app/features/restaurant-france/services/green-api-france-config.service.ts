import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GreenApiFranceService } from './green-api-france.service';

export interface GreenApiSettings {
  instanceId: string;
  apiToken: string;
  isConfigured: boolean;
  isConnected: boolean;
  lastCheck?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GreenApiFranceConfigService {
  
  private readonly STORAGE_KEY = 'green_api_config';
  
  private settingsSubject = new BehaviorSubject<GreenApiSettings>({
    instanceId: '8101819298',
    apiToken: '',
    isConfigured: false,
    isConnected: false
  });

  public settings$: Observable<GreenApiSettings> = this.settingsSubject.asObservable();

  constructor(private greenApiService: GreenApiFranceService) {
    this.loadConfiguration();
  }

  /**
   * Charger la configuration depuis le localStorage
   */
  private loadConfiguration(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        this.settingsSubject.next({
          ...this.settingsSubject.value,
          ...config
        });
        
        // Configurer le service Green API
        if (config.apiToken) {
          this.greenApiService.configure({
            instanceId: config.instanceId,
            apiToken: config.apiToken
          });
        }
        
        console.log('🔧 [GreenApiConfig] Configuration chargée depuis localStorage');
      }
    } catch (error) {
      console.error('❌ [GreenApiConfig] Erreur chargement configuration:', error);
    }
  }

  /**
   * Sauvegarder la configuration dans le localStorage
   */
  private saveConfiguration(settings: GreenApiSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        instanceId: settings.instanceId,
        apiToken: settings.apiToken,
        isConfigured: settings.isConfigured,
        lastCheck: settings.lastCheck
      }));
      console.log('💾 [GreenApiConfig] Configuration sauvegardée');
    } catch (error) {
      console.error('❌ [GreenApiConfig] Erreur sauvegarde:', error);
    }
  }

  /**
   * Configurer les paramètres Green API
   */
  async configure(instanceId: string, apiToken: string): Promise<{success: boolean, message: string}> {
    try {
      console.log('🔧 [GreenApiConfig] Configuration Green API...');
      
      // Configurer le service
      this.greenApiService.configure({
        instanceId,
        apiToken
      });

      // Tester la connexion
      const testResult = await this.greenApiService.testConnection();
      
      const newSettings: GreenApiSettings = {
        instanceId,
        apiToken,
        isConfigured: testResult.success,
        isConnected: testResult.success,
        lastCheck: new Date().toISOString()
      };

      // Sauvegarder et notifier
      this.settingsSubject.next(newSettings);
      this.saveConfiguration(newSettings);

      return {
        success: testResult.success,
        message: testResult.message
      };

    } catch (error) {
      console.error('❌ [GreenApiConfig] Erreur configuration:', error);
      return {
        success: false,
        message: 'Erreur lors de la configuration'
      };
    }
  }

  /**
   * Vérifier le statut de la connexion
   */
  async checkStatus(): Promise<{success: boolean, message: string}> {
    try {
      const currentSettings = this.settingsSubject.value;
      
      if (!currentSettings.isConfigured) {
        return {
          success: false,
          message: 'Green API non configuré'
        };
      }

      const statusResult = await this.greenApiService.checkInstanceStatus();
      
      // Mettre à jour le statut
      const updatedSettings = {
        ...currentSettings,
        isConnected: statusResult.isConnected,
        lastCheck: new Date().toISOString()
      };

      this.settingsSubject.next(updatedSettings);
      this.saveConfiguration(updatedSettings);

      return {
        success: statusResult.isConnected,
        message: statusResult.statusMessage
      };

    } catch (error) {
      console.error('❌ [GreenApiConfig] Erreur vérification status:', error);
      return {
        success: false,
        message: 'Erreur lors de la vérification'
      };
    }
  }

  /**
   * Obtenir les paramètres actuels
   */
  getCurrentSettings(): GreenApiSettings {
    return this.settingsSubject.value;
  }

  /**
   * Réinitialiser la configuration
   */
  resetConfiguration(): void {
    const defaultSettings: GreenApiSettings = {
      instanceId: '8101819298',
      apiToken: '',
      isConfigured: false,
      isConnected: false
    };

    this.settingsSubject.next(defaultSettings);
    localStorage.removeItem(this.STORAGE_KEY);
    
    console.log('🔄 [GreenApiConfig] Configuration réinitialisée');
  }

  /**
   * Obtenir le QR code pour la connexion WhatsApp
   */
  async getQrCode(): Promise<{success: boolean, qrCode?: string, error?: string}> {
    try {
      const settings = this.getCurrentSettings();
      
      if (!settings.isConfigured) {
        return {
          success: false,
          error: 'Green API non configuré'
        };
      }

      return await this.greenApiService.getQrCode();

    } catch (error) {
      console.error('❌ [GreenApiConfig] Erreur QR Code:', error);
      return {
        success: false,
        error: 'Erreur lors de la récupération du QR Code'
      };
    }
  }

  /**
   * Envoyer un message de test
   */
  async sendTestMessage(phoneNumber: string): Promise<{success: boolean, message: string}> {
    try {
      const settings = this.getCurrentSettings();
      
      if (!settings.isConfigured || !settings.isConnected) {
        return {
          success: false,
          message: 'Green API non configuré ou non connecté'
        };
      }

      const testMessage = `🤖 Message de test envoyé depuis Bot Restaurant
⏰ ${new Date().toLocaleString('fr-FR')}

✅ Votre instance Green API fonctionne correctement !`;

      const result = await this.greenApiService.sendMessage(phoneNumber, testMessage);
      
      return {
        success: result.success,
        message: result.success ? 
          'Message de test envoyé avec succès !' : 
          result.error || 'Échec envoi du message de test'
      };

    } catch (error) {
      console.error('❌ [GreenApiConfig] Erreur message test:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'envoi du message de test'
      };
    }
  }
}