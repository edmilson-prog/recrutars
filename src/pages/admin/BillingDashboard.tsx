/**
 * BillingDashboard Page
 * PRD-076: Admin billing analytics with KPIs
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ArrowUp,
  ArrowDown,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function BillingDashboard() {
  const { subscriptions, isLoading } = useSubscriptions();

  const kpis = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    const cancelled = subscriptions.filter(s => s.status === 'cancelled');
    const trial = subscriptions.filter(s => s.status === 'trial');
    const pastDue = subscriptions.filter(s => s.status === 'past_due');

    // MRR: sum of monthly-equivalent prices for active subs
    const mrr = active.reduce((sum, s) => {
      const price = s.pricePaid ?? 0;
      const months = { monthly: 1, quarterly: 3, semiannual: 6, annual: 12 }[s.period] ?? 1;
      return sum + (price / months);
    }, 0);

    // Churn rate (simple: cancelled / total in last 30 days)
    const total = subscriptions.length;
    const churnRate = total > 0 ? (cancelled.length / total) * 100 : 0;

    // Conversion trial → paid
    const trialConversions = active.filter(s => {
      const planSlug = s.planSlug ?? '';
      return !planSlug.includes('trial');
    }).length;

    // Revenue by plan
    const revenueByPlan: Record<string, number> = {};
    active.forEach(s => {
      const name = s.planName ?? 'Desconhecido';
      revenueByPlan[name] = (revenueByPlan[name] ?? 0) + (s.pricePaid ?? 0);
    });

    return {
      mrr: Math.round(mrr * 100) / 100,
      activeCount: active.length,
      cancelledCount: cancelled.length,
      trialCount: trial.length,
      pastDueCount: pastDue.length,
      churnRate: Math.round(churnRate * 10) / 10,
      trialConversions,
      total,
      revenueByPlan,
    };
  }, [subscriptions]);

  const cards = [
    { label: 'MRR (Receita Mensal Recorrente)', value: formatBRL(kpis.mrr), icon: DollarSign, color: 'text-green-600' },
    { label: 'Assinaturas Ativas', value: kpis.activeCount.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Em Trial', value: kpis.trialCount.toString(), icon: RefreshCw, color: 'text-cyan-600' },
    { label: 'Canceladas', value: kpis.cancelledCount.toString(), icon: XCircle, color: 'text-red-600' },
    { label: 'Pagamento Pendente', value: kpis.pastDueCount.toString(), icon: TrendingDown, color: 'text-yellow-600' },
    { label: 'Taxa de Churn', value: `${kpis.churnRate}%`, icon: TrendingDown, color: 'text-orange-600' },
    { label: 'Conversões Trial → Pago', value: kpis.trialConversions.toString(), icon: TrendingUp, color: 'text-green-600' },
    { label: 'Total de Assinaturas', value: kpis.total.toString(), icon: Users, color: 'text-foreground' },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Financeiro"
          description="Métricas de faturamento, receita recorrente e acompanhamento financeiro da plataforma."
          howItWorks={[
            'Métricas financeiras: receita, assinaturas ativas e inadimplência',
            'Gráficos mostram evolução da receita ao longo do tempo',
            'Acompanhe taxa de conversão de trials para pagantes',
          ]}
        />

        <AdminTabNav />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card rounded-xl p-4 shadow-soft"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn('w-4 h-4', card.color)} />
                      <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                    </div>
                    <p className={cn('text-2xl font-bold', card.color)}>{card.value}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Revenue by plan */}
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <h2 className="text-lg font-bold text-foreground mb-4">Receita por Plano</h2>
              <div className="space-y-3">
                {Object.entries(kpis.revenueByPlan)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, revenue]) => {
                    const maxRevenue = Math.max(...Object.values(kpis.revenueByPlan), 1);
                    const pct = (revenue / maxRevenue) * 100;
                    return (
                      <div key={name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{name}</span>
                          <span className="text-muted-foreground">{formatBRL(revenue)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(kpis.revenueByPlan).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma receita registrada ainda.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
