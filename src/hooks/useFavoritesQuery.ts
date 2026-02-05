/**
 * Favorites Query Hooks
 * PRD-067: Service Layer — Specialized Modules
 *
 * React Query hooks for favorite jobs and candidates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFavoritesService,
  type FavoriteResourceType,
} from '@/services/favorites/favoritesService';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const KEYS = {
  favorites: (userId: string, resourceType: FavoriteResourceType) =>
    ['favorites', userId, resourceType] as const,
  isFavorite: (userId: string, resourceType: FavoriteResourceType, resourceId: string) =>
    ['favorites', 'check', userId, resourceType, resourceId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all favorited resource IDs for a user and type */
export function useFavorites(userId: string, resourceType: FavoriteResourceType) {
  return useQuery({
    queryKey: KEYS.favorites(userId, resourceType),
    queryFn: async () => {
      const service = await getFavoritesService();
      return service.getFavorites(userId, resourceType);
    },
    enabled: !!userId,
  });
}

/** Check if a specific resource is favorited */
export function useIsFavorite(
  userId: string,
  resourceType: FavoriteResourceType,
  resourceId: string,
) {
  return useQuery({
    queryKey: KEYS.isFavorite(userId, resourceType, resourceId),
    queryFn: async () => {
      const service = await getFavoritesService();
      return service.isFavorite(userId, resourceType, resourceId);
    },
    enabled: !!userId && !!resourceId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Toggle a resource's favorite status (add if not favorited, remove if favorited) */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      resourceType,
      resourceId,
      currentlyFavorited,
    }: {
      userId: string;
      resourceType: FavoriteResourceType;
      resourceId: string;
      currentlyFavorited: boolean;
    }) => {
      const service = await getFavoritesService();

      if (currentlyFavorited) {
        await service.removeFavorite(userId, resourceType, resourceId);
      } else {
        await service.addFavorite(userId, resourceType, resourceId);
      }

      return !currentlyFavorited;
    },
    onSuccess: (_data, variables) => {
      // Invalidate both the list and the individual check
      queryClient.invalidateQueries({
        queryKey: KEYS.favorites(variables.userId, variables.resourceType),
      });
      queryClient.invalidateQueries({
        queryKey: KEYS.isFavorite(
          variables.userId,
          variables.resourceType,
          variables.resourceId,
        ),
      });
    },
  });
}
