/**
 * Hook for Admin Jobs Management
 * PRD-058: Vagas & Moderacao "Sentinel"
 *
 * Core data (jobs, moderation actions) fetched from Supabase via React Query.
 * Hires and interviews still use reference data pending dedicated services.
 * Alerts are generated client-side from real job data.
 */

import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobsService } from '@/services/jobs/jobsService';
import { useAuth } from '@/contexts/AuthContext';
import type {
  AdminJob,
  ModerationStatus,
  AdminHire,
  AdminInterview,
  JobAlert,
} from '@/types';
import {
  mockAdminHires,
  mockAdminInterviews,
} from '@/data/adminJobsData';

const ADMIN_JOB_KEYS = {
  all: ['admin-jobs'] as const,
  list: () => [...ADMIN_JOB_KEYS.all, 'list'] as const,
};

/** Max hours a job can remain in the moderation queue before an alert fires. */
const MAX_PENDING_HOURS = 48;

/** Generate alerts client-side from real job data. */
function generateAlerts(jobs: AdminJob[]): JobAlert[] {
  const alerts: JobAlert[] = [];
  const now = new Date();

  for (const job of jobs) {
    if (job.moderationStatus === 'pending') {
      const hoursInQueue =
        (now.getTime() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursInQueue > MAX_PENDING_HOURS) {
        alerts.push({
          id: `alert-pending-${job.id}`,
          type: 'moderation_pending',
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.companyName,
          message: `Vaga aguardando moderacao ha mais de ${Math.floor(hoursInQueue)} horas.`,
          severity: hoursInQueue > MAX_PENDING_HOURS * 2 ? 'critical' : 'warning',
          createdAt: job.createdAt,
        });
      }
    }

    if (job.moderationStatus === 'approved' && job.status === 'active' && job.publishedAt) {
      const daysPublished =
        (now.getTime() - new Date(job.publishedAt).getTime()) / (1000 * 60 * 60 * 24);

      if (daysPublished > 3 && job.applicationsCount === 0) {
        alerts.push({
          id: `alert-zero-${job.id}`,
          type: 'zero_applications',
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.companyName,
          message: `Vaga publicada ha ${Math.floor(daysPublished)} dias sem nenhuma candidatura.`,
          severity: daysPublished > 7 ? 'critical' : 'warning',
          createdAt: job.publishedAt,
        });
      } else if (daysPublished > 7 && job.applicationsCount > 0 && job.applicationsCount < 5) {
        alerts.push({
          id: `alert-stagnant-${job.id}`,
          type: 'stagnant',
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.companyName,
          message: `Vaga publicada ha ${Math.floor(daysPublished)} dias com apenas ${job.applicationsCount} candidatura${job.applicationsCount !== 1 ? 's' : ''}.`,
          severity: 'warning',
          createdAt: job.publishedAt,
        });
      }
    }
  }

  return alerts.sort(
    (a, b) => (a.severity === 'critical' ? 0 : 1) - (b.severity === 'critical' ? 0 : 1),
  );
}

