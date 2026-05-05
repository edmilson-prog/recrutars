/**
 * AI Match — React Query Hooks
 *
 * - useAIMatchAnalysis: query da análise cacheada (sem custo)
 * - useAIMatchQuotaStatus: query do contador de cota
 * - useGenerateAIMatch: mutation orquestrando reserveCredit → callLLMApi → saveAnalysis (refund se falhar)
 * - useRegenerateAIMatch: alias da mesma mutation (UX semântico distinto)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAIMatchService } from '@/services/aiMatch/aiMatchService';
import { buildAIMatchRequest } from '@/services/aiMatch/aiMatchPromptBuilder';
import { callLLMApi } from '@/lib/aiAgent/llmApiService';
import { loadAgentSettingsAsync } from '@/lib/aiAgent/settingsLoader';
import type { Candidate } from '@/types/candidate';
import type { Job } from '@/types/job';
import type { MatchResult } from '@/types/disc';
import type { AIMatchAnalysis, AIMatchQuotaStatus } from '@/types/aiMatch';

export const AI_MATCH_KEYS = {
  analysis: (candidateId: string, jobId: string) => ['aiMatch', 'analysis', candidateId, jobId] as const,
  quota: () => ['aiMatch', 'quota'] as const,
} as const;

export function useAIMatchAnalysis(
  candidateId: string | undefined,
  jobId: string | undefined,
) {
  return useQuery<AIMatchAnalysis | null>({
    queryKey: AI_MATCH_KEYS.analysis(candidateId ?? '', jobId ?? ''),
    queryFn: () => getAIMatchService().getAnalysis(candidateId!, jobId!),
    enabled: !!candidateId && !!jobId,
    staleTime: 5 * 60_000,
  });
}

export function useAIMatchQuotaStatus() {
  return useQuery<AIMatchQuotaStatus>({
    queryKey: AI_MATCH_KEYS.quota(),
    queryFn: () => getAIMatchService().getQuotaStatus(),
    staleTime: 30_000,
  });
}

export interface GenerateAIMatchParams {
  candidate: Candidate;
  job: Job;
  matchResult: MatchResult;
  behavioralAnalysisExisting?: string | null;
}

/**
 * Pipeline:
 * 1. Reserve credit (RPC) — returns usageId or null (exhausted → throw)
 * 2. Load LLM settings (model, key, temperature, maxTokens)
 * 3. Build request with prompt caching
 * 4. Call Claude
 * 5. On success: saveAnalysis RPC, invalidate queries
 * 6. On error after step 1: refundCredit (best-effort) + rethrow
 */
function useAIMatchMutation() {
  const qc = useQueryClient();
  const service = getAIMatchService();

  return useMutation({
    mutationFn: async (params: GenerateAIMatchParams): Promise<AIMatchAnalysis> => {
      const { candidate, job, matchResult, behavioralAnalysisExisting } = params;

      // Step 1: reserve
      const reservation = await service.reserveCredit(candidate.id, job.id);
      if (!reservation) {
        throw new Error('quota_exhausted');
      }

      try {
        // Step 2: settings
        const settings = await loadAgentSettingsAsync();
        if (!settings.apiKey) {
          throw new Error('Chave da API não configurada. Acesse /admin/configuracoes.');
        }

        // Step 3 + 4: build + call
        const request = buildAIMatchRequest(
          { candidate, job, matchResult, behavioralAnalysisExisting },
          settings.model,
          Math.max(settings.maxTokens, 3000), // dossier needs headroom
          settings.temperature,
        );

        const startedAt = Date.now();
        const response = await callLLMApi(request, settings.apiKey, settings.provider);
        const elapsedMs = Date.now() - startedAt;

        const content = response.content?.[0]?.type === 'text' ? response.content[0].text : '';
        if (!content) throw new Error('Resposta vazia da IA');

        // Step 5: save
        await service.saveAnalysis(
          reservation.usageId,
          content,
          response.model ?? settings.model,
          response.usage?.input_tokens ?? 0,
          response.usage?.output_tokens ?? 0,
          elapsedMs,
          matchResult.totalScore,
        );

        const saved = await service.getAnalysis(candidate.id, job.id);
        if (!saved) throw new Error('Análise salva mas não recuperada');
        return saved;
      } catch (err) {
        // Step 6: refund
        await service.refundCredit(reservation.usageId).catch(() => undefined);
        throw err;
      }
    },
    onSuccess: (analysis) => {
      qc.setQueryData(
        AI_MATCH_KEYS.analysis(analysis.candidateId, analysis.jobId),
        analysis,
      );
      qc.invalidateQueries({ queryKey: AI_MATCH_KEYS.quota() });
    },
  });
}

export const useGenerateAIMatch = useAIMatchMutation;
export const useRegenerateAIMatch = useAIMatchMutation;
