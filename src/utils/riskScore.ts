/**
 * Risk Score Calculator
 * Calculates risk assessment from Gauge-Pro D1-D5 scores and fit score
 */

import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type { RiskAssessment, RiskFlag, RiskClassification } from '@/types/companyTest';

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

export function calculateRiskAssessment(
  scores: DimensionScores,
  fitScore?: number
): RiskAssessment {
  const flags: RiskFlag[] = [];

  // Check each dimension for low scores
  for (const dim of DIMENSIONS) {
    const score = scores[dim];
    if (score < 35) {
      const severity: RiskClassification = score < 25 ? 'alto' : 'moderado';
      flags.push({
        dimension: DIMENSION_SHORT_NAMES[dim],
        type: 'dimensao_baixa',
        description: `${DIMENSION_SHORT_NAMES[dim]} em nível ${score < 25 ? 'crítico' : 'baixo'} (${score})`,
        severity,
      });
    }
  }

  // Instability gap: max - min
  const values = DIMENSIONS.map(d => scores[d]);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const instabilityGap = maxVal - minVal;

  if (instabilityGap > 40) {
    flags.push({
      dimension: 'Perfil Geral',
      type: 'instabilidade',
      description: `Gap de instabilidade elevado (${instabilityGap} pontos entre dimensões)`,
      severity: 'moderado',
    });
  }

  // Low fit score
  if (fitScore !== undefined && fitScore < 50) {
    flags.push({
      dimension: 'Fit Score',
      type: 'fit_baixo',
      description: `Compatibilidade com a vaga abaixo do esperado (${fitScore}%)`,
      severity: fitScore < 30 ? 'alto' : 'moderado',
    });
  }

  // Calculate overall score (0-100)
  const severityWeights: Record<RiskClassification, number> = {
    baixo: 5,
    moderado: 15,
    alto: 30,
    critico: 50,
  };
  const rawScore = flags.reduce((sum, f) => sum + severityWeights[f.severity], 0);
  const overallScore = Math.min(100, rawScore);

  // Classification
  let classification: RiskClassification;
  if (overallScore < 20) classification = 'baixo';
  else if (overallScore < 45) classification = 'moderado';
  else if (overallScore < 70) classification = 'alto';
  else classification = 'critico';

  return {
    overallScore,
    classification,
    flags,
    instabilityGap,
  };
}

export const RISK_CLASSIFICATION_CONFIG: Record<RiskClassification, { label: string; color: string; bgColor: string }> = {
  baixo: { label: 'Baixo', color: '#16a34a', bgColor: '#f0fdf4' },
  moderado: { label: 'Moderado', color: '#ca8a04', bgColor: '#fefce8' },
  alto: { label: 'Alto', color: '#ea580c', bgColor: '#fff7ed' },
  critico: { label: 'Crítico', color: '#dc2626', bgColor: '#fef2f2' },
};
