/**
 * Highlights Service — Interface + Factory
 * PRD-073: Destaques de candidatura customizável
 *
 * Manages candidate-selected highlights per application.
 * Each highlight references an item (experience, education, skill, course)
 * from the candidate's professional profile.
 */

import type { ApplicationHighlights } from '@/types/applicationHighlight';

// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

export interface IHighlightsService {
  /** Get grouped highlights for an application */
  getHighlights(applicationId: string): Promise<ApplicationHighlights>;

  /** Replace all highlights for an application (delete + re-insert) */
  setHighlights(applicationId: string, highlights: ApplicationHighlights): Promise<void>;
}

// ---------------------------------------------------------------------------
// Factory (singleton with lazy import)
// ---------------------------------------------------------------------------

let _instance: IHighlightsService | null = null;

export async function getHighlightsService(): Promise<IHighlightsService> {
  if (_instance) return _instance;

  const { SupabaseHighlightsService } = await import('./highlightsService.supabase');
  _instance = new SupabaseHighlightsService();
  return _instance;
}

export function resetHighlightsService(): void {
  _instance = null;
}
