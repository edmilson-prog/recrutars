/**
 * QuestionSuggestions Component
 * PRD-048: Teste por Vaga
 *
 * Lista de perguntas sugeridas com opção de adicionar/remover
 */

import { motion } from 'framer-motion';
import { Check, X, RefreshCw, Eye, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DimensionBadge } from '@/components/assessment';
import { assessmentCategories } from '@/data/assessmentData';
import type { AssessmentQuestion } from '@/types/assessment';
import { QUESTION_TYPE_LABELS, QUESTION_LEVEL_STARS } from '@/types/assessment';

interface QuestionSuggestionsProps {
  questions: AssessmentQuestion[];
  selectedIds: string[];
  onSelect: (questionId: string) => void;
  onDeselect: (questionId: string) => void;
  onRefresh?: () => void;
  minQuestions: number;
  maxQuestions: number;
  className?: string;
}

function getCategoryName(categoryId: string): string {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  return category?.name || categoryId;
}

function getCategoryDimensionId(categoryId: string): string | undefined {
  const category = assessmentCategories.find((c) => c.id === categoryId);
  return category?.dimensionId;
}

export function QuestionSuggestions({
  questions,
  selectedIds,
  onSelect,
  onDeselect,
  onRefresh,
  minQuestions,
  maxQuestions,
  className,
}: QuestionSuggestionsProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectedCount = selectedIds.length;
  const isValid = selectedCount >= minQuestions && selectedCount <= maxQuestions;

  // Filtrar perguntas
  const filteredQuestions = questions.filter((q) => {
    if (filterType !== 'all' && q.type !== filterType) return false;
    if (filterLevel !== 'all' && q.level !== filterLevel) return false;
    return true;
  });

  // Agrupar por categoria para visualização
  const questionsByCategory = filteredQuestions.reduce((acc, q) => {
    if (!acc[q.categoryId]) {
      acc[q.categoryId] = [];
    }
    acc[q.categoryId].push(q);
    return acc;
  }, {} as Record<string, AssessmentQuestion[]>);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">Perguntas Sugeridas</h3>
          <p className="text-sm text-muted-foreground">
            {questions.length} perguntas geradas automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isValid ? 'default' : 'outline'}
            className={cn(isValid && 'bg-success')}
          >
            {selectedCount}/{maxQuestions}
          </Badge>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sugerir novas
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="behavioral">Comportamental</SelectItem>
            <SelectItem value="situational">Situacional</SelectItem>
            <SelectItem value="self_assessment">Autoavaliação</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            <SelectItem value="basic">Básico</SelectItem>
            <SelectItem value="intermediate">Intermediário</SelectItem>
            <SelectItem value="advanced">Avançado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question list */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {Object.entries(questionsByCategory).map(([categoryId, categoryQuestions]) => (
          <div key={categoryId}>
            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background py-1">
              <DimensionBadge
                dimensionId={getCategoryDimensionId(categoryId) || ''}
                size="sm"
              />
              <span className="text-sm font-medium text-foreground">
                {getCategoryName(categoryId)}
              </span>
              <Badge variant="outline" className="ml-auto">
                {categoryQuestions.filter((q) => selectedIds.includes(q.id)).length}/
                {categoryQuestions.length}
              </Badge>
            </div>

            <div className="space-y-2 pl-2">
              {categoryQuestions.map((question, index) => {
                const isSelected = selectedIds.includes(question.id);
                const isExpanded = expandedId === question.id;

                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection checkbox */}
                      <button
                        onClick={() =>
                          isSelected
                            ? onDeselect(question.id)
                            : onSelect(question.id)
                        }
                        className={cn(
                          'w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'border-2 border-muted-foreground/30 hover:border-primary'
                        )}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>

                      {/* Question content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm',
                            isExpanded ? '' : 'line-clamp-2',
                            isSelected ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {question.text}
                        </p>

                        {/* Meta info */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {QUESTION_TYPE_LABELS[question.type]}
                          </span>
                          <span className="text-xs">
                            {QUESTION_LEVEL_STARS[question.level]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            #{question.code}
                          </span>
                        </div>

                        {/* Options preview for situational */}
                        {isExpanded && question.type === 'situational' && question.options && (
                          <div className="mt-2 space-y-1">
                            {question.options.map((opt) => (
                              <div
                                key={opt.key}
                                className="text-xs text-muted-foreground pl-2 border-l-2 border-muted"
                              >
                                <strong>{opt.key}:</strong> {opt.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Expand button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : question.id)
                        }
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Validation message */}
      {selectedCount < minQuestions && (
        <p className="text-sm text-amber-500">
          Selecione pelo menos {minQuestions} perguntas (faltam{' '}
          {minQuestions - selectedCount})
        </p>
      )}
    </div>
  );
}
