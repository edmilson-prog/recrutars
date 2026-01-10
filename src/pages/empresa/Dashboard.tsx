import { motion } from 'framer-motion';
import { Briefcase, Users, Brain, Calendar, Plus, ArrowUp, Eye, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { companyStats, mockJobs, mockApplications, mockBehavioralTests } from '@/data/mockData';
import { Link } from 'react-router-dom';

const stats = [
  { 
    label: 'Vagas ativas', 
    value: companyStats.activeJobs, 
    icon: Briefcase, 
    color: 'primary' 
  },
  { 
    label: 'Candidaturas', 
    value: companyStats.totalApplications, 
    icon: Users, 
    color: 'secondary' 
  },
  { 
    label: 'Testes enviados', 
    value: companyStats.testsCompleted, 
    icon: Brain, 
    color: 'accent' 
  },
  { 
    label: 'Entrevistas', 
    value: companyStats.interviewsScheduled, 
    icon: Calendar, 
    color: 'success' 
  },
];

export default function CompanyDashboard() {
  const companyJobs = mockJobs.filter(job => job.companyId === 'company-1');
  const recentApplications = mockApplications.filter(app => 
    companyJobs.some(job => job.id === app.jobId)
  ).slice(0, 4);

  return (
    <DashboardLayout userType="company">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Acompanhe seus processos seletivos</p>
          </div>
          <Button asChild>
            <Link to="/empresa/vagas/nova">
              <Plus className="w-5 h-5 mr-2" />
              Nova Vaga
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-soft"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-soft"
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

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Métricas</h2>
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
        </div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Candidaturas Recentes</h2>
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
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Data</th>
                  <th className="pb-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
