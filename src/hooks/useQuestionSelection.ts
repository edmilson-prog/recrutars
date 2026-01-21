/**
 * Hook: useQuestionSelection
 * PRD-047: Teste Geral do Candidato
 *
 * Algoritmo de seleção de 50-60 perguntas balanceadas
 * Critérios:
 * - ~35% Personalidade, ~30% Caráter, ~35% Competências
 * - Mínimo 2 perguntas por categoria (20 categorias)
 * - ~30% Básico, ~40% Intermediário, ~30% Avançado
 * - Mistura de tipos (behavioral, situational, self_assessment)
 */

import { useMemo, useCallback } from 'react';
import {
  assessmentQuestions,
  assessmentCategories,
  assessmentDimensions,
} from '@/data/assessmentData';
import { BEHAVIORAL_TEST_CONFIG } from '@/data/behavioralAssessmentData';
import type {
  AssessmentQuestion,
  QuestionLevel,
} from '@/types/assessment';

// Dimensões IDs
const DIMENSION_IDS = {
  PERSONALITY: 'dim-personality',
  CHARACTER: 'dim-character',
  COMPETENCIES: 'dim-competencies',
};

// Categorias por dimensão
function getCategoriesByDimension(dimensionId: string): string[] {
  return assessmentCategories
    .filter((cat) => cat.dimensionId === dimensionId && cat.isActive)
    .map((cat) => cat.id);
}

// Perguntas por categoria
function getQuestionsByCategory(categoryId: string): AssessmentQuestion[] {
  return assessmentQuestions.filter(
    (q) => q.categoryId === categoryId && q.isActive
  );
}

// Perguntas por nível
function filterByLevel(
  questions: AssessmentQuestion[],
  level: QuestionLevel
): AssessmentQuestion[] {
  return questions.filter((q) => q.level === level);
}

// Embaralhar array (Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Selecionar N itens aleatórios de um array
function selectRandom<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

export interface QuestionSelectionResult {
  questions: AssessmentQuestion[];
  questionIds: string[];
  distribution: {
    byDimension: Record<string, number>;
    byLevel: Record<QuestionLevel, number>;
    byCategory: Record<string, number>;
  };
}

