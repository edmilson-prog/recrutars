/**
 * AdminTests — Admin tests overview page with 4 tabs:
 *   1. Visão Geral (KPIs, charts, funnel)
 *   2. Resultados (search + table + detail sheet)
 *   3. Convites (invitations table)
 *   4. Testes Corporativos (company tests table)
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Brain,
  Play,
  TrendingUp,
  Timer,
  Eye,
  Search,
  FileText,
  Users,
  Mail,
  Building2,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAllGaugeProResults } from '@/hooks/useGaugeProQuery';
import { DIMENSION_SHORT_NAMES, type GaugeProDimension } from '@/types/gaugePro';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TestInvitationRow {
  id: string;
  test_id: string;
  candidate_name: string | null;
  candidate_email: string | null;
  method: string | null;
  status: string;
  token: string;
  sent_at: string | null;
  viewed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  company_tests: {
    name: string;
    companies: {
      name: string;
    } | null;
  } | null;
}

interface CompanyTestRow {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  companies: {
    name: string;
  } | null;
  invitation_count: number;
  completed_count: number;
}

interface GaugeProResultRow {
  id: string;
  assessment_id: string;
  candidate_id: string | null;
  team_member_id: string | null;
  archetype_id: string | null;
  final_scores: Record<string, number> | null;
  primary_dimension: string | null;
  secondary_dimension: string | null;
  strengths: string[] | null;
  development_areas: string[] | null;
  career_recommendations: string[] | null;
  generated_at: string;
  part1_scores: Record<string, number> | null;
  part2_scores: Record<string, number> | null;
  classifications: Record<string, string> | null;
  badge_awarded: string | null;
  xp_awarded: number | null;
  gauge_pro_archetypes: {
    name: string;
  } | null;
  candidates: {
    name: string;
    email: string;
  } | null;
  team_members: {
    name: string;
    email: string | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INVITATION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  viewed: { label: 'Visualizado', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
  started: { label: 'Iniciado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  completed: { label: 'Concluido', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  expired: { label: 'Expirado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  abandoned: { label: 'Abandonado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
};

const COMPANY_TEST_STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  active: { label: 'Ativo', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  closed: { label: 'Encerrado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  archived: { label: 'Arquivado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const DIMENSION_COLORS: Record<string, string> = {
  D1: '#1e3a8a',
  D2: '#06b6d4',
  D3: '#8b5cf6',
  D4: '#f59e0b',
  D5: '#10b981',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

function useGaugeProTotalCount() {
  return useQuery({
    queryKey: ['admin', 'tests', 'gauge-pro-total'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('gauge_pro_results')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function useGaugeProThisMonthCount() {
  return useQuery({
    queryKey: ['admin', 'tests', 'gauge-pro-this-month'],
    queryFn: async () => {
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();
      const { count, error } = await supabase
        .from('gauge_pro_results')
        .select('*', { count: 'exact', head: true })
        .gte('generated_at', startOfMonth);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function useGaugeProInProgress() {
  return useQuery({
    queryKey: ['admin', 'tests', 'gauge-pro-in-progress'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('gauge_pro_assessments')
        .select('*', { count: 'exact', head: true })
        .is('completed_at', null);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function useGaugeProAvgTime() {
  return useQuery({
    queryKey: ['admin', 'tests', 'gauge-pro-avg-time'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gauge_pro_assessments')
        .select('started_at, completed_at')
        .not('started_at', 'is', null)
        .not('completed_at', 'is', null);
      if (error) throw error;
      if (!data || data.length === 0) return 0;
      const totalMs = data.reduce((sum, row) => {
        const start = new Date(row.started_at!).getTime();
        const end = new Date(row.completed_at!).getTime();
        return sum + (end - start);
      }, 0);
      return Math.round(totalMs / data.length / 1000 / 60); // in minutes
    },
  });
}

function useInvitationCounts() {
  return useQuery({
    queryKey: ['admin', 'tests', 'invitation-counts'],
    queryFn: async () => {
      const statuses = ['sent', 'viewed', 'started', 'completed', 'expired', 'abandoned'];
      const counts: Record<string, number> = {};
      for (const status of statuses) {
        const { count, error } = await supabase
          .from('test_invitations')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);
        if (error) throw error;
        counts[status] = count ?? 0;
      }
      return counts;
    },
  });
}

function useGaugeProResultsDetailed() {
  return useQuery({
    queryKey: ['admin', 'tests', 'gauge-pro-results-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gauge_pro_results')
        .select('*, gauge_pro_archetypes(name), candidates(name, email), team_members(name, email)')
        .order('generated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as GaugeProResultRow[];
    },
  });
}

function useTestInvitations() {
  return useQuery({
    queryKey: ['admin', 'tests', 'test-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_invitations')
        .select('*, company_tests(name, companies(name))')
        .order('sent_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as TestInvitationRow[];
    },
  });
}

function useCompanyTests() {
  return useQuery({
    queryKey: ['admin', 'tests', 'company-tests'],
    queryFn: async () => {
      // First fetch company tests with company names
      const { data: tests, error: testsError } = await supabase
        .from('company_tests')
        .select('*, companies(name)')
        .order('created_at', { ascending: false });
      if (testsError) throw testsError;

      // For each test, count invitations and completed invitations
      const results: CompanyTestRow[] = [];
      for (const test of tests ?? []) {
        const { count: totalCount } = await supabase
          .from('test_invitations')
          .select('*', { count: 'exact', head: true })
          .eq('test_id', test.id);

        const { count: completedCount } = await supabase
          .from('test_invitations')
          .select('*', { count: 'exact', head: true })
          .eq('test_id', test.id)
          .eq('status', 'completed');

        results.push({
          ...test,
          invitation_count: totalCount ?? 0,
          completed_count: completedCount ?? 0,
        } as unknown as CompanyTestRow);
      }

      return results;
    },
  });
}

function useGaugeProDaily() {
  return useQuery({
    queryKey: ['admin', 'tests', 'gauge-pro-daily'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('gauge_pro_results')
        .select('generated_at')
        .gte('generated_at', thirtyDaysAgo.toISOString())
        .order('generated_at', { ascending: true });
      if (error) throw error;

      // Group by date
      const countByDate: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        countByDate[key] = 0;
      }

      for (const row of data ?? []) {
        const key = new Date(row.generated_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });
        if (key in countByDate) {
          countByDate[key]++;
        }
      }

      return Object.entries(countByDate).map(([date, count]) => ({ date, count }));
    },
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
  index,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-2xl p-6 shadow-soft"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
          {subtitle && (
            <div className="text-xs text-secondary font-medium mt-1">{subtitle}</div>
          )}
        </>
      )}
    </motion.div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1: Visão Geral
// ---------------------------------------------------------------------------

function OverviewTab() {
  const { data: totalCount, isLoading: totalLoading } = useGaugeProTotalCount();
  const { data: thisMonthCount, isLoading: monthLoading } = useGaugeProThisMonthCount();
  const { data: inProgressCount, isLoading: progressLoading } = useGaugeProInProgress();
  const { data: avgTime, isLoading: avgLoading } = useGaugeProAvgTime();
  const { data: invitationCounts, isLoading: invLoading } = useInvitationCounts();
  const { data: dailyData, isLoading: dailyLoading } = useGaugeProDaily();
  const { data: allResults, isLoading: resultsLoading } = useAllGaugeProResults();

  const completionRate = useMemo(() => {
    if (!invitationCounts) return 0;
    const total =
      (invitationCounts.sent ?? 0) +
      (invitationCounts.viewed ?? 0) +
      (invitationCounts.started ?? 0) +
      (invitationCounts.completed ?? 0) +
      (invitationCounts.expired ?? 0) +
      (invitationCounts.abandoned ?? 0);
    if (total === 0) return 0;
    return Math.round(((invitationCounts.completed ?? 0) / total) * 100);
  }, [invitationCounts]);

  // Archetype distribution from all results
  const archetypeDistribution = useMemo(() => {
    if (!allResults || allResults.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const r of allResults) {
      const name = r.gauge_pro_archetypes?.name ?? 'Desconhecido';
      counts[name] = (counts[name] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [allResults]);

  const funnelData = useMemo(() => {
    if (!invitationCounts) return { invited: 0, started: 0, completed: 0 };
    const invited =
      (invitationCounts.sent ?? 0) +
      (invitationCounts.viewed ?? 0) +
      (invitationCounts.started ?? 0) +
      (invitationCounts.completed ?? 0) +
      (invitationCounts.expired ?? 0) +
      (invitationCounts.abandoned ?? 0);
    const started = (invitationCounts.started ?? 0) + (invitationCounts.completed ?? 0);
    const completed = invitationCounts.completed ?? 0;
    return { invited, started, completed };
  }, [invitationCounts]);

  const barColors = ['#1e3a8a', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#f97316', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Testes Concluídos"
          value={totalCount ?? 0}
          subtitle={thisMonthCount ? `+${thisMonthCount} este mes` : undefined}
          icon={Brain}
          loading={totalLoading || monthLoading}
          index={0}
        />
        <KpiCard
          title="Em Andamento"
          value={inProgressCount ?? 0}
          icon={Play}
          loading={progressLoading}
          index={1}
        />
        <KpiCard
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          icon={TrendingUp}
          loading={invLoading}
          index={2}
        />
        <KpiCard
          title="Tempo Médio"
          value={`${avgTime ?? 0}min`}
          icon={Timer}
          loading={avgLoading}
          index={3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart — Tests over time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Testes ao Longo do Tempo
          </h3>
          {dailyLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : dailyData && dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  name="Concluídos"
                  dot={{ fill: '#06b6d4', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={FileText}
              title="Sem dados"
              description="Nenhum teste concluído nos últimos 30 dias."
            />
          )}
        </motion.div>

        {/* Bar Chart — Archetype distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Distribuição de Arquétipos
          </h3>
          {resultsLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : archetypeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={archetypeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  width={120}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="count" name="Quantidade" radius={[0, 4, 4, 0]}>
                  {archetypeDistribution.map((_entry, idx) => (
                    <Cell key={idx} fill={barColors[idx % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={Brain}
              title="Sem arquétipos"
              description="Nenhum resultado Gauge-Pro gerado ainda."
            />
          )}
        </motion.div>
      </div>

      {/* Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card rounded-2xl p-6 shadow-soft"
      >
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Funil de Conclusão
        </h3>
        {invLoading ? (
          <div className="flex gap-6 justify-center">
            <Skeleton className="h-24 w-40" />
            <Skeleton className="h-24 w-40" />
            <Skeleton className="h-24 w-40" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {[
              { label: 'Convidados', value: funnelData.invited, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
              { label: 'Iniciados', value: funnelData.started, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' },
              { label: 'Concluídos', value: funnelData.completed, color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
            ].map((step, idx) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className={cn('text-center p-6 rounded-2xl min-w-[140px]', step.color)}>
                  <div className="text-3xl font-bold">{step.value}</div>
                  <div className="text-sm font-medium mt-1">{step.label}</div>
                </div>
                {idx < 2 && (
                  <ArrowRight className="w-6 h-6 text-muted-foreground hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2: Resultados
// ---------------------------------------------------------------------------

function ResultsTab() {
  const { data: results, isLoading, isError } = useGaugeProResultsDetailed();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'gauge-pro' | 'legacy'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [selectedResult, setSelectedResult] = useState<GaugeProResultRow | null>(null);

  const filtered = useMemo(() => {
    if (!results) return [];
    let list = [...results];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.candidates?.name ?? r.team_members?.name ?? '').toLowerCase().includes(q) ||
          (r.candidates?.email ?? r.team_members?.email ?? '').toLowerCase().includes(q) ||
          (r.gauge_pro_archetypes?.name ?? '').toLowerCase().includes(q)
      );
    }

    // Type filter — all results from gauge_pro_results are Gauge-Pro
    if (typeFilter === 'legacy') {
      list = [];
    }

    // Period filter
    if (periodFilter !== 'all') {
      const days = periodFilter === '7d' ? 7 : periodFilter === '30d' ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      list = list.filter((r) => new Date(r.generated_at) >= cutoff);
    }

    return list;
  }, [results, search, typeFilter, periodFilter]);

  const dimensions: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

  return (
    <div className="space-y-6">
      {/* Search + filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-soft"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por candidato, e-mail ou arquétipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'gauge-pro'] as const).map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(t)}
              >
                {t === 'all' ? 'Todos' : 'Gauge-Pro'}
              </Button>
            ))}
            <div className="w-px bg-border mx-1" />
            {(['all', '7d', '30d', '90d'] as const).map((p) => (
              <Button
                key={p}
                variant={periodFilter === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriodFilter(p)}
              >
                {p === 'all' ? 'Tudo' : p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-6 shadow-soft"
      >
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : isError ? (
          <EmptyState
            icon={Brain}
            title="Erro ao carregar resultados"
            description="Não foi possível buscar os resultados de testes. Tente novamente mais tarde."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="Nenhum resultado encontrado"
            description="Não há resultados de testes que correspondam aos filtros selecionados."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Arquétipo</TableHead>
                <TableHead>Dimensão Principal</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">
                        {row.candidates?.name ?? row.team_members?.name ?? 'Sem nome'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.candidates?.email ?? row.team_members?.email ?? '—'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-0">
                      Gauge-Pro
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {row.gauge_pro_archetypes?.name ?? '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.primary_dimension
                      ? DIMENSION_SHORT_NAMES[row.primary_dimension as GaugeProDimension] ??
                        row.primary_dimension
                      : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(row.generated_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedResult(row)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          {selectedResult && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {selectedResult.candidates?.name ?? selectedResult.team_members?.name ?? 'Sem nome'}
                </SheetTitle>
                <SheetDescription>
                  {selectedResult.candidates?.email ?? selectedResult.team_members?.email ?? '—'}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Archetype */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Arquétipo</h4>
                  <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-0 text-sm px-3 py-1">
                    {selectedResult.gauge_pro_archetypes?.name ?? 'Desconhecido'}
                  </Badge>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Dimensão Principal
                    </h4>
                    <span className="font-semibold text-foreground">
                      {selectedResult.primary_dimension
                        ? DIMENSION_SHORT_NAMES[selectedResult.primary_dimension as GaugeProDimension] ??
                          selectedResult.primary_dimension
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Dimensão Secundária
                    </h4>
                    <span className="font-semibold text-foreground">
                      {selectedResult.secondary_dimension
                        ? DIMENSION_SHORT_NAMES[selectedResult.secondary_dimension as GaugeProDimension] ??
                          selectedResult.secondary_dimension
                        : '-'}
                    </span>
                  </div>
                </div>

                {/* Final scores */}
                {selectedResult.final_scores && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Scores Finais
                    </h4>
                    <div className="space-y-3">
                      {dimensions.map((dim) => {
                        const score = selectedResult.final_scores?.[dim] ?? 0;
                        // Normalize to 0-100 range (scores typically -10 to +10)
                        const normalized = Math.min(100, Math.max(0, ((score + 10) / 20) * 100));
                        return (
                          <div key={dim}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-foreground font-medium">
                                {DIMENSION_SHORT_NAMES[dim]}
                              </span>
                              <span className="text-muted-foreground">
                                {score.toFixed(1)}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${normalized}%`,
                                  backgroundColor: DIMENSION_COLORS[dim],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {selectedResult.strengths && selectedResult.strengths.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Pontos Fortes
                    </h4>
                    <ul className="space-y-1">
                      {selectedResult.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">+</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Development areas */}
                {selectedResult.development_areas &&
                  selectedResult.development_areas.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Areas de Desenvolvimento
                      </h4>
                      <ul className="space-y-1">
                        {selectedResult.development_areas.map((d, i) => (
                          <li
                            key={i}
                            className="text-sm text-foreground flex items-start gap-2"
                          >
                            <span className="text-amber-500 mt-0.5">-</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Career recommendations */}
                {selectedResult.career_recommendations &&
                  selectedResult.career_recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Recomendacoes de Carreira
                      </h4>
                      <ul className="space-y-1">
                        {selectedResult.career_recommendations.map((c, i) => (
                          <li
                            key={i}
                            className="text-sm text-foreground flex items-start gap-2"
                          >
                            <span className="text-cyan-500 mt-0.5">&bull;</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Meta */}
                <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
                  <div>Gerado em: {formatDateTime(selectedResult.generated_at)}</div>
                  {selectedResult.badge_awarded && (
                    <div>Badge: {selectedResult.badge_awarded}</div>
                  )}
                  {selectedResult.xp_awarded != null && (
                    <div>XP: {selectedResult.xp_awarded}</div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3: Convites
// ---------------------------------------------------------------------------

function InvitationsTab() {
  const { data: invitations, isLoading } = useTestInvitations();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!invitations) return [];
    if (!search.trim()) return invitations;
    const q = search.toLowerCase();
    return invitations.filter(
      (inv) =>
        (inv.candidate_name ?? '').toLowerCase().includes(q) ||
        (inv.candidate_email ?? '').toLowerCase().includes(q) ||
        (inv.company_tests?.name ?? '').toLowerCase().includes(q) ||
        (inv.company_tests?.companies?.name ?? '').toLowerCase().includes(q)
    );
  }, [invitations, search]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-soft"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por candidato, empresa ou teste..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-6 shadow-soft"
      >
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="Nenhum convite encontrado"
            description="Não há convites de teste que correspondam à busca."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Teste</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enviado em</TableHead>
                <TableHead>Concluido em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => {
                const statusInfo = INVITATION_STATUS_MAP[inv.status] ?? {
                  label: inv.status,
                  color: 'bg-gray-100 text-gray-800',
                };
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {inv.candidate_name ?? '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {inv.candidate_email ?? '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {inv.company_tests?.companies?.name ?? '-'}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {inv.company_tests?.name ?? '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {inv.method ?? '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          statusInfo.color
                        )}
                      >
                        {statusInfo.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(inv.sent_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(inv.completed_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 4: Testes Corporativos
// ---------------------------------------------------------------------------

function CorporateTestsTab() {
  const { data: companyTests, isLoading } = useCompanyTests();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!companyTests) return [];
    if (!search.trim()) return companyTests;
    const q = search.toLowerCase();
    return companyTests.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.companies?.name ?? '').toLowerCase().includes(q)
    );
  }, [companyTests, search]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-soft"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do teste ou empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-6 shadow-soft"
      >
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum teste corporativo encontrado"
            description="Não há testes corporativos cadastrados ou que correspondam à busca."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Teste</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Convites</TableHead>
                <TableHead className="text-right">Concluídos</TableHead>
                <TableHead className="text-right">Taxa %</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((test) => {
                const statusInfo = COMPANY_TEST_STATUS_MAP[test.status] ?? {
                  label: test.status,
                  color: 'bg-gray-100 text-gray-800',
                };
                const rate =
                  test.invitation_count > 0
                    ? Math.round((test.completed_count / test.invitation_count) * 100)
                    : 0;
                return (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{test.name}</div>
                      {test.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {test.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {test.companies?.name ?? '-'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          statusInfo.color
                        )}
                      >
                        {statusInfo.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {test.invitation_count}
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {test.completed_count}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'font-semibold',
                          rate >= 70
                            ? 'text-green-600 dark:text-green-400'
                            : rate >= 40
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-muted-foreground'
                        )}
                      >
                        {rate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(test.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminTests() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <PageHeader
          title="Testes Comportamentais"
          description="Visao geral de todos os testes Gauge-Pro, resultados, convites e testes corporativos da plataforma."
          howItWorks={[
            'A aba "Visão Geral" mostra KPIs, gráficos de evolução e funil de conclusão',
            'Em "Resultados" você pode buscar e filtrar todos os resultados de testes',
            'A aba "Convites" lista todos os convites enviados com status de acompanhamento',
            '"Testes Corporativos" exibe os testes criados pelas empresas e suas taxas de conclusão',
          ]}
        />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="invitations">Convites</TabsTrigger>
            <TabsTrigger value="corporate">Testes Corporativos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="results">
            <ResultsTab />
          </TabsContent>

          <TabsContent value="invitations">
            <InvitationsTab />
          </TabsContent>

          <TabsContent value="corporate">
            <CorporateTestsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
