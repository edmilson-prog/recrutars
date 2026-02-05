/**
 * Página de Vagas Recomendadas
 * PRD-036: Lista completa de recomendações com filtros
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Briefcase,
  MapPin,
  X,
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
import { useJobRecommendations } from '@/hooks/useJobRecommendations';
import { useAuth } from '@/contexts/AuthContext';
import { RecommendedJobCard } from '@/components/candidato/RecommendedJobCard';
import { Link } from 'react-router-dom';

// Tipos de filtro
interface Filters {
  location: string;
  type: string;
  salaryMin: string;
  salaryMax: string;
}

const initialFilters: Filters = {
  location: '',
  type: 'all',
  salaryMin: '',
  salaryMax: '',
};

// Localizações disponíveis (extraídas das vagas mock)
const LOCATIONS = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Porto Alegre, RS',
  'Curitiba, PR',
];

export default function RecommendedJobs() {
  const { currentCandidate } = useAuth();
  const candidateId = currentCandidate?.id || '';

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    recommendations,
    isLoading,
    newCount,
    markAsNotInterested,
    trackView,
    refresh,
  } = useJobRecommendations({
    candidateId,
    limit: 50, // Carregar mais para a página
    minScore: 50,
  });

  // Filtrar recomendações
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((rec) => {
      const job = rec.job;

      // Filtro de localização
      if (filters.location && job.location !== filters.location) {
        return false;
      }

      // Filtro de tipo
      if (filters.type && filters.type !== 'all' && job.type !== filters.type) {
        return false;
      }

      // Filtro de salário mínimo
      if (filters.salaryMin) {
        const minSalary = parseInt(filters.salaryMin, 10);
        if (!isNaN(minSalary) && job.salary.max < minSalary) {
          return false;
        }
      }

      // Filtro de salário máximo
      if (filters.salaryMax) {
        const maxSalary = parseInt(filters.salaryMax, 10);
        if (!isNaN(maxSalary) && job.salary.min > maxSalary) {
          return false;
        }
      }

      return true;
    });
  }, [recommendations, filters]);

  // Verificar se há filtros ativos
  const hasActiveFilters =
    filters.location !== '' ||
    filters.type !== 'all' ||
    filters.salaryMin !== '' ||
    filters.salaryMax !== '';

  // Limpar filtros
  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // Atualizar filtro individual
  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Vagas para Você</h1>
              <p className="text-muted-foreground">
                {filteredRecommendations.length} vagas recomendadas com base no seu perfil
              </p>
            </div>
            {newCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {newCount} nova{newCount > 1 ? 's' : ''}
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
                  <SheetTitle>Filtrar Recomendações</SheetTitle>
                  <SheetDescription>
                    Refine as vagas de acordo com suas preferências
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

        {/* Lista de Recomendações */}
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
                key={recommendation.job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RecommendedJobCard
                  recommendation={recommendation}
                  onNotInterested={markAsNotInterested}
                  onView={trackView}
                  variant="default"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState hasFilters={hasActiveFilters} onClearFilters={clearFilters} />
        )}
      </div>
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

      {/* Tipo */}
      <div className={fieldClass}>
        <Label className="text-sm font-medium mb-1.5 block">Modalidade</Label>
        <Select
          value={filters.type}
          onValueChange={(value) => updateFilter('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Todas
              </span>
            </SelectItem>
            <SelectItem value="remote">Remoto</SelectItem>
            <SelectItem value="hybrid">Híbrido</SelectItem>
            <SelectItem value="onsite">Presencial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Salário Mínimo */}
      <div className={fieldClass}>
        <Label className="text-sm font-medium mb-1.5 block">Salário Mín.</Label>
        <Input
          type="number"
          placeholder="R$ 0"
          value={filters.salaryMin}
          onChange={(e) => updateFilter('salaryMin', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Salário Máximo */}
      <div className={fieldClass}>
        <Label className="text-sm font-medium mb-1.5 block">Salário Máx.</Label>
        <Input
          type="number"
          placeholder="R$ 50.000"
          value={filters.salaryMax}
          onChange={(e) => updateFilter('salaryMax', e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
}

// Empty state
interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
        <Briefcase className="w-10 h-10 text-muted-foreground" />
      </div>

      {hasFilters ? (
        <>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhuma vaga encontrada
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Não encontramos vagas que correspondam aos filtros selecionados.
            Tente ajustar ou limpar os filtros.
          </p>
          <Button onClick={onClearFilters}>Limpar filtros</Button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhuma recomendação disponível
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Complete seu perfil e faça o teste comportamental para receber recomendações
            mais precisas e personalizadas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/candidato/perfil">Completar perfil</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/candidato/testes">Fazer teste comportamental</Link>
            </Button>
            <Button asChild>
              <Link to="/candidato/vagas">Explorar todas as vagas</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
