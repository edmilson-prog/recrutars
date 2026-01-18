/**
 * Chatbot Suggestions Component
 * PRD-040: Chatbot de Suporte
 *
 * Quick reply suggestions
 */

import { motion } from 'framer-motion';
import { MessageSquare, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatbotSuggestion } from '@/types/chatbot';

interface ChatbotSuggestionsProps {
  suggestions: ChatbotSuggestion[];
  onSelect: (value: string) => void;
}

const TYPE_ICONS = {
  quick_reply: MessageSquare,
  action: Zap,
  link: ExternalLink,
};

export function ChatbotSuggestions({ suggestions, onSelect }: ChatbotSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 px-4 py-2"
    >
      {suggestions.map((suggestion, index) => {
        const Icon = TYPE_ICONS[suggestion.type];

        return (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(suggestion.value)}
              className={cn(
                'gap-1.5 text-xs h-8',
                suggestion.type === 'action' && 'border-primary text-primary'
              )}
            >
              <Icon className="w-3 h-3" />
              {suggestion.label}
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
