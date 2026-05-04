/**
 * AI Match Service — Supabase Implementation
 *
 * - getAnalysis: SELECT direto em ai_match_analyses (RLS protege)
 * - reserveCredit / saveAnalysis / refundCredit / getQuotaStatus: via RPC SECURITY DEFINER
 */

import { supabase } from '@/lib/supabase';
import type { IAIMatchService } from './aiMatchService';
import type { AIMatchAnalysis, AIMatchQuotaStatus, AIMatchReservation } from '@/types/aiMatch';

interface AIMatchAnalysisRow {
  id: string;
  usage_id: string;
  company_id: string;
  candidate_id: string;
  job_id: string;
  content: string;
  model_used: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  generation_time_ms: number | null;
  algorithmic_score_snapshot: number | null;
  created_at: string;
}

function rowToAnalysis(row: AIMatchAnalysisRow): AIMatchAnalysis {
  return {
    id: row.id,
    usageId: row.usage_id,
    companyId: row.company_id,
    candidateId: row.candidate_id,
    jobId: row.job_id,
    content: row.content,
    modelUsed: row.model_used,
    tokensInput: row.tokens_input,
    tokensOutput: row.tokens_output,
    generationTimeMs: row.generation_time_ms,
    algorithmicScoreSnapshot: row.algorithmic_score_snapshot,
    createdAt: row.created_at,
  };
}

export class AIMatchServiceSupabase implements IAIMatchService {
  async getAnalysis(candidateId: string, jobId: string): Promise<AIMatchAnalysis | null> {
    const { data, error } = await supabase
      .from('ai_match_analyses')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) {
      console.error('[aiMatchService.getAnalysis]', error);
      return null;
    }
    return data ? rowToAnalysis(data as AIMatchAnalysisRow) : null;
  }

  async reserveCredit(candidateId: string, jobId: string): Promise<AIMatchReservation | null> {
    const { data, error } = await supabase.rpc('consume_ai_match_credit', {
      p_candidate_id: candidateId,
      p_job_id: jobId,
    });

    if (error) {
      console.error('[aiMatchService.reserveCredit]', error);
      throw new Error(`Falha ao reservar cota: ${error.message}`);
    }

    if (!data) return null; // quota exhausted
    return { usageId: data as string };
  }

  async saveAnalysis(
    usageId: string,
    content: string,
    modelUsed: string,
    tokensInput: number,
    tokensOutput: number,
    generationTimeMs: number,
    algorithmicScore: number,
  ): Promise<string> {
    const { data, error } = await supabase.rpc('save_ai_match_analysis', {
      p_usage_id: usageId,
      p_content: content,
      p_model: modelUsed,
      p_tokens_in: tokensInput,
      p_tokens_out: tokensOutput,
      p_gen_ms: generationTimeMs,
      p_algo_score: algorithmicScore,
    });

    if (error) {
      console.error('[aiMatchService.saveAnalysis]', error);
      throw new Error(`Falha ao salvar análise: ${error.message}`);
    }
    return data as string;
  }

  async refundCredit(usageId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('refund_ai_match_credit', {
      p_usage_id: usageId,
    });

    if (error) {
      console.error('[aiMatchService.refundCredit]', error);
      return false;
    }
    return data === true;
  }

  async getQuotaStatus(): Promise<AIMatchQuotaStatus> {
    const { data, error } = await supabase.rpc('get_ai_match_quota_status');

    if (error) {
      console.error('[aiMatchService.getQuotaStatus]', error);
      return { used: 0, total: 3, remaining: 3, unlimited: false };
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | { used: number; total: number; remaining: number; unlimited: boolean }
      | undefined;

    return row ?? { used: 0, total: 3, remaining: 3, unlimited: false };
  }
}
