/**
 * React Query hooks for Gauge-Pro service
 * PRD-066: Service Layer hooks for Gauge-Pro assessments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GaugeProAssessment, GaugeProResult } from '@/types/gaugePro';
import { getGaugeProService } from '@/services/gaugePro/gaugeProService';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const gaugeProKeys = {
  all: ['gaugePro'] as const,

  // Static data
  words: () => [...gaugeProKeys.all, 'words'] as const,
  scenarios: () => [...gaugeProKeys.all, 'scenarios'] as const,
  archetypes: () => [...gaugeProKeys.all, 'archetypes'] as const,
  archetype: (id: string) => [...gaugeProKeys.archetypes(), id] as const,

  // Sessions
  sessions: () => [...gaugeProKeys.all, 'sessions'] as const,
  session: (id: string) => [...gaugeProKeys.sessions(), id] as const,
  sessionByCandidate: (candidateId: string) =>
    [...gaugeProKeys.sessions(), 'candidate', candidateId] as const,

  // Results
  results: () => [...gaugeProKeys.all, 'results'] as const,
  result: (assessmentId: string) =>
    [...gaugeProKeys.results(), assessmentId] as const,
  resultByCandidate: (candidateId: string) =>
    [...gaugeProKeys.results(), 'candidate', candidateId] as const,
};

// ---------------------------------------------------------------------------
// Static Data Queries
// ---------------------------------------------------------------------------

export function useGaugeProWords() {
  return useQuery({
    queryKey: gaugeProKeys.words(),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getWords();
    },
    staleTime: 1000 * 60 * 60, // 1 hour — static data
  });
}

export function useGaugeProScenarios() {
  return useQuery({
    queryKey: gaugeProKeys.scenarios(),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getScenarios();
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useGaugeProArchetypes() {
  return useQuery({
    queryKey: gaugeProKeys.archetypes(),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getArchetypes();
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useGaugeProArchetype(id: string) {
  return useQuery({
    queryKey: gaugeProKeys.archetype(id),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getArchetype(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
}

// ---------------------------------------------------------------------------
// Session Queries
// ---------------------------------------------------------------------------

export function useGaugeProSession(id: string) {
  return useQuery({
    queryKey: gaugeProKeys.session(id),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getAssessment(id);
    },
    enabled: !!id,
  });
}

export function useGaugeProSessionByCandidate(candidateId: string) {
  return useQuery({
    queryKey: gaugeProKeys.sessionByCandidate(candidateId),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getAssessmentByCandidate(candidateId);
    },
    enabled: !!candidateId,
  });
}

// ---------------------------------------------------------------------------
// Result Queries
// ---------------------------------------------------------------------------

export function useGaugeProResult(assessmentId: string) {
  return useQuery({
    queryKey: gaugeProKeys.result(assessmentId),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getResult(assessmentId);
    },
    enabled: !!assessmentId,
  });
}

export function useGaugeProResultByCandidate(candidateId: string) {
  return useQuery({
    queryKey: gaugeProKeys.resultByCandidate(candidateId),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getResultByCandidate(candidateId);
    },
    enabled: !!candidateId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useStartGaugeProAssessment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string) => {
      const svc = await getGaugeProService();
      return svc.startAssessment(candidateId);
    },
    onSuccess: (_data, candidateId) => {
      qc.invalidateQueries({ queryKey: gaugeProKeys.sessions() });
      qc.invalidateQueries({
        queryKey: gaugeProKeys.sessionByCandidate(candidateId),
      });
    },
  });
}

export function useUpdateGaugeProAssessment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<GaugeProAssessment>;
    }) => {
      const svc = await getGaugeProService();
      return svc.updateAssessment(id, updates);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: gaugeProKeys.session(variables.id) });
    },
  });
}

export function useSaveGaugeProResult() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<GaugeProResult, 'id'>) => {
      const svc = await getGaugeProService();
      return svc.saveResult(data);
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: gaugeProKeys.results() });
      qc.invalidateQueries({
        queryKey: gaugeProKeys.result(result.assessmentId),
      });
      qc.invalidateQueries({
        queryKey: gaugeProKeys.resultByCandidate(result.candidateId),
      });
    },
  });
}
