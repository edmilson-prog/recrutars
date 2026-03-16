import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, Brain, Eye, Search, MessageSquare, ArrowRight, Clock, Building2, HelpCircle, Loader2, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApplicationsByCandidate } from '@/hooks/useApplicationsQuery';
import { useUnreadCount } from '@/hooks/useMessagesQuery';
import { useProfile } from '@/hooks/useCurriculumsQuery';
import { useUpdateCandidate } from '@/hooks/useCandidatesQuery';
import { calculateProfileCompletion } from '@/utils/profileCompleteness';
import { calculateCompleteness } from '@/utils/curriculumCompleteness';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRBAC } from '@/contexts/RBACContext';
import { GAUGE_PRO_CONFIG } from '@/data/gaugeProConfig';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type { GaugeProResult, GaugeProDimension } from '@/types/gaugePro';
import { TEST_CONFIG } from '@/data/testConfig';
// PRD-035: Banner de incentivo ao teste comportamental
import { DiscIncentiveBanner } from '@/components/candidato/DiscIncentiveBanner';
// PRD-036: Widget de vagas recomendadas
import { RecommendedJobsWidget } from '@/components/candidato/RecommendedJobsWidget';

const PROFILE_CARD_DISMISSED_KEY = (id: string) => `recrutars-profile-card-dismissed-${id}`;

const DIMENSION_COLORS: Record<GaugeProDimension, string> = {
  D1: '#ef4444',
  D2: '#f59e0b',
  D3: '#22c55e',
  D4: '#3b82f6',
  D5: '#8b5cf6',
};

