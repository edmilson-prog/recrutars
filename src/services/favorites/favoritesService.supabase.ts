/**
 * Favorites Service — Supabase Implementation
 * PRD-067: Service Layer — Specialized Modules
 *
 * Queries the favorites table.
 * Table schema: favorites(id, user_id, resource_type, resource_id, created_at)
 */

import { supabase } from '@/lib/supabase';
import type { IFavoritesService, FavoriteResourceType } from './favoritesService';

export class FavoritesServiceSupabase implements IFavoritesService {
  async getFavorites(userId: string, resourceType: FavoriteResourceType): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('resource_id')
      .eq('user_id', userId)
      .eq('resource_type', resourceType);

    if (error) throw error;

    return (data ?? []).map((row) => row.resource_id);
  }

  async addFavorite(
    userId: string,
    resourceType: FavoriteResourceType,
    resourceId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .upsert(
        {
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId,
        },
        { onConflict: 'user_id,resource_type,resource_id' },
      );

    if (error) throw error;
  }

  async removeFavorite(
    userId: string,
    resourceType: FavoriteResourceType,
    resourceId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId);

    if (error) throw error;
  }

  async isFavorite(
    userId: string,
    resourceType: FavoriteResourceType,
    resourceId: string,
  ): Promise<boolean> {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId);

    if (error) throw error;

    return (count ?? 0) > 0;
  }
}
