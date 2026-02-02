/**
 * Hook: useAssessmentAnalysis
 * PRD-047: Teste Geral do Candidato
 *
 * Análise das respostas com fallback para regras (sem IA)
 */

import { useCallback } from 'react';
import {
  assessmentCategories,
  assessmentDimensions,
  getCategoryById,
} from '@/data/assessmentData';
import {
  BEHAVIORAL_TEST_CONFIG,
  INSIGHT_TEMPLATES,
  CAREER_RECOMMENDATIONS_MAP,
} from '@/data/behavioralAssessmentData';
import type {
  BehavioralResponse,
  BehavioralResult,
  BehavioralRedFlag,
  AssessmentQuestion,
} from '@/types/assessment';
import { RED_FLAG_THRESHOLDS } from '@/types/assessment';

// Dimensões IDs
const DIMENSION_IDS = {
  PERSONALITY: 'dim-personality',
  CHARACTER: 'dim-character',
  COMPETENCIES: 'dim-competencies',
};

// Categorias por dimensão
function getCategoriesByDimension(dimensionId: string): string[] {
  return assessmentCategories
    .filter((cat) => cat.dimensionId === dimensionId)
    .map((cat) => cat.id);
}

// Nome da categoria
function getCategoryName(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category?.name || categoryId;
}

// Nome da dimensão
function getDimensionName(dimensionId: string): string {
  const dimension = assessmentDimensions.find((d) => d.id === dimensionId);
  return dimension?.name || dimensionId;
}

// Calcular score de uma resposta (0-100)
function calculateResponseScore(
  response: BehavioralResponse,
  question: AssessmentQuestion
): number {
  // Para perguntas Likert (1-5)
  if (question.type === 'behavioral' || question.type === 'self_assessment') {
    const value = parseInt(response.response, 10);
    if (isNaN(value) || value < 1 || value > 5) return 50; // Neutro se inválido
    // Converter 1-5 para 0-100
    return ((value - 1) / 4) * 100;
  }

  // Para perguntas situacionais (A, B, C, D)
  if (question.type === 'situational' && question.options) {
    const selectedOption = question.options.find(
      (opt) => opt.key === response.response
    );
    return selectedOption?.weight || 50;
  }

  return 50; // Default
}

export interface AnalysisResult extends BehavioralResult {}

