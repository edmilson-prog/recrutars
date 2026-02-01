/**
 * Hook para gerenciar dispensa de banners de teste comportamental
 * PRD-035: Banner de Incentivo ao Teste Comportamental
 *
 * Usa sessionStorage para manter o estado de dispensa apenas na sessão atual.
 * Ao fazer logout ou fechar o navegador, os banners voltam a aparecer.
 */

import { useState, useCallback, useEffect } from 'react';

export type IncentiveBannerContext =
  | 'dashboard'
  | 'job_low_match'
  | 'after_application'
  | 'invites_page';

interface DismissedState {
  dashboard: boolean;
  job_low_match: boolean;
  after_application: boolean;
  invites_page: boolean;
}

const STORAGE_KEY = 'test_banner_dismissed';

function loadDismissedState(): DismissedState {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar estado de banners:', error);
  }
  return {
    dashboard: false,
    job_low_match: false,
    after_application: false,
    invites_page: false,
  };
}

function saveDismissedState(state: DismissedState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Erro ao salvar estado de banners:', error);
  }
}

export function clearTestBannerDismissState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao limpar estado de banners:', error);
  }
}

export function useTestBannerDismiss(context: IncentiveBannerContext) {
  const [dismissedState, setDismissedState] = useState<DismissedState>(loadDismissedState);

  // Sincronizar com sessionStorage quando o estado muda
  useEffect(() => {
    saveDismissedState(dismissedState);
  }, [dismissedState]);

  const isDismissed = dismissedState[context];

  const dismiss = useCallback(() => {
    setDismissedState((current) => ({
      ...current,
      [context]: true,
    }));
  }, [context]);

  const reset = useCallback(() => {
    setDismissedState((current) => ({
      ...current,
      [context]: false,
    }));
  }, [context]);

  const resetAll = useCallback(() => {
    const freshState = {
      dashboard: false,
      job_low_match: false,
      after_application: false,
      invites_page: false,
    };
    setDismissedState(freshState);
  }, []);

  return {
    isDismissed,
    dismiss,
    reset,
    resetAll,
  };
}

// Backward-compatible aliases
export { useTestBannerDismiss as useDiscBannerDismiss, clearTestBannerDismissState as clearDiscBannerDismissState, type IncentiveBannerContext as DiscBannerContext };
