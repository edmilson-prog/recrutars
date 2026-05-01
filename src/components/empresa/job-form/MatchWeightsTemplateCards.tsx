import { MATCH_WEIGHT_TEMPLATES, matchTemplate, type MatchWeightTemplate } from '@/lib/matchWeightTemplates';
import type { MatchWeights } from '@/types/matchWeights';
import { cn } from '@/lib/utils';

export interface MatchWeightsTemplateCardsProps {
  currentWeights: MatchWeights;
  onApply: (template: MatchWeightTemplate) => void;
  disabled?: boolean;
}

export function MatchWeightsTemplateCards({ currentWeights, onApply, disabled }: MatchWeightsTemplateCardsProps) {
  const activeTemplate = matchTemplate(currentWeights);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {MATCH_WEIGHT_TEMPLATES.map((tpl) => {
        const isActive = activeTemplate?.id === tpl.id;
        return (
          <button
            key={tpl.id}
            type="button"
            disabled={disabled}
            onClick={() => onApply(tpl)}
            aria-pressed={isActive}
            className={cn(
              'flex-shrink-0 w-[136px] text-left p-3 rounded-md border bg-card transition-all',
              'hover:border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500',
              isActive ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-border',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <div className="font-semibold text-sm mb-1">{tpl.name}</div>
            <div className="text-[10px] text-muted-foreground line-clamp-2 mb-2 min-h-[24px]">
              {tpl.examples}
            </div>
            <div className="flex h-1.5 rounded-sm overflow-hidden bg-muted">
              <span className="bg-amber-500" style={{ width: `${tpl.weights.skillsTechnical}%` }} />
              <span className="bg-red-500" style={{ width: `${tpl.weights.skillsBehavioral}%` }} />
              <span className="bg-cyan-500" style={{ width: `${tpl.weights.experience}%` }} />
              <span className="bg-violet-400" style={{ width: `${tpl.weights.gaugePro}%` }} />
              <span className="bg-emerald-400" style={{ width: `${tpl.weights.location}%` }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
