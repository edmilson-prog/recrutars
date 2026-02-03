/**
 * Feature Flags Hooks
 * PRD-062: Feature Flags "Switch"
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  FeatureFlag,
  FeatureFlagOverride,
  FeatureFlagAudit,
  FlagStatus,
  EvaluationContext,
  EvaluationResult,
} from '@/types';
import { mockFeatureFlags, mockFlagOverrides, mockFlagAuditLogs } from '@/data/featureFlagsData';
import { isFeatureEnabled, evaluateWithExplanation } from '@/lib/featureFlagEngine';

// ---------------------------------------------------------------------------
// Simple hook: check a single flag for a given context
// ---------------------------------------------------------------------------

export function useFeatureFlag(key: string, context?: EvaluationContext): boolean {
  const flag = mockFeatureFlags.find(f => f.key === key);
  if (!flag || !context) return false;
  return isFeatureEnabled(flag, context, mockFlagOverrides);
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
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFeatureFlags);
  const [overrides, setOverrides] = useState<FeatureFlagOverride[]>(mockFlagOverrides);
  const [auditLogs, setAuditLogs] = useState<FeatureFlagAudit[]>(mockFlagAuditLogs);

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

  // ---- Helpers ----
  const addAuditLog = useCallback((
    log: Omit<FeatureFlagAudit, 'id' | 'performedAt'>,
  ) => {
    const entry: FeatureFlagAudit = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      performedAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [entry, ...prev]);
  }, []);

  // ---- Toggle flag status (active <-> inactive) ----
  const toggleFlag = useCallback((id: string) => {
    setFlags(prev =>
      prev.map(flag => {
        if (flag.id !== id) return flag;
        const newStatus: FlagStatus = flag.status === 'active' ? 'inactive' : 'active';
        const updated: FeatureFlag = {
          ...flag,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        addAuditLog({
          flagKey: flag.key,
          flagName: flag.name,
          action: 'toggled',
          oldValue: flag.status,
          newValue: newStatus,
          performedBy: 'admin-1',
          performedByName: 'Ana Silva',
          details: `Status alterado de ${flag.status} para ${newStatus}.`,
        });
        return updated;
      }),
    );
  }, [addAuditLog]);

  // ---- Kill switch ----
  const killSwitch = useCallback((id: string, reason: string) => {
    setFlags(prev =>
      prev.map(flag => {
        if (flag.id !== id) return flag;
        const updated: FeatureFlag = {
          ...flag,
          status: 'killed',
          isKillSwitched: true,
          killSwitchReason: reason,
          killSwitchedAt: new Date().toISOString(),
          killSwitchedBy: 'admin-1',
          updatedAt: new Date().toISOString(),
        };
        addAuditLog({
          flagKey: flag.key,
          flagName: flag.name,
          action: 'killed',
          oldValue: flag.status,
          newValue: 'killed',
          performedBy: 'admin-1',
          performedByName: 'Ana Silva',
          details: `Kill switch ativado: ${reason}`,
        });
        return updated;
      }),
    );
  }, [addAuditLog]);

  const unkillSwitch = useCallback((id: string) => {
    setFlags(prev =>
      prev.map(flag => {
        if (flag.id !== id) return flag;
        const updated: FeatureFlag = {
          ...flag,
          status: 'inactive',
          isKillSwitched: false,
          killSwitchReason: undefined,
          killSwitchedAt: undefined,
          killSwitchedBy: undefined,
          updatedAt: new Date().toISOString(),
        };
        addAuditLog({
          flagKey: flag.key,
          flagName: flag.name,
          action: 'unkilled',
          oldValue: 'killed',
          newValue: 'inactive',
          performedBy: 'admin-1',
          performedByName: 'Ana Silva',
          details: 'Kill switch desativado. Flag retornou ao status inativo.',
        });
        return updated;
      }),
    );
  }, [addAuditLog]);

  // ---- CRUD overrides ----
  const addOverride = useCallback((
    override: Omit<FeatureFlagOverride, 'id' | 'createdAt'>,
  ) => {
    const newOverride: FeatureFlagOverride = {
      ...override,
      id: `ov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setOverrides(prev => [...prev, newOverride]);

    const flag = flags.find(f => f.key === override.flagKey);
    addAuditLog({
      flagKey: override.flagKey,
      flagName: flag?.name ?? override.flagKey,
      action: 'override_added',
      newValue: `${override.enabled ? 'habilitado' : 'desabilitado'} para ${override.targetName}`,
      performedBy: override.createdBy,
      performedByName: 'Ana Silva',
      details: override.reason ?? `Override de ${override.targetType} adicionado.`,
    });
  }, [flags, addAuditLog]);

  const removeOverride = useCallback((id: string) => {
    const override = overrides.find(o => o.id === id);
    if (!override) return;

    setOverrides(prev => prev.filter(o => o.id !== id));

    const flag = flags.find(f => f.key === override.flagKey);
    addAuditLog({
      flagKey: override.flagKey,
      flagName: flag?.name ?? override.flagKey,
      action: 'override_removed',
      oldValue: `${override.enabled ? 'habilitado' : 'desabilitado'} para ${override.targetName}`,
      performedBy: 'admin-1',
      performedByName: 'Ana Silva',
      details: `Override de ${override.targetType} removido para ${override.targetName}.`,
    });
  }, [flags, overrides, addAuditLog]);

  // ---- Update flag ----
  const updateFlag = useCallback((id: string, updates: Partial<FeatureFlag>) => {
    setFlags(prev =>
      prev.map(flag => {
        if (flag.id !== id) return flag;
        const updated: FeatureFlag = {
          ...flag,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        addAuditLog({
          flagKey: flag.key,
          flagName: flag.name,
          action: 'updated',
          oldValue: JSON.stringify(
            Object.fromEntries(
              Object.keys(updates).map(k => [k, (flag as Record<string, unknown>)[k]]),
            ),
          ),
          newValue: JSON.stringify(updates),
          performedBy: 'admin-1',
          performedByName: 'Ana Silva',
          details: `Flag atualizada: ${Object.keys(updates).join(', ')}`,
        });
        return updated;
      }),
    );
  }, [addAuditLog]);

  // ---- Evaluate ----
  const evaluate = useCallback((flagKey: string, context: EvaluationContext): boolean => {
    const flag = flags.find(f => f.key === flagKey);
    if (!flag) return false;
    return isFeatureEnabled(flag, context, overrides);
  }, [flags, overrides]);

  const evaluateDetailed = useCallback((flagKey: string, context: EvaluationContext): EvaluationResult => {
    const flag = flags.find(f => f.key === flagKey);
    if (!flag) {
      return {
        enabled: false,
        reason: 'Flag nao encontrada',
        chain: [{ step: 'Busca da Flag', checked: flagKey, result: false, detail: `Flag "${flagKey}" nao existe.` }],
      };
    }
    return evaluateWithExplanation(flag, context, overrides);
  }, [flags, overrides]);

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
  };
}
