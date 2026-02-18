/**
 * LaunchPriceEditor Component
 * PRD-060: Launch price section for PlanEditor
 */

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Plan, PlanPeriod } from '@/types';

const PERIOD_LABELS: Record<PlanPeriod, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

interface LaunchPriceEditorProps {
  plan: Plan;
  onChange: (updates: Partial<Plan>) => void;
}

export function LaunchPriceEditor({ plan, onChange }: LaunchPriceEditorProps) {
  const hasLaunchPrices = !!plan.launchPrices;

  const toggleLaunchPrices = (enabled: boolean) => {
    if (enabled) {
      onChange({
        launchPrices: {
          monthly: plan.prices.monthly * 0.8,
          quarterly: plan.prices.quarterly * 0.8,
          semiannual: plan.prices.semiannual * 0.8,
          annual: plan.prices.annual * 0.8,
        },
        launchPriceEndDate: plan.launchPriceEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } else {
      onChange({
        launchPrices: undefined,
        launchPriceEndDate: undefined,
      });
    }
  };

  const handleLaunchPriceChange = (period: PlanPeriod, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({
      launchPrices: {
        ...plan.launchPrices!,
        [period]: numValue,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">Preços de Lançamento</Label>
          <p className="text-xs text-muted-foreground">
            Ative para definir preços promocionais de lançamento
          </p>
        </div>
        <Switch
          checked={hasLaunchPrices}
          onCheckedChange={toggleLaunchPrices}
        />
      </div>

      {hasLaunchPrices && plan.launchPrices && (
        <div className="space-y-3 pl-2 border-l-2 border-cyan-500/30">
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(PERIOD_LABELS) as PlanPeriod[]).map((period) => (
              <div key={period} className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {PERIOD_LABELS[period]}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={plan.launchPrices![period]}
                  onChange={(e) => handleLaunchPriceChange(period, e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Data fim do lançamento
            </Label>
            <Input
              type="date"
              value={plan.launchPriceEndDate || ''}
              onChange={(e) => onChange({ launchPriceEndDate: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
