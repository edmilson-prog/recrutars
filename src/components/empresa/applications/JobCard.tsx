import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { JobFunnelBar } from './JobFunnelBar';
import { JOB_STATUS_META, PIPELINE_STAGES } from './statusColors';
import type { JobBreakdown } from './jobsNavigation.helpers';
import type { Job } from '@/types/job';

interface JobCardProps {
  job: Job;
  breakdown: JobBreakdown;
  onOpen: () => void;
  index?: number;
}

export function JobCard({ job, breakdown, onOpen, index = 0 }: JobCardProps) {
  const meta = JOB_STATUS_META[job.status];
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : Math.min(index * 0.03, 0.3) }}
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors',
        'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dotClass)} aria-hidden />
          <span className="truncate text-sm font-semibold text-foreground">{job.title}</span>
        </div>
        <span className={cn('shrink-0 text-[11px] font-medium', meta.textClass)}>{meta.label}</span>
      </div>

      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold tabular-nums text-foreground">{breakdown.total}</span>
        {breakdown.novos > 0 && (
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
            {breakdown.novos} novos
          </span>
        )}
      </div>

      <JobFunnelBar breakdown={breakdown} className="h-2" />

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {PIPELINE_STAGES.map((s) => (
          <span key={s.key}>
            <span className={cn('font-semibold', s.textClass)}>{breakdown[s.key]}</span> {s.label}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
