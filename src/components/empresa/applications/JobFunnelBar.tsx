import { cn } from '@/lib/utils';
import { PIPELINE_STAGES } from './statusColors';
import type { JobBreakdown } from './jobsNavigation.helpers';

interface JobFunnelBarProps {
  breakdown: JobBreakdown;
  className?: string;
}

export function JobFunnelBar({ breakdown, className }: JobFunnelBarProps) {
  const { total } = breakdown;
  return (
    <div
      className={cn('flex h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
      role="img"
      aria-label={`Funil: ${PIPELINE_STAGES.map((s) => `${breakdown[s.key]} ${s.label}`).join(', ')}`}
    >
      {total > 0 &&
        PIPELINE_STAGES.map((s) => {
          const value = breakdown[s.key];
          if (value === 0) return null;
          return <span key={s.key} className={s.barClass} style={{ width: `${(value / total) * 100}%` }} />;
        })}
    </div>
  );
}