export function useAdminJobs() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // ---- Data fetching ----
  const {
    data: jobs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ADMIN_JOB_KEYS.list(),
    queryFn: async () => {
      const service = await getJobsService();
      return service.getAdminJobs();
    },
  });

  // Hires & Interviews — reference data pending dedicated service methods
  const hires: AdminHire[] = mockAdminHires;
  const interviews: AdminInterview[] = mockAdminInterviews;

  // Alerts — generated client-side from real job data
  const alerts = useMemo(() => generateAlerts(jobs), [jobs]);

  // ---- Computed values ----
  const stats = useMemo(
    () => ({
      totalActive: jobs.filter(
        (j) => j.status === 'active' || j.status === 'published',
      ).length,
      publishedThisMonth: jobs.filter((j) => {
        const d = new Date(j.publishedAt || j.createdAt);
        const now = new Date();
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }).length,
      pendingModeration: jobs.filter((j) => j.moderationStatus === 'pending')
        .length,
      finalized: jobs.filter((j) => j.finalizedAt).length,
      expired: jobs.filter((j) => j.finalizationReason === 'expired').length,
      totalApplications: jobs.reduce((s, j) => s + j.applicationsCount, 0),
      highlighted: jobs.filter((j) => j.isHighlighted).length,
      avgApplications: Math.round(
        jobs.reduce((s, j) => s + j.applicationsCount, 0) /
          Math.max(jobs.length, 1),
      ),
    }),
    [jobs],
  );

  const filterJobs = useCallback(
    (filters: {
      status?: string;
      moderationStatus?: ModerationStatus;
      company?: string;
      area?: string;
      location?: string;
      search?: string;
      isHighlighted?: boolean;
    }) => {
      return jobs.filter((j) => {
        if (filters.status && j.status !== filters.status) return false;
        if (
          filters.moderationStatus &&
          j.moderationStatus !== filters.moderationStatus
        )
          return false;
        if (filters.company && j.companyName !== filters.company) return false;
        if (filters.area && j.area !== filters.area) return false;
        if (filters.location && j.location !== filters.location) return false;
        if (
          filters.isHighlighted !== undefined &&
          j.isHighlighted !== filters.isHighlighted
        )
          return false;
        if (filters.search) {
          const s = filters.search.toLowerCase();
          if (
            !j.title.toLowerCase().includes(s) &&
            !j.companyName.toLowerCase().includes(s)
          )
            return false;
        }
        return true;
      });
    },
    [jobs],
  );

  const moderationQueue = useMemo(
    () =>
      jobs
        .filter((j) => j.moderationStatus === 'pending')
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [jobs],
  );

  const finalizedJobs = useMemo(
    () => jobs.filter((j) => j.finalizedAt),
    [jobs],
  );

  // ---- Helper to invalidate caches after mutations ----
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ADMIN_JOB_KEYS.all });
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  }, [queryClient]);

  // ---- Mutations ----
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const service = await getJobsService();
      return service.approveJob(id, user?.id);
    },
    onSuccess: invalidateAll,
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const service = await getJobsService();
      return service.rejectJob(id, reason, user?.id);
    },
    onSuccess: invalidateAll,
  });

  const correctionMutation = useMutation({
    mutationFn: async ({ id, fields }: { id: string; fields: string[] }) => {
      const service = await getJobsService();
      return service.requestCorrectionJob(id, fields, user?.id);
    },
    onSuccess: invalidateAll,
  });

  const highlightMutation = useMutation({
    mutationFn: async (id: string) => {
      const job = jobs.find((j) => j.id === id);
      const service = await getJobsService();
      return service.toggleHighlight(id, !job?.isHighlighted);
    },
    onSuccess: invalidateAll,
  });

  const noteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const service = await getJobsService();
      return service.addAdminNote(id, note);
    },
    onSuccess: invalidateAll,
  });

  // ---- Wrapper callbacks (preserve original hook API signatures) ----
  const approveJob = useCallback(
    (id: string) => approveMutation.mutate(id),
    [approveMutation],
  );

  const rejectJob = useCallback(
    (id: string, reason: string) => rejectMutation.mutate({ id, reason }),
    [rejectMutation],
  );

  const requestCorrection = useCallback(
    (id: string, fields: string[]) => correctionMutation.mutate({ id, fields }),
    [correctionMutation],
  );

  const toggleHighlight = useCallback(
    (id: string) => highlightMutation.mutate(id),
    [highlightMutation],
  );

  const addNote = useCallback(
    (id: string, note: string) => noteMutation.mutate({ id, note }),
    [noteMutation],
  );

  return {
    jobs,
    stats,
    filterJobs,
    approveJob,
    rejectJob,
    requestCorrection,
    toggleHighlight,
    addNote,
    moderationQueue,
    finalizedJobs,
    hires,
    interviews,
    alerts,
    isLoading,
    isError,
  };
}
