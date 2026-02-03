/**
 * RolloutControls Component
 * PRD-062: Feature Flags "Switch"
 *
 * Slider + quick preset buttons for rollout percentage.
 */

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RolloutControlsProps {
  percentage: number;
  onChange: (value: number) => void;
}

const presets = [0, 25, 50, 75, 100];

export function RolloutControls({ percentage, onChange }: RolloutControlsProps) {
  return (
    <div className="space-y-4">
      {/* Header with percentage display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Rollout</span>
        <span className="text-2xl font-bold text-cyan-600">{percentage}%</span>
      </div>

      {/* Progress bar visual */}
      <Progress value={percentage} className="h-3" />

      {/* Slider */}
      <Slider
        value={[percentage]}
        onValueChange={([val]) => onChange(val)}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />

      {/* Quick preset buttons */}
      <div className="flex gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant="outline"
            size="sm"
            onClick={() => onChange(preset)}
            className={cn(
              'flex-1 text-xs',
              percentage === preset && 'bg-cyan-600 text-white hover:bg-cyan-700 border-cyan-600'
            )}
          >
            {preset}%
          </Button>
        ))}
      </div>
    </div>
  );
}
