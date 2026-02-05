/**
 * Messages Service — Interface + Factory
 * PRD-067: Service Layer — Specialized Modules
 *
 * Manages conversations and messages between candidates and companies.
 */

import type { Conversation, Message } from '@/types';

export interface MessageFilters {
  conversationId?: string;
  senderId?: string;
  read?: boolean;
}

export interface IMessagesService {
  /** List conversations for a user (filtered by userType) */
  getConversations(userId: string, userType: string): Promise<Conversation[]>;

  /** Get a single conversation by ID */
  getConversation(id: string): Promise<Conversation | null>;

  /** Get all messages in a conversation */
  getMessages(conversationId: string): Promise<Message[]>;

  /** Send a new message in a conversation */
  sendMessage(conversationId: string, message: Partial<Message>): Promise<Message>;

  /** Mark all messages in a conversation as read */
  markAsRead(conversationId: string): Promise<void>;

  /** Create a new conversation between candidate and company */
  createConversation(candidateId: string, companyId: string, jobId?: string): Promise<Conversation>;

  /** Get count of unread messages for a user */
  getUnreadCount(userId: string): Promise<number>;
}

// ---------------------------------------------------------------------------
// Factory (singleton + lazy-load)
// ---------------------------------------------------------------------------

let _instance: IMessagesService | null = null;

export async function getMessagesService(): Promise<IMessagesService> {
  if (_instance) return _instance;

  const { MessagesServiceSupabase } = await import('./messagesService.supabase');
  _instance = new MessagesServiceSupabase();
  return _instance;
}

export function resetMessagesService(): void {
  _instance = null;
}
