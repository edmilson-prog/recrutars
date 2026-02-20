/**
 * RequesterTicketHistory Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Summary of requester's ticket history.
 */

import { Inbox, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RequesterTicketHistoryProps {
  totalTickets: number;
  openTickets: number;
  avgResolutionTime?: number;
}

export function RequesterTicketHistory({
  totalTickets,
  openTickets,
  avgResolutionTime,
}: RequesterTicketHistoryProps) {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Histórico de Tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Inbox className="h-3.5 w-3.5" />
            <span>Total de tickets</span>
          </div>
          <span className="font-semibold text-foreground">{totalTickets}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Abertos agora</span>
          </div>
          <span className="font-semibold text-foreground">{openTickets}</span>
        </div>
        {avgResolutionTime !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Tempo médio resolução</span>
            </div>
            <span className="font-semibold text-foreground">
              {avgResolutionTime < 1
                ? `${Math.round(avgResolutionTime * 60)}min`
                : `${Math.round(avgResolutionTime)}h`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
