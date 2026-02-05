/**
 * useMessages hook
 * PRD-010: Mensagens do Candidato
 * PRD-017: Suporte a userType para empresa
 *
 * Delegates to useMessagesQuery hooks (PRD-070 migration).
 */

import { useCallback, useMemo } from 'react';
import {
  useConversations,
  useMessages as useMessagesQuery,
  useUnreadCount,
  useSendMessage,
  useMarkAsRead,
} from '@/hooks/useMessagesQuery';
import type { Message } from '@/types';

interface UseMessagesParams {
  userId: string;
  userType: 'candidate' | 'company';
}

export function useMessages({ userId, userType }: UseMessagesParams) {
  // --- React Query hooks ---
  const {
    data: rawConversations = [],
    isLoading: conversationsLoading,
  } = useConversations(userId, userType);

  const { data: unreadCount = 0 } = useUnreadCount(userId);

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Sort conversations by updatedAt descending
  const sortedConversations = useMemo(() => {
    return [...rawConversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [rawConversations]);

  // Get messages for a specific conversation
  // NOTE: callers should prefer the useMessages hook from useMessagesQuery directly,
  // but this wrapper keeps backward compatibility.
  const getConversationMessages = useCallback(
    (_conversationId: string): Message[] => {
      // For backward compatibility we return an empty array;
      // consumers should use the dedicated useMessages(conversationId) hook.
      return [];
    },
    []
  );

  // Get last message for a conversation
  const getLastMessage = useCallback(
    (_conversationId: string): Message | undefined => {
      return undefined;
    },
    []
  );

  // Mark conversation as read
  const markAsRead = useCallback(
    (conversationId: string) => {
      markAsReadMutation.mutate(conversationId);
    },
    [markAsReadMutation]
  );

  // Send a new message
  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const conversation = rawConversations.find(c => c.id === conversationId);
      if (!conversation) return null;

      const isCompany = userType === 'company';
      const senderId = userId;
      const senderName = isCompany ? conversation.companyName : conversation.candidateName;
      const senderType = isCompany ? 'company' : 'candidate';
      const receiverId = isCompany ? conversation.candidateId : conversation.companyId;
      const receiverName = isCompany ? conversation.candidateName : conversation.companyName;

      const messagePayload: Partial<Message> = {
        senderId,
        senderName,
        senderType,
        receiverId,
        receiverName,
        subject: 'Re: Conversa',
        content,
        read: true,
      };

      sendMessageMutation.mutate({ conversationId, message: messagePayload });

      // Return a locally-optimistic message for immediate UI update
      const optimistic: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        ...messagePayload,
        createdAt: new Date().toISOString(),
      } as Message;

      return optimistic;
    },
    [userId, userType, rawConversations, sendMessageMutation]
  );

  return {
    conversations: sortedConversations,
    messages: [] as Message[],
    isLoading: conversationsLoading,
    getConversationMessages,
    getLastMessage,
    markAsRead,
    sendMessage,
    totalUnreadCount: unreadCount,
  };
}
