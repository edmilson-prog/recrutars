/**
 * CompetencySelector Component
 * PRD-048: Teste por Vaga
 *
 * Seleção de competências com prioridade (crítica/importante)
 */

import { motion } from 'framer-motion';
import {
  Star,
  AlertTriangle,
  Check,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { CompetencyOption } from '@/hooks/useCompetencySelection';
import type { SelectedCompetencies } from '@/types/assessment';

interface CompetencySelectorProps {
  options: CompetencyOption[];
  selected: SelectedCompetencies;
  onSelect: (categoryId: string, priority: 'critical' | 'important') => void;
  onRemove: (categoryId: string) => void;
  onWeightChange: (categoryId: string, weight: number) => void;
  maxCompetencies: number;
  className?: string;
}

// Agrupar por dimensão
function groupByDimension(options: CompetencyOption[]) {
  const groups: Record<string, CompetencyOption[]> = {};

  options.forEach((opt) => {
    if (!groups[opt.dimensionId]) {
      groups[opt.dimensionId] = [];
    }
    groups[opt.dimensionId].push(opt);
  });

  return groups;
}

export function CompetencySelector({
  options,
  selected,
  onSelect,
  onRemove,
  onWeightChange,
  maxCompetencies,
  className,
}: CompetencySelectorProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const grouped = groupByDimension(options);

  const totalSelected = selected.critical.length + selected.important.length;
  const canAddMore = totalSelected < maxCompetencies;

  const isSelected = (id: string) =>
    selected.critical.includes(id) || selected.important.includes(id);

  const getPriority = (id: string): 'critical' | 'important' | null => {
    if (selected.critical.includes(id)) return 'critical';
    if (selected.important.includes(id)) return 'important';
    return null;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">
            Selecione as Competências
          </h3>
          <p className="text-sm text-muted-foreground">
            Escolha entre 2 e {maxCompetencies} competências para avaliar
          </p>
        </div>
        <Badge
          variant={totalSelected >= 2 ? 'default' : 'outline'}
          className={totalSelected >= 2 ? 'bg-success' : ''}
        >
          {totalSelected}/{maxCompetencies}
        </Badge>
      </div>

      {/* Selected competencies summary */}
      {totalSelected > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          {/* Critical */}
          {selected.critical.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-red-500 uppercase">
                Críticas:
              </span>
              {selected.critical.map((id) => {
                const opt = options.find((o) => o.id === id);
                if (!opt) return null;
                return (
                  <Badge
                    key={id}
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    {opt.name}
                    <button onClick={() => onRemove(id)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Important */}
          {selected.important.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-amber-500 uppercase">
                Importantes:
              </span>
              {selected.important.map((id) => {
                const opt = options.find((o) => o.id === id);
                if (!opt) return null;
                return (
                  <Badge
                    key={id}
                    variant="outline"
                    className="border-amber-500 text-amber-500 flex items-center gap-1"
                  >
                    {opt.name}
                    <button onClick={() => onRemove(id)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Competency list by dimension */}
      <div className="space-y-2">
        {Object.entries(grouped).map(([dimensionId, dimOptions]) => {
          const firstOption = dimOptions[0];
          const isOpen = expandedDimension === dimensionId;
          const selectedInDim = dimOptions.filter((o) => isSelected(o.id)).length;

          return (
            <Collapsible
              key={dimensionId}
              open={isOpen}
              onOpenChange={() =>
                setExpandedDimension(isOpen ? null : dimensionId)
              }
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 bg-card rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{firstOption.dimensionIcon}</span>
                    <div className="text-left">
                      <h4 className="font-medium text-foreground">
                        {firstOption.dimensionName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {dimOptions.length} competências
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedInDim > 0 && (
                      <Badge variant="secondary">{selectedInDim}</Badge>
                    )}
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="pl-4 space-y-1 mt-1">
                  {dimOptions.map((opt) => {
                    const priority = getPriority(opt.id);
                    const isSelectedOpt = priority !== null;

                    return (
                      <CompetencyItem
                        key={opt.id}
                        option={opt}
                        priority={priority}
                        weight={selected.weights[opt.id] || 3}
                        canAdd={canAddMore || isSelectedOpt}
                        onSelect={(p) => onSelect(opt.id, p)}
                        onRemove={() => onRemove(opt.id)}
                        onWeightChange={(w) => onWeightChange(opt.id, w)}
                      />
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

interface CompetencyItemProps {
  option: CompetencyOption;
  priority: 'critical' | 'important' | null;
  weight: number;
  canAdd: boolean;
  onSelect: (priority: 'critical' | 'important') => void;
  onRemove: () => void;
  onWeightChange: (weight: number) => void;
}

function CompetencyItem({
  option,
  priority,
  weight,
  canAdd,
  onSelect,
  onRemove,
  onWeightChange,
}: CompetencyItemProps) {
  const isSelected = priority !== null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors',
        isSelected
          ? priority === 'critical'
            ? 'bg-red-500/10 border border-red-500/30'
            : 'bg-amber-500/10 border border-amber-500/30'
          : 'bg-muted/30 hover:bg-muted/50'
      )}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {option.name}
          </span>
          <span className="text-xs text-muted-foreground">
            ({option.questionCount} perguntas)
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {option.description}
        </p>
      </div>

      {/* Weight slider (quando selecionado) */}
      {isSelected && (
        <div className="flex items-center gap-2 w-24">
          <span className="text-xs text-muted-foreground">Peso:</span>
          <Slider
            value={[weight]}
            onValueChange={([v]) => onWeightChange(v)}
            min={1}
            max={5}
            step={1}
            className="w-16"
          />
          <span className="text-xs font-bold w-4">{weight}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        {isSelected ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect('important')}
              disabled={!canAdd}
              className="h-8 px-2 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
              title="Adicionar como importante"
            >
              <Star className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect('critical')}
              disabled={!canAdd}
              className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
              title="Adicionar como crítica"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
