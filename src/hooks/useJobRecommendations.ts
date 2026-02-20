/**
 * Hook principal para recomendações de vagas
 * PRD-036: Integra motor de recomendação com feedback do usuário
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useJobFeedback, NotInterestedReason } from './useJobFeedback';
import { useFavoriteJobs } from './useFavoriteJobs';
import { useJobs } from './useJobsQuery';
import { useCandidates } from './useCandidatesQuery';
import { useApplicationsByCandidate } from './useApplicationsQuery';
import {
  getRecommendedJobs,
  countNewRecommendations,
  JobRecommendation,
  RecommendationSignals,
  RecommendationData,
} from '@/lib/jobRecommendation';
import { idealBehavioralProfiles } from '@/lib/behavioralProfiles';

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

  // Buscar dados via service layer
  const { data: jobsResult } = useJobs();
  const jobs = jobsResult?.data ?? [];
  const { data: candidatesResult } = useCandidates(undefined, { page: 1, pageSize: 1000 });
  const candidates = candidatesResult?.data ?? [];
  const { data: applications = [] } = useApplicationsByCandidate(candidateId);

  // Estado local
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Bundle de dados para o motor de recomendação
  const recData = useMemo<RecommendationData>(() => ({
    jobs,
    candidates,
    applications: applications.map(a => ({ candidateId: a.candidateId, jobId: a.jobId })),
    idealProfiles: idealBehavioralProfiles,
  }), [jobs, candidates, applications]);

  // Montar sinais de recomendação
  const signals = useMemo<RecommendationSignals>(() => ({
    viewedJobs,
    appliedJobs: [],
    notInterestedJobs: notInterestedJobIds,
    savedJobs: favorites.map(f => f.jobId),
    searchTerms: [],
    lastRecommendationsCheck: lastRecommendationsCheck || undefined,
  }), [viewedJobs, notInterestedJobIds, favorites, lastRecommendationsCheck]);

  // Carregar recomendações quando dados estiverem prontos
  useEffect(() => {
    if (recData.jobs.length === 0 || recData.candidates.length === 0) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(() => {
      const result = getRecommendedJobs(candidateId, signals, recData, {
        limit,
        minScore,
        lastCheckDate: lastRecommendationsCheck || undefined,
      });

      setRecommendations(result);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [candidateId, signals, recData, limit, minScore, lastRecommendationsCheck, refreshTrigger]);

  // Contar novas recomendações
  const newCount = useMemo(() => {
    if (!lastRecommendationsCheck || recData.jobs.length === 0) return 0;
    return countNewRecommendations(candidateId, signals, recData, lastRecommendationsCheck);
  }, [candidateId, signals, recData, lastRecommendationsCheck]);

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
