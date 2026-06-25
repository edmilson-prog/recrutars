import { describe, it, expect } from 'vitest';
import {
  computeJobBreakdowns,
  filterVisibleJobs,
  DEFAULT_JOB_STATUS_FILTER,
} from '@/components/empresa/applications/jobsNavigation.helpers';
import type { Job } from '@/types/job';

const app = (jobId: string, status: string) => ({ jobId, status }) as { jobId: string; status: string };

function job(id: string, status: Job['status'], title = id): Job {
  return {
    id, companyId: 'c1', companyName: 'C', isAnonymous: false, title,
    description: '', requirements: [], benefits: [], location: '', type: 'onsite',
    level: '', salary: { min: 0, max: 0 }, status, moderationStatus: 'approved',
    applicationsCount: 0, positionsCount: 1, createdAt: '2026-01-01', area: '',
  } as Job;
}

describe('computeJobBreakdowns', () => {
  it('counts only active-pipeline statuses per job and sets novos = pending', () => {
    const m = computeJobBreakdowns([
      app('j1', 'pending'), app('j1', 'pending'), app('j1', 'interview'),
      app('j1', 'rejected'), app('j1', 'hired'),
      app('j2', 'offer'),
    ]);
    expect(m.get('j1')).toEqual({ pending: 2, reviewing: 0, interview: 1, offer: 0, total: 3, novos: 2 });
    expect(m.get('j2')).toEqual({ pending: 0, reviewing: 0, interview: 0, offer: 1, total: 1, novos: 0 });
  });

  it('omits jobs with no active applications', () => {
    const m = computeJobBreakdowns([app('j1', 'rejected')]);
    expect(m.has('j1')).toBe(false);
  });
});

describe('filterVisibleJobs', () => {
  const jobs = [job('j1', 'active'), job('j2', 'active'), job('j3', 'paused'), job('j4', 'closed')];
  const breakdowns = computeJobBreakdowns([
    app('j1', 'pending'), app('j1', 'pending'),
    app('j3', 'offer'),
    app('j4', 'interview'),
    // j2 active but empty
  ]);

  it('default: only active jobs with at least one application', () => {
    const result = filterVisibleJobs(jobs, breakdowns, DEFAULT_JOB_STATUS_FILTER);
    expect(result.map(j => j.id)).toEqual(['j1']);
  });

  it('includes paused/closed when their statuses are added', () => {
    const result = filterVisibleJobs(jobs, breakdowns, { statuses: ['active', 'paused', 'closed'], includeEmpty: false });
    expect(result.map(j => j.id).sort()).toEqual(['j1', 'j3', 'j4']);
  });

  it('includeEmpty reveals active jobs with zero applications', () => {
    const result = filterVisibleJobs(jobs, breakdowns, { statuses: ['active'], includeEmpty: true });
    expect(result.map(j => j.id).sort()).toEqual(['j1', 'j2']);
  });

  it('sorts by total desc, then title asc', () => {
    const bd = computeJobBreakdowns([
      app('j1', 'pending'),
      app('j2', 'pending'), app('j2', 'reviewing'),
    ]);
    const result = filterVisibleJobs([job('j1', 'active', 'B'), job('j2', 'active', 'A')], bd, DEFAULT_JOB_STATUS_FILTER);
    expect(result.map(j => j.id)).toEqual(['j2', 'j1']); // j2 has 2, j1 has 1
  });
});
