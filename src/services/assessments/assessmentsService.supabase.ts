/**
 * Assessments Service — Supabase Implementation
 * PRD-066: Reads/writes from assessment-related tables
 *
 * Tables expected:
 *   assessment_dimensions, assessment_categories, assessment_questions,
 *   behavioral_assessments, behavioral_responses, behavioral_results
 */

import { supabase } from '@/lib/supabase';
import type {
  AssessmentDimension,
  AssessmentCategory,
  AssessmentQuestion,
  QuestionFilters,
  BehavioralAssessment,
  BehavioralAssessmentStatus,
  BehavioralResponse,
  BehavioralResult,
  BehavioralRedFlag,
  QuestionType,
  QuestionLevel,
} from '@/types/assessment';
import type { IAssessmentsService } from './assessmentsService';

// ---------------------------------------------------------------------------
// Row ↔ Domain mapping helpers
// ---------------------------------------------------------------------------

function rowToDimension(r: Record<string, unknown>): AssessmentDimension {
  return {
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    description: r.description as string,
    icon: r.icon as string,
    color: r.color as string,
    order: r.order as number,
    isActive: r.is_active as boolean,
    questionCount: r.question_count as number | undefined,
  };
}

function rowToCategory(r: Record<string, unknown>): AssessmentCategory {
  return {
    id: r.id as string,
    dimensionId: r.dimension_id as string,
    name: r.name as string,
    slug: r.slug as string,
    description: r.description as string,
    order: r.order as number,
    isActive: r.is_active as boolean,
    questionCount: r.question_count as number | undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function rowToQuestion(r: Record<string, unknown>): AssessmentQuestion {
  return {
    id: r.id as string,
    categoryId: r.category_id as string,
    code: r.code as string,
    type: r.type as QuestionType,
    level: r.level as QuestionLevel,
    text: r.text as string,
    helpText: r.help_text as string | undefined,
    options: r.options as AssessmentQuestion['options'],
    correctWeight: r.correct_weight as Record<string, number> | undefined,
    redFlagThreshold: r.red_flag_threshold as number | undefined,
    isActive: r.is_active as boolean,
    usageCount: (r.usage_count as number) ?? 0,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function rowToAssessment(r: Record<string, unknown>): BehavioralAssessment {
  return {
    id: r.id as string,
    candidateId: r.candidate_id as string,
    status: r.status as BehavioralAssessmentStatus,
    questionsIds: (r.questions_ids as string[]) ?? [],
    totalQuestions: r.total_questions as number,
    currentQuestionIndex: r.current_question_index as number,
    answeredCount: r.answered_count as number,
    startedAt: r.started_at as string,
    lastActivityAt: r.last_activity_at as string,
    completedAt: r.completed_at as string | undefined,
    totalTimeSeconds: r.total_time_seconds as number | undefined,
    expiresAt: r.expires_at as string,
  };
}

function rowToResponse(r: Record<string, unknown>): BehavioralResponse {
  return {
    id: r.id as string,
    assessmentId: r.assessment_id as string,
    questionId: r.question_id as string,
    response: r.response as string,
    score: r.score as number,
    answeredAt: r.answered_at as string,
    timeSpentSeconds: r.time_spent_seconds as number,
  };
}

function rowToResult(r: Record<string, unknown>): BehavioralResult {
  return {
    id: r.id as string,
    assessmentId: r.assessment_id as string,
    candidateId: r.candidate_id as string,
    overallScore: r.overall_score as number,
    personalityScore: r.personality_score as number,
    characterScore: r.character_score as number,
    competencyScore: r.competency_score as number,
    categoryScores: r.category_scores as Record<string, number>,
    strengths: r.strengths as string[],
    developmentAreas: r.development_areas as string[],
    redFlags: (r.red_flags as BehavioralRedFlag[]) ?? [],
    summary: r.summary as string,
    insights: r.insights as Record<string, string>,
    careerRecommendations: r.career_recommendations as string[],
    xpAwarded: r.xp_awarded as number,
    badgeAwarded: r.badge_awarded as string,
    generatedAt: r.generated_at as string,
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class SupabaseAssessmentsService implements IAssessmentsService {
  // ---- Question Bank ----

  async getDimensions(): Promise<AssessmentDimension[]> {
    const { data, error } = await supabase
      .from('assessment_dimensions')
      .select('*')
      .order('order');
    if (error) throw error;
    return (data as Record<string, unknown>[]).map(rowToDimension);
  }

  async getCategories(dimensionId?: string): Promise<AssessmentCategory[]> {
    let query = supabase.from('assessment_categories').select('*').order('order');
    if (dimensionId) query = query.eq('dimension_id', dimensionId);

    const { data, error } = await query;
    if (error) throw error;
    return (data as Record<string, unknown>[]).map(rowToCategory);
  }

  async getQuestions(filters?: QuestionFilters): Promise<AssessmentQuestion[]> {
    let query = supabase.from('assessment_questions').select('*');

    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
    if (filters?.type && filters.type !== 'all') query = query.eq('type', filters.type);
    if (filters?.level && filters.level !== 'all') query = query.eq('level', filters.level);
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('is_active', filters.status === 'active');
    }
    if (filters?.search) {
      query = query.or(`text.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    }

    // If filtering by dimension, we need category ids first
    if (filters?.dimensionId) {
      const cats = await this.getCategories(filters.dimensionId);
      const catIds = cats.map((c) => c.id);
      if (catIds.length > 0) {
        query = query.in('category_id', catIds);
      } else {
        return [];
      }
    }

    const { data, error } = await query.order('code');
    if (error) throw error;
    return (data as Record<string, unknown>[]).map(rowToQuestion);
  }

  // ---- Assessment Sessions ----

  async startAssessment(candidateId: string): Promise<BehavioralAssessment> {
    const now = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const row = {
      candidate_id: candidateId,
      status: 'in_progress',
      questions_ids: [],
      total_questions: 0,
      current_question_index: 0,
      answered_count: 0,
      started_at: now,
      last_activity_at: now,
      expires_at: expiresAt,
    };

    const { data, error } = await supabase
      .from('behavioral_assessments')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return rowToAssessment(data as Record<string, unknown>);
  }

  async getAssessment(id: string): Promise<BehavioralAssessment | null> {
    const { data, error } = await supabase
      .from('behavioral_assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToAssessment(data as Record<string, unknown>) : null;
  }

  async submitResponse(
    assessmentId: string,
    questionId: string,
    response: string,
  ): Promise<BehavioralResponse> {
    const now = new Date().toISOString();
    const row = {
      assessment_id: assessmentId,
      question_id: questionId,
      response,
      score: 0,
      answered_at: now,
      time_spent_seconds: 0,
    };

    const { data, error } = await supabase
      .from('behavioral_responses')
      .insert(row)
      .select()
      .single();
    if (error) throw error;

    // Advance the session counters
    await supabase.rpc('advance_assessment', {
      p_assessment_id: assessmentId,
      p_last_activity: now,
    }).then(({ error: rpcError }) => {
      // Non-critical: if the RPC does not exist yet, we silently skip
      if (rpcError) console.warn('advance_assessment RPC skipped:', rpcError.message);
    });

    return rowToResponse(data as Record<string, unknown>);
  }

  async completeAssessment(assessmentId: string): Promise<BehavioralResult> {
    const now = new Date().toISOString();

    // Mark assessment as completed
    await supabase
      .from('behavioral_assessments')
      .update({ status: 'completed', completed_at: now })
      .eq('id', assessmentId);

    // Compute result (server-side function or manual)
    const { data: resultRow, error } = await supabase
      .from('behavioral_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .maybeSingle();

    if (error) throw error;
    if (!resultRow) {
      throw new Error(`Result not generated for assessment ${assessmentId}`);
    }
    return rowToResult(resultRow as Record<string, unknown>);
  }

  // ---- Results ----

  async getResult(assessmentId: string): Promise<BehavioralResult | null> {
    const { data, error } = await supabase
      .from('behavioral_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToResult(data as Record<string, unknown>) : null;
  }

  async getResultByCandidate(candidateId: string): Promise<BehavioralResult | null> {
    const { data, error } = await supabase
      .from('behavioral_results')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToResult(data as Record<string, unknown>) : null;
  }
}
