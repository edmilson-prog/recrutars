/**
 * Saved Candidates Page
 * PRD-030: Candidatos Favoritos (Empresa)
 */

import { useState, useMemo } from 'react';
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
  gaugeResultsByCandidate: Map<string, GaugeProResult> = new Map()
): number => {
  if (jobs.length === 0) return 0;
  const job = jobs[0];
  const idealProfile = getOrGenerateIdealProfile(job);
  const candidateProfile = getCompositeBehavioralProfile(candidate.id, behavioralTests, gaugeResultsByCandidate);
  const matchResult = calculateMatchBreakdown(candidate, job, idealProfile, candidateProfile);
  return matchResult.totalScore;
};

export default function SavedCandidates() {
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';
  const { getFavoriteCandidates, removeFavorite, toggleFavorite } = useFavoriteCandidates();

  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [candidateToRemove, setCandidateToRemove] = useState<string | null>(null);

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
          const matchA = calculateMatch(a, companyJobs, behavioralTests, gaugeResultsByCandidate);
          const matchB = calculateMatch(b, companyJobs, behavioralTests, gaugeResultsByCandidate);
          return matchB - matchA;
        case 'experience':
          return b.experience - a.experience;
        case 'recent':
        default:
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      }
    });
  }, [filteredCandidates, sortBy, companyJobs, behavioralTests, gaugeResultsByCandidate]);

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
        const matchScore = calculateMatch(candidate, companyJobs, behavioralTests, gaugeResultsByCandidate);

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
  }, [selectedIds, savedCandidates, companyJobs, behavioralTests, gaugeResultsByCandidate]);

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

  const renderCandidateCard = (candidate: Candidate & { savedAt: string }, index: number) => {
    const matchScore = calculateMatch(candidate, companyJobs, behavioralTests, gaugeResultsByCandidate);
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
                  <h3 className="text-xl font-semibold text-foreground">
                    {displayName}
                  </h3>
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
                      onClick={() => {
                        toast.success(
                          `Convite enviado para ${displayName} para a vaga "${job.title}"`
                        );
                      }}
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-l-[3px] border-l-primary p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Candidatos Salvos</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Candidatos que você salvou do Banco de Talentos. Acesse rapidamente seus favoritos e compare perfis para agilizar o processo seletivo.
              </p>
            </div>
          </div>
        </motion.div>

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
        calculateMatch={(candidate) => calculateMatch(candidate, companyJobs, behavioralTests, gaugeResultsByCandidate)}
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
    </DashboardLayout>
  );
}
