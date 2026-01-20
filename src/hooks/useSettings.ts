/**
 * useSettings Hook
 * PRD-045: Gerenciamento de estado e persistência de configurações
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import type {
  ConfigCategory,
  ConfigState,
  ConfigHistoryEntry,
  ConfigPanel,
} from '@/types/settings';
import { getDefaultValues } from '@/data/settingsConfig';

const MAX_HISTORY_ENTRIES = 100;

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

function getStorageKey(panel: ConfigPanel, entityId?: string): string {
  const base = `recrutars-settings-${panel}`;
  return entityId ? `${base}-${entityId}` : base;
}

function getHistoryKey(panel: ConfigPanel, entityId?: string): string {
  const base = `recrutars-settings-history-${panel}`;
  return entityId ? `${base}-${entityId}` : base;
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
}

export function useSettings({
  categories,
  panel,
  userId = 'system',
  userName = 'Sistema',
  entityId,
}: UseSettingsOptions): UseSettingsReturn {
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = getStorageKey(panel, entityId);
  const historyKey = getHistoryKey(panel, entityId);

  // Valores padrão (memoizado para evitar recálculo)
  const defaultValues = useMemo(
    () => getDefaultValues(categories),
    [categories]
  );

  // Estado dos valores
  const [values, setValues] = useState<ConfigState>(() =>
    loadFromStorage(storageKey, defaultValues)
  );

  // Estado do histórico
  const [history, setHistory] = useState<ConfigHistoryEntry[]>(() =>
    loadFromStorage(historyKey, [])
  );

  // Carregar dados iniciais
  useEffect(() => {
    const storedValues = loadFromStorage(storageKey, defaultValues);
    const storedHistory = loadFromStorage<ConfigHistoryEntry[]>(historyKey, []);

    // Mesclar valores armazenados com padrões (para novos campos)
    const mergedValues = { ...defaultValues };
    for (const catKey of Object.keys(storedValues)) {
      if (mergedValues[catKey]) {
        for (const subKey of Object.keys(storedValues[catKey])) {
          if (mergedValues[catKey][subKey]) {
            mergedValues[catKey][subKey] = {
              ...mergedValues[catKey][subKey],
              ...storedValues[catKey][subKey],
            };
          }
        }
      }
    }

    setValues(mergedValues);
    setHistory(storedHistory);
    setIsLoading(false);
  }, [storageKey, historyKey, defaultValues]);

  // Atualizar valor (sem salvar)
  const updateValue = useCallback(
    (
      categoryKey: string,
      subcategoryKey: string,
      fieldKey: string,
      value: unknown
    ) => {
      setValues((prev) => ({
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
    []
  );

  // Adicionar entrada ao histórico
  const addHistoryEntry = useCallback(
    (
      categoryKey: string,
      subcategoryKey: string,
      fieldKey: string,
      fieldName: string,
      previousValue: unknown,
      newValue: unknown
    ) => {
      const category = categories.find((c) => c.key === categoryKey);
      const subcategory = category?.subcategories.find(
        (s) => s.key === subcategoryKey
      );

      const entry: ConfigHistoryEntry = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        userId,
        userName,
        categoryKey,
        categoryName: category?.name || categoryKey,
        subcategoryKey,
        subcategoryName: subcategory?.name || subcategoryKey,
        fieldKey,
        fieldName,
        previousValue,
        newValue,
        panel,
        ...(panel === 'company' && entityId && { companyId: entityId }),
        ...(panel === 'candidate' && entityId && { candidateId: entityId }),
      };

      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES);
        saveToStorage(historyKey, updated);
        return updated;
      });
    },
    [categories, panel, userId, userName, entityId, historyKey]
  );

  // Salvar seção
  const saveSection = useCallback(
    (categoryKey: string, subcategoryKey: string) => {
      const category = categories.find((c) => c.key === categoryKey);
      const subcategory = category?.subcategories.find(
        (s) => s.key === subcategoryKey
      );

      if (!subcategory) return;

      // Obter valores anteriores
      const storedValues = loadFromStorage<ConfigState>(storageKey, defaultValues);
      const previousSectionValues =
        storedValues[categoryKey]?.[subcategoryKey] || {};
      const currentSectionValues = values[categoryKey]?.[subcategoryKey] || {};

      // Registrar alterações no histórico
      for (const field of subcategory.fields) {
        const previousValue = previousSectionValues[field.key] ?? field.defaultValue;
        const newValue = currentSectionValues[field.key] ?? field.defaultValue;

        if (JSON.stringify(previousValue) !== JSON.stringify(newValue)) {
          addHistoryEntry(
            categoryKey,
            subcategoryKey,
            field.key,
            field.name,
            previousValue,
            newValue
          );
        }
      }

      // Salvar no storage
      saveToStorage(storageKey, values);
      toast.success('Configuracoes salvas com sucesso!');
    },
    [categories, values, storageKey, defaultValues, addHistoryEntry]
  );

  // Restaurar padrões de uma seção
  const restoreDefaults = useCallback(
    (categoryKey: string, subcategoryKey: string) => {
      const category = categories.find((c) => c.key === categoryKey);
      const subcategory = category?.subcategories.find(
        (s) => s.key === subcategoryKey
      );

      if (!subcategory) return;

      // Obter valores padrão da seção
      const sectionDefaults: Record<string, unknown> = {};
      for (const field of subcategory.fields) {
        sectionDefaults[field.key] = field.defaultValue;
      }

      // Atualizar valores
      setValues((prev) => ({
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          [subcategoryKey]: sectionDefaults,
        },
      }));

      toast.success('Valores padrao restaurados!');
    },
    [categories]
  );

  return {
    values,
    history,
    updateValue,
    saveSection,
    restoreDefaults,
    isLoading,
  };
}
