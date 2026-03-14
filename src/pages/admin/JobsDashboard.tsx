/**
 * JobsDashboard Page
 * PRD-058: Dashboard de vagas com KPIs, gráficos e alertas
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  CalendarPlus,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function JobsDashboard() {
  const { jobs, stats, hires, alerts } = useAdminJobs();

  // KPI: conversion rate (N/D while hires data is pending real implementation)
  const conversionRate = useMemo(() => {
    if (hires.length === 0 || stats.totalApplications === 0) return 'N/D';
    const rate = (hires.length / stats.totalApplications) * 100;
    return `${rate.toFixed(1)}%`;
  }, [stats.totalApplications, hires.length]);

  // KPI: avg time to fill (N/D while hires data is pending real implementation)
  const avgTimeToFill = useMemo(() => {
    if (hires.length === 0) return 'N/D';
    const avg = hires.reduce((s, h) => s + h.timeToFillDays, 0) / hires.length;
    return `${Math.round(avg)} dias`;
  }, [hires]);

  // KPI cards
  const kpis = [
    { label: 'Vagas Ativas', value: stats.totalActive.toString(), icon: Briefcase, color: 'text-cyan-600', bgColor: 'bg-cyan-500/10' },
    { label: 'Publicadas no Mês', value: stats.publishedThisMonth.toString(), icon: CalendarPlus, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
    { label: 'Fila Moderação', value: stats.pendingModeration.toString(), icon: Clock, color: stats.pendingModeration > 0 ? 'text-yellow-600' : 'text-muted-foreground', bgColor: 'bg-yellow-500/10' },
    { label: 'Finalizadas', value: stats.finalized.toString(), icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
    { label: 'Expiradas', value: stats.expired.toString(), icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { label: 'Total Candidaturas', value: stats.totalApplications.toString(), icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
    { label: 'Taxa Conversão', value: conversionRate, icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
    { label: 'Tempo Médio Preenchimento', value: avgTimeToFill, icon: Timer, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  ];

  // Chart: status distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      const label =
        j.status === 'active' ? 'Ativas' :
        j.status === 'pending' ? 'Em Moderação' :
        j.status === 'rejected' ? 'Rejeitadas' :
        j.status === 'finalized' ? 'Finalizadas' :
        j.status === 'correction' ? 'Correção' : 'Outros';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  // Chart: monthly publications (last 6 months) — computed from real job data
  const monthlyPublications = useMemo(() => {
    const now = new Date();
    const result: { month: string; vagas: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      const count = jobs.filter((j) => {
        const pub = new Date(j.publishedAt || j.createdAt);
        return pub.getMonth() === d.getMonth() && pub.getFullYear() === d.getFullYear();
      }).length;
      result.push({ month: label.charAt(0).toUpperCase() + label.slice(1), vagas: count });
    }
    return result;
  }, [jobs]);

  // Chart: top 10 companies by jobs
  const topCompanies = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      counts[j.companyName] = (counts[j.companyName] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, vagas]) => ({ name, vagas }));
  }, [jobs]);

  // Chart: applications trend (last 6 months) — computed from real job data
  const applicationsTrend = useMemo(() => {
    const now = new Date();
    const result: { month: string; candidaturas: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      const total = jobs
        .filter((j) => {
          const pub = new Date(j.publishedAt || j.createdAt);
          return pub.getMonth() === d.getMonth() && pub.getFullYear() === d.getFullYear();
        })
        .reduce((sum, j) => sum + j.applicationsCount, 0);
      result.push({ month: label.charAt(0).toUpperCase() + label.slice(1), candidaturas: total });
    }
    return result;
  }, [jobs]);

  // Chart: recruitment funnel — only stages with real data
  const funnelData = useMemo(() => {
    return [
      { value: stats.totalApplications, name: 'Candidaturas', fill: '#3b82f6' },
      { value: hires.length, name: 'Contratações', fill: '#10b981' },
    ];
  }, [stats.totalApplications, hires.length]);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <PageHeader
          title="Dashboard de Vagas"
          description="Visão geral de vagas, moderação e métricas de recrutamento da plataforma."
          howItWorks={[
            'Métricas de vagas: publicadas, em andamento e finalizadas',
            'Gráficos mostram taxa de conversão e tempo médio de preenchimento',
            'Acompanhe tendências de publicação e candidatura',
          ]}
        />

        <AdminTabNav />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', kpi.bgColor)}>
                <kpi.icon className={cn('w-5 h-5', kpi.color)} />
              </div>
              <p className={cn('text-xl font-bold', kpi.color)}>{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie chart: status distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Distribuição por Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine
                >
                  {statusDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
          </motion.div>

          {/* Bar chart: monthly publications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Vagas Publicadas por Mês
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPublications}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar dataKey="vagas" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Vagas" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bar chart: top 10 companies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Top 10 Empresas por Vagas
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCompanies} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="vagas" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Vagas" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Area chart: applications trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Tendência de Candidaturas
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={applicationsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                  dataKey="candidaturas"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  name="Candidaturas"
                  dot={{ fill: '#06b6d4', r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Funnel chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Funil de Recrutamento
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="center" fill="#fff" fontSize={13} fontWeight={600} dataKey="name" />
                <LabelList position="right" fill="hsl(var(--foreground))" fontSize={14} fontWeight={700} dataKey="value" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Alertas ({alerts.length})
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border',
                    alert.severity === 'critical'
                      ? 'border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/5'
                      : 'border-yellow-300 bg-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-500/5'
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      'w-4 h-4 mt-0.5 flex-shrink-0',
                      alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{alert.jobTitle}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px]',
                          alert.severity === 'critical'
                            ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                        )}
                      >
                        {alert.severity === 'critical' ? 'Crítico' : 'Atenção'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alert.companyName} - {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
