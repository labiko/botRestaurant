import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { FRANCE_CONFIG, CURRENT_ENVIRONMENT } from '../../../config/environment-config';

export interface GreenApiConfig {
  instanceId: string;
  apiToken: string;
  baseUrl?: string;
}

export interface WhatsAppMessage {
  chatId: string;
  message: string;
}

export interface WhatsAppResponse {
  idMessage: string;
  messageData?: any;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GreenApiFranceService {
  
  private readonly CONFIG: GreenApiConfig = {
    instanceId: FRANCE_CONFIG.greenApi.instanceId,
    apiToken: FRANCE_CONFIG.greenApi.apiToken,
    baseUrl: FRANCE_CONFIG.greenApi.baseUrl
  };

  constructor(private http: HttpClient) {
    // 🔍 LOGS DEBUG GREEN API
    console.log('🔍 [GREEN_API_DEBUG] ==========================================');
    console.log('🔍 [GREEN_API_DEBUG] ENVIRONNEMENT:', CURRENT_ENVIRONMENT);
    console.log('🔍 [GREEN_API_DEBUG] Instance ID:', this.CONFIG.instanceId);
    console.log('🔍 [GREEN_API_DEBUG] Base URL:', this.CONFIG.baseUrl);
    console.log('🔍 [GREEN_API_DEBUG] API Token (20 premiers chars):', this.CONFIG.apiToken.substring(0, 20) + '...');
    console.log('🔍 [GREEN_API_DEBUG] ==========================================');
  }

  /**
   * Configurer manuellement les credentials Green API
   */
  configure(config: Partial<GreenApiConfig>): void {
    this.CONFIG.instanceId = config.instanceId || this.CONFIG.instanceId;
    this.CONFIG.apiToken = config.apiToken || this.CONFIG.apiToken;
    this.CONFIG.baseUrl = config.baseUrl || this.CONFIG.baseUrl;
    
    console.log(`🔧 [GreenAPI] Configuration mise à jour - Instance: ${this.CONFIG.instanceId.substring(0, 4)}...`);
  }

  /**
   * Vérifier l'état de l'instance WhatsApp
   */
  async checkInstanceStatus(): Promise<{isConnected: boolean, statusMessage: string}> {
    try {
      if (!this.CONFIG.apiToken) {
        return {
          isConnected: false,
          statusMessage: 'Token API non configuré'
        };
      }

      const url = `${this.CONFIG.baseUrl}/waInstance${this.CONFIG.instanceId}/getStateInstance/${this.CONFIG.apiToken}`;
      
      const response = await this.http.get<any>(url).toPromise();
      
      const isConnected = response?.stateInstance === 'authorized';
      const statusMessage = isConnected ? 
        'Instance connectée et autorisée' : 
        `Status: ${response?.stateInstance || 'Inconnu'}`;

      
      return { isConnected, statusMessage };
      
    } catch (error) {
      console.error('❌ [GreenAPI] Erreur vérification status:', error);
      return {
        isConnected: false,
        statusMessage: 'Erreur de connexion à Green API'
      };
    }
  }

  /**
   * Envoyer un message WhatsApp à un numéro
   */
  async sendMessage(phoneNumber: string, message: string): Promise<SendMessageResult> {
    try {
      if (!this.CONFIG.apiToken) {
        console.error('❌ [GreenAPI] Token API non configuré');
        return {
          success: false,
          error: 'Token API non configuré'
        };
      }

      // Formater le numéro de téléphone (format international)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const chatId = `${formattedPhone}@c.us`;


      const url = `${this.CONFIG.baseUrl}/waInstance${this.CONFIG.instanceId}/sendMessage/${this.CONFIG.apiToken}`;
      
      const payload = {
        chatId: chatId,
        message: message
      };

      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      const response = await this.http.post<WhatsAppResponse>(url, payload, { headers }).toPromise();
      
      if (response && response.idMessage) {
        return {
          success: true,
          messageId: response.idMessage
        };
      } else {
        console.error('❌ [GreenAPI] Réponse inattendue:', response);
        return {
          success: false,
          error: 'Réponse API inattendue'
        };
      }

    } catch (error: any) {
      console.error('❌ [GreenAPI] Erreur envoi message:', error);
      
      let errorMessage = 'Erreur technique lors de l\'envoi';
      
      if (error.status === 401) {
        errorMessage = 'Token API invalide';
      } else if (error.status === 400) {
        errorMessage = 'Données de message invalides';
      } else if (error.status >= 500) {
        errorMessage = 'Erreur serveur Green API';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Formater un numéro de téléphone français au format international
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Supprimer tous les caractères non numériques
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Si le numéro commence par 0 (format français), remplacer par 33
    if (cleaned.startsWith('0')) {
      cleaned = '33' + cleaned.substring(1);
    }
    
    // Si le numéro ne commence pas par 33, l'ajouter
    if (!cleaned.startsWith('33')) {
      cleaned = '33' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Obtenir les informations du compte Green API
   */
  async getAccountInfo(): Promise<{success: boolean, data?: any, error?: string}> {
    try {
      if (!this.CONFIG.apiToken) {
        return {
          success: false,
          error: 'Token API non configuré'
        };
      }

      const url = `${this.CONFIG.baseUrl}/waInstance${this.CONFIG.instanceId}/getSettings/${this.CONFIG.apiToken}`;
      
      const response = await this.http.get<any>(url).toPromise();
      
      return {
        success: true,
        data: response
      };

    } catch (error) {
      console.error('❌ [GreenAPI] Erreur récupération compte:', error);
      return {
        success: false,
        error: 'Impossible de récupérer les informations du compte'
      };
    }
  }

  /**
   * Obtenir le QR code pour connexion (si nécessaire)
   */
  async getQrCode(): Promise<{success: boolean, qrCode?: string, error?: string}> {
    try {
      const url = `${this.CONFIG.baseUrl}/waInstance${this.CONFIG.instanceId}/qr/${this.CONFIG.apiToken}`;
      
      const response = await this.http.get<any>(url).toPromise();
      
      if (response && response.type === 'qrCode') {
        return {
          success: true,
          qrCode: response.message
        };
      } else {
        return {
          success: false,
          error: 'QR Code non disponible - Instance peut-être déjà connectée'
        };
      }

    } catch (error) {
      console.error('❌ [GreenAPI] Erreur récupération QR:', error);
      return {
        success: false,
        error: 'Impossible de récupérer le QR Code'
      };
    }
  }

  /**
   * Test de connectivité avec Green API
   */
  async testConnection(): Promise<{success: boolean, message: string}> {
    try {
      
      const statusCheck = await this.checkInstanceStatus();
      
      if (statusCheck.isConnected) {
        return {
          success: true,
          message: 'Connexion Green API réussie - Instance autorisée'
        };
      } else {
        return {
          success: false,
          message: `Connexion échouée: ${statusCheck.statusMessage}`
        };
      }

    } catch (error) {
      console.error('❌ [GreenAPI] Erreur test connexion:', error);
      return {
        success: false,
        message: 'Erreur lors du test de connexion'
      };
    }
  }
}