/**
 * ReportsOperational page
 * PRD-059: Relatorios "Radar" - Operational Dashboard
 *
 * KPIs: Candidaturas, Contratacoes, Entrevistas, Testes, Conversao
 * Charts: Funil de Recrutamento, Contratacoes Mensais, Top 10 Empresas, Histograma Tempo
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Handshake,
  Calendar,
  Brain,
  TrendingUp,
} from 'lucide-react';
import {
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
import { useReportsData } from '@/hooks/useReportsData';
import { buildFunnel } from '@/lib/analytics';
import { formatNumber } from '@/lib/formatters';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
};

// Simulated top companies
const TOP_COMPANIES = [
  { name: 'TechCorp RS', contratacoes: 28 },
  { name: 'Inovacao Digital', contratacoes: 22 },
  { name: 'AgileSoft POA', contratacoes: 18 },
  { name: 'DataBrasil', contratacoes: 15 },
  { name: 'CloudTech Sul', contratacoes: 14 },
  { name: 'StartupRS', contratacoes: 12 },
  { name: 'ConsultBR', contratacoes: 10 },
  { name: 'FinanceiroRS', contratacoes: 9 },
  { name: 'LogiTech Brasil', contratacoes: 7 },
  { name: 'GreenTech RS', contratacoes: 5 },
];

// Simulated time-to-fill histogram
const TIME_TO_FILL_DATA = [
  { range: '0-7d', vagas: 8 },
  { range: '8-14d', vagas: 15 },
  { range: '15-21d', vagas: 22 },
  { range: '22-30d', vagas: 18 },
  { range: '31-45d', vagas: 12 },
  { range: '46-60d', vagas: 7 },
  { range: '60d+', vagas: 4 },
];

export default function ReportsOperational() {
  const {
    timeFilter,
    setTimeFilter,
    operationalKPIs,
    filteredMetrics,
    previousMetrics,
    monthlyData,
  } = useReportsData();

  // Previous period operational KPIs for comparison
  const prevOperationalKPIs = useMemo(() => {
    if (previousMetrics.length === 0) return null;
    const totalApplications = previousMetrics.reduce((s, m) => s + m.applications, 0);
    const totalHires = previousMetrics.reduce((s, m) => s + m.hires, 0);
    const totalInterviews = previousMetrics.reduce((s, m) => s + m.interviewsDone, 0);
    const testsCompleted = previousMetrics.reduce((s, m) => s + m.testsCompleted, 0);
    const conversionRate = totalApplications > 0
      ? Math.round((totalHires / totalApplications) * 10000) / 100
      : 0;
    return {
      totalApplications,
      totalHires,
      totalInterviews,
      testsCompleted,
      conversionRate,
    };
  }, [previousMetrics]);

  // Recruitment funnel
  const recruitmentFunnel = useMemo(() => {
    const totalApps = operationalKPIs.totalApplications;
    const stages = [
      { name: 'Candidaturas', value: totalApps },
      { name: 'Triagem', value: Math.round(totalApps * 0.6) },
      { name: 'Entrevista', value: operationalKPIs.totalInterviews },
      { name: 'Contratacao', value: operationalKPIs.totalHires },
    ];
    return buildFunnel(stages);
  }, [operationalKPIs]);

  // Monthly hires chart data
  const monthlyHiresData = useMemo(() => {
    return monthlyData.map((m) => ({
      month: `${MONTH_NAMES[parseInt(m.month, 10) - 1]}`,
      contratacoes: m.hires,
    }));
  }, [monthlyData]);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatório Operacional</h1>
            <p className="text-muted-foreground">Métricas de recrutamento, contratações e eficiência</p>
          </div>
          <TimeFilter value={timeFilter} onChange={setTimeFilter} />
        </div>

        <AdminTabNav />

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Candidaturas"
            value={operationalKPIs.totalApplications}
            previousValue={prevOperationalKPIs?.totalApplications}
            format="number"
            icon={FileText}
            index={0}
          />
          <KPICard
            title="Total Contratações"
            value={operationalKPIs.totalHires}
            previousValue={prevOperationalKPIs?.totalHires}
            format="number"
            icon={Handshake}
            index={1}
          />
          <KPICard
            title="Total Entrevistas"
            value={operationalKPIs.totalInterviews}
            previousValue={prevOperationalKPIs?.totalInterviews}
            format="number"
            icon={Calendar}
            index={2}
          />
          <KPICard
            title="Testes Completados"
            value={operationalKPIs.testsCompleted}
            previousValue={prevOperationalKPIs?.testsCompleted}
            format="number"
            icon={Brain}
            index={3}
          />
          <KPICard
            title="Taxa Conversão"
            value={operationalKPIs.conversionRate}
            previousValue={prevOperationalKPIs?.conversionRate}
            format="percent"
            icon={TrendingUp}
            index={4}
          />
        </div>

        {/* Charts Row 1: Recruitment Funnel + Monthly Hires */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Funil de Recrutamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Funil de Recrutamento</CardTitle>
              </CardHeader>
              <CardContent>
                <FunnelChart stages={recruitmentFunnel} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Contratacoes Mensais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contratações Mensais</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyHiresData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey="contratacoes"
                      name="Contratações"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2: Top Companies + Time-to-Fill Histogram */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top 10 Empresas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 10 Empresas por Contratações</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={TOP_COMPANIES} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis type="number" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      fontSize={11}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey="contratacoes"
                      name="Contratações"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Histograma Tempo de Preenchimento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tempo de Preenchimento de Vagas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={TIME_TO_FILL_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="range" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [formatNumber(value), 'Vagas']}
                    />
                    <Bar
                      dataKey="vagas"
                      name="Vagas Preenchidas"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
