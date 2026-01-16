/**
 * Página de Candidatos Sugeridos
 * PRD-037: Lista completa de candidatos sugeridos com filtros
 */

import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Users,
  MapPin,
  X,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { useCandidateRecommendations } from '@/hooks/useCandidateRecommendations';
import { SuggestedCandidateCard } from '@/components/empresa/SuggestedCandidateCard';
import { InviteCandidateModal } from '@/components/empresa/InviteCandidateModal';
import { mockJobs } from '@/data/mockData';
import type { Candidate, Job } from '@/types';

// Tipos de filtro
interface Filters {
  location: string;
  experienceMin: string;
  experienceMax: string;
  availability: string;
}

const initialFilters: Filters = {
  location: '',
  experienceMin: '',
  experienceMax: '',
  availability: 'all',
};

// Localizações disponíveis (extraídas dos candidatos mock)
const LOCATIONS = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Porto Alegre, RS',
  'Curitiba, PR',
  'Brasília, DF',
  'Florianópolis, SC',
];

// Opções de disponibilidade
const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'Imediata', label: 'Imediata' },
  { value: '15 dias', label: '15 dias' },
  { value: '30 dias', label: '30 dias' },
  { value: 'A combinar', label: 'A combinar' },
];

export default function SuggestedCandidates() {
  const { id: jobId } = useParams<{ id: string }>();

  // Buscar informações da vaga
  const job = mockJobs.find(j => j.id === jobId);

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Estado do modal de convite
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const {
    recommendations,
    isLoading,
    newCount,
    markAsNotSuitable,
    trackView,
    refresh,
  } = useCandidateRecommendations({
    jobId: jobId || '',
    limit: 50, // Carregar mais para a página
    minScore: 60,
  });

  // Filtrar recomendações
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((rec) => {
      const candidate = rec.candidate;

      // Filtro de localização
      if (filters.location && candidate.location !== filters.location) {
        return false;
      }

      // Filtro de experiência mínima
      if (filters.experienceMin) {
        const minExp = parseInt(filters.experienceMin, 10);
        if (!isNaN(minExp) && candidate.experience < minExp) {
          return false;
        }
      }

      // Filtro de experiência máxima
      if (filters.experienceMax) {
        const maxExp = parseInt(filters.experienceMax, 10);
        if (!isNaN(maxExp) && candidate.experience > maxExp) {
          return false;
        }
      }

      // Filtro de disponibilidade
      if (filters.availability && filters.availability !== 'all' && candidate.availability !== filters.availability) {
        return false;
      }

      return true;
    });
  }, [recommendations, filters]);

  // Verificar se há filtros ativos
  const hasActiveFilters =
    filters.location !== '' ||
    filters.experienceMin !== '' ||
    filters.experienceMax !== '' ||
    filters.availability !== 'all';

  // Limpar filtros
  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // Atualizar filtro individual
  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handler para abrir modal de convite
  const handleInvite = (candidateId: string) => {
    const candidate = recommendations.find(r => r.candidate.id === candidateId)?.candidate;
    if (candidate) {
      setSelectedCandidate(candidate);
      setInviteModalOpen(true);
    }
  };

  // Handler para confirmar convite
  const handleConfirmInvite = (message: string, scheduleInterview: boolean) => {
    // TODO: Integrar com sistema de mensagens
    console.log('Convite enviado:', { candidate: selectedCandidate?.id, message, scheduleInterview });
    setSelectedCandidate(null);
  };

  if (!job) {
    return (
      <DashboardLayout userType="company">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-foreground mb-2">Vaga não encontrada</h2>
          <p className="text-muted-foreground mb-4">A vaga solicitada não existe ou foi removida.</p>
          <Button asChild>
            <Link to="/empresa/vagas">Voltar para Vagas</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/empresa/vagas" className="hover:text-foreground transition-colors">
            Vagas
          </Link>
          <span>/</span>
          <span className="text-foreground">{job.title}</span>
          <span>/</span>
          <span className="text-foreground">Candidatos Sugeridos</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link to="/empresa/vagas">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Candidatos Sugeridos</h1>
              <p className="text-muted-foreground">
                {filteredRecommendations.length} candidatos para <span className="font-medium">{job.title}</span>
              </p>
            </div>
            {newCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {newCount} novo{newCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>

            {/* Filtros - Mobile */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="sm:hidden gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Filtrar Candidatos</SheetTitle>
                  <SheetDescription>
                    Refine os candidatos de acordo com suas necessidades
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <FilterFields
                    filters={filters}
                    updateFilter={updateFilter}
                    locations={LOCATIONS}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={clearFilters}
                    >
                      Limpar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setFiltersOpen(false)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Info da Vaga */}
        <div className="p-4 bg-muted/50 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{job.title}</p>
            <p className="text-sm text-muted-foreground">
              {job.location} • {job.type === 'remote' ? 'Remoto' : job.type === 'hybrid' ? 'Híbrido' : 'Presencial'} • {job.level}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/empresa/vagas`}>Ver vaga</Link>
          </Button>
        </div>

        {/* Filtros - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden sm:flex items-end gap-4 p-4 bg-card rounded-xl border border-border"
        >
          <FilterFields
            filters={filters}
            updateFilter={updateFilter}
            locations={LOCATIONS}
            inline
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar filtros
            </Button>
          )}
        </motion.div>

        {/* Lista de Candidatos */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : filteredRecommendations.length > 0 ? (
          <div className="grid gap-4">
            {filteredRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SuggestedCandidateCard
                  recommendation={recommendation}
                  jobId={jobId || ''}
                  onNotSuitable={markAsNotSuitable}
                  onInvite={handleInvite}
                  onView={trackView}
                  variant="default"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState hasFilters={hasActiveFilters} onClearFilters={clearFilters} jobId={jobId || ''} />
        )}
      </div>

      {/* Modal de Convite */}
      {selectedCandidate && job && (
        <InviteCandidateModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          candidate={selectedCandidate}
          job={job}
          onConfirm={handleConfirmInvite}
          onCancel={() => setSelectedCandidate(null)}
        />
      )}
    </DashboardLayout>
  );
}

// Componente de campos de filtro
interface FilterFieldsProps {
  filters: Filters;
  updateFilter: (key: keyof Filters, value: string) => void;
  locations: string[];
  inline?: boolean;
}

function FilterFields({
  filters,
  updateFilter,
  locations,
  inline = false,
}: FilterFieldsProps) {
  const containerClass = inline
    ? 'flex flex-wrap items-end gap-4 flex-1'
    : 'space-y-4';

  const fieldClass = inline ? 'w-40' : 'w-full';

  return (
    <div className={containerClass}>
      {/* Localização */}
      <div className={fieldClass}>
        <Label className="text-sm font-medium mb-1.5 block">Localização</Label>
        <Select
          value={filters.location || 'all-locations'}
          onValueChange={(value) => updateFilter('location', value === 'all-locations' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-locations">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Todas as localizações
              </span>
            </SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Experiência Mínima */}
      <div className={fieldClass}>
        <Label className="text-sm font-medium mb-1.5 block">Exp. Mín. (anos)</Label>
        <Input
          type="number"
          placeholder="0"
          value={filters.experienceMin}
          onChange={(e) => updateFilter('experienceMin', e.target.value)}
          className="w-full"
          min="0"
        />
      </div>

      {/* Experiência Máxima */}
      <div className={fieldClass}>
        <Label className="text-sm font-medium mb-1.5 block">Exp. Máx. (anos)</Label>
        <Input
          type="number"
          placeholder="20"
          value={filters.experienceMax}
          onChange={(e) => updateFilter('experienceMax', e.target.value)}
          className="w-full"
          min="0"
        />
      </div>

      {/* Disponibilidade */}
      <div className={fieldClass}>
        <Label className="text-sm font-medium mb-1.5 block">Disponibilidade</Label>
        <Select
          value={filters.availability}
          onValueChange={(value) => updateFilter('availability', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Empty state
interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  jobId: string;
}

function EmptyState({ hasFilters, onClearFilters, jobId }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
        <Users className="w-10 h-10 text-muted-foreground" />
      </div>

      {hasFilters ? (
        <>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum candidato encontrado
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Não encontramos candidatos que correspondam aos filtros selecionados.
            Tente ajustar ou limpar os filtros.
          </p>
          <Button onClick={onClearFilters}>Limpar filtros</Button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhuma sugestão disponível
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Não encontramos candidatos compatíveis com esta vaga no momento.
            Verifique novamente mais tarde ou explore o banco de talentos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/empresa/candidatos">Banco de Talentos</Link>
            </Button>
            <Button asChild>
              <Link to="/empresa/vagas">Minhas Vagas</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
