/**
 * TicketsList Component
 * PRD-028: Central de Ajuda - Tickets List with Filters
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    in_progress: tickets.filter((t) => t.status === 'in_progress' || t.status === 'waiting_user').length,
    resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
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
          <TabsTrigger value="in_progress">
            Em Andamento ({counts.in_progress})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolvidos ({counts.resolved})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <AnimatePresence mode="wait">
            {filteredTickets.length > 0 ? (
              <motion.div
                key={`tickets-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {filteredTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TicketCard
                      ticket={ticket}
                      onViewDetails={onViewDetails}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`empty-${activeTab}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/30 py-12"
              >
                <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 font-medium text-foreground">
                  {activeTab === 'all'
                    ? 'Você não tem tickets'
                    : `Nenhum ticket ${
                        activeTab === 'open'
                          ? 'aberto'
                          : activeTab === 'in_progress'
                          ? 'em andamento'
                          : 'resolvido'
                      }`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'all'
                    ? 'Crie um novo ticket para entrar em contato com o suporte.'
                    : 'Tente selecionar outro filtro.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
