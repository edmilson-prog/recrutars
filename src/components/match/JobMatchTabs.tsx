/**
 * JobMatchTabs - Pills/dropdown híbrido para seleção de vaga no detalhamento
 * ≤5 vagas: pills com score visível (Tabs do Radix)
 * 6+ vagas ou mobile: dropdown Select
 */

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Job } from '@/types';

interface JobMatchTabsProps {
  jobs: Job[];
  selectedJobId: string;
  matchScores: Map<string, number>;
  onJobChange: (jobId: string) => void;
  className?: string;
}

function getScoreColorClass(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  if (score >= 40) return 'text-sky-500';
  return 'text-muted-foreground';
}

export function JobMatchTabs({
  jobs,
  selectedJobId,
  matchScores,
  onJobChange,
  className,
}: JobMatchTabsProps) {
  if (jobs.length === 0) return null;

  // Single job: just show title, no selector needed
  if (jobs.length === 1) {
    return null;
  }

  const usePills = jobs.length <= 5;

  // Dropdown mode (6+ jobs or used as mobile fallback)
  const dropdownSelector = (
    <Select value={selectedJobId} onValueChange={onJobChange}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {(() => {
            const job = jobs.find((j) => j.id === selectedJobId);
            const score = matchScores.get(selectedJobId) ?? 0;
            return job ? `${job.title} — ${score}%` : 'Selecionar vaga';
          })()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {jobs.map((job) => {
          const score = matchScores.get(job.id) ?? 0;
          return (
            <SelectItem key={job.id} value={job.id}>
              <span className="flex items-center justify-between gap-3 w-full">
                <span className="truncate">{job.title}</span>
                <span className={cn('text-xs font-semibold', getScoreColorClass(score))}>
                  {score}%
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  if (!usePills) {
    return <div className={className}>{dropdownSelector}</div>;
  }

  // Pills mode (≤5 jobs)
  return (
    <div className={className}>
      {/* Desktop: pills */}
      <div
        className="hidden sm:flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Selecionar vaga para comparação"
      >
        {jobs.map((job) => {
          const score = matchScores.get(job.id) ?? 0;
          const isActive = job.id === selectedJobId;

          return (
            <button
              key={job.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onJobChange(job.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px]',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50'
              )}
            >
              <span className="truncate max-w-[100px]" title={job.title}>
                {job.title}
              </span>
              <span
                className={cn(
                  'text-[10px] font-bold',
                  isActive ? 'text-primary-foreground/80' : getScoreColorClass(score)
                )}
              >
                {score}%
              </span>
            </button>
          );
        })}
      </div>
      {/* Mobile: always dropdown */}
      <div className="sm:hidden">{dropdownSelector}</div>
    </div>
  );
}
