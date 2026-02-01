/**
 * Dimension Weight Sliders
 * PRD-052: Sliders 0.5-2.0 por dimensão + radar preview
 */

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { DIMENSION_NAMES, type GaugeProDimension } from '@/types/gaugePro';
import { IdealProfileRadar } from './IdealProfileRadar';

interface DimensionWeightSlidersProps {
  weights: Record<GaugeProDimension, number>;
  onChange: (weights: Record<GaugeProDimension, number>) => void;
  disabled?: boolean;
}

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

function getWeightLabel(weight: number): string {
  if (weight >= 1.8) return 'Muito Alto';
  if (weight >= 1.4) return 'Alto';
  if (weight >= 0.9) return 'Normal';
  if (weight >= 0.6) return 'Baixo';
  return 'Muito Baixo';
}

function getWeightColor(weight: number): string {
  if (weight >= 1.8) return 'text-green-600';
  if (weight >= 1.4) return 'text-blue-600';
  if (weight >= 0.9) return 'text-foreground';
  if (weight >= 0.6) return 'text-amber-600';
  return 'text-red-600';
}

export function DimensionWeightSliders({ weights, onChange, disabled }: DimensionWeightSlidersProps) {
  const handleChange = (dim: GaugeProDimension, value: number[]) => {
    onChange({ ...weights, [dim]: Math.round(value[0] * 10) / 10 });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sliders */}
      <div className="flex-1 space-y-5">
        {DIMENSIONS.map((dim) => (
          <div key={dim} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {dim}: {DIMENSION_NAMES[dim]}
              </Label>
              <span className={`text-sm font-semibold ${getWeightColor(weights[dim])}`}>
                {weights[dim].toFixed(1)}x ({getWeightLabel(weights[dim])})
              </span>
            </div>
            <Slider
              value={[weights[dim]]}
              onValueChange={(v) => handleChange(dim, v)}
              min={0.5}
              max={2.0}
              step={0.1}
              disabled={disabled}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Radar Preview */}
      <div className="flex flex-col items-center">
        <p className="text-xs text-muted-foreground mb-2">Perfil Ideal</p>
        <IdealProfileRadar weights={weights} size="md" />
      </div>
    </div>
  );
}
