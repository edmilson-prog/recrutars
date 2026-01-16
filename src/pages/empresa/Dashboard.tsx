import { motion } from 'framer-motion';
import { Briefcase, Users, UserPlus, Clock, Plus, ArrowUp, Eye, Search, MessageSquare, Brain, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { companyStats, mockJobs, mockApplications, mockBehavioralTests } from '@/data/mockData';
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
  const { user } = useAuth();
  const companyJobs = mockJobs.filter(job => job.companyId === 'company-1');
  const recentApplications = mockApplications.filter(app =>
    companyJobs.some(job => job.id === app.jobId)
  ).slice(0, 5);

  // Calculate metrics
  const activeJobsCount = companyJobs.filter(j => j.status === 'active').length;
  const totalCandidates = companyJobs.reduce((sum, job) => sum + job.applicationsCount, 0);
  const newTodayCount = 12; // Mock: candidaturas novas hoje
  const inReviewCount = mockApplications.filter(app =>
    app.status === 'reviewing' && companyJobs.some(job => job.id === app.jobId)
  ).length;

  // RF-001 a RF-005: Cards clicáveis
  const stats = [
    {
      label: 'Vagas ativas',
      value: activeJobsCount,
      icon: Briefcase,
      href: '/empresa/vagas'
    },
    {
      label: 'Total de candidatos',
      value: totalCandidates,
      icon: Users,
      href: '/empresa/candidatos'
    },
    {
      label: 'Novas hoje',
      value: newTodayCount,
      icon: UserPlus,
      href: '/empresa/candidatos'
    },
    {
      label: 'Em análise',
      value: inReviewCount,
      icon: Clock,
      href: '/empresa/candidatos'
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

        {/* Stats Grid - RF-001 a RF-005 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
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
                  <span className="text-2xl font-bold text-success">{companyStats.hiredThisMonth}</span>
                </div>
                <div className="flex items-center gap-1 text-success text-sm">
                  <ArrowUp className="w-4 h-4" />
                  +50% vs mês anterior
                </div>
              </div>
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Tempo médio de contratação</span>
                  <span className="text-2xl font-bold text-foreground">{companyStats.avgTimeToHire}d</span>
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
