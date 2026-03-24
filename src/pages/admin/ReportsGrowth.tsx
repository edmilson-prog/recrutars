/**
 * ReportsGrowth page
 * PRD-059: Relatorios "Radar" - Growth Dashboard
 *
 * KPIs: Total Candidatos/Empresas, Novos (periodo), Growth %
 * Charts: Curva Cumulativa, Cadastros Semanais, Funil de Ativacao, Cohort Retention
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  UserPlus,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
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
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/admin/reports/KPICard';
import { TimeFilter } from '@/components/admin/reports/TimeFilter';
import { FunnelChart } from '@/components/admin/reports/FunnelChart';
import { CohortTable } from '@/components/admin/reports/CohortTable';
import { useReportsData } from '@/hooks/useReportsData';
import { buildFunnel } from '@/lib/analytics';
import { formatNumber } from '@/lib/formatters';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
};

export default function ReportsGrowth() {
  const {
    timeFilter,
    setTimeFilter,
    growthKPIs,
    filteredMetrics,
    previousMetrics,
    weeklyData,
    cohortData,
  } = useReportsData();

  // Previous period growth KPIs for comparison
  const prevGrowthKPIs = useMemo(() => {
    if (previousMetrics.length === 0) return null;
    const totalCandidates = previousMetrics.length > 0
      ? previousMetrics[previousMetrics.length - 1].totalCandidates
      : 0;
    const totalCompanies = previousMetrics.length > 0
      ? previousMetrics[previousMetrics.length - 1].totalCompanies
      : 0;
    const newCandidates = previousMetrics.reduce((s, m) => s + m.newCandidates, 0);
    const newCompanies = previousMetrics.reduce((s, m) => s + m.newCompanies, 0);
    return {
      totalCandidates,
      totalCompanies,
      newCandidates,
      newCompanies,
    };
  }, [previousMetrics]);

  // Cumulative chart data
  const cumulativeData = useMemo(() => {
    return filteredMetrics.map((m) => ({
      date: m.metricDate.slice(5), // MM-DD
      candidatos: m.totalCandidates,
      empresas: m.totalCompanies,
    }));
  }, [filteredMetrics]);

  // Weekly signups chart data
  const weeklyChartData = useMemo(() => {
    return weeklyData.map((w) => ({
      semana: w.weekStart.slice(5), // MM-DD
      candidatos: w.newCandidates,
      empresas: w.newCompanies,
    }));
  }, [weeklyData]);

  // Activation funnel
  const activationFunnel = useMemo(() => {
    const totalCandidates = growthKPIs.totalCandidates;
    // Simulated funnel ratios
    const stages = [
      { name: 'Cadastro', value: totalCandidates },
      { name: 'Perfil Completo', value: Math.round(totalCandidates * 0.65) },
      { name: 'Primeira Candidatura', value: Math.round(totalCandidates * 0.42) },
      { name: 'Teste Realizado', value: Math.round(totalCandidates * 0.28) },
      { name: 'Contratação', value: Math.round(totalCandidates * 0.08) },
    ];
    return buildFunnel(stages);
  }, [growthKPIs.totalCandidates]);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatório de Crescimento</h1>
            <p className="text-muted-foreground">Métricas de usuários, cadastros e retenção</p>
          </div>
          <TimeFilter value={timeFilter} onChange={setTimeFilter} />
        </div>

        <AdminTabNav />

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="Total Candidatos"
            value={growthKPIs.totalCandidates}
            previousValue={prevGrowthKPIs?.totalCandidates}
            format="number"
            icon={Users}
            index={0}
          />
          <KPICard
            title="Total Empresas"
            value={growthKPIs.totalCompanies}
            previousValue={prevGrowthKPIs?.totalCompanies}
            format="number"
            icon={Building2}
            index={1}
          />
          <KPICard
            title="Novos Candidatos"
            value={growthKPIs.newCandidates}
            previousValue={prevGrowthKPIs?.newCandidates}
            format="number"
            icon={UserPlus}
            index={2}
          />
          <KPICard
            title="Novas Empresas"
            value={growthKPIs.newCompanies}
            previousValue={prevGrowthKPIs?.newCompanies}
            format="number"
            icon={Building2}
            index={3}
          />
          <KPICard
            title="Crescimento Candidatos"
            value={growthKPIs.candidateGrowth}
            format="percent"
            icon={TrendingUp}
            index={4}
          />
          <KPICard
            title="Crescimento Empresas"
            value={growthKPIs.companyGrowth}
            format="percent"
            icon={BarChart3}
            index={5}
          />
        </div>

        {/* Charts Row 1: Cumulative Curve + Weekly Signups */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Curva Cumulativa */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Curva Cumulativa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cumulativeData}>
                    <defs>
                      <linearGradient id="gradCandidatos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradEmpresas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="date" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number, name: string) => [formatNumber(value), name === 'candidatos' ? 'Candidatos' : 'Empresas']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="candidatos"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fill="url(#gradCandidatos)"
                      name="Candidatos"
                    />
                    <Area
                      type="monotone"
                      dataKey="empresas"
                      stroke="#1e3a8a"
                      strokeWidth={2}
                      fill="url(#gradEmpresas)"
                      name="Empresas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cadastros Semanais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cadastros Semanais</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="semana" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="candidatos" name="Candidatos" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="empresas" name="Empresas" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Row 2: Activation Funnel + Cohort Retention */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Funil de Ativacao */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Funil de Ativação</CardTitle>
              </CardHeader>
              <CardContent>
                <FunnelChart stages={activationFunnel} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Cohort Retention Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Retenção por Cohort</CardTitle>
              </CardHeader>
              <CardContent>
                <CohortTable data={cohortData} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
