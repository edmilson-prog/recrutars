/**
 * AI Analysis Storage Service (PRD-051)
 * Dual-write: localStorage (cache) + Supabase (persistent)
 */

import type { AIAnalysis, AIAnalysisResult } from '@/types/aiAnalysis';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY_PREFIX = 'gauge-ai-analysis-';

function getKey(candidateId: string): string {
  return `${STORAGE_KEY_PREFIX}${candidateId}`;
}

// --- localStorage (cache/fallback) ---

function saveToLocalStorage(result: AIAnalysisResult): void {
  localStorage.setItem(getKey(result.candidateId), JSON.stringify(result));
}

function loadFromLocalStorage(candidateId: string): AIAnalysisResult | null {
  const raw = localStorage.getItem(getKey(candidateId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AIAnalysisResult;
  } catch {
    return null;
  }
}

// --- Supabase row mapping ---

interface AiAnalysisRow {
  id: string;
  candidate_id: string;
  test_result_id: string;
  analysis_type: string;
  content: string;
  status: string;
  model_used: string | null;
  tokens_input: number;
  tokens_output: number;
  generation_time_ms: number;
  error_message: string | null;
  regenerated_at: string | null;
  regenerated_by: string | null;
  created_at: string;
  updated_at: string;
}

function analysisToRow(a: AIAnalysis, teamMemberId?: string): Record<string, unknown> {
  return {
    candidate_id: a.candidateId || null,
    team_member_id: teamMemberId ?? null,
    test_result_id: a.testResultId,
    analysis_type: a.analysisType,
    content: a.content,
    status: a.status,
    model_used: a.modelUsed,
    tokens_input: a.tokensInput,
    tokens_output: a.tokensOutput,
    generation_time_ms: a.generationTimeMs,
    error_message: a.errorMessage ?? null,
    regenerated_at: a.regeneratedAt ?? null,
    regenerated_by: a.regeneratedBy ?? null,
  };
}

function rowToAnalysis(r: AiAnalysisRow): AIAnalysis {
  return {
    id: r.id,
    candidateId: r.candidate_id,
    testResultId: r.test_result_id,
    analysisType: r.analysis_type as AIAnalysis['analysisType'],
    content: r.content,
    status: r.status as AIAnalysis['status'],
    modelUsed: r.model_used ?? '',
    tokensInput: r.tokens_input,
    tokensOutput: r.tokens_output,
    generationTimeMs: r.generation_time_ms,
    createdAt: r.created_at,
    errorMessage: r.error_message ?? undefined,
    regeneratedAt: r.regenerated_at ?? undefined,
    regeneratedBy: r.regenerated_by ?? undefined,
  };
}

// --- Supabase persistence ---

async function saveToSupabase(analysis: AIAnalysis, teamMemberId?: string): Promise<void> {
  const row = analysisToRow(analysis, teamMemberId);
  const { error } = await supabase
    .from('ai_analyses')
    .upsert(row, { onConflict: 'test_result_id,analysis_type' });
  if (error) throw error;
}

export async function loadAnalysisFromSupabase(
  candidateId: string,
  testResultId?: string,
): Promise<AIAnalysisResult | null> {
  let query = supabase
    .from('ai_analyses')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });

  if (testResultId) {
    query = query.eq('test_result_id', testResultId);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) return null;

  const rows = data as AiAnalysisRow[];
  const practical = rows.find((r) => r.analysis_type === 'practical');
  const technical = rows.find((r) => r.analysis_type === 'technical');

  if (!practical && !technical) return null;

  return {
    candidateId,
    testResultId: (practical ?? technical)!.test_result_id,
    practical: practical ? rowToAnalysis(practical) : undefined,
    technical: technical ? rowToAnalysis(technical) : undefined,
    generatedAt: (practical ?? technical)!.created_at,
  };
}

export async function loadAllAnalysesFromSupabase(
  candidateId: string,
): Promise<AIAnalysisResult[]> {
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return [];

  return groupAnalysisRows(data as AiAnalysisRow[], candidateId);
}

/** Load all AI analyses for a team member (by test_result_ids from their gauge_pro_results) */
export async function loadAllAnalysesByResultIds(
  testResultIds: string[],
): Promise<AIAnalysisResult[]> {
  if (testResultIds.length === 0) return [];

  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .in('test_result_id', testResultIds)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return [];

  return groupAnalysisRows(data as AiAnalysisRow[]);
}

function groupAnalysisRows(rows: AiAnalysisRow[], candidateId?: string): AIAnalysisResult[] {
  const grouped = new Map<string, AiAnalysisRow[]>();
  for (const row of rows) {
    const key = row.test_result_id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(row);
  }

  return Array.from(grouped.entries()).map(([testResultId, group]) => {
    const practical = group.find((r) => r.analysis_type === 'practical');
    const technical = group.find((r) => r.analysis_type === 'technical');
    return {
      candidateId: candidateId ?? (practical ?? technical)!.candidate_id ?? '',
      testResultId,
      practical: practical ? rowToAnalysis(practical) : undefined,
      technical: technical ? rowToAnalysis(technical) : undefined,
      generatedAt: (practical ?? technical)!.created_at,
    };
  });
}

// --- Public API (dual-write) ---

export function saveAnalysisResult(result: AIAnalysisResult, localOnly = false): void {
  // 1. Always save to localStorage (sync, fast)
  saveToLocalStorage(result);

  if (localOnly) return;

  // 2. Fire-and-forget save to Supabase
  const analyses: AIAnalysis[] = [];
  if (result.practical) analyses.push(result.practical);
  if (result.technical) analyses.push(result.technical);

  if (analyses.length > 0) {
    Promise.all(analyses.map((a) => saveToSupabase(a, result.teamMemberId))).catch((err) => {
      console.warn('[AI Storage] Supabase save failed, localStorage has the data:', err);
    });
  }
}

export function loadAnalysisResult(
  candidateId: string,
): AIAnalysisResult | null {
  return loadFromLocalStorage(candidateId);
}

export function deleteAnalysisResult(candidateId: string): void {
  localStorage.removeItem(getKey(candidateId));
}
