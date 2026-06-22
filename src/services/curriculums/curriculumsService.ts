/**
 * Curriculums Service — Interface + Factory
 * PRD-073: Perfil Profissional Unificado
 *
 * Manages the unified professional profile (1:1 per candidate)
 * with sub-entities: experiences, education, skills, courses.
 */

import type { Curriculum } from '@/types/curriculum';

// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

export interface ICurriculumsService {
  /** Get the single professional profile for a candidate */
  getProfile(candidateId: string): Promise<Curriculum | null>;

  /** Company-facing read: parent row from masked view + children fetched by curriculum_id. */
  getProfileForCompany(candidateId: string): Promise<Curriculum | null>;

  /** Get or create the professional profile for a candidate */
  ensureProfile(candidateId: string, initialData?: Partial<Curriculum>): Promise<Curriculum>;

  /** Get a single curriculum by id (with all sub-entities) */
  getCurriculum(id: string): Promise<Curriculum | null>;

  /** Update a curriculum (partial fields + sub-entities) */
  updateCurriculum(id: string, updates: Partial<Curriculum>): Promise<Curriculum>;
}

// ---------------------------------------------------------------------------
// Factory (singleton with lazy import)
// ---------------------------------------------------------------------------

let _instance: ICurriculumsService | null = null;

export async function getCurriculumsService(): Promise<ICurriculumsService> {
  if (_instance) return _instance;

  const { SupabaseCurriculumsService } = await import('./curriculumsService.supabase');
  _instance = new SupabaseCurriculumsService();
  return _instance;
}

// Reset instance (for testing or when switching sources)
export function resetCurriculumsService(): void {
  _instance = null;
}
