/**
 * Gauge-Pro Service — Supabase Implementation
 * PRD-066: Reads/writes from Gauge-Pro related tables
 *
 * Tables expected:
 *   gauge_pro_words, gauge_pro_scenarios, gauge_pro_archetypes,
 *   gauge_pro_assessments, gauge_pro_results
 *
 * Static reference data (words, scenarios, archetypes) falls back to
 * bundled constants when tables are not yet populated.
 */

import { supabase } from '@/lib/supabase';
import type {
  AdjectiveWord,
  Scenario,
  ScenarioOption,
  ArchetypeProfile,
  GaugeProAssessment,
  GaugeProPhase,
  GaugeProResult,
  GaugeProDimension,
  DimensionScores,
  DimensionClassification,
  WordStepResponse,
  ScenarioResponse,
} from '@/types/gaugePro';
import type { IGaugeProService } from './gaugeProService';

// Bundled fallbacks for reference data
import { GAUGE_PRO_ADJECTIVES } from '@/data/gaugeProWords';
import { GAUGE_PRO_SCENARIOS } from '@/data/gaugeProScenarios';
import { ARCHETYPE_PROFILES } from '@/data/gaugeProArchetypes';

// ---------------------------------------------------------------------------
// Row ↔ Domain mapping
// ---------------------------------------------------------------------------

function rowToAssessment(r: Record<string, unknown>): GaugeProAssessment {
  return {
    id: r.id as string,
    candidateId: r.candidate_id as string | undefined,
    teamMemberId: r.team_member_id as string | undefined,
    phase: r.phase as GaugeProPhase,
    startedAt: r.started_at as string,

    part1StartedAt: r.part1_started_at as string | undefined,
    part1CompletedAt: r.part1_completed_at as string | undefined,
    wordStepResponses: (r.word_step_responses as WordStepResponse[]) ?? [],
    shuffledWordOrders:
      (r.shuffled_word_orders as Partial<Record<GaugeProDimension, number[]>>) ?? {},
    currentWordStep: (r.current_word_step as number) ?? 0,

    part2StartedAt: r.part2_started_at as string | undefined,
    part2CompletedAt: r.part2_completed_at as string | undefined,
    scenarioResponses: (r.scenario_responses as ScenarioResponse[]) ?? [],
    currentScenarioIndex: (r.current_scenario_index as number) ?? 0,

    completedAt: r.completed_at as string | undefined,
  };
}

function assessmentToRow(
  model: Partial<GaugeProAssessment>,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (model.candidateId !== undefined) row.candidate_id = model.candidateId;
  if (model.teamMemberId !== undefined) row.team_member_id = model.teamMemberId;
  if (model.phase !== undefined) row.phase = model.phase;
  if (model.startedAt !== undefined) row.started_at = model.startedAt;
  if (model.part1StartedAt !== undefined) row.part1_started_at = model.part1StartedAt;
  if (model.part1CompletedAt !== undefined) row.part1_completed_at = model.part1CompletedAt;
  if (model.wordStepResponses !== undefined) row.word_step_responses = model.wordStepResponses;
  if (model.shuffledWordOrders !== undefined) row.shuffled_word_orders = model.shuffledWordOrders;
  if (model.currentWordStep !== undefined) row.current_word_step = model.currentWordStep;
  if (model.part2StartedAt !== undefined) row.part2_started_at = model.part2StartedAt;
  if (model.part2CompletedAt !== undefined) row.part2_completed_at = model.part2CompletedAt;
  if (model.scenarioResponses !== undefined) row.scenario_responses = model.scenarioResponses;
  if (model.currentScenarioIndex !== undefined) row.current_scenario_index = model.currentScenarioIndex;
  if (model.completedAt !== undefined) row.completed_at = model.completedAt;

  return row;
}

function rowToResult(r: Record<string, unknown>): GaugeProResult {
  return {
    id: r.id as string,
    assessmentId: r.assessment_id as string,
    candidateId: r.candidate_id as string | undefined,
    teamMemberId: r.team_member_id as string | undefined,
    part1Scores: r.part1_scores as DimensionScores,
    part2Scores: r.part2_scores as DimensionScores,
    finalScores: r.final_scores as DimensionScores,
    classifications: r.classifications as Record<GaugeProDimension, DimensionClassification>,
    archetype: r.archetype as ArchetypeProfile,
    primaryDimension: r.primary_dimension as GaugeProDimension,
    secondaryDimension: r.secondary_dimension as GaugeProDimension,
    strengths: r.strengths as string[],
    developmentAreas: r.development_areas as string[],
    careerRecommendations: r.career_recommendations as string[],
    xpAwarded: r.xp_awarded as number,
    badgeAwarded: r.badge_awarded as string,
    generatedAt: r.generated_at as string,
  };
}

