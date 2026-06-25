import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JobNavItem } from './JobNavItem';
import { JobStatusFilter } from './JobStatusFilter';
import type { JobBreakdown, JobStatusFilterState } from './jobsNavigation.helpers';
import type { Job } from '@/types/job';

const EMPTY_BREAKDOWN: JobBreakdown = { pending: 0, reviewing: 0, interview: 0, offer: 0, total: 0, novos: 0 };

interface JobSidebarProps {
  jobs: Job[];
  breakdowns: Map<string, JobBreakdown>;
  selectedJobId: string;
  onSelect: (jobId: string) => void;
  statusFilter: JobStatusFilterState;
  onStatusFilterChange: (next: JobStatusFilterState) => void;
}

export function JobSidebar({
  jobs,
  breakdowns,
  selectedJobId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
}: JobSidebarProps) {
  const [query, setQuery] = useState('');
  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar vaga..."
            className="pl-8"
            aria-label="Buscar vaga"
          />
        </div>
        <JobStatusFilter value={statusFilter} onChange={onStatusFilterChange} />
      </div>
      <ScrollArea className="-mx-1 flex-1 px-1">
        <div className="space-y-1 pb-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhuma vaga encontrada</p>
          ) : (
            filtered.map((job) => (
              <JobNavItem
                key={job.id}
                job={job}
                breakdown={breakdowns.get(job.id) ?? EMPTY_BREAKDOWN}
                selected={job.id === selectedJobId}
                onSelect={() => onSelect(job.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
