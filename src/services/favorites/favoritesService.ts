/**
 * Favorites Service — Interface + Factory
 * PRD-067: Service Layer — Specialized Modules
 *
 * Manages favorite jobs (for candidates) and favorite candidates (for companies).
 */

export type FavoriteResourceType = 'job' | 'candidate';

export interface IFavoritesService {
  /** Get list of favorited resource IDs for a user */
  getFavorites(userId: string, resourceType: FavoriteResourceType): Promise<string[]>;

  /** Add a resource to favorites */
  addFavorite(userId: string, resourceType: FavoriteResourceType, resourceId: string): Promise<void>;

  /** Remove a resource from favorites */
  removeFavorite(userId: string, resourceType: FavoriteResourceType, resourceId: string): Promise<void>;

  /** Check if a resource is favorited */
  isFavorite(userId: string, resourceType: FavoriteResourceType, resourceId: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Factory (singleton + lazy-load)
// ---------------------------------------------------------------------------

let _instance: IFavoritesService | null = null;

export async function getFavoritesService(): Promise<IFavoritesService> {
  if (_instance) return _instance;

  const { FavoritesServiceSupabase } = await import('./favoritesService.supabase');
  _instance = new FavoritesServiceSupabase();
  return _instance;
}

export function resetFavoritesService(): void {
  _instance = null;
}
