/**
 * Hirings Service — Interface + Factory
 * PRD-077: Fluxo de Contratacao e Transicao para Gestao de Equipes
 *
 * Manages hiring operations: atomic hire, job closure, and hiring records.
 */

import type { Hiring, HireResult, HireCandidateData, CloseJobResult, CloseJobData } from '@/types/hiring';

export interface IHiringsService {
  /** Atomic hire: creates team member, updates application, creates hiring record, sends notification */
  hireCandidate(data: HireCandidateData): Promise<HireResult>;

  /** Close job and manage remaining candidates (talent_pool, reject, or keep_active) */
  closeJobWithRemaining(data: CloseJobData): Promise<CloseJobResult>;

  /** Get all hirings for a specific job */
  getHiringsByJob(jobId: string): Promise<Hiring[]>;

  /** Get count of hires for a specific job */
  getHiredCountForJob(jobId: string): Promise<number>;

  /** Check if candidate is already a team member for the company */
  isAlreadyTeamMember(candidateId: string, companyId: string): Promise<{ exists: boolean; hireDate?: string }>;
}

// ---------------------------------------------------------------------------
// Factory (singleton + lazy-load)
// ---------------------------------------------------------------------------

let _instance: IHiringsService | null = null;

export async function getHiringsService(): Promise<IHiringsService> {
  if (_instance) return _instance;

  const { HiringsServiceSupabase } = await import('./hiringsService.supabase');
  _instance = new HiringsServiceSupabase();
  return _instance;
}

export function resetHiringsService(): void {
  _instance = null;
}
