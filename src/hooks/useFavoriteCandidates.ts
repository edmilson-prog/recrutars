// PRD-030: Hook para gerenciamento de candidatos favoritos (Empresa)

import { useState, useEffect, useCallback, useMemo } from 'react';
import { mockCandidates } from '@/data/mockData';
import type { Candidate } from '@/types';

export interface FavoriteCandidate {
  candidateId: string;
  savedAt: string; // ISO date
}

const STORAGE_KEY = 'recrutars_favorite_candidates';

// Helper para carregar favoritos do localStorage
function loadFavorites(): FavoriteCandidate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar candidatos favoritos:', error);
  }
  return [];
}

// Helper para salvar favoritos no localStorage
function saveFavorites(favorites: FavoriteCandidate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Erro ao salvar candidatos favoritos:', error);
  }
}

export function useFavoriteCandidates() {
  const [favorites, setFavorites] = useState<FavoriteCandidate[]>(loadFavorites);

  // Sincronizar com localStorage quando favorites muda
  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  // Verificar se um candidato está nos favoritos
  const isFavorite = useCallback(
    (candidateId: string): boolean => {
      return favorites.some((fav) => fav.candidateId === candidateId);
    },
    [favorites]
  );

  // Toggle favorito (adicionar/remover)
  const toggleFavorite = useCallback((candidateId: string): boolean => {
    let isNowFavorite = false;

    setFavorites((current) => {
      const exists = current.some((fav) => fav.candidateId === candidateId);

      if (exists) {
        // Remover
        isNowFavorite = false;
        return current.filter((fav) => fav.candidateId !== candidateId);
      } else {
        // Adicionar
        isNowFavorite = true;
        return [
          ...current,
          {
            candidateId,
            savedAt: new Date().toISOString(),
          },
        ];
      }
    });

    return isNowFavorite;
  }, []);

  // Remover favorito
  const removeFavorite = useCallback((candidateId: string): void => {
    setFavorites((current) => current.filter((fav) => fav.candidateId !== candidateId));
  }, []);

  // Obter candidatos favoritos com dados completos
  const getFavoriteCandidates = useCallback((): (Candidate & { savedAt: string })[] => {
    return favorites
      .map((fav) => {
        const candidate = mockCandidates.find((c) => c.id === fav.candidateId);
        if (candidate) {
          return { ...candidate, savedAt: fav.savedAt };
        }
        return null;
      })
      .filter((candidate): candidate is Candidate & { savedAt: string } => candidate !== null);
  }, [favorites]);

  // Obter data de quando foi salvo
  const getSavedAt = useCallback(
    (candidateId: string): string | null => {
      const fav = favorites.find((f) => f.candidateId === candidateId);
      return fav ? fav.savedAt : null;
    },
    [favorites]
  );

  // Contador de favoritos
  const favoritesCount = useMemo(() => favorites.length, [favorites]);

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
