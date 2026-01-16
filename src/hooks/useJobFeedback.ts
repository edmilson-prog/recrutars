/**
 * Hook para gerenciamento de feedback de vagas
 * PRD-036: Gerencia "Não tenho interesse", visualizações e sinais
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// Storage keys
const STORAGE_KEYS = {
  NOT_INTERESTED: 'recrutars_not_interested_jobs',
  VIEWED_JOBS: 'recrutars_viewed_jobs',
  LAST_CHECK: 'recrutars_last_recommendations_check',
};

// Tipos
export interface NotInterestedJob {
  jobId: string;
  reason?: string;
  markedAt: string;
}

export interface ViewedJob {
  count: number;
  lastViewed: string;
}

export type NotInterestedReason =
  | 'salary'
  | 'location'
  | 'not_my_area'
  | 'know_company'
  | 'other';

export const NOT_INTERESTED_REASONS: Record<NotInterestedReason, string> = {
  salary: 'Salário abaixo do esperado',
  location: 'Localização não é ideal',
  not_my_area: 'Não é minha área de atuação',
  know_company: 'Já conheço a empresa',
  other: 'Outro motivo',
};

// Helpers para localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Erro ao carregar ${key}:`, error);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error);
  }
}

export function useJobFeedback() {
  // Estado: vagas marcadas como "não tenho interesse"
  const [notInterestedJobs, setNotInterestedJobs] = useState<NotInterestedJob[]>(() =>
    loadFromStorage(STORAGE_KEYS.NOT_INTERESTED, [])
  );

  // Estado: vagas visualizadas
  const [viewedJobs, setViewedJobs] = useState<Record<string, ViewedJob>>(() =>
    loadFromStorage(STORAGE_KEYS.VIEWED_JOBS, {})
  );

  // Estado: última verificação de recomendações
  const [lastRecommendationsCheck, setLastRecommendationsCheck] = useState<string | null>(() =>
    loadFromStorage(STORAGE_KEYS.LAST_CHECK, null)
  );

  // Sincronizar com localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOT_INTERESTED, notInterestedJobs);
  }, [notInterestedJobs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.VIEWED_JOBS, viewedJobs);
  }, [viewedJobs]);

  useEffect(() => {
    if (lastRecommendationsCheck) {
      saveToStorage(STORAGE_KEYS.LAST_CHECK, lastRecommendationsCheck);
    }
  }, [lastRecommendationsCheck]);

  // Marcar vaga como "não tenho interesse"
  const markNotInterested = useCallback((jobId: string, reason?: NotInterestedReason): void => {
    setNotInterestedJobs(current => {
      // Verificar se já está marcado
      if (current.some(item => item.jobId === jobId)) {
        return current;
      }

      return [
        ...current,
        {
          jobId,
          reason,
          markedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  // Remover marcação de "não tenho interesse"
  const removeNotInterested = useCallback((jobId: string): void => {
    setNotInterestedJobs(current =>
      current.filter(item => item.jobId !== jobId)
    );
  }, []);

  // Verificar se vaga está marcada como "não tenho interesse"
  const isNotInterested = useCallback(
    (jobId: string): boolean => {
      return notInterestedJobs.some(item => item.jobId === jobId);
    },
    [notInterestedJobs]
  );

  // Obter motivo do "não tenho interesse"
  const getNotInterestedReason = useCallback(
    (jobId: string): string | undefined => {
      const item = notInterestedJobs.find(i => i.jobId === jobId);
      return item?.reason;
    },
    [notInterestedJobs]
  );

  // Registrar visualização de vaga
  const trackJobView = useCallback((jobId: string): void => {
    setViewedJobs(current => {
      const existing = current[jobId];
      return {
        ...current,
        [jobId]: {
          count: existing ? existing.count + 1 : 1,
          lastViewed: new Date().toISOString(),
        },
      };
    });
  }, []);

  // Obter dados de visualização de uma vaga
  const getViewData = useCallback(
    (jobId: string): ViewedJob | null => {
      return viewedJobs[jobId] || null;
    },
    [viewedJobs]
  );

  // Atualizar última verificação de recomendações
  const updateLastCheck = useCallback((): void => {
    setLastRecommendationsCheck(new Date().toISOString());
  }, []);

  // Lista de IDs de vagas "não tenho interesse"
  const notInterestedJobIds = useMemo(
    () => notInterestedJobs.map(item => item.jobId),
    [notInterestedJobs]
  );

  // Contador de vagas "não tenho interesse"
  const notInterestedCount = useMemo(
    () => notInterestedJobs.length,
    [notInterestedJobs]
  );

  // Limpar todos os feedbacks (útil para testes)
  const clearAllFeedback = useCallback((): void => {
    setNotInterestedJobs([]);
    setViewedJobs({});
    setLastRecommendationsCheck(null);
    localStorage.removeItem(STORAGE_KEYS.NOT_INTERESTED);
    localStorage.removeItem(STORAGE_KEYS.VIEWED_JOBS);
    localStorage.removeItem(STORAGE_KEYS.LAST_CHECK);
  }, []);

  return {
    // Não tenho interesse
    notInterestedJobs,
    notInterestedJobIds,
    notInterestedCount,
    markNotInterested,
    removeNotInterested,
    isNotInterested,
    getNotInterestedReason,

    // Visualizações
    viewedJobs,
    trackJobView,
    getViewData,

    // Última verificação
    lastRecommendationsCheck,
    updateLastCheck,

    // Utilitários
    clearAllFeedback,
  };
}

/**
 * Helper para formatar quando foi marcado como "não interesse"
 */
export function formatNotInterestedDate(markedAt: string): string {
  const marked = new Date(markedAt);
  const now = new Date();
  const diffMs = now.getTime() - marked.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semana(s) atrás`;
  return marked.toLocaleDateString('pt-BR');
}
