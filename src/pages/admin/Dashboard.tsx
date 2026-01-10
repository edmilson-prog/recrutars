import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, Brain, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminStats, mockCompanies, mockCandidates, mockJobs } from '@/data/mockData';

const stats = [
  { 
    label: 'Empresas ativas', 
    value: adminStats.totalCompanies, 
    icon: Building2, 
    change: `+${adminStats.newCompaniesThisMonth}`,
    trend: 'up' 
  },
  { 
    label: 'Candidatos cadastrados', 
    value: adminStats.totalCandidates.toLocaleString('pt-BR'), 
    icon: Users, 
    change: `+${adminStats.newCandidatesThisMonth}`,
    trend: 'up' 
  },
  { 
    label: 'Vagas ativas', 
    value: adminStats.activeJobs, 
    icon: Briefcase, 
    change: '+12',
    trend: 'up' 
  },
  { 
    label: 'Testes concluídos', 
    value: adminStats.testsCompleted, 
    icon: Brain, 
    change: '+45',
    trend: 'up' 
  },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da plataforma RecrutaRS</p>
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
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Companies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Empresas Recentes</h2>
              <span className="text-sm text-secondary font-medium cursor-pointer hover:underline">Ver todas</span>
            </div>
            <div className="space-y-4">
              {mockCompanies.map((company) => (
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

          {/* Recent Candidates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Candidatos Recentes</h2>
              <span className="text-sm text-secondary font-medium cursor-pointer hover:underline">Ver todos</span>
            </div>
            <div className="space-y-4">
              {mockCandidates.slice(0, 3).map((candidate) => (
                <div key={candidate.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="font-semibold text-secondary">{candidate.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{candidate.name}</div>
                    <div className="text-sm text-muted-foreground">{candidate.title}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      candidate.hasTest 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {candidate.hasTest ? 'Teste OK' : 'Sem teste'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
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
      </div>
    </DashboardLayout>
  );
}
