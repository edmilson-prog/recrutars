/**
 * Job Search Page
 * PRD-006: Busca e Visualização de Vagas
 * PRD-007: Indicador visual de candidatura
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaginationParams } from '@/hooks/usePaginationParams';
import { useJobSearchFilters } from '@/hooks/useJobSearchFilters';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, DollarSign, Building2, Clock, Heart, Filter, X, ArrowUpDown, CheckCircle, TrendingUp, Brain, List, LayoutGrid } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useJobs } from '@/hooks/useJobsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { getOrGenerateIdealProfile } from '@/lib/behavioralProfiles';
import type { Job } from '@/types';
import { getDisplayCompanyName } from '@/lib/anonymousJob';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { useApplications } from '@/hooks/useApplications';
import { useFavoriteJobs } from '@/hooks/useFavoriteJobs';
import { calculateMatchBreakdown } from '@/lib/matchCalculator';
import { useMemo } from 'react';
import { getMatchScoreColor } from '@/types/disc';
import { Loader2 } from 'lucide-react';
import { brazilianCitiesByState } from '@/data/brazilianCities';

const areas = ['Tecnologia', 'Produto', 'Design', 'Dados', 'Marketing', 'Comercial', 'RH', 'Financeiro'];
const levels = ['Estágio', 'Junior', 'Pleno', 'Senior', 'Especialista', 'Gerente'];

const STATE_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

const SORTED_STATES = Object.keys(brazilianCitiesByState).sort((a, b) =>
  STATE_NAMES[a].localeCompare(STATE_NAMES[b], 'pt-BR'),
);

const PAGE_SIZE_OPTIONS = [12, 24, 48];
const DEFAULT_PAGE_SIZE = 12;

type SortOption = 'recent' | 'salary-high' | 'salary-low' | 'match-high';

// Match score ring indicator
const MatchRing = ({ score }: { score: number }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : score >= 40 ? 'text-sky-500' : 'text-muted-foreground';

  return (
    <div className="relative w-10 h-10 flex-shrink-0">
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
  );
};

// Format ISO date to relative or localized string
const formatRelativeDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `há ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }
  return date.toLocaleDateString('pt-BR');
};

export default function CandidateJobSearch() {
  const navigate = useNavigate();
  const { currentCandidate } = useAuth();
  const candidateId = currentCandidate?.id ?? '';

  // Fetch all jobs from service layer
  const { data: jobsResult, isLoading: isLoadingJobs } = useJobs(
    { status: 'active' },
    { page: 1, pageSize: 500 },
  );
  const allJobs = jobsResult?.data ?? [];

  // Applications hook for checking applied status
  const { hasApplied } = useApplications(candidateId);

  // Favorites hook (PRD-024)
  const { isFavorite, toggleFavorite } = useFavoriteJobs();

  // Filters synced with URL search params (survive navigation to job detail)
  const {
    searchTerm,
    stateFilter,
    cityFilter,
    typeFilter,
    areaFilter,
    levelFilter,
    salaryRange,
    sortBy,
    viewMode,
    setSearchTerm,
    setStateFilter,
    setCityFilter,
    setTypeFilter,
    setAreaFilter,
    setLevelFilter,
    setSalaryRange,
    setSortBy,
    setViewMode,
    clearFilters,
    hasActiveFilters,
  } = useJobSearchFilters();

  // Cidades disponiveis no estado selecionado
  const cityOptions = useMemo(() => {
    if (stateFilter === 'all') return [];
    return brazilianCitiesByState[stateFilter] ?? [];
  }, [stateFilter]);

  // Search input: local state for responsive typing, debounced sync to URL
  const [searchInput, setSearchInput] = useState(searchTerm);
  const debouncedSearch = useDebounce(searchInput, 300);

  const lastUrlSearchRef = useRef(searchTerm);
  useEffect(() => {
    if (searchTerm !== lastUrlSearchRef.current) {
      lastUrlSearchRef.current = searchTerm;
      setSearchInput(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      lastUrlSearchRef.current = debouncedSearch;
      setSearchTerm(debouncedSearch);
    }
  }, [debouncedSearch, searchTerm, setSearchTerm]);

  // Pagination (synced with URL search params)
  const { page: currentPage, pageSize, setPage: setCurrentPage, setPageSize, resetPage } = usePaginationParams({
    defaultPage: 1,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeJobs = allJobs;

  // PRD-035: Cache de match scores calculados dinamicamente
  const matchScores = useMemo(() => {
    if (!currentCandidate) return {};
    const scores: Record<string, number> = {};
    for (const job of activeJobs) {
      const idealProfile = getOrGenerateIdealProfile(job);
      const result = calculateMatchBreakdown(currentCandidate, job, idealProfile);
      scores[job.id] = result.totalScore;
    }
    return scores;
  }, [currentCandidate, activeJobs]);

  // Stats bar metrics
  const statsMetrics = useMemo(() => {
    const withMatch = activeJobs.filter(j => (matchScores[j.id] || 0) > 0).length;
    const favCount = activeJobs.filter(j => isFavorite(j.id)).length;
    const scores = Object.values(matchScores).filter(s => s > 0);
    const avgMatch = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return [
      { label: 'Total Vagas', value: activeJobs.length, icon: Briefcase, iconBg: 'bg-primary/10' },
      { label: 'Com Match', value: withMatch, icon: TrendingUp, iconBg: 'bg-emerald-500/10' },
      { label: 'Match Médio', value: avgMatch > 0 ? `${avgMatch}%` : '—', icon: Brain, iconBg: 'bg-amber-500/10' },
      { label: 'Favoritas', value: favCount, icon: Heart, iconBg: 'bg-rose-500/10' },
    ];
  }, [activeJobs, matchScores, isFavorite]);

  // Filter jobs
  const filteredJobs = activeJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          getDisplayCompanyName(job).toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          job.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesState = stateFilter === 'all' || job.state === stateFilter;
    const matchesCity = cityFilter === 'all' || job.city === cityFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesArea = areaFilter === 'all' || job.area === areaFilter;
    const matchesLevel = levelFilter === 'all' || job.level === levelFilter;
    const matchesSalary = job.salary.min >= salaryRange[0] && job.salary.max <= salaryRange[1];

    return matchesSearch && matchesState && matchesCity && matchesType && matchesArea && matchesLevel && matchesSalary;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'salary-high':
        return b.salary.max - a.salary.max;
      case 'salary-low':
        return a.salary.min - b.salary.min;
      case 'match-high':
        return (matchScores[b.id] || 0) - (matchScores[a.id] || 0);
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedJobs.length / pageSize);
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when sort or page size change (filter changes already reset page via useJobSearchFilters)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resetPage();
  }, [sortBy, pageSize, resetPage]);

  const toggleSaveJob = (jobId: string) => {
    const isNowFavorite = toggleFavorite(jobId);
    toast.success(isNowFavorite ? 'Vaga salva!' : 'Vaga removida');
  };

  // Active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (stateFilter !== 'all') chips.push({
      key: 'state',
      label: STATE_NAMES[stateFilter] ?? stateFilter,
      // Limpar estado tambem limpa cidade (cascata)
      onRemove: () => setStateFilter('all'),
    });
    if (cityFilter !== 'all') chips.push({
      key: 'city', label: cityFilter, onRemove: () => setCityFilter('all')
    });
    if (typeFilter !== 'all') chips.push({
      key: 'type',
      label: typeFilter === 'remote' ? 'Remoto' : typeFilter === 'hybrid' ? 'Híbrido' : 'Presencial',
      onRemove: () => setTypeFilter('all')
    });
    if (areaFilter !== 'all') chips.push({
      key: 'area', label: areaFilter, onRemove: () => setAreaFilter('all')
    });
    if (levelFilter !== 'all') chips.push({
      key: 'level', label: levelFilter, onRemove: () => setLevelFilter('all')
    });
    if (salaryRange[0] > 0 || salaryRange[1] < 30000) chips.push({
      key: 'salary',
      label: `R$ ${salaryRange[0].toLocaleString('pt-BR')} - ${salaryRange[1].toLocaleString('pt-BR')}`,
      onRemove: () => setSalaryRange([0, 30000])
    });
    return chips;
  }, [stateFilter, cityFilter, typeFilter, areaFilter, levelFilter, salaryRange, setStateFilter, setCityFilter, setTypeFilter, setAreaFilter, setLevelFilter, setSalaryRange]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Estado */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Estado</label>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            {SORTED_STATES.map(uf => (
              <SelectItem key={uf} value={uf}>{STATE_NAMES[uf]} ({uf})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cidade (em cascata, depende do estado) */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Cidade</label>
        <Select
          value={cityFilter}
          onValueChange={setCityFilter}
          disabled={stateFilter === 'all'}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                stateFilter === 'all' ? 'Escolha o estado primeiro' : 'Todas as cidades'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {cityOptions.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Work Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Modalidade</label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="remote">Remoto</SelectItem>
            <SelectItem value="hybrid">Híbrido</SelectItem>
            <SelectItem value="onsite">Presencial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Area */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Área</label>
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as áreas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as áreas</SelectItem>
            {areas.map(area => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Nível</label>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os níveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            {levels.map(level => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Salary Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Faixa salarial</label>
        <div className="pt-2 px-2">
          <Slider
            value={salaryRange}
            onValueChange={setSalaryRange}
            max={30000}
            min={0}
            step={1000}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>R$ {salaryRange[0].toLocaleString('pt-BR')}</span>
          <span>R$ {salaryRange[1].toLocaleString('pt-BR')}</span>
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
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Buscar Vagas"
          description="Encontre a oportunidade ideal para sua carreira"
          howItWorks={[
            'Encontre vagas ideais para sua carreira',
            'Filtre por área, localização e modelo de trabalho',
            'Candidate-se diretamente pela plataforma',
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
              placeholder="Buscar por cargo, empresa ou palavra-chave..."
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
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-secondary">!</Badge>
                )}
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
            <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft sticky top-6">
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

          {/* Jobs List */}
          <div className="flex-1 space-y-4">
            {/* Loading */}
            {isLoadingJobs && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

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

            {/* Results count + controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">
                  {sortedJobs.length} vaga{sortedJobs.length !== 1 ? 's' : ''} encontrada{sortedJobs.length !== 1 ? 's' : ''}
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
                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[180px] h-9">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match-high">Maior Match</SelectItem>
                    <SelectItem value="recent">Mais Recentes</SelectItem>
                    <SelectItem value="salary-high">Maior Salário</SelectItem>
                    <SelectItem value="salary-low">Menor Salário</SelectItem>
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
              </div>
            </div>

            {/* Job cards container */}
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'space-y-4'
            }>
            {paginatedJobs.map((job, index) => {
              const jobMatchScore = matchScores[job.id] || 0;
              const typeLabel = job.type === 'remote' ? 'Remoto' : job.type === 'hybrid' ? 'Híbrido' : 'Presencial';

              // --- GRID MODE ---
              if (viewMode === 'grid') {
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-medium hover:scale-[1.01] hover:border-primary/20 transition-all border border-transparent cursor-pointer group"
                    onClick={() => navigate(`/candidato/vagas/${job.id}`)}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Top: icon + favorite */}
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Heart className={`w-4 h-4 transition-colors ${isFavorite(job.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                        </button>
                      </div>

                      {/* Title + company + match ring */}
                      <div className="flex items-center gap-2">
                        {jobMatchScore > 0 && <MatchRing score={jobMatchScore} />}
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {job.title}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">{getDisplayCompanyName(job)}</p>
                        </div>
                      </div>

                      {/* Compact info */}
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 flex-shrink-0" />
                            {typeLabel}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 flex-shrink-0" />
                            R$ {job.salary.min.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {hasApplied(job.id) && (
                          <Badge className="bg-success/20 text-success border-success/30 text-xs">
                            <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                            Candidatado
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">{job.level}</Badge>
                        <Badge variant="secondary" className="text-xs">{job.area}</Badge>
                      </div>

                      {/* Date */}
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeDate(job.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              }

              // --- LIST MODE (redesigned) ---
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft hover:shadow-medium hover:scale-[1.01] hover:border-primary/20 transition-all border border-transparent cursor-pointer group"
                  onClick={() => navigate(`/candidato/vagas/${job.id}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Company icon + Match ring */}
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Building2 className="w-7 h-7 text-primary" />
                      </div>
                      {jobMatchScore > 0 && <MatchRing score={jobMatchScore} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-muted-foreground">{getDisplayCompanyName(job)}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.id);
                          }}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${isFavorite(job.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`}
                          />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {typeLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          R$ {job.salary.min.toLocaleString('pt-BR')} - {job.salary.max.toLocaleString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatRelativeDate(job.createdAt)}
                        </span>
                      </div>

                      <p className="mt-3 text-muted-foreground line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {hasApplied(job.id) && (
                          <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Candidatado
                          </Badge>
                        )}
                        <Badge variant="secondary">{job.level}</Badge>
                        <Badge variant="secondary">{job.area}</Badge>
                        {job.requirements.slice(0, 2).map((req, i) => (
                          <Badge key={i} variant="outline">{req}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </div>

            {sortedJobs.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl shadow-soft">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma vaga encontrada</h3>
                <p className="text-muted-foreground mb-4">Tente ajustar os filtros de busca</p>
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
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
