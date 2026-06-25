import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { JOB_STATUS_META } from './statusColors';
import type { JobBreakdown, JobStatusFilterState } from './jobsNavigation.helpers';
import type { Job, JobStatus } from '@/types/job';

interface JobComboboxProps {
  jobs: Job[];
  breakdowns: Map<string, JobBreakdown>;
  selectedJobId: string;
  onSelect: (jobId: string) => void;
  statusFilter: JobStatusFilterState;
  onStatusFilterChange: (next: JobStatusFilterState) => void;
  className?: string;
}

const GROUP_ORDER: JobStatus[] = ['active', 'paused', 'closed'];
const GROUP_HEADING: Record<JobStatus, string> = { active: 'Ativas', paused: 'Pausadas', closed: 'Fechadas' };

export function JobCombobox({
  jobs,
  breakdowns,
  selectedJobId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
  className,
}: JobComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = jobs.find((j) => j.id === selectedJobId);
  const showInactive = statusFilter.statuses.includes('paused') || statusFilter.statuses.includes('closed');

  const grouped = GROUP_ORDER.map((status) => ({
    status,
    items: jobs.filter((j) => j.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between lg:w-80', className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected && <span className={cn('h-2 w-2 shrink-0 rounded-full', JOB_STATUS_META[selected.status].dotClass)} />}
            <span className="truncate">{selected ? selected.title : 'Selecione uma vaga'}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {selected && <span className="text-sm font-bold tabular-nums">{breakdowns.get(selected.id)?.total ?? 0}</span>}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar vaga..." />
          <CommandList className="max-h-[60vh]">
            <CommandEmpty>Nenhuma vaga encontrada.</CommandEmpty>
            {grouped.map((group) => (
              <CommandGroup key={group.status} heading={GROUP_HEADING[group.status]}>
                {group.items.map((job) => {
                  const b = breakdowns.get(job.id);
                  return (
                    <CommandItem
                      key={job.id}
                      value={`${job.title} ${job.id}`}
                      onSelect={() => {
                        onSelect(job.id);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', job.id === selectedJobId ? 'opacity-100' : 'opacity-0')} />
                      <span className={cn('mr-2 h-2 w-2 shrink-0 rounded-full', JOB_STATUS_META[job.status].dotClass)} />
                      <span className="flex-1 truncate">{job.title}</span>
                      <span className="ml-2 text-sm font-bold tabular-nums text-muted-foreground">{b?.total ?? 0}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
          {!showInactive && (
            <button
              type="button"
              onClick={() => onStatusFilterChange({ ...statusFilter, statuses: ['active', 'paused', 'closed'] })}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-sm text-primary hover:bg-muted/60"
            >
              <Plus className="h-4 w-4" /> Mostrar pausadas e fechadas
            </button>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
