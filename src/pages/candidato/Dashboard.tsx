import { motion } from 'framer-motion';
import { FileText, Calendar, Brain, Eye, Search, MessageSquare, ArrowRight, Clock, Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { candidateStats, mockApplications, mockMessages, mockCandidates, getCandidateDISCProfile } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DISCRadarChartMini } from '@/components/disc/DISCRadarChart';
import { DISCLegendCompact } from '@/components/disc/DISCLegend';
// PRD-035: Banner de incentivo ao teste DISC
import { DiscIncentiveBanner } from '@/components/candidato/DiscIncentiveBanner';
// PRD-036: Widget de vagas recomendadas
import { RecommendedJobsWidget } from '@/components/candidato/RecommendedJobsWidget';

export default function CandidateDashboard() {
  const { currentCandidate } = useAuth();
  const candidate = currentCandidate || mockCandidates[0];

  const candidateApplications = mockApplications.filter(app => app.candidateId === 'candidate-1');
  const unreadMessages = mockMessages.filter(m => m.receiverId === 'candidate-1' && !m.read);

  // PRD-002-dgn: Perfil DISC do candidato
  const discProfile = getCandidateDISCProfile('candidate-1');

  const stats = [
    { label: 'Candidaturas', value: candidateApplications.length, icon: FileText },
    { label: 'Entrevistas', value: candidateStats.interviews, icon: Calendar },
    { label: 'Testes', value: candidateStats.testsCompleted, icon: Brain },
    { label: 'Visualizações', value: candidateStats.profileViews, icon: Eye },
  ];

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Olá, {candidate.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Acompanhe sua jornada profissional</p>
          </div>
          <Button asChild variant="accent">
            <Link to="/candidato/vagas">
              <Search className="w-5 h-5 mr-2" />
              Buscar Vagas
            </Link>
          </Button>
        </div>

        {/* PRD-035: Banner de incentivo ao teste DISC */}
        <DiscIncentiveBanner
          context="dashboard"
          profileCompletion={candidate.profileCompletion}
        />

        {/* Profile Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Completude do Perfil</h2>
              <p className="text-muted-foreground">Perfis completos têm 3x mais chances de serem vistos</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/candidato/perfil">
                Completar Perfil
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={candidate.profileCompletion} className="flex-1 h-3" />
            <span className="text-2xl font-bold text-foreground">{candidate.profileCompletion}%</span>
          </div>
        </motion.div>

        {/* PRD-002-dgn: DISC Profile Card */}
        {discProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">Meu Perfil DISC</h2>
                <p className="text-muted-foreground mb-4">
                  Seu perfil comportamental baseado no teste Gauge-Pro
                </p>
                <DISCLegendCompact profile={discProfile} />
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/candidato/testes">
                    Ver resultado completo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="w-48 h-48 mx-auto md:mx-0">
                <DISCRadarChartMini profile={discProfile} />
              </div>
            </div>
          </motion.div>
        )}

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
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Minhas Candidaturas</h2>
              <Link to="/candidato/candidaturas" className="text-sm text-secondary font-medium hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="space-y-4">
              {candidateApplications.map((app) => (
                <div key={app.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{app.jobTitle}</div>
                    <div className="text-sm text-muted-foreground">{app.companyName}</div>
                  </div>
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
                </div>
              ))}
              {candidateApplications.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Nenhuma candidatura ainda</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/candidato/vagas">Explorar vagas</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Messages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">Mensagens</h2>
                {unreadMessages.length > 0 && (
                  <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                    {unreadMessages.length} nova{unreadMessages.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Link to="/candidato/mensagens" className="text-sm text-secondary font-medium hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="space-y-4">
              {mockMessages.filter(m => m.receiverId === 'candidate-1').slice(0, 3).map((msg) => (
                <div key={msg.id} className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                  !msg.read ? 'bg-secondary/5 border border-secondary/20' : 'bg-muted/50 hover:bg-muted'
                }`}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{msg.senderName}</span>
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-secondary" />}
                    </div>
                    <div className="text-sm text-foreground truncate">{msg.subject}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* PRD-036: Recommended Jobs Widget */}
        <RecommendedJobsWidget candidateId={candidate.id} />
      </div>
    </DashboardLayout>
  );
}
