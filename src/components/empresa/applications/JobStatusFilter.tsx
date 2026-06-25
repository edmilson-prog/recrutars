import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { JobStatusFilterState } from './jobsNavigation.helpers';

interface JobStatusFilterProps {
  value: JobStatusFilterState;
  onChange: (next: JobStatusFilterState) => void;
}

export function JobStatusFilter({ value, onChange }: JobStatusFilterProps) {
  const has = (s: 'paused' | 'closed') => value.statuses.includes(s);
  const toggle = (s: 'paused' | 'closed') => {
    const statuses = has(s) ? value.statuses.filter((x) => x !== s) : [...value.statuses, s];
    onChange({ ...value, statuses });
  };
  const extra = (has('paused') ? 1 : 0) + (has('closed') ? 1 : 0) + (value.includeEmpty ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtrar vagas
          {extra > 0 && (
            <span className="ml-1 rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">{extra}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mostrar vagas</p>

        <div className="flex items-center gap-2 opacity-70">
          <Checkbox checked disabled id="jf-active" />
          <Label htmlFor="jf-active" className="text-sm">
            Ativas <span className="text-muted-foreground">(sempre)</span>
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="jf-paused" checked={has('paused')} onCheckedChange={() => toggle('paused')} />
          <Label htmlFor="jf-paused" className="text-sm">Pausadas</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="jf-closed" checked={has('closed')} onCheckedChange={() => toggle('closed')} />
          <Label htmlFor="jf-closed" className="text-sm">Fechadas</Label>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Checkbox
            id="jf-empty"
            checked={value.includeEmpty}
            onCheckedChange={(c) => onChange({ ...value, includeEmpty: c === true })}
          />
          <Label htmlFor="jf-empty" className="text-sm">Incluir vagas sem candidaturas</Label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
