/**
 * Job Search Page
 * PRD-006: Busca e Visualização de Vagas
 * PRD-007: Indicador visual de candidatura
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, DollarSign, Building2, Clock, Heart, Filter, X, ArrowUpDown, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { useJobs, useJobLocations } from '@/hooks/useJobsQuery';
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

const areas = ['Tecnologia', 'Produto', 'Design', 'Dados', 'Marketing', 'Comercial', 'RH', 'Financeiro'];
const levels = ['Estágio', 'Junior', 'Pleno', 'Senior', 'Especialista', 'Gerente'];

const ITEMS_PER_PAGE = 10;

type SortOption = 'recent' | 'salary-high' | 'salary-low' | 'match-high';

export default function CandidateJobSearch() {
  const navigate = useNavigate();
  const { currentCandidate } = useAuth();
  const candidateId = currentCandidate?.id ?? '';

  // Fetch all jobs from service layer
  const { data: jobsResult, isLoading: isLoadingJobs } = useJobs({ status: 'active' });
  const allJobs = jobsResult?.data ?? [];

  // Dynamic locations derived from actual job data in the database
  const { data: locations = [] } = useJobLocations();

  // Applications hook for checking applied status
  const { hasApplied } = useApplications(candidateId);

  // Favorites hook (PRD-024)
  const { isFavorite, toggleFavorite } = useFavoriteJobs();

  // Search with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filters
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [salaryRange, setSalaryRange] = useState([0, 30000]);

  // Sorting and pagination
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Filter jobs
  const filteredJobs = activeJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          getDisplayCompanyName(job).toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          job.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesLocation = locationFilter === 'all' || job.location.includes(locationFilter);
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesArea = areaFilter === 'all' || job.area === areaFilter;
    const matchesLevel = levelFilter === 'all' || job.level === levelFilter;
    const matchesSalary = job.salary.min >= salaryRange[0] && job.salary.max <= salaryRange[1];

    return matchesSearch && matchesLocation && matchesType && matchesArea && matchesLevel && matchesSalary;
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
  const totalPages = Math.ceil(sortedJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = sortedJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, locationFilter, typeFilter, areaFilter, levelFilter, salaryRange, sortBy]);

  const toggleSaveJob = (jobId: string) => {
    const isNowFavorite = toggleFavorite(jobId);
    toast.success(isNowFavorite ? 'Vaga salva!' : 'Vaga removida');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('all');
    setTypeFilter('all');
    setAreaFilter('all');
    setLevelFilter('all');
    setSalaryRange([0, 30000]);
  };

  const hasActiveFilters = searchTerm !== '' || locationFilter !== 'all' || typeFilter !== 'all' ||
                           areaFilter !== 'all' || levelFilter !== 'all' ||
                           salaryRange[0] > 0 || salaryRange[1] < 30000;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Localização</label>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as cidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buscar Vagas</h1>
          <p className="text-muted-foreground">Encontre a oportunidade ideal para sua carreira</p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por cargo, empresa ou palavra-chave..."
              className="pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchTerm('')}
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

          {/* Jobs List */}
          <div className="flex-1 space-y-4">
            {/* Loading */}
            {isLoadingJobs && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Results count and sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-muted-foreground">
                {sortedJobs.length} vaga{sortedJobs.length !== 1 ? 's' : ''} encontrada{sortedJobs.length !== 1 ? 's' : ''}
              </p>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match-high">Maior match</SelectItem>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="salary-high">Maior salário</SelectItem>
                    <SelectItem value="salary-low">Menor salário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {paginatedJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all cursor-pointer group"
                onClick={() => navigate(`/candidato/vagas/${job.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Building2 className="w-7 h-7 text-primary" />
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
                        {job.type === 'remote' ? 'Remoto' : job.type === 'hybrid' ? 'Híbrido' : 'Presencial'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        R$ {job.salary.min.toLocaleString('pt-BR')} - {job.salary.max.toLocaleString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.createdAt}
                      </span>
                    </div>

                    <p className="mt-3 text-muted-foreground line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* PRD-035: Badge de match score */}
                      {matchScores[job.id] !== undefined && (
                        <Badge
                          className={`${getMatchScoreColor(matchScores[job.id]).bg} ${getMatchScoreColor(matchScores[job.id]).text} border ${getMatchScoreColor(matchScores[job.id]).border}`}
                        >
                          {matchScores[job.id]}% match
                        </Badge>
                      )}
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
            ))}

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
