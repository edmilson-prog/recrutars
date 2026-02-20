/**
 * Candidate Profile Page
 * PRD-014: Banco de Talentos - Perfil completo com avaliação comportamental
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Send,
  Star,
  CheckCircle,
  AlertCircle,
  Heart,
  FileText,
  MessageSquare,
  ClipboardCheck,
  StickyNote,
  Download,
  History,
  ChevronDown,
  User2,
  Award,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PracticalAnalysisCard } from '@/components/aiAnalysis';
import { TechnicalAnalysisCard } from '@/components/aiAnalysis/TechnicalAnalysisCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScheduleInterviewModal } from '@/components/empresa/ScheduleInterviewModal';
import { useCompanyInterviews } from '@/hooks/useCompanyInterviews';
import { useCandidateActivity, type ActivityType } from '@/hooks/useCandidateActivity';
import { getOrGenerateIdealProfile, gaugeProToBehavioralProfile } from '@/lib/behavioralProfiles';
import { useJobs } from '@/hooks/useJobsQuery';
import { useCandidates } from '@/hooks/useCandidatesQuery';
import { useApplications, useApplicationNotes, useAddApplicationNote } from '@/hooks/useApplicationsQuery';
import { useGaugeProResultByCandidate, useGaugeProSessionByCandidate } from '@/hooks/useGaugeProQuery';
import { GaugeProResponsesCard } from '@/components/gaugePro/GaugeProResponsesCard';
import { useProfile } from '@/hooks/useCurriculumsQuery';
import { useApplicationHighlights } from '@/hooks/useHighlightsQuery';
import { HighlightBadge } from '@/components/match/HighlightBadge';
import { DIMENSION_NAMES, DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type { GaugeProDimension } from '@/types/gaugePro';
import type { Job, ApplicationNote } from '@/types';
import { toast } from 'sonner';
import { useFavoriteCandidates } from '@/hooks/useFavoriteCandidates';
import { useAuth } from '@/contexts/AuthContext';
import { calculateMatchBreakdown } from '@/lib/matchCalculator';
import { getMatchScoreColor } from '@/types/disc';
import { MatchBreakdown } from '@/components/match/MatchBreakdown';
import { MatchStrengths } from '@/components/match/MatchStrengths';
import { MatchOpportunities } from '@/components/match/MatchOpportunities';
import { MatchMethodologyModal } from '@/components/match/MatchMethodologyModal';
import { cn } from '@/lib/utils';
import { getCandidateDisplayName, getCandidateInitials } from '@/lib/candidateDisplayName';

// Skill level colors for profile skills
const skillLevelColors: Record<string, { bg: string; text: string }> = {
  expert: { bg: 'bg-green-100', text: 'text-green-700' },
  avancado: { bg: 'bg-purple-100', text: 'text-purple-700' },
  intermediario: { bg: 'bg-slate-100', text: 'text-slate-600' },
  basico: { bg: 'bg-slate-50', text: 'text-slate-500' },
};

const getSkillLevelLabel = (level: string): string => {
  switch (level) {
    case 'expert': return 'Expert';
    case 'avancado': return 'Avançado';
    case 'intermediario': return 'Intermediário';
    case 'basico': return 'Básico';
    default: return level;
  }
};

// PRD-035: Cálculo dinâmico removido - agora usamos matchResult diretamente

const STATUS_LABELS: Record<string, string> = {
  pending: 'Novo',
  reviewing: 'Em Análise',
  interview: 'Entrevista',
  offer: 'Aprovado',
  rejected: 'Reprovado',
  hired: 'Contratado',
  withdrawn: 'Desistência',
};

const DEFAULT_TEST_MESSAGE = `Olá! Para darmos continuidade ao processo seletivo, gostaríamos que você realizasse nosso teste comportamental Gauge-Pro. O teste leva cerca de 15-20 minutos e nos ajuda a entender melhor seu perfil.`;

const DEADLINE_OPTIONS = [
  { value: '3', label: '3 dias' },
  { value: '5', label: '5 dias' },
  { value: '7', label: '7 dias' },
  { value: '14', label: '14 dias' },
  { value: 'none', label: 'Sem prazo' },
];

function getActivityDotColor(type: ActivityType): string {
  switch (type) {
    case 'application': return 'bg-blue-500';
    case 'status_change': return 'bg-purple-500';
    case 'note': return 'bg-yellow-500';
    case 'message': return 'bg-green-500';
    case 'test_request': return 'bg-cyan-500';
    default: return 'bg-muted-foreground';
  }
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'application': return <Send className="w-3.5 h-3.5" />;
    case 'status_change': return <CheckCircle className="w-3.5 h-3.5" />;
    case 'note': return <StickyNote className="w-3.5 h-3.5" />;
    case 'message': return <MessageSquare className="w-3.5 h-3.5" />;
    case 'test_request': return <ClipboardCheck className="w-3.5 h-3.5" />;
    default: return <History className="w-3.5 h-3.5" />;
  }
}

function formatActivityTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 30) return `${diffDays} dias atrás`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');

  // Actions card state
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
  const [isTestRequestModalOpen, setIsTestRequestModalOpen] = useState(false);
  const [testMessage, setTestMessage] = useState(DEFAULT_TEST_MESSAGE);
  const [testDeadline, setTestDeadline] = useState('7');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [localNotes, setLocalNotes] = useState<ApplicationNote[]>([]);

  // PRD-030: Hook de candidatos favoritos
  const { isFavorite, toggleFavorite } = useFavoriteCandidates();

  // Hooks
  const { activities, hasMore, remaining, showMore, totalCount } = useCandidateActivity(id || '');
  const { createInterview } = useCompanyInterviews(companyId);

  // Fetch data from service layer
  const { data: jobsResult } = useJobs();
  const allJobs = jobsResult?.data ?? [];
  const { data: candidatesResult } = useCandidates();
  const allCandidates = candidatesResult?.data ?? [];
  const { data: applicationsResult } = useApplications();
  const allApplications = applicationsResult?.data ?? [];

  const candidate = allCandidates.find((c) => c.id === id);

  // Fetch Gauge-Pro result + assessment (respostas reais) for this candidate
  const { data: gaugeProResult } = useGaugeProResultByCandidate(candidate?.id || '');
  const { data: gaugeProAssessment } = useGaugeProSessionByCandidate(candidate?.id || '');

  // PRD-073: Professional profile + highlights
  const { data: profile } = useProfile(candidate?.id || '');

  // Get company jobs (company-1)
  const companyJobs = useMemo(
    () => allJobs.filter((job) => job.companyId === companyId && job.status === 'active'),
    [allJobs]
  );

  // Candidate applications
  const candidateApplications = useMemo(
    () => allApplications.filter((a) => a.candidateId === id),
    [allApplications, id]
  );

  const activeApplicationId = selectedApplicationId || candidateApplications[0]?.id || '';
  const { data: highlights } = useApplicationHighlights(activeApplicationId);
  const { data: serverNotes = [] } = useApplicationNotes(activeApplicationId);
  const addNoteMutation = useAddApplicationNote();

  const selectedApplication = useMemo(
    () => candidateApplications.find((a) => a.id === selectedApplicationId) || candidateApplications[0] || null,
    [candidateApplications, selectedApplicationId]
  );

  // Existing notes: server (persisted) + local (optimistic, deduped)
  const existingNotes = useMemo(() => {
    const serverIds = new Set(serverNotes.map(n => n.id));
    const uniqueLocal = localNotes.filter(n => !serverIds.has(n.id));
    return [...serverNotes, ...uniqueLocal]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [serverNotes, localNotes]);

  if (!candidate) {
    return (
      <DashboardLayout userType="company">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Candidato não encontrado
          </h2>
          <p className="text-muted-foreground mb-4">
            O candidato solicitado não existe ou foi removido.
          </p>
          <Button asChild>
            <Link to="/empresa/candidatos">Voltar ao Banco de Talentos</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // PRD-035: Cálculo dinâmico de match (com perfil Gauge-Pro real)
  const firstJob = companyJobs[0];
  const idealProfile = firstJob ? getOrGenerateIdealProfile(firstJob) : undefined;
  const candidateBehavioralProfile = gaugeProResult
    ? gaugeProToBehavioralProfile(gaugeProResult.finalScores)
    : undefined;
  const matchResult = firstJob
    ? calculateMatchBreakdown(candidate, firstJob, idealProfile, candidateBehavioralProfile)
    : null;
  const matchScore = matchResult?.totalScore || 0;

  const handleOpenInviteModal = (job: Job) => {
    setSelectedJob(job);
    setInviteMessage('');
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = () => {
    if (!selectedJob) return;

    toast.success(
      `Convite enviado para ${getCandidateDisplayName(candidate)} para a vaga "${selectedJob.title}"`
    );
    setIsInviteModalOpen(false);
    setSelectedJob(null);
    setInviteMessage('');
  };

  const handleSendMessage = () => {
    navigate(`/empresa/mensagens?candidato=${id}`);
  };

  const handleRequestTest = () => {
    if (!selectedApplication) return;
    toast.success(`Solicitação de teste enviada para ${getCandidateDisplayName(candidate)}`);
    setIsTestRequestModalOpen(false);
    setTestMessage(DEFAULT_TEST_MESSAGE);
    setTestDeadline('7');
  };

  const handleScheduleInterview = (data: Parameters<typeof createInterview>[0]) => {
    createInterview(data);
    toast.success(`Entrevista agendada com ${getCandidateDisplayName(candidate)}`);
    setIsScheduleModalOpen(false);
  };

  const handleAddNote = () => {
    if (!noteText.trim() || !selectedApplication) return;
    const newNote: ApplicationNote = {
      id: `note-local-${Date.now()}`,
      applicationId: selectedApplication.id,
      content: noteText.trim(),
      author: 'Você',
      createdAt: new Date().toISOString(),
    };
    setLocalNotes((prev) => [...prev, newNote]);
    addNoteMutation.mutate({
      applicationId: selectedApplication.id,
      content: noteText.trim(),
    });
    setNoteText('');
    setShowNoteInput(false);
    toast.success('Anotação adicionada');
  };

  const handleExportProfile = () => {
    toast.success('Exportação do perfil iniciada. O arquivo será enviado por email.');
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/empresa/candidatos')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Banco de Talentos
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24 flex-shrink-0">
              <AvatarImage src={candidate.avatar} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getCandidateInitials(candidate)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {getCandidateDisplayName(candidate)}
                  </h1>
                  <p className="text-lg text-muted-foreground">{candidate.title}</p>

                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {candidate.experience} ano{candidate.experience !== 1 ? 's' : ''}{' '}
                      de experiência
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {candidate.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {matchScore > 0 && (
                      <Badge
                        className={`${getMatchScoreColor(matchScore).bg} ${getMatchScoreColor(matchScore).text} border ${getMatchScoreColor(matchScore).border}`}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {matchScore}% match com suas vagas
                      </Badge>
                    )}
                    {/* PRD-030: Botão de favoritar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const isNowFavorite = toggleFavorite(candidate.id);
                        toast.success(
                          isNowFavorite
                            ? 'Candidato salvo!'
                            : 'Candidato removido dos salvos'
                        );
                      }}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isFavorite(candidate.id)
                            ? 'fill-destructive text-destructive'
                            : 'text-muted-foreground hover:text-destructive'
                        }`}
                      />
                    </Button>
                  </div>

                  {companyJobs.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button>
                          <Send className="w-4 h-4 mr-2" />
                          Convidar para vaga
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {companyJobs.map((job) => (
                          <DropdownMenuItem
                            key={job.id}
                            onClick={() => handleOpenInviteModal(job)}
                          >
                            {job.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button disabled>
                      <Send className="w-4 h-4 mr-2" />
                      Sem vagas ativas
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Behavioral Profile — Gauge-Pro 5 Dimensions */}
            {gaugeProResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-xl">Perfil Comportamental</span>
                      <Badge variant="secondary">
                        {gaugeProResult.archetype.name}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 5 Dimension Bars */}
                    <div className="space-y-3">
                      {(['D1', 'D2', 'D3', 'D4', 'D5'] as GaugeProDimension[]).map((dim) => {
                        const score = gaugeProResult.finalScores[dim];
                        const classification = gaugeProResult.classifications[dim];
                        const classColors: Record<string, string> = {
                          low: 'bg-blue-100 text-blue-700',
                          medium: 'bg-amber-100 text-amber-700',
                          high: 'bg-green-100 text-green-700',
                        };
                        const barColors: Record<string, string> = {
                          D1: '#ef4444', D2: '#f59e0b', D3: '#22c55e', D4: '#3b82f6', D5: '#8b5cf6',
                        };
                        return (
                          <div key={dim} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{DIMENSION_SHORT_NAMES[dim]}</span>
                                <span className="text-xs text-muted-foreground">{DIMENSION_NAMES[dim]}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold" style={{ color: barColors[dim] }}>
                                  {score}%
                                </span>
                                <Badge variant="secondary" className={cn('text-xs', classColors[classification])}>
                                  {classification === 'low' ? 'Baixo' : classification === 'medium' ? 'Médio' : 'Alto'}
                                </Badge>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div
                                className="h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${score}%`, backgroundColor: barColors[dim] }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left column: Strengths & Development */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-success" />
                            Pontos Fortes
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {gaugeProResult.strengths.map((strength) => (
                              <Badge key={strength} variant="outline" className="text-success border-success/30">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {gaugeProResult.developmentAreas.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-warning" />
                              Áreas de Desenvolvimento
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {gaugeProResult.developmentAreas.map((area) => (
                                <Badge key={area} variant="outline" className="text-warning border-warning/30">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right column: Archetype Summary */}
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          Resumo da Avaliação
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {gaugeProResult.archetype.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Perfil Comportamental</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Este candidato ainda não realizou o teste comportamental.</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Respostas Reais do Teste — v1.13.3 */}
            {gaugeProAssessment && gaugeProResult && gaugeProAssessment.phase === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <GaugeProResponsesCard
                  assessment={gaugeProAssessment}
                  result={gaugeProResult}
                />
              </motion.div>
            )}

            {/* AI Analysis - PRD-051 */}
            {(gaugeProResult || candidate.hasTest) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-4"
              >
                <TechnicalAnalysisCard
                  candidateId={candidate.id}
                  candidateName={getCandidateDisplayName(candidate)}
                />
                <PracticalAnalysisCard
                  candidateId={candidate.id}
                  candidateName={getCandidateDisplayName(candidate)}
                />
              </motion.div>
            )}

            {/* Experience — PRD-073: real profile data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Experiência Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile && profile.experiences.length > 0 ? (
                    <div className="space-y-4">
                      {profile.experiences.map((exp, index) => {
                        const isHighlighted = highlights?.experienceIds.includes(exp.id);
                        return (
                          <div
                            key={exp.id}
                            className={`relative pl-6 ${
                              index !== profile.experiences.length - 1
                                ? 'border-l-2 border-muted pb-4'
                                : ''
                            }`}
                          >
                            <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-primary" />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold">{exp.role}</h4>
                                {exp.current && (
                                  <Badge variant="secondary" className="text-xs">
                                    Atual
                                  </Badge>
                                )}
                                {isHighlighted && <HighlightBadge />}
                              </div>
                              <p className="text-muted-foreground">{exp.company}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {exp.startDate} - {exp.endDate || 'Presente'}
                              </p>
                              {exp.description && (
                                <p className="text-sm mt-2">{exp.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {candidate.experience} ano{candidate.experience !== 1 ? 's' : ''} de experiência como {candidate.title}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Education — PRD-073: real profile data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Formação Acadêmica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile && profile.education.length > 0 ? (
                    <div className="space-y-4">
                      {profile.education.map((edu) => {
                        const isHighlighted = highlights?.educationIds.includes(edu.id);
                        return (
                          <div key={edu.id} className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{edu.degree} em {edu.field}</h4>
                              {isHighlighted && <HighlightBadge />}
                            </div>
                            <p className="text-muted-foreground">{edu.institution}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.startYear} - {edu.endYear || 'Em andamento'}
                              {edu.status && ` (${edu.status})`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-semibold">{candidate.education}</h4>
                      <p className="text-muted-foreground">Instituição de Ensino</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Courses — PRD-073: new section */}
            {profile && profile.courses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Cursos e Certificações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.courses.map((course) => {
                        const isHighlighted = highlights?.courseIds.includes(course.id);
                        return (
                          <div key={course.id} className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium text-sm">{course.name}</h4>
                                {isHighlighted && <HighlightBadge />}
                              </div>
                              <p className="text-xs text-muted-foreground">{course.institution} ({course.year})</p>
                            </div>
                            {course.hours && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {course.hours}h
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Activity History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Histórico de Atividades
                    </span>
                    {totalCount > 0 && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {totalCount} atividade{totalCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Nenhuma atividade registrada para este candidato.</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {activities.map((activity, index) => (
                        <div
                          key={activity.id}
                          className={`relative pl-7 ${
                            index !== activities.length - 1 ? 'border-l-2 border-muted ml-[7px] pb-5' : 'ml-[7px]'
                          }`}
                        >
                          {/* Dot */}
                          <div
                            className={`absolute left-0 top-0.5 w-4 h-4 -translate-x-[9px] rounded-full ${getActivityDotColor(activity.type)} flex items-center justify-center text-white`}
                          >
                            {getActivityIcon(activity.type)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-foreground leading-tight">
                                {activity.title}
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                {formatActivityTimestamp(activity.timestamp)}
                              </span>
                            </div>

                            {activity.jobTitle && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Vaga: {activity.jobTitle}
                              </p>
                            )}

                            {activity.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                "{activity.description}"
                              </p>
                            )}

                            {activity.actor && (
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <User2 className="w-3 h-3" />
                                {activity.actor}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                      {hasMore && (
                        <div className="pt-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={showMore}
                            className="text-muted-foreground"
                          >
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Mostrar mais ({remaining} restante{remaining !== 1 ? 's' : ''})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* PRD-035: Match Breakdown */}
            {matchResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <MatchBreakdown
                  totalScore={matchResult.totalScore}
                  categories={matchResult.categories}
                  title={`Match com ${firstJob?.title || 'vaga'}`}
                />
                <div className="flex justify-end">
                  <MatchMethodologyModal />
                </div>
              </motion.div>
            )}

            {/* PRD-035: Strengths and Opportunities */}
            {matchResult && matchResult.strengths.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <MatchStrengths
                  strengths={matchResult.strengths}
                  maxItems={3}
                  compact
                />
              </motion.div>
            )}

            {matchResult && matchResult.opportunities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <MatchOpportunities
                  opportunities={matchResult.opportunities}
                  maxItems={2}
                />
              </motion.div>
            )}

            {/* Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Ações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Application selector */}
                  {candidateApplications.length > 1 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Candidatura</Label>
                      <Select
                        value={selectedApplicationId || candidateApplications[0]?.id}
                        onValueChange={setSelectedApplicationId}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecionar candidatura" />
                        </SelectTrigger>
                        <SelectContent>
                          {candidateApplications.map((app) => (
                            <SelectItem key={app.id} value={app.id} className="text-xs">
                              {app.jobTitle} - {STATUS_LABELS[app.status] || app.status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Send Message */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleSendMessage}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>

                  {/* Invite to Job */}
                  {companyJobs.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Send className="w-4 h-4 mr-2" />
                          Convidar para Vaga
                          <ChevronDown className="w-3 h-3 ml-auto" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {companyJobs.map((job) => (
                          <DropdownMenuItem
                            key={job.id}
                            onClick={() => handleOpenInviteModal(job)}
                          >
                            {job.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                      <Send className="w-4 h-4 mr-2" />
                      Sem vagas ativas
                    </Button>
                  )}

                  {/* Context-dependent actions */}
                  {candidateApplications.length > 0 ? (
                    <>
                      {/* Request Test - only if candidate has no test */}
                      {!candidate.hasTest && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setIsTestRequestModalOpen(true)}
                        >
                          <ClipboardCheck className="w-4 h-4 mr-2" />
                          Solicitar Teste
                        </Button>
                      )}

                      {/* Schedule Interview */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setIsScheduleModalOpen(true)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar Entrevista
                      </Button>

                      {/* Add Note */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setShowNoteInput(!showNoteInput)}
                      >
                        <StickyNote className="w-4 h-4 mr-2" />
                        Adicionar Anotação
                      </Button>

                      {/* Inline note input */}
                      {showNoteInput && (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Escreva sua anotação..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            rows={3}
                            className="text-xs resize-none"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleAddNote} disabled={!noteText.trim()}>
                              Salvar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => { setShowNoteInput(false); setNoteText(''); }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Recent notes preview */}
                      {existingNotes.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {existingNotes.slice(0, 2).map((note) => (
                            <div key={note.id} className="bg-muted/50 rounded-md p-2 text-xs">
                              <p className="text-muted-foreground line-clamp-2">{note.content}</p>
                              <p className="text-muted-foreground/60 mt-1">
                                {note.author} - {formatActivityTimestamp(note.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">
                      Este candidato não possui candidaturas ativas. Algumas ações estão desabilitadas.
                    </p>
                  )}

                  <Separator />

                  {/* Export */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground"
                    onClick={handleExportProfile}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Perfil
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills — PRD-073: real profile data with levels */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile && profile.skills.length > 0
                      ? profile.skills.map((skill) => {
                          const isHighlighted = highlights?.skillIds.includes(skill.id);
                          const colors = skillLevelColors[skill.level] || skillLevelColors.intermediario;
                          return (
                            <span
                              key={skill.id}
                              className={cn(
                                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium gap-1",
                                colors.bg,
                                colors.text
                              )}
                            >
                              {skill.name}
                              <span className="opacity-70">({getSkillLevelLabel(skill.level)})</span>
                              {isHighlighted && <Star className="w-3 h-3 fill-amber-500 text-amber-500 ml-0.5" />}
                            </span>
                          );
                        })
                      : candidate.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600"
                          >
                            {skill}
                          </span>
                        ))
                    }
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Disponibilidade</p>
                      <p className="font-medium">{candidate.availability}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pretensão Salarial
                      </p>
                      <p className="font-medium">
                        R$ {candidate.salary.min.toLocaleString('pt-BR')} - R${' '}
                        {candidate.salary.max.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Perfil completo</p>
                      <Progress
                        value={candidate.profileCompletion}
                        className="h-2 mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {candidate.profileCompletion}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar candidato</DialogTitle>
            <DialogDescription>
              Envie um convite para {getCandidateDisplayName(candidate)} se candidatar à vaga "
              {selectedJob?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Mensagem personalizada (opcional)
              </label>
              <Textarea
                placeholder="Escreva uma mensagem personalizada para o candidato..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                {inviteMessage.length}/500 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendInvite}>
              <Send className="w-4 h-4 mr-2" />
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Request Modal */}
      <Dialog open={isTestRequestModalOpen} onOpenChange={setIsTestRequestModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Teste Comportamental</DialogTitle>
            <DialogDescription>
              Candidato: {getCandidateDisplayName(candidate)}
              {selectedApplication && ` | Vaga: ${selectedApplication.jobTitle}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {candidateApplications.length > 1 && (
              <div className="space-y-2">
                <Label>Candidatura</Label>
                <Select
                  value={selectedApplicationId || candidateApplications[0]?.id}
                  onValueChange={setSelectedApplicationId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar candidatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidateApplications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.jobTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="testMessageProfile">Mensagem para o candidato</Label>
              <Textarea
                id="testMessageProfile"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                maxLength={500}
                className="resize-none"
                rows={5}
              />
              <p className="text-xs text-muted-foreground text-right">
                {testMessage.length}/500 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testDeadlineProfile">Prazo para realização</Label>
              <Select value={testDeadline} onValueChange={setTestDeadline}>
                <SelectTrigger id="testDeadlineProfile">
                  <SelectValue placeholder="Selecione o prazo" />
                </SelectTrigger>
                <SelectContent>
                  {DEADLINE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestRequestModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestTest}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Modal */}
      {selectedApplication && (
        <ScheduleInterviewModal
          open={isScheduleModalOpen}
          onOpenChange={setIsScheduleModalOpen}
          candidateId={candidate.id}
          candidateName={getCandidateDisplayName(candidate)}
          jobId={selectedApplication.jobId}
          jobTitle={selectedApplication.jobTitle}
          applicationId={selectedApplication.id}
          onSchedule={handleScheduleInterview}
        />
      )}
    </DashboardLayout>
  );
}