function resultToRow(
  model: Omit<GaugeProResult, 'id'>,
): Record<string, unknown> {
  return {
    assessment_id: model.assessmentId,
    candidate_id: model.candidateId ?? null,
    team_member_id: model.teamMemberId ?? null,
    part1_scores: model.part1Scores,
    part2_scores: model.part2Scores,
    final_scores: model.finalScores,
    classifications: model.classifications,
    archetype: model.archetype,
    primary_dimension: model.primaryDimension,
    secondary_dimension: model.secondaryDimension,
    strengths: model.strengths,
    development_areas: model.developmentAreas,
    career_recommendations: model.careerRecommendations,
    xp_awarded: model.xpAwarded,
    badge_awarded: model.badgeAwarded,
    generated_at: model.generatedAt,
  };
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class SupabaseGaugeProService implements IGaugeProService {
  // ---- Static Data ----
  // Falls back to bundled data if the table doesn't exist or is empty.

  async getWords(): Promise<AdjectiveWord[]> {
    try {
      const { data, error } = await supabase
        .from('gauge_pro_words')
        .select('*')
        .order('id');
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((r: Record<string, unknown>) => ({
          id: r.id as number,
          text: r.text as string,
          dimension: r.dimension as GaugeProDimension,
          polarity: r.polarity as 'high' | 'low',
        }));
      }
    } catch {
      // Table may not exist yet — fall through
    }
    return GAUGE_PRO_ADJECTIVES;
  }

  async getScenarios(): Promise<Scenario[]> {
    try {
      const { data, error } = await supabase
        .from('gauge_pro_scenarios')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((r: Record<string, unknown>) => ({
          id: r.id as number,
          order: r.sort_order as number,
          title: r.title as string,
          situation: r.situation as string,
          options: r.options as ScenarioOption[],
        }));
      }
    } catch {
      // Table may not exist yet — fall through
    }
    return GAUGE_PRO_SCENARIOS;
  }

  async getArchetypes(): Promise<ArchetypeProfile[]> {
    try {
      const { data, error } = await supabase
        .from('gauge_pro_archetypes')
        .select('*')
        .order('name');
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          name: r.name as string,
          description: r.description as string,
          strengths: r.strengths as string[],
          developmentAreas: (r.development_areas as string[]) ?? [],
          idealRoles: (r.ideal_roles as string[]) ?? [],
          workStyle: r.work_style as string,
          communicationStyle: r.communication_style as string,
        }));
      }
    } catch {
      // Fall through
    }
    return ARCHETYPE_PROFILES;
  }

  async getArchetype(id: string): Promise<ArchetypeProfile | null> {
    const archetypes = await this.getArchetypes();
    return archetypes.find((a) => a.id === id) ?? null;
  }

  // ---- Assessment Sessions ----

  async startAssessment(candidateId: string): Promise<GaugeProAssessment> {
    const now = new Date().toISOString();

    const row = {
      candidate_id: candidateId,
      phase: 'intro',
      started_at: now,
      word_step_responses: [],
      shuffled_word_orders: {},
      current_word_step: 0,
      scenario_responses: [],
      current_scenario_index: 0,
    };

    const { data, error } = await supabase
      .from('gauge_pro_assessments')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return rowToAssessment(data as Record<string, unknown>);
  }

  async getAssessment(id: string): Promise<GaugeProAssessment | null> {
    const { data, error } = await supabase
      .from('gauge_pro_assessments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToAssessment(data as Record<string, unknown>) : null;
  }

  async getAssessmentByCandidate(
    candidateId: string,
  ): Promise<GaugeProAssessment | null> {
    const { data, error } = await supabase
      .from('gauge_pro_assessments')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToAssessment(data as Record<string, unknown>) : null;
  }

  async getAssessmentByTeamMember(
    teamMemberId: string,
  ): Promise<GaugeProAssessment | null> {
    const { data, error } = await supabase
      .from('gauge_pro_assessments')
      .select('*')
      .eq('team_member_id', teamMemberId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToAssessment(data as Record<string, unknown>) : null;
  }

  async updateAssessment(
    id: string,
    updates: Partial<GaugeProAssessment>,
  ): Promise<GaugeProAssessment> {
    const row = assessmentToRow(updates);

    const { data, error } = await supabase
      .from('gauge_pro_assessments')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return rowToAssessment(data as Record<string, unknown>);
  }

  // ---- Results ----

  async saveResult(data: Omit<GaugeProResult, 'id'>): Promise<GaugeProResult> {
    const row = resultToRow(data);

    const { data: created, error } = await supabase
      .from('gauge_pro_results')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return rowToResult(created as Record<string, unknown>);
  }

  async getResult(assessmentId: string): Promise<GaugeProResult | null> {
    const { data, error } = await supabase
      .from('gauge_pro_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToResult(data as Record<string, unknown>) : null;
  }

  async getResultByCandidate(candidateId: string): Promise<GaugeProResult | null> {
    const { data, error } = await supabase
      .from('gauge_pro_results')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToResult(data as Record<string, unknown>) : null;
  }

  async getResultByTeamMember(teamMemberId: string): Promise<GaugeProResult | null> {
    const { data, error } = await supabase
      .from('gauge_pro_results')
      .select('*')
      .eq('team_member_id', teamMemberId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToResult(data as Record<string, unknown>) : null;
  }

  async getAllResults(): Promise<GaugeProResult[]> {
    const { data, error } = await supabase
      .from('gauge_pro_results')
      .select('*')
      .order('generated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: Record<string, unknown>) => rowToResult(r));
  }
}
