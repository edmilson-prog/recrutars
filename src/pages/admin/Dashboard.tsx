import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, Brain, TrendingUp, ArrowUp, ArrowDown, ChevronRight, FileText, Target, AlertTriangle, Code2, GraduationCap, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { getOrGenerateIdealProfile } from '@/lib/behavioralProfiles';
import { useAllJobs } from '@/hooks/useJobsQuery';
import { useAllCandidates } from '@/hooks/useCandidatesQuery';
import { useCompanies } from '@/hooks/useCompaniesQuery';
import { useAllApplications } from '@/hooks/useApplicationsQuery';
import { useBehavioralTests } from '@/hooks/useBehavioralTestsQuery';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, type TooltipProps } from 'recharts';
import { Link } from 'react-router-dom';
import { calculateMatchBreakdown, calculateMatchStatistics } from '@/lib/matchCalculator';
import type { MatchResult } from '@/types/disc';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// PRD-035: Mapeamento de categorias para ícones
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  skills: Code2,
  experience: GraduationCap,
  behavioral: Brain,
  location: MapPin,
};

const CATEGORY_LABELS: Record<string, string> = {
  skills: 'Skills Técnicas',
  experience: 'Experiência',
  behavioral: 'Perfil Comportamental',
  location: 'Localização',
};

// Growth chart colors (consistent with ReportsGrowth)
const COMPANIES_COLOR = '#1e3a8a';
const CANDIDATES_COLOR = '#06b6d4';

interface GrowthDataPoint {
  date: string;
  companies: number;      // cumulative total up to this day
  candidates: number;     // cumulative total up to this day
  newCompanies: number;   // sign-ups on this specific day
  newCandidates: number;  // sign-ups on this specific day
}

