/**
 * Hook for Admin Jobs Management
 * PRD-058: Vagas & Moderação "Sentinel"
 *
 * Core data (jobs, moderation actions) now fetched from Supabase.
 * Secondary features (hires, interviews, alerts) remain as mock pending dedicated services.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
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
  mockJobAlerts,
} from '@/data/adminJobsData';
import { getJobsService } from '@/services/jobs/jobsService';

export function useAdminJobs() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hires] = useState<AdminHire[]>(mockAdminHires);
  const [interviews] = useState<AdminInterview[]>(mockAdminInterviews);
  const [alerts] = useState<JobAlert[]>(mockJobAlerts);

  // Load real jobs from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const service = await getJobsService();
        const adminJobs = await service.getAdminJobs();
        if (!cancelled) setJobs(adminJobs);
      } catch (err) {
        console.error('[useAdminJobs] Failed to load jobs from Supabase:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Dashboard stats — computed from real jobs
  const stats = useMemo(
    () => ({
      totalActive: jobs.filter(
        (j) => j.status === 'active' || j.status === 'published'
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
          Math.max(jobs.length, 1)
      ),
    }),
    [jobs]
  );

  // Filter — operates on real data
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
    [jobs]
  );

  // Moderation actions — call Supabase then optimistically update local state

  const approveJob = useCallback(async (id: string) => {
    try {
      const service = await getJobsService();
      await service.approveJob(id);
    } catch (err) {
      console.error('[useAdminJobs] approveJob failed:', err);
    }
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              moderationStatus: 'approved' as ModerationStatus,
              moderatedAt: new Date().toISOString(),
              status: 'active',
            }
          : j
      )
    );
  }, []);

  const rejectJob = useCallback(async (id: string, reason: string) => {
    try {
      const service = await getJobsService();
      await service.rejectJob(id, reason);
    } catch (err) {
      console.error('[useAdminJobs] rejectJob failed:', err);
    }
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              moderationStatus: 'rejected' as ModerationStatus,
              moderatedAt: new Date().toISOString(),
              rejectionReason: reason,
              status: 'rejected',
            }
          : j
      )
    );
  }, []);

  const requestCorrection = useCallback(async (id: string, fields: string[]) => {
    try {
      const service = await getJobsService();
      await service.requestCorrectionJob(id, fields);
    } catch (err) {
      console.error('[useAdminJobs] requestCorrection failed:', err);
    }
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              moderationStatus: 'correction_requested' as ModerationStatus,
              moderatedAt: new Date().toISOString(),
              correctionFields: fields,
            }
          : j
      )
    );
  }, []);

  // Secondary actions — local only (secondary features, no Supabase yet)

  const toggleHighlight = useCallback((id: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, isHighlighted: !j.isHighlighted } : j
      )
    );
  }, []);

  const addNote = useCallback((id: string, note: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              adminNotes: (j.adminNotes ? j.adminNotes + '\n' : '') + note,
            }
          : j
      )
    );
  }, []);

  // Pending moderation queue (oldest first)
  const moderationQueue = useMemo(
    () =>
      jobs
        .filter((j) => j.moderationStatus === 'pending')
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    [jobs]
  );

  // Finalized jobs
  const finalizedJobs = useMemo(
    () => jobs.filter((j) => j.finalizedAt),
    [jobs]
  );

  return {
    jobs,
    isLoading,
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
  };
}
