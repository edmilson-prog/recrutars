/**
 * Job Assessments React Query Hooks
 * PRD-048: Teste por Vaga
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getJobAssessmentsService,
  type CreateJobAssessmentData,
  type CreateInviteData,
} from '@/services/jobAssessments/jobAssessmentsService';
import type { RecruiterDecision } from '@/types/assessment';

// ── Query Key Factory ────────────────────────────────────────

export const jobAssessmentKeys = {
  all: ['jobAssessments'] as const,
  lists: () => [...jobAssessmentKeys.all, 'list'] as const,
  byJob: (jobId: string) => [...jobAssessmentKeys.all, 'job', jobId] as const,
  byCompany: (companyId: string) => [...jobAssessmentKeys.all, 'company', companyId] as const,
  detail: (id: string) => [...jobAssessmentKeys.all, 'detail', id] as const,
  invites: (assessmentId: string) => [...jobAssessmentKeys.all, 'invites', assessmentId] as const,
  results: (assessmentId: string) => [...jobAssessmentKeys.all, 'results', assessmentId] as const,
  magicToken: (token: string) => [...jobAssessmentKeys.all, 'token', token] as const,
};

// ── Query Hooks ──────────────────────────────────────────────

export function useJobAssessmentByJob(jobId: string) {
  return useQuery({
    queryKey: jobAssessmentKeys.byJob(jobId),
    queryFn: async () => {
      const service = await getJobAssessmentsService();
      return service.getAssessmentByJobId(jobId);
    },
    enabled: !!jobId,
  });
}

export function useJobAssessmentDetail(id: string) {
  return useQuery({
    queryKey: jobAssessmentKeys.detail(id),
    queryFn: async () => {
      const service = await getJobAssessmentsService();
      return service.getAssessmentById(id);
    },
    enabled: !!id,
  });
}

export function useJobAssessmentsByCompany(companyId: string) {
  return useQuery({
    queryKey: jobAssessmentKeys.byCompany(companyId),
    queryFn: async () => {
      const service = await getJobAssessmentsService();
      return service.getAssessmentsByCompany(companyId);
    },
    enabled: !!companyId,
  });
}

export function useJobAssessmentInvites(assessmentId: string) {
  return useQuery({
    queryKey: jobAssessmentKeys.invites(assessmentId),
    queryFn: async () => {
      const service = await getJobAssessmentsService();
      return service.getInvitesByAssessmentId(assessmentId);
    },
    enabled: !!assessmentId,
  });
}

export function useJobAssessmentResults(assessmentId: string) {
  return useQuery({
    queryKey: jobAssessmentKeys.results(assessmentId),
    queryFn: async () => {
      const service = await getJobAssessmentsService();
      return service.getResultsByAssessmentId(assessmentId);
    },
    enabled: !!assessmentId,
  });
}

export function useJobAssessmentInviteByToken(token: string) {
  return useQuery({
    queryKey: jobAssessmentKeys.magicToken(token),
    queryFn: async () => {
      const service = await getJobAssessmentsService();
      return service.getInviteByMagicToken(token);
    },
    enabled: !!token,
  });
}

// ── Mutation Hooks ───────────────────────────────────────────

export function useCreateJobAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateJobAssessmentData) => {
      const service = await getJobAssessmentsService();
      return service.createAssessment(data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: jobAssessmentKeys.all });
      queryClient.invalidateQueries({ queryKey: jobAssessmentKeys.byJob(result.jobId) });
    },
  });
}

export function useUpdateJobAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateJobAssessmentData> }) => {
      const service = await getJobAssessmentsService();
      return service.updateAssessment(id, updates);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: jobAssessmentKeys.detail(result.id) });
      queryClient.invalidateQueries({ queryKey: jobAssessmentKeys.byJob(result.jobId) });
      queryClient.invalidateQueries({ queryKey: jobAssessmentKeys.lists() });
    },
  });
}

export function usePublishJobAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const service = await getJobAssessmentsService();
      return service.publishAssessment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobAssessmentKeys.all });
    },
  });
}

export function useArchiveJobAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const service = await getJobAssessmentsService();
      return service.archiveAssessment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobAssessmentKeys.all });
    },
  });
}

export function useDeleteJobAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const service = await getJobAssessmentsService();
      return service.deleteAssessment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobAssessmentKeys.all });
    },
  });
}

export function useCreateJobAssessmentInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInviteData) => {
      const service = await getJobAssessmentsService();
      return service.createInvite(data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: jobAssessmentKeys.invites(result.jobAssessmentId),
      });
    },
  });
}

export function useCreateBulkJobAssessmentInvites() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invites: CreateInviteData[]) => {
      const service = await getJobAssessmentsService();
      return service.createBulkInvites(invites);
    },
    onSuccess: (results) => {
      if (results.length > 0) {
        queryClient.invalidateQueries({
          queryKey: jobAssessmentKeys.invites(results[0].jobAssessmentId),
        });
      }
    },
  });
}

export function useCancelJobAssessmentInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ inviteId, assessmentId }: { inviteId: string; assessmentId: string }) => {
      const service = await getJobAssessmentsService();
      return service.cancelInvite(inviteId);
    },
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({
        queryKey: jobAssessmentKeys.invites(assessmentId),
      });
    },
  });
}

export function useResendJobAssessmentInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ inviteId, assessmentId }: { inviteId: string; assessmentId: string }) => {
      const service = await getJobAssessmentsService();
      return service.resendInvite(inviteId);
    },
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({
        queryKey: jobAssessmentKeys.invites(assessmentId),
      });
    },
  });
}

export function useUpdateRecruiterDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      resultId,
      decision,
      notes,
    }: {
      resultId: string;
      assessmentId: string;
      decision: RecruiterDecision;
      notes?: string;
    }) => {
      const service = await getJobAssessmentsService();
      return service.updateRecruiterDecision(resultId, decision, notes);
    },
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({
        queryKey: jobAssessmentKeys.results(assessmentId),
      });
    },
  });
}
