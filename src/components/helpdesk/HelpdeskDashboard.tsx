/**
 * HelpdeskDashboard Component
 * PRD-082: Admin Helpdesk Intelligence
 *
 * KPI cards for helpdesk overview (metrics from DB, placeholder for Phase 3 charts).
 */

import {
  Inbox, Clock, CheckCircle, AlertTriangle, Star,
  TrendingUp, Calendar, BarChart3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { HelpdeskMetrics } from '@/types/help';
import { cn } from '@/lib/utils';

interface HelpdeskDashboardProps {
  metrics?: HelpdeskMetrics;
  isLoading: boolean;
}

interface KPICardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  isLoading: boolean;
}

function KPICard({ icon: Icon, label, value, subtitle, color, isLoading }: KPICardProps) {
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-xl font-bold text-foreground">{value}</p>
            )}
            {subtitle && !isLoading && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HelpdeskDashboard({ metrics, isLoading }: HelpdeskDashboardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
      <KPICard
        icon={Inbox}
        label="Abertos"
        value={metrics?.totalOpen ?? 0}
        color="bg-yellow-500/10 text-yellow-600"
        isLoading={isLoading}
      />
      <KPICard
        icon={Clock}
        label="Em Andamento"
        value={(metrics?.totalInProgress ?? 0) + (metrics?.totalWaitingUser ?? 0)}
        subtitle={metrics?.totalWaitingUser ? `${metrics.totalWaitingUser} aguardando` : undefined}
        color="bg-blue-500/10 text-blue-600"
        isLoading={isLoading}
      />
      <KPICard
        icon={CheckCircle}
        label="Resolvidos"
        value={(metrics?.totalResolved ?? 0) + (metrics?.totalClosed ?? 0)}
        color="bg-emerald-500/10 text-emerald-600"
        isLoading={isLoading}
      />
      <KPICard
        icon={AlertTriangle}
        label="SLA Violado"
        value={metrics?.slaBreachedCount ?? 0}
        color="bg-red-500/10 text-red-600"
        isLoading={isLoading}
      />
      <KPICard
        icon={Star}
        label="CSAT Médio"
        value={metrics?.avgCsatRating ? `${metrics.avgCsatRating}/5` : '—'}
        subtitle={metrics?.ticketsThisWeek ? `${metrics.ticketsThisWeek} esta semana` : undefined}
        color="bg-purple-500/10 text-purple-600"
        isLoading={isLoading}
      />
    </div>
  );
}
