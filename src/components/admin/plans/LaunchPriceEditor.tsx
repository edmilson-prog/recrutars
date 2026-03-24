/**
 * LaunchPriceEditor Component
 * PRD-060: Launch price section for PlanEditor
 */

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Plan, PlanPeriod, BillingModel } from '@/types';

const RECURRING_PERIODS: Exclude<PlanPeriod, 'one_time'>[] = ['monthly', 'quarterly', 'semiannual', 'annual'];

const PERIOD_LABELS: Record<PlanPeriod, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
  one_time: 'Avulso',
};

interface LaunchPriceEditorProps {
  plan: Plan;
  onChange: (updates: Partial<Plan>) => void;
  billingModel: BillingModel;
}

export function LaunchPriceEditor({ plan, onChange, billingModel }: LaunchPriceEditorProps) {
  const hasLaunchPrices = !!plan.launchPrices;
  const isOneTime = billingModel === 'one_time';

  const toggleLaunchPrices = (enabled: boolean) => {
    if (enabled) {
      if (isOneTime) {
        onChange({
          launchPrices: {
            monthly: 0,
            quarterly: 0,
            semiannual: 0,
            annual: 0,
            one_time: (plan.prices.one_time ?? 0) * 0.8,
          },
          launchPriceEndDate: plan.launchPriceEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      } else {
        onChange({
          launchPrices: {
            monthly: plan.prices.monthly * 0.8,
            quarterly: plan.prices.quarterly * 0.8,
            semiannual: plan.prices.semiannual * 0.8,
            annual: plan.prices.annual * 0.8,
            one_time: 0,
          },
          launchPriceEndDate: plan.launchPriceEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }
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
          {isOneTime ? (
            <div className="flex items-center gap-3 max-w-md">
              <span className="text-sm font-semibold text-muted-foreground">R$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={plan.launchPrices.one_time || ''}
                placeholder="0,00"
                onChange={(e) => handleLaunchPriceChange('one_time', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {RECURRING_PERIODS.map((period) => (
                <div key={period} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {PERIOD_LABELS[period]}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={plan.launchPrices![period] || ''}
                    placeholder="0,00"
                    onChange={(e) => handleLaunchPriceChange(period, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          )}

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
