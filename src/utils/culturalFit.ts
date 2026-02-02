/**
 * Cultural Fit Calculations
 * PRD-057: Gestao de Equipes - Desenvolvimento & Evolucao
 *
 * Computes company culture DNA from team members' Gauge-Pro scores,
 * generates a culture manifesto, and evaluates candidate cultural fit.
 */

import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type {
  HierarchyLevel,
  TeamMember,
  CompanyCultureSnapshot,
  CulturalFitResult,
} from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HIERARCHY_WEIGHTS: Record<HierarchyLevel, number> = {
  strategic: 1.5,
  tactical: 1.2,
  operational: 1.0,
};

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

// Manifesto templates keyed by dimension + direction
const HIGH_TEMPLATES: Record<GaugeProDimension, string> = {
  D1: 'Valorizamos a iniciativa e a assertividade nas decisoes.',
  D2: 'Nossa cultura e construida sobre colaboracao e comunicacao aberta.',
  D3: 'Prezamos pela estabilidade, consistencia e planejamento cuidadoso.',
  D4: 'Buscamos excelencia atraves de processos estruturados e qualidade.',
  D5: 'Acreditamos que o sucesso vem do trabalho em equipe e empatia.',
};

const LOW_TEMPLATES: Record<GaugeProDimension, string> = {
  D1: 'Preferimos decisoes colaborativas e consensuais.',
  D2: 'Valorizamos a introspeccao e o trabalho independente.',
  D3: 'Abracamos a mudanca e a adaptabilidade como forcas.',
  D4: 'Incentivamos a flexibilidade e a experimentacao criativa.',
  D5: 'Priorizamos resultados objetivos e autonomia individual.',
};

// ---------------------------------------------------------------------------
// Company DNA Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates the company culture DNA as a weighted average of all mapped
 * members' Gauge-Pro dimension scores.
 *
 * Members at higher hierarchy levels carry more weight:
 *   - strategic: 1.5
 *   - tactical:  1.2
 *   - operational: 1.0
 *
 * Formula per dimension: sum(member_score * weight) / sum(weights)
 */
export function calculateCompanyDNA(
  members: Array<{ scores: DimensionScores; level: HierarchyLevel }>,
): DimensionScores {
  if (members.length === 0) {
    return { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 };
  }

  const totalWeight = members.reduce(
    (sum, member) => sum + HIERARCHY_WEIGHTS[member.level],
    0,
  );

  const dna: Partial<DimensionScores> = {};

  for (const dim of DIMENSIONS) {
    const weightedSum = members.reduce(
      (sum, member) => sum + member.scores[dim] * HIERARCHY_WEIGHTS[member.level],
      0,
    );
    dna[dim] = Math.round((weightedSum / totalWeight) * 100) / 100;
  }

  return dna as DimensionScores;
}

// ---------------------------------------------------------------------------
// Manifesto Generation
// ---------------------------------------------------------------------------

/**
 * Generates a culture manifesto paragraph based on the company DNA scores.
 *
 * Selects descriptive sentences for the top 2 scoring dimensions (those with
 * the highest absolute values) and combines high (>= 65) / low (< 40)
 * observations into a cohesive paragraph.
 */
export function generateManifesto(dnaScores: DimensionScores): string {
  const sentences: string[] = [];

  // Gather all applicable statements (high >= 65 or low < 40)
  const scored: Array<{ dim: GaugeProDimension; score: number }> = DIMENSIONS.map(
    (dim) => ({ dim, score: dnaScores[dim] }),
  );

  // Sort by score descending to prioritise top dimensions
  scored.sort((a, b) => b.score - a.score);

  // Pick top 2 dimensions and generate statements
  const top2 = scored.slice(0, 2);

  for (const { dim, score } of top2) {
    if (score >= 65) {
      sentences.push(HIGH_TEMPLATES[dim]);
    } else if (score < 40) {
      sentences.push(LOW_TEMPLATES[dim]);
    }
  }

  // If no thresholds were crossed for the top 2, fall back to the highest one
  if (sentences.length === 0) {
    const highest = scored[0];
    if (highest.score >= 50) {
      sentences.push(HIGH_TEMPLATES[highest.dim]);
    } else {
      sentences.push(LOW_TEMPLATES[highest.dim]);
    }
  }

  return sentences.join(' ');
}

// ---------------------------------------------------------------------------
// Cultural Fit Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates how well a candidate's Gauge-Pro scores align with the company
 * culture DNA.
 *
 * Formula: fitScore = 100 - (sum of |candidate_Di - dna_Di| for all 5 dims) / 5
 *
 * Fit levels:
 *   - excellent: >= 85
 *   - good:      >= 70
 *   - moderate:  >= 50
 *   - low:       < 50
 */
export function calculateCulturalFit(
  candidateScores: DimensionScores,
  companyDNA: DimensionScores,
): CulturalFitResult {
  const dimensionGaps = {} as Record<GaugeProDimension, number>;
  let totalAbsDiff = 0;

  for (const dim of DIMENSIONS) {
    const gap = candidateScores[dim] - companyDNA[dim];
    dimensionGaps[dim] = Math.round(gap * 100) / 100;
    totalAbsDiff += Math.abs(gap);
  }

  const fitScore = Math.round((100 - totalAbsDiff / 5) * 100) / 100;
  const clampedScore = Math.max(0, Math.min(100, fitScore));

  let fitLevel: CulturalFitResult['fitLevel'];
  if (clampedScore >= 85) {
    fitLevel = 'excellent';
  } else if (clampedScore >= 70) {
    fitLevel = 'good';
  } else if (clampedScore >= 50) {
    fitLevel = 'moderate';
  } else {
    fitLevel = 'low';
  }

  return {
    candidateScores,
    companyDNA,
    fitScore: clampedScore,
    fitLevel,
    dimensionGaps,
  };
}

// ---------------------------------------------------------------------------
// Display Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the colour associated with a cultural fit level.
 */
export function getFitColor(
  fitLevel: 'excellent' | 'good' | 'moderate' | 'low',
): string {
  const colors: Record<typeof fitLevel, string> = {
    excellent: '#22c55e',
    good: '#84cc16',
    moderate: '#f59e0b',
    low: '#ef4444',
  };
  return colors[fitLevel];
}

/**
 * Returns a human-readable Portuguese label for a cultural fit level.
 */
export function getFitLabel(
  fitLevel: 'excellent' | 'good' | 'moderate' | 'low',
): string {
  const labels: Record<typeof fitLevel, string> = {
    excellent: 'Excelente Fit',
    good: 'Bom Fit',
    moderate: 'Fit Moderado',
    low: 'Baixo Fit',
  };
  return labels[fitLevel];
}
