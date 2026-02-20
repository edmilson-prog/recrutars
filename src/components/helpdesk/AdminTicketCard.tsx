/**
 * AdminTicketCard Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Ticket card for admin listing with ID, requester info, preview, SLA, priority.
 */

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronRight, User, Building2, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SLASemaphore } from './SLASemaphore';
import type { AdminTicket } from '@/types/help';
import {
  ticketStatusLabels,
  ticketStatusColors,
  ticketPriorityLabels,
  ticketPriorityColors,
  ticketCategoryLabels,
} from '@/types/help';
import { cn } from '@/lib/utils';

interface AdminTicketCardProps {
  ticket: AdminTicket;
  onClick: (ticketId: string) => void;
}

const requesterIcon = {
  candidate: User,
  company: Building2,
  admin: Shield,
} as const;

const priorityBadgeColors: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
  orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300',
  red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300',
};

const statusBadgeColors: Record<string, string> = {
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
  orange: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300',
  green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300',
  gray: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
};

export function AdminTicketCard({ ticket, onClick }: AdminTicketCardProps) {
  const RequesterIcon = ticket.requesterType
    ? requesterIcon[ticket.requesterType] ?? User
    : User;

  return (
    <Card
      className="bg-card rounded-xl border-border/50 transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer"
      onClick={() => onClick(ticket.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Requester avatar */}
          <Avatar className="h-10 w-10 shrink-0 mt-0.5">
            <AvatarImage src={ticket.requesterAvatar} alt={ticket.requesterName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <RequesterIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Header line */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">
                #{ticket.number}
              </span>
              <Badge
                variant="outline"
                className={cn('text-[11px] px-1.5 py-0', statusBadgeColors[ticketStatusColors[ticket.status]])}
              >
                {ticketStatusLabels[ticket.status]}
              </Badge>
              <Badge
                variant="outline"
                className={cn('text-[11px] px-1.5 py-0', priorityBadgeColors[ticketPriorityColors[ticket.priority]])}
              >
                {ticketPriorityLabels[ticket.priority]}
              </Badge>
              <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
                {ticketCategoryLabels[ticket.category]}
              </Badge>
            </div>

            {/* Subject */}
            <h3 className="font-medium text-sm text-foreground truncate">
              {ticket.subject}
            </h3>

            {/* Requester + time */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium">{ticket.requesterName ?? 'Desconhecido'}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(ticket.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              {ticket.messageCount > 1 && (
                <>
                  <span>•</span>
                  <span>{ticket.messageCount} mensagens</span>
                </>
              )}
            </div>

            {/* Preview */}
            {ticket.lastMessagePreview && (
              <p className="text-xs text-muted-foreground/70 line-clamp-1">
                {ticket.lastMessagePreview}
              </p>
            )}
          </div>

          {/* Right side: SLA + chevron */}
          <div className="flex items-center gap-3 shrink-0">
            <SLASemaphore
              slaDeadline={ticket.slaDeadline}
              resolvedAt={ticket.resolvedAt}
              showLabel
            />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
