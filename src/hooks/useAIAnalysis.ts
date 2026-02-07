/**
 * useAIAnalysis Hook (PRD-051)
 * Gerencia carregamento, geração e regeneração de análises IA
 * Integrado com React Query para reatividade automática
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AIAgentSettings, AIAnalysis, AIAnalysisResult, AnalysisType } from '@/types/aiAnalysis';
import type { GaugeProResult } from '@/types/gaugePro';
import { loadAnalysisResult, saveAnalysisResult, loadAnalysisFromSupabase } from '@/lib/aiAgent/storageService';
import { loadAgentSettingsAsync } from '@/lib/aiAgent/settingsLoader';
import { generateSingleAnalysis, generateBothAnalyses } from '@/lib/aiAgent/analysisGenerator';
import { gaugeProKeys } from './useGaugeProQuery';

interface UseAIAnalysisOptions {
  candidateId: string;
  candidateName?: string;
  jobTitle?: string;
}

interface UseAIAnalysisReturn {
  practicalAnalysis: AIAnalysis | null;
  technicalAnalysis: AIAnalysis | null;
  isGenerating: boolean;
  isRegenerating: boolean;
  error: string | null;
  agentEnabled: boolean;
  generateAnalyses: (result: GaugeProResult) => Promise<void>;
  regenerateAnalysis: (type: AnalysisType, result: GaugeProResult) => Promise<void>;
}

export function useAIAnalysis({
  candidateId,
  candidateName = 'Candidato',
  jobTitle,
}: UseAIAnalysisOptions): UseAIAnalysisReturn {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AIAgentSettings | null>(null);

  // Load settings from Supabase (async, with localStorage fallback)
  useEffect(() => {
    loadAgentSettingsAsync().then(setSettings);
  }, []);

  // React Query: fetch AI analysis from Supabase with localStorage as initialData
  const { data: analysisResult } = useQuery<AIAnalysisResult | null>({
    queryKey: gaugeProKeys.aiAnalysisByCandidate(candidateId),
    queryFn: async () => {
      const remote = await loadAnalysisFromSupabase(candidateId);
      if (remote) {
        // Update localStorage cache with latest Supabase data
        saveAnalysisResult(remote);
        return remote;
      }
      // Fallback: if Supabase has nothing, check localStorage
      const stored = loadAnalysisResult(candidateId);
      if (stored) {
        // Lazy sync: push localStorage data to Supabase
        const hasCompleted =
          (stored.practical?.status === 'completed') ||
          (stored.technical?.status === 'completed');
        if (hasCompleted) {
          saveAnalysisResult(stored);
        }
        return stored;
      }
      return null;
    },
    enabled: !!candidateId,
    // Use localStorage as instant placeholder while Supabase loads
    placeholderData: () => candidateId ? loadAnalysisResult(candidateId) : null,
  });

  const generateAnalyses = useCallback(
    async (result: GaugeProResult) => {
      const currentSettings = settings ?? (await loadAgentSettingsAsync());
      if (!currentSettings.agentEnabled) return;

      setIsGenerating(true);
      setError(null);

      try {
        const analyses = await generateBothAnalyses(
          result,
          candidateName,
          currentSettings,
          jobTitle,
        );
        saveAnalysisResult(analyses);
        // Invalidate React Query cache so UI updates automatically
        queryClient.invalidateQueries({
          queryKey: gaugeProKeys.aiAnalysisByCandidate(candidateId),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao gerar análises');
      } finally {
        setIsGenerating(false);
      }
    },
    [candidateId, candidateName, jobTitle, settings, queryClient],
  );

  const regenerateAnalysis = useCallback(
    async (type: AnalysisType, result: GaugeProResult) => {
      const currentSettings = settings ?? (await loadAgentSettingsAsync());

      setIsRegenerating(true);
      setError(null);

      try {
        const newAnalysis = await generateSingleAnalysis(
          type,
          result,
          candidateName,
          currentSettings,
          jobTitle,
        );

        newAnalysis.regeneratedAt = new Date().toISOString();

        const updated: AIAnalysisResult = {
          candidateId,
          testResultId: result.id,
          practical:
            type === 'practical'
              ? newAnalysis
              : analysisResult?.practical,
          technical:
            type === 'technical'
              ? newAnalysis
              : analysisResult?.technical,
          generatedAt: analysisResult?.generatedAt || new Date().toISOString(),
        };

        saveAnalysisResult(updated);
        // Invalidate React Query cache so UI updates automatically
        queryClient.invalidateQueries({
          queryKey: gaugeProKeys.aiAnalysisByCandidate(candidateId),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao regenerar análise',
        );
      } finally {
        setIsRegenerating(false);
      }
    },
    [candidateId, candidateName, jobTitle, settings, analysisResult, queryClient],
  );

  return {
    practicalAnalysis: analysisResult?.practical ?? null,
    technicalAnalysis: analysisResult?.technical ?? null,
    isGenerating,
    isRegenerating,
    error,
    agentEnabled: settings?.agentEnabled ?? false,
    generateAnalyses,
    regenerateAnalysis,
  };
}
