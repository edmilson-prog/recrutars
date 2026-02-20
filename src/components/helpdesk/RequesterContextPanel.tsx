/**
 * RequesterContextPanel Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * Sidebar with requester information, engagement metrics, ticket history, quick actions.
 */

import { User, Building2, Shield, Mail, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RequesterEngagement } from './RequesterEngagement';
import { RequesterTicketHistory } from './RequesterTicketHistory';
import { RequesterQuickActions } from './RequesterQuickActions';
import type { RequesterContext } from '@/types/help';
import { requesterTypeLabels } from '@/types/help';
import { cn } from '@/lib/utils';

interface RequesterContextPanelProps {
  context: RequesterContext | null | undefined;
  isLoading: boolean;
}

const typeIcons = {
  candidate: User,
  company: Building2,
  admin: Shield,
} as const;

export function RequesterContextPanel({ context, isLoading }: RequesterContextPanelProps) {
  if (isLoading) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!context) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Dados do solicitante não disponíveis.
        </CardContent>
      </Card>
    );
  }

  const TypeIcon = typeIcons[context.userType] ?? User;

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Solicitante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={context.avatar} alt={context.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <TypeIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{context.name}</p>
              <p className="text-xs text-muted-foreground truncate">{context.email}</p>
            </div>
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[11px]">
              {requesterTypeLabels[context.userType]}
            </Badge>
            {context.planName && (
              <Badge variant="outline" className="text-[11px]">
                {context.planName}
              </Badge>
            )}
            {context.isTrial && (
              <Badge variant="outline" className="text-[11px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400">
                Trial
                {context.trialDaysRemaining !== undefined && ` (${context.trialDaysRemaining}d)`}
              </Badge>
            )}
          </div>

          {/* Company info */}
          {context.companyName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{context.companyName}</span>
            </div>
          )}

          <Separator />

          {/* Dates */}
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>Cadastro: {format(new Date(context.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            {context.lastLoginAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Último login: {formatDistanceToNow(new Date(context.lastLoginAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Engagement */}
      <RequesterEngagement context={context} />

      {/* Ticket History */}
      <RequesterTicketHistory
        totalTickets={context.totalTickets}
        openTickets={context.openTickets}
        avgResolutionTime={context.avgResolutionTime}
      />

      {/* Quick Actions */}
      <RequesterQuickActions context={context} />
    </div>
  );
}
