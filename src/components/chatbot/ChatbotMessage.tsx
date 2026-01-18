/**
 * Chatbot Message Component
 * PRD-040: Chatbot de Suporte
 *
 * Displays a single message in the chat
 */

import { motion } from 'framer-motion';
import { Bot, User, ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatbotMessage as ChatbotMessageType, FeedbackType } from '@/types/chatbot';

// Simple markdown-like parser for bold text
function parseSimpleMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

interface ChatbotMessageProps {
  message: ChatbotMessageType;
  onFeedback?: (feedback: FeedbackType) => void;
}

export function ChatbotMessage({ message, onFeedback }: ChatbotMessageProps) {
  const isBot = message.type === 'bot';
  const isSystem = message.type === 'system';
  const isUser = message.type === 'user';

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-2"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs">
          <Info className="w-3 h-3" />
          <span>{message.content}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-primary' : 'bg-secondary'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-secondary-foreground" />
        )}
      </div>

      {/* Message content */}
      <div className={cn('flex flex-col max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
          )}
        >
          {isBot ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none [&>strong]:font-semibold"
              dangerouslySetInnerHTML={{
                __html: parseSimpleMarkdown(message.content),
              }}
            />
          ) : (
            <p>{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>

        {/* Feedback buttons (for bot messages without feedback yet) */}
        {isBot && !message.feedback && onFeedback && message.relatedQuestionId && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-muted-foreground mr-1">Isso ajudou?</span>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 hover:text-green-600 hover:bg-green-100"
              onClick={() => onFeedback('helpful')}
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 hover:text-red-600 hover:bg-red-100"
              onClick={() => onFeedback('not_helpful')}
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Feedback indicator */}
        {message.feedback && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-xs',
              message.feedback === 'helpful' ? 'text-green-600' : 'text-muted-foreground'
            )}
          >
            {message.feedback === 'helpful' ? (
              <>
                <ThumbsUp className="w-3 h-3" />
                <span>Obrigado!</span>
              </>
            ) : (
              <>
                <ThumbsDown className="w-3 h-3" />
                <span>Vamos melhorar</span>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
