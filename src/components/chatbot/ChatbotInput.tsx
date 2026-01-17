/**
 * Chatbot Input Component
 * PRD-040: Chatbot de Suporte
 *
 * Message input field
 */

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatbotInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatbotInput({
  onSend,
  disabled = false,
  placeholder = 'Digite sua mensagem...',
}: ChatbotInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-border bg-card">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'min-h-[44px] max-h-[120px] resize-none',
          'py-3 px-4 rounded-xl'
        )}
        rows={1}
      />
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        className="flex-shrink-0 h-11 w-11 rounded-xl"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
}
