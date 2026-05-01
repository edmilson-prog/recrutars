/**
 * Candidates Page - Talent Pool
 * PRD-014: Banco de Talentos
 * PRD-026: Respeita visibilidade do perfil
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getStandardizedSkillsService } from '@/services/standardizedSkills/standardizedSkillsService';
import { standardizedSkillKeys } from '@/hooks/useStandardizedSkillsQuery';
import type { MatchSkillsInput } from '@/types/disc';
import { Link } from 'react-router-dom';
import { usePaginationParams } from '@/hooks/usePaginationParams';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Briefcase,
  X,
  Filter,
  Users,
  Send,
  ChevronRight,
  Star,
  GraduationCap,
  EyeOff,
  Info,
  Heart,
  FileDown,
  TrendingUp,
  Brain,
  List,
  LayoutGrid,
  ArrowUpDown,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { getOrGenerateIdealProfile, getCompositeBehavioralProfile } from '@/lib/behavioralProfiles';
import { useBehavioralTests } from '@/hooks/useBehavioralTestsQuery';
import { useJobsByCompany } from '@/hooks/useJobsQuery';
import { useCandidates } from '@/hooks/useCandidatesQuery';
import { useAllGaugeProResults } from '@/hooks/useGaugeProQuery';
import type { GaugeProResult } from '@/types/gaugePro';
import type { Candidate, Job } from '@/types';
import type { CandidateForComparison } from '@/types/disc';
import { calculateMatchBreakdown } from '@/lib/matchCalculator';
import { getMatchScoreColor } from '@/types/disc';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { useCandidateFilters } from '@/hooks/useCandidateFilters';
import { useFavoriteCandidates } from '@/hooks/useFavoriteCandidates';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  isVisibleInSearch,
  isAnonymous,
  getDisplayName,
  getDisplayAvatar,
  getVisibilitySettings,
} from '@/utils/visibility';
// PRD-002-dgn: Componentes de comparação
import { useCandidateSelection, SelectionBar } from '@/components/compare/CandidateSelector';
import { CandidateComparisonModal } from '@/components/compare/CandidateComparison';
import { Checkbox } from '@/components/ui/checkbox';
// PRD-032: Exportação de candidatos
import { ExportCandidatesModal } from '@/components/export';
import type { ExportContext } from '@/types/export';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateApplication } from '@/hooks/useApplicationsQuery';
import { useCreateConversation, useSendMessage } from '@/hooks/useMessagesQuery';
import { JobMatchSelector } from '@/components/match/JobMatchSelector';
import { brazilianStates } from '@/data/settingsConfig';
import type { MatchResult } from '@/types/disc';

// Filter options
const legacyBehavioralProfiles = ['Executor', 'Influenciador', 'Analítico', 'Estável'];
const experienceRanges = [
  { value: '0-2', label: '0-2 anos' },
  { value: '3-5', label: '3-5 anos' },
  { value: '6-10', label: '6-10 anos' },
  { value: '10+', label: '10+ anos' },
];

const PAGE_SIZE_OPTIONS = [12, 24, 48];
const DEFAULT_PAGE_SIZE = 12;

// Helper to extract all unique skills from candidates (will be computed inside component)

// Helper to get experience range string
const getExperienceRange = (years: number): string => {
  if (years <= 2) return '0-2';
  if (years <= 5) return '3-5';
  if (years <= 10) return '6-10';
  return '10+';
};

// PRD-035: Cálculo dinâmico de match usando matchCalculator
interface CandidateJobScores {
  bestScore: number;
  bestJobId: string;
  allScores: { jobId: string; title: string; score: number }[];
}

const calculateAllJobScores = (
  candidate: Candidate,
  jobs: Job[],
  behavioralTests: Array<{ candidateId: string; status: string; result?: { dominance: number; influence: number; steadiness: number; compliance: number } | null }> = [],
  gaugeResultsByCandidate: Map<string, GaugeProResult> = new Map(),
  buildSkillsInput?: (candidateId: string, jobId: string) => MatchSkillsInput | undefined
): CandidateJobScores => {
  if (jobs.length === 0) return { bestScore: 0, bestJobId: '', allScores: [] };

  const candidateProfile = getCompositeBehavioralProfile(candidate.id, behavioralTests, gaugeResultsByCandidate);

  const allScores = jobs.map((job) => {
    const idealProfile = getOrGenerateIdealProfile(job);
    const skillsInput = buildSkillsInput ? buildSkillsInput(candidate.id, job.id) : undefined;
    const result = calculateMatchBreakdown(candidate, job, idealProfile, candidateProfile, skillsInput);
    return { jobId: job.id, title: job.title, score: result.totalScore };
  });

  // Sort by score descending
  allScores.sort((a, b) => b.score - a.score);

  return {
    bestScore: allScores[0]?.score ?? 0,
    bestJobId: allScores[0]?.jobId ?? '',
    allScores,
  };
};

// Legacy single-score helper (for export modal, comparison, etc.)
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
  return calculateMatchBreakdown(candidate, job, idealProfile, candidateProfile, skillsInput).totalScore;
};

// Match score ring indicator
const MatchRing = ({ score, label }: { score: number; label?: string }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : score >= 40 ? 'text-sky-500' : 'text-muted-foreground';

  return (
    <div className="flex-shrink-0 text-center" role="img" aria-label={`Compatibilidade ${score}%${label ? ` com ${label}` : ''}`}>
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="currentColor"
            className="text-muted/20" strokeWidth="3" />
          <circle cx="18" cy="18" r={radius} fill="none" stroke="currentColor"
            className={color} strokeWidth="3"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>
          {score}
        </span>
      </div>
      {label && (
        <span className="block text-[9px] text-muted-foreground truncate max-w-[52px] mt-0.5">
          {label}
        </span>
      )}
    </div>
  );
};

// Mini bars for multi-job scores
const MiniJobBars = ({
  allScores,
  selectedJobId,
  maxBars = 3,
}: {
  allScores: { jobId: string; title: string; score: number }[];
  selectedJobId: string;
  maxBars?: number;
}) => {
  if (allScores.length === 0) return null;

  const visibleScores = allScores.slice(0, maxBars);
  const remaining = allScores.length - maxBars;

  return (
    <div className="hidden md:flex flex-col gap-1 min-w-[180px] max-w-[220px]">
      {visibleScores.map((item) => {
        const isHighlighted =
          selectedJobId === 'best'
            ? item === allScores[0] // best score is first (already sorted)
            : item.jobId === selectedJobId;
        const barColor =
          item.score >= 80
            ? 'bg-emerald-500'
            : item.score >= 60
              ? 'bg-amber-500'
              : item.score >= 40
                ? 'bg-sky-500'
                : 'bg-muted-foreground';
        const textColor =
          item.score >= 80
            ? 'text-emerald-500'
            : item.score >= 60
              ? 'text-amber-500'
              : item.score >= 40
                ? 'text-sky-500'
                : 'text-muted-foreground';

        return (
          <div
            key={item.jobId}
            className={`flex items-center gap-1.5 text-[11px] ${
              isHighlighted ? 'px-1.5 py-0.5 rounded border border-primary/20 bg-primary/5' : ''
            }`}
          >
            <span
              className={`w-[72px] text-right truncate flex-shrink-0 ${
                isHighlighted ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
              title={item.title}
            >
              {item.title}
            </span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[40px]">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${item.score}%` }}
              />
            </div>
            <span className={`w-[30px] text-right font-medium ${textColor}`}>
              {item.score}%
            </span>
          </div>
        );
      })}
      {remaining > 0 && (
        <span className="text-[10px] text-muted-foreground text-right">
          +{remaining} vaga{remaining > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default function CompanyCandidates() {
  const { user, currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';

  // Fetch data from service layer
  const { data: jobs = [] } = useJobsByCompany(companyId);
  const { data: candidatesResult } = useCandidates(undefined, { page: 1, pageSize: 1000 });
  const allCandidates = candidatesResult?.data ?? [];
  const { data: behavioralTests = [] } = useBehavioralTests();
  const { data: allGaugeResults = [] } = useAllGaugeProResults();

  // Lookup: candidateId → GaugeProResult (latest)
  const gaugeResultsByCandidate = useMemo(() => {
    const map = new Map<string, GaugeProResult>();
    allGaugeResults.forEach(r => {
      if (!map.has(r.candidateId)) map.set(r.candidateId, r);
    });
    return map;
  }, [allGaugeResults]);

  // Dynamic behavioral profile options from real Gauge-Pro results
  const behavioralProfiles = useMemo(() => {
    const names = new Set<string>();
    allGaugeResults.forEach(r => { if (r.archetype) names.add(r.archetype.name); });
    // Also include legacy profiles for candidates with old-style tests
    legacyBehavioralProfiles.forEach(p => names.add(p));
    return Array.from(names).sort();
  }, [allGaugeResults]);

  // Filters synced with URL search params (survive navigation to candidate detail)
  const {
    searchTerm,
    stateFilter,
    locationFilter,
    profileFilter,
    experienceFilter,
    skillsFilter,
    sortBy,
    matchJobId,
    viewMode,
    setSearchTerm,
    setStateFilter,
    setLocationFilter,
    setProfileFilter,
    setExperienceFilter,
    setSkillsFilter,
    setSortBy,
    setMatchJobId,
    setViewMode,
    clearFilters,
    hasActiveFilters,
  } = useCandidateFilters();

  const [stateComboOpen, setStateComboOpen] = useState(false);
  const stateOptions = useMemo(() =>
    brazilianStates.filter(s => s.value !== '__none__'),
    []
  );

  // Dynamic location options from real candidate data (cascaded by state filter)
  const allLocations = useMemo(() => {
    const candidates = stateFilter === 'all'
      ? allCandidates
      : allCandidates.filter(c => c.state === stateFilter);
    return Array.from(new Set(
      candidates
        .map((c) => c.location)
        .filter((loc) => loc && loc.trim() !== '')
    )).sort();
  }, [allCandidates, stateFilter]);

  // Helper to extract all unique skills from candidates
  const allSkills = useMemo(() =>
    Array.from(new Set(allCandidates.flatMap((c) => c.skills))).sort(),
    [allCandidates]
  );

  // Search input: local state for responsive typing, debounced sync to URL
  const [searchInput, setSearchInput] = useState(searchTerm);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Initialize input from URL on mount / when URL changes externally (e.g. clearFilters)
  const lastUrlSearchRef = useRef(searchTerm);
  useEffect(() => {
    if (searchTerm !== lastUrlSearchRef.current) {
      lastUrlSearchRef.current = searchTerm;
      setSearchInput(searchTerm);
    }
  }, [searchTerm]);

  // Push debounced value back into URL
  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      lastUrlSearchRef.current = debouncedSearch;
      setSearchTerm(debouncedSearch);
    }
  }, [debouncedSearch, searchTerm, setSearchTerm]);

  // Cascade: reset city when state changes and city is no longer valid
  useEffect(() => {
    if (stateFilter !== 'all' && locationFilter !== 'all') {
      if (!allLocations.includes(locationFilter)) {
        setLocationFilter('all');
      }
    }
  }, [stateFilter, allLocations, locationFilter, setLocationFilter]);

  // Pagination (synced with URL search params)
  const { page: currentPage, pageSize, setPage: setCurrentPage, setPageSize, resetPage } = usePaginationParams({
    defaultPage: 1,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // PRD-002-dgn: Seleção de candidatos para comparação
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

  // PRD-030: Hook de candidatos favoritos
  const { isFavorite, toggleFavorite } = useFavoriteCandidates();
  const createApplicationMutation = useCreateApplication();
  const createConversationMutation = useCreateConversation();
  const sendMessageMutation = useSendMessage();

  // Get company jobs
  const companyJobs = useMemo(() =>
    jobs.filter((job) => job.status === 'active'),
    [jobs]
  );

  // Job skills set for matching highlight (stores lowercase)
  const jobSkillsSet = useMemo(() => {
    if (companyJobs.length === 0) return new Set<string>();
    const targetJob = matchJobId === 'best'
      ? companyJobs[0]
      : companyJobs.find((j) => j.id === matchJobId) ?? companyJobs[0];
    const reqText = targetJob.requirements.join(' ').toLowerCase();
    return new Set(
      allSkills
        .filter(skill => reqText.includes(skill.toLowerCase()))
        .map(skill => skill.toLowerCase())
    );
  }, [companyJobs, allSkills, matchJobId]);

  // Standardized skills queries for all candidates and jobs
  const candidateSkillsQueries = useQueries({
    queries: allCandidates.map((c) => ({
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
    allCandidates.forEach((c, i) => {
      const data = candidateSkillsQueries[i]?.data;
      if (data) {
        m.set(c.id, {
          tech: data.filter((s) => s.skill?.type === 'technical').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
          beh: data.filter((s) => s.skill?.type === 'behavioral').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
        });
      }
    });
    return m;
  }, [allCandidates, candidateSkillsQueries]);

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

  // Pre-compute all job scores for all candidates
  const candidateScoresMap = useMemo(() => {
    const map = new Map<string, CandidateJobScores>();
    allCandidates.forEach((candidate) => {
      map.set(
        candidate.id,
        calculateAllJobScores(candidate, companyJobs, behavioralTests, gaugeResultsByCandidate, buildSkillsInput)
      );
    });
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCandidates, companyJobs, behavioralTests, gaugeResultsByCandidate, candidateSkillsMap, jobSkillsMap]);

  // Helper to get display score for a candidate based on matchJobId
  const getDisplayScore = (candidateId: string): number => {
    const scores = candidateScoresMap.get(candidateId);
    if (!scores) return 0;
    if (matchJobId === 'best') return scores.bestScore;
    return scores.allScores.find((s) => s.jobId === matchJobId)?.score ?? 0;
  };

  // Helper to get the job label for a candidate's ring
  const getDisplayJobLabel = (candidateId: string): string => {
    if (matchJobId !== 'best') {
      const job = companyJobs.find((j) => j.id === matchJobId);
      return job?.title ?? '';
    }
    const scores = candidateScoresMap.get(candidateId);
    if (!scores || !scores.bestJobId) return '';
    const job = companyJobs.find((j) => j.id === scores.bestJobId);
    return job?.title ?? '';
  };

  // Filter candidates (PRD-026: respeita visibilidade)
  const filteredCandidates = allCandidates.filter((candidate) => {
    // PRD-026: Primeiro verificar se o candidato é visível nas buscas
    if (!isVisibleInSearch(candidate)) {
      return false;
    }

    const searchLower = debouncedSearch.toLowerCase();
    // PRD-026: Busca pelo nome exibido (pode ser anônimo)
    const displayName = getDisplayName(candidate);
    const matchesSearch =
      displayName.toLowerCase().includes(searchLower) ||
      candidate.title.toLowerCase().includes(searchLower) ||
      candidate.skills.some((s) => s.toLowerCase().includes(searchLower));

    const matchesState =
      stateFilter === 'all' || candidate.state === stateFilter;

    const matchesLocation =
      locationFilter === 'all' || candidate.location.includes(locationFilter);

    const gaugeResult = gaugeResultsByCandidate.get(candidate.id);
    const candidateProfile = gaugeResult?.archetype?.name
      ?? candidate.testResult?.result.profile;
    const matchesProfile =
      profileFilter === 'all' ||
      (candidateProfile?.toLowerCase().includes(profileFilter.toLowerCase()) ?? false);

    const matchesExperience =
      experienceFilter === 'all' ||
      getExperienceRange(candidate.experience) === experienceFilter;

    const matchesSkills =
      skillsFilter.length === 0 ||
      skillsFilter.every((s) =>
        candidate.skills.map((cs) => cs.toLowerCase()).includes(s.toLowerCase())
      );

    return (
      matchesSearch &&
      matchesState &&
      matchesLocation &&
      matchesProfile &&
      matchesExperience &&
      matchesSkills
    );
  });

  // Sorting
  const sortedCandidates = useMemo(() => {
    const sorted = [...filteredCandidates];
    switch (sortBy) {
      case 'match':
        return sorted.sort((a, b) => getDisplayScore(b.id) - getDisplayScore(a.id));
      case 'name':
        return sorted.sort((a, b) =>
          getDisplayName(a).localeCompare(getDisplayName(b), 'pt-BR')
        );
      case 'experience':
        return sorted.sort((a, b) => b.experience - a.experience);
      case 'recent':
        return sorted.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return sorted;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCandidates, sortBy, candidateScoresMap, matchJobId]);

  // Pagination
  const totalPages = Math.ceil(sortedCandidates.length / pageSize);
  const paginatedCandidates = sortedCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when sort or page size change (filter changes already reset page via useCandidateFilters)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resetPage();
  }, [sortBy, pageSize, matchJobId, resetPage]);

  // Stats bar metrics
  const statsMetrics = useMemo(() => {
    const withGauge = filteredCandidates.filter(c => gaugeResultsByCandidate.has(c.id)).length;
    const favCount = filteredCandidates.filter(c => isFavorite(c.id)).length;
    const matchScores = filteredCandidates
      .map(c => getDisplayScore(c.id))
      .filter(s => s > 0);
    const avgMatch = matchScores.length > 0
      ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
      : 0;

    return [
      { label: 'Total Candidatos', value: filteredCandidates.length, icon: Users, iconBg: 'bg-primary/10' },
      { label: 'Com Gauge-Pro', value: withGauge, icon: Brain, iconBg: 'bg-emerald-500/10' },
      { label: 'Match Médio', value: avgMatch > 0 ? `${avgMatch}%` : '—', icon: TrendingUp, iconBg: 'bg-amber-500/10' },
      { label: 'Favoritos', value: favCount, icon: Heart, iconBg: 'bg-rose-500/10' },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCandidates, gaugeResultsByCandidate, companyJobs, behavioralTests, isFavorite, candidateScoresMap, matchJobId]);

  // Active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (stateFilter !== 'all') chips.push({
      key: 'state',
      label: stateOptions.find(s => s.value === stateFilter)?.label ?? stateFilter,
      onRemove: () => setStateFilter('all'),
    });
    if (locationFilter !== 'all') chips.push({
      key: 'location', label: locationFilter, onRemove: () => setLocationFilter('all')
    });
    if (profileFilter !== 'all') chips.push({
      key: 'profile', label: profileFilter, onRemove: () => setProfileFilter('all')
    });
    if (experienceFilter !== 'all') chips.push({
      key: 'experience',
      label: experienceRanges.find(r => r.value === experienceFilter)?.label ?? experienceFilter,
      onRemove: () => setExperienceFilter('all')
    });
    skillsFilter.forEach(skill => chips.push({
      key: `skill-${skill}`, label: skill, onRemove: () => setSkillsFilter(prev => prev.filter(s => s !== skill))
    }));
    return chips;
  }, [stateFilter, stateOptions, locationFilter, profileFilter, experienceFilter, skillsFilter, setStateFilter, setLocationFilter, setProfileFilter, setExperienceFilter, setSkillsFilter]);

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
      // 1) Create application (invitation)
      const displayName = getDisplayName(selectedCandidate);
      await createApplicationMutation.mutateAsync({
        jobId: selectedJob.id,
        candidateId: selectedCandidate.id,
        candidateName: displayName,
        jobTitle: selectedJob.title,
        companyName: currentCompany.name ?? '',
        message: inviteMessage || undefined,
      });

      // 2) Create/find conversation and send invitation message
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

  const toggleSkillFilter = (skill: string) => {
    if (skillsFilter.includes(skill)) {
      setSkillsFilter(skillsFilter.filter((s) => s !== skill));
    } else {
      setSkillsFilter([...skillsFilter, skill]);
    }
  };

  // PRD-002-dgn: Converter candidato para formato de comparação
  const convertToComparisonCandidate = (candidate: Candidate): CandidateForComparison | null => {
    const behavioralProfile = getCompositeBehavioralProfile(candidate.id, behavioralTests, gaugeResultsByCandidate);

    // PRD-035: Usa cálculo dinâmico de match
    const matchScore = calculateMatch(candidate, companyJobs, behavioralTests, gaugeResultsByCandidate, buildSkillsInput);

    return {
      id: candidate.id,
      name: getDisplayName(candidate),
      avatar: getDisplayAvatar(candidate) || undefined,
      matchScore,
      behavioralProfile,
      metrics: {
        experience: candidate.experience,
        education: candidate.education,
        location: candidate.location,
        availability: candidate.availability,
        skillsCount: candidate.skills.length,
        hasTest: candidate.hasTest,
        profileCompletion: candidate.profileCompletion,
      },
    };
  };

  // PRD-002-dgn: Candidatos selecionados convertidos para comparação
  const selectedCandidatesForComparison = selectedIds
    .map((id) => {
      const candidate = allCandidates.find((c) => c.id === id);
      if (!candidate) return null;
      return convertToComparisonCandidate(candidate);
    })
    .filter((c): c is CandidateForComparison => c !== null);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Region section header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Região</span>
        <div className="border-b border-border/50 mt-1.5 mb-4" />

        <div className="space-y-4">
          {/* State (combobox) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Estado</label>
            <Popover open={stateComboOpen} onOpenChange={setStateComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={stateComboOpen}
                  className="w-full justify-between font-normal"
                >
                  {stateFilter === 'all'
                    ? 'Todos os estados'
                    : stateOptions.find(s => s.value === stateFilter)?.label}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar estado..." />
                  <CommandList>
                    <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setStateFilter('all');
                          setStateComboOpen(false);
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4', stateFilter === 'all' ? 'opacity-100' : 'opacity-0')} />
                        Todos os estados
                      </CommandItem>
                      {stateOptions.map((state) => (
                        <CommandItem
                          key={state.value}
                          value={state.label}
                          onSelect={() => {
                            setStateFilter(state.value);
                            setStateComboOpen(false);
                          }}
                        >
                          <Check className={cn('mr-2 h-4 w-4', stateFilter === state.value ? 'opacity-100' : 'opacity-0')} />
                          {state.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Location (cascaded by state) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              Localização
              {stateFilter !== 'all' && (
                <span className="bg-secondary/15 text-secondary text-xs px-1.5 py-0.5 rounded font-semibold">
                  {stateFilter}
                </span>
              )}
            </label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {allLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Behavioral Profile */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Perfil Comportamental</label>
        <Select value={profileFilter} onValueChange={setProfileFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os perfis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            {behavioralProfiles.map((profile) => (
              <SelectItem key={profile} value={profile}>
                {profile}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Experience */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Experiência</label>
        <Select value={experienceFilter} onValueChange={setExperienceFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as faixas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as faixas</SelectItem>
            {experienceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Skills</label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {allSkills.map((skill) => (
            <Badge
              key={skill}
              variant={skillsFilter.includes(skill) ? 'default' : 'outline'}
              className="cursor-pointer transition-colors"
              onClick={() => toggleSkillFilter(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Limpar filtros
        </Button>
      )}
    </div>
  );

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Banco de Talentos"
          description="Explore candidatos cadastrados na plataforma. Filtre por habilidades, localização e perfil comportamental para encontrar os melhores talentos."
          howItWorks={[
            'Explore candidatos cadastrados na plataforma',
            'Filtre por habilidades, localização e perfil comportamental',
            'Salve candidatos interessantes para acompanhar',
          ]}
        />

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsMetrics.map((m, i) => (
            <motion.div key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-soft border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${m.iconBg}`}>
                  <m.icon className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo ou skill..."
              className="pl-10 pr-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchInput('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="w-5 h-5 mr-2" />
                Filtros
                {hasActiveFilters && <Badge className="ml-2 bg-secondary">!</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar
                  </Button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Candidates List */}
          <div className="flex-1 space-y-4">
            {/* Active filter chips */}
            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilterChips.map(chip => (
                  <Badge key={chip.key} variant="secondary"
                    className="pl-3 pr-1 py-1 gap-1 cursor-pointer hover:bg-secondary/80 transition-colors">
                    {chip.label}
                    <button onClick={chip.onRemove}
                      className="ml-1 p-0.5 rounded-full hover:bg-foreground/10">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <button onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Limpar todos
                </button>
              </div>
            )}

            {/* Job match selector */}
            {companyJobs.length > 0 && (
              <JobMatchSelector
                jobs={companyJobs}
                selectedJobId={matchJobId}
                onJobChange={setMatchJobId}
                className="flex-wrap"
              />
            )}

            {/* Results count + controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">
                  {filteredCandidates.length} candidato
                  {filteredCandidates.length !== 1 ? 's' : ''} encontrado
                  {filteredCandidates.length !== 1 ? 's' : ''}
                  {matchJobId !== 'best' && companyJobs.find(j => j.id === matchJobId) && (
                    <span className="text-xs"> · ordenados por match com {companyJobs.find(j => j.id === matchJobId)?.title}</span>
                  )}
                </p>
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <SelectItem key={size} value={String(size)}>{size} por página</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                {/* Sort select */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-9">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Maior Match</SelectItem>
                    <SelectItem value="name">Nome A-Z</SelectItem>
                    <SelectItem value="experience">Mais Experiência</SelectItem>
                    <SelectItem value="recent">Mais Recentes</SelectItem>
                  </SelectContent>
                </Select>
                {/* View mode toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <button onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
                {/* PRD-032: Botão de exportar */}
                {filteredCandidates.length > 0 && (
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

            {/* Candidate cards container */}
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'space-y-4'
            }>
            {paginatedCandidates.map((candidate, index) => {
              const candidateScores = candidateScoresMap.get(candidate.id);
              const matchScore = getDisplayScore(candidate.id);
              const matchLabel = matchJobId === 'best' ? 'Melhor' : getDisplayJobLabel(candidate.id);
              // PRD-026: Verificar se candidato é anônimo
              const candidateIsAnonymous = isAnonymous(candidate);
              const displayName = getDisplayName(candidate);
              const displayAvatar = getDisplayAvatar(candidate);
              // PRD-002-dgn: Verificar se está selecionado para comparação
              const isSelectedCompare = isSelectedForComparison(candidate.id);
              const canSelectMore = canSelect;

              // Avatar ring color based on behavioral profile
              const hasGaugeResult = gaugeResultsByCandidate.has(candidate.id);
              const hasLegacyTest = !!candidate.testResult;
              const avatarRingClass = hasGaugeResult
                ? 'ring-2 ring-secondary'
                : hasLegacyTest
                  ? 'ring-2 ring-primary/50'
                  : '';

              // --- GRID MODE ---
              if (viewMode === 'grid') {
                return (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`bg-card rounded-2xl p-5 shadow-soft hover:shadow-medium hover:scale-[1.01] hover:border-primary/20 transition-all border border-transparent ${
                      isSelectedCompare ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      {/* Top row: checkbox + favorite */}
                      <div className="flex items-center justify-between w-full">
                        <Checkbox
                          checked={isSelectedCompare}
                          disabled={!isSelectedCompare && !canSelectMore}
                          onCheckedChange={() => toggleCompareCandidate(candidate.id)}
                          title={
                            !isSelectedCompare && !canSelectMore
                              ? 'Máximo de 3 candidatos para comparação'
                              : 'Selecionar para comparar'
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            const isNowFavorite = toggleFavorite(candidate.id);
                            toast.success(
                              isNowFavorite ? 'Candidato salvo!' : 'Candidato removido dos salvos'
                            );
                          }}
                        >
                          <Heart className={`w-4 h-4 transition-colors ${
                            isFavorite(candidate.id)
                              ? 'fill-destructive text-destructive'
                              : 'text-muted-foreground hover:text-destructive'
                          }`} />
                        </Button>
                      </div>

                      {/* Avatar */}
                      <Avatar className={`w-16 h-16 ${avatarRingClass}`}>
                        {candidateIsAnonymous ? (
                          <AvatarFallback className="text-lg bg-muted text-muted-foreground">
                            <EyeOff className="w-6 h-6" />
                          </AvatarFallback>
                        ) : (
                          <>
                            <AvatarImage src={displayAvatar || undefined} />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                              {candidate.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>

                      {/* Name + match ring */}
                      <div className="flex items-center gap-2">
                        {matchScore > 0 && <MatchRing score={matchScore} label={matchLabel} />}
                        <div className="min-w-0">
                          <Link to={`/empresa/candidatos/${candidate.id}${matchJobId !== 'best' ? `?jobId=${matchJobId}` : candidateScores?.bestJobId ? `?jobId=${candidateScores.bestJobId}` : ''}`}>
                            <h3 className="text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors truncate">
                              {displayName}
                            </h3>
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">{candidate.title}</p>
                        </div>
                      </div>

                      {/* Profile badge + anonymous indicator */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        {(() => {
                          const gr = gaugeResultsByCandidate.get(candidate.id);
                          if (gr?.archetype) return <Badge className="bg-secondary text-secondary-foreground text-xs">{gr.archetype.name}</Badge>;
                          if (candidate.testResult) return <Badge className="bg-secondary text-secondary-foreground text-xs">{candidate.testResult.result.profile}</Badge>;
                          return null;
                        })()}
                        {candidateIsAnonymous && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            <EyeOff className="w-2.5 h-2.5 mr-0.5" />
                            Anônimo
                          </Badge>
                        )}
                      </div>

                      {/* Compact info */}
                      <div className="flex flex-col gap-1 w-full text-xs text-muted-foreground">
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{candidate.location}</span>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 flex-shrink-0" />
                            {candidate.experience}a
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 flex-shrink-0" />
                            {candidate.education}
                          </span>
                        </div>
                      </div>

                      {/* Skills (max 4) */}
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {candidate.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill}
                            variant="outline"
                            className={`text-xs ${
                              jobSkillsSet.has(skill.toLowerCase())
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400'
                                : ''
                            }`}
                          >
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">+{candidate.skills.length - 4}</Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 w-full mt-1">
                        <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                          <Link to={`/empresa/candidatos/${candidate.id}${matchJobId !== 'best' ? `?jobId=${matchJobId}` : candidateScores?.bestJobId ? `?jobId=${candidateScores.bestJobId}` : ''}`}>
                            Ver perfil
                          </Link>
                        </Button>
                        {companyJobs.length > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" className="flex-1 text-xs">
                                <Send className="w-3 h-3 mr-1" />
                                Convidar
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              {companyJobs.map((job) => (
                                <DropdownMenuItem key={job.id} onClick={() => handleOpenInviteModal(candidate, job)}>
                                  {job.title}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button size="sm" className="flex-1 text-xs" disabled>
                            <Send className="w-3 h-3 mr-1" />
                            Sem vagas
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // --- LIST MODE (redesigned) ---
              return (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium hover:scale-[1.01] hover:border-primary/20 transition-all border border-transparent ${
                    isSelectedCompare ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Checkbox + Avatar + Match Ring */}
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelectedCompare}
                        disabled={!isSelectedCompare && !canSelectMore}
                        onCheckedChange={() => toggleCompareCandidate(candidate.id)}
                        className="mt-1"
                        title={
                          !isSelectedCompare && !canSelectMore
                            ? 'Máximo de 3 candidatos para comparação'
                            : 'Selecionar para comparar'
                        }
                      />
                      {/* PRD-026: Avatar ou ícone anônimo */}
                      <Avatar className={`w-16 h-16 flex-shrink-0 ${avatarRingClass}`}>
                        {candidateIsAnonymous ? (
                          <AvatarFallback className="text-lg bg-muted text-muted-foreground">
                            <EyeOff className="w-6 h-6" />
                          </AvatarFallback>
                        ) : (
                          <>
                            <AvatarImage src={displayAvatar || undefined} />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                              {candidate.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      {/* Match ring */}
                      {matchScore > 0 && <MatchRing score={matchScore} label={matchLabel} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link to={`/empresa/candidatos/${candidate.id}${matchJobId !== 'best' ? `?jobId=${matchJobId}` : candidateScores?.bestJobId ? `?jobId=${candidateScores.bestJobId}` : ''}`}>
                              <h3 className="text-xl font-semibold text-foreground hover:text-primary hover:underline transition-colors cursor-pointer">
                                {displayName}
                              </h3>
                            </Link>
                            {/* PRD-026: Indicador de perfil anônimo */}
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
                          {/* PRD-030: Botão de favoritar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
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
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {candidate.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {candidate.experience} ano{candidate.experience !== 1 ? 's' : ''} de
                          experiência
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {candidate.education}
                        </span>
                      </div>

                      {/* Skills with matching highlight */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {candidate.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill}
                            variant="outline"
                            className={
                              jobSkillsSet.has(skill.toLowerCase())
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400'
                                : ''
                            }
                          >
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills.length > 5 && (
                          <Badge variant="outline">
                            +{candidate.skills.length - 5}
                          </Badge>
                        )}
                      </div>

                      {/* Profile & Test Status */}
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        {(() => {
                          const gr = gaugeResultsByCandidate.get(candidate.id);
                          if (gr?.archetype) {
                            return (
                              <Badge className="bg-secondary text-secondary-foreground">
                                {gr.archetype.name}
                              </Badge>
                            );
                          }
                          if (candidate.testResult) {
                            return (
                              <Badge className="bg-secondary text-secondary-foreground">
                                {candidate.testResult.result.profile}
                              </Badge>
                            );
                          }
                          return (
                            <Badge variant="outline" className="text-muted-foreground">
                              Sem teste comportamental
                            </Badge>
                          );
                        })()}
                        <span className="text-sm text-muted-foreground">
                          Disponibilidade: {candidate.availability}
                        </span>
                      </div>
                    </div>

                    {/* Mini job bars (right side) */}
                    {candidateScores && candidateScores.allScores.length > 1 && (
                      <MiniJobBars
                        allScores={candidateScores.allScores}
                        selectedJobId={matchJobId}
                      />
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/empresa/candidatos/${candidate.id}${matchJobId !== 'best' ? `?jobId=${matchJobId}` : candidateScores?.bestJobId ? `?jobId=${candidateScores.bestJobId}` : ''}`}>
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
                    </div>
                  </div>
                </motion.div>
              );
            })}

            </div>

            {filteredCandidates.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl shadow-soft">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum candidato encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tente ajustar os filtros de busca
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                          <span className="px-3 text-muted-foreground">...</span>
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>

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

      {/* PRD-002-dgn: Barra de seleção para comparação */}
      <SelectionBar
        selectedCandidates={selectedCandidatesForComparison}
        onRemove={(id) => toggleCompareCandidate(id)}
        onClear={clearSelection}
        onCompare={() => setShowComparisonModal(true)}
      />

      {/* PRD-002-dgn: Modal de comparação */}
      <CandidateComparisonModal
        open={showComparisonModal}
        onOpenChange={setShowComparisonModal}
        candidates={selectedCandidatesForComparison}
        onInviteToInterview={(candidateId) => {
          const candidate = allCandidates.find((c) => c.id === candidateId);
          if (candidate && companyJobs.length > 0) {
            handleOpenInviteModal(candidate, companyJobs[0]);
          }
          setShowComparisonModal(false);
        }}
        onContactCandidate={(candidateId) => {
          toast.success('Redirecionando para mensagens...');
        }}
      />

      {/* PRD-032: Modal de exportação */}
      <ExportCandidatesModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        candidates={filteredCandidates}
        context={{
          source: 'talent_bank',
          candidateCount: filteredCandidates.length,
          companyName: 'TechCorp Soluções',
        }}
        calculateMatch={(candidate) => calculateMatch(candidate, companyJobs, behavioralTests, gaugeResultsByCandidate, buildSkillsInput)}
      />
    </DashboardLayout>
  );
}
