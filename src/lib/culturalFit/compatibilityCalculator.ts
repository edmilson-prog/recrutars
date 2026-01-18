/**
 * Cultural Compatibility Calculator
 * PRD-042: Fit Cultural
 */

import type {
  CulturalProfile,
  CulturalCompatibility,
  CulturalInsight,
  CulturalDimension,
} from '@/types/culturalFit';
import { culturalDimensions } from '@/data/culturalDimensions';

const DIMENSIONS: CulturalDimension[] = [
  'innovation',
  'collaboration',
  'hierarchy',
  'pace',
  'direction',
];

/**
 * Calcula a compatibilidade entre dois perfis culturais
 */
export function calculateCompatibility(
  companyProfile: CulturalProfile,
  candidateProfile: CulturalProfile
): CulturalCompatibility {
  const dimensionScores: Record<CulturalDimension, number> = {} as Record<CulturalDimension, number>;
  const strengths: CulturalDimension[] = [];
  const watchPoints: CulturalDimension[] = [];
  const insights: CulturalInsight[] = [];

  let totalScore = 0;

  // Calcula score por dimensão
  for (const dimension of DIMENSIONS) {
    const companyValue = companyProfile[dimension];
    const candidateValue = candidateProfile[dimension];

    // Diferença máxima é 4 (de 1 a 5), score inversamente proporcional
    const difference = Math.abs(companyValue - candidateValue);
    const score = Math.round(((4 - difference) / 4) * 100);

    dimensionScores[dimension] = score;
    totalScore += score;

    // Classifica como força ou ponto de atenção
    if (score >= 75) {
      strengths.push(dimension);
    } else if (score < 50) {
      watchPoints.push(dimension);
    }

    // Gera insights
    const insight = generateInsight(dimension, companyValue, candidateValue, score);
    if (insight) {
      insights.push(insight);
    }
  }

  const overallScore = Math.round(totalScore / DIMENSIONS.length);

  return {
    overallScore,
    dimensionScores,
    strengths,
    watchPoints,
    insights,
  };
}

/**
 * Gera insight específico para uma dimensão
 */
function generateInsight(
  dimension: CulturalDimension,
  companyValue: number,
  candidateValue: number,
  score: number
): CulturalInsight | null {
  const dimensionDef = culturalDimensions.find(d => d.id === dimension);
  if (!dimensionDef) return null;

  const difference = candidateValue - companyValue;

  if (score >= 75) {
    return {
      type: 'strength',
      dimension,
      message: `Excelente alinhamento em ${dimensionDef.name.toLowerCase()}. Ambos compartilham preferências similares.`,
    };
  }

  if (score < 50) {
    const candidatePreference = candidateValue > 3 ? dimensionDef.highLabel : dimensionDef.lowLabel;
    const companyPreference = companyValue > 3 ? dimensionDef.highLabel : dimensionDef.lowLabel;

    if (difference > 0) {
      return {
        type: 'watch',
        dimension,
        message: `Candidato prefere ambiente mais ${candidatePreference.toLowerCase()}, enquanto a empresa é mais ${companyPreference.toLowerCase()}.`,
      };
    } else {
      return {
        type: 'watch',
        dimension,
        message: `Empresa tem perfil mais ${companyPreference.toLowerCase()}, enquanto o candidato prefere ambiente ${candidatePreference.toLowerCase()}.`,
      };
    }
  }

  return null;
}

/**
 * Retorna uma descrição textual do score de compatibilidade
 */
export function getCompatibilityLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 85) {
    return {
      label: 'Excelente',
      color: 'text-green-600',
      description: 'Alto alinhamento cultural. Valores e preferências muito compatíveis.',
    };
  }
  if (score >= 70) {
    return {
      label: 'Bom',
      color: 'text-blue-600',
      description: 'Bom alinhamento cultural com algumas diferenças gerenciáveis.',
    };
  }
  if (score >= 50) {
    return {
      label: 'Moderado',
      color: 'text-yellow-600',
      description: 'Alinhamento parcial. Algumas áreas podem requerer adaptação.',
    };
  }
  return {
    label: 'Baixo',
    color: 'text-red-600',
    description: 'Diferenças significativas nas preferências culturais.',
  };
}

/**
 * Retorna recomendações baseadas na compatibilidade
 */
export function getCompatibilityRecommendations(
  compatibility: CulturalCompatibility
): string[] {
  const recommendations: string[] = [];

  if (compatibility.overallScore >= 85) {
    recommendations.push('Candidato tem excelente fit cultural - considere para próximas etapas');
  } else if (compatibility.overallScore >= 70) {
    recommendations.push('Bom fit geral - explore os pontos de atenção na entrevista');
  } else if (compatibility.overallScore >= 50) {
    recommendations.push('Avalie cuidadosamente a adaptabilidade do candidato');
  } else {
    recommendations.push('Diferenças culturais significativas - avalie se são gerenciáveis');
  }

  // Recomendações específicas por dimensão
  for (const dimension of compatibility.watchPoints) {
    const dimDef = culturalDimensions.find(d => d.id === dimension);
    if (dimDef) {
      recommendations.push(
        `Discuta expectativas sobre ${dimDef.name.toLowerCase()} durante a entrevista`
      );
    }
  }

  return recommendations;
}

/**
 * Calcula score simplificado (para exibição rápida)
 */
export function getQuickCompatibilityScore(
  companyProfile: CulturalProfile,
  candidateProfile: CulturalProfile
): number {
  let totalDiff = 0;

  for (const dimension of DIMENSIONS) {
    totalDiff += Math.abs(companyProfile[dimension] - candidateProfile[dimension]);
  }

  // Máximo de diferença = 5 dimensões * 4 pontos = 20
  // Score = 100 - (diferença / 20 * 100)
  return Math.round(100 - (totalDiff / 20) * 100);
}
