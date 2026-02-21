/**
 * Chatbot Widget Component
 * PRD-040: Chatbot de Suporte
 *
 * Main widget that combines button and window.
 * Respects admin enablement settings per user type.
 */

import { useChatbot } from '@/hooks/useChatbot';
import { useAuth } from '@/contexts/AuthContext';
import { useChatbotConfig } from '@/hooks/useChatbotConfig';
import { ChatbotButton } from './ChatbotButton';
import { ChatbotWindow } from './ChatbotWindow';

export function ChatbotWidget() {
  const { user } = useAuth();
  const { data: chatbotConfig } = useChatbotConfig();
  const {
    isOpen,
    isMinimized,
    status,
    messages,
    isEscalating,
    toggle,
    close,
    minimize,
    maximize,
    sendMessage,
    handleSuggestionClick,
    provideFeedback,
    escalate,
    cancelEscalation,
    clearHistory,
  } = useChatbot();

  // Check if the chatbot is enabled for the current user type
  const userType = user?.type as string | undefined;

  if (userType === 'candidate' && chatbotConfig?.chatbotEnabledCandidates === false) {
    return null;
  }
  if (userType === 'company' && chatbotConfig?.chatbotEnabledCompanies === false) {
    return null;
  }
  // admin and guest (unauthenticated): always visible

  return (
    <>
      <ChatbotButton isOpen={isOpen} onClick={toggle} />

      <ChatbotWindow
        isOpen={isOpen}
        isMinimized={isMinimized}
        status={status}
        messages={messages}
        isEscalating={isEscalating}
        userEmail={user?.email}
        onClose={close}
        onMinimize={minimize}
        onMaximize={maximize}
        onSendMessage={sendMessage}
        onSuggestionClick={handleSuggestionClick}
        onFeedback={provideFeedback}
        onEscalate={escalate}
        onCancelEscalation={cancelEscalation}
        onClearHistory={clearHistory}
      />
    </>
  );
}
