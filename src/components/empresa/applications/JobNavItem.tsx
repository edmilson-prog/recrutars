// src/components/empresa/applications/JobNavItem.tsx
import { cn } from '@/lib/utils';
import { JobFunnelBar } from './JobFunnelBar';
import { JOB_STATUS_META } from './statusColors';
import type { JobBreakdown } from './jobsNavigation.helpers';
import type { Job } from '@/types/job';

interface JobNavItemProps {
  job: Job;
  breakdown: JobBreakdown;
  selected?: boolean;
  onSelect: () => void;
}

export function JobNavItem({ job, breakdown, selected, onSelect }: JobNavItemProps) {
  const meta = JOB_STATUS_META[job.status];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'group flex w-full flex-col gap-1.5 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors',
        'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'border-primary/30 bg-primary/5 shadow-[inset_3px_0_0_0_hsl(var(--primary))]',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dotClass)} aria-hidden />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{job.title}</span>
        <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">{breakdown.total}</span>
      </div>
      <JobFunnelBar breakdown={breakdown} />
      <div className="flex items-center justify-between text-[11px]">
        <span className={meta.textClass}>{meta.label}</span>
        {breakdown.novos > 0 && <span className="text-blue-600 dark:text-blue-400">{breakdown.novos} novos</span>}
      </div>
    </button>
  );
}
