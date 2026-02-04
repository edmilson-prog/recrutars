/**
 * Emotional Factors Derivation
 * Derives 5 emotional factors from Gauge-Pro D1-D5 dimension scores
 */

import type { DimensionScores } from '@/types/gaugePro';
import type { EmotionalFactorScores } from '@/types/companyTest';

export function deriveEmotionalFactors(scores: DimensionScores): EmotionalFactorScores {
  const empatia = scores.D5;
  const autocontrole = scores.D3;
  const sociabilidade = scores.D2;
  const resiliencia = Math.round((scores.D1 + scores.D3) / 2);
  const inteligenciaEmocional = Math.round((empatia + autocontrole + sociabilidade + resiliencia) / 4);

  return {
    empatia,
    autocontrole,
    sociabilidade,
    resiliencia,
    inteligenciaEmocional,
  };
}
