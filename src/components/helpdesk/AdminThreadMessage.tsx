/**
 * AdminThreadMessage Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Individual message in the admin ticket thread.
 * Visually distinguishes: user messages, admin replies, internal notes.
 */

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Paperclip, User, Headphones, StickyNote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TicketMessage } from '@/types/help';
import { cn } from '@/lib/utils';

interface AdminThreadMessageProps {
  message: TicketMessage;
}

export function AdminThreadMessage({ message }: AdminThreadMessageProps) {
  const isUser = message.senderType === 'user';
  const isAdmin = message.senderType === 'admin';
  const isNote = message.isInternalNote;
  const isSystem = message.senderType === 'system';

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row' : 'flex-row',
        isNote && 'opacity-90'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarFallback
          className={cn(
            isNote
              ? 'bg-amber-500/10 text-amber-600'
              : isUser
                ? 'bg-primary/10 text-primary'
                : isSystem
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-cyan-500/10 text-cyan-600'
          )}
        >
          {isNote ? (
            <StickyNote className="h-4 w-4" />
          ) : isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Headphones className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">
            {isUser ? 'Solicitante' : isSystem ? 'Sistema' : 'Suporte'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
          {isNote && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400">
              Nota Interna
            </Badge>
          )}
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-lg p-3 text-sm leading-relaxed',
            isNote
              ? 'bg-amber-50 border border-amber-200 border-dashed dark:bg-amber-950/30 dark:border-amber-800'
              : isUser
                ? 'bg-muted/50 border border-border/50'
                : isSystem
                  ? 'bg-muted/30 border border-border/30 italic text-muted-foreground'
                  : 'bg-primary/5 border border-primary/10'
          )}
        >
          <p className="whitespace-pre-line">{message.content}</p>

          {/* Attachment */}
          {message.attachmentUrl && message.attachmentName && (
            <div className="mt-2 flex items-center gap-2 rounded border border-border bg-background/50 p-2">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1 truncate text-xs text-foreground">
                {message.attachmentName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-xs"
                onClick={() => window.open(message.attachmentUrl, '_blank')}
              >
                Abrir
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
