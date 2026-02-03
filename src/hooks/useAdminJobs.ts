/**
 * Hook for Admin Jobs Management
 * PRD-058: Vagas & Moderacao "Sentinel"
 */

import { useState, useMemo, useCallback } from 'react';
import type {
  AdminJob,
  ModerationStatus,
  AdminHire,
  AdminInterview,
  JobAlert,
} from '@/types';
import {
  mockAdminJobs,
  mockAdminHires,
  mockAdminInterviews,
  mockJobAlerts,
} from '@/data/adminJobsData';

export function useAdminJobs() {
  const [jobs, setJobs] = useState<AdminJob[]>(mockAdminJobs);
  const [hires] = useState<AdminHire[]>(mockAdminHires);
  const [interviews] = useState<AdminInterview[]>(mockAdminInterviews);
  const [alerts] = useState<JobAlert[]>(mockJobAlerts);

  // Dashboard stats
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

  // Filter
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

  // Moderation actions
  const approveJob = useCallback((id: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              moderationStatus: 'approved' as ModerationStatus,
              moderatedAt: new Date().toISOString(),
              moderatedBy: 'Admin',
              status: 'active',
            }
          : j
      )
    );
  }, []);

  const rejectJob = useCallback((id: string, reason: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              moderationStatus: 'rejected' as ModerationStatus,
              moderatedAt: new Date().toISOString(),
              moderatedBy: 'Admin',
              rejectionReason: reason,
              status: 'rejected',
            }
          : j
      )
    );
  }, []);

  const requestCorrection = useCallback((id: string, fields: string[]) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              moderationStatus: 'correction_requested' as ModerationStatus,
              moderatedAt: new Date().toISOString(),
              moderatedBy: 'Admin',
              correctionFields: fields,
            }
          : j
      )
    );
  }, []);

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
