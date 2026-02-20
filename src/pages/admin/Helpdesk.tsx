/**
 * Admin Helpdesk Page
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Dashboard + ticket listing with filters for admin support operations.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { HelpdeskDashboard } from '@/components/helpdesk/HelpdeskDashboard';
import { TicketListFilters } from '@/components/helpdesk/TicketListFilters';
import { AdminTicketCard } from '@/components/helpdesk/AdminTicketCard';
import { Button } from '@/components/ui/button';
import { useAdminTickets, useHelpdeskMetrics } from '@/hooks/useAdminTicketsQuery';
import type { AdminTicketFilters } from '@/types/help';

function HelpdeskContent() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AdminTicketFilters>({
    page: 1,
    pageSize: 20,
  });

  const { data: metricsData, isLoading: metricsLoading } = useHelpdeskMetrics();
  const { data: ticketsResult, isLoading: ticketsLoading } = useAdminTickets(filters);

  const tickets = ticketsResult?.data ?? [];
  const totalPages = ticketsResult ? Math.ceil(ticketsResult.total / (filters.pageSize ?? 20)) : 1;

  const handleTicketClick = (ticketId: string) => {
    navigate(`/admin/helpdesk/tickets/${ticketId}`);
  };

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <AdminTabNav />

      {/* KPI Dashboard */}
      <HelpdeskDashboard metrics={metricsData} isLoading={metricsLoading} />

      {/* Filters */}
      <TicketListFilters filters={filters} onFiltersChange={setFilters} />

      {/* Ticket List */}
      {ticketsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`tickets-${filters.page}-${filters.status}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <AdminTicketCard
                  ticket={ticket}
                  onClick={handleTicketClick}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/30 py-16">
          <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 font-medium text-foreground">Nenhum ticket encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou aguarde novos tickets.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {filters.page ?? 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) >= totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminHelpdesk() {
  return (
    <DashboardLayout userType="admin">
      <HelpdeskContent />
    </DashboardLayout>
  );
}
