/**
 * TicketsList Component
 * PRD-028: Central de Ajuda - Tickets List with Filters
 */

import { useState } from 'react';
import { Inbox } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TicketCard } from './TicketCard';
import type { Ticket, TicketStatus } from '@/types/help';

interface TicketsListProps {
  tickets: Ticket[];
  onViewDetails: (ticketId: string) => void;
}

export function TicketsList({ tickets, onViewDetails }: TicketsListProps) {
  const [activeTab, setActiveTab] = useState<TicketStatus | 'all'>('all');

  // Filtrar tickets por status
  const filteredTickets =
    activeTab === 'all'
      ? tickets
      : tickets.filter((t) => t.status === activeTab);

  // Contar tickets por status
  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    answered: tickets.filter((t) => t.status === 'answered').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Filtros por status */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TicketStatus | 'all')}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Todos ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="open">
            Abertos ({counts.open})
          </TabsTrigger>
          <TabsTrigger value="answered">
            Respondidos ({counts.answered})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolvidos ({counts.resolved})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTickets.length > 0 ? (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/30 py-12">
              <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 font-medium text-foreground">
                {activeTab === 'all'
                  ? 'Você não tem tickets'
                  : `Nenhum ticket ${
                      activeTab === 'open'
                        ? 'aberto'
                        : activeTab === 'answered'
                        ? 'respondido'
                        : 'resolvido'
                    }`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'all'
                  ? 'Crie um novo ticket para entrar em contato com o suporte.'
                  : 'Tente selecionar outro filtro.'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
