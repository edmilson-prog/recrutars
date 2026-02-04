/**
 * Competency Radar Derivation
 * Derives 6 competencies from Gauge-Pro D1-D5 dimension scores
 */

import type { DimensionScores } from '@/types/gaugePro';
import type { CompetencyScores } from '@/types/companyTest';

export function deriveCompetencyScores(scores: DimensionScores): CompetencyScores {
  const d1 = scores.D1;
  const d2 = scores.D2;
  const d3 = scores.D3;
  const d4 = scores.D4;
  const d5 = scores.D5;

  return {
    lideranca: Math.round(d1 * 0.6 + d5 * 0.4),
    comunicacao: Math.round(d2 * 0.6 + d5 * 0.4),
    organizacao: Math.round(d3 * 0.4 + d4 * 0.6),
    inovacao: Math.round(d1 * 0.5 + (100 - d4) * 0.5),
    trabalhoEquipe: Math.round(d2 * 0.3 + d3 * 0.3 + d5 * 0.4),
    analiseCritica: d4,
  };
}
