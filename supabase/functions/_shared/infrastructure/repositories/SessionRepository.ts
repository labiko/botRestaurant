/**
 * Repository pour les Sessions
 * Infrastructure Layer - Implémentation Supabase
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Session, ConversationState } from '../../domain/entities/Session.ts';
import { IRepositoryWithFilter } from '../../core/interfaces/IRepository.ts';

interface SessionRecord {
  id: string;
  phone_whatsapp: string;
  state: ConversationState;
  context: any;
  expires_at: string;
  created_at?: string;
  updated_at?: string;
}

export class SessionRepository implements IRepositoryWithFilter<Session> {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findAll(): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findByFilter(filter: Record<string, any>): Promise<Session[]> {
    let query = this.supabase.from('sessions').select('*');

    // Appliquer les filtres
    Object.entries(filter).forEach(([key, value]) => {
      if (key === 'expires_at' && typeof value === 'object') {
        if (value.gte) {
          query = query.gte('expires_at', value.gte);
        }
        if (value.lt) {
          query = query.lt('expires_at', value.lt);
        }
      } else {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(record => this.mapToEntity(record));
  }

  async findOne(filter: Record<string, any>): Promise<Session | null> {
    const results = await this.findByFilter(filter);
    return results.length > 0 ? results[0] : null;
  }

  async create(session: Session): Promise<Session> {
    const record = this.mapToRecord(session);

    const { data, error } = await this.supabase
      .from('sessions')
      .insert(record)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create session: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, updates: Partial<Session>): Promise<Session | null> {
    const record = this.mapToRecord(updates as Session, true);

    const { data, error } = await this.supabase
      .from('sessions')
      .update(record)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to update session:', error);
      return null;
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    return !error;
  }

  /**
   * Méthodes spécifiques aux sessions
   */

  async findActiveSessionByPhone(phoneWhatsapp: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('phone_whatsapp', phoneWhatsapp)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async deleteExpiredSessions(): Promise<number> {
    const { data, error } = await this.supabase
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      console.error('Failed to delete expired sessions:', error);
      return 0;
    }

    return data?.length || 0;
  }

  async countActiveSessions(): Promise<number> {
    const { count, error } = await this.supabase
      .from('sessions')
      .select('*', { count: 'exact' })
      .gte('expires_at', new Date().toISOString());

    if (error) {
      console.error('Failed to count active sessions:', error);
      return 0;
    }

    return count || 0;
  }

  private mapToEntity(record: SessionRecord): Session {
    return new Session(
      record.id,
      record.phone_whatsapp,
      record.state,
      record.context || {},
      new Date(record.expires_at),
      record.created_at ? new Date(record.created_at) : undefined,
      record.updated_at ? new Date(record.updated_at) : undefined
    );
  }

  private mapToRecord(session: Session, isUpdate: boolean = false): Partial<SessionRecord> {
    const record: Partial<SessionRecord> = {
      phone_whatsapp: session.phoneWhatsapp,
      state: session.state,
      context: session.context,
      expires_at: session.expiresAt.toISOString()
    };

    if (!isUpdate) {
      record.id = session.id;
    }

    return record;
  }
}