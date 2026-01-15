/**
 * TicketThread Component
 * PRD-028: Central de Ajuda - Ticket Message Thread Display
 */

import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Paperclip, User, Headphones } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { TicketMessage } from '@/types/help';
import { cn } from '@/lib/utils';

interface TicketThreadProps {
  messages: TicketMessage[];
}

export function TicketThread({ messages }: TicketThreadProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem ao carregar ou adicionar nova mensagem
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-6">
      {messages.map((message, index) => {
        const isUser = message.sender === 'user';
        const isFirst = index === 0;

        return (
          <div
            key={message.id}
            className={cn(
              'flex gap-4',
              isUser ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback
                className={cn(
                  isUser
                    ? 'bg-primary/10 text-primary'
                    : 'bg-cyan-500/10 text-cyan-600'
                )}
              >
                {isUser ? <User className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>

            {/* Message Content */}
            <div className={cn('flex-1 space-y-2', isUser ? 'items-end' : 'items-start')}>
              {/* Header */}
              <div
                className={cn(
                  'flex items-center gap-2 text-sm',
                  isUser ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <span className="font-medium text-foreground">
                  {isUser ? 'Você' : 'Equipe RecrutaRS'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
                {isFirst && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Mensagem inicial
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  'rounded-lg p-4',
                  isUser
                    ? 'bg-primary/10 text-foreground'
                    : 'bg-card border border-border/50'
                )}
              >
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {message.content}
                </p>

                {/* Attachment */}
                {message.attachmentUrl && message.attachmentName && (
                  <div className="mt-3 flex items-center gap-2 rounded border border-border bg-background/50 p-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate text-xs text-foreground">
                      {message.attachmentName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        // Mock: Em produção, abriria o arquivo
                        window.open(message.attachmentUrl, '_blank');
                      }}
                    >
                      Abrir
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Ref para auto-scroll */}
      <div ref={endOfMessagesRef} />
    </div>
  );
}
