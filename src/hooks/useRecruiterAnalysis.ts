/**
 * Hook: useRecruiterAnalysis
 * PRD-048: Teste por Vaga
 *
 * Análise de resultados com ajustes do recrutador
 */

import { useState, useCallback, useMemo } from 'react';
import { mockJobAssessmentResults } from '@/data/behavioralAssessmentData';
import { assessmentCategories } from '@/data/assessmentData';
import type {
  JobAssessmentResult,
  RecruiterAdjustments,
  RecruiterDecision,
  CandidateComparisonData,
} from '@/types/assessment';

export interface UseRecruiterAnalysisReturn {
  // Data
  results: JobAssessmentResult[];

  // Actions
  getResultById: (id: string) => JobAssessmentResult | undefined;
  getResultsByAssessmentId: (assessmentId: string) => JobAssessmentResult[];
  adjustScore: (resultId: string, questionId: string, newScore: number, note?: string) => void;
  setDecision: (resultId: string, decision: RecruiterDecision, notes?: string) => void;
  addNote: (resultId: string, note: string) => void;

  // Comparison
  getComparisonData: (resultIds: string[]) => CandidateComparisonData[];
}

export function useRecruiterAnalysis(): UseRecruiterAnalysisReturn {
  const [results, setResults] = useState<JobAssessmentResult[]>(mockJobAssessmentResults);

  // Buscar resultado por ID
  const getResultById = useCallback(
    (id: string): JobAssessmentResult | undefined => {
      return results.find((r) => r.id === id);
    },
    [results]
  );

  // Buscar resultados por assessment
  const getResultsByAssessmentId = useCallback(
    (assessmentId: string): JobAssessmentResult[] => {
      return results.filter((r) => r.jobAssessmentId === assessmentId);
    },
    [results]
  );

  // Ajustar score de uma resposta
  const adjustScore = useCallback(
    (resultId: string, questionId: string, newScore: number, note?: string) => {
      setResults((prev) =>
        prev.map((r) => {
          if (r.id !== resultId) return r;

          const existingAdjustments = r.recruiterAdjustments || {
            adjustedScores: [],
          };

          // Encontrar ajuste existente ou criar novo
          const existingIndex = existingAdjustments.adjustedScores.findIndex(
            (adj) => adj.questionId === questionId
          );

          const response = r.responses.find((resp) => resp.questionId === questionId);
          const originalScore = response?.score || 50;

          const newAdjustment = {
            questionId,
            originalScore,
            adjustedScore: newScore,
            note,
          };

          let newAdjustedScores = [...existingAdjustments.adjustedScores];
          if (existingIndex >= 0) {
            newAdjustedScores[existingIndex] = newAdjustment;
          } else {
            newAdjustedScores.push(newAdjustment);
          }

          return {
            ...r,
            recruiterAdjustments: {
              ...existingAdjustments,
              adjustedScores: newAdjustedScores,
            },
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  // Definir decisão do recrutador
  const setDecision = useCallback(
    (resultId: string, decision: RecruiterDecision, notes?: string) => {
      setResults((prev) =>
        prev.map((r) =>
          r.id === resultId
            ? {
                ...r,
                recruiterDecision: decision,
                recruiterNotes: notes || r.recruiterNotes,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
    },
    []
  );

  // Adicionar nota
  const addNote = useCallback((resultId: string, note: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === resultId
          ? {
              ...r,
              recruiterNotes: r.recruiterNotes
                ? `${r.recruiterNotes}\n\n${note}`
                : note,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  }, []);

  // Gerar dados para comparação
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
            strengths: result.aiAnalysis.strengthsForRole,
            concerns: result.aiAnalysis.concernsForRole,
            aiRecommendation: result.aiRecommendation,
            recruiterDecision: result.recruiterDecision,
          };
        })
        .filter(Boolean) as CandidateComparisonData[];
    },
    [results]
  );

  return {
    results,
    getResultById,
    getResultsByAssessmentId,
    adjustScore,
    setDecision,
    addNote,
    getComparisonData,
  };
}
