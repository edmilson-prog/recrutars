import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, Brain, TrendingUp, ArrowUp, ArrowDown, ChevronRight, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { adminStats, mockCompanies, mockCandidates, adminGrowthData, mockApplications } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const stats = [
  {
    label: 'Empresas ativas',
    value: adminStats.totalCompanies,
    icon: Building2,
    change: `+${adminStats.newCompaniesThisMonth}`,
    trend: 'up',
    href: '/admin/empresas'
  },
  {
    label: 'Candidatos cadastrados',
    value: adminStats.totalCandidates.toLocaleString('pt-BR'),
    icon: Users,
    change: `+${adminStats.newCandidatesThisMonth}`,
    trend: 'up',
    href: '/admin/candidatos'
  },
  {
    label: 'Vagas ativas',
    value: adminStats.activeJobs,
    icon: Briefcase,
    change: '+12',
    trend: 'up',
    href: '/admin/vagas'
  },
  {
    label: 'Testes concluídos',
    value: adminStats.testsCompleted,
    icon: Brain,
    change: '+45',
    trend: 'up',
    href: '/admin/testes'
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
            <Link key={stat.label} to={stat.href}>
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
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-success' : 'text-destructive'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <ChevronRight className="w-5 h-5 text-muted-foreground absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </Link>
          ))}
        </div>

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
              <LineChart data={adminGrowthData}>
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
                <Tooltip
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
                  pending: mockApplications.filter(a => a.status === 'pending').length,
                  reviewing: mockApplications.filter(a => a.status === 'reviewing').length,
                  interview: mockApplications.filter(a => a.status === 'interview').length,
                  offer: mockApplications.filter(a => a.status === 'offer').length,
                  rejected: mockApplications.filter(a => a.status === 'rejected').length,
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
              {[...mockCompanies]
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
