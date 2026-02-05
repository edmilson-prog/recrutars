/**
 * Messages Service — Supabase Implementation
 * PRD-067: Service Layer — Specialized Modules
 *
 * Queries conversations and messages tables with joins.
 * Tables: conversations, messages
 */

import type { Conversation, Message } from '@/types';
import { supabase } from '@/lib/supabase';
import type { IMessagesService } from './messagesService';

export class MessagesServiceSupabase implements IMessagesService {
  async getConversations(userId: string, userType: string): Promise<Conversation[]> {
    const column = userType === 'candidate' ? 'candidate_id' : 'company_id';

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq(column, userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(this.mapConversation);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw error;
    }

    return data ? this.mapConversation(data) : null;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data ?? []).map(this.mapMessage);
  }

  async sendMessage(conversationId: string, message: Partial<Message>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: message.senderId,
        sender_name: message.senderName,
        sender_type: message.senderType,
        receiver_id: message.receiverId,
        receiver_name: message.receiverName,
        subject: message.subject ?? '',
        content: message.content ?? '',
        read: false,
        type: message.type ?? 'regular',
        metadata: message.metadata ? JSON.stringify(message.metadata) : null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return this.mapMessage(data);
  }

  async markAsRead(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('read', false);

    if (error) throw error;

    // Reset unread count on conversation
    await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);
  }

  async createConversation(
    candidateId: string,
    companyId: string,
    jobId?: string,
  ): Promise<Conversation> {
    // Check for existing conversation
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('company_id', companyId);

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) return this.mapConversation(existing);

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        candidate_id: candidateId,
        company_id: companyId,
        job_id: jobId ?? null,
        unread_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapConversation(data);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;

    return count ?? 0;
  }

  // ---------------------------------------------------------------------------
  // Mappers (snake_case DB -> camelCase TS)
  // ---------------------------------------------------------------------------

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private mapConversation(row: any): Conversation {
    return {
      id: row.id,
      candidateId: row.candidate_id,
      candidateName: row.candidate_name ?? '',
      companyId: row.company_id,
      companyName: row.company_name ?? '',
      jobId: row.job_id ?? '',
      jobTitle: row.job_title ?? '',
      unreadCount: row.unread_count ?? 0,
      updatedAt: row.updated_at,
    };
  }

  private mapMessage(row: any): Message {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      senderType: row.sender_type,
      receiverId: row.receiver_id,
      receiverName: row.receiver_name,
      subject: row.subject,
      content: row.content,
      read: row.read,
      createdAt: row.created_at,
      type: row.type ?? undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
