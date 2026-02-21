/**
 * Hook principal para recomendações de candidatos
 * PRD-037: Integra motor de recomendação com feedback da empresa
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCandidateFeedback } from './useCandidateFeedback';
import { useFavoriteCandidates } from './useFavoriteCandidates';
import { useJobs } from './useJobsQuery';
import { useCandidates } from './useCandidatesQuery';
import { useApplications } from './useApplicationsQuery';
import {
  getSuggestedCandidates,
  countNewCandidateRecommendations,
  CandidateRecommendation,
  CandidateRecommendationData,
  CandidateSignals,
  NotSuitableReason,
} from '@/lib/candidateRecommendation';
import { getOrGenerateIdealProfile } from '@/lib/behavioralProfiles';

export interface UseCandidateRecommendationsOptions {
  jobId: string;
  limit?: number;
  minScore?: number;
}

export interface UseCandidateRecommendationsReturn {
  // Dados
  recommendations: CandidateRecommendation[];
  isLoading: boolean;
  newCount: number;

  // Ações
  markAsNotSuitable: (candidateId: string, reason?: NotSuitableReason) => void;
  trackView: (candidateId: string) => void;
  refresh: () => void;

  // Feedback state
  isNotSuitable: (candidateId: string) => boolean;
}

export function useCandidateRecommendations(
  options: UseCandidateRecommendationsOptions
): UseCandidateRecommendationsReturn {
  const { jobId, limit = 10, minScore = 60 } = options;

  // Hooks de feedback e favoritos
  const {
    notSuitableCandidateIds,
    viewedCandidates,
    markNotSuitable,
    isNotSuitable,
    trackCandidateView,
    updateLastCheck,
    getLastCheck,
  } = useCandidateFeedback(jobId);

  const { favorites } = useFavoriteCandidates();

  // Buscar dados via service layer (extrair .data do PaginatedResult)
  const { data: jobsResult } = useJobs();
  const jobs = jobsResult?.data ?? [];
  const { data: candidatesResult } = useCandidates(undefined, { page: 1, pageSize: 1000 });
  const candidates = candidatesResult?.data ?? [];
  const { data: applicationsResult } = useApplications(undefined, { page: 1, pageSize: 1000 });
  const applications = applicationsResult?.data ?? [];

  // Estado local
  const [recommendations, setRecommendations] = useState<CandidateRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Obter última verificação para a vaga atual
  const lastCheck = getLastCheck(jobId);

  // Bundle de dados para o motor de recomendação
  const recData = useMemo<CandidateRecommendationData>(() => ({
    jobs,
    candidates,
    applications: applications.map(a => ({ candidateId: a.candidateId, jobId: a.jobId })),
    idealProfiles: Object.fromEntries(
      jobs.map(job => [job.id, getOrGenerateIdealProfile(job)])
    ),
  }), [jobs, candidates, applications]);

  // Montar sinais de recomendação
  const signals = useMemo<CandidateSignals>(() => ({
    viewedCandidates: { [jobId]: viewedCandidates },
    invitedCandidates: [],
    notSuitableCandidates: notSuitableCandidateIds,
    savedCandidates: favorites.map(f => f.candidateId),
    lastRecommendationsCheck: lastCheck || undefined,
  }), [jobId, viewedCandidates, notSuitableCandidateIds, favorites, lastCheck]);

  // Carregar recomendações quando dados estiverem prontos
  useEffect(() => {
    if (!jobId) {
      setRecommendations([]);
      setIsLoading(false);
      return;
    }

    if (recData.jobs.length === 0 || recData.candidates.length === 0) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(() => {
      const result = getSuggestedCandidates(jobId, signals, recData, {
        limit,
        minScore,
        lastCheckDate: lastCheck || undefined,
      });

      setRecommendations(result);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [jobId, signals, recData, limit, minScore, lastCheck, refreshTrigger]);

  // Contar novas recomendações
  const newCount = useMemo(() => {
    if (!lastCheck || !jobId || recData.jobs.length === 0) return 0;
    return countNewCandidateRecommendations(jobId, signals, recData, lastCheck);
  }, [jobId, signals, recData, lastCheck]);

  // Marcar como não adequado e atualizar lista
  const handleMarkNotSuitable = useCallback((candidateId: string, reason?: NotSuitableReason) => {
    markNotSuitable(candidateId, jobId, reason);

    // Remover da lista local imediatamente para UX responsiva
    setRecommendations(current =>
      current.filter(rec => rec.candidate.id !== candidateId)
    );
  }, [markNotSuitable, jobId]);

  // Rastrear visualização
  const handleTrackView = useCallback((candidateId: string) => {
    trackCandidateView(candidateId, jobId);
  }, [trackCandidateView, jobId]);

  // Atualizar recomendações
  const refresh = useCallback(() => {
    updateLastCheck(jobId);
    setRefreshTrigger(prev => prev + 1);
  }, [updateLastCheck, jobId]);

  // Wrapper para isNotSuitable que usa o jobId atual
  const checkIsNotSuitable = useCallback((candidateId: string) => {
    return isNotSuitable(candidateId, jobId);
  }, [isNotSuitable, jobId]);

  return {
    recommendations,
    isLoading,
    newCount,
    markAsNotSuitable: handleMarkNotSuitable,
    trackView: handleTrackView,
    refresh,
    isNotSuitable: checkIsNotSuitable,
  };
}

/**
 * Hook simplificado para widget do dashboard
 * Retorna apenas as top N recomendações para uma vaga
 */
export function useTopCandidateRecommendations(jobId: string, count: number = 3) {
  return useCandidateRecommendations({
    jobId,
    limit: count,
    minScore: 60,
  });
}
