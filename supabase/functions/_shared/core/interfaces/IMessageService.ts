/**
 * Interface pour les services de messagerie
 * Principe SOLID: Dependency Inversion
 */

export interface IMessage {
  to: string;
  content: string;
  type?: 'text' | 'image' | 'location' | 'buttons';
  buttons?: IButton[];
  location?: ILocation;
  mediaUrl?: string;
}

export interface IButton {
  id: string;
  text: string;
}

export interface ILocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface IIncomingMessage {
  from: string;
  content: string;
  type: 'text' | 'location' | 'image';
  location?: ILocation;
  timestamp: Date;
  messageId: string;
}

export interface IMessageService {
  sendMessage(message: IMessage): Promise<boolean>;
  sendTextMessage(to: string, content: string): Promise<boolean>;
  sendLocationMessage(to: string, location: ILocation): Promise<boolean>;
  sendButtonMessage(to: string, content: string, buttons: IButton[]): Promise<boolean>;
  markAsRead(messageId: string): Promise<void>;
}