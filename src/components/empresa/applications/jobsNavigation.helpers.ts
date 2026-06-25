import type { Application } from '@/types';
import type { Job, JobStatus } from '@/types/job';

export interface JobBreakdown {
  pending: number;
  reviewing: number;
  interview: number;
  offer: number;
  total: number;
  novos: number;
}

export interface JobStatusFilterState {
  statuses: JobStatus[];
  includeEmpty: boolean;
}

export const DEFAULT_JOB_STATUS_FILTER: JobStatusFilterState = {
  statuses: ['active'],
  includeEmpty: false,
};

const ACTIVE_STAGES = ['pending', 'reviewing', 'interview', 'offer'] as const;
type ActiveStage = (typeof ACTIVE_STAGES)[number];

function emptyBreakdown(): JobBreakdown {
  return { pending: 0, reviewing: 0, interview: 0, offer: 0, total: 0, novos: 0 };
}

export function computeJobBreakdowns(
  applications: Pick<Application, 'jobId' | 'status'>[],
): Map<string, JobBreakdown> {
  const map = new Map<string, JobBreakdown>();
  for (const appn of applications) {
    if (!ACTIVE_STAGES.includes(appn.status as ActiveStage)) continue;
    let b = map.get(appn.jobId);
    if (!b) {
      b = emptyBreakdown();
      map.set(appn.jobId, b);
    }
    b[appn.status as ActiveStage] += 1;
    b.total += 1;
  }
  for (const b of map.values()) b.novos = b.pending;
  return map;
}

export function filterVisibleJobs(
  jobs: Job[],
  breakdowns: Map<string, JobBreakdown>,
  filter: JobStatusFilterState,
): Job[] {
  const allowed = new Set(filter.statuses);
  return jobs
    .filter((j) => allowed.has(j.status))
    .filter((j) => filter.includeEmpty || (breakdowns.get(j.id)?.total ?? 0) > 0)
    .sort((a, b) => {
      const ta = breakdowns.get(a.id)?.total ?? 0;
      const tb = breakdowns.get(b.id)?.total ?? 0;
      if (tb !== ta) return tb - ta;
      return a.title.localeCompare(b.title, 'pt-BR');
    });
}
