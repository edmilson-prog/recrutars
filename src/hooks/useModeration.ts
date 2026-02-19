/**
 * Hook for Moderation Configuration & Actions
 * PRD-058: Vagas & Moderacao "Sentinel"
 *
 * Config persisted to localStorage with fallback to defaults.
 * Actions (audit log) persisted to localStorage (capped at 200 entries).
 */

import { useState, useCallback, useEffect } from 'react';
import type { ModerationConfig, ModerationAction } from '@/types';
import {
  mockModerationConfig,
} from '@/data/adminJobsData';

const STORAGE_KEY_CONFIG = 'admin_moderation_config';
const STORAGE_KEY_ACTIONS = 'admin_moderation_actions';
const MAX_ACTIONS = 200;

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
  } catch {
    // Corrupted data — fall back to defaults
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function useModeration() {
  const [config, setConfig] = useState<ModerationConfig>(() =>
    loadFromStorage<ModerationConfig>(STORAGE_KEY_CONFIG, mockModerationConfig),
  );

  const [actions, setActions] = useState<ModerationAction[]>(() =>
    loadFromStorage<ModerationAction[]>(STORAGE_KEY_ACTIONS, []),
  );

  // Persist config changes
  useEffect(() => {
    saveToStorage(STORAGE_KEY_CONFIG, config);
  }, [config]);

  // Persist action log changes
  useEffect(() => {
    saveToStorage(STORAGE_KEY_ACTIONS, actions);
  }, [actions]);

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
        r.id === ruleId ? { ...r, isActive: !r.isActive } : r,
      ),
    }));
  }, []);

  const logAction = useCallback(
    (action: Omit<ModerationAction, 'id' | 'performedAt'>) => {
      setActions((prev) => {
        const newActions = [
          {
            ...action,
            id: `ma-${Date.now()}`,
            performedAt: new Date().toISOString(),
          },
          ...prev,
        ];
        // Cap the log to prevent localStorage bloat
        return newActions.slice(0, MAX_ACTIONS);
      });
    },
    [],
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
