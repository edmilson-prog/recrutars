/**
 * TicketCard Component
 * PRD-028: Central de Ajuda - Ticket Card Display
 */

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Ticket } from '@/types/help';
import {
  ticketCategoryLabels,
  ticketStatusLabels,
  ticketStatusColors,
} from '@/types/help';

interface TicketCardProps {
  ticket: Ticket;
  onViewDetails: (ticketId: string) => void;
}

export function TicketCard({ ticket, onViewDetails }: TicketCardProps) {
  const statusColorMap = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusColor =
    statusColorMap[ticketStatusColors[ticket.status] as keyof typeof statusColorMap];

  return (
    <Card className="border-border/50 bg-card/50 transition-colors hover:bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header com número e status */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-muted-foreground">
                #{ticket.number}
              </span>
              <Badge variant="outline" className={statusColor}>
                {ticketStatusLabels[ticket.status]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {ticketCategoryLabels[ticket.category]}
              </Badge>
            </div>

            {/* Assunto */}
            <h3 className="font-semibold text-foreground">{ticket.subject}</h3>

            {/* Datas */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>
                Criado{' '}
                {formatDistanceToNow(new Date(ticket.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              <span>•</span>
              <span>
                Atualizado{' '}
                {formatDistanceToNow(new Date(ticket.updatedAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              {ticket.resolvedAt && (
                <>
                  <span>•</span>
                  <span>
                    Resolvido{' '}
                    {formatDistanceToNow(new Date(ticket.resolvedAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </>
              )}
            </div>

            {/* Preview da última mensagem */}
            {ticket.messages.length > 0 && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {ticket.messages[ticket.messages.length - 1].content}
              </p>
            )}
          </div>

          {/* Botão ver detalhes */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(ticket.id)}
            className="shrink-0"
          >
            Ver detalhes
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
