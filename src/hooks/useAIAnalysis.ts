/**
 * useAIAnalysis Hook (PRD-051)
 * Gerencia carregamento, geração e regeneração de análises IA
 */

import { useState, useEffect, useCallback } from 'react';
import type { AIAnalysis, AIAnalysisResult, AnalysisType } from '@/types/aiAnalysis';
import type { GaugeProResult } from '@/types/gaugePro';
import { loadAnalysisResult, saveAnalysisResult } from '@/lib/aiAgent/storageService';
import { loadAgentSettings } from '@/lib/aiAgent/settingsLoader';
import { generateSingleAnalysis, generateBothAnalyses } from '@/lib/aiAgent/analysisGenerator';

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
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settings = loadAgentSettings();

  useEffect(() => {
    if (candidateId) {
      const stored = loadAnalysisResult(candidateId);
      if (stored) {
        setAnalysisResult(stored);
      }
    }
  }, [candidateId]);

  const generateAnalyses = useCallback(
    async (result: GaugeProResult) => {
      if (!settings.agentEnabled) return;

      setIsGenerating(true);
      setError(null);

      try {
        const analyses = await generateBothAnalyses(
          result,
          candidateName,
          settings,
          jobTitle,
        );
        saveAnalysisResult(analyses);
        setAnalysisResult(analyses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao gerar análises');
      } finally {
        setIsGenerating(false);
      }
    },
    [candidateName, jobTitle, settings],
  );

  const regenerateAnalysis = useCallback(
    async (type: AnalysisType, result: GaugeProResult) => {
      setIsRegenerating(true);
      setError(null);

      try {
        const newAnalysis = await generateSingleAnalysis(
          type,
          result,
          candidateName,
          settings,
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
        setAnalysisResult(updated);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao regenerar análise',
        );
      } finally {
        setIsRegenerating(false);
      }
    },
    [candidateId, candidateName, jobTitle, settings, analysisResult],
  );

  return {
    practicalAnalysis: analysisResult?.practical ?? null,
    technicalAnalysis: analysisResult?.technical ?? null,
    isGenerating,
    isRegenerating,
    error,
    agentEnabled: settings.agentEnabled,
    generateAnalyses,
    regenerateAnalysis,
  };
}
