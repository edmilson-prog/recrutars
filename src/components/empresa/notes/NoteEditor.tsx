// src/components/empresa/notes/NoteEditor.tsx
import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_CHARS = 2000;

interface NoteEditorProps {
  initialContent?: string;
  placeholder?: string;
  onSave: (content: string) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  autoFocus?: boolean;
}

export function NoteEditor({
  initialContent = '',
  placeholder = 'Escreva uma nota interna…',
  onSave,
  onCancel,
  isSubmitting = false,
  autoFocus = true,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  const trimmed = content.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= MAX_CHARS;
  const overLimit = content.length > MAX_CHARS;

  const handleSave = async () => {
    if (!isValid) return;
    await onSave(trimmed);
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
        maxLength={MAX_CHARS + 100}
        disabled={isSubmitting}
        className={cn(overLimit && 'border-destructive focus-visible:ring-destructive')}
      />
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs',
            overLimit ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {content.length}/{MAX_CHARS}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
