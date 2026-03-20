/**
 * KPI Cards
 * PRD-052 + PRD-089: Cards de métricas do dashboard (expandido com 7 dimensões)
 */

import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Play, Clock, TrendingUp, Timer, AlertTriangle, Users, CreditCard, CalendarClock } from 'lucide-react';
import type { HubDashboardKPIs } from '@/types/companyTest';

interface KPICardsProps {
  kpis: HubDashboardKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const avgTimeLabel = kpis.avgCompletionTime >= 24
    ? `${Math.round(kpis.avgCompletionTime / 24 * 10) / 10}d`
    : `${Math.round(kpis.avgCompletionTime)}h`;

  const cards = [
    { label: 'Total de Testes', value: kpis.totalTests, icon: ClipboardList, color: 'text-foreground' },
    { label: 'Testes Ativos', value: kpis.activeTests, icon: Play, color: 'text-green-500' },
    { label: 'Convites Pendentes', value: kpis.pendingInvites, icon: Clock, color: 'text-amber-500' },
    { label: 'Taxa de Conclusão', value: `${kpis.completionRate}%`, icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Tempo Médio', value: avgTimeLabel, icon: Timer, color: 'text-purple-500' },
    { label: 'Taxa de Abandono', value: `${kpis.abandonRate}%`, icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Colaboradores Mapeados', value: `${kpis.mappedMembers}/${kpis.totalMembers}`, icon: Users, color: 'text-cyan-500' },
    { label: 'Créditos Disponíveis', value: kpis.creditsAvailable, icon: CreditCard, color: 'text-emerald-500' },
    { label: 'Retestes Pendentes', value: kpis.pendingRetests, icon: CalendarClock, color: kpis.pendingRetests > 0 ? 'text-red-500' : 'text-gray-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
