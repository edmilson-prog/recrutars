/**
 * Saved Candidates Page
 * PRD-030: Candidatos Favoritos (Empresa)
 */

import { useState, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getStandardizedSkillsService } from '@/services/standardizedSkills/standardizedSkillsService';
import { standardizedSkillKeys } from '@/hooks/useStandardizedSkillsQuery';
import type { MatchSkillsInput } from '@/types/disc';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  ArrowUpDown,
  Trash2,
  Send,
  ChevronRight,
  Users,
  EyeOff,
  GitCompare,
  FileDown,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useFavoriteCandidates, formatCandidateSavedAt } from '@/hooks/useFavoriteCandidates';
import { getCompositeBehavioralProfile, getOrGenerateIdealProfile } from '@/lib/behavioralProfiles';
import { calculateMatchBreakdown } from '@/lib/matchCalculator';
import { useBehavioralTests } from '@/hooks/useBehavioralTestsQuery';
import { useAllGaugeProResults } from '@/hooks/useGaugeProQuery';
import { useJobs } from '@/hooks/useJobsQuery';
import type { Candidate, Job } from '@/types';
import type { GaugeProResult } from '@/types/gaugePro';
import type { CandidateForComparison } from '@/types/disc';
import {
  isAnonymous,
  getDisplayName,
  getDisplayAvatar,
} from '@/utils/visibility';
import { Checkbox } from '@/components/ui/checkbox';
import { useCandidateSelection, SelectionBar } from '@/components/compare/CandidateSelector';
import { CandidateComparisonModal } from '@/components/compare/CandidateComparison';
// PRD-032: Exportação de candidatos
import { ExportCandidatesModal } from '@/components/export';
import type { ExportContext } from '@/types/export';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateApplication } from '@/hooks/useApplicationsQuery';
import { useCreateConversation, useSendMessage } from '@/hooks/useMessagesQuery';

type SortOption = 'recent' | 'match' | 'experience';

// Helper to get all unique areas from candidates
const getUniqueAreas = (candidates: Candidate[]): string[] => {
  const areas = new Set<string>();
  candidates.forEach((c) => {
    if (!c.title) return;
    // Usar o título do candidato como área
    const area = c.title.split(' ')[0]; // Pegar primeira palavra
    if (area) areas.add(area);
  });
  return Array.from(areas).sort();
};

// PRD-035: Cálculo dinâmico de match usando matchCalculator (mesmo de Candidates.tsx)
const calculateMatch = (
  candidate: Candidate,
  jobs: Job[],
  behavioralTests: Array<{ candidateId: string; status: string; result?: { dominance: number; influence: number; steadiness: number; compliance: number } | null }> = [],
  gaugeResultsByCandidate: Map<string, GaugeProResult> = new Map(),
  buildSkillsInput?: (candidateId: string, jobId: string) => MatchSkillsInput | undefined
): number => {
  if (jobs.length === 0) return 0;
  const job = jobs[0];
  const idealProfile = getOrGenerateIdealProfile(job);
  const candidateProfile = getCompositeBehavioralProfile(candidate.id, behavioralTests, gaugeResultsByCandidate);
  const skillsInput = buildSkillsInput ? buildSkillsInput(candidate.id, job.id) : undefined;
  const matchResult = calculateMatchBreakdown(candidate, job, idealProfile, candidateProfile, skillsInput);
  return matchResult.totalScore;
};

