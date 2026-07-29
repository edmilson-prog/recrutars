// PRD-030: Hook para gerenciamento de candidatos favoritos (Empresa)
// PRD-069: Migrated from mockData to service layer hooks

import { useCallback, useMemo } from 'react';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavoritesQuery';
import { useCandidatesByIds } from '@/hooks/useCandidatesQuery';
import { useAuth } from '@/contexts/AuthContext';
import type { Candidate } from '@/types';

export interface FavoriteCandidate {
  candidateId: string;
  savedAt: string; // ISO date
}

export function useFavoriteCandidates() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const { data: favoriteIds = [] } = useFavorites(userId, 'candidate');
  const toggleMutation = useToggleFavorite();

  // Resolve only the favorited candidates. Listing a capped page and filtering
  // client-side used to drop favorites outside that page, making them vanish
  // from "Candidatos Salvos".
  const { data: favoriteCandidatesData } = useCandidatesByIds(favoriteIds);
  const allCandidates = useMemo(() => favoriteCandidatesData ?? [], [favoriteCandidatesData]);

  // Verificar se um candidato está nos favoritos
  const isFavorite = useCallback(
    (candidateId: string): boolean => {
      return favoriteIds.includes(candidateId);
    },
    [favoriteIds]
  );

  // Toggle favorito (adicionar/remover)
  const toggleFavorite = useCallback((candidateId: string): boolean => {
    const currentlyFavorited = favoriteIds.includes(candidateId);
    toggleMutation.mutate({
      userId,
      resourceType: 'candidate',
      resourceId: candidateId,
      currentlyFavorited,
    });
    return !currentlyFavorited;
  }, [favoriteIds, userId, toggleMutation]);

  // Remover favorito
  const removeFavorite = useCallback((candidateId: string): void => {
    if (favoriteIds.includes(candidateId)) {
      toggleMutation.mutate({
        userId,
        resourceType: 'candidate',
        resourceId: candidateId,
        currentlyFavorited: true,
      });
    }
  }, [favoriteIds, userId, toggleMutation]);

  // Obter candidatos favoritos com dados completos
  const getFavoriteCandidates = useCallback((): (Candidate & { savedAt: string })[] => {
    return favoriteIds
      .map((candidateId) => {
        const candidate = allCandidates.find((c) => c.id === candidateId);
        if (candidate) {
          return { ...candidate, savedAt: new Date().toISOString() };
        }
        return null;
      })
      .filter((candidate): candidate is Candidate & { savedAt: string } => candidate !== null);
  }, [favoriteIds, allCandidates]);

  // Obter data de quando foi salvo (approximate since service doesn't store savedAt)
  const getSavedAt = useCallback(
    (_candidateId: string): string | null => {
      return favoriteIds.includes(_candidateId) ? new Date().toISOString() : null;
    },
    [favoriteIds]
  );

  // Convert to FavoriteCandidate format for backward compatibility
  const favorites: FavoriteCandidate[] = useMemo(
    () => favoriteIds.map((candidateId) => ({ candidateId, savedAt: new Date().toISOString() })),
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
    getFavoriteCandidates,
    getSavedAt,
  };
}

// Helper para formatar "Salvo há X dias"
export function formatCandidateSavedAt(savedAt: string): string {
  const saved = new Date(savedAt);
  const now = new Date();
  const diffMs = now.getTime() - saved.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Salvo hoje';
  } else if (diffDays === 1) {
    return 'Salvo há 1 dia';
  } else {
    return `Salvo há ${diffDays} dias`;
  }
}
