/**
 * TimeFilter component
 * PRD-059: Relatorios "Radar"
 *
 * Period selector with preset options and custom date range.
 */

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { TimeFilter as TimeFilterType, TimeFilterPreset } from '@/types';

interface TimeFilterProps {
  value: TimeFilterType;
  onChange: (filter: TimeFilterType) => void;
}

const PRESETS: { label: string; value: TimeFilterPreset }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Ano', value: 'year' },
  { label: 'Personalizado', value: 'custom' },
];

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  const [customStart, setCustomStart] = useState(value.startDate || '');
  const [customEnd, setCustomEnd] = useState(value.endDate || '');

  const handlePresetClick = (preset: TimeFilterPreset) => {
    if (preset === 'custom') {
      onChange({ preset: 'custom', startDate: customStart, endDate: customEnd });
    } else {
      onChange({ preset });
    }
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    if (start && end) {
      onChange({ preset: 'custom', startDate: start, endDate: end });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        {PRESETS.map((preset) => (
          <Button
            key={preset.value}
            variant={value.preset === preset.value ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'text-xs px-3 h-8',
              value.preset === preset.value
                ? 'shadow-sm'
                : 'hover:bg-background/50'
            )}
            onClick={() => handlePresetClick(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {value.preset === 'custom' && (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={customStart}
            onChange={(e) => handleCustomDateChange(e.target.value, customEnd)}
            className="h-8 w-36 text-xs"
          />
          <span className="text-muted-foreground text-xs">ate</span>
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => handleCustomDateChange(customStart, e.target.value)}
            className="h-8 w-36 text-xs"
          />
        </div>
      )}
    </div>
  );
}
