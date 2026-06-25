import type { ReactNode } from 'react';
import { ChevronsUpDown, PanelLeft, LayoutGrid } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { VIEW_MODES, type ViewMode } from './useViewMode';

const ICONS: Record<ViewMode, ReactNode> = {
  combobox: <ChevronsUpDown className="h-4 w-4" />,
  sidebar: <PanelLeft className="h-4 w-4" />,
  cards: <LayoutGrid className="h-4 w-4" />,
};

const LABELS: Record<ViewMode, string> = {
  combobox: 'Combobox',
  sidebar: 'Lista',
  cards: 'Cards',
};

interface JobNavSwitcherProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function JobNavSwitcher({ value, onChange }: JobNavSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as ViewMode)}
      aria-label="Modo de visualização das vagas"
      className="rounded-lg border border-border bg-card p-1"
    >
      {VIEW_MODES.map((mode) => (
        <ToggleGroupItem
          key={mode}
          value={mode}
          aria-label={LABELS[mode]}
          className="gap-2 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:font-semibold"
        >
          {ICONS[mode]}
          <span className="hidden sm:inline">{LABELS[mode]}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
