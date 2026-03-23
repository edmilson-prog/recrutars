/**
 * Compatibility Score Algorithm — PRD-056 RF-001 (v2 — Continuous)
 *
 * Calculates pairwise synergy between two team members based on their
 * Gauge-Pro D1-D5 dimension scores. Uses continuous functions instead of
 * discrete buckets to produce highly granular, differentiated scores.
 *
 * The raw dimensional contributions are summed and then normalised from
 * the theoretical [-65, +65] range to a user-friendly 0-100 scale.
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
// Continuous dimensional synergy rules
// ---------------------------------------------------------------------------

/**
 * Calculate the synergy contribution for a single Gauge-Pro dimension given
 * the two members' scores, using continuous functions.
 *
 * Behavioural directions match the original PRD-056 discrete rules, but
 * scores vary continuously with the actual values instead of producing
 * fixed outputs. This ensures virtually unique scores for every pair.
 *
 * Ranges per dimension:
 *   D1 (Dominancia):    [-20, +15]
 *   D2 (Sociabilidade): [-10, +10]
 *   D3 (Ritmo):         [-15, +15]
 *   D4 (Conformidade):  [-10, +10]
 *   D5 (Relacional):    [-10, +15]
 */
export function calculateDimensionSynergy(
  dim: GaugeProDimension,
  score1: number,
  score2: number,
): number {
  const avg = (score1 + score2) / 2;
  const diff = Math.abs(score1 - score2);
  const hi = Math.max(score1, score2);
  const lo = Math.min(score1, score2);

  switch (dim) {
    // D3 (Ritmo): linear interpolation based on score difference
    // diff=0 → +15 (perfect alignment), diff=50 → 0, diff=100 → -15
    case 'D3':
      return 15 - (diff / 50) * 15;

    // D1 (Dominancia): two dominant clash, complementary pair thrives
    case 'D1': {
      if (lo >= 67) {
        // Both alto: conflict intensifies with combined dominance
        const intensity = (avg - 67) / 33; // 0..1
        return -12 - 8 * intensity; // -12 to -20
      }
      if (hi >= 67) {
        // Mixed: complementarity grows with the gap
        return 5 + 10 * (diff / 100); // 5 to 15
      }
      // Both baixo: neutral, slight bonus for balance
      return -2 + 4 * (1 - diff / 66); // -2 to +2
    }

    // D2 (Sociabilidade): two sociable = synergy, two introverts = isolation
    case 'D2': {
      if (lo >= 67) {
        const intensity = (avg - 67) / 33;
        return 5 + 5 * intensity; // 5 to 10
      }
      if (hi >= 67) {
        return 1 + 4 * (diff / 100); // 1 to 5
      }
      // Both baixo: isolation risk proportional to how low
      const lowFactor = 1 - avg / 66; // 0..1
      return -3 - 7 * lowFactor; // -3 to -10
    }

    // D4 (Conformidade): both structured = synergy, mixed = process friction
    case 'D4': {
      if (lo >= 67) {
        const intensity = (avg - 67) / 33;
        return 5 + 5 * intensity; // 5 to 10
      }
      if (hi >= 67) {
        // Mixed: friction proportional to difference
        return -4 - 6 * (diff / 100); // -4 to -10
      }
      // Both baixo: flexibility bonus with balance
      return 1 + 4 * (1 - diff / 66); // 1 to 5
    }

    // D5 (Relacional): empathetic pair = strong, impersonal pair = risk
    case 'D5': {
      if (lo >= 67) {
        const intensity = (avg - 67) / 33;
        return 8 + 7 * intensity; // 8 to 15
      }
      if (hi >= 67) {
        return 1 + 4 * (diff / 100); // 1 to 5
      }
      // Both baixo: impersonal risk proportional to how low
      const lowFactor = 1 - avg / 66;
      return -3 - 7 * lowFactor; // -3 to -10
    }

    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

/** Theoretical minimum raw score (all dimensions yield worst case). */
const RAW_MIN = -65; // D1(-20) + D2(-10) + D3(-15) + D4(-10) + D5(-10)
/** Theoretical maximum raw score (all dimensions yield best case). */
const RAW_MAX = 65; // D1(+15) + D2(+10) + D3(+15) + D4(+10) + D5(+15)

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
 *  - `dimensionBreakdown` — per-dimension synergy contribution (1 decimal)
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
    breakdown[dim] = Math.round(synergy * 10) / 10;
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
