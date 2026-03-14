import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, Brain, TrendingUp, ArrowUp, ArrowDown, ChevronRight, FileText, Target, AlertTriangle, Code2, GraduationCap, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { getOrGenerateIdealProfile } from '@/lib/behavioralProfiles';
import { useJobs } from '@/hooks/useJobsQuery';
import { useCandidates } from '@/hooks/useCandidatesQuery';
import { useCompanies } from '@/hooks/useCompaniesQuery';
import { useApplications } from '@/hooks/useApplicationsQuery';
import { useBehavioralTests } from '@/hooks/useBehavioralTestsQuery';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
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

export default function AdminDashboard() {
  // Fetch data via React Query hooks
  const { data: jobsResult } = useJobs();
  const { data: candidatesResult } = useCandidates(undefined, { page: 1, pageSize: 1000 });
  const { data: companiesResult } = useCompanies();
  const { data: applicationsResult } = useApplications(undefined, { page: 1, pageSize: 1000 });
  const { data: testsResult } = useBehavioralTests();

  const jobs = jobsResult?.data ?? [];
  const candidates = candidatesResult?.data ?? [];
  const companies = companiesResult?.data ?? [];
  const applications = applicationsResult?.data ?? [];
  const tests = testsResult?.data ?? [];

  // Compute real metrics from Supabase data
  const adminStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalCompanies = companies.length;
    const totalCandidates = candidates.length;
    const activeJobs = jobs.filter((j: any) => (j.status ?? j.status) === 'active').length;
    const testsCompleted = tests.filter((t: any) => (t.status ?? t.status) === 'completed').length;

    const getCreatedAt = (item: any) => new Date(item.createdAt ?? item.created_at);

    const newCompaniesThisMonth = companies.filter(c => getCreatedAt(c) >= startOfMonth).length;
    const newCandidatesThisMonth = candidates.filter(c => getCreatedAt(c) >= startOfMonth).length;
    const newJobsThisMonth = jobs.filter((j: any) => (j.status ?? j.status) === 'active' && getCreatedAt(j) >= startOfMonth).length;
    const newTestsThisMonth = tests.filter((t: any) => (t.status ?? t.status) === 'completed' && getCreatedAt(t) >= startOfMonth).length;

    // Match rate: percentage of applications with high match (>= 80%)
    const matchRate = applications.length > 0
      ? Math.round((applications.filter((a: any) => (a.matchScore ?? a.match_score ?? 0) >= 80).length / applications.length) * 100)
      : 0;

    return { totalCompanies, totalCandidates, activeJobs, testsCompleted, newCompaniesThisMonth, newCandidatesThisMonth, newJobsThisMonth, newTestsThisMonth, matchRate };
  }, [companies, candidates, jobs, tests, applications]);

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

  // Growth chart data: cumulative companies/candidates over last 30 days
  const growthData = useMemo(() => {
    const days = 30;
    const now = new Date();
    const data = [];
    const getCreatedAt = (item: any) => new Date(item.createdAt ?? item.created_at);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(23, 59, 59, 999);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const companiesCount = companies.filter(c => getCreatedAt(c) <= date).length;
      const candidatesCount = candidates.filter(c => getCreatedAt(c) <= date).length;
      data.push({ date: dateStr, companies: companiesCount, candidates: candidatesCount });
    }
    return data;
  }, [companies, candidates]);

  // PRD-035: Calcular estatísticas de match para todas as candidaturas
  const matchStatistics = useMemo(() => {
    // Calcular match para cada candidatura
    const matchResults: MatchResult[] = [];

    for (const application of applications) {
      const candidate = candidates.find(c => c.id === application.candidateId);
      const job = jobs.find(j => j.id === application.jobId);

      if (candidate && job) {
        const idealProfile = getOrGenerateIdealProfile(job);
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
            'Graficos exibem crescimento e tendencias ao longo do tempo',
            'Clique nos cards para navegar ate a secao correspondente',
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
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
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
                  dataKey="companies"
                  stroke="#1e3a8a"
                  strokeWidth={2}
                  name="Empresas"
                  dot={{ fill: '#1e3a8a', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="candidates"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  name="Candidatos"
                  dot={{ fill: '#06b6d4', r: 3 }}
                />
              </LineChart>
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
              {companies.slice(0, 4).map((company) => (
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
              {[...companies]
                .sort((a, b) => b.activeJobs - a.activeJobs)
                .slice(0, 5)
                .map((company, index) => (
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
