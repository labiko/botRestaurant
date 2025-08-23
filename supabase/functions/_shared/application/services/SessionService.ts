/**
 * Service de Gestion des Sessions
 * Application Layer - Principe SOLID: Single Responsibility
 */

import { Session, ConversationState, ISessionContext } from '../../domain/entities/Session.ts';
import { IRepositoryWithFilter } from '../../core/interfaces/IRepository.ts';

export class SessionService {
  constructor(
    private sessionRepository: IRepositoryWithFilter<Session>
  ) {}

  async getSession(phoneWhatsapp: string): Promise<Session | null> {
    const sessions = await this.sessionRepository.findByFilter({
      phone_whatsapp: phoneWhatsapp,
      expires_at: { gte: new Date().toISOString() }
    });

    if (sessions.length === 0) return null;

    // Prendre la session la plus récente si plusieurs existent
    const session = sessions.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    )[0];

    return session.isExpired() ? null : session;
  }

  async createSession(phoneWhatsapp: string): Promise<Session> {
    // Nettoyer les anciennes sessions pour cet utilisateur
    await this.cleanupUserSessions(phoneWhatsapp);

    const session = new Session(
      crypto.randomUUID(),
      phoneWhatsapp,
      'INITIAL',
      {},
      new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    );

    return await this.sessionRepository.create(session);
  }

  async updateSession(session: Session): Promise<Session> {
    // Étendre automatiquement l'expiration
    session.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    session.updatedAt = new Date();

    const updated = await this.sessionRepository.update(session.id, session);
    if (!updated) {
      throw new Error('Failed to update session');
    }

    return updated;
  }

  async resetSession(phoneWhatsapp: string): Promise<Session> {
    // Supprimer les sessions existantes
    await this.cleanupUserSessions(phoneWhatsapp);
    
    // Créer une nouvelle session
    return await this.createSession(phoneWhatsapp);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.sessionRepository.delete(sessionId);
  }

  private async cleanupUserSessions(phoneWhatsapp: string): Promise<void> {
    const existingSessions = await this.sessionRepository.findByFilter({
      phone_whatsapp: phoneWhatsapp
    });

    for (const session of existingSessions) {
      await this.sessionRepository.delete(session.id);
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    const expiredSessions = await this.sessionRepository.findByFilter({
      expires_at: { lt: new Date().toISOString() }
    });

    let cleanedCount = 0;
    for (const session of expiredSessions) {
      if (await this.sessionRepository.delete(session.id)) {
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  async getActiveSessionsCount(): Promise<number> {
    const activeSessions = await this.sessionRepository.findByFilter({
      expires_at: { gte: new Date().toISOString() }
    });

    return activeSessions.length;
  }

  async getSessionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    byState: Record<ConversationState, number>;
  }> {
    const allSessions = await this.sessionRepository.findAll();
    const activeSessions = allSessions.filter(s => !s.isExpired());
    const expiredSessions = allSessions.filter(s => s.isExpired());

    const byState: Record<ConversationState, number> = {
      'INITIAL': 0,
      'CHOOSING_RESTAURANT': 0,
      'WAITING_LOCATION': 0,
      'VIEWING_ALL_RESTOS': 0,
      'VIEWING_MENU': 0,
      'BUILDING_CART': 0,
      'CART_CONFIRMATION': 0,
      'CART_MODIFICATION': 0,
      'MODE_SELECTION': 0,
      'SUR_PLACE': 0,
      'EMPORTER': 0,
      'LIVRAISON_LOCATION': 0,
      'LIVRAISON_CALCULATION': 0,
      'PAYMENT_SELECTION': 0,
      'PAYMENT_PROCESSING': 0,
      'ORDER_CONFIRMED': 0,
      'FAVORI_REQUEST': 0
    };

    activeSessions.forEach(session => {
      byState[session.state]++;
    });

    return {
      total: allSessions.length,
      active: activeSessions.length,
      expired: expiredSessions.length,
      byState
    };
  }

  /**
   * Helpers pour la gestion du contexte de session
   */

  async updateSessionState(phoneWhatsapp: string, newState: ConversationState): Promise<void> {
    const session = await this.getSession(phoneWhatsapp);
    if (session) {
      session.updateState(newState);
      await this.updateSession(session);
    }
  }

  async updateSessionContext(phoneWhatsapp: string, updates: Partial<ISessionContext>): Promise<void> {
    const session = await this.getSession(phoneWhatsapp);
    if (session) {
      session.updateContext(updates);
      await this.updateSession(session);
    }
  }

  async addToSessionCart(phoneWhatsapp: string, item: any): Promise<void> {
    const session = await this.getSession(phoneWhatsapp);
    if (session) {
      session.addToCart(item);
      await this.updateSession(session);
    }
  }

  async clearSessionCart(phoneWhatsapp: string): Promise<void> {
    const session = await this.getSession(phoneWhatsapp);
    if (session) {
      session.clearCart();
      await this.updateSession(session);
    }
  }
}