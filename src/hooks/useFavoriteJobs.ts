// PRD-024: Hook para gerenciamento de vagas favoritas

import { useState, useEffect, useCallback, useMemo } from 'react';
import { mockJobs } from '@/data/mockData';
import type { Job } from '@/types';

export interface FavoriteJob {
  jobId: string;
  savedAt: string; // ISO date
}

const STORAGE_KEY = 'recrutars_favorite_jobs';

// Helper para carregar favoritos do localStorage
function loadFavorites(): FavoriteJob[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
  }
  return [];
}

// Helper para salvar favoritos no localStorage
function saveFavorites(favorites: FavoriteJob[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Erro ao salvar favoritos:', error);
  }
}

export function useFavoriteJobs() {
  const [favorites, setFavorites] = useState<FavoriteJob[]>(loadFavorites);

  // Sincronizar com localStorage quando favorites muda
  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  // Verificar se uma vaga está nos favoritos
  const isFavorite = useCallback(
    (jobId: string): boolean => {
      return favorites.some((fav) => fav.jobId === jobId);
    },
    [favorites]
  );

  // Toggle favorito (adicionar/remover)
  const toggleFavorite = useCallback((jobId: string): boolean => {
    let isNowFavorite = false;

    setFavorites((current) => {
      const exists = current.some((fav) => fav.jobId === jobId);

      if (exists) {
        // Remover
        isNowFavorite = false;
        return current.filter((fav) => fav.jobId !== jobId);
      } else {
        // Adicionar
        isNowFavorite = true;
        return [
          ...current,
          {
            jobId,
            savedAt: new Date().toISOString(),
          },
        ];
      }
    });

    return isNowFavorite;
  }, []);

  // Remover favorito
  const removeFavorite = useCallback((jobId: string): void => {
    setFavorites((current) => current.filter((fav) => fav.jobId !== jobId));
  }, []);

  // Obter vagas favoritas com dados completos
  const getFavoriteJobs = useCallback((): (Job & { savedAt: string })[] => {
    return favorites
      .map((fav) => {
        const job = mockJobs.find((j) => j.id === fav.jobId);
        if (job) {
          return { ...job, savedAt: fav.savedAt };
        }
        return null;
      })
      .filter((job): job is Job & { savedAt: string } => job !== null);
  }, [favorites]);

  // Obter data de quando foi salva
  const getSavedAt = useCallback(
    (jobId: string): string | null => {
      const fav = favorites.find((f) => f.jobId === jobId);
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
