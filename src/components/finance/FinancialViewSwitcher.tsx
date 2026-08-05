/**
 * FinancialViewSwitcher — segmented control das visualizações da lista.
 *
 * No PR A oferece Tabela | Fluxo. A view Foco (PR C) entra como uma terceira
 * entrada em OPTIONS, sem reescrever o componente. O tipo já inclui 'focus'.
 */

import { Table2, Layers } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type FinancialListView = 'table' | 'focus' | 'flow';

interface FinancialViewSwitcherProps {
  value: FinancialListView;
  onChange: (value: FinancialListView) => void;
}

const OPTIONS: Array<{ value: FinancialListView; label: string; icon: typeof Table2 }> = [
  { value: 'table', label: 'Tabela', icon: Table2 },
  { value: 'flow', label: 'Fluxo', icon: Layers },
];

export function FinancialViewSwitcher({ value, onChange }: FinancialViewSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as FinancialListView);
      }}
      className="justify-start"
      aria-label="Modo de visualização"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        return (
          <ToggleGroupItem key={opt.value} value={opt.value} aria-label={opt.label} className="gap-1.5">
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{opt.label}</span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
