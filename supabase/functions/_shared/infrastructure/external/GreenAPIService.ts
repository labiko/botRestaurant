/**
 * Service Green API - Infrastructure Layer
 * Implémentation de l'interface IMessageService pour Green API
 */

import { IMessageService, IMessage, IButton, ILocation } from '../../core/interfaces/IMessageService.ts';

export class GreenAPIService implements IMessageService {
  private readonly instanceId: string;
  private readonly token: string;
  private readonly baseUrl: string;

  constructor() {
    this.instanceId = Deno.env.get('GREEN_API_INSTANCE_ID')!;
    this.token = Deno.env.get('GREEN_API_TOKEN')!;
    this.baseUrl = `https://api.green-api.com/waInstance${this.instanceId}`;
    
    if (!this.instanceId || !this.token) {
      throw new Error('Green API credentials not configured');
    }
  }

  async sendMessage(message: IMessage): Promise<boolean> {
    try {
      switch (message.type) {
        case 'location':
          return await this.sendLocationMessage(message.to, message.location!);
        case 'buttons':
          return await this.sendButtonMessage(message.to, message.content, message.buttons!);
        default:
          return await this.sendTextMessage(message.to, message.content);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  async sendTextMessage(to: string, content: string): Promise<boolean> {
    const url = `${this.baseUrl}/sendMessage/${this.token}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${to}@c.us`,
        message: content
      })
    });

    if (!response.ok) {
      console.error('Failed to send text message:', await response.text());
      return false;
    }

    const result = await response.json();
    return result.idMessage != null;
  }

  async sendLocationMessage(to: string, location: ILocation): Promise<boolean> {
    const url = `${this.baseUrl}/sendLocation/${this.token}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${to}@c.us`,
        latitude: location.latitude,
        longitude: location.longitude,
        nameLocation: location.name || 'Localisation',
        address: location.address || 'Conakry, Guinée'
      })
    });

    if (!response.ok) {
      console.error('Failed to send location:', await response.text());
      return false;
    }

    const result = await response.json();
    return result.idMessage != null;
  }

  async sendButtonMessage(to: string, content: string, buttons: IButton[]): Promise<boolean> {
    // Green API ne supporte pas nativement les boutons dans la version gratuite
    // On simule avec des options numérotées
    let message = content + '\n\n';
    
    buttons.forEach((button, index) => {
      message += `${index + 1}️⃣ ${button.text}\n`;
    });
    
    message += '\nRépondez avec le numéro de votre choix.';
    
    return await this.sendTextMessage(to, message);
  }

  async markAsRead(messageId: string): Promise<void> {
    // Fonctionnalité optionnelle
    try {
      const url = `${this.baseUrl}/readChat/${this.token}`;
      
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idMessage: messageId
        })
      });
    } catch (error) {
      console.log('Could not mark message as read:', error);
    }
  }

  /**
   * Méthodes spécifiques à Green API
   */

  async sendTyping(to: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/sendChatStateTyping/${this.token}`;
      
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: `${to}@c.us`
        })
      });
    } catch (error) {
      console.log('Could not send typing indicator:', error);
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      const url = `${this.baseUrl}/getSettings/${this.token}`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Failed to get account info:', error);
      return null;
    }
  }

  async getQRCode(): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/qr/${this.token}`;
      const response = await fetch(url);
      const result = await response.json();
      return result.message || null;
    } catch (error) {
      console.error('Failed to get QR code:', error);
      return null;
    }
  }

  async getInstanceState(): Promise<'notAuthorized' | 'authorized' | 'blocked'> {
    try {
      const url = `${this.baseUrl}/getStateInstance/${this.token}`;
      const response = await fetch(url);
      const result = await response.json();
      return result.stateInstance || 'notAuthorized';
    } catch (error) {
      console.error('Failed to get instance state:', error);
      return 'notAuthorized';
    }
  }
}