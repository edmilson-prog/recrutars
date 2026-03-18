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
  testResultId?: string;
}

interface UseAIAnalysisReturn {
  practicalAnalysis: AIAnalysis | null;
  technicalAnalysis: AIAnalysis | null;
  isGenerating: boolean;
  isRegenerating: boolean;
  error: string | null;
  agentEnabled: boolean;
  canGenerate: boolean;
  generateAnalyses: (result: GaugeProResult) => Promise<void>;
  regenerateAnalysis: (type: AnalysisType, result: GaugeProResult) => Promise<void>;
}

export function useAIAnalysis({
  candidateId,
  candidateName = 'Candidato',
  jobTitle,
  testResultId,
}: UseAIAnalysisOptions): UseAIAnalysisReturn {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AIAgentSettings | null>(null);
  const [generationAttempted, setGenerationAttempted] = useState(false);

  // Load settings from Supabase (async, with localStorage fallback)
  useEffect(() => {
    loadAgentSettingsAsync().then(setSettings);
  }, []);

  // React Query: fetch AI analysis from Supabase with localStorage as initialData
  const { data: analysisResult } = useQuery<AIAnalysisResult | null>({
    queryKey: gaugeProKeys.aiAnalysisByCandidate(candidateId, testResultId),
    queryFn: async () => {
      const remote = await loadAnalysisFromSupabase(candidateId, testResultId);
      if (remote) {
        // Update localStorage cache only (no Supabase write — may be read by company user)
        saveAnalysisResult(remote, true);
        return remote;
      }
      // Fallback: if Supabase has nothing, check localStorage
      const stored = loadAnalysisResult(candidateId);
      if (stored) {
        // Cache to localStorage only (Supabase write happens on generate/regenerate)
        saveAnalysisResult(stored, true);
        return stored;
      }
      return null;
    },
    enabled: !!candidateId,
    // Use localStorage as instant placeholder while Supabase loads
    placeholderData: () => candidateId ? loadAnalysisResult(candidateId) : null,
    // Poll every 3s until analysis arrives (stops after generation attempt or when ready)
    refetchInterval: (query) => {
      if (generationAttempted) return false;
      const data = query.state.data;
      const hasResult = !!(data?.practical || data?.technical);
      return hasResult ? false : 3000;
    },
    refetchIntervalInBackground: false,
  });

  const generateAnalyses = useCallback(
    async (result: GaugeProResult) => {
      const currentSettings = settings ?? (await loadAgentSettingsAsync());

      if (!currentSettings.agentEnabled) {
        setError('Agente de análise desabilitado nas configurações.');
        setGenerationAttempted(true);
        return;
      }
      if (!currentSettings.apiKey) {
        setError('Chave de API não configurada. Solicite ao administrador.');
        setGenerationAttempted(true);
        return;
      }

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
        setGenerationAttempted(true);
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
    canGenerate: !!(settings?.agentEnabled && settings?.apiKey),
    generateAnalyses,
    regenerateAnalysis,
  };
}
