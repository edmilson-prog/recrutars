/**
 * Hook: useRecruiterAnalysis
 * PRD-048: Teste por Vaga
 *
 * Análise de resultados com ajustes do recrutador.
 * Now uses Supabase via React Query hooks.
 */

import { useCallback, useMemo } from 'react';
import { assessmentCategories } from '@/data/assessmentData';
import {
  useJobAssessmentResults,
  useUpdateRecruiterDecision,
} from '@/hooks/useJobAssessmentsQuery';
import type {
  JobAssessmentResult,
  RecruiterDecision,
  CandidateComparisonData,
} from '@/types/assessment';

export interface UseRecruiterAnalysisReturn {
  // Data
  results: JobAssessmentResult[];
  isLoading: boolean;

  // Actions
  getResultById: (id: string) => JobAssessmentResult | undefined;
  setDecision: (resultId: string, decision: RecruiterDecision, notes?: string) => Promise<void>;

  // Comparison
  getComparisonData: (resultIds: string[]) => CandidateComparisonData[];
}

export function useRecruiterAnalysis(assessmentId: string): UseRecruiterAnalysisReturn {
  const { data: results = [], isLoading } = useJobAssessmentResults(assessmentId);
  const updateDecision = useUpdateRecruiterDecision();

  const getResultById = useCallback(
    (id: string): JobAssessmentResult | undefined => {
      return results.find((r) => r.id === id);
    },
    [results],
  );

  const setDecision = useCallback(
    async (resultId: string, decision: RecruiterDecision, notes?: string) => {
      await updateDecision.mutateAsync({
        resultId,
        assessmentId,
        decision,
        notes,
      });
    },
    [assessmentId, updateDecision],
  );

  const getComparisonData = useCallback(
    (resultIds: string[]): CandidateComparisonData[] => {
      return resultIds
        .map((id) => {
          const result = results.find((r) => r.id === id);
          if (!result) return null;

          return {
            candidateId: result.candidateId,
            candidateName: result.candidateName || result.candidateId,
            overallScore: result.overallScore,
            competencyScores: result.competencyScores,
            strengths: result.aiAnalysis.strengthsForRole || [],
            concerns: result.aiAnalysis.concernsForRole || [],
            aiRecommendation: result.aiRecommendation,
            recruiterDecision: result.recruiterDecision,
          };
        })
        .filter(Boolean) as CandidateComparisonData[];
    },
    [results],
  );

  return {
    results,
    isLoading,
    getResultById,
    setDecision,
    getComparisonData,
  };
}
