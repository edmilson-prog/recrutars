/**
 * SubscriptionDashboard Page
 * PRD-060: Dashboard with KPIs and charts for subscription analytics
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  Star,
  DollarSign,
  FlaskConical,
  AlertTriangle,
  TimerOff,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

const PERIOD_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

export default function SubscriptionDashboard() {
  const { stats, subscriptions } = useSubscriptions();

  // Compute chart data
  const planDistribution = useMemo(() => {
    return Object.entries(stats.byPlan).map(([name, count]) => ({
      name,
      value: count,
    }));
  }, [stats.byPlan]);

  const periodDistribution = useMemo(() => {
    return Object.entries(stats.byPeriod).map(([period, count]) => ({
      name: PERIOD_LABELS[period] || period,
      value: count,
    }));
  }, [stats.byPeriod]);

  // Mock growth data (last 6 months)
  const growthData = useMemo(() => {
    const months = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'];
    const baseValues = [3, 5, 8, 11, 14, stats.active];

    return months.map((month, index) => ({
      month,
      assinantes: baseValues[index],
    }));
  }, [stats.active]);

  // Expiring in 30 days
  const expiringIn30Days = useMemo(() => {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return subscriptions.filter((s) => {
      if (s.status !== 'active') return false;
      const endDate = new Date(s.endDate);
      return endDate >= now && endDate <= thirtyDays;
    }).length;
  }, [subscriptions]);

  // PRD-074: Trial KPIs
  const trialStats = useMemo(() => {
    const now = new Date();
    const fifteenDays = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const trialSubs = subscriptions.filter((s) => s.isTrial);
    const active = trialSubs.filter((s) => {
      if (s.status !== 'trial') return false;
      const end = s.trialEndDate ? new Date(s.trialEndDate) : new Date(s.endDate);
      return end >= now;
    }).length;
    const expiringSoon = trialSubs.filter((s) => {
      if (s.status !== 'trial') return false;
      const end = s.trialEndDate ? new Date(s.trialEndDate) : new Date(s.endDate);
      return end >= now && end <= fifteenDays;
    }).length;
    const expired = trialSubs.filter((s) => {
      const end = s.trialEndDate ? new Date(s.trialEndDate) : new Date(s.endDate);
      return end < now || s.status === 'expired' || s.status === 'canceled';
    }).length;

    return { active, expiringSoon, expired };
  }, [subscriptions]);

  // Growth percentage (comparing last 2 months from mock)
  const growthPercent = useMemo(() => {
    if (growthData.length < 2) return 0;
    const last = growthData[growthData.length - 1].assinantes;
    const prev = growthData[growthData.length - 2].assinantes;
    if (prev === 0) return 100;
    return Math.round(((last - prev) / prev) * 100);
  }, [growthData]);

  // Top 3 plans by count
  const topPlans = useMemo(() => {
    return Object.entries(stats.byPlan)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count})`)
      .join(', ');
  }, [stats.byPlan]);

  // KPI cards
  const kpis = [
    {
      label: 'Total Assinantes',
      value: stats.total.toString(),
      icon: Users,
      color: 'text-foreground',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Por Plano (Top 3)',
      value: topPlans || '--',
      icon: CreditCard,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10',
      isSmallText: true,
    },
    {
      label: 'Crescimento Mes',
      value: `${growthPercent > 0 ? '+' : ''}${growthPercent}%`,
      icon: TrendingUp,
      color: growthPercent >= 0 ? 'text-success' : 'text-destructive',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Expirando em 30d',
      value: expiringIn30Days.toString(),
      icon: Clock,
      color: expiringIn30Days > 0 ? 'text-warning' : 'text-muted-foreground',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Early Adopters',
      value: stats.earlyAdopters.toString(),
      icon: Star,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10',
    },
    {
      label: 'Receita Mensal',
      value: formatBRL(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <PageHeader
          title="Dashboard de Assinaturas"
          description="Visão geral de assinantes, receita e métricas de crescimento da plataforma."
          howItWorks={[
            'Metricas de assinaturas: ativas, trials, churn e receita',
            'Graficos mostram evolucao ao longo do tempo',
            'Acompanhe taxa de conversao e retencao',
          ]}
        />

        <AdminTabNav />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', kpi.bgColor)}>
                <kpi.icon className={cn('w-5 h-5', kpi.color)} />
              </div>
              <p className={cn(
                'font-bold',
                kpi.isSmallText ? 'text-sm' : 'text-xl',
                kpi.color
              )}>
                {kpi.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* PRD-074: Trial KPIs */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Monitoramento de Trials
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Trials Ativos',
                value: trialStats.active.toString(),
                icon: FlaskConical,
                color: 'text-teal-600',
                bgColor: 'bg-teal-500/10',
              },
              {
                label: 'Expirando em 15d',
                value: trialStats.expiringSoon.toString(),
                icon: AlertTriangle,
                color: trialStats.expiringSoon > 0 ? 'text-warning' : 'text-muted-foreground',
                bgColor: 'bg-warning/10',
              },
              {
                label: 'Trials Expirados',
                value: trialStats.expired.toString(),
                icon: TimerOff,
                color: trialStats.expired > 0 ? 'text-destructive' : 'text-muted-foreground',
                bgColor: 'bg-destructive/10',
              },
            ].map((kpi, index) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.08 }}
                className="bg-card rounded-2xl p-4 shadow-soft"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', kpi.bgColor)}>
                  <kpi.icon className={cn('w-5 h-5', kpi.color)} />
                </div>
                <p className={cn('text-xl font-bold', kpi.color)}>
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie chart - Plan distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Distribuicao por Plano
            </h2>
            {planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={true}
                  >
                    {planDistribution.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados disponiveis
              </div>
            )}
          </motion.div>

          {/* Area chart - Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Crescimento de Assinaturas (6 meses)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="assinantes"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  name="Assinantes Ativos"
                  dot={{ fill: '#06b6d4', r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Chart row 2 - Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Distribuicao por Periodo
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={periodDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
                name="Assinaturas"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
