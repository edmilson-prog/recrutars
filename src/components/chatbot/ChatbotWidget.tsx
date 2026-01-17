/**
 * Chatbot Widget Component
 * PRD-040: Chatbot de Suporte
 *
 * Main widget that combines button and window
 */

import { useChatbot } from '@/hooks/useChatbot';
import { useAuth } from '@/contexts/AuthContext';
import { ChatbotButton } from './ChatbotButton';
import { ChatbotWindow } from './ChatbotWindow';

export function ChatbotWidget() {
  const { user } = useAuth();
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
