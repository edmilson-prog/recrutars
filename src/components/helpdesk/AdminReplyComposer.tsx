/**
 * AdminReplyComposer Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Reply area with tabs: Resposta (public) | Nota Interna (admin-only).
 */

import { useState } from 'react';
import { Send, StickyNote, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface AdminReplyComposerProps {
  onSendReply: (content: string) => Promise<void>;
  onAddNote: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function AdminReplyComposer({ onSendReply, onAddNote, disabled }: AdminReplyComposerProps) {
  const [tab, setTab] = useState<'reply' | 'note'>('reply');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      if (tab === 'reply') {
        await onSendReply(content.trim());
      } else {
        await onAddNote(content.trim());
      }
      setContent('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border border-border/50 rounded-lg bg-card">
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'reply' | 'note')}>
        <div className="border-b border-border/50 px-3">
          <TabsList className="h-9 bg-transparent">
            <TabsTrigger value="reply" className="gap-1.5 text-xs data-[state=active]:bg-primary/10">
              <Send className="h-3 w-3" />
              Resposta
            </TabsTrigger>
            <TabsTrigger value="note" className="gap-1.5 text-xs data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-700">
              <StickyNote className="h-3 w-3" />
              Nota Interna
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-3 space-y-3">
          {tab === 'note' && (
            <div className="flex items-center gap-2 rounded bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400">
              <StickyNote className="h-3.5 w-3.5" />
              Notas internas são visíveis apenas para a equipe de suporte.
            </div>
          )}

          <Textarea
            placeholder={
              tab === 'reply'
                ? 'Escreva sua resposta...'
                : 'Adicione uma nota interna...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] resize-none"
            disabled={disabled || isSending}
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Ctrl+Enter para enviar
            </span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || disabled || isSending}
              className={tab === 'note' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              {isSending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {tab === 'reply' ? 'Enviar Resposta' : 'Adicionar Nota'}
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
