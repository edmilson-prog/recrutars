import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { JobCard } from './JobCard';
import { JobStatusFilter } from './JobStatusFilter';
import type { JobBreakdown, JobStatusFilterState } from './jobsNavigation.helpers';
import type { Job } from '@/types/job';

const EMPTY_BREAKDOWN: JobBreakdown = { pending: 0, reviewing: 0, interview: 0, offer: 0, total: 0, novos: 0 };

interface JobCardsGridProps {
  jobs: Job[];
  breakdowns: Map<string, JobBreakdown>;
  onOpen: (jobId: string) => void;
  statusFilter: JobStatusFilterState;
  onStatusFilterChange: (next: JobStatusFilterState) => void;
}

export function JobCardsGrid({ jobs, breakdowns, onOpen, statusFilter, onStatusFilterChange }: JobCardsGridProps) {
  const [query, setQuery] = useState('');
  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
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

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-12 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Nenhuma vaga ativa com candidaturas. Ajuste o filtro para incluir pausadas/fechadas ou vagas sem candidaturas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              breakdown={breakdowns.get(job.id) ?? EMPTY_BREAKDOWN}
              onOpen={() => onOpen(job.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
