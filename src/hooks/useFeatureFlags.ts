/**
 * Feature Flags Hooks (PRD-071 Migration)
 *
 * Backward-compatible wrappers that delegate to useFeatureFlagsQuery service hooks.
 * The admin management hook preserves the same API surface while flowing data
 * through the service layer.
 */

import { useMemo, useCallback } from 'react';
import type {
  FeatureFlag,
  FeatureFlagOverride,
  FlagStatus,
  EvaluationContext,
  EvaluationResult,
} from '@/types';
import {
  useFlags,
  useFlagOverrides,
  useFlagAudit,
  useToggleFlag,
  useKillSwitch,
  useUnkillSwitch,
  useUpdateFlag,
  useAddOverride,
  useRemoveOverride,
  useEvaluateFlag,
} from './useFeatureFlagsQuery';

// ---------------------------------------------------------------------------
// Simple hook: check a single flag for a given context
// ---------------------------------------------------------------------------

export function useFeatureFlag(key: string, context?: EvaluationContext): boolean {
  const { data: enabled = false } = useEvaluateFlag(key, context);
  return enabled;
}

// ---------------------------------------------------------------------------
// Full management hook for admin UI
// ---------------------------------------------------------------------------

interface FlagFilters {
  status?: FlagStatus;
  scope?: string;
  category?: string;
  search?: string;
}

export function useFeatureFlags() {
  const { data: flags = [], isLoading: flagsLoading, error: flagsError } = useFlags();
  const { data: overrides = [], isLoading: overridesLoading } = useFlagOverrides();
  const { data: auditLogs = [], isLoading: auditLoading } = useFlagAudit();

  const toggleFlagMutation = useToggleFlag();
  const killSwitchMutation = useKillSwitch();
  const unkillSwitchMutation = useUnkillSwitch();
  const updateFlagMutation = useUpdateFlag();
  const addOverrideMutation = useAddOverride();
  const removeOverrideMutation = useRemoveOverride();

  const isLoading = flagsLoading || overridesLoading || auditLoading;
  const error = flagsError;

  // ---- Stats ----
  const stats = useMemo(() => ({
    total: flags.length,
    active: flags.filter(f => f.status === 'active').length,
    inactive: flags.filter(f => f.status === 'inactive').length,
    killed: flags.filter(f => f.isKillSwitched).length,
    beta: flags.filter(f => f.category === 'beta').length,
    byScope: {
      candidate: flags.filter(f => f.scope === 'candidate').length,
      company: flags.filter(f => f.scope === 'company').length,
      all: flags.filter(f => f.scope === 'all').length,
    },
  }), [flags]);

  // ---- Toggle flag status (active <-> inactive) ----
  const toggleFlag = useCallback((id: string) => {
    const flag = flags.find(f => f.id === id);
    if (flag) {
      toggleFlagMutation.mutate(flag.key);
    }
  }, [flags, toggleFlagMutation]);

  // ---- Kill switch ----
  const killSwitch = useCallback((id: string, reason: string) => {
    const flag = flags.find(f => f.id === id);
    if (flag) {
      killSwitchMutation.mutate({ key: flag.key, reason });
    }
  }, [flags, killSwitchMutation]);

  const unkillSwitch = useCallback((id: string) => {
    const flag = flags.find(f => f.id === id);
    if (flag) {
      unkillSwitchMutation.mutate(flag.key);
    }
  }, [flags, unkillSwitchMutation]);

  // ---- CRUD overrides ----
  const addOverride = useCallback((
    override: Omit<FeatureFlagOverride, 'id' | 'createdAt'>,
  ) => {
    addOverrideMutation.mutate({
      flagKey: override.flagKey,
      targetType: override.targetType as 'user' | 'company',
      targetId: override.targetId,
      targetName: override.targetName,
      enabled: override.enabled,
      reason: override.reason,
    });
  }, [addOverrideMutation]);

  const removeOverride = useCallback((id: string) => {
    removeOverrideMutation.mutate(id);
  }, [removeOverrideMutation]);

  // ---- Update flag ----
  const updateFlag = useCallback((id: string, updates: Partial<FeatureFlag>) => {
    const flag = flags.find(f => f.id === id);
    if (flag) {
      updateFlagMutation.mutate({ key: flag.key, updates });
    }
  }, [flags, updateFlagMutation]);

  // ---- Evaluate ----
  const evaluate = useCallback((_flagKey: string, _context: EvaluationContext): boolean => {
    // For synchronous evaluation, consumers should use useFeatureFlag() or useEvaluateFlag()
    console.warn('[useFeatureFlags] evaluate is synchronous and cannot call async service. Use useEvaluateFlag() hook instead.');
    return false;
  }, []);

  const evaluateDetailed = useCallback((_flagKey: string, _context: EvaluationContext): EvaluationResult => {
    console.warn('[useFeatureFlags] evaluateDetailed is synchronous and cannot call async service. Use useEvaluateFlag() hook instead.');
    return {
      enabled: false,
      reason: 'Use useEvaluateFlag() hook for async evaluation',
      chain: [],
    };
  }, []);

  // ---- Filter ----
  const filterFlags = useCallback((filters: FlagFilters): FeatureFlag[] => {
    return flags.filter(flag => {
      if (filters.status && flag.status !== filters.status) return false;
      if (filters.scope && flag.scope !== filters.scope) return false;
      if (filters.category && flag.category !== filters.category) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesName = flag.name.toLowerCase().includes(search);
        const matchesKey = flag.key.toLowerCase().includes(search);
        const matchesDesc = flag.description.toLowerCase().includes(search);
        if (!matchesName && !matchesKey && !matchesDesc) return false;
      }
      return true;
    });
  }, [flags]);

  return {
    flags,
    stats,
    overrides,
    auditLogs,
    toggleFlag,
    killSwitch,
    unkillSwitch,
    addOverride,
    removeOverride,
    updateFlag,
    evaluate,
    evaluateDetailed,
    filterFlags,
    isLoading,
    error,
  };
}
