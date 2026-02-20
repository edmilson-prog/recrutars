/**
 * TicketHeader Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Ticket detail header with ID, status selector, priority selector, SLA bar.
 */

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TicketStatusChanger } from './TicketStatusChanger';
import { SLAProgressBar } from './SLAProgressBar';
import type { AdminTicketDetail, TicketPriority, TicketStatus } from '@/types/help';
import {
  ticketPriorityLabels,
  ticketPriorityColors,
  ticketCategoryLabels,
} from '@/types/help';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TicketHeaderProps {
  ticket: AdminTicketDetail;
  onStatusChange: (status: TicketStatus) => void;
  onPriorityChange: (priority: TicketPriority) => void;
  onExtendSLA: () => void;
  isUpdating: boolean;
}

const priorityBadgeColors: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function TicketHeader({
  ticket,
  onStatusChange,
  onPriorityChange,
  onExtendSLA,
  isUpdating,
}: TicketHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/admin/helpdesk')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Helpdesk
      </Button>

      {/* Title + badges */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm text-muted-foreground">
              #{ticket.number}
            </span>
            <Badge variant="secondary" className="text-xs">
              {ticketCategoryLabels[ticket.category]}
            </Badge>
            {ticket.requesterName && (
              <span className="text-sm text-muted-foreground">
                por <span className="font-medium text-foreground">{ticket.requesterName}</span>
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground">{ticket.subject}</h1>
        </div>

        {/* Status + Priority selectors */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Priority */}
          <Select
            value={ticket.priority}
            onValueChange={(v) => onPriorityChange(v as TicketPriority)}
            disabled={isUpdating}
          >
            <SelectTrigger className={cn('w-[120px] h-8 text-xs', priorityBadgeColors[ticketPriorityColors[ticket.priority]])}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ticketPriorityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <TicketStatusChanger
            currentStatus={ticket.status}
            onStatusChange={onStatusChange}
            disabled={isUpdating}
          />
        </div>
      </div>

      {/* SLA Progress Bar */}
      <SLAProgressBar
        slaDeadline={ticket.slaDeadline}
        resolvedAt={ticket.resolvedAt}
        createdAt={ticket.createdAt}
        onExtend={onExtendSLA}
      />
    </div>
  );
}