export function useQuestionSelection() {
  const config = BEHAVIORAL_TEST_CONFIG;

  /**
   * Seleciona perguntas balanceadas para o teste
   */
  const selectQuestions = useCallback((): QuestionSelectionResult => {
    const targetTotal = Math.floor(
      (config.minQuestions + config.maxQuestions) / 2
    ); // 55 perguntas

    const personalityCategories = getCategoriesByDimension(DIMENSION_IDS.PERSONALITY);
    const characterCategories = getCategoriesByDimension(DIMENSION_IDS.CHARACTER);
    const competencyCategories = getCategoriesByDimension(DIMENSION_IDS.COMPETENCIES);

    // Calcular quantas perguntas por dimensão
    const personalityTarget = Math.round(targetTotal * config.personalityWeight); // ~19
    const characterTarget = Math.round(targetTotal * config.characterWeight);     // ~17
    const competencyTarget = targetTotal - personalityTarget - characterTarget;    // ~19

    const selectedQuestions: AssessmentQuestion[] = [];
    const selectedIds = new Set<string>();

    /**
     * Seleciona perguntas de uma dimensão com balanceamento por nível
     */
    const selectFromDimension = (
      categories: string[],
      targetCount: number
    ): AssessmentQuestion[] => {
      const result: AssessmentQuestion[] = [];
      const minPerCategory = 2;

      // Primeiro: garantir mínimo de 2 perguntas por categoria
      categories.forEach((catId) => {
        const catQuestions = getQuestionsByCategory(catId).filter(
          (q) => !selectedIds.has(q.id)
        );

        if (catQuestions.length > 0) {
          const selected = selectRandom(catQuestions, minPerCategory);
          selected.forEach((q) => {
            if (!selectedIds.has(q.id)) {
              result.push(q);
              selectedIds.add(q.id);
            }
          });
        }
      });

      // Calcular quantas perguntas adicionais são necessárias
      const remaining = targetCount - result.length;

      if (remaining > 0) {
        // Coletar todas as perguntas da dimensão ainda não selecionadas
        const allDimensionQuestions: AssessmentQuestion[] = [];
        categories.forEach((catId) => {
          const catQuestions = getQuestionsByCategory(catId).filter(
            (q) => !selectedIds.has(q.id)
          );
          allDimensionQuestions.push(...catQuestions);
        });

        // Balancear por nível
        const basicTarget = Math.round(remaining * config.basicQuestionsRatio);
        const intermediateTarget = Math.round(remaining * config.intermediateQuestionsRatio);
        const advancedTarget = remaining - basicTarget - intermediateTarget;

        const basicQuestions = filterByLevel(allDimensionQuestions, 'basic');
        const intermediateQuestions = filterByLevel(allDimensionQuestions, 'intermediate');
        const advancedQuestions = filterByLevel(allDimensionQuestions, 'advanced');

        // Selecionar de cada nível
        const selectedBasic = selectRandom(basicQuestions, basicTarget);
        selectedBasic.forEach((q) => {
          if (!selectedIds.has(q.id)) {
            result.push(q);
            selectedIds.add(q.id);
          }
        });

        const selectedIntermediate = selectRandom(intermediateQuestions, intermediateTarget);
        selectedIntermediate.forEach((q) => {
          if (!selectedIds.has(q.id)) {
            result.push(q);
            selectedIds.add(q.id);
          }
        });

        const selectedAdvanced = selectRandom(advancedQuestions, advancedTarget);
        selectedAdvanced.forEach((q) => {
          if (!selectedIds.has(q.id)) {
            result.push(q);
            selectedIds.add(q.id);
          }
        });
      }

      return result;
    };

    // Selecionar de cada dimensão
    const personalityQuestions = selectFromDimension(personalityCategories, personalityTarget);
    const characterQuestions = selectFromDimension(characterCategories, characterTarget);
    const competencyQuestions = selectFromDimension(competencyCategories, competencyTarget);

    selectedQuestions.push(
      ...personalityQuestions,
      ...characterQuestions,
      ...competencyQuestions
    );

    // Embaralhar a ordem final das perguntas
    const finalQuestions = shuffle(selectedQuestions);

    // Calcular distribuição para debug/stats
    const distribution = {
      byDimension: {
        [DIMENSION_IDS.PERSONALITY]: personalityQuestions.length,
        [DIMENSION_IDS.CHARACTER]: characterQuestions.length,
        [DIMENSION_IDS.COMPETENCIES]: competencyQuestions.length,
      },
      byLevel: {
        basic: finalQuestions.filter((q) => q.level === 'basic').length,
        intermediate: finalQuestions.filter((q) => q.level === 'intermediate').length,
        advanced: finalQuestions.filter((q) => q.level === 'advanced').length,
      },
      byCategory: finalQuestions.reduce((acc, q) => {
        acc[q.categoryId] = (acc[q.categoryId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return {
      questions: finalQuestions,
      questionIds: finalQuestions.map((q) => q.id),
      distribution,
    };
  }, [config]);

  /**
   * Recupera perguntas por IDs (para retomar sessão)
   */
  const getQuestionsByIds = useCallback((ids: string[]): AssessmentQuestion[] => {
    const questionMap = new Map(assessmentQuestions.map((q) => [q.id, q]));
    return ids.map((id) => questionMap.get(id)).filter(Boolean) as AssessmentQuestion[];
  }, []);

  /**
   * Estatísticas do banco de perguntas
   */
  const bankStats = useMemo(() => {
    const activeQuestions = assessmentQuestions.filter((q) => q.isActive);

    return {
      totalQuestions: assessmentQuestions.length,
      activeQuestions: activeQuestions.length,
      byDimension: {
        personality: activeQuestions.filter((q) =>
          getCategoriesByDimension(DIMENSION_IDS.PERSONALITY).includes(q.categoryId)
        ).length,
        character: activeQuestions.filter((q) =>
          getCategoriesByDimension(DIMENSION_IDS.CHARACTER).includes(q.categoryId)
        ).length,
        competencies: activeQuestions.filter((q) =>
          getCategoriesByDimension(DIMENSION_IDS.COMPETENCIES).includes(q.categoryId)
        ).length,
      },
      byLevel: {
        basic: activeQuestions.filter((q) => q.level === 'basic').length,
        intermediate: activeQuestions.filter((q) => q.level === 'intermediate').length,
        advanced: activeQuestions.filter((q) => q.level === 'advanced').length,
      },
      totalCategories: assessmentCategories.filter((c) => c.isActive).length,
    };
  }, []);

  return {
    selectQuestions,
    getQuestionsByIds,
    bankStats,
    config,
  };
}
