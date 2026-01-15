/**
 * Candidates Page - Talent Pool
 * PRD-014: Banco de Talentos
 * PRD-026: Respeita visibilidade do perfil
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { mockCandidates, mockJobs, getMatchScore, getCandidateDISCProfile } from '@/data/mockData';
import type { Candidate, Job } from '@/types';
import type { CandidateForComparison } from '@/types/disc';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
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

// Filter options
const locations = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Porto Alegre, RS'];
const discProfiles = ['Executor', 'Influenciador', 'Analítico', 'Estável'];
const experienceRanges = [
  { value: '0-2', label: '0-2 anos' },
  { value: '3-5', label: '3-5 anos' },
  { value: '6-10', label: '6-10 anos' },
  { value: '10+', label: '10+ anos' },
];

const ITEMS_PER_PAGE = 10;

// Helper to extract all unique skills from candidates
const allSkills = Array.from(
  new Set(mockCandidates.flatMap((c) => c.skills))
).sort();

// Helper to get experience range string
const getExperienceRange = (years: number): string => {
  if (years <= 2) return '0-2';
  if (years <= 5) return '3-5';
  if (years <= 10) return '6-10';
  return '10+';
};

// Helper to calculate mock match percentage
const calculateMatch = (candidate: Candidate, jobs: Job[]): number => {
  if (jobs.length === 0) return 0;
  // Mock: based on skills overlap and profile completion
  const avgSkillMatch = jobs.reduce((acc, job) => {
    const jobSkills = job.requirements.join(' ').toLowerCase();
    const matchingSkills = candidate.skills.filter((s) =>
      jobSkills.includes(s.toLowerCase())
    ).length;
    return acc + (matchingSkills / candidate.skills.length) * 100;
  }, 0) / jobs.length;

  const profileBonus = candidate.hasTest ? 10 : 0;
  const completionBonus = candidate.profileCompletion * 0.2;

  return Math.min(99, Math.round(avgSkillMatch * 0.5 + profileBonus + completionBonus));
};

export default function CompanyCandidates() {
  // Search with debounce
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filters
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');

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

  // Get company jobs (mock: company-1)
  const companyJobs = mockJobs.filter(
    (job) => job.companyId === 'company-1' && job.status === 'active'
  );

  // Filter candidates (PRD-026: respeita visibilidade)
  const filteredCandidates = mockCandidates.filter((candidate) => {
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

    const matchesLocation =
      locationFilter === 'all' || candidate.location.includes(locationFilter);

    const matchesProfile =
      profileFilter === 'all' ||
      (candidate.testResult?.result.profile
        .toLowerCase()
        .includes(profileFilter.toLowerCase()) ?? false);

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
      matchesLocation &&
      matchesProfile &&
      matchesExperience &&
      matchesSkills
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, locationFilter, profileFilter, experienceFilter, skillsFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('all');
    setProfileFilter('all');
    setExperienceFilter('all');
    setSkillsFilter([]);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    locationFilter !== 'all' ||
    profileFilter !== 'all' ||
    experienceFilter !== 'all' ||
    skillsFilter.length > 0;

  const handleOpenInviteModal = (candidate: Candidate, job: Job) => {
    setSelectedCandidate(candidate);
    setSelectedJob(job);
    setInviteMessage('');
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = () => {
    if (!selectedCandidate || !selectedJob) return;

    // Mock: create message (in real app, would call API)
    // PRD-026: Usar nome de exibição (pode ser anônimo)
    const displayName = getDisplayName(selectedCandidate);
    toast.success(`Convite enviado para ${displayName} para a vaga "${selectedJob.title}"`);
    setIsInviteModalOpen(false);
    setSelectedCandidate(null);
    setSelectedJob(null);
    setInviteMessage('');
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
    const discProfile = getCandidateDISCProfile(candidate.id);
    if (!discProfile) return null;

    const matchResult = getMatchScore(candidate.id, companyJobs[0]?.id || 'job-1');
    const matchScore = matchResult?.totalScore || calculateMatch(candidate, companyJobs);

    return {
      id: candidate.id,
      name: getDisplayName(candidate),
      avatar: getDisplayAvatar(candidate) || undefined,
      matchScore,
      discProfile,
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
      const candidate = mockCandidates.find((c) => c.id === id);
      if (!candidate) return null;
      return convertToComparisonCandidate(candidate);
    })
    .filter((c): c is CandidateForComparison => c !== null);

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
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* DISC Profile */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Perfil DISC</label>
        <Select value={profileFilter} onValueChange={setProfileFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os perfis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os perfis</SelectItem>
            {discProfiles.map((profile) => (
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Banco de Talentos</h1>
          <p className="text-muted-foreground">
            Encontre os melhores candidatos para suas vagas
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo ou skill..."
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
            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {filteredCandidates.length} candidato
                {filteredCandidates.length !== 1 ? 's' : ''} encontrado
                {filteredCandidates.length !== 1 ? 's' : ''}
              </p>
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

            {paginatedCandidates.map((candidate, index) => {
              const matchScore = calculateMatch(candidate, companyJobs);
              // PRD-026: Verificar se candidato é anônimo
              const candidateIsAnonymous = isAnonymous(candidate);
              const displayName = getDisplayName(candidate);
              const displayAvatar = getDisplayAvatar(candidate);
              // PRD-002-dgn: Verificar se está selecionado para comparação
              const isSelectedCompare = isSelectedForComparison(candidate.id);
              const canSelectMore = canSelect;

              return (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all ${
                    isSelectedCompare ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* PRD-002-dgn: Checkbox para comparação */}
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
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-foreground">
                              {displayName}
                            </h3>
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

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {candidate.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="outline">
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
                        {candidate.testResult ? (
                          <Badge className="bg-secondary text-secondary-foreground">
                            {candidate.testResult.result.profile}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Sem teste DISC
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          Disponibilidade: {candidate.availability}
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
                    </div>
                  </div>
                </motion.div>
              );
            })}

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
            <Button onClick={handleSendInvite}>
              <Send className="w-4 h-4 mr-2" />
              Enviar convite
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
          const candidate = mockCandidates.find((c) => c.id === candidateId);
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
        calculateMatch={(candidate) => calculateMatch(candidate, companyJobs)}
      />
    </DashboardLayout>
  );
}
