/**
 * Chatbot Window Component
 * PRD-040: Chatbot de Suporte
 *
 * Main chat window container
 */

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Minus, X, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ChatbotMessage as ChatbotMessageType, ChatbotStatus, FeedbackType } from '@/types/chatbot';
import { ChatbotMessage } from './ChatbotMessage';
import { ChatbotSuggestions } from './ChatbotSuggestions';
import { ChatbotInput } from './ChatbotInput';
import { ChatbotEscalation } from './ChatbotEscalation';

interface ChatbotWindowProps {
  isOpen: boolean;
  isMinimized: boolean;
  status: ChatbotStatus;
  messages: ChatbotMessageType[];
  isEscalating: boolean;
  userEmail?: string;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSendMessage: (message: string) => void;
  onSuggestionClick: (value: string) => void;
  onFeedback: (messageId: string, feedback: FeedbackType) => void;
  onEscalate: (subject: string, description: string, email?: string) => void;
  onCancelEscalation: () => void;
  onClearHistory: () => void;
}

export function ChatbotWindow({
  isOpen,
  isMinimized,
  status,
  messages,
  isEscalating,
  userEmail,
  onClose,
  onMinimize,
  onMaximize,
  onSendMessage,
  onSuggestionClick,
  onFeedback,
  onEscalate,
  onCancelEscalation,
  onClearHistory,
}: ChatbotWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages[messages.length - 1];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          height: isMinimized ? 'auto' : undefined,
        }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'fixed bottom-24 right-6 z-50',
          'w-[360px] max-w-[calc(100vw-3rem)]',
          'bg-card border border-border rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden',
          !isMinimized && 'h-[500px] max-h-[calc(100vh-8rem)]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                Assistente RecrutaRS
              </h3>
              <p className="text-xs text-muted-foreground">
                {status === 'typing' ? 'Digitando...' : 'Online'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onClearHistory}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar conversa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={isMinimized ? onMaximize : onMinimize}
            >
              <Minus className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content (hidden when minimized) */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea
              ref={scrollRef}
              className="flex-1 px-2"
            >
              <div className="py-4">
                {messages.map((message) => (
                  <ChatbotMessage
                    key={message.id}
                    message={message}
                    onFeedback={(feedback) => onFeedback(message.id, feedback)}
                  />
                ))}

                {/* Typing indicator */}
                {status === 'typing' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                          className="w-2 h-2 rounded-full bg-muted-foreground"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Suggestions */}
            {lastMessage?.suggestions && !isEscalating && (
              <ChatbotSuggestions
                suggestions={lastMessage.suggestions}
                onSelect={onSuggestionClick}
              />
            )}

            {/* Escalation form */}
            {isEscalating && (
              <ChatbotEscalation
                onSubmit={onEscalate}
                onCancel={onCancelEscalation}
                userEmail={userEmail}
              />
            )}

            {/* Input */}
            {!isEscalating && (
              <ChatbotInput
                onSend={onSendMessage}
                disabled={status === 'typing'}
              />
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
