import { Info } from 'lucide-react';
import { MatchWeightsTemplateCards } from './MatchWeightsTemplateCards';
import { MatchWeightsSliders } from './MatchWeightsSliders';
import { MatchWeightsSumIndicator } from './MatchWeightsSumIndicator';
import { DEFAULT_MATCH_WEIGHTS, sumWeights, type MatchWeights } from '@/types/matchWeights';

export interface JobFormMatchWeightsProps {
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  disabled?: boolean;
}

export function JobFormMatchWeights({ weights, onChange, disabled }: JobFormMatchWeightsProps) {
  function distributeRemaining() {
    const remaining = 100 - sumWeights(weights);
    if (remaining <= 0) return;
    // Distribuir igualmente entre as 5 categorias
    const perCategory = Math.floor(remaining / 5);
    const extra = remaining - perCategory * 5;
    onChange({
      skillsTechnical: weights.skillsTechnical + perCategory + (extra > 0 ? 1 : 0),
      skillsBehavioral: weights.skillsBehavioral + perCategory + (extra > 1 ? 1 : 0),
      experience: weights.experience + perCategory + (extra > 2 ? 1 : 0),
      gaugePro: weights.gaugePro + perCategory + (extra > 3 ? 1 : 0),
      location: weights.location + perCategory + (extra > 4 ? 1 : 0),
    });
  }

  function normalize() {
    const sum = sumWeights(weights);
    if (sum === 100 || sum === 0) return;
    const factor = 100 / sum;
    const next = {
      skillsTechnical: Math.round(weights.skillsTechnical * factor),
      skillsBehavioral: Math.round(weights.skillsBehavioral * factor),
      experience: Math.round(weights.experience * factor),
      gaugePro: Math.round(weights.gaugePro * factor),
      location: Math.round(weights.location * factor),
    };
    // Corrigir arredondamento residual jogando na maior categoria
    const newSum = sumWeights(next);
    const diff = 100 - newSum;
    if (diff !== 0) {
      const largestKey = (Object.keys(next) as Array<keyof MatchWeights>).reduce(
        (acc, k) => (next[k] > next[acc] ? k : acc),
        'skillsTechnical' as keyof MatchWeights,
      );
      next[largestKey] = Math.max(0, Math.min(70, next[largestKey] + diff));
    }
    onChange(next);
  }

  function resetDefaults() {
    onChange({ ...DEFAULT_MATCH_WEIGHTS });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-start p-3 bg-cyan-500/5 border-l-2 border-cyan-500 rounded text-xs">
        <Info className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground">
          Os pesos definem como o algoritmo ranqueia candidatos para esta vaga. Aplique um template ou
          ajuste manualmente. A soma deve fechar em 100%.
        </p>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Templates</div>
        <MatchWeightsTemplateCards currentWeights={weights} onApply={(tpl) => onChange({ ...tpl.weights })} disabled={disabled} />
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Pesos por categoria</div>
        <MatchWeightsSliders weights={weights} onChange={onChange} disabled={disabled} />
      </div>

      <MatchWeightsSumIndicator
        weights={weights}
        onDistributeRemaining={distributeRemaining}
        onNormalize={normalize}
        onResetDefaults={resetDefaults}
        disabled={disabled}
      />
    </div>
  );
}
