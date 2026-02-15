/**
 * Messages Query Hooks
 * PRD-067: Service Layer — Specialized Modules
 *
 * React Query hooks for conversations and messages.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/types';
import { getMessagesService } from '@/services/messages/messagesService';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const KEYS = {
  conversations: (userId: string, userType: string) =>
    ['conversations', userId, userType] as const,
  conversation: (id: string) => ['conversation', id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  unreadCount: (userId: string) => ['messages', 'unread', userId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch conversations for the current user */
export function useConversations(userId: string, userType: string) {
  return useQuery({
    queryKey: KEYS.conversations(userId, userType),
    queryFn: async () => {
      const service = await getMessagesService();
      return service.getConversations(userId, userType);
    },
    enabled: !!userId && !!userType,
  });
}

/** Fetch all messages in a conversation */
export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: KEYS.messages(conversationId ?? ''),
    queryFn: async () => {
      const service = await getMessagesService();
      return service.getMessages(conversationId!);
    },
    enabled: !!conversationId,
  });
}

/** Get count of unread messages for a user */
export function useUnreadCount(userId: string, userType: string) {
  return useQuery({
    queryKey: KEYS.unreadCount(userId),
    queryFn: async () => {
      const service = await getMessagesService();
      return service.getUnreadCount(userId, userType);
    },
    enabled: !!userId && !!userType,
    refetchInterval: 30_000, // poll every 30s
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Send a message in a conversation */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: Partial<Message>;
    }) => {
      const service = await getMessagesService();
      return service.sendMessage(conversationId, message);
    },
    onSuccess: (_data, variables) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({
        queryKey: KEYS.messages(variables.conversationId),
      });
      // Invalidate conversations list (updated_at changed)
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error, variables) => {
      console.error('[useSendMessage] Erro ao enviar mensagem:', error, variables);
    },
  });
}

/** Mark all messages in a conversation as read */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const service = await getMessagesService();
      return service.markAsRead(conversationId);
    },
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: KEYS.messages(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread'] });
    },
  });
}
