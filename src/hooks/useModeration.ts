/**
 * Hook for Moderation Configuration & Actions
 * PRD-058: Vagas & Moderacao "Sentinel"
 */

import { useState, useCallback } from 'react';
import type { ModerationConfig, ModerationAction } from '@/types';
import {
  mockModerationConfig,
  mockModerationActions,
} from '@/data/adminJobsData';

export function useModeration() {
  const [config, setConfig] = useState<ModerationConfig>(mockModerationConfig);
  const [actions, setActions] =
    useState<ModerationAction[]>(mockModerationActions);

  const updateConfig = useCallback((updates: Partial<ModerationConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const addRejectionReason = useCallback((reason: string) => {
    setConfig((prev) => ({
      ...prev,
      rejectionReasons: [...prev.rejectionReasons, reason],
    }));
  }, []);

  const removeRejectionReason = useCallback((reason: string) => {
    setConfig((prev) => ({
      ...prev,
      rejectionReasons: prev.rejectionReasons.filter((r) => r !== reason),
    }));
  }, []);

  const toggleAutoFlagRule = useCallback((ruleId: string) => {
    setConfig((prev) => ({
      ...prev,
      autoFlagRules: prev.autoFlagRules.map((r) =>
        r.id === ruleId ? { ...r, isActive: !r.isActive } : r
      ),
    }));
  }, []);

  const logAction = useCallback(
    (action: Omit<ModerationAction, 'id' | 'performedAt'>) => {
      setActions((prev) => [
        {
          ...action,
          id: `ma-${Date.now()}`,
          performedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    []
  );

  return {
    config,
    actions,
    updateConfig,
    addRejectionReason,
    removeRejectionReason,
    toggleAutoFlagRule,
    logAction,
  };
}
