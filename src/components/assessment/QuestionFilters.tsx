/**
 * QuestionFilters Component
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Filtros para busca de perguntas: dimensão, categoria, tipo, nível, status
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssessmentCategories } from '@/hooks/useAssessmentCategories';
import type { QuestionFilters as QuestionFiltersType } from '@/types/assessment';
import {
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_ICONS,
  QUESTION_LEVEL_LABELS,
  QUESTION_LEVEL_STARS,
} from '@/types/assessment';

interface QuestionFiltersProps {
  filters: QuestionFiltersType;
  onFilterChange: (filters: Partial<QuestionFiltersType>) => void;
  onClearFilters: () => void;
}

export function QuestionFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: QuestionFiltersProps) {
  const { dimensions, getCategoriesByDimensionId } = useAssessmentCategories();

  // Get categories for selected dimension
  const availableCategories = filters.dimensionId
    ? getCategoriesByDimensionId(filters.dimensionId)
    : [];

  // Handle dimension change - clear category when dimension changes
  const handleDimensionChange = (value: string) => {
    if (value === 'all') {
      onFilterChange({ dimensionId: undefined, categoryId: undefined });
    } else {
      onFilterChange({ dimensionId: value, categoryId: undefined });
    }
  };

  // Check if any filter is active
  const hasActiveFilters =
    filters.dimensionId ||
    filters.categoryId ||
    (filters.type && filters.type !== 'all') ||
    (filters.level && filters.level !== 'all') ||
    (filters.status && filters.status !== 'all');

  return (
    <div className="space-y-6">
      {/* Dimension */}
      <div className="space-y-2">
        <Label>Dimensão</Label>
        <Select
          value={filters.dimensionId || 'all'}
          onValueChange={handleDimensionChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas as dimensões" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as dimensões</SelectItem>
            {dimensions.map((dim) => (
              <SelectItem key={dim.id} value={dim.id}>
                {dim.icon} {dim.name} ({dim.questionCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category (cascading) */}
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select
          value={filters.categoryId || 'all'}
          onValueChange={(value) =>
            onFilterChange({ categoryId: value === 'all' ? undefined : value })
          }
          disabled={!filters.dimensionId}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                filters.dimensionId
                  ? 'Todas as categorias'
                  : 'Selecione uma dimensão primeiro'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {availableCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              type: value === 'all' ? 'all' : (value as QuestionFiltersType['type']),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="behavioral">
              {QUESTION_TYPE_ICONS.behavioral} {QUESTION_TYPE_LABELS.behavioral}
            </SelectItem>
            <SelectItem value="situational">
              {QUESTION_TYPE_ICONS.situational} {QUESTION_TYPE_LABELS.situational}
            </SelectItem>
            <SelectItem value="self_assessment">
              {QUESTION_TYPE_ICONS.self_assessment}{' '}
              {QUESTION_TYPE_LABELS.self_assessment}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Level */}
      <div className="space-y-2">
        <Label>Nível</Label>
        <Select
          value={filters.level || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              level: value === 'all' ? 'all' : (value as QuestionFiltersType['level']),
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os níveis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            <SelectItem value="basic">
              {QUESTION_LEVEL_STARS.basic} {QUESTION_LEVEL_LABELS.basic}
            </SelectItem>
            <SelectItem value="intermediate">
              {QUESTION_LEVEL_STARS.intermediate} {QUESTION_LEVEL_LABELS.intermediate}
            </SelectItem>
            <SelectItem value="advanced">
              {QUESTION_LEVEL_STARS.advanced} {QUESTION_LEVEL_LABELS.advanced}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              status: value as QuestionFiltersType['status'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}
