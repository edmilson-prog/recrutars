// PRD-024: Hook para gerenciamento de vagas favoritas
// PRD-069: Migrated from mockData to service layer hooks

import { useCallback, useMemo } from 'react';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavoritesQuery';
import { useJobs } from '@/hooks/useJobsQuery';
import { useAuth } from '@/contexts/AuthContext';
import type { Job } from '@/types';


export interface FavoriteJob {
  jobId: string;
  savedAt: string; // ISO date
}

export function useFavoriteJobs() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const { data: favoriteIds = [] } = useFavorites(userId, 'job');
  const toggleMutation = useToggleFavorite();

  // Also fetch all jobs to support getFavoriteJobs enrichment
  const { data: jobsResult } = useJobs();
  const allJobs = useMemo(() => jobsResult?.data ?? [], [jobsResult]);

  // Verificar se uma vaga está nos favoritos
  const isFavorite = useCallback(
    (jobId: string): boolean => {
      return favoriteIds.includes(jobId);
    },
    [favoriteIds]
  );

  // Toggle favorito (adicionar/remover)
  const toggleFavorite = useCallback((jobId: string): boolean => {
    const currentlyFavorited = favoriteIds.includes(jobId);
    toggleMutation.mutate({
      userId,
      resourceType: 'job',
      resourceId: jobId,
      currentlyFavorited,
    });
    return !currentlyFavorited;
  }, [favoriteIds, userId, toggleMutation]);

  // Remover favorito
  const removeFavorite = useCallback((jobId: string): void => {
    if (favoriteIds.includes(jobId)) {
      toggleMutation.mutate({
        userId,
        resourceType: 'job',
        resourceId: jobId,
        currentlyFavorited: true,
      });
    }
  }, [favoriteIds, userId, toggleMutation]);

  // Obter vagas favoritas com dados completos
  const getFavoriteJobs = useCallback((): (Job & { savedAt: string })[] => {
    return favoriteIds
      .map((jobId) => {
        const job = allJobs.find((j) => j.id === jobId);
        if (job) {
          return { ...job, savedAt: new Date().toISOString() };
        }
        return null;
      })
      .filter((job): job is Job & { savedAt: string } => job !== null);
  }, [favoriteIds, allJobs]);

  // Obter data de quando foi salva (approximate since service doesn't store savedAt)
  const getSavedAt = useCallback(
    (_jobId: string): string | null => {
      return favoriteIds.includes(_jobId) ? new Date().toISOString() : null;
    },
    [favoriteIds]
  );

  // Convert to FavoriteJob format for backward compatibility
  const favorites: FavoriteJob[] = useMemo(
    () => favoriteIds.map((jobId) => ({ jobId, savedAt: new Date().toISOString() })),
    [favoriteIds]
  );

  // Contador de favoritos
  const favoritesCount = useMemo(() => favoriteIds.length, [favoriteIds]);

  return {
    favorites,
    favoritesCount,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    getFavoriteJobs,
    getSavedAt,
  };
}

// Helper para formatar "Salva há X dias"
export function formatSavedAt(savedAt: string): string {
  const saved = new Date(savedAt);
  const now = new Date();
  const diffMs = now.getTime() - saved.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Salva hoje';
  } else if (diffDays === 1) {
    return 'Salva há 1 dia';
  } else {
    return `Salva há ${diffDays} dias`;
  }
}

// Helper para calcular dias até encerramento
export function getDaysUntilDeadline(deadline?: string): number | null {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
