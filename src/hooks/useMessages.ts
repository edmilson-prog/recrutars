/**
 * useMessages hook
 * PRD-010: Mensagens do Candidato
 * PRD-017: Suporte a userType para empresa
 */

import { useState, useCallback, useMemo } from 'react';
import { mockMessages, mockConversations } from '@/data/mockData';
import type { Message, Conversation
 } from '@/types';

interface UseMessagesParams {
  userId: string;
  userType: 'candidate' | 'company';
}

export function useMessages({ userId, userType }: UseMessagesParams) {
  const [messages, setMessages] = useState<Message[]>(() =>
    mockMessages.filter(
      msg => msg.senderId === userId || msg.receiverId === userId
    )
  );

  const [conversations, setConversations] = useState<Conversation[]>(() =>
    mockConversations.filter(conv =>
      userType === 'candidate'
        ? conv.candidateId === userId
        : conv.companyId === userId
    )
  );

  // Get conversations sorted by last message date
  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [conversations]);

  // Get messages for a specific conversation
  const getConversationMessages = useCallback(
    (conversationId: string) => {
      return messages
        .filter(msg => msg.conversationId === conversationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
    [messages]
  );

  // Get last message for a conversation
  const getLastMessage = useCallback(
    (conversationId: string) => {
      const convMessages = getConversationMessages(conversationId);
      return convMessages[convMessages.length - 1];
    },
    [getConversationMessages]
  );

  // Mark conversation as read
  const markAsRead = useCallback((conversationId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.conversationId === conversationId && !msg.read
          ? { ...msg, read: true }
          : msg
      )
    );

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );

    // Update mock data
    const convIndex = mockConversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      mockConversations[convIndex].unreadCount = 0;
    }
    mockMessages.forEach(msg => {
      if (msg.conversationId === conversationId) {
        msg.read = true;
      }
    });
  }, []);

  // Send a new message
  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return null;

      const now = new Date().toISOString();

      // Determine sender and receiver based on userType
      const isCompany = userType === 'company';
      const senderId = userId;
      const senderName = isCompany ? conversation.companyName : conversation.candidateName;
      const senderType = isCompany ? 'company' : 'candidate';
      const receiverId = isCompany ? conversation.candidateId : conversation.companyId;
      const receiverName = isCompany ? conversation.candidateName : conversation.companyName;

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId,
        senderName,
        senderType,
        receiverId,
        receiverName,
        subject: 'Re: Conversa',
        content,
        read: true,
        createdAt: now,
      };

      setMessages(prev => [...prev, newMessage]);
      mockMessages.push(newMessage);

      // Update conversation timestamp
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, updatedAt: now } : conv
        )
      );

      const convIndex = mockConversations.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        mockConversations[convIndex].updatedAt = now;
      }

      return newMessage;
    },
    [userId, userType, conversations]
  );

  // Get total unread count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);
  }, [conversations]);

  return {
    conversations: sortedConversations,
    messages,
    getConversationMessages,
    getLastMessage,
    markAsRead,
    sendMessage,
    totalUnreadCount,
  };
}
