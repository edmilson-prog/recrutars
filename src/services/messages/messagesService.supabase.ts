/**
 * Messages Service — Supabase Implementation
 * PRD-067: Service Layer — Specialized Modules
 * v1.14.1: Fix JOINs, sendMessage FK, metadata JSONB, unread count, mappers
 *
 * Queries conversations and messages tables with joins.
 * Tables: conversations, messages
 */

import type { Conversation, Message } from '@/types';
import { supabase } from '@/lib/supabase';
import type { IMessagesService } from './messagesService';

// PostgREST JOIN select — pulls names from FK relationships
const CONVERSATION_SELECT = '*, companies(name), jobs(title)';

export class MessagesServiceSupabase implements IMessagesService {
  async getConversations(userId: string, userType: string): Promise<Conversation[]> {
    const column = userType === 'candidate' ? 'candidate_id' : 'company_id';

    const { data, error } = await supabase
      .from('conversations')
      .select(CONVERSATION_SELECT)
      .eq(column, userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const conversations = (data ?? []).map((row: any) => this.mapConversation(row));

    if (conversations.length === 0) return conversations;

    // Batch: fetch last message + unread count per conversation
    const convIds = conversations.map(c => c.id);

    // 1) Last message per conversation (most recent first, limit to N)
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false });

    // 2) Unread count: messages where sender_type != userType and read = false
    const oppositeType = userType === 'candidate' ? 'company' : 'candidate';
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', convIds)
      .eq('sender_type', oppositeType)
      .eq('read', false);

    // Build lookup maps
    const lastMessageMap = new Map<string, Message>();
    const unreadCountMap = new Map<string, number>();

    // Last message: first occurrence per conversation_id (already sorted desc)
    for (const row of (recentMessages ?? [])) {
      const convId = row.conversation_id;
      if (!lastMessageMap.has(convId)) {
        lastMessageMap.set(convId, this.mapMessage(row));
      }
    }

    // Unread count
    for (const row of (unreadMessages ?? [])) {
      const convId = row.conversation_id;
      unreadCountMap.set(convId, (unreadCountMap.get(convId) ?? 0) + 1);
    }

    // Enrich conversations
    for (const conv of conversations) {
      conv.lastMessage = lastMessageMap.get(conv.id);
      conv.unreadCount = unreadCountMap.get(conv.id) ?? 0;
    }

    return conversations;
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(CONVERSATION_SELECT)
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

    return (data ?? []).map((row: any) => this.mapMessage(row));
  }

  async sendMessage(conversationId: string, message: Partial<Message>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: message.senderId,
        sender_name: message.senderName ?? null,
        sender_type: message.senderType,
        receiver_name: message.receiverName ?? null,
        subject: message.subject ?? '',
        content: message.content ?? '',
        read: false,
        type: message.type ?? 'regular',
        metadata: message.metadata ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // Note: trigger trg_update_conversation_on_message handles updated_at automatically

    return this.mapMessage(data);
  }

  async markAsRead(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('read', false);

    if (error) throw error;
  }

  async createConversation(
    candidateId: string,
    companyId: string,
    jobId?: string,
  ): Promise<Conversation> {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_candidate_id: candidateId,
      p_company_id: companyId,
      p_job_id: jobId ?? null,
    });

    if (error) throw error;

    return this.mapConversation(data);
  }

  async getUnreadCount(userId: string, userType: string): Promise<number> {
    const column = userType === 'candidate' ? 'candidate_id' : 'company_id';
    const oppositeType = userType === 'candidate' ? 'company' : 'candidate';

    // 1) Get conversation IDs where user is a participant
    const { data: convRows } = await supabase
      .from('conversations')
      .select('id')
      .eq(column, userId);

    if (!convRows || convRows.length === 0) return 0;

    const convIds = convRows.map(r => r.id);

    // 2) Count unread messages from the other party
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .eq('sender_type', oppositeType)
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
      candidateName: '', // populated client-side from useCandidates map
      companyId: row.company_id,
      companyName: row.companies?.name ?? '',
      jobId: row.job_id ?? '',
      jobTitle: row.jobs?.title ?? '',
      unreadCount: 0, // populated by batch in getConversations
      updatedAt: row.updated_at,
    };
  }

  private mapMessage(row: any): Message {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderName: row.sender_name ?? '',
      senderType: row.sender_type,
      receiverId: row.receiver_id ?? '',
      receiverName: row.receiver_name ?? '',
      subject: row.subject,
      content: row.content,
      read: row.read,
      createdAt: row.created_at,
      type: row.type ?? undefined,
      metadata: row.metadata
        ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata)
        : undefined,
    };
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
