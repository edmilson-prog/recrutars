/**
 * Feature Flags Query Hooks
 * PRD-066: Service Layer — React Query integration for Feature Flags module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeatureFlagsService } from '@/services/featureFlags/featureFlagsService';
import type { AddOverrideData } from '@/services/featureFlags/featureFlagsService';
import type { FeatureFlag, EvaluationContext } from '@/types/featureFlags';

const FLAGS_KEY = 'feature-flags';
const OVERRIDES_KEY = 'feature-flag-overrides';
const AUDIT_KEY = 'feature-flag-audit';

// ---------------------------------------------------------------------------
// Flags
// ---------------------------------------------------------------------------

export function useFlags() {
  return useQuery({
    queryKey: [FLAGS_KEY],
    queryFn: async () => {
      const svc = await getFeatureFlagsService();
      return svc.getFlags();
    },
  });
}

export function useFlag(key: string | undefined) {
  return useQuery({
    queryKey: [FLAGS_KEY, key],
    queryFn: async () => {
      if (!key) return null;
      const svc = await getFeatureFlagsService();
      return svc.getFlag(key);
    },
    enabled: !!key,
  });
}

// ---------------------------------------------------------------------------
// Overrides
// ---------------------------------------------------------------------------

export function useFlagOverrides(flagKey?: string) {
  return useQuery({
    queryKey: [OVERRIDES_KEY, flagKey],
    queryFn: async () => {
      const svc = await getFeatureFlagsService();
      return svc.getOverrides(flagKey);
    },
  });
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export function useFlagAudit(flagKey?: string) {
  return useQuery({
    queryKey: [AUDIT_KEY, flagKey],
    queryFn: async () => {
      const svc = await getFeatureFlagsService();
      return svc.getAudit(flagKey);
    },
  });
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

export function useEvaluateFlag(key: string | undefined, context: EvaluationContext | undefined) {
  return useQuery({
    queryKey: [FLAGS_KEY, 'evaluate', key, context],
    queryFn: async () => {
      if (!key || !context) return false;
      const svc = await getFeatureFlagsService();
      return svc.evaluateFlag(key, context);
    },
    enabled: !!key && !!context,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useUpdateFlag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      updates,
    }: {
      key: string;
      updates: Partial<FeatureFlag>;
    }) => {
      const svc = await getFeatureFlagsService();
      return svc.updateFlag(key, updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FLAGS_KEY] });
      qc.invalidateQueries({ queryKey: [AUDIT_KEY] });
    },
  });
}

export function useToggleFlag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const svc = await getFeatureFlagsService();
      return svc.toggleFlag(key);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FLAGS_KEY] });
      qc.invalidateQueries({ queryKey: [AUDIT_KEY] });
    },
  });
}

export function useKillSwitch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, reason }: { key: string; reason: string }) => {
      const svc = await getFeatureFlagsService();
      return svc.killSwitch(key, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FLAGS_KEY] });
      qc.invalidateQueries({ queryKey: [AUDIT_KEY] });
    },
  });
}

export function useUnkillSwitch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const svc = await getFeatureFlagsService();
      return svc.unkillSwitch(key);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FLAGS_KEY] });
      qc.invalidateQueries({ queryKey: [AUDIT_KEY] });
    },
  });
}

export function useAddOverride() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddOverrideData) => {
      const svc = await getFeatureFlagsService();
      return svc.addOverride(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [OVERRIDES_KEY] });
      qc.invalidateQueries({ queryKey: [AUDIT_KEY] });
    },
  });
}

export function useRemoveOverride() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getFeatureFlagsService();
      return svc.removeOverride(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [OVERRIDES_KEY] });
      qc.invalidateQueries({ queryKey: [AUDIT_KEY] });
    },
  });
}
