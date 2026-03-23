/**
 * React Query hooks for Gauge-Pro Admin CRUD operations
 * Fase 2: Service layer + hooks for admin management of words, scenarios, archetypes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AdjectiveWord,
  Scenario,
  ScenarioOption,
  ArchetypeProfile,
  GaugeProDimension,
} from '@/types/gaugePro';
import { getGaugeProService } from '@/services/gaugePro/gaugeProService';
import { gaugeProKeys } from '@/hooks/useGaugeProQuery';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const gaugeProAdminKeys = {
  all: ['gaugeProAdmin'] as const,
  words: () => [...gaugeProAdminKeys.all, 'words'] as const,
  scenarios: () => [...gaugeProAdminKeys.all, 'scenarios'] as const,
  archetypes: () => [...gaugeProAdminKeys.all, 'archetypes'] as const,
  usageCount: (type: string, id: string | number) =>
    [...gaugeProAdminKeys.all, 'usage', type, id] as const,
};

// ---------------------------------------------------------------------------
// Query Hooks — Words
// ---------------------------------------------------------------------------

export function useGaugeProAdminWords() {
  return useQuery({
    queryKey: gaugeProAdminKeys.words(),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getAdminWords();
    },
  });
}

export function useWordUsageCount(id: number) {
  return useQuery({
    queryKey: gaugeProAdminKeys.usageCount('word', id),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getWordUsageCount(id);
    },
    enabled: id > 0,
  });
}

// ---------------------------------------------------------------------------
// Query Hooks — Scenarios
// ---------------------------------------------------------------------------

export function useGaugeProAdminScenarios() {
  return useQuery({
    queryKey: gaugeProAdminKeys.scenarios(),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getAdminScenarios();
    },
  });
}

export function useScenarioUsageCount(id: number) {
  return useQuery({
    queryKey: gaugeProAdminKeys.usageCount('scenario', id),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getScenarioUsageCount(id);
    },
    enabled: id > 0,
  });
}

// ---------------------------------------------------------------------------
// Query Hooks — Archetypes
// ---------------------------------------------------------------------------

export function useGaugeProAdminArchetypes() {
  return useQuery({
    queryKey: gaugeProAdminKeys.archetypes(),
    queryFn: async () => {
      const svc = await getGaugeProService();
      return svc.getAdminArchetypes();
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations — Words
// ---------------------------------------------------------------------------

export function useUpdateWord() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { text?: string; isActive?: boolean };
    }) => {
      const svc = await getGaugeProService();
      return svc.updateWord(id, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gaugeProAdminKeys.words() });
      qc.invalidateQueries({ queryKey: gaugeProKeys.words() });
    },
  });
}

export function useCreateWord() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      text: string;
      dimension: GaugeProDimension;
      polarity: 'high' | 'low';
    }) => {
      const svc = await getGaugeProService();
      return svc.createWord(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gaugeProAdminKeys.words() });
      qc.invalidateQueries({ queryKey: gaugeProKeys.words() });
    },
  });
}

export function useToggleWordActive() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const svc = await getGaugeProService();
      return svc.toggleWordActive(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gaugeProAdminKeys.words() });
      qc.invalidateQueries({ queryKey: gaugeProKeys.words() });
    },
  });
}

export function useUpdateWordSortOrders() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: number; sortOrder: number }[]) => {
      const svc = await getGaugeProService();
      return svc.updateWordSortOrders(updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gaugeProAdminKeys.words() });
      qc.invalidateQueries({ queryKey: gaugeProKeys.words() });
    },
  });
}

export function useUpdateScenarioSortOrders() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: number; sortOrder: number }[]) => {
      const svc = await getGaugeProService();
      return svc.updateScenarioSortOrders(updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gaugeProAdminKeys.scenarios() });
      qc.invalidateQueries({ queryKey: gaugeProKeys.scenarios() });
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations — Scenarios
// ---------------------------------------------------------------------------

export function useUpdateScenario() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        title?: string;
        situation?: string;
        sortOrder?: number;
        options?: ScenarioOption[];
        isActive?: boolean;
      };
    }) => {
      const svc = await getGaugeProService();
      return svc.updateScenario(id, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gaugeProAdminKeys.scenarios() });
      qc.invalidateQueries({ queryKey: gaugeProKeys.scenarios() });
    },
  });
}

export function useCreateScenario() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      situation: string;
      sortOrder: number;
      options: ScenarioOption[];
    }) => {
      const svc = await getGaugeProService();
      return svc.createScenario(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gaugeProAdminKeys.scenarios() });
      qc.invalidateQueries({ queryKey: gaugeProKeys.scenarios() });
    },
  });
}

export function useToggleScenarioActive() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const svc = await getGaugeProService();
      return svc.toggleScenarioActive(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gaugeProAdminKeys.scenarios() });
      qc.invalidateQueries({ queryKey: gaugeProKeys.scenarios() });
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations — Archetypes
// ---------------------------------------------------------------------------

export function useUpdateArchetype() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<ArchetypeProfile, 'id'>> & { isActive?: boolean };
    }) => {
      const svc = await getGaugeProService();
      return svc.updateArchetype(id, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gaugeProAdminKeys.archetypes() });
      qc.invalidateQueries({ queryKey: gaugeProKeys.archetypes() });
    },
  });
}

export function useToggleArchetypeActive() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getGaugeProService();
      return svc.toggleArchetypeActive(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gaugeProAdminKeys.archetypes() });
      qc.invalidateQueries({ queryKey: gaugeProKeys.archetypes() });
    },
  });
}
