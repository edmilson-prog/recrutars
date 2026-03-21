/**
 * Invitation Manager KPIs
 * 4 cards compactos: Total Enviados, Taxa Conclusão, Tempo Médio, Abandonos
 */

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, TrendingUp, Timer, AlertTriangle } from 'lucide-react';
import { useTestMetrics } from '@/hooks/useCompanyTestsQuery';
import { useAuth } from '@/contexts/AuthContext';

export function InvitationManagerKPIs() {
  const { currentCompany } = useAuth();
  const { data: metrics, isLoading } = useTestMetrics(currentCompany?.id, '30d');

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const avgTimeLabel = metrics
    ? metrics.avgCompletionHours >= 24
      ? `${Math.round(metrics.avgCompletionHours / 24 * 10) / 10}d`
      : `${Math.round(metrics.avgCompletionHours)}h`
    : '—';

  const cards = [
    {
      label: 'Total Enviados',
      value: metrics?.totalInvitations ?? 0,
      icon: Send,
      color: 'text-blue-500',
    },
    {
      label: 'Taxa de Conclusão',
      value: `${metrics?.completionRate ?? 0}%`,
      icon: TrendingUp,
      color: (metrics?.completionRate ?? 0) >= 70
        ? 'text-emerald-500'
        : (metrics?.completionRate ?? 0) >= 40
          ? 'text-amber-500'
          : 'text-red-500',
    },
    {
      label: 'Tempo Médio',
      value: avgTimeLabel,
      icon: Timer,
      color: 'text-purple-500',
    },
    {
      label: 'Abandonos',
      value: metrics
        ? `${metrics.abandoned} (${metrics.abandonRate}%)`
        : '0',
      icon: AlertTriangle,
      color: (metrics?.abandoned ?? 0) > 0 ? 'text-orange-500' : 'text-gray-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="pt-3 pb-3 px-4">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md bg-muted ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold truncate">{card.value}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
