/**
 * Hook para gerenciamento de feedback de candidatos (empresas)
 * PRD-037: Gerencia "Não adequado", visualizações e sinais
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { NotSuitableReason } from '@/lib/candidateRecommendation';

// Storage keys (por jobId para isolar feedback entre vagas)
const STORAGE_KEYS = {
  NOT_SUITABLE: 'recrutars_not_suitable_candidates',
  VIEWED_CANDIDATES: 'recrutars_viewed_candidates_by_job',
  LAST_CHECK: 'recrutars_last_candidates_check',
};

// Tipos
export interface NotSuitableCandidate {
  candidateId: string;
  jobId: string;
  reason?: NotSuitableReason;
  markedAt: string;
}

export interface ViewedCandidate {
  count: number;
  lastViewed: string;
}

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

export function useCandidateFeedback(jobId?: string) {
  // Estado: candidatos marcados como "não adequado"
  const [notSuitableCandidates, setNotSuitableCandidates] = useState<NotSuitableCandidate[]>(() =>
    loadFromStorage(STORAGE_KEYS.NOT_SUITABLE, [])
  );

  // Estado: candidatos visualizados (por vaga)
  const [viewedCandidates, setViewedCandidates] = useState<Record<string, Record<string, ViewedCandidate>>>(() =>
    loadFromStorage(STORAGE_KEYS.VIEWED_CANDIDATES, {})
  );

  // Estado: última verificação de recomendações (por vaga)
  const [lastRecommendationsCheck, setLastRecommendationsCheck] = useState<Record<string, string>>(() =>
    loadFromStorage(STORAGE_KEYS.LAST_CHECK, {})
  );

  // Sincronizar com localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOT_SUITABLE, notSuitableCandidates);
  }, [notSuitableCandidates]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.VIEWED_CANDIDATES, viewedCandidates);
  }, [viewedCandidates]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LAST_CHECK, lastRecommendationsCheck);
  }, [lastRecommendationsCheck]);

  // Marcar candidato como "não adequado"
  const markNotSuitable = useCallback((candidateId: string, targetJobId: string, reason?: NotSuitableReason): void => {
    setNotSuitableCandidates(current => {
      // Verificar se já está marcado para esta vaga
      if (current.some(item => item.candidateId === candidateId && item.jobId === targetJobId)) {
        return current;
      }

      return [
        ...current,
        {
          candidateId,
          jobId: targetJobId,
          reason,
          markedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  // Remover marcação de "não adequado"
  const removeNotSuitable = useCallback((candidateId: string, targetJobId: string): void => {
    setNotSuitableCandidates(current =>
      current.filter(item => !(item.candidateId === candidateId && item.jobId === targetJobId))
    );
  }, []);

  // Verificar se candidato está marcado como "não adequado" para uma vaga
  const isNotSuitable = useCallback(
    (candidateId: string, targetJobId?: string): boolean => {
      const checkJobId = targetJobId || jobId;
      if (!checkJobId) return false;
      return notSuitableCandidates.some(
        item => item.candidateId === candidateId && item.jobId === checkJobId
      );
    },
    [notSuitableCandidates, jobId]
  );

  // Obter motivo do "não adequado"
  const getNotSuitableReason = useCallback(
    (candidateId: string, targetJobId?: string): NotSuitableReason | undefined => {
      const checkJobId = targetJobId || jobId;
      if (!checkJobId) return undefined;
      const item = notSuitableCandidates.find(
        i => i.candidateId === candidateId && i.jobId === checkJobId
      );
      return item?.reason;
    },
    [notSuitableCandidates, jobId]
  );

  // Registrar visualização de candidato
  const trackCandidateView = useCallback((candidateId: string, targetJobId: string): void => {
    setViewedCandidates(current => {
      const jobViews = current[targetJobId] || {};
      const existing = jobViews[candidateId];
      return {
        ...current,
        [targetJobId]: {
          ...jobViews,
          [candidateId]: {
            count: existing ? existing.count + 1 : 1,
            lastViewed: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  // Obter dados de visualização de um candidato
  const getViewData = useCallback(
    (candidateId: string, targetJobId?: string): ViewedCandidate | null => {
      const checkJobId = targetJobId || jobId;
      if (!checkJobId) return null;
      return viewedCandidates[checkJobId]?.[candidateId] || null;
    },
    [viewedCandidates, jobId]
  );

  // Atualizar última verificação de recomendações para uma vaga
  const updateLastCheck = useCallback((targetJobId: string): void => {
    setLastRecommendationsCheck(current => ({
      ...current,
      [targetJobId]: new Date().toISOString(),
    }));
  }, []);

  // Obter última verificação para uma vaga
  const getLastCheck = useCallback(
    (targetJobId?: string): string | null => {
      const checkJobId = targetJobId || jobId;
      if (!checkJobId) return null;
      return lastRecommendationsCheck[checkJobId] || null;
    },
    [lastRecommendationsCheck, jobId]
  );

  // Lista de IDs de candidatos "não adequado" para a vaga atual
  const notSuitableCandidateIds = useMemo(
    () => {
      if (!jobId) return [];
      return notSuitableCandidates
        .filter(item => item.jobId === jobId)
        .map(item => item.candidateId);
    },
    [notSuitableCandidates, jobId]
  );

  // Contador de candidatos "não adequado" para a vaga atual
  const notSuitableCount = useMemo(
    () => notSuitableCandidateIds.length,
    [notSuitableCandidateIds]
  );

  // Visualizações para a vaga atual
  const currentJobViewedCandidates = useMemo(
    () => {
      if (!jobId) return {};
      return viewedCandidates[jobId] || {};
    },
    [viewedCandidates, jobId]
  );

  // Limpar todos os feedbacks (útil para testes)
  const clearAllFeedback = useCallback((): void => {
    setNotSuitableCandidates([]);
    setViewedCandidates({});
    setLastRecommendationsCheck({});
    localStorage.removeItem(STORAGE_KEYS.NOT_SUITABLE);
    localStorage.removeItem(STORAGE_KEYS.VIEWED_CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.LAST_CHECK);
  }, []);

  return {
    // Não adequado
    notSuitableCandidates,
    notSuitableCandidateIds,
    notSuitableCount,
    markNotSuitable,
    removeNotSuitable,
    isNotSuitable,
    getNotSuitableReason,

    // Visualizações
    viewedCandidates: currentJobViewedCandidates,
    trackCandidateView,
    getViewData,

    // Última verificação
    lastRecommendationsCheck,
    updateLastCheck,
    getLastCheck,

    // Utilitários
    clearAllFeedback,
  };
}

/**
 * Helper para formatar quando foi marcado como "não adequado"
 */
export function formatNotSuitableDate(markedAt: string): string {
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