// Custom tooltip: shows cumulative totals + same-day sign-ups
function GrowthTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as GrowthDataPoint;

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-md min-w-[180px]">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>

      <div className="space-y-2 text-xs">
        <div>
          <p className="text-muted-foreground mb-1">Total acumulado</p>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COMPANIES_COLOR }} />
              Empresas
            </span>
            <span className="font-semibold text-foreground">{point.companies.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CANDIDATES_COLOR }} />
              Candidatos
            </span>
            <span className="font-semibold text-foreground">{point.candidates.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-muted-foreground mb-1">Cadastros no dia</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-foreground">Empresas</span>
            <span className="font-semibold text-foreground">+{point.newCompanies}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-foreground">Candidatos</span>
            <span className="font-semibold text-foreground">+{point.newCandidates}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const startOfMonthIso = useMemo(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    [],
  );

  // Stat cards: exact counts, no row fetch at all.
  const { data: totalCompanies } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'companies-total'],
    queryFn: async () => {
      const { count, error } = await supabase.from('companies').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: newCompaniesThisMonth } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'companies-this-month'],
    queryFn: async () => {
      const { count, error } = await supabase.from('companies').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonthIso);
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: totalCandidates } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'candidates-total'],
    queryFn: async () => {
      const { count, error } = await supabase.from('candidates_for_company').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: newCandidatesThisMonth } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'candidates-this-month'],
    queryFn: async () => {
      const { count, error } = await supabase.from('candidates_for_company').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonthIso);
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: activeJobsCount } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'jobs-active'],
    queryFn: async () => {
      const { count, error } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active');
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: newJobsThisMonth } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'jobs-this-month'],
    queryFn: async () => {
      const { count, error } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', startOfMonthIso);
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Gauge-Pro completed tests count (modern test system)
  const { data: gaugeProCount } = useQuery({
    queryKey: ['admin', 'gauge-pro-completed-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('gauge_pro_results')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: gaugeProThisMonthCount } = useQuery({
    queryKey: ['admin', 'gauge-pro-completed-this-month'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('gauge_pro_results')
        .select('*', { count: 'exact', head: true })
        .gte('generated_at', startOfMonthIso);
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: testsResult } = useBehavioralTests();
  const tests = testsResult ?? [];

  // Recent + top companies: two small, dedicated, already-sorted queries —
  // no need to fetch every company just to show 4 or 5 of them.
  const { data: recentCompaniesResult } = useCompanies(undefined, { page: 1, pageSize: 4 }, { field: 'createdAt', direction: 'desc' });
  const recentCompanies = recentCompaniesResult?.data ?? [];
  const { data: topCompaniesResult } = useCompanies(undefined, { page: 1, pageSize: 5 }, { field: 'activeJobs', direction: 'desc' });
  const topCompanies = topCompaniesResult?.data ?? [];

  // Growth chart (last 30 days): lightweight created_at-only rows, bounded to
  // the window, plus a baseline count of everything created before it — never
  // fetches the full historical table, so it can't be capped by row count.
  const growthWindowStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const { data: companiesBaseline } = useQuery({
    queryKey: ['admin', 'dashboard-growth', 'companies-baseline', growthWindowStart.toISOString()],
    queryFn: async () => {
      const { count, error } = await supabase.from('companies').select('*', { count: 'exact', head: true }).lt('created_at', growthWindowStart.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: candidatesBaseline } = useQuery({
    queryKey: ['admin', 'dashboard-growth', 'candidates-baseline', growthWindowStart.toISOString()],
    queryFn: async () => {
      const { count, error } = await supabase.from('candidates_for_company').select('*', { count: 'exact', head: true }).lt('created_at', growthWindowStart.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: companiesInWindow = [] } = useQuery({
    queryKey: ['admin', 'dashboard-growth', 'companies-window', growthWindowStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.from('companies').select('created_at').gte('created_at', growthWindowStart.toISOString());
      if (error) throw error;
      return (data ?? []) as { created_at: string }[];
    },
  });
  const { data: candidatesInWindow = [] } = useQuery({
    queryKey: ['admin', 'dashboard-growth', 'candidates-window', growthWindowStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.from('candidates_for_company').select('created_at').gte('created_at', growthWindowStart.toISOString());
      if (error) throw error;
      return (data ?? []) as { created_at: string }[];
    },
  });

  // Full datasets, uncapped — only for the client-side match-scoring section
  // below (matchStatistics / lowMatchJobs). See PRD-093 for the plan to move
  // match scoring server-side and drop this fetch-all entirely.
  const { data: jobs = [] } = useAllJobs();
  const { data: candidates = [] } = useAllCandidates();
  const { data: applications = [] } = useAllApplications();

  // Compute real metrics — stat-card numbers now come straight from the
  // exact-count queries above; only the match rate still needs the full
  // applications array (client-side scoring, see PRD-093).
  const adminStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const legacyCompleted = tests.filter((t: any) => (t.status ?? t.status) === 'completed').length;
    const testsCompleted = (gaugeProCount ?? 0) + legacyCompleted;
    const legacyTestsThisMonth = tests.filter((t: any) => (t.status ?? t.status) === 'completed' && new Date(t.createdAt ?? t.created_at) >= startOfMonth).length;
    const newTestsThisMonth = (gaugeProThisMonthCount ?? 0) + legacyTestsThisMonth;

    // Match rate: percentage of applications with high match (>= 80%)
    const matchRate = applications.length > 0
      ? Math.round((applications.filter((a: any) => (a.matchScore ?? a.match_score ?? 0) >= 80).length / applications.length) * 100)
      : 0;

    return {
      totalCompanies: totalCompanies ?? 0,
      totalCandidates: totalCandidates ?? 0,
      activeJobs: activeJobsCount ?? 0,
      testsCompleted,
      newCompaniesThisMonth: newCompaniesThisMonth ?? 0,
      newCandidatesThisMonth: newCandidatesThisMonth ?? 0,
      newJobsThisMonth: newJobsThisMonth ?? 0,
      newTestsThisMonth,
      matchRate,
    };
  }, [totalCompanies, totalCandidates, activeJobsCount, tests, applications, gaugeProCount, gaugeProThisMonthCount, newCompaniesThisMonth, newCandidatesThisMonth, newJobsThisMonth]);

  const stats = useMemo(() => [
    {
      label: 'Empresas ativas',
      value: adminStats.totalCompanies.toLocaleString('pt-BR'),
      icon: Building2,
      change: adminStats.newCompaniesThisMonth,
      href: '/admin/empresas',
      tooltip: 'Total de empresas com conta ativa na plataforma'
    },
    {
      label: 'Candidatos cadastrados',
      value: adminStats.totalCandidates.toLocaleString('pt-BR'),
      icon: Users,
      change: adminStats.newCandidatesThisMonth,
      href: '/admin/candidatos',
      tooltip: 'Total de candidatos registrados na plataforma'
    },
    {
      label: 'Vagas ativas',
      value: adminStats.activeJobs.toLocaleString('pt-BR'),
      icon: Briefcase,
      change: adminStats.newJobsThisMonth,
      href: '/admin/vagas',
      tooltip: 'Vagas publicadas e abertas para candidaturas'
    },
    {
      label: 'Testes concluídos',
      value: adminStats.testsCompleted.toLocaleString('pt-BR'),
      icon: Brain,
      change: adminStats.newTestsThisMonth,
      href: '/admin/testes',
      tooltip: 'Total de testes comportamentais finalizados'
    },
  ], [adminStats]);

  // Growth chart data: cumulative companies/candidates + same-day sign-ups
  // over the last 30 days. Built from the lightweight windowed queries above
  // (created_at only, last 30 days) plus a baseline count for everything
  // before the window — never touches the full historical table.
  const growthData = useMemo<GrowthDataPoint[]>(() => {
    const days = 30;
    const now = new Date();
    const data: GrowthDataPoint[] = [];

    let companiesRunning = companiesBaseline ?? 0;
    let candidatesRunning = candidatesBaseline ?? 0;

    for (let i = days - 1; i >= 0; i--) {
      const dayEnd = new Date(now);
      dayEnd.setDate(dayEnd.getDate() - i);
      dayEnd.setHours(23, 59, 59, 999);
      const dayStart = new Date(dayEnd);
      dayStart.setHours(0, 0, 0, 0);
      const dateStr = dayEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      const newCompanies = companiesInWindow.filter((c) => {
        const created = new Date(c.created_at);
        return created >= dayStart && created <= dayEnd;
      }).length;
      const newCandidates = candidatesInWindow.filter((c) => {
        const created = new Date(c.created_at);
        return created >= dayStart && created <= dayEnd;
      }).length;

      companiesRunning += newCompanies;
      candidatesRunning += newCandidates;

      data.push({ date: dateStr, companies: companiesRunning, candidates: candidatesRunning, newCompanies, newCandidates });
    }
    return data;
  }, [companiesBaseline, candidatesBaseline, companiesInWindow, candidatesInWindow]);

  // PRD-035: Calcular estatísticas de match para todas as candidaturas
  const matchStatistics = useMemo(() => {
    // Calcular match para cada candidatura
    const matchResults: MatchResult[] = [];

    for (const application of applications) {
      const candidate = candidates.find(c => c.id === application.candidateId);
      const job = jobs.find(j => j.id === application.jobId);

      if (candidate && job) {
        const idealProfile = getOrGenerateIdealProfile(job);
        // Admin dashboard usa fallback legado para evitar N×M fetches de std_skills.
        // Quando uma RPC otimizada estiver disponível, passar skillsInput aqui.
        const matchResult = calculateMatchBreakdown(candidate, job, idealProfile);
        matchResults.push(matchResult);
      }
    }

    return calculateMatchStatistics(matchResults);
  }, [applications, candidates, jobs]);

  // PRD-035: Vagas com poucos candidatos de alto match
  const lowMatchJobs = useMemo(() => {
    const jobMatchCounts: Record<string, { high: number; total: number; title: string }> = {};

    for (const application of applications) {
      const candidate = candidates.find(c => c.id === application.candidateId);
      const job = jobs.find(j => j.id === application.jobId);

      if (candidate && job) {
        if (!jobMatchCounts[job.id]) {
          jobMatchCounts[job.id] = { high: 0, total: 0, title: job.title };
        }

        const idealProfile = getOrGenerateIdealProfile(job);
        // Admin dashboard usa fallback legado para evitar N×M fetches de std_skills.
        // Quando uma RPC otimizada estiver disponível, passar skillsInput aqui.
        const matchResult = calculateMatchBreakdown(candidate, job, idealProfile);

        jobMatchCounts[job.id].total++;
        if (matchResult.totalScore >= 80) {
          jobMatchCounts[job.id].high++;
        }
      }
    }

    // Retornar vagas com menos de 30% de candidatos de alto match e pelo menos 3 candidaturas
    return Object.entries(jobMatchCounts)
      .filter(([, data]) => data.total >= 3 && (data.high / data.total) < 0.3)
      .map(([id, data]) => ({
        id,
        title: data.title,
        highMatchRate: Math.round((data.high / data.total) * 100),
        highMatchCount: data.high,
        totalCount: data.total,
      }))
      .slice(0, 3);
  }, [applications, candidates, jobs]);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Visão geral da plataforma RecrutaRS. Acompanhe métricas de empresas, candidatos, vagas e testes comportamentais."
          howItWorks={[
            'Os cards mostram totais de empresas, candidatos, vagas e testes',
            'Gráficos exibem crescimento e tendências ao longo do tempo',
            'Clique nos cards para navegar até a seção correspondente',
          ]}
        />

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Tooltip key={stat.label}>
              <TooltipTrigger asChild>
                <Link to={stat.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-md transition-all cursor-pointer group relative"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      {stat.change !== 0 && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                          stat.change > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {stat.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                          {stat.change > 0 ? `+${stat.change}` : stat.change}
                        </div>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Match Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Taxa de Match</h3>
              <p className="text-muted-foreground">Percentual de contratações bem-sucedidas</p>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold text-foreground">{adminStats.matchRate}%</div>
            <div className="flex items-center gap-1 text-success text-sm mb-2">
              <ArrowUp className="w-4 h-4" />
              +5% este mês
            </div>
          </div>
          <div className="mt-4 w-full bg-muted rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${adminStats.matchRate}%` }}
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Ações Rápidas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Empresas', icon: Building2, href: '/admin/empresas', color: 'primary' },
              { label: 'Candidatos', icon: Users, href: '/admin/candidatos', color: 'secondary' },
              { label: 'Vagas', icon: Briefcase, href: '/admin/vagas', color: 'success' },
              { label: 'Relatórios', icon: FileText, href: '/admin/relatorios', color: 'warning' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg bg-${action.color}/10 flex items-center justify-center`}>
                  <action.icon className={`w-5 h-5 text-${action.color}`} />
                </div>
                <span className="font-medium text-foreground">{action.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Content Grid - Row 1: Growth Chart + Recent Companies */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Growth Chart - 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Crescimento (Últimos 30 dias)</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  content={<GrowthTooltip />}
                  cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="circle"
                />
                {/* Same-day sign-ups (right axis) */}
                <Bar
                  yAxisId="right"
                  dataKey="newCompanies"
                  name="Empresas (no dia)"
                  fill={COMPANIES_COLOR}
                  fillOpacity={0.45}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={10}
                />
                <Bar
                  yAxisId="right"
                  dataKey="newCandidates"
                  name="Candidatos (no dia)"
                  fill={CANDIDATES_COLOR}
                  fillOpacity={0.45}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={10}
                />
                {/* Cumulative totals (left axis) */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="companies"
                  stroke={COMPANIES_COLOR}
                  strokeWidth={2}
                  name="Empresas (total)"
                  dot={{ fill: COMPANIES_COLOR, r: 3 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="candidates"
                  stroke={CANDIDATES_COLOR}
                  strokeWidth={2}
                  name="Candidatos (total)"
                  dot={{ fill: CANDIDATES_COLOR, r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Companies - 1 column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Empresas Recentes</h2>
              <Link to="/admin/empresas" className="text-sm text-secondary font-medium hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="space-y-4">
              {recentCompanies.map((company) => (
                <div key={company.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{company.name}</div>
                    <div className="text-sm text-muted-foreground">{company.industry} • {company.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground">{company.activeJobs}</div>
                    <div className="text-xs text-muted-foreground">vagas</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Content Grid - Row 2: Application Status + Top Companies */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Application Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Candidaturas por Status</h2>
            <div className="space-y-4">
              {(() => {
                // Calcular contagens por status
                const statusCounts = {
                  pending: applications.filter(a => a.status === 'pending').length,
                  reviewing: applications.filter(a => a.status === 'reviewing').length,
                  interview: applications.filter(a => a.status === 'interview').length,
                  offer: applications.filter(a => a.status === 'offer').length,
                  rejected: applications.filter(a => a.status === 'rejected').length,
                };
                const maxCount = Math.max(...Object.values(statusCounts), 1);

                return [
                  { label: 'Pendentes', count: statusCounts.pending, color: 'bg-muted' },
                  { label: 'Em análise', count: statusCounts.reviewing, color: 'bg-warning' },
                  { label: 'Entrevista', count: statusCounts.interview, color: 'bg-secondary' },
                  { label: 'Proposta', count: statusCounts.offer, color: 'bg-success' },
                  { label: 'Rejeitadas', count: statusCounts.rejected, color: 'bg-destructive' },
                ].map((status) => (
                  <div key={status.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{status.label}</span>
                      <span className="text-sm font-semibold text-muted-foreground">{status.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(status.count / maxCount) * 100}%` }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className={`h-2 ${status.color} rounded-full`}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </motion.div>

          {/* Top Companies Ranking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Top Empresas</h2>
              <Link to="/admin/empresas" className="text-sm text-secondary font-medium hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="space-y-4">
              {topCompanies.map((company, index) => (
                  <div key={company.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{company.name}</div>
                      <div className="text-sm text-muted-foreground">{company.industry}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">{company.activeJobs}</div>
                      <div className="text-xs text-muted-foreground">vagas</div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>

        {/* PRD-035: Match Statistics Widget */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Média por categoria */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Match por Categoria</h3>
                <p className="text-sm text-muted-foreground">Média de compatibilidade em {matchStatistics.totalMatches} candidaturas</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(matchStatistics.averageByCategory).map(([catId, avgScore]) => {
                const Icon = CATEGORY_ICONS[catId] || Target;
                const label = CATEGORY_LABELS[catId] || catId;

                return (
                  <div key={catId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">{avgScore}%</span>
                    </div>
                    <Progress value={avgScore} className="h-2" />
                  </div>
                );
              })}
            </div>

            {/* Identificar gargalos */}
            {Object.entries(matchStatistics.averageByCategory).some(([, score]) => score < 60) && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">Gargalos identificados</p>
                    <p className="text-muted-foreground">
                      {Object.entries(matchStatistics.averageByCategory)
                        .filter(([, score]) => score < 60)
                        .map(([catId]) => CATEGORY_LABELS[catId] || catId)
                        .join(', ')} apresentam scores abaixo de 60%.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Distribuição de matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Distribuição de Matches</h3>
                <p className="text-sm text-muted-foreground">Score médio: {matchStatistics.averageTotal}%</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-success/10 rounded-xl">
                <div className="text-2xl font-bold text-success">{matchStatistics.distribution.high}</div>
                <div className="text-xs text-muted-foreground mt-1">Alto (&ge; 80%)</div>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-xl">
                <div className="text-2xl font-bold text-warning">{matchStatistics.distribution.medium}</div>
                <div className="text-xs text-muted-foreground mt-1">Médio (60-79%)</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-bold text-muted-foreground">{matchStatistics.distribution.low}</div>
                <div className="text-xs text-muted-foreground mt-1">Baixo (&lt; 60%)</div>
              </div>
            </div>

            {/* Alertas de vagas com poucos candidatos de alto match */}
            {lowMatchJobs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Vagas com poucos candidatos de alto match
                </h4>
                <div className="space-y-2">
                  {lowMatchJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                      <span className="font-medium truncate flex-1">{job.title}</span>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {job.highMatchCount}/{job.totalCount} alto match
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