export default function SavedCandidates() {
  const navigate = useNavigate();
  const { user, currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';
  const { getFavoriteCandidates, removeFavorite, toggleFavorite } = useFavoriteCandidates();
  const createApplicationMutation = useCreateApplication();
  const createConversationMutation = useCreateConversation();
  const sendMessageMutation = useSendMessage();

  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [candidateToRemove, setCandidateToRemove] = useState<string | null>(null);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // PRD-031: Hook de seleção para comparação
  const {
    selectedIds,
    toggleCandidate: toggleCompareCandidate,
    clearSelection,
    isSelected: isSelectedForComparison,
    canSelect,
  } = useCandidateSelection(3);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // PRD-032: Estado do modal de exportação
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch data from service layer
  const { data: jobsResult } = useJobs();
  const allJobs = jobsResult?.data ?? [];
  const { data: behavioralTests = [] } = useBehavioralTests();
  const { data: allGaugeResults = [] } = useAllGaugeProResults();

  const gaugeResultsByCandidate = useMemo(() => {
    const map = new Map<string, GaugeProResult>();
    allGaugeResults.forEach(r => {
      if (!map.has(r.candidateId)) map.set(r.candidateId, r);
    });
    return map;
  }, [allGaugeResults]);

  // Get company jobs
  const companyJobs = useMemo(() =>
    allJobs.filter((job) => job.companyId === companyId && job.status === 'active'),
    [allJobs]
  );

  // Obter candidatos salvos com dados
  const savedCandidates = useMemo(() => {
    return getFavoriteCandidates();
  }, [getFavoriteCandidates]);

  // Standardized skills queries for saved candidates and company jobs
  const candidateSkillsQueries = useQueries({
    queries: savedCandidates.map((c) => ({
      queryKey: standardizedSkillKeys.candidateSkills(c.id),
      queryFn: async () => {
        const service = await getStandardizedSkillsService();
        return service.getCandidateSkills(c.id);
      },
      enabled: !!c.id,
    })),
  });

  const jobSkillsQueries = useQueries({
    queries: companyJobs.map((j) => ({
      queryKey: standardizedSkillKeys.jobSkills(j.id),
      queryFn: async () => {
        const service = await getStandardizedSkillsService();
        return service.getJobSkills(j.id);
      },
      enabled: !!j.id,
    })),
  });

  const candidateSkillsMap = useMemo(() => {
    const m = new Map<string, { tech: string[]; beh: string[] }>();
    savedCandidates.forEach((c, i) => {
      const data = candidateSkillsQueries[i]?.data;
      if (data) {
        m.set(c.id, {
          tech: data.filter((s) => s.skill?.type === 'technical').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
          beh: data.filter((s) => s.skill?.type === 'behavioral').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
        });
      }
    });
    return m;
  }, [savedCandidates, candidateSkillsQueries]);

  const jobSkillsMap = useMemo(() => {
    const m = new Map<string, { tech: string[]; beh: string[] }>();
    companyJobs.forEach((j, i) => {
      const data = jobSkillsQueries[i]?.data;
      if (data) {
        m.set(j.id, {
          tech: data.filter((s) => s.skill?.type === 'technical').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
          beh: data.filter((s) => s.skill?.type === 'behavioral').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
        });
      }
    });
    return m;
  }, [companyJobs, jobSkillsQueries]);

  const buildSkillsInput = (candidateId: string, jobId: string): MatchSkillsInput | undefined => {
    const c = candidateSkillsMap.get(candidateId);
    const j = jobSkillsMap.get(jobId);
    if (!c || !j) return undefined;
    return {
      candidateTechnical: c.tech,
      candidateBehavioral: c.beh,
      jobTechnical: j.tech,
      jobBehavioral: j.beh,
    };
  };

  // Filtrar por área
  const filteredCandidates = useMemo(() => {
    if (areaFilter === 'all') return savedCandidates;
    return savedCandidates.filter((c) =>
      c.title.toLowerCase().includes(areaFilter.toLowerCase())
    );
  }, [savedCandidates, areaFilter]);

  // Ordenar candidatos
  const sortedCandidates = useMemo(() => {
    return [...filteredCandidates].sort((a, b) => {
      switch (sortBy) {
        case 'match':
          const matchA = calculateMatch(a, companyJobs, behavioralTests, gaugeResultsByCandidate, buildSkillsInput);
          const matchB = calculateMatch(b, companyJobs, behavioralTests, gaugeResultsByCandidate, buildSkillsInput);
          return matchB - matchA;
        case 'experience':
          return b.experience - a.experience;
        case 'recent':
        default:
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCandidates, sortBy, companyJobs, behavioralTests, gaugeResultsByCandidate, candidateSkillsMap, jobSkillsMap]);

  // Áreas disponíveis para filtro
  const availableAreas = useMemo(() => {
    return getUniqueAreas(savedCandidates);
  }, [savedCandidates]);

  // PRD-031: Candidatos selecionados para comparação
  const selectedCandidatesForComparison = useMemo((): CandidateForComparison[] => {
    return selectedIds
      .map((id) => {
        const candidate = savedCandidates.find((c) => c.id === id);
        if (!candidate) return null;

        const behavioralProfile = getCompositeBehavioralProfile(candidate.id, behavioralTests, gaugeResultsByCandidate);
        const matchScore = calculateMatch(candidate, companyJobs, behavioralTests, gaugeResultsByCandidate, buildSkillsInput);

        return {
          id: candidate.id,
          name: candidate.name,
          avatar: candidate.avatar,
          matchScore,
          behavioralProfile,
          metrics: {},
          // PRD-031: Campos adicionais
          experienceYears: candidate.experience,
          currentRole: candidate.title,
          education: candidate.education,
          skills: candidate.skills,
          salary: candidate.salary,
          availability: candidate.availability,
          location: candidate.location,
        };
      })
      .filter((c): c is CandidateForComparison => c !== null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, savedCandidates, companyJobs, behavioralTests, gaugeResultsByCandidate, candidateSkillsMap, jobSkillsMap]);

  const handleToggleFavorite = (candidateId: string) => {
    const isNowFavorite = toggleFavorite(candidateId);
    toast.success(isNowFavorite ? 'Candidato salvo!' : 'Candidato removido dos salvos');
  };

  const handleRemoveConfirm = () => {
    if (candidateToRemove) {
      removeFavorite(candidateToRemove);
      toast.success('Candidato removido da lista');
      setCandidateToRemove(null);
    }
  };

  const handleOpenInviteModal = (candidate: Candidate, job: Job) => {
    setSelectedCandidate(candidate);
    setSelectedJob(job);
    setInviteMessage('');
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = async () => {
    if (!selectedCandidate || !selectedJob || !currentCompany) return;

    setIsSendingInvite(true);
    try {
      const displayName = getDisplayName(selectedCandidate);
      await createApplicationMutation.mutateAsync({
        jobId: selectedJob.id,
        candidateId: selectedCandidate.id,
        candidateName: displayName,
        jobTitle: selectedJob.title,
        companyName: currentCompany.name ?? '',
        message: inviteMessage || undefined,
      });

      try {
        const conversation = await createConversationMutation.mutateAsync({
          candidateId: selectedCandidate.id,
          companyId: currentCompany.id,
          jobId: selectedJob.id,
        });

        const messageContent = inviteMessage.trim()
          || `Olá! Você foi convidado(a) a se candidatar à vaga "${selectedJob.title}". Acesse suas candidaturas para mais detalhes.`;

        await sendMessageMutation.mutateAsync({
          conversationId: conversation.id,
          message: {
            senderId: user?.id ?? '',
            senderName: currentCompany.name ?? '',
            senderType: 'company',
            receiverName: displayName,
            subject: `Convite: ${selectedJob.title}`,
            content: messageContent,
          },
        });
      } catch (msgError) {
        console.warn('[handleSendInvite] Candidatura criada, mas erro ao enviar mensagem:', msgError);
      }

      toast.success(`Convite enviado para ${displayName} para a vaga "${selectedJob.title}"`);
      setIsInviteModalOpen(false);
      setSelectedCandidate(null);
      setSelectedJob(null);
      setInviteMessage('');
    } catch (error) {
      console.error('[handleSendInvite] Erro:', error);
      toast.error('Erro ao enviar convite. Tente novamente.');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const renderCandidateCard = (candidate: Candidate & { savedAt: string }, index: number) => {
    const matchScore = calculateMatch(candidate, companyJobs, behavioralTests, gaugeResultsByCandidate, buildSkillsInput);
    const candidateIsAnonymous = isAnonymous(candidate);
    const displayName = getDisplayName(candidate);
    const displayAvatar = getDisplayAvatar(candidate);

    return (
      <motion.div
        key={candidate.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* PRD-031: Checkbox para comparação */}
          <Checkbox
            checked={isSelectedForComparison(candidate.id)}
            onCheckedChange={() => toggleCompareCandidate(candidate.id)}
            disabled={!canSelect && !isSelectedForComparison(candidate.id)}
            className="flex-shrink-0 mt-1"
            aria-label={`Selecionar ${displayName} para comparação`}
          />
          {/* Avatar */}
          <Avatar className="w-16 h-16 flex-shrink-0">
            {candidateIsAnonymous ? (
              <AvatarFallback className="text-lg bg-muted text-muted-foreground">
                <EyeOff className="w-6 h-6" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={displayAvatar || undefined} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {candidate.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </AvatarFallback>
              </>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/empresa/candidatos/${candidate.id}`}>
                    <h3 className="text-xl font-semibold text-foreground hover:text-primary hover:underline transition-colors cursor-pointer">
                      {displayName}
                    </h3>
                  </Link>
                  {candidateIsAnonymous && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs cursor-help">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Anônimo
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium mb-1">Perfil Anônimo</p>
                        <p className="text-xs">
                          Este candidato está em modo anônimo. Seus dados pessoais
                          serão revelados se ele aceitar seu convite.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-muted-foreground">{candidate.title}</p>
              </div>

              <div className="flex items-center gap-2">
                {matchScore > 0 && (
                  <Badge
                    variant="secondary"
                    className={
                      matchScore >= 80
                        ? 'bg-success/20 text-success'
                        : matchScore >= 60
                        ? 'bg-warning/20 text-warning'
                        : ''
                    }
                  >
                    <Star className="w-3 h-3 mr-1" />
                    {matchScore}% match
                  </Badge>
                )}
                {/* Botão de remover favorito */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToggleFavorite(candidate.id)}
                >
                  <Heart className="w-5 h-5 fill-destructive text-destructive" />
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {candidate.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {candidate.experience} ano{candidate.experience !== 1 ? 's' : ''} de experiência
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                {candidate.education}
              </span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {candidate.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 5 && (
                <Badge variant="outline">+{candidate.skills.length - 5}</Badge>
              )}
            </div>

            {/* Behavioral Profile & Saved info */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {candidate.testResult ? (
                <Badge className="bg-secondary text-secondary-foreground">
                  {candidate.testResult.result.profile}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Sem teste comportamental
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {formatCandidateSavedAt(candidate.savedAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/empresa/candidatos/${candidate.id}`}>
                Ver perfil
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>

            {companyJobs.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Convidar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {companyJobs.map((job) => (
                    <DropdownMenuItem
                      key={job.id}
                      onClick={() => handleOpenInviteModal(candidate, job)}
                    >
                      {job.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" disabled>
                <Send className="w-4 h-4 mr-2" />
                Sem vagas ativas
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setCandidateToRemove(candidate.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remover
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Candidatos Salvos"
          description="Candidatos que você salvou do Banco de Talentos. Acesse rapidamente seus favoritos e compare perfis para agilizar o processo seletivo."
          howItWorks={[
            'Candidatos que você salvou para acompanhar',
            'Organize seus favoritos por vaga ou perfil',
            'Acesse rapidamente candidatos de interesse',
          ]}
        />

        {/* Controls */}
        {savedCandidates.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <p className="text-muted-foreground">
              {filteredCandidates.length} candidato
              {filteredCandidates.length !== 1 ? 's' : ''} salvo
              {filteredCandidates.length !== 1 ? 's' : ''}
            </p>

            <div className="flex flex-wrap gap-3">
              {/* Filtro por área */}
              {availableAreas.length > 0 && (
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todas as áreas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    {availableAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Ordenação */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="match">Maior match</SelectItem>
                  <SelectItem value="experience">Mais experiência</SelectItem>
                </SelectContent>
              </Select>

              {/* PRD-032: Botão de exportar */}
              {sortedCandidates.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportModal(true)}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Lista de candidatos */}
        {sortedCandidates.length > 0 ? (
          <div className="space-y-4">
            {sortedCandidates.map((candidate, index) =>
              renderCandidateCard(candidate, index)
            )}
          </div>
        ) : (
          /* Estado vazio */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-card rounded-2xl shadow-soft"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Você ainda não salvou nenhum candidato
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explore o Banco de Talentos e clique no <Heart className="w-4 h-4 inline text-destructive" /> para
              salvar candidatos interessantes.
            </p>
            <Button asChild>
              <Link to="/empresa/candidatos">
                <Users className="w-4 h-4 mr-2" />
                Explorar Talentos
              </Link>
            </Button>
          </motion.div>
        )}
      </div>

      {/* PRD-031: Selection Bar para comparação */}
      <SelectionBar
        selectedCandidates={selectedCandidatesForComparison}
        onRemove={(id) => toggleCompareCandidate(id)}
        onClear={clearSelection}
        onCompare={() => setShowComparisonModal(true)}
      />

      {/* PRD-031: Modal de comparação */}
      <CandidateComparisonModal
        open={showComparisonModal}
        onOpenChange={setShowComparisonModal}
        candidates={selectedCandidatesForComparison}
        onInviteToInterview={(candidateId) => {
          const candidate = savedCandidates.find((c) => c.id === candidateId);
          if (candidate) {
            toast.success(`Convite enviado para ${candidate.name}`);
          }
        }}
        onContactCandidate={(candidateId) => {
          const candidate = savedCandidates.find((c) => c.id === candidateId);
          if (candidate) {
            navigate(`/empresa/mensagens?to=${candidateId}`);
          }
        }}
      />

      {/* PRD-032: Modal de exportação */}
      <ExportCandidatesModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        candidates={sortedCandidates}
        context={{
          source: 'saved_candidates',
          candidateCount: sortedCandidates.length,
          companyName: 'TechCorp Soluções',
        }}
        calculateMatch={(candidate) => calculateMatch(candidate, companyJobs, behavioralTests, gaugeResultsByCandidate, buildSkillsInput)}
      />

      {/* Dialog de confirmação de remoção */}
      <AlertDialog open={!!candidateToRemove} onOpenChange={() => setCandidateToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este candidato dos salvos?
              Você pode salvá-lo novamente a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar candidato</DialogTitle>
            <DialogDescription>
              Envie um convite para {selectedCandidate ? getDisplayName(selectedCandidate) : ''} se candidatar à vaga "
              {selectedJob?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem personalizada (opcional)</label>
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
            <Button onClick={handleSendInvite} disabled={isSendingInvite}>
              <Send className="w-4 h-4 mr-2" />
              {isSendingInvite ? 'Enviando...' : 'Enviar convite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
