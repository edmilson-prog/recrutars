import { useMemo, useState } from 'react';
import type { Job } from '@/types/job';
import type { Application } from '@/types';
import {
  computeJobBreakdowns,
  filterVisibleJobs,
  DEFAULT_JOB_STATUS_FILTER,
  type JobBreakdown,
  type JobStatusFilterState,
} from './jobsNavigation.helpers';

export interface UseJobsNavigationResult {
  visibleJobs: Job[];
  breakdowns: Map<string, JobBreakdown>;
  statusFilter: JobStatusFilterState;
  setStatusFilter: (next: JobStatusFilterState) => void;
}

export function useJobsNavigation(
  jobs: Job[],
  applications: Pick<Application, 'jobId' | 'status'>[],
): UseJobsNavigationResult {
  const [statusFilter, setStatusFilter] = useState<JobStatusFilterState>(DEFAULT_JOB_STATUS_FILTER);
  const breakdowns = useMemo(() => computeJobBreakdowns(applications), [applications]);
  const visibleJobs = useMemo(() => filterVisibleJobs(jobs, breakdowns, statusFilter), [jobs, breakdowns, statusFilter]);
  return { visibleJobs, breakdowns, statusFilter, setStatusFilter };
}
