/**
 * useMessages hook
 * PRD-010: Mensagens do Candidato
 * PRD-017: Suporte a userType para empresa
 * v1.14.1: Fix stubs — real messages via useConversationMessages, fix senderId
 * v1.14.2: Fix infinite re-render loop (useRef for mutations), fix sendMessage never firing
 *
 * Delegates to useMessagesQuery hooks (PRD-070 migration).
 */

import { useCallback, useMemo, useRef } from 'react';
import {
  useConversations,
  useConversationMessages,
  useUnreadCount,
  useSendMessage,
  useMarkAsRead,
} from '@/hooks/useMessagesQuery';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/types';

interface UseMessagesParams {
  userId: string;
  userType: 'candidate' | 'company';
  selectedConversationId?: string | null;
}

export function useMessages({ userId, userType, selectedConversationId }: UseMessagesParams) {
  const { user } = useAuth();

  // --- React Query hooks ---
  const {
    data: rawConversations = [],
    isLoading: conversationsLoading,
  } = useConversations(userId, userType);

  const { data: unreadCount = 0 } = useUnreadCount(userId, userType);

  // Fetch messages for the selected conversation
  const {
    data: conversationMessages = [],
    isLoading: messagesLoading,
  } = useConversationMessages(selectedConversationId ?? null);

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Stable refs — useMutation returns new object every render, causing
  // useCallback deps to change → useEffect infinite loops (v1.14.2 fix)
  const sendMutationRef = useRef(sendMessageMutation);
  sendMutationRef.current = sendMessageMutation;
  const markAsReadRef = useRef(markAsReadMutation);
  markAsReadRef.current = markAsReadMutation;

  // Sort conversations by updatedAt descending
  const sortedConversations = useMemo(() => {
    return [...rawConversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [rawConversations]);

  // Get messages for a specific conversation
  const getConversationMessages = useCallback(
    (conversationId: string): Message[] => {
      // Return messages from React Query if this is the selected conversation
      if (conversationId === selectedConversationId) {
        return conversationMessages;
      }
      return [];
    },
    [selectedConversationId, conversationMessages]
  );

  // Get last message for a conversation (from enriched data in getConversations)
  const getLastMessage = useCallback(
    (conversationId: string): Message | undefined => {
      const conv = rawConversations.find(c => c.id === conversationId);
      return conv?.lastMessage;
    },
    [rawConversations]
  );

  // Mark conversation as read (stable ref — no deps change)
  const markAsRead = useCallback(
    (conversationId: string) => {
      markAsReadRef.current.mutate(conversationId);
    },
    []
  );

  // Send a new message (stable ref — no mutation in deps)
  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const conversation = rawConversations.find(c => c.id === conversationId);
      if (!conversation) {
        console.warn('[useMessages] Conversa nao encontrada:', conversationId);
        return;
      }

      const isCompany = userType === 'company';
      // sender_id must be auth.uid (profiles.id) — NOT the entity ID
      const senderId = user?.id ?? userId;
      const senderName = isCompany ? conversation.companyName : conversation.candidateName;
      const senderType = isCompany ? 'company' : 'candidate';
      const receiverName = isCompany ? conversation.candidateName : conversation.companyName;

      sendMutationRef.current.mutate({
        conversationId,
        message: {
          senderId,
          senderName,
          senderType,
          receiverName,
          subject: 'Re: Conversa',
          content,
        },
      });
    },
    [user?.id, userId, userType, rawConversations]
  );

  return {
    conversations: sortedConversations,
    messages: conversationMessages,
    isLoading: conversationsLoading,
    messagesLoading,
    getConversationMessages,
    getLastMessage,
    markAsRead,
    sendMessage,
    totalUnreadCount: unreadCount,
  };
}