export function useAssessmentAnalysis() {
  const config = BEHAVIORAL_TEST_CONFIG;

  /**
   * Analisa as respostas e gera o resultado
   */
  const analyzeResponses = useCallback(
    (
      responses: BehavioralResponse[],
      questions: AssessmentQuestion[],
      candidateId: string,
      assessmentId: string
    ): AnalysisResult => {
      // Criar mapa de perguntas por ID
      const questionMap = new Map(questions.map((q) => [q.id, q]));

      // 1. Calcular score por resposta
      const responseScores = responses.map((r) => {
        const question = questionMap.get(r.questionId);
        if (!question) return { ...r, calculatedScore: 50 };
        return {
          ...r,
          calculatedScore: calculateResponseScore(r, question),
        };
      });

      // 2. Agrupar por categoria
      const scoresByCategory: Record<string, number[]> = {};

      responseScores.forEach((rs) => {
        const question = questionMap.get(rs.questionId);
        if (!question) return;

        if (!scoresByCategory[question.categoryId]) {
          scoresByCategory[question.categoryId] = [];
        }
        scoresByCategory[question.categoryId].push(rs.calculatedScore);
      });

      // 3. Calcular média por categoria
      const categoryScores: Record<string, number> = {};

      Object.entries(scoresByCategory).forEach(([catId, scores]) => {
        categoryScores[catId] = Math.round(
          scores.reduce((sum, s) => sum + s, 0) / scores.length
        );
      });

      // 4. Calcular score por dimensão
      const personalityCategories = getCategoriesByDimension(DIMENSION_IDS.PERSONALITY);
      const characterCategories = getCategoriesByDimension(DIMENSION_IDS.CHARACTER);
      const competencyCategories = getCategoriesByDimension(DIMENSION_IDS.COMPETENCIES);

      const calculateDimensionScore = (categoryIds: string[]): number => {
        const scores = categoryIds
          .map((id) => categoryScores[id])
          .filter((s) => s !== undefined);

        if (scores.length === 0) return 50;
        return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
      };

      const personalityScore = calculateDimensionScore(personalityCategories);
      const characterScore = calculateDimensionScore(characterCategories);
      const competencyScore = calculateDimensionScore(competencyCategories);

      // 5. Calcular score geral (média ponderada)
      const overallScore = Math.round(
        personalityScore * config.personalityWeight +
          characterScore * config.characterWeight +
          competencyScore * config.competencyWeight
      );

      // 6. Identificar top 3 forças e áreas de desenvolvimento
      const sortedCategories = Object.entries(categoryScores)
        .sort(([, a], [, b]) => b - a)
        .map(([catId]) => getCategoryName(catId));

      const strengths = sortedCategories.slice(0, 3);
      const developmentAreas = sortedCategories.slice(-3).reverse();

      // 7. Detectar red flags
      const redFlags: BehavioralRedFlag[] = [];

      Object.entries(categoryScores).forEach(([catId, score]) => {
        const threshold =
          RED_FLAG_THRESHOLDS[catId] || RED_FLAG_THRESHOLDS.default;

        if (score < threshold) {
          const isCharacterCategory = characterCategories.includes(catId);

          redFlags.push({
            categoryId: catId,
            categoryName: getCategoryName(catId),
            score,
            threshold,
            description: isCharacterCategory
              ? `Score baixo em ${getCategoryName(catId)} requer atenção especial`
              : `Área de desenvolvimento identificada em ${getCategoryName(catId)}`,
            severity: score < threshold - 20 ? 'high' : score < threshold - 10 ? 'medium' : 'low',
          });
        }
      });

      // 8. Gerar insights por dimensão
      const generateInsight = (
        dimensionKey: 'personality' | 'character' | 'competencies',
        score: number,
        categories: string[]
      ): string => {
        const templates = INSIGHT_TEMPLATES[dimensionKey];
        const sortedCats = categories
          .map((id) => ({ id, score: categoryScores[id] || 50 }))
          .sort((a, b) => b.score - a.score);

        const strongCats = sortedCats.slice(0, 2).map((c) => getCategoryName(c.id));
        const weakCats = sortedCats.slice(-2).map((c) => getCategoryName(c.id));

        let template: string;
        if (score >= 70) {
          template = templates.high;
        } else if (score >= 50) {
          template = templates.medium;
        } else {
          template = templates.low;
        }

        return template
          .replace('{categories}', strongCats.join(' e '))
          .replace('{weakCategories}', weakCats.join(' e '));
      };

      const insights: Record<string, string> = {
        [DIMENSION_IDS.PERSONALITY]: generateInsight('personality', personalityScore, personalityCategories),
        [DIMENSION_IDS.CHARACTER]: generateInsight('character', characterScore, characterCategories),
        [DIMENSION_IDS.COMPETENCIES]: generateInsight('competencies', competencyScore, competencyCategories),
      };

      // 9. Gerar recomendações de carreira
      let careerKey = 'balanced';
      if (personalityScore >= 75 && personalityScore > characterScore && personalityScore > competencyScore) {
        careerKey = 'high_personality';
      } else if (characterScore >= 75 && characterScore > personalityScore && characterScore > competencyScore) {
        careerKey = 'high_character';
      } else if (competencyScore >= 75) {
        careerKey = 'high_competencies';
      }

      const careerRecommendations = CAREER_RECOMMENDATIONS_MAP[careerKey] || CAREER_RECOMMENDATIONS_MAP.balanced;

      // 10. Gerar resumo
      const summary = `Avaliação comportamental concluída com score geral de ${overallScore}%. ` +
        `Principais forças identificadas: ${strengths.join(', ')}. ` +
        `Áreas para desenvolvimento: ${developmentAreas.join(', ')}. ` +
        (redFlags.length > 0
          ? `Foram identificados ${redFlags.length} ponto(s) de atenção.`
          : 'Nenhum red flag identificado.');

      // 11. Montar resultado final
      const result: AnalysisResult = {
        id: `br-${Date.now()}`,
        assessmentId,
        candidateId,

        overallScore,
        personalityScore,
        characterScore,
        competencyScore,

        categoryScores,
        strengths,
        developmentAreas,
        redFlags,

        summary,
        insights,
        careerRecommendations,

        xpAwarded: config.xpReward,
        badgeAwarded: config.badgeId,

        generatedAt: new Date().toISOString(),
      };

      return result;
    },
    [config]
  );

  /**
   * Calcula score de compatibilidade para uma vaga (PRD-048)
   */
  const calculateJobFit = useCallback(
    (
      result: BehavioralResult,
      requiredCompetencies: { categoryId: string; weight: number }[]
    ): number => {
      if (requiredCompetencies.length === 0) return result.overallScore;

      let totalWeight = 0;
      let weightedScore = 0;

      requiredCompetencies.forEach(({ categoryId, weight }) => {
        const score = result.categoryScores[categoryId] || 50;
        weightedScore += score * weight;
        totalWeight += weight;
      });

      return Math.round(weightedScore / totalWeight);
    },
    []
  );

  return {
    analyzeResponses,
    calculateJobFit,
  };
}
