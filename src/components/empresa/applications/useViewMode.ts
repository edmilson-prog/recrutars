import { useState, useEffect } from 'react';

export type ViewMode = 'combobox' | 'sidebar' | 'cards';

// Phases 3/4 append 'sidebar' and 'cards', and Phase 4 flips DEFAULT to 'cards'.
export const VIEW_MODES: ViewMode[] = ['combobox'];
export const DEFAULT_VIEW_MODE: ViewMode = 'combobox';

const STORAGE_KEY = 'recrutars-applications-view-mode';

export function parseViewMode(value: string | null): ViewMode {
  return value === 'combobox' || value === 'sidebar' || value === 'cards' ? value : DEFAULT_VIEW_MODE;
}

function loadViewMode(): ViewMode {
  try {
    return parseViewMode(localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_VIEW_MODE;
  }
}

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, viewMode);
    } catch (error) {
      console.error('Erro ao salvar modo de visualização:', error);
    }
  }, [viewMode]);

  return { viewMode, setViewMode };
}
