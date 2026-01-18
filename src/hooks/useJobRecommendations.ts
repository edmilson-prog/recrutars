/**
 * Hook principal para recomendações de vagas
 * PRD-036: Integra motor de recomendação com feedback do usuário
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useJobFeedback, NotInterestedReason } from './useJobFeedback';
import { useFavoriteJobs } from './useFavoriteJobs';
import {
  getRecommendedJobs,
  countNewRecommendations,
  JobRecommendation,
  RecommendationSignals,
} from '@/lib/jobRecommendation';

export interface UseJobRecommendationsOptions {
  candidateId: string;
  limit?: number;
  minScore?: number;
}

export interface UseJobRecommendationsReturn {
  // Dados
  recommendations: JobRecommendation[];
  isLoading: boolean;
  newCount: number;

  // Ações
  markAsNotInterested: (jobId: string, reason?: NotInterestedReason) => void;
  trackView: (jobId: string) => void;
  refresh: () => void;

  // Feedback state
  isNotInterested: (jobId: string) => boolean;
}

export function useJobRecommendations(
  options: UseJobRecommendationsOptions
): UseJobRecommendationsReturn {
  const { candidateId, limit = 10, minScore = 50 } = options;

  // Hooks de feedback e favoritos
  const {
    notInterestedJobIds,
    viewedJobs,
    lastRecommendationsCheck,
    markNotInterested,
    isNotInterested,
    trackJobView,
    updateLastCheck,
  } = useJobFeedback();

  const { favorites } = useFavoriteJobs();

  // Estado local
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Montar sinais de recomendação
  const signals = useMemo<RecommendationSignals>(() => ({
    viewedJobs,
    appliedJobs: [], // Será carregado do mock pelo motor
    notInterestedJobs: notInterestedJobIds,
    savedJobs: favorites.map(f => f.jobId),
    searchTerms: [],
    lastRecommendationsCheck: lastRecommendationsCheck || undefined,
  }), [viewedJobs, notInterestedJobIds, favorites, lastRecommendationsCheck]);

  // Carregar recomendações
  useEffect(() => {
    setIsLoading(true);

    // Simular delay de API
    const timer = setTimeout(() => {
      const result = getRecommendedJobs(candidateId, signals, {
        limit,
        minScore,
        lastCheckDate: lastRecommendationsCheck || undefined,
      });

      setRecommendations(result);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [candidateId, signals, limit, minScore, lastRecommendationsCheck, refreshTrigger]);

  // Contar novas recomendações
  const newCount = useMemo(() => {
    if (!lastRecommendationsCheck) return 0;
    return countNewRecommendations(candidateId, signals, lastRecommendationsCheck);
  }, [candidateId, signals, lastRecommendationsCheck]);

  // Marcar como não interessado e atualizar lista
  const handleMarkNotInterested = useCallback((jobId: string, reason?: NotInterestedReason) => {
    markNotInterested(jobId, reason);

    // Remover da lista local imediatamente para UX responsiva
    setRecommendations(current =>
      current.filter(rec => rec.job.id !== jobId)
    );
  }, [markNotInterested]);

  // Rastrear visualização
  const handleTrackView = useCallback((jobId: string) => {
    trackJobView(jobId);
  }, [trackJobView]);

  // Atualizar recomendações
  const refresh = useCallback(() => {
    updateLastCheck();
    setRefreshTrigger(prev => prev + 1);
  }, [updateLastCheck]);

  return {
    recommendations,
    isLoading,
    newCount,
    markAsNotInterested: handleMarkNotInterested,
    trackView: handleTrackView,
    refresh,
    isNotInterested,
  };
}

/**
 * Hook simplificado para widget do dashboard
 * Retorna apenas as top N recomendações
 */
export function useTopRecommendations(candidateId: string, count: number = 5) {
  return useJobRecommendations({
    candidateId,
    limit: count,
    minScore: 50,
  });
}
