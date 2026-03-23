/**
 * KPI Cards
 * PRD-052 + PRD-089: Cards de métricas do dashboard (expandido com 7 dimensões)
 */

import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ClipboardList, Play, Clock, TrendingUp, Timer, AlertTriangle, Users, CreditCard, CalendarClock, HelpCircle } from 'lucide-react';
import type { HubDashboardKPIs } from '@/types/companyTest';

interface KPICardsProps {
  kpis: HubDashboardKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const avgTimeLabel = kpis.avgCompletionTime >= 24
    ? `${Math.round(kpis.avgCompletionTime / 24 * 10) / 10}d`
    : `${Math.round(kpis.avgCompletionTime)}h`;

  const cards: { label: string; tooltip: string; value: string | number; icon: typeof ClipboardList; color: string; valueColor?: string }[] = [
    { label: 'Total de Testes', tooltip: 'Número total de testes comportamentais criados pela empresa.', value: kpis.totalTests, icon: ClipboardList, color: 'text-foreground' },
    { label: 'Testes Ativos', tooltip: 'Testes com status ativo, prontos para receber convites e respostas.', value: kpis.activeTests, icon: Play, color: 'text-green-500' },
    { label: 'Convites Pendentes', tooltip: 'Convites enviados que ainda não foram respondidos pelos colaboradores.', value: kpis.pendingInvites, icon: Clock, color: 'text-amber-500' },
    { label: 'Taxa de Conclusão', tooltip: 'Percentual de convites que resultaram em testes concluídos.', value: `${kpis.completionRate}%`, icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Tempo Médio', tooltip: 'Tempo médio entre o envio do convite e a conclusão do teste.', value: avgTimeLabel, icon: Timer, color: 'text-purple-500' },
    { label: 'Taxa de Abandono', tooltip: 'Percentual de testes iniciados mas não concluídos pelo colaborador.', value: `${kpis.abandonRate}%`, icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Colaboradores Mapeados', tooltip: 'Colaboradores com perfil comportamental Gauge-Pro concluído sobre o total.', value: `${kpis.mappedMembers}/${kpis.totalMembers}`, icon: Users, color: 'text-cyan-500' },
    { label: 'Créditos Disponíveis', tooltip: 'Créditos de teste restantes no plano atual da empresa.', value: kpis.creditsAvailable, icon: CreditCard, color: kpis.creditsAvailable === 0 ? 'text-red-500' : kpis.creditsAvailable <= 4 ? 'text-amber-500' : 'text-emerald-500', valueColor: kpis.creditsAvailable === 0 ? 'text-red-500' : undefined },
    { label: 'Retestes Pendentes', tooltip: 'Colaboradores com reteste comportamental agendado ou vencido.', value: kpis.pendingRetests, icon: CalendarClock, color: kpis.pendingRetests > 0 ? 'text-red-500' : 'text-gray-400' },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="absolute top-2.5 right-2.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors cursor-help"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[220px] text-center">
                  <p>{card.tooltip}</p>
                </TooltipContent>
              </Tooltip>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${card.valueColor ?? ''}`}>{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
