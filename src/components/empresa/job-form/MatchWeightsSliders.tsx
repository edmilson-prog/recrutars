import { useId } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MatchWeights } from '@/types/matchWeights';
import { cn } from '@/lib/utils';

const CATEGORY_META: Array<{
  key: keyof MatchWeights;
  label: string;
  color: string;
}> = [
  { key: 'skillsTechnical', label: 'Skills Técnicas', color: 'bg-amber-500' },
  { key: 'skillsBehavioral', label: 'Skills Comportamentais', color: 'bg-red-500' },
  { key: 'experience', label: 'Experiência', color: 'bg-cyan-500' },
  { key: 'gaugePro', label: 'Perfil Comportamental', color: 'bg-violet-400' },
  { key: 'location', label: 'Localização', color: 'bg-emerald-400' },
];

export interface MatchWeightsSlidersProps {
  weights: MatchWeights;
  onChange: (next: MatchWeights) => void;
  disabled?: boolean;
}

export function MatchWeightsSliders({ weights, onChange, disabled }: MatchWeightsSlidersProps) {
  const baseId = useId();

  function setWeight(key: keyof MatchWeights, value: number) {
    const clamped = Math.max(0, Math.min(70, Math.round(value)));
    onChange({ ...weights, [key]: clamped });
  }

  return (
    <div className="space-y-3">
      {CATEGORY_META.map(({ key, label, color }) => {
        const id = `${baseId}-${key}`;
        const value = weights[key];
        return (
          <div
            key={key}
            className="grid grid-cols-[180px_1fr_72px_20px] items-center gap-3"
          >
            <Label htmlFor={id} className="flex items-center gap-2 text-sm">
              <span className={cn('inline-block w-2 h-2 rounded-sm', color)} />
              {label}
            </Label>
            <Slider
              id={id}
              min={0}
              max={70}
              step={1}
              value={[value]}
              onValueChange={(v) => setWeight(key, v[0] ?? 0)}
              disabled={disabled}
              aria-label={`Peso de ${label}, 0 a 70 por cento`}
            />
            <Input
              type="number"
              min={0}
              max={70}
              value={value}
              onChange={(e) => setWeight(key, Number(e.target.value))}
              disabled={disabled}
              className="text-right h-8"
              aria-label={`Valor numérico de ${label}`}
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        );
      })}
    </div>
  );
}
