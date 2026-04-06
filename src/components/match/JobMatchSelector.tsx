/**
 * JobMatchSelector - Dropdown global para selecionar vaga de comparação
 * Usado na lista do Banco de Talentos
 */

import { useState } from 'react';
import { Check, ChevronsUpDown, Star, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import type { Job } from '@/types';

interface JobMatchSelectorProps {
  jobs: Job[];
  selectedJobId: string; // 'best' | job.id
  onJobChange: (jobId: string) => void;
  className?: string;
}

export function JobMatchSelector({
  jobs,
  selectedJobId,
  onJobChange,
  className,
}: JobMatchSelectorProps) {
  const [open, setOpen] = useState(false);

  if (jobs.length === 0) return null;

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const selectedLabel =
    selectedJobId === 'best'
      ? 'Melhor match (todas as vagas)'
      : selectedJob?.title ?? 'Selecionar vaga';

  // Use combobox for 8+ jobs, simple select for fewer
  if (jobs.length >= 8) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Comparar com:
        </span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[280px] justify-between text-sm"
            >
              <span className="flex items-center gap-2 truncate">
                {selectedJobId === 'best' ? (
                  <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                ) : (
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                )}
                <span className="truncate">{selectedLabel}</span>
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0">
            <Command>
              <CommandInput placeholder="Buscar vaga..." />
              <CommandList>
                <CommandEmpty>Nenhuma vaga encontrada.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="best"
                    onSelect={() => {
                      onJobChange('best');
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedJobId === 'best' ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <Star className="w-3.5 h-3.5 mr-2 text-amber-500" />
                    Melhor match (todas as vagas)
                  </CommandItem>
                  {jobs.map((job) => (
                    <CommandItem
                      key={job.id}
                      value={job.title}
                      onSelect={() => {
                        onJobChange(job.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedJobId === job.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="truncate">{job.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {job.type === 'remote'
                          ? 'Remoto'
                          : job.type === 'hybrid'
                            ? 'Híbrido'
                            : 'Presencial'}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Simple select for < 8 jobs
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Comparar com:
      </span>
      <Select value={selectedJobId} onValueChange={onJobChange}>
        <SelectTrigger className="w-[280px] [&>span]:!flex [&>span]:!items-center">
          <span className="flex items-center gap-2 truncate">
            {selectedJobId === 'best' ? (
              <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            ) : (
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="best">
            <span className="flex items-center gap-2">
              Melhor match (todas as vagas)
            </span>
          </SelectItem>
          {jobs.map((job) => (
            <SelectItem key={job.id} value={job.id}>
              <span className="flex items-center gap-2">
                {job.title}
                <span className="text-xs text-muted-foreground">
                  {job.type === 'remote'
                    ? 'Remoto'
                    : job.type === 'hybrid'
                      ? 'Híbrido'
                      : 'Presencial'}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