export default function CandidateDashboard() {
  const { currentCandidate, user } = useAuth();
  const { isImpersonating } = useRBAC();
  const candidate = currentCandidate;

  const candidateId = candidate?.id ?? '';
  const userId = user?.id ?? candidateId;

  // Fetch data from service layer
  const { data: candidateApplications = [], isLoading: isLoadingApps } = useApplicationsByCandidate(candidateId);
  const { data: unreadCount = 0 } = useUnreadCount(candidateId, 'candidate');
  const { data: profile, isLoading: isLoadingProfile } = useProfile(candidateId);
  const updateCandidateMutation = useUpdateCandidate();

  // Profile completeness card dismiss (persistent, per-candidate)
  const [isProfileCardDismissed, setIsProfileCardDismissed] = useState(() => {
    if (!candidateId) return false;
    try {
      return localStorage.getItem(PROFILE_CARD_DISMISSED_KEY(candidateId)) === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissProfileCard = () => {
    setIsProfileCardDismissed(true);
    try {
      localStorage.setItem(PROFILE_CARD_DISMISSED_KEY(candidateId), 'true');
    } catch { /* ignore */ }
  };

  // Gauge-Pro result from localStorage
  const [gaugeResult, setGaugeResult] = useState<GaugeProResult | null>(null);
  const [hasOngoingAssessment, setHasOngoingAssessment] = useState(false);

  useEffect(() => {
    const resultKey = GAUGE_PRO_CONFIG.storageKeys.result(candidateId);
    const assessmentKey = GAUGE_PRO_CONFIG.storageKeys.assessment(candidateId);
    const savedResult = localStorage.getItem(resultKey);
    if (savedResult) {
      try { setGaugeResult(JSON.parse(savedResult)); } catch { /* ignore */ }
    }
    const savedAssessment = localStorage.getItem(assessmentKey);
    if (savedAssessment && !savedResult) setHasOngoingAssessment(true);
  }, [candidateId]);

  // Skill migration banner
  const [hasSkillMigration, setHasSkillMigration] = useState(false);

  useEffect(() => {
    if (!candidateId) return;
    supabase
      .from('candidates')
      .select('skill_migration_note')
      .eq('id', candidateId)
      .single()
      .then(({ data }) => {
        setHasSkillMigration(!!data?.skill_migration_note);
      });
  }, [candidateId]);

  const handleDismissSkillMigration = async () => {
    setHasSkillMigration(false);
    await supabase
      .from('candidates')
      .update({ skill_migration_note: null })
      .eq('id', candidateId);
  };

  // Completude do perfil pessoal (calculada dinamicamente)
  // Movido para antes do early return para respeitar as regras de Hooks do React
  const effectiveLocation = candidate
    ? (candidate.location || [candidate.city, candidate.state].filter(Boolean).join(', '))
    : '';
  const profileCompletion = candidate
    ? calculateProfileCompletion({
        name: candidate.name,
        email: candidate.email,
        title: candidate.title,
        location: effectiveLocation,
        phone: candidate.phone,
        linkedin: candidate.linkedin,
        about: candidate.about,
      })
    : 0;

  // Sync silencioso: se o valor calculado difere do DB, atualiza o banco
  useEffect(() => {
    if (
      candidate &&
      candidateId &&
      profileCompletion !== candidate.profileCompletion &&
      !updateCandidateMutation.isPending &&
      !isImpersonating
    ) {
      updateCandidateMutation.mutate({
        id: candidateId,
        updates: { profileCompletion },
      });
    }
  }, [candidateId, profileCompletion, candidate?.profileCompletion, isImpersonating]);

  // Loading state while candidate loads
  if (!candidate) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Completude do perfil profissional
  const completenessResult = profile ? calculateCompleteness(profile) : null;
  const curriculumCompletion = completenessResult?.percentage ?? 0;
  const showProfileCard = !isProfileCardDismissed || curriculumCompletion < 100;

  // Compute stats from fetched data
  const interviewCount = candidateApplications.filter(a => a.status === 'interview').length;
  const stats = [
    { label: 'Candidaturas', value: candidateApplications.length, icon: FileText, tooltip: 'Total de candidaturas enviadas para vagas' },
    { label: 'Entrevistas', value: interviewCount, icon: Calendar, tooltip: 'Entrevistas agendadas ou realizadas' },
    { label: 'Testes', value: gaugeResult ? 1 : 0, icon: Brain, tooltip: 'Testes comportamentais completados' },
    { label: 'Visualizações', value: 0, icon: Eye, tooltip: 'Vezes que empresas visualizaram seu perfil' },
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

        {/* Banner de migração de habilidades */}
        {hasSkillMigration && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg bg-amber-500/10 border-l-4 border-amber-500"
          >
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Suas habilidades foram atualizadas
              </p>
              <p className="text-xs text-muted-foreground">
                Algumas competências foram ajustadas para o formato padronizado. Revise para garantir que seu perfil esteja correto.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link to="/candidato/perfil?tab=skills">
                  Revisar Habilidades
                </Link>
              </Button>
              <button
                onClick={handleDismissSkillMigration}
                className="p-1 rounded hover:bg-muted transition-colors"
                aria-label="Dispensar aviso"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}

        {/* PRD-035: Banner de incentivo ao teste comportamental */}
        <DiscIncentiveBanner
          context="dashboard"
          profileCompletion={profileCompletion}
        />

        {/* Curriculum Completion */}
        <AnimatePresence>
          {showProfileCard && (
            <motion.div
              key="profile-completeness-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              transition={{ delay: 0.05 }}
              className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-foreground">Completude do Perfil Profissional</h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>Mostra o progresso do seu perfil profissional. Perfis completos aumentam o interesse dos recrutadores.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-muted-foreground">
                    {curriculumCompletion === 100
                      ? 'Parabéns! Seu perfil profissional está completo.'
                      : 'Perfis completos atraem mais recrutadores'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline">
                    <Link to="/candidato/perfil">
                      Editar Perfil Profissional
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  {/* Dismiss button - only at 100% */}
                  {curriculumCompletion === 100 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleDismissProfileCard}
                          className="p-1.5 rounded-full hover:bg-muted transition-colors"
                          aria-label="Ocultar card de completude"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Ocultar este card</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
              {profile ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <Progress value={curriculumCompletion} className="flex-1 h-3" />
                    <span className="text-2xl font-bold text-foreground">{curriculumCompletion}%</span>
                  </div>
                  {completenessResult && completenessResult.missingSections.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Falta completar: {completenessResult.missingSections.join(', ')}
                    </p>
                  )}
                  {curriculumCompletion === 100 && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Perfil completo! Você está pronto para atrair os melhores recrutadores.</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete seu perfil profissional para se candidatar às vagas.
                </p>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* Gauge-Pro Behavioral Profile Card */}
        {gaugeResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">{TEST_CONFIG.profileLabel}</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>Resultado da sua avaliação comportamental. Cada dimensão reflete um aspecto do seu perfil profissional.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-muted-foreground text-sm">
                  Baseado na avaliação {TEST_CONFIG.name}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/candidato/gauge-pro/resultado">
                  Ver resultado completo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {(['D1', 'D2', 'D3', 'D4', 'D5'] as GaugeProDimension[]).map(dim => {
                const score = gaugeResult.finalScores[dim];
                return (
                  <div key={dim} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{DIMENSION_SHORT_NAMES[dim]}</span>
                      <span className="font-semibold" style={{ color: DIMENSION_COLORS[dim] }}>{score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${score}%`, backgroundColor: DIMENSION_COLORS[dim] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : hasOngoingAssessment ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">{TEST_CONFIG.profileLabel}</h2>
                <p className="text-sm text-muted-foreground">Você tem uma avaliação em andamento</p>
              </div>
              <Button asChild>
                <Link to="/candidato/gauge-pro">
                  Continuar Avaliação
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : null}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Tooltip key={stat.label}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft cursor-help"
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">Minhas Candidaturas</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>Histórico das suas candidaturas recentes e seus status atuais.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
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
            className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">Mensagens</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>Mensagens recebidas de recrutadores e empresas.</p>
                  </TooltipContent>
                </Tooltip>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Link to="/candidato/mensagens" className="text-sm text-secondary font-medium hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="space-y-4">
              {unreadCount > 0 ? (
                <div className="flex items-start gap-4 p-4 rounded-xl transition-colors bg-secondary/5 border border-secondary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">Mensagens pendentes</span>
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                    <div className="text-sm text-foreground">
                      Você tem {unreadCount} mensagen{unreadCount > 1 ? 's' : ''} não lida{unreadCount > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      Verifique suas mensagens
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Nenhuma mensagem nova</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/candidato/mensagens">Ver mensagens</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* PRD-036: Recommended Jobs Widget */}
        <RecommendedJobsWidget candidateId={candidate.id} />
      </div>
    </DashboardLayout>
  );
}
