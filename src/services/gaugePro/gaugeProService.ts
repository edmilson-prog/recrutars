/**
 * Gauge-Pro Service — Interface
 * PRD-066: Service Layer for Gauge-Pro assessments
 *
 * Manages words (PRD-049), scenarios (PRD-050), archetypes,
 * assessment sessions and results.
 */

import type {
  AdjectiveWord,
  Scenario,
  ScenarioOption,
  ArchetypeProfile,
  GaugeProDimension,
  GaugeProAssessment,
  GaugeProResult,
} from '@/types/gaugePro';
// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

export interface IGaugeProService {
  // ---- Static Data ----

  /** Get all 100 adjective words (PRD-049) */
  getWords(): Promise<AdjectiveWord[]>;

  /** Get all 15 situational scenarios (PRD-050) */
  getScenarios(): Promise<Scenario[]>;

  /** Get all 16 archetype profiles */
  getArchetypes(): Promise<ArchetypeProfile[]>;

  /** Get a single archetype by id */
  getArchetype(id: string): Promise<ArchetypeProfile | null>;

  // ---- Assessment Sessions ----

  /** Start a new Gauge-Pro assessment for a candidate */
  startAssessment(candidateId: string): Promise<GaugeProAssessment>;

  /** Get an assessment session by id */
  getAssessment(id: string): Promise<GaugeProAssessment | null>;

  /** Get the latest assessment for a candidate */
  getAssessmentByCandidate(candidateId: string): Promise<GaugeProAssessment | null>;

  /** Get the latest assessment for a team member (unified collaborator flow) */
  getAssessmentByTeamMember(teamMemberId: string): Promise<GaugeProAssessment | null>;

  /** Persist intermediate assessment state (step progress, responses) */
  updateAssessment(
    id: string,
    updates: Partial<GaugeProAssessment>,
  ): Promise<GaugeProAssessment>;

  // ---- Results ----

  /** Persist a computed result */
  saveResult(data: Omit<GaugeProResult, 'id'>): Promise<GaugeProResult>;

  /** Get a result by assessment id */
  getResult(assessmentId: string): Promise<GaugeProResult | null>;

  /** Get the latest result for a candidate */
  getResultByCandidate(candidateId: string): Promise<GaugeProResult | null>;

  /** Get the latest result for a team member (unified collaborator flow) */
  getResultByTeamMember(teamMemberId: string): Promise<GaugeProResult | null>;

  /** Get all results (RLS-filtered) */
  getAllResults(): Promise<GaugeProResult[]>;

  // ---- Admin CRUD ----

  /** Get all words including inactive (admin) */
  getAdminWords(): Promise<AdjectiveWord[]>;
  /** Update a word's text or is_active */
  updateWord(id: number, data: { text?: string; isActive?: boolean }): Promise<AdjectiveWord>;
  /** Create a new word */
  createWord(data: { text: string; dimension: GaugeProDimension; polarity: 'high' | 'low' }): Promise<AdjectiveWord>;
  /** Toggle word active status */
  toggleWordActive(id: number): Promise<void>;
  /** Count how many assessments used this word */
  getWordUsageCount(id: number): Promise<number>;

  /** Get all scenarios including inactive (admin) */
  getAdminScenarios(): Promise<Scenario[]>;
  /** Update a scenario */
  updateScenario(id: number, data: { title?: string; situation?: string; sortOrder?: number; options?: ScenarioOption[]; isActive?: boolean }): Promise<Scenario>;
  /** Create a new scenario */
  createScenario(data: { title: string; situation: string; sortOrder: number; options: ScenarioOption[] }): Promise<Scenario>;
  /** Toggle scenario active status */
  toggleScenarioActive(id: number): Promise<void>;
  /** Count how many assessments used this scenario */
  getScenarioUsageCount(id: number): Promise<number>;

  /** Get all archetypes including inactive (admin) */
  getAdminArchetypes(): Promise<ArchetypeProfile[]>;
  /** Update an archetype */
  updateArchetype(id: string, data: Partial<Omit<ArchetypeProfile, 'id'>> & { isActive?: boolean }): Promise<ArchetypeProfile>;
  /** Toggle archetype active status */
  toggleArchetypeActive(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: IGaugeProService | null = null;

export async function getGaugeProService(): Promise<IGaugeProService> {
  if (_instance) return _instance;

  const { SupabaseGaugeProService } = await import('./gaugeProService.supabase');
  _instance = new SupabaseGaugeProService();
  return _instance;
}
