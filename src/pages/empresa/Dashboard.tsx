import { motion } from 'framer-motion';
import {
  Briefcase, Users, UserPlus, Clock, Plus, ArrowUp, Eye, Search, MessageSquare, Brain, ChevronRight,
  LayoutGrid, CircleCheck, FileEdit, PauseCircle, CheckCircle2,
  ClipboardCheck, TrendingUp, UsersRound,
  UserCheck, CalendarClock, History, ArrowRight, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useJobsByCompany } from '@/hooks/useJobsQuery';
import { useApplications as useApplicationsQuery } from '@/hooks/useApplicationsQuery';
import { useInterviewsByCompany } from '@/hooks/useInterviewsQuery';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SuggestedCandidatesWidget } from '@/components/empresa/SuggestedCandidatesWidget';

/**
 * Returns greeting based on current hour
 * RF-022: Saudação deve variar com horário
 */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

export default function CompanyDashboard() {
  const { user, currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';

  // Fetch data from service layer
  const { data: companyJobs = [], isLoading: isLoadingJobs } = useJobsByCompany(companyId);
  const { data: applicationsResult, isLoading: isLoadingApps } = useApplicationsQuery({ companyId });
  const { data: companyInterviews = [], isLoading: isLoadingInterviews } = useInterviewsByCompany(companyId);

  const allApplications = applicationsResult?.data ?? [];
  const recentApplications = allApplications.slice(0, 5);

  const isLoading = isLoadingJobs || isLoadingApps;

  // Calculate metrics
  const activeJobsCount = companyJobs.filter(j => j.status === 'active').length;
  const totalCandidates = companyJobs.reduce((sum, job) => sum + job.applicationsCount, 0);
  const newTodayCount = 12; // TODO: compute from real data when timestamps available
  const inReviewCount = allApplications.filter(app =>
    app.status === 'reviewing' && companyJobs.some(job => job.id === app.jobId)
  ).length;

  // Novos cálculos para cards de referência
  const totalJobsCount = companyJobs.length;
  const pausedJobsCount = companyJobs.filter(j => j.status === 'paused').length;
  const closedJobsCount = companyJobs.filter(j => j.status === 'closed').length;

  const scheduledInterviewsCount = companyInterviews.filter(
    i => i.status === 'confirmed' || i.status === 'pending_candidate'
  ).length;
  const completedInterviewsCount = companyInterviews.filter(
    i => i.status === 'completed'
  ).length;

  // Métricas mock locais
  const dashboardMetrics = {
    planName: 'Seleção Inteligente',
    planTestsTotal: 5,
    planTestsUsed: 0,
    assessmentsThisMonth: 0,
    assessmentsPending: 7,
    candidatesEvaluated: 27,
    avgAssessmentTime: 96,
    activeEmployees: 0,
  };

  // Mini-cards de status de vagas
  const jobStatusCards = [
    { label: 'Total de Vagas', value: totalJobsCount, icon: LayoutGrid, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Vagas Ativas', value: activeJobsCount, icon: CircleCheck, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { label: 'Rascunhos', value: 0, icon: FileEdit, iconBg: 'bg-slate-100', iconColor: 'text-slate-500' },
    { label: 'Pausadas', value: pausedJobsCount, icon: PauseCircle, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { label: 'Vagas Finalizadas', value: closedJobsCount, icon: CheckCircle2, iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
  ];

  // RF-001 a RF-005: Cards clicáveis
  const stats = [
    {
      label: 'Vagas ativas',
      value: activeJobsCount,
      icon: Briefcase,
      href: '/empresa/vagas',
      tooltip: 'Vagas publicadas e recebendo candidaturas'
    },
    {
      label: 'Total de candidatos',
      value: totalCandidates,
      icon: Users,
      href: '/empresa/candidatos',
      tooltip: 'Soma de candidatos em todas as suas vagas'
    },
    {
      label: 'Novas hoje',
      value: newTodayCount,
      icon: UserPlus,
      href: '/empresa/candidatos',
      tooltip: 'Candidaturas recebidas nas ultimas 24 horas'
    },
    {
      label: 'Em análise',
      value: inReviewCount,
      icon: Clock,
      href: '/empresa/candidatos',
      tooltip: 'Candidatos aguardando sua avaliacao'
    },
  ];

  // RF-006 a RF-009: Candidaturas por vaga (top 5, ordenadas)
  const sortedJobs = [...companyJobs]
    .sort((a, b) => b.applicationsCount - a.applicationsCount)
    .slice(0, 5);
  const maxApplications = Math.max(...sortedJobs.map(j => j.applicationsCount), 1);

  // RF-010 a RF-012: Ações pendentes
  const pendingActions = [
    {
      label: 'Novos candidatos',
      count: 12,
      href: '/empresa/candidatos',
      icon: UserPlus
    },
    {
      label: 'Mensagens não lidas',
      count: 5,
      href: '/empresa/mensagens',
      icon: MessageSquare
    },
    {
      label: 'Testes para avaliar',
      count: 3,
      href: '/empresa/testes',
      icon: Brain
    },
  ];

  // RF-014 a RF-015: Mock de match e teste para candidaturas
  const getMatchAndTestInfo = (applicationId: string) => {
    // Mock: gera valores baseados no ID para consistência
    const hash = applicationId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const matchPercentage = 65 + (hash % 30); // 65-94%
    const hasTest = hash % 2 === 0;
    return { matchPercentage, hasTest };
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-8">
        {/* Header com saudação personalizada - RF-021/RF-022 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {getGreeting()}, {user?.name || 'Maria'}!
            </h1>
            <p className="text-muted-foreground">Acompanhe seus processos seletivos</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Seção 1: Mini-cards de Status de Vagas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {jobStatusCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground truncate">{card.label}</div>
                  <div className="text-2xl font-bold text-foreground">{card.value}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Seção 2: Métricas Operacionais */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Testes do Plano */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Testes do Plano</h3>
                <p className="text-xs text-muted-foreground">{dashboardMetrics.planName}</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-3">
              {dashboardMetrics.planTestsTotal}
            </div>
            <div className="space-y-2 mb-4">
              <Progress
                value={(dashboardMetrics.planTestsUsed / dashboardMetrics.planTestsTotal) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {dashboardMetrics.planTestsUsed} de {dashboardMetrics.planTestsTotal} usados este mês
              </p>
            </div>
            <Link
              to="/empresa/plano"
              className="text-sm text-secondary font-medium hover:underline inline-flex items-center gap-1"
            >
              Ver meu plano <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Card: Avaliações do Mês */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Avaliações do Mês</h3>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {dashboardMetrics.assessmentsThisMonth}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {dashboardMetrics.assessmentsPending} pendentes
            </p>
            <Link
              to="/empresa/testes"
              className="text-sm text-secondary font-medium hover:underline inline-flex items-center gap-1"
            >
              Ver dashboard de testes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Card: Candidatos Avaliados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <UsersRound className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Candidatos Avaliados</h3>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {dashboardMetrics.candidatesEvaluated}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tempo médio: {dashboardMetrics.avgAssessmentTime} min
            </p>
            <Link
              to="/empresa/candidatos"
              className="text-sm text-secondary font-medium hover:underline inline-flex items-center gap-1"
            >
              Ver gestão de equipes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Seção 3: Métricas de Equipe */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Contratações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Contratações</h3>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              {allApplications.filter(a => a.status === 'hired').length}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {dashboardMetrics.activeEmployees} funcionários ativos
            </p>
            <Link
              to="/empresa/candidatos"
              className="text-sm text-secondary font-medium hover:underline inline-flex items-center gap-1"
            >
              Ver histórico completo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Card: Entrevistas Agendadas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <CalendarClock className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Entrevistas Agendadas</h3>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {scheduledInterviewsCount}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Próximas entrevistas
            </p>
            <Link
              to="/empresa/entrevistas"
              className="text-sm text-secondary font-medium hover:underline inline-flex items-center gap-1"
            >
              Ver agenda <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Card: Entrevistas Realizadas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <History className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Entrevistas Realizadas</h3>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {completedInterviewsCount}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Total de entrevistas concluídas
            </p>
            <Link
              to="/empresa/entrevistas"
              className="text-sm text-secondary font-medium hover:underline inline-flex items-center gap-1"
            >
              Ver histórico <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Stats Grid - RF-001 a RF-005 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Tooltip key={stat.label}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={stat.href}
                    className="block bg-card rounded-2xl p-6 shadow-soft hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </Link>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* RF-006 a RF-009: Candidaturas por Vaga (Barras Horizontais) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Candidaturas por Vaga</h2>
              <Link to="/empresa/vagas" className="text-sm text-secondary font-medium hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="space-y-4">
              {sortedJobs.map((job) => (
                <div key={job.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {job.title}
                    </span>
                    <span className="text-sm font-semibold text-secondary">
                      {job.applicationsCount}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(job.applicationsCount / maxApplications) * 100}%` }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="h-2 bg-secondary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RF-010 a RF-012: Ações Pendentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Ações Pendentes</h2>
            <div className="space-y-4">
              {pendingActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <action.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                      {action.count}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RF-013 a RF-017: Últimas Candidaturas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Últimas Candidaturas</h2>
            <Link to="/empresa/candidatos" className="text-sm text-secondary font-medium hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground text-sm border-b border-border">
                  <th className="pb-4 font-medium">Candidato</th>
                  <th className="pb-4 font-medium">Vaga</th>
                  <th className="pb-4 font-medium">Match / Teste</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Data</th>
                  <th className="pb-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => {
                  const { matchPercentage, hasTest } = getMatchAndTestInfo(app.id);
                  return (
                    <tr key={app.id} className="border-b border-border last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <span className="font-semibold text-secondary">{app.candidateName.charAt(0)}</span>
                          </div>
                          <span className="font-medium text-foreground">{app.candidateName}</span>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground">{app.jobTitle}</td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-secondary">{matchPercentage}% match</span>
                          {hasTest ? (
                            <span className="text-xs text-success">Teste realizado</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Aguardando teste</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === 'interview' ? 'bg-secondary/10 text-secondary' :
                          app.status === 'reviewing' ? 'bg-warning/10 text-warning' :
                          app.status === 'offer' ? 'bg-success/10 text-success' :
                          app.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {app.status === 'pending' ? 'Pendente' :
                           app.status === 'reviewing' ? 'Em análise' :
                           app.status === 'interview' ? 'Entrevista' :
                           app.status === 'offer' ? 'Proposta' :
                           app.status === 'rejected' ? 'Rejeitado' : 'Contratado'}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">{app.appliedAt}</td>
                      <td className="py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* PRD-037: Candidatos Sugeridos para vaga ativa */}
        {companyJobs.filter(j => j.status === 'active').slice(0, 1).map((job) => (
          <motion.div
            key={`suggested-${job.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <SuggestedCandidatesWidget
              jobId={job.id}
              jobTitle={job.title}
            />
          </motion.div>
        ))}

        {/* RF-018 a RF-020: Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Ações Rápidas</h2>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link to="/empresa/vagas/nova">
                <Plus className="w-4 h-4 mr-2" />
                Nova Vaga
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/empresa/candidatos">
                <Search className="w-4 h-4 mr-2" />
                Banco de Talentos
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/empresa/mensagens">
                <MessageSquare className="w-4 h-4 mr-2" />
                Mensagens
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Métricas */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Métricas do Mês</h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Contratações este mês</span>
                  <span className="text-2xl font-bold text-success">{allApplications.filter(a => a.status === 'hired').length}</span>
                </div>
                <div className="flex items-center gap-1 text-success text-sm">
                  <ArrowUp className="w-4 h-4" />
                  +50% vs mês anterior
                </div>
              </div>
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Tempo médio de contratação</span>
                  <span className="text-2xl font-bold text-foreground">18d</span>
                </div>
                <div className="flex items-center gap-1 text-success text-sm">
                  <Clock className="w-4 h-4" />
                  -3 dias vs mês anterior
                </div>
              </div>
            </div>
          </motion.div>

          {/* Minhas Vagas (resumo) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Minhas Vagas</h2>
              <Link to="/empresa/vagas" className="text-sm text-secondary font-medium hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="space-y-4">
              {companyJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-foreground">{job.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'active'
                          ? 'bg-success/10 text-success'
                          : job.status === 'paused'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {job.status === 'active' ? 'Ativa' : job.status === 'paused' ? 'Pausada' : 'Encerrada'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {job.location} • {job.type === 'remote' ? 'Remoto' : job.type === 'hybrid' ? 'Híbrido' : 'Presencial'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-foreground">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{job.applicationsCount}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">candidatos</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
