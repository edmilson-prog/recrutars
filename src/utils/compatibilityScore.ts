/**
 * Compatibility Score Algorithm — PRD-056 RF-001
 *
 * Calculates pairwise synergy between two team members based on their
 * Gauge-Pro D1-D5 dimension scores. The raw dimensional contributions are
 * summed and then normalised from the theoretical [-75, +65] range to a
 * user-friendly 0-100 scale.
 */

import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';
import type { CompatibilityLevel } from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Score classification
// ---------------------------------------------------------------------------

/**
 * Classify a single 0-100 dimension score as low, medium, or high.
 *
 * - low:    0-33
 * - medium: 34-66
 * - high:   67-100
 */
export function classifyScore(score: number): 'low' | 'medium' | 'high' {
  if (score <= 33) return 'low';
  if (score <= 66) return 'medium';
  return 'high';
}

// ---------------------------------------------------------------------------
// Dimensional synergy rules
// ---------------------------------------------------------------------------

/**
 * Map a classification to a boolean "alto" flag used by the synergy rules.
 * Medium is treated as low for every dimension except D3 (which relies on
 * the absolute difference instead).
 */
function isAlto(score: number): boolean {
  return score >= 67;
}

function isBaixo(score: number): boolean {
  return score <= 66; // low or medium — medium treated as low
}

/**
 * Calculate the synergy contribution for a single Gauge-Pro dimension given
 * the two members' scores.
 *
 * Rules per dimension (alto >= 67, baixo <= 66 i.e. low+medium):
 *
 * D1 (Dominancia):   alto+alto = -20 | alto+baixo = +15 | baixo+baixo =  0
 * D2 (Sociabilidade): alto+alto = +10 | alto+baixo =  +5 | baixo+baixo = -10
 * D3 (Ritmo):        |diff| <= 30 = +15 | |diff| > 30 = -15
 * D4 (Conformidade):  alto+alto = +10 | alto+baixo = -10 | baixo+baixo =  +5
 * D5 (Relacional):    alto+alto = +15 | alto+baixo =  +5 | baixo+baixo = -10
 */
export function calculateDimensionSynergy(
  dim: GaugeProDimension,
  score1: number,
  score2: number,
): number {
  // D3 uses absolute difference instead of classification buckets
  if (dim === 'D3') {
    const diff = Math.abs(score1 - score2);
    return diff <= 30 ? 15 : -15;
  }

  const alto1 = isAlto(score1);
  const alto2 = isAlto(score2);

  const bothAlto = alto1 && alto2;
  const bothBaixo = isBaixo(score1) && isBaixo(score2);
  // mixed = one alto + one baixo (order does not matter)

  switch (dim) {
    case 'D1':
      if (bothAlto) return -20;
      if (bothBaixo) return 0;
      return 15; // alto+baixo
    case 'D2':
      if (bothAlto) return 10;
      if (bothBaixo) return -10;
      return 5; // alto+baixo
    case 'D4':
      if (bothAlto) return 10;
      if (bothBaixo) return 5;
      return -10; // alto+baixo
    case 'D5':
      if (bothAlto) return 15;
      if (bothBaixo) return -10;
      return 5; // alto+baixo
    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

/** Theoretical minimum raw score (all dimensions yield worst case). */
const RAW_MIN = -75;
/** Theoretical maximum raw score (all dimensions yield best case). */
const RAW_MAX = 65;

/**
 * Linearly map a raw score from [RAW_MIN, RAW_MAX] to [0, 100], clamped.
 */
function normalise(raw: number): number {
  const clamped = Math.max(RAW_MIN, Math.min(RAW_MAX, raw));
  return Math.round(((clamped - RAW_MIN) / (RAW_MAX - RAW_MIN)) * 100);
}

// ---------------------------------------------------------------------------
// Compatibility level classification
// ---------------------------------------------------------------------------

function classifyCompatibility(score: number): CompatibilityLevel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'low';
  return 'critical';
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

/**
 * Calculate the overall compatibility score between two members given their
 * Gauge-Pro dimension scores.
 *
 * Returns:
 *  - `score`   — normalised 0-100 compatibility value
 *  - `level`   — qualitative label (excellent / good / moderate / low / critical)
 *  - `dimensionBreakdown` — per-dimension synergy contribution (raw values)
 */
export function calculateCompatibilityScore(
  scores1: DimensionScores,
  scores2: DimensionScores,
): {
  score: number;
  level: CompatibilityLevel;
  dimensionBreakdown: Record<GaugeProDimension, number>;
} {
  const breakdown = {} as Record<GaugeProDimension, number>;
  let rawTotal = 0;

  for (const dim of DIMENSIONS) {
    const synergy = calculateDimensionSynergy(dim, scores1[dim], scores2[dim]);
    breakdown[dim] = synergy;
    rawTotal += synergy;
  }

  const score = normalise(rawTotal);
  const level = classifyCompatibility(score);

  return { score, level, dimensionBreakdown: breakdown };
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

const COMPATIBILITY_COLORS: Record<CompatibilityLevel, string> = {
  excellent: '#22c55e',
  good: '#84cc16',
  moderate: '#f59e0b',
  low: '#f97316',
  critical: '#ef4444',
};

const COMPATIBILITY_LABELS: Record<CompatibilityLevel, string> = {
  excellent: 'Excelente',
  good: 'Boa',
  moderate: 'Moderada',
  low: 'Baixa',
  critical: 'Critica',
};

/**
 * Return the hex colour associated with a compatibility level.
 */
export function getCompatibilityColor(level: CompatibilityLevel): string {
  return COMPATIBILITY_COLORS[level];
}

/**
 * Return the Portuguese label for a compatibility level.
 */
export function getCompatibilityLabel(level: CompatibilityLevel): string {
  return COMPATIBILITY_LABELS[level];
}
