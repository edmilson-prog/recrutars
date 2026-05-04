/**
 * AI Match Service — Interface
 *
 * Orquestra: lookup de análise cacheada, reserva de cota, chamada Claude,
 * persistência do resultado, refund em erro.
 */

import type { AIMatchAnalysis, AIMatchQuotaStatus, AIMatchReservation } from '@/types/aiMatch';

export interface IAIMatchService {
  /** Busca análise cacheada para o par (candidato, vaga). Retorna null se não existir. */
  getAnalysis(candidateId: string, jobId: string): Promise<AIMatchAnalysis | null>;

  /** Reserva uma cota. Retorna usage_id ou null se cota esgotada. Server-side via RPC. */
  reserveCredit(candidateId: string, jobId: string): Promise<AIMatchReservation | null>;

  /** Persiste o resultado de uma análise (após chamada Claude bem-sucedida). */
  saveAnalysis(
    usageId: string,
    content: string,
    modelUsed: string,
    tokensInput: number,
    tokensOutput: number,
    generationTimeMs: number,
    algorithmicScore: number,
  ): Promise<string>;

  /** Devolve a cota reservada (chamado em caso de erro na chamada Claude). */
  refundCredit(usageId: string): Promise<boolean>;

  /** Retorna status atual da cota da empresa logada. */
  getQuotaStatus(): Promise<AIMatchQuotaStatus>;
}

let _instance: IAIMatchService | null = null;

export function getAIMatchService(): IAIMatchService {
  if (!_instance) {
    // Lazy import to avoid circular deps
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AIMatchServiceSupabase } = require('./aiMatchService.supabase');
    _instance = new AIMatchServiceSupabase();
  }
  return _instance!;
}
