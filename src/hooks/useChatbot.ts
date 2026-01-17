/**
 * Hook for Chatbot
 * PRD-040: Chatbot de Suporte
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  ChatbotMessage,
  ChatbotStatus,
  UserContext,
  FeedbackType,
  EscalationTicket,
} from '@/types/chatbot';
import {
  generateWelcomeMessage,
  generateResponse,
  generateEscalationResponse,
  createUserMessage,
  createSystemMessage,
} from '@/lib/chatbot';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'recruta_chatbot_history';
const TYPING_DELAY = 500; // ms

interface UseChatbotReturn {
  // State
  isOpen: boolean;
  isMinimized: boolean;
  status: ChatbotStatus;
  messages: ChatbotMessage[];
  userContext: UserContext;

  // Actions
  open: () => void;
  close: () => void;
  minimize: () => void;
  maximize: () => void;
  toggle: () => void;

  // Messaging
  sendMessage: (content: string) => void;
  handleSuggestionClick: (value: string) => void;
  provideFeedback: (messageId: string, feedback: FeedbackType) => void;

  // Escalation
  isEscalating: boolean;
  escalate: (subject: string, description: string, email?: string) => void;
  cancelEscalation: () => void;

  // History
  clearHistory: () => void;
}

export function useChatbot(): UseChatbotReturn {
  const { user, isAuthenticated } = useAuth();

  // Determine user context
  const userContext: UserContext = isAuthenticated
    ? (user?.type as UserContext) || 'guest'
    : 'guest';

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [status, setStatus] = useState<ChatbotStatus>('idle');
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isEscalating, setIsEscalating] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    if (initialized) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored) as ChatbotMessage[];
        // Only restore last 20 messages
        setMessages(history.slice(-20));
      }
    } catch {
      // Ignore parsing errors
    }
    setInitialized(true);
  }, [initialized]);

  // Save history to localStorage
  useEffect(() => {
    if (!initialized) return;

    try {
      // Only save last 50 messages
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    } catch {
      // Ignore storage errors
    }
  }, [messages, initialized]);

  // Initialize with welcome message when opened for first time
  useEffect(() => {
    if (isOpen && messages.length === 0 && initialized) {
      const welcomeMessage = generateWelcomeMessage(userContext);
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, userContext, initialized]);

  // Open chatbot
  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  // Close chatbot
  const close = useCallback(() => {
    setIsOpen(false);
    setIsEscalating(false);
  }, []);

  // Minimize
  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  // Maximize
  const maximize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  // Toggle open/closed
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Send message
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage = createUserMessage(content.trim());
    setMessages(prev => [...prev, userMessage]);

    // Show typing indicator
    setStatus('typing');

    // Generate response with small delay
    setTimeout(() => {
      const botResponse = generateResponse(content, userContext);
      setMessages(prev => [...prev, botResponse]);
      setStatus('idle');

      // Check if response suggests escalation
      if (content.toLowerCase().includes('escalonar') ||
          content.toLowerCase().includes('atendente') ||
          content.toLowerCase().includes('humano')) {
        setIsEscalating(true);
      }
    }, TYPING_DELAY + Math.random() * 500);
  }, [userContext]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((value: string) => {
    if (value === 'ESCALATE') {
      setIsEscalating(true);
      const escMessage = generateEscalationResponse();
      setMessages(prev => [...prev, escMessage]);
      return;
    }

    if (value === 'CANCEL_ESCALATION') {
      setIsEscalating(false);
      const systemMessage = createSystemMessage('Escalonamento cancelado. Como posso ajudar?');
      setMessages(prev => [...prev, systemMessage]);
      return;
    }

    if (value === 'FEEDBACK') {
      // Feedback is handled by provideFeedback
      return;
    }

    // Regular suggestion - send as message
    sendMessage(value);
  }, [sendMessage]);

  // Provide feedback on a message
  const provideFeedback = useCallback((messageId: string, feedback: FeedbackType) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );

    // Add thank you message
    const thankYouMessage = createSystemMessage(
      feedback === 'helpful'
        ? 'Obrigado pelo feedback! Fico feliz em ajudar.'
        : 'Obrigado pelo feedback. Vou melhorar! Posso tentar ajudar de outra forma?'
    );
    setMessages(prev => [...prev, thankYouMessage]);
  }, []);

  // Escalate to human support
  const escalate = useCallback((subject: string, description: string, email?: string) => {
    // Create escalation ticket
    const ticket: EscalationTicket = {
      id: `ticket-${Date.now()}`,
      chatHistoryId: `chat-${Date.now()}`,
      userId: user?.id,
      userEmail: email || user?.email,
      subject,
      description,
      chatTranscript: messages
        .map(m => `[${m.type}] ${m.content}`)
        .join('\n'),
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    // Save ticket (mock - would normally send to backend)
    try {
      const stored = localStorage.getItem('recruta_support_tickets');
      const tickets = stored ? JSON.parse(stored) : [];
      tickets.push(ticket);
      localStorage.setItem('recruta_support_tickets', JSON.stringify(tickets));
    } catch {
      // Ignore storage errors
    }

    // Add confirmation message
    const confirmMessage = createSystemMessage(
      `Sua solicitação foi enviada com sucesso!\n\n` +
      `**Protocolo:** ${ticket.id}\n\n` +
      `Nossa equipe entrará em contato em breve através do email cadastrado.`
    );
    setMessages(prev => [...prev, confirmMessage]);
    setIsEscalating(false);
  }, [messages, user]);

  // Cancel escalation
  const cancelEscalation = useCallback(() => {
    setIsEscalating(false);
    const systemMessage = createSystemMessage('Escalonamento cancelado. Posso ajudar com mais alguma coisa?');
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);

    // Add welcome message again
    setTimeout(() => {
      const welcomeMessage = generateWelcomeMessage(userContext);
      setMessages([welcomeMessage]);
    }, 100);
  }, [userContext]);

  return {
    isOpen,
    isMinimized,
    status,
    messages,
    userContext,
    open,
    close,
    minimize,
    maximize,
    toggle,
    sendMessage,
    handleSuggestionClick,
    provideFeedback,
    isEscalating,
    escalate,
    cancelEscalation,
    clearHistory,
  };
}
