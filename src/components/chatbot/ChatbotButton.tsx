/**
 * Chatbot Button Component
 * PRD-040: Chatbot de Suporte
 *
 * Floating button to open the chatbot
 */

import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatbotButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnread?: boolean;
}

export function ChatbotButton({ isOpen, onClick, hasUnread = false }: ChatbotButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-14 h-14 rounded-full shadow-lg',
        'flex items-center justify-center',
        'transition-colors duration-200',
        isOpen
          ? 'bg-muted text-muted-foreground hover:bg-muted/80'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
      aria-label={isOpen ? 'Fechar chat' : 'Abrir chat de suporte'}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <MessageCircle className="w-6 h-6" />
            {hasUnread && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
