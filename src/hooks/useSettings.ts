/**
 * useSettings Hook (v2 — Supabase-backed)
 * PRD-045: Gerenciamento de estado e persistência de configurações
 * Migrado de localStorage para Supabase com migração automática de dados legados
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import type {
  ConfigCategory,
  ConfigState,
  ConfigHistoryEntry,
  ConfigPanel,
} from '@/types/settings';
import { getDefaultValues } from '@/data/settingsConfig';
import {
  useSettingsData,
  useSettingsHistory,
  useSaveSection,
  useMigrateSettings,
} from './useSettingsQuery';

const MIGRATED_KEY_PREFIX = 'recrutars-settings-migrated-';

interface UseSettingsOptions {
  categories: ConfigCategory[];
  panel: ConfigPanel;
  userId?: string;
  userName?: string;
  entityId?: string; // companyId ou candidateId
}

interface UseSettingsReturn {
  values: ConfigState;
  history: ConfigHistoryEntry[];
  updateValue: (
    categoryKey: string,
    subcategoryKey: string,
    fieldKey: string,
    value: unknown
  ) => void;
  saveSection: (categoryKey: string, subcategoryKey: string) => void;
  restoreDefaults: (categoryKey: string, subcategoryKey: string) => void;
  isLoading: boolean;
}

/** Legacy localStorage key for backward compat / migration */
function getLegacyStorageKey(panel: ConfigPanel, entityId?: string): string {
  const base = `recrutars-settings-${panel}`;
  return entityId ? `${base}-${entityId}` : base;
}

/** Deep-merge stored values onto defaults so new fields get their defaults */
function mergeWithDefaults(
  defaults: ConfigState,
  stored: ConfigState,
): ConfigState {
  const merged = structuredClone(defaults);
  for (const catKey of Object.keys(stored)) {
    if (!merged[catKey]) merged[catKey] = {};
    for (const subKey of Object.keys(stored[catKey] ?? {})) {
      merged[catKey][subKey] = {
        ...(merged[catKey][subKey] ?? {}),
        ...(stored[catKey]?.[subKey] ?? {}),
      };
    }
  }
  return merged;
}

function loadLegacyStorage(key: string): ConfigState | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useSettings({
  categories,
  panel,
  userId = 'system',
  userName = 'Sistema',
  entityId,
}: UseSettingsOptions): UseSettingsReturn {
  const defaultValues = useMemo(
    () => getDefaultValues(categories),
    [categories],
  );

  // Supabase data
  const { data: remoteValues, isLoading: isLoadingRemote } = useSettingsData(
    panel,
    entityId,
  );
  const { data: remoteHistory = [] } = useSettingsHistory(panel, entityId);
  const saveMutation = useSaveSection();
  const migrateMutation = useMigrateSettings();

  // Refs to avoid stale closures and prevent re-renders from resetting state
  const saveMutationRef = useRef(saveMutation);
  saveMutationRef.current = saveMutation;
  const migrateMutationRef = useRef(migrateMutation);
  migrateMutationRef.current = migrateMutation;

  // Local optimistic state (for in-flight edits before save)
  const [localValues, setLocalValues] = useState<ConfigState>(defaultValues);
  const [isReady, setIsReady] = useState(false);
  const migrationAttempted = useRef(false);

  // Sync remote values to local state when they arrive
  useEffect(() => {
    if (isLoadingRemote) return;

    const hasRemoteData =
      remoteValues && Object.keys(remoteValues).length > 0;

    const legacyKey = getLegacyStorageKey(panel, entityId);
    const migratedKey = MIGRATED_KEY_PREFIX + legacyKey;
    const alreadyMigrated = localStorage.getItem(migratedKey) === 'true';

    if (!hasRemoteData && !alreadyMigrated && !migrationAttempted.current) {
      migrationAttempted.current = true;
      // Try to migrate from localStorage
      const legacy = loadLegacyStorage(legacyKey);
      if (legacy && Object.keys(legacy).length > 0) {
        const merged = mergeWithDefaults(defaultValues, legacy);
        setLocalValues(merged);
        setIsReady(true);

        migrateMutationRef.current.mutate(
          { panel, values: merged, entityId, userId },
          {
            onSuccess: () => {
              localStorage.setItem(migratedKey, 'true');
            },
          },
        );
        return;
      }
    }

    // Normal path: merge remote with defaults
    const merged = mergeWithDefaults(
      defaultValues,
      remoteValues ?? {},
    );
    setLocalValues(merged);
    setIsReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteValues, isLoadingRemote, defaultValues, panel, entityId, userId]);

  // Atualizar valor (sem salvar)
  const updateValue = useCallback(
    (
      categoryKey: string,
      subcategoryKey: string,
      fieldKey: string,
      value: unknown,
    ) => {
      setLocalValues((prev) => ({
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          [subcategoryKey]: {
            ...prev[categoryKey]?.[subcategoryKey],
            [fieldKey]: value,
          },
        },
      }));
    },
    [],
  );

  // Salvar seção no Supabase
  const saveSection = useCallback(
    (categoryKey: string, subcategoryKey: string) => {
      saveMutationRef.current.mutate(
        {
          panel,
          categoryKey,
          subcategoryKey,
          values: localValues,
          categories,
          userId,
          userName,
          entityId,
        },
        {
          onSuccess: () => toast.success('Configurações salvas com sucesso!'),
          onError: (err) =>
            toast.error(
              `Erro ao salvar: ${(err as Error).message}`,
            ),
        },
      );
    },
    [panel, localValues, categories, userId, userName, entityId],
  );

  // Restaurar padrões de uma seção
  const restoreDefaults = useCallback(
    (categoryKey: string, subcategoryKey: string) => {
      const category = categories.find((c) => c.key === categoryKey);
      const subcategory = category?.subcategories.find(
        (s) => s.key === subcategoryKey,
      );

      if (!subcategory) return;

      const sectionDefaults: Record<string, unknown> = {};
      for (const field of subcategory.fields) {
        sectionDefaults[field.key] = field.defaultValue;
      }

      setLocalValues((prev) => ({
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          [subcategoryKey]: sectionDefaults,
        },
      }));

      toast.success('Valores padrão restaurados!');
    },
    [categories],
  );

  return {
    values: localValues,
    history: remoteHistory,
    updateValue,
    saveSection,
    restoreDefaults,
    isLoading: isLoadingRemote && !isReady,
  };
}
