/**
 * ReportsFinancial page
 * PRD-059: Relatorios "Radar" - Financial Dashboard
 *
 * KPIs: MRR, ARR, Receita Total, Ticket Medio, Churn, LTV, Conversao Free->Paid
 * Charts: MRR Evolution, Receita por Plano, Distribuicao Assinantes,
 *         Churn vs Novas Assinaturas, Receita por Periodo
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Ticket,
  UserMinus,
  Users,
  ArrowRightLeft,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/admin/reports/KPICard';
import { TimeFilter } from '@/components/admin/reports/TimeFilter';
import { useReportsData } from '@/hooks/useReportsData';
import { formatBRL } from '@/lib/formatters';

// Plan colors for charts
const PLAN_COLORS = ['#1e3a8a', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];
const PIE_COLORS = ['#1e3a8a', '#3b82f6', '#06b6d4', '#10b981'];
const PERIOD_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Simulated plan distribution data
const PLAN_DISTRIBUTION = [
  { name: 'Essencial', value: 45, color: '#1e3a8a' },
  { name: 'Profissional', value: 30, color: '#3b82f6' },
  { name: 'Premium', value: 18, color: '#06b6d4' },
  { name: 'Enterprise', value: 7, color: '#10b981' },
];

const PERIOD_DISTRIBUTION = [
  { name: 'Mensal', value: 55 },
  { name: 'Trimestral', value: 22 },
  { name: 'Semestral', value: 13 },
  { name: 'Anual', value: 10 },
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
};

export default function ReportsFinancial() {
  const {
    timeFilter,
    setTimeFilter,
    financialKPIs,
    previousMetrics,
    monthlyData,
    filteredMetrics,
  } = useReportsData();

  // Previous period financial KPIs for comparison
  const prevFinancialKPIs = useMemo(() => {
    if (previousMetrics.length === 0) return null;
    const totalRevenue = previousMetrics.reduce((s, m) => s + m.revenue, 0);
    const totalSubscriptions = previousMetrics.reduce((s, m) => s + m.newSubscriptions, 0);
    const ticketMedio = totalSubscriptions > 0 ? totalRevenue / totalSubscriptions : 0;
    const lastMRR = previousMetrics[previousMetrics.length - 1]?.mrr ?? 0;
    return {
      mrr: lastMRR,
      arr: lastMRR * 12,
      totalRevenue: Math.round(totalRevenue),
      ticketMedio: Math.round(ticketMedio),
      churnRate: 3.2, // simulated previous churn
      ltv: Math.round(ticketMedio > 0 ? ticketMedio / 0.032 : lastMRR * 24),
      conversionRate: 27.5,
    };
  }, [previousMetrics]);

  // MRR Evolution chart data
  const mrrChartData = useMemo(() => {
    return monthlyData.map((m) => ({
      month: `${MONTH_NAMES[parseInt(m.month, 10) - 1]} ${m.year}`,
      mrr: m.mrr,
    }));
  }, [monthlyData]);

  // Receita por Plano (stacked bar) - simulated distribution
  const revenueByPlanData = useMemo(() => {
    return monthlyData.map((m) => ({
      month: `${MONTH_NAMES[parseInt(m.month, 10) - 1]}`,
      Essencial: Math.round(m.revenue * 0.2),
      Profissional: Math.round(m.revenue * 0.35),
      Premium: Math.round(m.revenue * 0.3),
      Enterprise: Math.round(m.revenue * 0.15),
    }));
  }, [monthlyData]);

  // Churn vs Novas Assinaturas
  const churnVsNewData = useMemo(() => {
    return monthlyData.map((m) => ({
      month: `${MONTH_NAMES[parseInt(m.month, 10) - 1]}`,
      novasAssinaturas: filteredMetrics
        .filter((d) => d.metricDate.startsWith(`${m.year}-${m.month}`))
        .reduce((s, d) => s + d.newSubscriptions, 0),
      cancelamentos: filteredMetrics
        .filter((d) => d.metricDate.startsWith(`${m.year}-${m.month}`))
        .reduce((s, d) => s + d.cancellations, 0),
    }));
  }, [monthlyData, filteredMetrics]);

  return (
    <DashboardLayout userType="admin">
      <AdminTabNav />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatorio Financeiro</h1>
            <p className="text-muted-foreground">KPIs de receita, assinaturas e conversao</p>
          </div>
          <TimeFilter value={timeFilter} onChange={setTimeFilter} />
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <KPICard
            title="MRR"
            value={financialKPIs.mrr}
            previousValue={prevFinancialKPIs?.mrr}
            format="currency"
            icon={DollarSign}
            index={0}
          />
          <KPICard
            title="ARR"
            value={financialKPIs.arr}
            previousValue={prevFinancialKPIs?.arr}
            format="currency"
            icon={TrendingUp}
            index={1}
          />
          <KPICard
            title="Receita Total"
            value={financialKPIs.totalRevenue}
            previousValue={prevFinancialKPIs?.totalRevenue}
            format="currency"
            icon={Receipt}
            index={2}
          />
          <KPICard
            title="Ticket Medio"
            value={financialKPIs.ticketMedio}
            previousValue={prevFinancialKPIs?.ticketMedio}
            format="currency"
            icon={Ticket}
            index={3}
          />
          <KPICard
            title="Taxa de Churn"
            value={financialKPIs.churnRate}
            previousValue={prevFinancialKPIs?.churnRate}
            format="percent"
            icon={UserMinus}
            invertColors
            index={4}
          />
          <KPICard
            title="LTV"
            value={financialKPIs.ltv}
            previousValue={prevFinancialKPIs?.ltv}
            format="currency"
            icon={Users}
            index={5}
          />
          <KPICard
            title="Conversao Free-Paid"
            value={financialKPIs.conversionRate}
            previousValue={prevFinancialKPIs?.conversionRate}
            format="percent"
            icon={ArrowRightLeft}
            index={6}
          />
        </div>

        {/* Charts Row 1: MRR Evolution + Receita por Plano */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* MRR Evolution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evolucao do MRR</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mrrChartData}>
                    <defs>
                      <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      fontSize={11}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [formatBRL(value), 'MRR']}
                    />
                    <Area
                      type="monotone"
                      dataKey="mrr"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#mrrGradient)"
                      name="MRR"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Receita por Plano */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receita por Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByPlanData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      fontSize={11}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [formatBRL(value)]}
                    />
                    <Legend />
                    <Bar dataKey="Essencial" stackId="plan" fill={PLAN_COLORS[0]} />
                    <Bar dataKey="Profissional" stackId="plan" fill={PLAN_COLORS[1]} />
                    <Bar dataKey="Premium" stackId="plan" fill={PLAN_COLORS[2]} />
                    <Bar dataKey="Enterprise" stackId="plan" fill={PLAN_COLORS[3]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2: Distribuicao + Churn vs Novas + Receita por Periodo */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Distribuicao de Assinantes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuicao de Assinantes</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={PLAN_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {PLAN_DISTRIBUTION.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Churn vs Novas Assinaturas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Churn vs Novas Assinaturas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={churnVsNewData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="novasAssinaturas" name="Novas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cancelamentos" name="Cancelamentos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Receita por Periodo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receita por Periodo</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={PERIOD_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {PERIOD_DISTRIBUTION.map((_, idx) => (
                        <Cell key={idx} fill={PERIOD_COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
