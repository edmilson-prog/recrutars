/**
 * React Query hooks for Assessments service
 * PRD-066: Service Layer hooks for question bank + behavioral assessments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QuestionFilters } from '@/types/assessment';
import { getAssessmentsService } from '@/services/assessments/assessmentsService';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const assessmentsKeys = {
  all: ['assessments'] as const,

  // Question bank
  dimensions: () => [...assessmentsKeys.all, 'dimensions'] as const,
  categories: (dimensionId?: string) =>
    [...assessmentsKeys.all, 'categories', dimensionId ?? 'all'] as const,
  questions: (filters?: QuestionFilters) =>
    [...assessmentsKeys.all, 'questions', filters ?? {}] as const,

  // Sessions
  sessions: () => [...assessmentsKeys.all, 'sessions'] as const,
  session: (id: string) => [...assessmentsKeys.sessions(), id] as const,

  // Results
  results: () => [...assessmentsKeys.all, 'results'] as const,
  result: (assessmentId: string) =>
    [...assessmentsKeys.results(), assessmentId] as const,
  resultByCandidate: (candidateId: string) =>
    [...assessmentsKeys.results(), 'candidate', candidateId] as const,
};

// ---------------------------------------------------------------------------
// Question Bank Queries
// ---------------------------------------------------------------------------

export function useAssessmentDimensions() {
  return useQuery({
    queryKey: assessmentsKeys.dimensions(),
    queryFn: async () => {
      const svc = await getAssessmentsService();
      return svc.getDimensions();
    },
  });
}

export function useAssessmentCategoriesQuery(dimensionId?: string) {
  return useQuery({
    queryKey: assessmentsKeys.categories(dimensionId),
    queryFn: async () => {
      const svc = await getAssessmentsService();
      return svc.getCategories(dimensionId);
    },
  });
}

export function useAssessmentQuestionsQuery(filters?: QuestionFilters) {
  return useQuery({
    queryKey: assessmentsKeys.questions(filters),
    queryFn: async () => {
      const svc = await getAssessmentsService();
      return svc.getQuestions(filters);
    },
  });
}

// ---------------------------------------------------------------------------
// Session Queries
// ---------------------------------------------------------------------------

export function useAssessmentSession(id: string) {
  return useQuery({
    queryKey: assessmentsKeys.session(id),
    queryFn: async () => {
      const svc = await getAssessmentsService();
      return svc.getAssessment(id);
    },
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Result Queries
// ---------------------------------------------------------------------------

export function useAssessmentResult(assessmentId: string) {
  return useQuery({
    queryKey: assessmentsKeys.result(assessmentId),
    queryFn: async () => {
      const svc = await getAssessmentsService();
      return svc.getResult(assessmentId);
    },
    enabled: !!assessmentId,
  });
}

export function useAssessmentResultByCandidate(candidateId: string) {
  return useQuery({
    queryKey: assessmentsKeys.resultByCandidate(candidateId),
    queryFn: async () => {
      const svc = await getAssessmentsService();
      return svc.getResultByCandidate(candidateId);
    },
    enabled: !!candidateId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useStartAssessment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string) => {
      const svc = await getAssessmentsService();
      return svc.startAssessment(candidateId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assessmentsKeys.sessions() });
    },
  });
}

export function useSubmitAssessmentResponse() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assessmentId,
      questionId,
      response,
    }: {
      assessmentId: string;
      questionId: string;
      response: string;
    }) => {
      const svc = await getAssessmentsService();
      return svc.submitResponse(assessmentId, questionId, response);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: assessmentsKeys.session(variables.assessmentId),
      });
    },
  });
}

export function useCompleteAssessment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (assessmentId: string) => {
      const svc = await getAssessmentsService();
      return svc.completeAssessment(assessmentId);
    },
    onSuccess: (_data, assessmentId) => {
      qc.invalidateQueries({ queryKey: assessmentsKeys.session(assessmentId) });
      qc.invalidateQueries({ queryKey: assessmentsKeys.results() });
    },
  });
}
