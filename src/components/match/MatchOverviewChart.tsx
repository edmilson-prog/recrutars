/**
 * MatchOverviewChart - Barras comparativas de match entre vagas
 * Usado no detalhamento do candidato e opcionalmente na lista
 */

import { cn } from '@/lib/utils';

interface JobScore {
  jobId: string;
  title: string;
  score: number;
}

interface MatchOverviewChartProps {
  jobScores: JobScore[];
  activeJobId?: string;
  onJobClick?: (jobId: string) => void;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-500' };
  if (score >= 60) return { bar: 'bg-amber-500', text: 'text-amber-500' };
  if (score >= 40) return { bar: 'bg-sky-500', text: 'text-sky-500' };
  return { bar: 'bg-muted-foreground', text: 'text-muted-foreground' };
}

export function MatchOverviewChart({
  jobScores,
  activeJobId,
  onJobClick,
  className,
}: MatchOverviewChartProps) {
  if (jobScores.length === 0) return null;

  // Sort by score descending
  const sorted = [...jobScores].sort((a, b) => b.score - a.score);

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Comparativo entre vagas
      </p>
      <div className="space-y-1.5">
        {sorted.map((item) => {
          const isActive = item.jobId === activeJobId;
          const colors = getScoreColor(item.score);

          return (
            <button
              key={item.jobId}
              type="button"
              onClick={() => onJobClick?.(item.jobId)}
              role="button"
              aria-label={`Ver match com ${item.title}: ${item.score}%`}
              className={cn(
                'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left transition-colors',
                isActive
                  ? 'bg-primary/5 border border-primary/20'
                  : 'border border-transparent hover:bg-muted/50',
                onJobClick && 'cursor-pointer'
              )}
            >
              <span
                className={cn(
                  'w-20 text-right text-xs truncate flex-shrink-0',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
                title={item.title}
              >
                {item.title}
              </span>
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span
                className={cn(
                  'w-9 text-right text-xs font-semibold flex-shrink-0',
                  colors.text
                )}
              >
                {item.score}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
