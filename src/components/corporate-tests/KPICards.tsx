/**
 * KPI Cards
 * PRD-052: 5 cards de métricas do dashboard
 */

import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Play, Clock, TrendingUp, Timer } from 'lucide-react';
import type { HubDashboardKPIs } from '@/types/companyTest';

interface KPICardsProps {
  kpis: HubDashboardKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    { label: 'Total de Testes', value: kpis.totalTests, icon: ClipboardList, color: 'text-foreground' },
    { label: 'Testes Ativos', value: kpis.activeTests, icon: Play, color: 'text-green-500' },
    { label: 'Convites Pendentes', value: kpis.pendingInvites, icon: Clock, color: 'text-amber-500' },
    { label: 'Taxa de Conclusão', value: `${kpis.completionRate}%`, icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Tempo Médio', value: `${kpis.avgCompletionTime}d`, icon: Timer, color: 'text-purple-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
