/**
 * Curriculums Service — Interface + Factory
 * PRD-066: Service Layer Pattern
 *
 * Manages curriculum CRUD, sub-entities (experiences, education, skills, courses),
 * and default curriculum selection (PRD-022).
 */

import type { Curriculum } from '@/types/curriculum';

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface CurriculumFilters {
  candidateId?: string;
  isDefault?: boolean;
  isArchived?: boolean;
  search?: string;
}

// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

export interface ICurriculumsService {
  /** List all curriculums for a candidate */
  getCurriculums(candidateId: string): Promise<Curriculum[]>;

  /** Get a single curriculum by id (with all sub-entities) */
  getCurriculum(id: string): Promise<Curriculum | null>;

  /** Create a new curriculum */
  createCurriculum(data: Omit<Curriculum, 'id' | 'createdAt' | 'updatedAt'>): Promise<Curriculum>;

  /** Update a curriculum (partial fields + sub-entities) */
  updateCurriculum(id: string, updates: Partial<Curriculum>): Promise<Curriculum>;

  /** Delete a curriculum and all sub-entities */
  deleteCurriculum(id: string): Promise<void>;

  /** Set a curriculum as the default for a candidate (unsets previous default) */
  setDefault(candidateId: string, curriculumId: string): Promise<void>;
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
