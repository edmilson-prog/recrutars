/**
 * Assessments Service — Interface
 * PRD-066: Service Layer for behavioral assessment question bank
 *
 * Manages dimensions, categories, questions, assessment sessions,
 * responses and results (PRD-046 / PRD-047).
 */

import type {
  AssessmentDimension,
  AssessmentCategory,
  AssessmentQuestion,
  QuestionFilters,
  BehavioralAssessment,
  BehavioralResponse,
  BehavioralResult,
} from '@/types/assessment';
// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

export interface IAssessmentsService {
  // ---- Question Bank (PRD-046) ----

  /** Get all assessment dimensions */
  getDimensions(): Promise<AssessmentDimension[]>;

  /** Get categories, optionally filtered by dimension */
  getCategories(dimensionId?: string): Promise<AssessmentCategory[]>;

  /** Get questions with optional filters */
  getQuestions(filters?: QuestionFilters): Promise<AssessmentQuestion[]>;

  // ---- Assessment Sessions (PRD-047) ----

  /** Start a new behavioral assessment for a candidate */
  startAssessment(candidateId: string): Promise<BehavioralAssessment>;

  /** Get an assessment session by id */
  getAssessment(id: string): Promise<BehavioralAssessment | null>;

  /** Submit a single response within an assessment */
  submitResponse(
    assessmentId: string,
    questionId: string,
    response: string,
  ): Promise<BehavioralResponse>;

  /** Mark the assessment as completed and compute the result */
  completeAssessment(assessmentId: string): Promise<BehavioralResult>;

  // ---- Results ----

  /** Get a computed result by assessment id */
  getResult(assessmentId: string): Promise<BehavioralResult | null>;

  /** Get a computed result by candidate id (latest) */
  getResultByCandidate(candidateId: string): Promise<BehavioralResult | null>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: IAssessmentsService | null = null;

export async function getAssessmentsService(): Promise<IAssessmentsService> {
  if (_instance) return _instance;

  const { SupabaseAssessmentsService } = await import(
    './assessmentsService.supabase'
  );
  _instance = new SupabaseAssessmentsService();
  return _instance;
}
