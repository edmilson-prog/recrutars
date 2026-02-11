/**
 * useApplications hook
 * PRD-007: Candidatura a Vagas
 * PRD-009: Adicionado cancelApplication para desistência
 * PRD-069: Migrated from mockData to service layer hooks
 * PRD-073: Added createApplicationAsync for highlights flow
 *
 * This hook wraps the new React Query hooks from useApplicationsQuery
 * while maintaining backward compatibility with existing consumers.
 */

import { useCallback } from 'react';
import {
  useApplicationsByCandidate,
  useCreateApplication,
  useUpdateApplicationStatus,
} from '@/hooks/useApplicationsQuery';
import type { Application } from '@/types';

export function useApplications(candidateId: string) {
  const { data: applications = [], isLoading } = useApplicationsByCandidate(candidateId);
  const createMutation = useCreateApplication();
  const updateStatusMutation = useUpdateApplicationStatus();

  const hasApplied = useCallback((jobId: string) => {
    return applications.some(app => app.jobId === jobId);
  }, [applications]);

  const getApplication = useCallback((jobId: string) => {
    return applications.find(app => app.jobId === jobId);
  }, [applications]);

  const createApplication = useCallback((
    jobId: string,
    jobTitle: string,
    companyName: string,
    candidateName: string,
    message?: string
  ): Application => {
    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId,
      candidateId,
      candidateName,
      jobTitle,
      companyName,
      status: 'pending',
      message,
      appliedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    // Fire the mutation (async, but we return optimistically)
    createMutation.mutate({
      jobId,
      candidateId,
      candidateName,
      jobTitle,
      companyName,
      message,
    });

    return newApp;
  }, [candidateId, createMutation]);

  /** Async version that waits for the real Application (with Supabase UUID) */
  const createApplicationAsync = useCallback(async (
    jobId: string,
    jobTitle: string,
    companyName: string,
    candidateName: string,
    message?: string
  ): Promise<Application> => {
    return createMutation.mutateAsync({
      jobId,
      candidateId,
      candidateName,
      jobTitle,
      companyName,
      message,
    });
  }, [candidateId, createMutation]);

  const cancelApplication = useCallback((applicationId: string) => {
    updateStatusMutation.mutate({
      id: applicationId,
      status: 'withdrawn',
    });
  }, [updateStatusMutation]);

  return {
    applications,
    isLoading,
    hasApplied,
    getApplication,
    createApplication,
    createApplicationAsync,
    cancelApplication,
  };
}
